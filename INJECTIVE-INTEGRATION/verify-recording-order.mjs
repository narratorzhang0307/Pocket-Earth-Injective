// Verify the reviewer recording order returned by the public evidence API.
// Usage: npm run verify:recording-order
import { readFile } from 'node:fs/promises'
import { handleInjective } from '../injective-service.mjs'
import { BUILDER_CODE, FLEET_AGENTS, IDENTITY_REGISTRY, INJECTIVE_TESTNET_CHAIN_ID, PROOF_OWNER, REGISTRY_MINT_EVENTS, REVIEW_LINKS, INTEGRATION_REPOSITORY_URL, TIMELINE_EVENTS, scanUrlForAddress, scanUrlForAgent, scanUrlForTx } from './chain-proof-data.mjs'

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

function assertEqualLower(label, actual, expected) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

function assertFocusIncludes(label, item, expected) {
  assertTrue(`${label} evidenceFocus array`, Array.isArray(item.evidenceFocus))
  const text = item.evidenceFocus.join(' | ')
  assertTrue(`${label} evidenceFocus includes ${expected}`, text.includes(expected))
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
assertEqual('recordingOrder count', order.length, 7)

for (const [index, item] of order.entries()) {
  assertEqual(`recording step ${index + 1} number`, item.step, index + 1)
  assertTrue(`recording step ${index + 1} label`, Boolean(item.label))
  assertTrue(`recording step ${index + 1} evidenceFocus has items`, Array.isArray(item.evidenceFocus) && item.evidenceFocus.length >= 2)
}

const [agentPage, walletPage, evidenceApi, agentProofApi, listAgentsApi, timelineApi, plazaSmoke] = order
assertEqual('recording step 1 type', agentPage.type, 'blockscout')
assertEqual('recording step 1 url', agentPage.url, scanUrlForAgent(43))
assertEqual('recording step 1 review link', agentPage.url, reviewLinkByKey.get('frost-agent-43')?.url)
assertFocusIncludes('recording step 1', agentPage, 'agentId 43')
assertFocusIncludes('recording step 1', agentPage, 'owner')
assertFocusIncludes('recording step 1', agentPage, 'builderCode')
await assertHttpOk('recording step 1 Blockscout page', agentPage.url)

assertEqual('recording step 2 type', walletPage.type, 'blockscout')
assertEqual('recording step 2 url', walletPage.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('recording step 2 review link', walletPage.url, reviewLinkByKey.get('owner-wallet')?.url)
assertFocusIncludes('recording step 2', walletPage, 'same wallet')
assertFocusIncludes('recording step 2', walletPage, 'registration')
assertFocusIncludes('recording step 2', walletPage, 'handshake')
await assertHttpOk('recording step 2 Blockscout page', walletPage.url)

assertEqual('recording step 3 type', evidenceApi.type, 'api')
assertEqual('recording step 3 path', evidenceApi.path, '/api/injective?tool=get-chain-evidence')
assertFocusIncludes('recording step 3', evidenceApi, 'registryMintSummary')
assertFocusIncludes('recording step 3', evidenceApi, 'timelineSummary')
assertFocusIncludes('recording step 3', evidenceApi, 'sourceControl')
const evidenceAgain = await callInjectiveApi(evidenceApi.path)
assertEqual('recording step 3 evidence ok', evidenceAgain.ok, true)
assertEqual('recording step 3 evidence publicOnly', evidenceAgain.publicOnly, true)

assertEqual('recording step 4 type', agentProofApi.type, 'api')
assertEqual('recording step 4 path', agentProofApi.path, evidence.verification?.agentProofApi)
assertFocusIncludes('recording step 4', agentProofApi, 'agentId 43')
assertFocusIncludes('recording step 4', agentProofApi, 'sourceControl')
const proofPayload = await callInjectiveApi(agentProofApi.path)
assertEqual('recording step 4 proof ok', proofPayload.ok, true)
assertEqual('recording step 4 proof chainId', proofPayload.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('recording step 4 proof publicOnly', proofPayload.publicOnly, true)
assertEqual('recording step 4 proof agentId', proofPayload.agent?.agentId, 43)
assertEqual('recording step 4 proof owner', proofPayload.agent?.owner, PROOF_OWNER)
assertEqual('recording step 4 proof builderCode', proofPayload.agent?.builderCode, BUILDER_CODE)
assertEqual('recording step 4 proof registry', proofPayload.agent?.registry, IDENTITY_REGISTRY)
assertEqual('recording step 4 proof mint transaction', proofPayload.agent?.mintTransactionHash, REGISTRY_MINT_EVENTS[0].transactionHash)
assertEqual('recording step 4 proof source repository', proofPayload.sourceControl?.repository, INTEGRATION_REPOSITORY_URL)
assertTrue('recording step 4 proof reviewPath array', Array.isArray(proofPayload.reviewPath) && proofPayload.reviewPath.length >= 3)

assertEqual('recording step 5 type', listAgentsApi.type, 'api')
assertEqual('recording step 5 path', listAgentsApi.path, evidence.verification?.listAgentsApi)
assertFocusIncludes('recording step 5', listAgentsApi, 'builderCode=pocket-earth')
assertFocusIncludes('recording step 5', listAgentsApi, 'agentId 43-47')
const fleetPayload = await callInjectiveApi(listAgentsApi.path)
assertTrue('recording step 5 agents array', Array.isArray(fleetPayload.agents))
for (const expected of FLEET_AGENTS) {
  assertTrue(`recording step 5 includes agent ${expected.id}`, fleetPayload.agents.some((agent) => Number(agent.agentId) === Number(expected.id)))
}

assertEqual('recording step 6 type', timelineApi.type, 'api')
assertEqual('recording step 6 path', timelineApi.path, evidence.verification?.walletTimelineApi)
assertFocusIncludes('recording step 6', timelineApi, 'summary')
assertFocusIncludes('recording step 6', timelineApi, `chainId ${INJECTIVE_TESTNET_CHAIN_ID}`)
assertFocusIncludes('recording step 6', timelineApi, 'allSucceeded')
assertFocusIncludes('recording step 6', timelineApi, 'handshake')
const timelinePayload = await callInjectiveApi(timelineApi.path)
assertEqual('recording step 6 timeline ok', timelinePayload.ok, true)
assertEqual('recording step 6 timeline chainId', timelinePayload.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertTrue('recording step 6 timeline summary object', !!timelinePayload.summary && typeof timelinePayload.summary === 'object')
assertEqual('recording step 6 timeline summary owner', timelinePayload.summary.owner, PROOF_OWNER)
assertEqual('recording step 6 timeline summary event count', timelinePayload.summary.eventCount, TIMELINE_EVENTS.length)
assertEqual('recording step 6 timeline summary all from owner', timelinePayload.summary.allFromOwner, true)
assertEqual('recording step 6 timeline summary all succeeded', timelinePayload.summary.allSucceeded, true)
assertEqual('recording step 6 timeline summary first block', timelinePayload.summary.firstBlock, TIMELINE_EVENTS[0].blockNumber)
assertEqual('recording step 6 timeline summary last block', timelinePayload.summary.lastBlock, TIMELINE_EVENTS.at(-1).blockNumber)
assertEqual('recording step 6 timeline summary first timestamp', timelinePayload.summary.firstTimestamp, TIMELINE_EVENTS[0].timestamp)
assertEqual('recording step 6 timeline summary last timestamp', timelinePayload.summary.lastTimestamp, TIMELINE_EVENTS.at(-1).timestamp)
assertEqual('recording step 6 timeline summary last role', timelinePayload.summary.lastRole, TIMELINE_EVENTS.at(-1).role)
assertTrue('recording step 6 timeline events array', Array.isArray(timelinePayload.events))
assertEqual('recording step 6 timeline event count', timelinePayload.events.length, TIMELINE_EVENTS.length)
for (const expected of TIMELINE_EVENTS) {
  const actual = timelinePayload.events.find((event) => String(event.hash).toLowerCase() === String(expected.hash).toLowerCase())
  assertTrue(`recording step 6 ${expected.role} event exists`, Boolean(actual))
  assertEqualLower(`recording step 6 ${expected.role} from`, actual.from, PROOF_OWNER)
  assertEqual(`recording step 6 ${expected.role} status`, actual.status, 'success')
  assertEqual(`recording step 6 ${expected.role} blockNumber`, actual.blockNumber, expected.blockNumber)
  assertEqual(`recording step 6 ${expected.role} timestamp`, actual.timestamp, expected.timestamp)
  assertEqual(`recording step 6 ${expected.role} scanUrl`, actual.scanUrl, scanUrlForTx(expected.hash))
}
assertEqual('recording step 6 first event', timelinePayload.events[0]?.hash, TIMELINE_EVENTS[0].hash)
assertEqual('recording step 6 final event', timelinePayload.events.at(-1)?.hash, TIMELINE_EVENTS.at(-1).hash)

assertEqual('recording step 7 type', plazaSmoke.type, 'command')
assertEqual('recording step 7 command', plazaSmoke.command, 'npm run verify:plaza')
assertFocusIncludes('recording step 7', plazaSmoke, 'public-plaza')
assertFocusIncludes('recording step 7', plazaSmoke, 'agent-plaza')
assertTrue('recording step 7 npm script exists', Boolean(packageJson.scripts?.['verify:plaza']))

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
