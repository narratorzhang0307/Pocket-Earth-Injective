import assert from 'node:assert/strict'
import { buildPocketPodcast, POCKET_PODCAST_SCHEMA } from '../knowledge/podcast-agent.mjs'

const record = {
  id: 'verified-ai-1',
  topic: 'ai',
  claim: '一条已核验的 AI 公共知识。',
  summary: '摘要只复述核验记录。',
  verdict: 'supported',
  truthScore: 88,
  confidence: 84,
  commitment: { recordHash: `0x${'1'.repeat(64)}` },
  sources: [
    { title: 'Source A', publisher: 'Publisher A', publishedAt: '2026-07-19', url: 'https://a.example/item' },
    { title: 'Source B', publisher: 'Publisher B', publishedAt: '2026-07-19', url: 'https://b.example/item' },
  ],
}

const artifact = buildPocketPodcast({
  date: '2026-07-19',
  generatedAt: '2026-07-19T00:10:00.000Z',
  bundles: [{ topic: 'ai', memoryTier: 'L2-short-term-cache', records: [record], edition: { editionRoot: `0x${'2'.repeat(64)}`, anchor: null } }],
})

assert.equal(artifact.schema, POCKET_PODCAST_SCHEMA)
assert.equal(artifact.state, 'ready')
assert.equal(artifact.segments.length, 1)
assert.equal(artifact.segments[0].claim, record.claim)
assert.equal(artifact.segments[0].sources.length, 2)
assert.match(artifact.script, /完整来源、核验记录/)
assert.equal(artifact.run.events.at(-1).stage, 'receipt')

const rejected = buildPocketPodcast({
  date: '2026-07-19',
  bundles: [{ topic: 'ai', records: [{ ...record, id: 'candidate', verdict: 'insufficient', sources: [record.sources[0]] }] }],
})
assert.equal(rejected.state, 'waiting-for-verified-knowledge')
assert.equal(rejected.segments.length, 0)

process.stdout.write(`${JSON.stringify({ ok: true, podcastId: artifact.podcastId, segments: artifact.segments.length })}\n`)
