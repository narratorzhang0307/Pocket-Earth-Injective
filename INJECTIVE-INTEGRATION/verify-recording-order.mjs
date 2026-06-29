// Verify the reviewer recording order returned by the public evidence API.
// Usage: npm run verify:recording-order
import { readFile } from 'node:fs/promises'
import { handleInjective } from '../injective-service.mjs'
import { FLEET_AGENTS, PROOF_OWNER, REVIEW_LINKS, TIMELINE_EVENTS, scanUrlForAddress, scanUrlForAgent } from './chain-proof-data.mjs'

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function assertEqual(label, actual, expected) {
  if (String(actual) !== String(expected)) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

async function callInjectiveApi(path) {
  let statusCode = 0
  let body = ''
  const req = { method: 'GET' }
  const res = {
    writeHead(code) { statusCode = code },
    end(chunk) { body += chunk || '' },
  }
  await handleInjective(req, res, new URL(`http://localhost${path}`), { network: 'testnet' })
  assertEqual(`${path} HTTP status`, statusCode, 200)
  const payload = JSON.parse(body)
  assertTrue(`${path} has no api error`, !payload.error)
  return payload
}

async function assertHttpOk(label, url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`)
    console.log(`OK ${label}: HTTP ${response.status}`)
  } finally {
    clearTimeout(timer)
  }
}

const sdkWarnings = []
const originalWarn = console.warn
const originalError = console.error
console.warn = (...args) => {
  const msg = args.join(' ')
  if (msg.includes('Failed to fetch card')) sdkWarnings.push(msg)
  else originalWarn(...args)
}
console.error = (...args) => {
  const msg = args.join(' ')
  if (msg.includes('Failed to fetch card')) sdkWarnings.push(msg)
  else originalError(...args)
}

try {
const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
const evidence = await callInjectiveApi('/api/injective?tool=get-chain-evidence')
const order = evidence.recordingOrder
const reviewLinkByKey = new Map(REVIEW_LINKS.map((link) => [link.key, link]))

assertTrue('recordingOrder array', Array.isArray(order))
assertEqual('recordingOrder count', order.length, 6)

for (const [index, item] of order.entries()) {
  assertEqual(`recording step ${index + 1} number`, item.step, index + 1)
  assertTrue(`recording step ${index + 1} label`, Boolean(item.label))
}

const [agentPage, walletPage, evidenceApi, listAgentsApi, timelineApi, plazaSmoke] = order
assertEqual('recording step 1 type', agentPage.type, 'blockscout')
assertEqual('recording step 1 url', agentPage.url, scanUrlForAgent(43))
assertEqual('recording step 1 review link', agentPage.url, reviewLinkByKey.get('frost-agent-43')?.url)
await assertHttpOk('recording step 1 Blockscout page', agentPage.url)

assertEqual('recording step 2 type', walletPage.type, 'blockscout')
assertEqual('recording step 2 url', walletPage.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('recording step 2 review link', walletPage.url, reviewLinkByKey.get('owner-wallet')?.url)
await assertHttpOk('recording step 2 Blockscout page', walletPage.url)

assertEqual('recording step 3 type', evidenceApi.type, 'api')
assertEqual('recording step 3 path', evidenceApi.path, '/api/injective?tool=get-chain-evidence')
const evidenceAgain = await callInjectiveApi(evidenceApi.path)
assertEqual('recording step 3 evidence ok', evidenceAgain.ok, true)
assertEqual('recording step 3 evidence publicOnly', evidenceAgain.publicOnly, true)

assertEqual('recording step 4 type', listAgentsApi.type, 'api')
assertEqual('recording step 4 path', listAgentsApi.path, evidence.verification?.listAgentsApi)
const fleetPayload = await callInjectiveApi(listAgentsApi.path)
assertTrue('recording step 4 agents array', Array.isArray(fleetPayload.agents))
for (const expected of FLEET_AGENTS) {
  assertTrue(`recording step 4 includes agent ${expected.id}`, fleetPayload.agents.some((agent) => Number(agent.agentId) === Number(expected.id)))
}

assertEqual('recording step 5 type', timelineApi.type, 'api')
assertEqual('recording step 5 path', timelineApi.path, evidence.verification?.walletTimelineApi)
const timelinePayload = await callInjectiveApi(timelineApi.path)
assertEqual('recording step 5 timeline ok', timelinePayload.ok, true)
assertTrue('recording step 5 timeline events array', Array.isArray(timelinePayload.events))
assertEqual('recording step 5 timeline event count', timelinePayload.events.length, TIMELINE_EVENTS.length)
assertEqual('recording step 5 first event', timelinePayload.events[0]?.hash, TIMELINE_EVENTS[0].hash)
assertEqual('recording step 5 final event', timelinePayload.events.at(-1)?.hash, TIMELINE_EVENTS.at(-1).hash)

assertEqual('recording step 6 type', plazaSmoke.type, 'command')
assertEqual('recording step 6 command', plazaSmoke.command, 'npm run verify:plaza')
assertTrue('recording step 6 npm script exists', Boolean(packageJson.scripts?.['verify:plaza']))

const publicText = JSON.stringify(order)
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB']) {
  assertTrue(`recordingOrder omits ${forbidden}`, !publicText.includes(forbidden))
}

if (sdkWarnings.length) {
  console.log('\nNOTE Agent SDK card fetch warnings were suppressed; recording-order fields were verified directly.')
}

console.log('\nOK reviewer recording order can be followed from Blockscout pages through product APIs to the plaza smoke.')
} finally {
  console.warn = originalWarn
  console.error = originalError
}
