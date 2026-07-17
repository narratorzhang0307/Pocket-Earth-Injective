import { defineConfig, loadEnv, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { frostEdge } from './frost-agent/edge/viteEdge'
import { unsplashProxy } from './frost-agent/planet/viteUnsplash'
// @ts-expect-error — injective-service.mjs 是纯 JS ESM 服务模块（无 .d.ts），与 prod server.mjs 共用同一套 handler
import { handleInjective } from './injective-service.mjs'
// @ts-expect-error — server-only ESM runtime，dev/prod 共用，密钥不会进入前端 bundle
import { buildLlmRequest, getLlmProviders } from './frost-agent/provider-compat/runtime.mjs'
// @ts-expect-error — server-only ESM feed handler，dev/prod 共用
import { createFrostFeed } from './frost-feed-service.mjs'
// @ts-expect-error — server-only FactAtlas adapter，dev/prod 共用
import { createDailyKnowledgeService } from './knowledge/daily-service.mjs'

// LLM 代理：dev 中间件，把 /api/frost-llm 转给云脑。
// Microsoft Foundry Model Router 优先，通义 Qwen（DashScope）自动回落。
// 请求体由 provider-compat runtime 单入口拼；密钥只在服务端（从 .env 读），
// 永不进前端 bundle；无 key / 出错时返回空串，各子 agent 自动回退到规则 fallback。
function frostLlm(env: Record<string, string>): Plugin {
  const providers = getLlmProviders(env)
  return {
    name: 'frost-llm-proxy',
    configureServer(server) {
      server.middlewares.use('/api/frost-llm', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', async () => {
          const send = (obj: unknown) => {
            res.statusCode = 200
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify(obj))
          }
          try {
            if (!providers.length) return send({ text: '', error: 'no_key', providers: [] })
            const { prompt, system, json, search } = JSON.parse(body || '{}')
            const messages: { role: string; content: string }[] = []
            if (system) messages.push({ role: 'system', content: system })
            messages.push({ role: 'user', content: prompt })
            let lastStatus = 502
            for (let index = 0; index < providers.length; index++) {
              const provider = providers[index]
              const startedAt = Date.now()
              try {
                const pr = buildLlmRequest(provider, { messages, json, search: !!search })
                const r = await fetch(pr.url, { method: 'POST', headers: pr.headers, body: JSON.stringify(pr.body) })
                if (!r.ok) { lastStatus = r.status; continue }
                const data = await r.json()
                return send({ text: data?.choices?.[0]?.message?.content || '', provider: provider.name, model: data?.model || provider.model, durationMs: Date.now() - startedAt, fallback: index > 0 })
              } catch { lastStatus = 502 }
            }
            res.writeHead(lastStatus, { 'content-type': 'application/json' })
            res.end(JSON.stringify({ text: '', error: 'upstream_' + lastStatus }))
          } catch (e) {
            send({ text: '', error: String(e) })
          }
        })
      })
    },
  }
}

// Frost Edge Node dev feed：和生产服务共用 token/cursor/JSONL 语义。
function frostFeedProxy(env: Record<string, string>): Plugin {
  const feed = createFrostFeed({
    token: env.FROST_FEED_TOKEN || '',
    injectiveConfig: { privateKey: '', network: env.INJ_NETWORK || 'testnet', rpcUrl: env.INJ_RPC_URL || '' },
  })
  return {
    name: 'frost-feed-proxy',
    configureServer(server) {
      server.middlewares.use('/api/frost-feed', (req, res) => {
        const url = new URL(req.url || '/', 'http://localhost')
        Promise.resolve(feed.handle(req, res, url)).catch(() => {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'feed_error' }))
        })
      })
    },
  }
}

function knowledgeProxy(env: Record<string, string>): Plugin {
  const service = createDailyKnowledgeService({ env })
  return {
    name: 'daily-knowledge-proxy',
    configureServer(server) {
      server.middlewares.use('/api/knowledge', (req, res) => {
        const url = new URL(req.url || '/', 'http://localhost')
        Promise.resolve(service.handle(req, res, url)).catch(() => {
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'knowledge_service_error' }))
        })
      })
    },
  }
}

// Injective dev 中间件：把 /api/injective 交给 injective-service.mjs 的 handleInjective（与 prod server.mjs 同一套）。
// 私钥 / JWT 只从服务端 env 读、绝不进前端 bundle；读链失败由 handler 内部回落、不白屏。
function injectiveProxy(env: Record<string, string>): Plugin {
  const cfg = { privateKey: env.INJ_PRIVATE_KEY || '', network: env.INJ_NETWORK || 'testnet', pinataJwt: env.PINATA_JWT || '', cardUrl: env.INJ_CARD_URL || '', handshakeContract: env.INJ_HANDSHAKE_CONTRACT || '', rpcUrl: env.INJ_RPC_URL || '' }
  return {
    name: 'injective-proxy',
    configureServer(server) {
      server.middlewares.use('/api/injective', (req, res) => {
        const url = new URL(req.url || '/', 'http://localhost')
        Promise.resolve(handleInjective(req, res, url, cfg)).catch((e) => {
          res.statusCode = 200; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ error: String(e) }))
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    server: {
      port: process.env.PORT ? Number(process.env.PORT) : 5173,
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          // 把大依赖拆成独立 chunk：mapbox 只随地球 tab 加载、可独立缓存；
          // react/motion 各自成块；其余三方进 vendor。配合 tab 懒加载，首屏 JS 大幅瘦身。
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return
            // 端侧大脑：web-llm 只在用户点「启用端侧」时动态 import；单独切块保持懒加载，
            // 否则会被 vendor 兜底吞进首屏急加载块（5.7MB），违背按需下载。
            if (id.includes('@mlc-ai') || id.includes('web-llm')) return 'webllm'
            if (id.includes('mapbox-gl')) return 'mapbox'
            if (id.includes('/react') || id.includes('react-dom') || id.includes('scheduler')) return 'react'
            if (id.includes('motion') || id.includes('framer')) return 'motion'
            return 'vendor'
          },
        },
      },
    },
    plugins: [react(), tailwindcss(), frostLlm(env), frostEdge(env), unsplashProxy(env), injectiveProxy(env), frostFeedProxy(env), knowledgeProxy(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'frost-agent': path.resolve(__dirname, './frost-agent'),
      },
    },
  }
})
