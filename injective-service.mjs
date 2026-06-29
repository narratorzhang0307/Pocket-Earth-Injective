// ════════════════════════════════════════════════════════════════════════════
// Injective 链上 agent 身份服务（server 端 · ESM · Injective 集成 P0-2/4/5）
// ────────────────────────────────────────────────────────────────────────────
// 路由 /api/injective?tool=ping | list-agents | get-status | get-wallet-timeline | register
//  · SDK(@injective/agent-sdk) 用 dynamic import 容错：装好就走真链，没装好返回 stub/error 不崩。
//  · 隐私：私钥只在本服务端从 env 读，绝不进前端 bundle；register 的脱敏 Taste Passport 由前端生成后 POST 进来。
//  · 只读(ping/list-agents/get-status)无需私钥；register 无私钥时强制 dryRun（不上链、只验结构）。
// ════════════════════════════════════════════════════════════════════════════

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BUILDER_CODE, COMPETITION_ALIGNMENT, DEMO_VIDEO_LIMIT_SECONDS, EVIDENCE_PRIVACY_BOUNDARY, FLEET_AGENTS, IDENTITY_REGISTRY, INJECTIVE_TESTNET_CHAIN_ID, INJECTIVE_TESTNET_RPC, PLAZA_DEMO_FLOW, PROOF_OWNER, REGISTRY_MINT_EVENTS, REGISTRY_MINT_ZERO_ADDRESS, REVIEW_BRIEF, REVIEW_CHECKLIST, REVIEW_LINKS, SOCIAL_HANDSHAKE, SUBMISSION_CHECKLIST, SUBMISSION_LINKS, SUBMISSION_REPOSITORY_URL, TIMELINE_EVENTS, sameAddress, scanUrlForAddress, scanUrlForAgent, scanUrlForRegistry, scanUrlForTx } from './INJECTIVE-INTEGRATION/chain-proof-data.mjs'

let _sdk = null, _sdkTried = false
async function getSDK() {
  if (_sdkTried) return _sdk
  _sdkTried = true
  try { _sdk = await import('@injective/agent-sdk') }
  catch { _sdk = null }   // 未装好(本地 build + file: 依赖未就绪)时静默降级
  return _sdk
}

let _reader = null
async function getReader(network) {
  const sdk = await getSDK(); if (!sdk) return null
  try { if (!_reader) _reader = new sdk.AgentReadClient({ network }) } catch { return null }
  return _reader
}

function json(res, obj, code = 200) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(obj, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)))
}
function readBody(req) {
  return new Promise((resolve) => {
    let d = ''
    req.on('data', (c) => { d += c; if (d.length > 2e6) req.destroy() })
    req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}) } catch { resolve({}) } })
    req.on('error', () => resolve({}))
  })
}

// 解码 data:application/json;base64,… 的内联 Agent Card（口味名片内联上链时用）→ 对象 / null
function decodeDataCard(uri) {
  const P = 'data:application/json;base64,'
  if (typeof uri !== 'string' || !uri.startsWith(P)) return null
  try { return JSON.parse(Buffer.from(uri.slice(P.length), 'base64').toString('utf8')) } catch { return null }
}

const ZERO_BYTES32 = '0x' + '0'.repeat(64)
function normalizeBytes32(value) {
  return typeof value === 'string' ? value.toLowerCase() : ZERO_BYTES32
}
function isBytes32(value) {
  return /^0x[0-9a-f]{64}$/i.test(String(value || ''))
}

