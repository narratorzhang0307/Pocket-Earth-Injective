import assert from 'node:assert/strict'
import { access, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { nextDailyRun, runKnowledgeCycle } from '../knowledge/daily-worker.mjs'
import { ANCHORED_TOPIC_KEYS, PUBLIC_TOPIC_KEYS } from '../knowledge/topics.mjs'

const outputDir = await mkdtemp(join(tmpdir(), 'pocket-earth-knowledge-'))
try {
  await mkdir(join(outputDir, '2026-07-10'))
  await mkdir(join(outputDir, '2026-07-11'))
  await mkdir(join(outputDir, 'worker-notes'))
  const manifest = await runKnowledgeCycle({
    env: {},
    outputDir,
    date: '2026-07-17',
    topics: PUBLIC_TOPIC_KEYS,
    now: new Date('2026-07-17T00:00:00.000Z'),
  })
  assert.equal(manifest.schema, 'pocket-earth-knowledge-worker/v1')
  assert.equal(manifest.state, 'complete')
  assert.equal(manifest.summary.requested, 8)
  assert.equal(manifest.summary.pending, 0)
  assert.equal(manifest.summary.failed, 0)
  assert.equal(manifest.summary.ready, 2)
  assert.equal(manifest.summary.skipped, 6)
  assert.equal(manifest.chainPolicy.automaticWrite, false)
  assert.deepEqual(manifest.reviewedArchive, { state: 'preserved', date: '2026-07-17', revision: 2 })
  assert.equal(manifest.retention.state, 'complete')
  assert.equal(manifest.retention.keepDays, 7)
  assert.equal(manifest.retention.windowStart, '2026-07-11')
  assert.deepEqual(manifest.retention.removed, ['2026-07-10'])
  await assert.rejects(access(join(outputDir, '2026-07-10')))
  await access(join(outputDir, '2026-07-11'))
  await access(join(outputDir, 'worker-notes'))
  const archived = JSON.parse(await readFile(join(outputDir, 'editions', '2026-07-17-r2.json'), 'utf8'))
  assert.equal(archived.schema, 'pocket-earth-reviewed-knowledge-archive/v1')
  assert.equal(archived.state, 'reviewed-and-anchored')
  assert.equal(archived.records.length, 2)
  assert.equal(archived.retentionPolicy.lifetime, 'permanent')
  assert.ok(!JSON.stringify(archived).includes('harness'))
  assert.ok(!JSON.stringify(archived).includes('models'))
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
  assert.match(ecosystem, /KNOWLEDGE_TOPICS:\s*'ai,technology,finance,climate,science,health,culture,policy'/)
  assert.match(ecosystem, /KNOWLEDGE_RETENTION_DAYS:\s*'7'/)
  console.log('OK knowledge worker isolates eight domains, keeps a seven-day cache, writes atomic snapshots and never performs automatic chain writes.')
} finally {
  await rm(outputDir, { recursive: true, force: true })
}
