import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createDailyKnowledgeService } from '../knowledge/daily-service.mjs'
import { archiveReviewedEdition } from '../knowledge/archive.mjs'

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
assert.deepEqual(topics.body.topics.map((item) => item.key), ['ai', 'technology', 'finance', 'climate', 'science', 'health', 'culture', 'policy'])
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

const workerDir = await mkdtemp(join(tmpdir(), 'pocket-earth-knowledge-api-'))
try {
  const dateDir = join(workerDir, '2026-07-17')
  await mkdir(dateDir, { recursive: true })
  const workerEdition = { editionRoot: `0x${'1'.repeat(64)}`, revision: 1, anchor: null }
  const workerSnapshot = (topic) => ({
    schema: 'pocket-earth-knowledge-worker/v1',
    date: '2026-07-17', topic, generatedAt: '2026-07-17T12:00:00.000Z', mode: 'live',
    records: [{ id: `${topic}-live-draft`, topic }], edition: workerEdition,
  })
  await writeFile(join(dateDir, 'technology.json'), JSON.stringify(workerSnapshot('technology')))
  await writeFile(join(dateDir, 'ai.json'), JSON.stringify(workerSnapshot('ai')))
  const committedProof = JSON.parse(await readFile(new URL('./knowledge-edition-proof.json', import.meta.url), 'utf8'))
  await archiveReviewedEdition({ outputDir: workerDir, proof: committedProof })
  const snapshotService = createDailyKnowledgeService({ env: { KNOWLEDGE_DATA_DIR: workerDir } })
  const technologyDraft = await call(snapshotService, '/api/knowledge?tool=today&topic=technology&date=2026-07-17')
  assert.equal(technologyDraft.body.mode, 'live')
  assert.equal(technologyDraft.body.records[0].id, 'technology-live-draft')
  const anchoredAi = await call(snapshotService, '/api/knowledge?tool=today&topic=ai&date=2026-07-17')
  assert.equal(anchoredAi.body.mode, 'offline')
  assert.equal(anchoredAi.body.edition.revision, 2)
  assert.equal(anchoredAi.body.edition.anchor.txHash, '0x19364a91b7adb1a8eb8daace6fe644d3a901b5a18a575d954c641de7bdf296c7')
  const archive = await call(snapshotService, '/api/knowledge?tool=archive&date=2026-07-17')
  assert.equal(archive.status, 200)
  assert.equal(archive.body.schema, 'pocket-earth-reviewed-knowledge-archive/v1')
  assert.equal(archive.body.records.length, 2)
  assert.equal(archive.body.retentionPolicy.lifetime, 'permanent')
  const financeArchive = await call(snapshotService, '/api/knowledge?tool=archive&topic=finance&date=2026-07-17')
  assert.equal(financeArchive.body.records.length, 1)
  assert.equal(financeArchive.body.records[0].topic, 'finance')
} finally {
  await rm(workerDir, { recursive: true, force: true })
}

console.log('knowledge API verification passed')