const PROJECT_ROOT = dirname(fileURLToPath(import.meta.url))
function cleanGitSha(value) {
  const text = String(value || '').trim().toLowerCase()
  return /^[0-9a-f]{40}$/.test(text) ? text : ''
}
function cleanBranch(value) {
  return String(value || '').trim().replace(/^refs\/heads\//, '')
}
function readGitMetadata() {
  let commit = cleanGitSha(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || process.env.COMMIT_SHA)
  let branch = cleanBranch(process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME)
  let gitDir = resolve(PROJECT_ROOT, '.git')
  try {
    const dotGit = readFileSync(gitDir, 'utf8').trim()
    if (dotGit.startsWith('gitdir:')) gitDir = resolve(PROJECT_ROOT, dotGit.slice('gitdir:'.length).trim())
  } catch { /* .git is usually a directory in local review; env commit is enough on hosted builds. */ }
  if (existsSync(resolve(gitDir, 'HEAD'))) {
    try {
      const head = readFileSync(resolve(gitDir, 'HEAD'), 'utf8').trim()
      if (head.startsWith('ref: ')) {
        const ref = head.slice('ref: '.length).trim()
        if (!branch && ref.startsWith('refs/heads/')) branch = ref.slice('refs/heads/'.length)
        if (!commit) commit = cleanGitSha(readFileSync(resolve(gitDir, ref), 'utf8'))
      } else if (!commit) {
        commit = cleanGitSha(head)
      }
    } catch { /* sourceControl remains public even if the hosted build omits .git. */ }
  }
  return { branch: branch || 'main', commit: commit || null }
}
function getSourceControlEvidence() {
  const { branch, commit } = readGitMetadata()
  return {
    repository: SUBMISSION_REPOSITORY_URL,
    branch,
    commit,
    commitUrl: commit ? `${SUBMISSION_REPOSITORY_URL}/commit/${commit}` : null,
    evidenceApi: '/api/injective?tool=get-chain-evidence',
  }
}

// list-agents 结果缓存（id → {agent, at}），抹平 testnet RPC 抖动：本次 getStatus 没返回的、但 60s 内查到过的 agent 仍带上，避免广场在场数忽多忽少。
const _agentCache = new Map()
function mergeAgentCache(fresh, maxAgeMs = 60000) {
  const now = Date.now()
  for (const a of fresh) if (a?.agentId != null) _agentCache.set(String(a.agentId), { agent: a, at: now })
  const merged = new Map()
  for (const [id, { agent, at }] of _agentCache) { if (now - at < maxAgeMs) merged.set(id, agent); else _agentCache.delete(id) }
  return [...merged.values()].sort((x, y) => Number(y.agentId) - Number(x.agentId))
}

/** /api/injective 分发。cfg = { privateKey, network, pinataJwt, cardUrl }（来自 server.mjs 的 env）。 */
export async function handleInjective(req, res, url, cfg = {}) {
  const tool = url.searchParams.get('tool') || ''
  const network = cfg.network || 'testnet'
  try {
    // —— 只读：探活（无需私钥）——
    if (tool === 'ping') {
      const reader = await getReader(network)
      if (!reader) return json(res, { reachable: false, sdk: false, hint: 'SDK 未就绪（本地 build + file: 依赖）' })
      const ok = await reader.ping().catch(() => false)
      return json(res, { reachable: !!ok, sdk: true, network })
    }

    // —— 只读：列出链上真实 agent（广场发现，无需私钥）——
    // 默认快查：并行 getStatus 最近 limit 个 agentId（比扫全链 Transfer 事件快一个量级，demo agent 在高位 id）。
    // 传 full=1 才走 discoverAgentIds 全量发现（慢，扫全链）。
    if (tool === 'list-agents') {
      const reader = await getReader(network)
      if (!reader) return json(res, { agents: [], total: 0, sdk: false, hint: 'SDK 未就绪，前端请回落示意邻居' })
      const offset = Math.max(0, Number(url.searchParams.get('offset') || 0))
      const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') || 20)))
      const builderCodeFilter = String(url.searchParams.get('builderCode') || '').trim().toLowerCase()
      const enrich = url.searchParams.get('enrich') !== '0'
      const full = url.searchParams.get('full') === '1'
      let agents = [], total = 0
      if (full) {
        try {
          const page = await Promise.race([
            reader.listAgents({ offset, limit, enrich }),
            new Promise((_, rej) => setTimeout(() => rej(new Error('list_timeout')), 12000)),
          ])
          agents = page.agents || []; total = page.total ?? agents.length
        } catch { /* 落到下方快查 */ }
      }
      if (!agents.length) {
        // 快查：并行 getStatus 最近 limit 个 agentId（top 向下；不存在的 id 返回 null 滤掉）
        const top = Number(url.searchParams.get('top') || 47)
        const ids = []
        for (let id = top - offset; id >= Math.max(1, top - offset - limit + 1); id--) ids.push(id)
        const getStatusWithTimeout = (id, timeoutMs = 4000) => Promise.race([
          reader.getStatus(BigInt(id)),
          new Promise((rs) => setTimeout(() => rs(null), timeoutMs)), // 不存在/慢的 id 超时回 null，不拖累整体
        ]).catch(() => null)
        const settled = await Promise.all(ids.map((id) => getStatusWithTimeout(id)))
        agents = settled.filter(Boolean)
        if (builderCodeFilter && agents.length < Math.min(limit, ids.length)) {
          const seen = new Set(agents.map((a) => String(a.agentId)))
          const retryIds = ids.filter((id) => !seen.has(String(id)))
          const retried = await Promise.all(retryIds.map((id) => getStatusWithTimeout(id, 8000)))
          agents = [...agents, ...retried.filter(Boolean)]
        }
        total = agents.length
      }
      // 服务端解码 data: URI card → 前端直接拿到口味标签（不依赖 SDK fetchCard 对 data: 的支持）
      for (const a of agents) { if (a && !a.card && a.tokenUri) { const c = decodeDataCard(a.tokenUri); if (c) a.card = c } }
      // 合并缓存抹平 RPC 抖动（本次没查到、但 60s 内查到过的 agent 仍带上），裁到 limit
      agents = mergeAgentCache(agents)
      if (builderCodeFilter) agents = agents.filter((a) => String(a?.builderCode || '').toLowerCase() === builderCodeFilter)
      agents = agents.slice(0, limit)
      return json(res, { agents, total: agents.length, offset, limit, ...(builderCodeFilter ? { builderCode: builderCodeFilter } : {}), sdk: true })
    }

    // —— 只读：查单个 agent 状态 ——
    if (tool === 'get-status') {
      const reader = await getReader(network); if (!reader) return json(res, { error: 'sdk_unavailable' })
      const id = url.searchParams.get('agentId'); if (!id) return json(res, { error: 'no_agentId' })
      const st = await reader.getStatus(BigInt(id))
      return json(res, st)
    }

    // —— 只读：查 agent 声誉分（P1-3 读部分，无需私钥；失败回落零分不崩）——
    if (tool === 'get-reputation') {
      const reader = await getReader(network); if (!reader) return json(res, { error: 'sdk_unavailable' })
      const id = url.searchParams.get('agentId'); if (!id) return json(res, { error: 'no_agentId' })
      const rep = await reader.getReputation(BigInt(id)).catch(() => ({ score: 0, count: 0, clients: [] }))
      return json(res, rep)
    }

    // —— 只读：公开链上证据包（供评审/录屏直接从产品 API 拉同一份公开事实表）——
    if (tool === 'get-chain-evidence') {
      const topAgentId = Math.max(...FLEET_AGENTS.map((agent) => Number(agent.id)))
      const listAgentsApi = `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=${topAgentId}`
      const walletTimelineApi = '/api/injective?tool=get-wallet-timeline'
      const publicReadApis = [
        {
          key: 'chain-evidence-api',
          label: 'Public chain evidence package',
          method: 'GET',
          path: '/api/injective?tool=get-chain-evidence',
          chainId: INJECTIVE_TESTNET_CHAIN_ID,
          readOnly: true,
          publicOnly: true,
          verification: 'npm run verify:public-proof',
          purpose: 'Returns the judge-facing evidence bundle, sourceControl anchor, mint events, wallet timeline summary, and privacy boundary.',
        },
        {
          key: 'agent-fleet-api',
          label: 'Read Pocket Earth agent fleet by builderCode',
          method: 'GET',
          path: listAgentsApi,
          chainId: INJECTIVE_TESTNET_CHAIN_ID,
          readOnly: true,
          publicOnly: true,
          verification: 'node INJECTIVE-INTEGRATION/verify-api-list-agents.mjs',
          purpose: `Reads agentId 43-47 from Injective testnet with builderCode=${BUILDER_CODE}.`,
        },
        {
          key: 'wallet-timeline-api',
          label: 'Read wallet transaction timeline from RPC',
          method: 'GET',
          path: walletTimelineApi,
          chainId: INJECTIVE_TESTNET_CHAIN_ID,
          readOnly: true,
          publicOnly: true,
          verification: 'npm run verify:wallet',
          purpose: 'Replays registration, SocialHandshake deployment, fleet registration, and the real handshake from Injective RPC.',
        },
      ]
      const firstTimelineEvent = TIMELINE_EVENTS[0]
      const lastTimelineEvent = TIMELINE_EVENTS.at(-1)
      const registryAgentIds = REGISTRY_MINT_EVENTS.map((event) => event.agentId)
      const firstRegistryMint = REGISTRY_MINT_EVENTS[0]
      const lastRegistryMint = REGISTRY_MINT_EVENTS.at(-1)
      const timeline = TIMELINE_EVENTS.map((event) => ({
        label: event.label,
        role: event.role,
        hash: event.hash,
        from: PROOF_OWNER,
        to: event.to,
        expectedStatus: 'success',
        blockNumber: event.blockNumber,
        timestamp: event.timestamp,
        scanUrl: scanUrlForTx(event.hash),
        ...(event.contractAddress ? { contractAddress: event.contractAddress } : {}),
      }))
      return json(res, {
        ok: true,
        network: 'testnet',
        chainId: INJECTIVE_TESTNET_CHAIN_ID,
        readOnly: true,
        publicOnly: true,
        demoVideoLimitSeconds: DEMO_VIDEO_LIMIT_SECONDS,
        builderCode: BUILDER_CODE,
        sourceControl: getSourceControlEvidence(),
        publicReadApis,
        owner: PROOF_OWNER,
        ownerScanUrl: scanUrlForAddress(PROOF_OWNER),
        registry: IDENTITY_REGISTRY,
        registryScanUrl: scanUrlForRegistry(),
        handshakeContract: SOCIAL_HANDSHAKE,
        handshakeScanUrl: scanUrlForAddress(SOCIAL_HANDSHAKE),
        reviewLinks: REVIEW_LINKS,
        reviewBrief: REVIEW_BRIEF,
        reviewChecklist: REVIEW_CHECKLIST,
        competitionAlignment: COMPETITION_ALIGNMENT,
        submissionLinks: SUBMISSION_LINKS,
        submissionChecklist: SUBMISSION_CHECKLIST,
        privacyBoundary: EVIDENCE_PRIVACY_BOUNDARY,
        plazaFlow: PLAZA_DEMO_FLOW,
        agents: FLEET_AGENTS.map((agent) => ({
          agentId: Number(agent.id),
          label: agent.label,
          ...(agent.requiredTag ? { requiredTag: agent.requiredTag } : {}),
          scanUrl: scanUrlForAgent(agent.id),
        })),
        registryMintEvents: REGISTRY_MINT_EVENTS,
        registryMintSummary: {
          owner: PROOF_OWNER,
          ownerScanUrl: scanUrlForAddress(PROOF_OWNER),
          registry: IDENTITY_REGISTRY,
          registryScanUrl: scanUrlForRegistry(),
          eventCount: REGISTRY_MINT_EVENTS.length,
          agentIds: registryAgentIds,
          firstAgentId: registryAgentIds[0] ?? null,
          lastAgentId: registryAgentIds.at(-1) ?? null,
          allMintFromZero: REGISTRY_MINT_EVENTS.every((event) => sameAddress(event.from, REGISTRY_MINT_ZERO_ADDRESS)),
          allToOwner: REGISTRY_MINT_EVENTS.every((event) => sameAddress(event.to, PROOF_OWNER)),
          firstBlock: firstRegistryMint?.blockNumber ?? null,
          lastBlock: lastRegistryMint?.blockNumber ?? null,
          localVerification: 'npm run verify:registry',
        },
        timeline,
        timelineSummary: {
          owner: PROOF_OWNER,
          walletScanUrl: scanUrlForAddress(PROOF_OWNER),
          eventCount: timeline.length,
          allFromOwner: timeline.every((event) => sameAddress(event.from, PROOF_OWNER)),
          expectedStatus: 'success',
          firstBlock: firstTimelineEvent.blockNumber,
          lastBlock: lastTimelineEvent.blockNumber,
          firstTimestamp: firstTimelineEvent.timestamp,
          lastTimestamp: lastTimelineEvent.timestamp,
          firstRole: firstTimelineEvent.role,
          lastRole: lastTimelineEvent.role,
          rpcVerification: walletTimelineApi,
        },
        recordingOrder: [
          {
            step: 1,
            label: 'Open Frost agentId 43 identity page',
            type: 'blockscout',
            url: scanUrlForAgent(43),
            evidenceFocus: [
              'agentId 43 identity is visible on Injective Blockscout',
              `owner matches ${PROOF_OWNER}`,
              `builderCode is ${BUILDER_CODE}`,
            ],
          },
          {
            step: 2,
            label: 'Open the owner wallet page',
            type: 'blockscout',
            url: scanUrlForAddress(PROOF_OWNER),
            evidenceFocus: [
              'each key transaction uses the same wallet',
              'registration, deployment, fleet, and handshake transactions are visible',
              'wallet page anchors the owner before opening product APIs',
            ],
          },
          {
            step: 3,
            label: 'Show the public evidence API package',
            type: 'api',
            path: '/api/injective?tool=get-chain-evidence',
            evidenceFocus: [
              'registryMintSummary proves agentId 43-47 were minted from 0x0 to the owner',
              'timelineSummary proves the same owner and successful chain timeline',
              'sourceControl anchors evidence to the current GitHub commit',
            ],
          },
          {
            step: 4,
            label: 'Read agentId 43-47 by builderCode',
            type: 'api',
            path: listAgentsApi,
            evidenceFocus: [
              `builderCode=${BUILDER_CODE} filters agentId 43-47 from Injective`,
              'public data URI cards are returned without private keys',
              'agent-plaza can install from the same fleet later',
            ],
          },
          {
            step: 5,
            label: 'Read the wallet transaction timeline from RPC',
            type: 'api',
            path: walletTimelineApi,
            evidenceFocus: [
              'summary shows owner, eventCount, allSucceeded, and first/last blocks',
              `chainId ${INJECTIVE_TESTNET_CHAIN_ID} confirms Injective testnet timeline`,
              'events replay registration, deployment, fleet, and handshake RPC facts',
              'final event is the real SocialHandshake transaction',
            ],
          },
          {
            step: 6,
            label: 'Run the plaza UI smoke after chain evidence is ready',
            type: 'command',
            command: 'npm run verify:plaza',
            evidenceFocus: [
              'public-plaza shows chain social discovery',
              'agent-plaza shows marketplace and install loop',
              'smoke test keeps the UI proof path executable',
            ],
          },
        ],
        verification: {
          demoReadiness: 'npm run verify:demo',
          demoDuration: 'npm run verify:duration',
          evidenceSmoke: 'npm run verify:evidence',
          publicProof: 'npm run verify:public-proof',
          githubRepo: 'npm run verify:github',
          pitchNotes: 'npm run verify:pitch',
          judgeQuickstart: 'npm run verify:judge',
          reviewBrief: 'npm run verify:brief',
          reviewChecklist: 'npm run verify:review',
          reviewLinks: 'npm run verify:review-links',
          recordingOrder: 'npm run verify:recording-order',
          walletTimeline: 'npm run verify:wallet',
          sourceControl: 'npm run verify:source',
          registryEvents: 'npm run verify:registry',
          plazaFlow: 'npm run verify:plaza-flow',
          novaAlignment: 'npm run verify:nova-alignment',
          submissionPack: 'npm run verify:submission',
          proofSuite: 'npm run verify:injective',
          apiReadTools: 'node INJECTIVE-INTEGRATION/verify-api-read-tools.mjs',
          listAgentsApi,
          walletTimelineApi,
        },
      })
    }

    // —— 只读：钱包证据时间线（直接读 Injective RPC 的 tx/receipt/block，无需私钥）——
    if (tool === 'get-wallet-timeline') {
      const { createPublicClient, defineChain, http } = await import('viem')
      const rpcUrl = cfg.rpcUrl || INJECTIVE_TESTNET_RPC
      const chain = defineChain({ id: network === 'mainnet' ? 1776 : 1439, name: 'Injective', nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } })
      const client = createPublicClient({ chain, transport: http(rpcUrl) })
      const events = []
      for (const expected of TIMELINE_EVENTS) {
        const [tx, receipt] = await Promise.all([
          client.getTransaction({ hash: expected.hash }),
          client.getTransactionReceipt({ hash: expected.hash }),
        ])
        const block = await client.getBlock({ blockNumber: receipt.blockNumber })
        const timestamp = new Date(Number(block.timestamp) * 1000).toISOString()
        if (!sameAddress(tx.from, PROOF_OWNER)) throw new Error(`timeline_from_mismatch:${expected.role}`)
        if (!sameAddress(tx.to, expected.to)) throw new Error(`timeline_to_mismatch:${expected.role}`)
        if (String(receipt.status) !== 'success') throw new Error(`timeline_receipt_failed:${expected.role}`)
        if (receipt.blockNumber !== expected.blockNumber) throw new Error(`timeline_block_mismatch:${expected.role}`)
        if (timestamp !== expected.timestamp) throw new Error(`timeline_time_mismatch:${expected.role}`)
        if (expected.contractAddress && !sameAddress(receipt.contractAddress, expected.contractAddress)) throw new Error(`timeline_contract_mismatch:${expected.role}`)
        events.push({
          label: expected.label,
          role: expected.role,
          hash: expected.hash,
          from: tx.from,
          to: tx.to,
          status: receipt.status,
          blockNumber: receipt.blockNumber,
          timestamp,
          contractAddress: receipt.contractAddress || null,
          scanUrl: scanUrlForTx(expected.hash),
        })
      }
      return json(res, {
        ok: true,
        network,
        chainId: INJECTIVE_TESTNET_CHAIN_ID,
        readOnly: true,
        publicOnly: true,
        owner: PROOF_OWNER,
        registry: IDENTITY_REGISTRY,
        handshakeContract: SOCIAL_HANDSHAKE,
        summary: {
          owner: PROOF_OWNER,
          walletScanUrl: scanUrlForAddress(PROOF_OWNER),
          eventCount: events.length,
          allFromOwner: events.every((event) => sameAddress(event.from, PROOF_OWNER)),
          allSucceeded: events.every((event) => event.status === 'success'),
          firstBlock: events[0]?.blockNumber ?? null,
          lastBlock: events.at(-1)?.blockNumber ?? null,
          firstTimestamp: events[0]?.timestamp ?? null,
          lastTimestamp: events.at(-1)?.timestamp ?? null,
          firstRole: events[0]?.role ?? null,
          lastRole: events.at(-1)?.role ?? null,
          evidenceApi: '/api/injective?tool=get-chain-evidence',
        },
        events,
      })
    }

    // —— 写：注册 Frost 链上身份（需私钥；无私钥/未显式确认时强制 dryRun 不上链）——
    if (tool === 'register' && req.method === 'POST') {
      const sdk = await getSDK(); if (!sdk) return json(res, { error: 'sdk_unavailable' })
      const body = await readBody(req)
      const passport = body.passport || {}
      const pk = cfg.privateKey || ''
      // 无私钥 → 必 dryRun；有私钥 → 仅当 body.confirm===true 才真上链，否则也 dryRun（Boundary: suggest-then-confirm）
      const dryRun = !pk || body.confirm !== true
      if (!pk && body.confirm === true) return json(res, { error: 'no_private_key', hint: '需在 server .env 配 INJ_PRIVATE_KEY（仅 testnet）' })
      // 名片来源三级：Pinata(真上 IPFS) > 自托管 cardUrl > data: URI 内联（口味自带上链、无需外部托管，demo 默认）
      const regName = String(body.name || 'PocketEarth-FROST').slice(0, 100)
      const regDesc = String(passport.description || body.description || 'Pocket Earth 探索 agent 的链上身份').slice(0, 500)
      const regTags = Array.isArray(passport.topTags) ? passport.topTags.slice(0, 10) : []
      let storage, inlineUri
      if (cfg.pinataJwt) storage = new sdk.PinataStorage({ jwt: cfg.pinataJwt })
      else if (cfg.cardUrl && body.useCardUrl) storage = new sdk.CustomUrlStorage(cfg.cardUrl)
      else {
        const card = { type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1', name: regName, description: regDesc, tags: regTags, metadata: { chain: 'injective', builderCode: 'pocket-earth' } }
        inlineUri = 'data:application/json;base64,' + Buffer.from(JSON.stringify(card)).toString('base64')
      }
      if (dryRun && !pk) {
        return json(res, {
          ok: true,
          dryRun: true,
          address: null,
          agentId: null,
          txHashes: [],
          scanUrl: null,
          willRegister: {
            name: regName,
            type: 'other',
            builderCode: 'pocket-earth',
            description: regDesc,
            tags: regTags,
            services: Array.isArray(body.services) ? body.services : [],
            x402: false,
            uri: inlineUri,
          },
          hint: 'dryRun preview only; set INJ_PRIVATE_KEY and confirm:true to write on Injective testnet',
        })
      }
      const client = new sdk.AgentClient({ privateKey: pk || undefined, network, storage })
      const result = await client.register({
        name: regName,
        type: 'other',
        builderCode: 'pocket-earth',
        wallet: client.address,                 // SDK 仅支持自签绑定：wallet 必须 = 签名者地址
        description: regDesc,
        tags: regTags,
        services: Array.isArray(body.services) ? body.services : [],
        x402: false,
        ...(inlineUri ? { uri: inlineUri } : {}),
        dryRun,
      })
      return json(res, { ok: true, dryRun, address: client.address, ...result })
    }

    // —— 写：社交握手（P1-2）。需私钥 + 已部署 SocialHandshake 合约地址 + confirm 才真上链，否则 dryRun 返回将写内容。——
    if (tool === 'handshake' && req.method === 'POST') {
      const body = await readBody(req)
      const { agentA, agentB, score = 0, confirm } = body
      const profileHashA = normalizeBytes32(body.profileHashA)
      const profileHashB = normalizeBytes32(body.profileHashB)
      const numericScore = Number(score)
      if (agentA == null || agentB == null) return json(res, { error: 'need_agentA_agentB' })
      if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 100) return json(res, { error: 'invalid_score', hint: 'score must be an integer from 0 to 100' })
      const pk = cfg.privateKey || ''
      const contract = cfg.handshakeContract || ''
      const willEmit = { agentA: String(agentA), agentB: String(agentB), profileHashA, profileHashB, score: numericScore, timestamp: Math.floor(Date.now() / 1000) }
      // Boundary：无私钥 / 未部署合约 / 未显式 confirm → 一律 dryRun，只回「将要写什么」
      if (!(pk && contract && confirm === true)) {
        return json(res, { ok: true, dryRun: true, willEmit, hint: !pk ? '需配 INJ_PRIVATE_KEY' : !contract ? '需先部署 SocialHandshake 合约并配 INJ_HANDSHAKE_CONTRACT' : '加 confirm:true 真上链' })
      }
      // 真写链必须带有效、非零的名片哈希，避免把缺省值当成可证明的 Taste Passport 存证。
      if (!isBytes32(profileHashA) || !isBytes32(profileHashB)) return json(res, { error: 'invalid_profile_hash', hint: 'profileHashA/profileHashB must be 0x-prefixed bytes32 values' })
      if (profileHashA === ZERO_BYTES32 || profileHashB === ZERO_BYTES32) return json(res, { error: 'empty_profile_hash', hint: 'confirm:true handshakes must include non-zero Taste Passport hashes' })
      try {
        const { createWalletClient, http, defineChain } = await import('viem')
        const { privateKeyToAccount } = await import('viem/accounts')
        const chain = defineChain({ id: network === 'mainnet' ? 1776 : 1439, name: 'Injective', nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 }, rpcUrls: { default: { http: [cfg.rpcUrl || 'https://testnet.sentry.chain.json-rpc.injective.network'] } } })
        const account = privateKeyToAccount(pk.startsWith('0x') ? pk : '0x' + pk)
        const wallet = createWalletClient({ account, chain, transport: http() })
        const abi = [{ type: 'function', name: 'recordHandshake', stateMutability: 'nonpayable', inputs: [{ name: 'agentA', type: 'uint256' }, { name: 'agentB', type: 'uint256' }, { name: 'profileHashA', type: 'bytes32' }, { name: 'profileHashB', type: 'bytes32' }, { name: 'score', type: 'uint16' }], outputs: [] }]
        const txHash = await wallet.writeContract({ address: contract, abi, functionName: 'recordHandshake', args: [BigInt(agentA), BigInt(agentB), profileHashA, profileHashB, numericScore] })
        return json(res, { ok: true, dryRun: false, txHash, scanUrl: `https://testnet.blockscout.injective.network/tx/${txHash}` })
      } catch (e) {
        return json(res, { error: String(e?.message || e) })
      }
    }

    return json(res, { error: 'unknown_tool', tool })
  } catch (e) {
    return json(res, { error: String(e?.message || e) })
  }
}
