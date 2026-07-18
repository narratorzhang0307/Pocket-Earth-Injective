import assert from 'node:assert/strict'
import { KnowledgeHarnessError, runKnowledgeTopicAgent } from '../knowledge/agent-harness.mjs'
import { claimForSignal, evidenceQueryForSignal, isOpaqueDiscoverySource, parseBingNewsRss, rankNewsSources, selectIndependentSources } from '../knowledge/evidence.mjs'
import { KNOWLEDGE_TOPICS, PUBLIC_TOPIC_KEYS } from '../knowledge/topics.mjs'

const fixedNow = () => new Date('2026-07-18T06:00:00.000Z')
const current = 'Fri, 18 Jul 2026 04:00:00 GMT'

assert.equal(PUBLIC_TOPIC_KEYS.length, 8)
assert.equal(new Set(PUBLIC_TOPIC_KEYS.map((key) => KNOWLEDGE_TOPICS[key].agentId)).size, 8)
assert.equal(new Set(PUBLIC_TOPIC_KEYS.map((key) => KNOWLEDGE_TOPICS[key].policy)).size, 1)
for (const key of PUBLIC_TOPIC_KEYS) {
  const config = KNOWLEDGE_TOPICS[key]
  assert.match(config.agentId, new RegExp(`knowledge-scout\\.${key}\\.v1`))
  assert.equal(config.queries.length, 2)
  assert.equal(config.policy.minimumIndependentSources, 2)
  assert.equal(config.policy.maxVerifiedRecords, 2)
}

const sourceFixture = [
  { title: 'Primary report', url: 'https://nature.com/articles/current', publisher: 'Nature', publishedAt: current, snippet: 'AI research current report' },
  { title: 'Independent report', url: 'https://reuters.com/world/current', publisher: 'Reuters', publishedAt: current, snippet: 'AI research current report' },
  { title: 'Same publisher copy', url: 'https://reuters.com/world/copy', publisher: 'Reuters', publishedAt: current, snippet: 'AI research current copy' },
  { title: 'Opaque discovery result', url: 'https://news.google.com/rss/articles/opaque', publisher: 'Nature', publishedAt: current, snippet: 'AI research', discoveryOnly: true },
  { title: 'Low-quality repost', url: 'https://aol.com/articles/repost', publisher: 'AOL', publishedAt: current, snippet: 'AI research current report' },
  { title: 'Stale story', url: 'https://science.org/stale', publisher: 'Science', publishedAt: '2026-06-01T00:00:00.000Z', snippet: 'AI research' },
]

assert.equal(isOpaqueDiscoverySource(sourceFixture[3]), true)
const parsedBing = parseBingNewsRss(`<?xml version="1.0"?><rss><channel><item><title>Direct report</title><link>http://www.bing.com/news/apiclick.aspx?url=https%3A%2F%2Fwww.reuters.com%2Fworld%2Fdirect</link><description>Report</description><pubDate>${current}</pubDate><News:Source>Reuters</News:Source></item></channel></rss>`)
assert.equal(parsedBing[0].url, 'https://www.reuters.com/world/direct')
assert.match(parsedBing[0].discoveryUrl, /bing\.com\/news\/apiclick/)
assert.equal(evidenceQueryForSignal('Opinion | Important model release - Example News'), 'Important model release')
assert.equal(
  evidenceQueryForSignal("China's Moonshot AI Unveils Kimi Model, Threatening America's Lead - Example News"),
  'China Moonshot AI Kimi Model',
)
assert.equal(
  claimForSignal("China's Moonshot AI Unveils Kimi Model, Threatening America's Lead - Example News"),
  "China's Moonshot AI Unveils Kimi Model",
)
const ranked = rankNewsSources(sourceFixture, KNOWLEDGE_TOPICS.ai, { query: 'AI research', now: fixedNow(), limit: 10 })
assert.equal(ranked.some((source) => source.discoveryOnly), false)
assert.equal(ranked.some((source) => source.publisherDomain === 'aol.com'), false)
assert.equal(ranked.some((source) => source.title === 'Stale story'), false)
const independent = selectIndependentSources(sourceFixture, KNOWLEDGE_TOPICS.ai, { query: 'AI research', now: fixedNow(), limit: 10 })
assert.deepEqual(independent.map((source) => source.publisherDomain).sort(), ['nature.com', 'reuters.com'])

const signals = Array.from({ length: 4 }, (_, index) => ({
  title: `Current AI signal ${index + 1}`,
  url: `https://example.org/signal-${index + 1}`,
  publisher: 'Signal index',
  publishedAt: current,
}))

let verificationCalls = 0
const result = await runKnowledgeTopicAgent({
  topic: 'ai',
  date: '2026-07-18',
  now: fixedNow,
  discover: async () => signals,
  gatherEvidence: async () => sourceFixture,
  verify: async (topic, claim, sources) => {
    verificationCalls += 1
    return {
      id: `verified-${verificationCalls}`,
      topic,
      createdAt: fixedNow().toISOString(),
      mode: 'live',
      claim,
      verdict: 'supported',
      truthScore: 91,
      confidence: 88,
      summary: 'Fixture verified by two independent sources.',
      sources,
      trace: [],
    }
  },
  assemble: async (topic, date, records) => ({
    mode: 'live', topic, generatedAt: fixedNow().toISOString(), records,
    edition: { date, editionRoot: `0x${'a'.repeat(64)}`, anchor: null },
  }),
})

assert.equal(result.records.length, 2)
assert.equal(result.harness.state, 'complete')
assert.equal(result.harness.counters.discoveryCalls, 1)
assert.equal(result.harness.counters.evidenceCalls, 2)
assert.equal(result.harness.counters.verificationCalls, 2)
assert.equal(result.reviewGate.status, 'draft_review_required')
assert.equal(result.reviewGate.sourceChecksPassed, true)
assert.equal(result.reviewGate.eligibleForChronicle, false)
assert.equal(result.reviewGate.automaticChainWrite, false)
assert.ok(result.harness.events.some((item) => item.stage === 'source-guard' && item.status === 'passed'))
assert.ok(result.harness.events.some((item) => item.stage === 'receipt-keeper'))

await assert.rejects(
  runKnowledgeTopicAgent({
    topic: 'ai',
    date: '2026-07-18',
    now: fixedNow,
    discover: async () => signals,
    gatherEvidence: async () => sourceFixture,
    verify: async () => { throw new Error('fixture_verifier_down') },
    assemble: async () => { throw new Error('assemble_must_not_run') },
  }),
  (error) => {
    assert.ok(error instanceof KnowledgeHarnessError)
    assert.match(error.code, /knowledge_budget_exhausted:verificationCalls/)
    assert.equal(error.run.state, 'failed')
    assert.equal(error.run.counters.verificationCalls, 2)
    return true
  },
)

console.log('OK one shared Harness isolates eight topic agents, filters stale/opaque evidence, enforces independent sources and stops at hard budgets.')
