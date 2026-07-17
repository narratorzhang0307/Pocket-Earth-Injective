import assert from 'node:assert/strict'
import {
  ZERO_ROOT,
  buildDailyEditions,
  buildFactCommitment,
  buildMerkleProof,
  merkleRoot,
  normalizeClaimStatement,
  sha256,
  stableStringify,
  verifyMerkleProof,
} from '../src/app/lib/chronicle/kernel.mjs'

assert.equal(normalizeClaimStatement('北京 今天下雨。 '), normalizeClaimStatement('北京今天下雨'))
assert.equal(stableStringify({ b: 2, a: 1 }), stableStringify({ a: 1, b: 2 }))

for (const values of [['one'], ['one', 'two'], ['one', 'two', 'three']]) {
  const leaves = await Promise.all(values.map(sha256))
  const root = await merkleRoot(leaves)
  for (let index = 0; index < leaves.length; index++) {
    const proof = await buildMerkleProof(leaves, index)
    assert.equal(await verifyMerkleProof(leaves[index], proof, root), true)
    assert.equal(await verifyMerkleProof(await sha256(`tampered-${index}`), proof, root), false)
  }
}

const vectorLeaves = await Promise.all(['alpha', 'beta', 'gamma'].map(sha256))
assert.equal(await merkleRoot(vectorLeaves), '0xd5a2e70f7e0f5a8eb8e789df63b696f1b9bdd2a48c54ee99b159b28c753f3406')

function result(id, createdAt, claim) {
  return {
    id,
    createdAt,
    claim,
    verdict: 'supported',
    truthScore: 82,
    confidence: 80,
    scoring: { formula: '55% model consensus + 45% source-weighted evidence' },
    sources: [{ id: `${id}-source`, title: 'Source', url: `https://example.com/${id}`, publisher: 'Example', publishedAt: createdAt.slice(0, 10), snippet: claim, stance: 'support', reliability: 85 }],
    trace: [{ stage: 'test', provider: 'fixture', model: null, requestId: null, startedAt: createdAt, durationMs: 0, status: 'preview' }],
  }
}

const first = result('first', '2026-07-16T08:00:00.000Z', 'First claim')
const second = result('second', '2026-07-16T09:00:00.000Z', 'Second claim')
const next = result('next', '2026-07-17T08:00:00.000Z', 'Next claim')
const facts = []
for (const item of [first, second, next]) {
  facts.push({ id: item.id, savedAt: item.createdAt, claim: item.claim, canonicalClaim: item.claim, verdict: item.verdict, truthScore: item.truthScore, commitment: await buildFactCommitment(item, item.claim) })
}
const editions = await buildDailyEditions(facts)
assert.equal(editions.length, 2)
assert.equal(editions[0].previousEditionRoot, ZERO_ROOT)
assert.equal(editions[1].previousEditionRoot, editions[0].editionRoot)
assert.deepEqual((await buildDailyEditions([...facts].reverse())).map((item) => item.editionRoot), editions.map((item) => item.editionRoot))

console.log('chronicle kernel verification passed')

