import assert from 'node:assert/strict'
import { createDailyKnowledgeService } from '../knowledge/daily-service.mjs'

function responseCapture() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    writeHead(code, headers = {}) { this.statusCode = code; this.headers = headers },
    end(chunk = '') { this.body += String(chunk || '') },
  }
}

async function call(service, path, method = 'GET') {
  const req = { method, headers: {}, socket: { remoteAddress: '127.0.0.1' } }
  const res = responseCapture()
  await service.handle(req, res, new URL(`http://localhost${path}`))
  return { status: res.statusCode, body: JSON.parse(res.body || '{}') }
}

const service = createDailyKnowledgeService({ env: {} })
const today = await call(service, '/api/knowledge?tool=today&topic=ai&date=2026-07-17')
assert.equal(today.status, 200)
assert.equal(today.body.mode, 'offline')
assert.equal(today.body.topic, 'ai')
assert.equal(today.body.records.length, 1)
assert.equal(today.body.records[0].sources.length, 2)
assert.match(today.body.records[0].sources[0].url, /^https:\/\//)
assert.match(today.body.records[0].commitment.recordHash, /^0x[0-9a-f]{64}$/)
assert.match(today.body.edition.editionRoot, /^0x[0-9a-f]{64}$/)
assert.equal(today.body.edition.factCount, 2)
assert.equal(today.body.edition.editionRoot, '0x6e62dcc3fe00495d15d2a7600a5dff6a9f396b85f641fd5316ff69b8327491da')
assert.equal(today.body.edition.anchor.chainId, 1439)
assert.equal(today.body.edition.anchor.txHash, '0x19364a91b7adb1a8eb8daace6fe644d3a901b5a18a575d954c641de7bdf296c7')

const topics = await call(service, '/api/knowledge?tool=topics')
assert.equal(topics.status, 200)
assert.deepEqual(topics.body.topics.map((item) => item.key), ['ai', 'finance', 'science', 'climate', 'culture'])
assert.deepEqual(topics.body.anchoredTopics, ['ai', 'finance'])
assert.match(topics.body.policy, /explicit reviewed Chronicle commit/)

const recordHash = today.body.records[0].commitment.recordHash
const proof = await call(service, `/api/knowledge?tool=proof&recordHash=${recordHash}`)
assert.equal(proof.status, 200)
assert.equal(proof.body.verified, true)
assert.equal(proof.body.record.commitment.recordHash, recordHash)

const finance = await call(service, '/api/knowledge?tool=today&topic=finance&date=2026-07-17')
assert.equal(finance.status, 200)
assert.equal(finance.body.records[0].topic, 'finance')
assert.match(finance.body.records[0].claim, /Chain ID 1439/i)
assert.match(finance.body.records[0].sources[0].url, /^https:\/\/docs\.injective\.network\//)

const pack = await call(service, '/api/knowledge?tool=pack&date=2026-07-17')
assert.equal(pack.status, 200)
assert.equal(pack.body.schema, 'pocket-earth-public-knowledge-pack/v1')
assert.equal(pack.body.records.length, 2)
assert.equal(pack.body.edition.revision, 2)

const refresh = await call(service, '/api/knowledge?tool=refresh&topic=ai&date=2026-07-17', 'POST')
assert.equal(refresh.status, 200)
assert.equal(refresh.body.mode, 'offline')

const invalid = await call(service, '/api/knowledge?tool=today&topic=weather')
assert.equal(invalid.status, 400)

console.log('knowledge API verification passed')
