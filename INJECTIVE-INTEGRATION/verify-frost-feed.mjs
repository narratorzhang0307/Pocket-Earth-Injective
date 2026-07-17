import assert from 'node:assert/strict'
import { createFrostFeed } from '../frost-feed-service.mjs'

function responseCapture() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    writeHead(code, headers = {}) { this.statusCode = code; this.headers = headers },
    end(chunk = '') { this.body += String(chunk || '') },
  }
}

async function call(feed, { token = '', after = '', method = 'GET' } = {}) {
  const req = { method, headers: token ? { authorization: `Bearer ${token}` } : {} }
  const res = responseCapture()
  const url = new URL(`http://localhost/api/frost-feed${after ? `?after=${encodeURIComponent(after)}` : ''}`)
  await feed.handle(req, res, url)
  return res
}

let reads = 0
const feed = createFrostFeed({
  token: 'device-token',
  readAgents: async () => {
    reads++
    return [43, 44, 45, 46, 47].map((agentId) => ({ agentId }))
  },
})

const unauthorized = await call(feed)
assert.equal(unauthorized.statusCode, 401)

const first = await call(feed, { token: 'device-token' })
assert.equal(first.statusCode, 200)
assert.match(first.headers['content-type'], /application\/x-ndjson/)
assert.equal(first.headers['cache-control'], 'no-store')
assert.ok(first.headers['x-frost-next-cursor'])
const event = JSON.parse(first.body.trim())
assert.equal(event.version, '0.1.0')
assert.equal(event.kind, 'chain_dispatch')
assert.deepEqual(event.agentIds, ['43', '44', '45', '46', '47'])
assert.match(event.body, /实时读回/)
assert.doesNotMatch(first.body, /device-token|PRIVATE_KEY|API_KEY/)

const repeated = await call(feed, { token: 'device-token', after: first.headers['x-frost-next-cursor'] })
assert.equal(repeated.statusCode, 204)
assert.equal(reads, 1)

const invalid = await call(feed, { token: 'device-token', after: 'not-a-cursor' })
assert.equal(invalid.statusCode, 400)

const noConfig = createFrostFeed({ readAgents: async () => [] })
assert.equal((await call(noConfig, { token: 'anything' })).statusCode, 503)

console.log('frost feed verification passed')

