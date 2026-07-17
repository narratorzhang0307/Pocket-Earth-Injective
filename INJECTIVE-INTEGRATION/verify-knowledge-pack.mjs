import assert from 'node:assert/strict'
import { createDailyKnowledgeService } from '../knowledge/daily-service.mjs'
import { hashValue, verifyMerkleProof } from '../src/app/lib/chronicle/kernel.mjs'

function responseCapture() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    writeHead(code, headers = {}) { this.statusCode = code; this.headers = headers },
    end(chunk = '') { this.body += String(chunk || '') },
  }
}

const service = createDailyKnowledgeService({ env: {} })
const res = responseCapture()
await service.handle(
  { method: 'GET', headers: {}, socket: { remoteAddress: '127.0.0.1' } },
  res,
  new URL('http://localhost/api/knowledge?tool=pack&date=2026-07-17'),
)
assert.equal(res.statusCode, 200)
assert.equal(res.headers['content-type'], 'application/json; charset=utf-8')
assert.match(res.headers['content-disposition'], /pocket-earth-public-knowledge-2026-07-17\.json/)
const pack = JSON.parse(res.body)
assert.equal(pack.schema, 'pocket-earth-public-knowledge-pack/v1')
assert.match(pack.packageHash, /^0x[0-9a-f]{64}$/)
assert.equal(pack.edition.date, '2026-07-17')
assert.equal(pack.edition.factCount, 2)
assert.equal(pack.edition.revision, 2)
assert.equal(pack.edition.editionRoot, '0x6e62dcc3fe00495d15d2a7600a5dff6a9f396b85f641fd5316ff69b8327491da')
assert.equal(pack.edition.anchor.chainId, 1439)
assert.equal(pack.records.length, 2)
for (const entry of pack.records) {
  assert.equal(entry.verified, true)
  assert.equal(await verifyMerkleProof(entry.record.commitment.recordHash, entry.proof, pack.edition.factsRoot), true)
}
const tamperedHash = `0x${'f'.repeat(64)}`
assert.equal(await verifyMerkleProof(tamperedHash, pack.records[0].proof, pack.edition.factsRoot), false)
const expectedPackageHash = await hashValue({
  schema: pack.schema,
  editionRoot: pack.edition.editionRoot,
  records: pack.records.map((entry) => ({ recordHash: entry.record.commitment.recordHash, proof: entry.proof })),
})
assert.equal(pack.packageHash, expectedPackageHash)
assert.equal(pack.importPolicy.mode, 'public-read-only')
assert.match(pack.importPolicy.verification, /Injective daily edition anchor/)
for (const forbidden of ['privateKey', 'INJ_PRIVATE_KEY', 'raw private memory', 'precise location']) {
  assert.ok(!res.body.includes(forbidden), `knowledge pack leaks forbidden field ${forbidden}`)
}

console.log('OK downloadable public knowledge pack contains two self-verifying records and matches Injective Chronicle revision 2.')
