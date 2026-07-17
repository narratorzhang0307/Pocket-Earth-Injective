// Authenticated, cursor-based JSONL feed for the Frost Edge Node.
// The 13-field public event envelope remains frozen in frost-hardware-bridge.mjs;
// authentication and replay protection live only in HTTP transport metadata.

import { createChainDispatchEvent, toJsonLine } from './hardware/frost-buddy/frost-hardware-bridge.mjs'
import { handleInjective } from './injective-service.mjs'

const DEFAULT_CAPACITY = 64

function sendJson(res, value, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(value))
}

function bearer(req) {
  const value = String(req.headers?.authorization || '')
  return value.startsWith('Bearer ') ? value.slice(7) : ''
}

function cursorFor(sequence) {
  return Buffer.from(`frost:${sequence}`, 'utf8').toString('base64url')
}

function sequenceFromCursor(cursor) {
  if (!cursor) return 0
  try {
    const decoded = Buffer.from(String(cursor), 'base64url').toString('utf8')
    const match = decoded.match(/^frost:(\d+)$/)
    return match ? Number(match[1]) : null
  } catch {
    return null
  }
}

async function callAgentList(cfg) {
  let statusCode = 200
  let body = ''
  const req = { method: 'GET', headers: {}, on() {} }
  const res = {
    writeHead(code) { statusCode = code },
    setHeader() {},
    end(chunk = '') { body += String(chunk || '') },
  }
  const url = new URL('http://localhost/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47')
  await handleInjective(req, res, url, cfg)
  if (statusCode !== 200) throw new Error(`injective_agent_list_${statusCode}`)
  const data = JSON.parse(body || '{}')
  return Array.isArray(data.agents) ? data.agents : []
}

export function createFrostFeed({ token = '', injectiveConfig = {}, capacity = DEFAULT_CAPACITY, readAgents } = {}) {
  const entries = []
  let nextSequence = 1
  let seedPromise = null
  const liveRead = readAgents || (() => callAgentList(injectiveConfig))

  function publish(event) {
    const sequence = nextSequence++
    const entry = { sequence, cursor: cursorFor(sequence), event }
    entries.push(entry)
    if (entries.length > capacity) entries.splice(0, entries.length - capacity)
    return entry.cursor
  }

  function publishChronicle({ factCount = 0, revision = 1, scanUrl = '', createdAt } = {}) {
    const count = Math.max(0, Number(factCount) || 0)
    const rev = Math.max(1, Number(revision) || 1)
    return publish(createChainDispatchEvent({
      title: `Daily Knowledge Edition · r${rev}`,
      body: `${count} 条公共知识已形成可验证版次并锚定 Injective testnet。`,
      speak: `今天的 ${count} 条公共知识已经在 Injective 留下可验证版次。`,
      scanUrl,
      createdAt,
    }))
  }

  async function seedFromLiveChain() {
    if (entries.length || seedPromise) return seedPromise
    seedPromise = Promise.resolve(liveRead()).then((agents) => {
      const ids = agents.map((agent) => String(agent?.agentId ?? agent?.id ?? '')).filter(Boolean).slice(0, 12)
      if (!ids.length) return null
      return publish(createChainDispatchEvent({
        count: ids.length,
        agentIds: ids,
        body: `builderCode=pocket-earth 从 Injective testnet 实时读回 agentId ${ids.join('、')}。`,
      }))
    }).catch(() => null)
    return seedPromise
  }

  async function handle(req, res, url) {
    if (req.method !== 'GET') return sendJson(res, { error: 'method_not_allowed' }, 405)
    if (!token) return sendJson(res, { error: 'feed_token_not_configured' }, 503)
    if (bearer(req) !== token) return sendJson(res, { error: 'unauthorized' }, 401)

    const after = sequenceFromCursor(url.searchParams.get('after') || '')
    if (after === null) return sendJson(res, { error: 'invalid_cursor' }, 400)
    await seedFromLiveChain()
    const entry = entries.find((item) => item.sequence > after)
    if (!entry) {
      const headers = { 'cache-control': 'no-store' }
      const latest = entries.at(-1)
      if (latest) headers['x-frost-next-cursor'] = latest.cursor
      res.writeHead(204, headers)
      res.end()
      return
    }
    res.writeHead(200, {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-store',
      'x-frost-next-cursor': entry.cursor,
    })
    res.end(toJsonLine(entry.event))
  }

  return { handle, publish, publishChronicle, seedFromLiveChain, size: () => entries.length }
}

