import assert from 'node:assert/strict'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createFrostFeed } from '../frost-feed-service.mjs'
import { handleInjective } from '../injective-service.mjs'

const token = 'hardware-handoff-test-token'
const clientPath = 'hardware/frost-buddy/raspi/frost_pi_feed_client.py'
const clientSource = readFileSync(clientPath, 'utf8')
const handoffDoc = readFileSync('hardware/frost-buddy/raspi/LIVE-HANDOFF.md', 'utf8')
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const scratch = mkdtempSync(join(tmpdir(), 'frost-handoff-'))
const cursorFile = join(scratch, 'cursor')
const originalWarn = console.warn
console.warn = (...args) => {
  if (!String(args[0] || '').startsWith('[AgentSDK] Failed to fetch card')) originalWarn(...args)
}

function runClient(baseUrl, suppliedToken = token) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.PYTHON || 'python3', [clientPath, '--once', '--cursor-file', cursorFile], {
      cwd: process.cwd(),
      env: { ...process.env, FROST_FEED_URL: `${baseUrl}/api/frost-feed`, FROST_FEED_TOKEN: suppliedToken },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.once('error', reject)
    child.once('close', (code) => resolve({ code, stdout, stderr }))
  })
}

const feed = createFrostFeed({ token, injectiveConfig: { network: 'testnet' } })
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  try {
    if (url.pathname === '/api/frost-feed') return await feed.handle(req, res, url)
    if (url.pathname === '/api/injective') return await handleInjective(req, res, url, { network: 'testnet' })
    res.writeHead(404); res.end()
  } catch (error) {
    res.writeHead(500, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: String(error?.message || error) }))
  }
})

try {
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const port = server.address().port
  const baseUrl = `http://127.0.0.1:${port}`

  const liveResponse = await fetch(`${baseUrl}/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47&enrich=0`)
  assert.equal(liveResponse.status, 200)
  const livePayload = await liveResponse.json()
  assert.equal(livePayload.sdk, true)
  assert.deepEqual(livePayload.agents.map((agent) => Number(agent.agentId)).sort((a, b) => a - b), [43, 44, 45, 46, 47])

  const unauthorized = await fetch(`${baseUrl}/api/frost-feed`, { headers: { authorization: 'Bearer wrong-token' } })
  assert.equal(unauthorized.status, 401)

  const first = await runClient(baseUrl)
  assert.equal(first.code, 0, first.stderr)
  assert.equal(first.stderr, '')
  const actions = first.stdout.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line))
  assert.deepEqual(actions.map((action) => action.type), ['state', 'tts', 'display'])
  assert.equal(actions[0].state, 'attention')
  assert.equal(actions[1].text, 'Frost 在 Injective 链上遇见了 5 个 Pocket Earth agent。')
  assert.deepEqual(actions[2].agentIds, ['43', '44', '45', '46', '47'])
  assert.match(actions[2].scanUrl, /^https:\/\/testnet\.blockscout\.injective\.network\//)
  assert.doesNotMatch(clientSource, /Injective 链上遇见了/)

  const firstCursor = readFileSync(cursorFile, 'utf8').trim()
  assert.match(Buffer.from(firstCursor, 'base64url').toString('utf8'), /^frost:\d+$/)
  const replay = await runClient(baseUrl)
  assert.equal(replay.code, 0, replay.stderr)
  assert.equal(replay.stdout, '')
  assert.equal(readFileSync(cursorFile, 'utf8').trim(), firstCursor)

  const rejected = await runClient(baseUrl, 'wrong-token')
  assert.equal(rejected.code, 2)
  assert.match(rejected.stderr, /HTTP 401/)
  assert.doesNotMatch(rejected.stderr, /wrong-token|hardware-handoff-test-token/)

  for (const snippet of [
    'FROST_FEED_URL',
    'FROST_FEED_TOKEN',
    'frost_pi_feed_client.py',
    'state/tts/display',
    'x-frost-next-cursor',
    'server-side',
    'Claude',
    'Injective testnet',
  ]) assert.ok(handoffDoc.includes(snippet), `handoff doc missing ${snippet}`)
  assert.equal(packageJson.scripts['verify:hardware-handoff'], 'node INJECTIVE-INTEGRATION/verify-hardware-handoff.mjs')

  console.log('OK real HTTP handoff authenticates the Pi and reads agentId 43-47 from Injective testnet.')
  console.log('OK server-owned speak becomes state/tts/display actions without entering the Pi client template.')
  console.log('OK persisted cursor suppresses replay and never exposes the device token.')
} finally {
  console.warn = originalWarn
  await new Promise((resolve) => server.close(resolve))
  rmSync(scratch, { recursive: true, force: true })
}
