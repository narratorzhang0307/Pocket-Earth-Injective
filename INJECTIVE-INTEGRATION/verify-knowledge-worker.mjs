import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { nextDailyRun, runKnowledgeCycle } from '../knowledge/daily-worker.mjs'
import { ANCHORED_TOPIC_KEYS, PUBLIC_TOPIC_KEYS } from '../knowledge/topics.mjs'

const outputDir = await mkdtemp(join(tmpdir(), 'pocket-earth-knowledge-'))
try {
  const manifest = await runKnowledgeCycle({
    env: {},
    outputDir,
    date: '2026-07-17',
    topics: PUBLIC_TOPIC_KEYS,
    now: new Date('2026-07-17T00:00:00.000Z'),
  })
  assert.equal(manifest.schema, 'pocket-earth-knowledge-worker/v1')
  assert.equal(manifest.state, 'complete')
  assert.equal(manifest.summary.requested, 5)
  assert.equal(manifest.summary.pending, 0)
  assert.equal(manifest.summary.failed, 0)
  assert.equal(manifest.summary.ready, 2)
  assert.equal(manifest.summary.skipped, 3)
  assert.equal(manifest.chainPolicy.automaticWrite, false)
  assert.deepEqual(manifest.topics.filter((item) => item.status === 'ready').map((item) => item.topic), ANCHORED_TOPIC_KEYS)

  const status = JSON.parse(await readFile(join(outputDir, 'status.json'), 'utf8'))
  assert.equal(status.date, '2026-07-17')
  assert.equal(status.state, 'complete')
  for (const topic of PUBLIC_TOPIC_KEYS) {
    const snapshot = JSON.parse(await readFile(join(outputDir, '2026-07-17', `${topic}.json`), 'utf8'))
    assert.equal(snapshot.topic, topic)
    assert.equal(snapshot.schema, manifest.schema)
    if (ANCHORED_TOPIC_KEYS.includes(topic)) {
      assert.equal(snapshot.records.length, 1)
      assert.match(snapshot.edition.editionRoot, /^0x[0-9a-f]{64}$/)
    } else {
      assert.equal(snapshot.records.length, 0)
      assert.equal(snapshot.error, 'live_verification_provider_required')
    }
  }

  assert.equal(nextDailyRun(new Date('2026-07-17T00:09:00.000Z'), 0, 10).toISOString(), '2026-07-17T00:10:00.000Z')
  assert.equal(nextDailyRun(new Date('2026-07-17T00:11:00.000Z'), 0, 10).toISOString(), '2026-07-18T00:10:00.000Z')
  const ecosystem = await readFile(new URL('../deploy/online/injective/ecosystem.config.cjs', import.meta.url), 'utf8')
  assert.match(ecosystem, /KNOWLEDGE_WORKER_DAEMON:\s*'1'/)
  console.log('OK knowledge worker isolates five domains, writes atomic snapshots and never performs automatic chain writes.')
} finally {
  await rm(outputDir, { recursive: true, force: true })
}
