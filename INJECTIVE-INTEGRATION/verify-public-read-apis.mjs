// Verify the judge-facing publicReadApis manifest and each public read-only endpoint.
// Usage: npm run verify:public-apis
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  FLEET_AGENTS,
  HARDWARE_BRIDGE_PROOF,
  IDENTITY_REGISTRY,
  INJECTIVE_TESTNET_CHAIN_ID,
  MARKET_LANDSCAPE_BOUNDARY,
  PROOF_OWNER,
  REGISTRY_MINT_EVENTS,
  ROADMAP_SAFETY_BOUNDARY,
  INTEGRATION_REPOSITORY_URL,
  TIMELINE_EVENTS,
  scanUrlForAgent,
  scanUrlForRegistry,
} from './chain-proof-data.mjs'

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function assertEqual(label, actual, expected) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

function assertListIncludes(label, actual, expectedItems) {
  assertTrue(`${label} array`, Array.isArray(actual))
  for (const expected of expectedItems) assertTrue(`${label} includes ${expected}`, actual.includes(expected))
}

async function callApi(path) {
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

function guardPublicText(label, value) {
  const text = JSON.stringify(value)
  for (const forbidden of [
    'INJ_PRIVATE_KEY',
    'DASHSCOPE_KEY',
    'PINATA_JWT',
    'privateKey',
    'mnemonic',
    'seed phrase',
    '.env',
    '/Users/',
    'Pocket-Earth-Plus',
    'Sunset-Radio',
    'sunset-radio',
    'profileHashA',
    'profileHashB',
  ]) {
    assertTrue(`${label} omits ${forbidden}`, !text.includes(forbidden))
  }
}

async function suppressCardFetchWarnings(fn) {
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
    const result = await fn()
    if (sdkWarnings.length) {
      console.log('\nNOTE Agent SDK card fetch warnings were suppressed; /api decoded data URI cards directly.')
    }
    return result
  } finally {
    console.warn = originalWarn
    console.error = originalError
  }
}

const topAgentId = Math.max(...FLEET_AGENTS.map((agent) => Number(agent.id)))
const expectedPaths = new Map([
  ['chain-evidence-api', '/api/injective?tool=get-chain-evidence'],
  ['agent-proof-api', '/api/injective?tool=get-agent-proof&agentId=43'],
  ['agent-fleet-api', `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=${topAgentId}`],
  ['wallet-timeline-api', '/api/injective?tool=get-wallet-timeline'],
  ['hardware-bridge-api', '/api/injective?tool=get-hardware-bridge-proof'],
])
const expectedGuidance = new Map([
  ['chain-evidence-api', {
    expectedFields: ['sourceControl', 'judgeRunbook', 'publicReadApis', 'registryMintSummary', 'timelineSummary', 'handshakeProof', 'hardwareBridge', 'hardwareBridge.piAdapter', 'hardwareBridge.marketBoundary', 'hardwareBridge.serviceBoundary', 'hardwareBridge.roadmapBoundary', 'marketLandscapeBoundary', 'roadmapSafetyBoundary'],
    judgeFocus: ['chainId 1439 and publicOnly flags', 'same owner wallet across timeline', 'real SocialHandshake proof', 'Frost Edge Node Pi adapter action contract', 'hardware services stay future Agent Plaza receipts', 'Agent Plaza market boundary', 'roadmap safety boundary', 'current GitHub commit anchor'],
  }],
  ['agent-proof-api', {
    expectedFields: ['agent.agentId', 'agent.owner', 'agent.builderCode', 'agent.mintTransactionHash', 'sourceControl'],
    judgeFocus: ['agentId 43 identity', 'owner wallet match', 'mint transaction from ERC-8004 registry', 'single-card sourceControl anchor'],
  }],
  ['agent-fleet-api', {
    expectedFields: ['agents[].agentId', 'agents[].owner', 'agents[].wallet', 'agents[].builderCode', 'agents[].identityTuple', 'agents[].card', 'agents[44-47].card.tags', 'agents[44-47].card.metadata.builderCode', 'total', 'offset', 'limit', 'sdk'],
    judgeFocus: [`builderCode=${BUILDER_CODE}`, 'agentId 43-47 fleet', 'limit/offset return the full scoped fleet', 'public data URI card fields only', 'public-plaza chain discovery input'],
  }],
  ['wallet-timeline-api', {
    expectedFields: ['summary.owner', 'summary.eventCount', 'summary.allSucceeded', 'events[].hash', 'events[].status'],
    judgeFocus: ['same owner wallet', 'all receipts succeeded', 'first and last block range', 'registration to real handshake sequence'],
  }],
  ['hardware-bridge-api', {
    expectedFields: ['hardwareBridge.key', 'hardwareBridge.eventKinds', 'hardwareBridge.chainDispatch.chainRead', 'hardwareBridge.piRouter.skills', 'hardwareBridge.piAdapter.actions', 'hardwareBridge.marketBoundary', 'hardwareBridge.serviceBoundary', 'hardwareBridge.roadmapBoundary', 'privacyBoundary.hardware', 'sourceControl'],
    judgeFocus: ['Frost Edge Node public-event bridge', 'music_now_playing and chain_dispatch only', `builderCode=${BUILDER_CODE} chain read`, 'transport-neutral Pi adapter actions', 'prototype and developer-kit market boundary', 'future hardware node services route through Agent Plaza receipts', 'optional physical adapters remain after public actions', 'no wallet signing or raw profile text'],
  }],
])

const evidence = await callApi('/api/injective?tool=get-chain-evidence')

console.log('\npublicReadApis manifest')
assertTrue('publicReadApis array', Array.isArray(evidence.publicReadApis))
assertEqual('publicReadApis count', evidence.publicReadApis.length, expectedPaths.size)
const byKey = new Map(evidence.publicReadApis.map((item) => [item.key, item]))
for (const [key, path] of expectedPaths) {
  const item = byKey.get(key)
  assertTrue(`manifest includes ${key}`, Boolean(item))
  assertEqual(`${key} method`, item.method, 'GET')
  assertEqual(`${key} path`, item.path, path)
  assertEqual(`${key} chainId`, item.chainId, INJECTIVE_TESTNET_CHAIN_ID)
  assertEqual(`${key} readOnly`, item.readOnly, true)
  assertEqual(`${key} publicOnly`, item.publicOnly, true)
  assertTrue(`${key} purpose`, String(item.purpose || '').length > 20)
  assertTrue(`${key} verification command`, String(item.verification || '').length > 0)
  assertListIncludes(`${key} expectedFields`, item.expectedFields, expectedGuidance.get(key).expectedFields)
  assertListIncludes(`${key} judgeFocus`, item.judgeFocus, expectedGuidance.get(key).judgeFocus)
}
assertEqual('advertised publicReadApis command', evidence.verification?.publicReadApis, 'npm run verify:public-apis')

console.log('\nchain evidence endpoint')
const chainEvidence = await callApi(byKey.get('chain-evidence-api').path)
assertEqual('chain evidence ok', chainEvidence.ok, true)
assertEqual('chain evidence chainId', chainEvidence.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('chain evidence readOnly', chainEvidence.readOnly, true)
assertEqual('chain evidence publicOnly', chainEvidence.publicOnly, true)
assertEqual('chain evidence source repository', chainEvidence.sourceControl?.repository, INTEGRATION_REPOSITORY_URL)
assertTrue('chain evidence carries judgeRunbook', Array.isArray(chainEvidence.judgeRunbook?.steps))
assertEqual('chain evidence judgeRunbook step count', chainEvidence.judgeRunbook.steps.length, 5)
assertEqual('chain evidence judgeRunbook starts with identity URL', chainEvidence.judgeRunbook.steps[0]?.url, scanUrlForAgent(43))
assertTrue('chain evidence carries publicReadApis', Array.isArray(chainEvidence.publicReadApis))
assertTrue('chain evidence carries hardwareBridge', !!chainEvidence.hardwareBridge && typeof chainEvidence.hardwareBridge === 'object')
assertEqual('chain evidence hardwareBridge key', chainEvidence.hardwareBridge.key, HARDWARE_BRIDGE_PROOF.key)
assertEqual('chain evidence hardwareBridge moduleUrl', chainEvidence.hardwareBridge.moduleUrl, HARDWARE_BRIDGE_PROOF.moduleUrl)
assertListIncludes('chain evidence hardwareBridge eventKinds', chainEvidence.hardwareBridge.eventKinds, ['music_now_playing', 'chain_dispatch'])
assertEqual('chain evidence hardwareBridge builderCode', chainEvidence.hardwareBridge.chainDispatch?.builderCode, BUILDER_CODE)
assertEqual('chain evidence hardwareBridge scanUrl', chainEvidence.hardwareBridge.chainDispatch?.scanUrl, scanUrlForRegistry())
assertEqual('chain evidence hardwareBridge local verification', chainEvidence.hardwareBridge.localVerification, 'npm run verify:hardware')
assertListIncludes('chain evidence hardwareBridge Pi adapter actions', chainEvidence.hardwareBridge.piAdapter?.actions, ['state', 'tts', 'display'])
assertListIncludes('chain evidence hardwareBridge privacy boundary', chainEvidence.hardwareBridge.privacyBoundary, ['no private keys', 'no wallet signing', 'no raw profile text', 'public JSONL events only'])
assertEqual('chain evidence hardwareBridge market role', chainEvidence.hardwareBridge.marketBoundary?.role, HARDWARE_BRIDGE_PROOF.marketBoundary.role)
assertEqual('chain evidence hardwareBridge market source', chainEvidence.hardwareBridge.marketBoundary?.sourceUrl, HARDWARE_BRIDGE_PROOF.marketBoundary.sourceUrl)
assertEqual('chain evidence hardwareBridge service boundary key', chainEvidence.hardwareBridge.serviceBoundary?.key, HARDWARE_BRIDGE_PROOF.serviceBoundary.key)
assertTrue('chain evidence hardwareBridge service receipt slot', String(chainEvidence.hardwareBridge.serviceBoundary?.futureReceiptSlot || '').includes('hardwareNodeServiceReceipt'))
assertListIncludes('chain evidence hardwareBridge service allowed services', chainEvidence.hardwareBridge.serviceBoundary?.allowedServices, HARDWARE_BRIDGE_PROOF.serviceBoundary.allowedServices)
assertTrue('chain evidence hardwareBridge service ties to Agent Plaza', String(chainEvidence.hardwareBridge.serviceBoundary?.agentPlazaTieIn || '').includes('Agent Plaza service receipts'))
assertEqual('chain evidence hardwareBridge roadmap current', chainEvidence.hardwareBridge.roadmapBoundary?.current, HARDWARE_BRIDGE_PROOF.roadmapBoundary.current)
assertListIncludes('chain evidence hardwareBridge roadmap pending adapters', chainEvidence.hardwareBridge.roadmapBoundary?.pendingAdapters, HARDWARE_BRIDGE_PROOF.roadmapBoundary.pendingAdapters)
assertTrue('chain evidence hardwareBridge roadmap integration rule', String(chainEvidence.hardwareBridge.roadmapBoundary?.integrationRule || '').includes('optional/removable'))
assertTrue('chain evidence market landscape object', !!chainEvidence.marketLandscapeBoundary && typeof chainEvidence.marketLandscapeBoundary === 'object')
assertEqual('chain evidence market landscape key', chainEvidence.marketLandscapeBoundary.key, MARKET_LANDSCAPE_BOUNDARY.key)
assertEqual('chain evidence market landscape core thesis', chainEvidence.marketLandscapeBoundary.coreThesis, MARKET_LANDSCAPE_BOUNDARY.coreThesis)
assertListIncludes('chain evidence market landscape commercial flywheel', chainEvidence.marketLandscapeBoundary.commercialFlywheel, MARKET_LANDSCAPE_BOUNDARY.commercialFlywheel)
assertEqual('chain evidence market landscape preferred path', chainEvidence.marketLandscapeBoundary.preferredPath?.label, MARKET_LANDSCAPE_BOUNDARY.preferredPath.label)
assertTrue('chain evidence market landscape preferred proof names install loop', String(chainEvidence.marketLandscapeBoundary.preferredPath?.proof || '').includes('INSTALL'))
assertTrue('chain evidence market landscape preferred proof names willEmit', String(chainEvidence.marketLandscapeBoundary.preferredPath?.proof || '').includes('willEmit'))
assertTrue('chain evidence market landscape precedent boundary avoids revenue claim', String(chainEvidence.marketLandscapeBoundary.preferredPath?.precedentBoundary || '').includes('not as Pocket Earth revenue claims'))
assertListIncludes('chain evidence market landscape negative coordinate keys', (chainEvidence.marketLandscapeBoundary.negativeCoordinates || []).map((item) => item.key), MARKET_LANDSCAPE_BOUNDARY.negativeCoordinates.map((item) => item.key))
assertTrue('chain evidence market landscape pure-social coordinate cites public-plaza', chainEvidence.marketLandscapeBoundary.negativeCoordinates?.some((item) => item.key === 'pure-social' && item.examples?.includes('friend.tech') && item.examples?.includes('Farcaster') && item.pocketEarthBoundary.includes('public-plaza')))
assertTrue('chain evidence market landscape token-first coordinate cites Agent Plaza', chainEvidence.marketLandscapeBoundary.negativeCoordinates?.some((item) => item.key === 'token-first-agent-market' && item.examples?.includes('Virtuals-style agent token path') && item.pocketEarthBoundary.includes('Agent Plaza')))
assertTrue('chain evidence market landscape hardware-first coordinate cites Frost Edge Node', chainEvidence.marketLandscapeBoundary.negativeCoordinates?.some((item) => item.key === 'consumer-ai-hardware-first' && item.examples?.includes('Rabbit r1') && item.pocketEarthBoundary.includes('Frost Edge Node')))
assertListIncludes('chain evidence market landscape rejected paths', (chainEvidence.marketLandscapeBoundary.rejectedPaths || []).map((item) => item.key), MARKET_LANDSCAPE_BOUNDARY.rejectedPaths.map((item) => item.key))
assertTrue('chain evidence market landscape rejects token-first path', chainEvidence.marketLandscapeBoundary.rejectedPaths?.some((item) => item.key === 'token-first' && item.boundary.includes('identity, versioning, receipts')))
assertTrue('chain evidence market landscape rejects hardware revenue first', chainEvidence.marketLandscapeBoundary.rejectedPaths?.some((item) => item.key === 'hardware-revenue-first' && item.boundary.includes('developer-kit')))
assertListIncludes('chain evidence market landscape differentiation', chainEvidence.marketLandscapeBoundary.differentiation, MARKET_LANDSCAPE_BOUNDARY.differentiation)
assertEqual('chain evidence market landscape local verification', chainEvidence.marketLandscapeBoundary.localVerification, MARKET_LANDSCAPE_BOUNDARY.localVerification)
assertEqual('chain evidence roadmap safety key', chainEvidence.roadmapSafetyBoundary?.key, ROADMAP_SAFETY_BOUNDARY.key)
assertListIncludes('chain evidence roadmap safety always-on boundaries', chainEvidence.roadmapSafetyBoundary?.alwaysOn, ROADMAP_SAFETY_BOUNDARY.alwaysOn)
assertTrue('chain evidence roadmap safety P2 no arbitrary code', chainEvidence.roadmapSafetyBoundary?.productRoadmap?.some((item) => item.phase === 'P2 self-learning' && item.boundary.includes('never execute arbitrary code')))
assertTrue('chain evidence roadmap safety P4 no signing', chainEvidence.roadmapSafetyBoundary?.chainRoadmap?.some((item) => item.phase === 'P4 Frost Network' && item.boundary.includes('devices do not sign wallets')))
assertTrue('chain evidence carries agent proof rows', Array.isArray(chainEvidence.agents))
assertEqual('chain evidence agent proof row count', chainEvidence.agents.length, FLEET_AGENTS.length)
for (const expected of FLEET_AGENTS) {
  const actual = chainEvidence.agents.find((agent) => Number(agent.agentId) === Number(expected.id))
  const mintEvent = REGISTRY_MINT_EVENTS.find((event) => Number(event.agentId) === Number(expected.id))
  assertTrue(`chain evidence agent ${expected.id} row`, Boolean(actual))
  assertTrue(`chain evidence agent ${expected.id} mint event`, Boolean(mintEvent))
  assertEqual(`chain evidence agent ${expected.id} owner`, actual.owner, PROOF_OWNER)
  assertEqual(`chain evidence agent ${expected.id} builderCode`, actual.builderCode, BUILDER_CODE)
  assertEqual(`chain evidence agent ${expected.id} registry`, actual.registry, IDENTITY_REGISTRY)
  assertEqual(`chain evidence agent ${expected.id} registryScanUrl`, actual.registryScanUrl, scanUrlForRegistry())
  assertEqual(`chain evidence agent ${expected.id} mintedFromZero`, actual.mintedFromZero, true)
  assertEqual(`chain evidence agent ${expected.id} mintTransactionHash`, actual.mintTransactionHash, mintEvent.transactionHash)
  assertEqual(`chain evidence agent ${expected.id} mintBlockNumber`, actual.mintBlockNumber, mintEvent.blockNumber)
  assertEqual(`chain evidence agent ${expected.id} mintScanUrl`, actual.mintScanUrl, mintEvent.scanUrl)
  assertEqual(`chain evidence agent ${expected.id} proofApi`, actual.proofApi, `/api/injective?tool=get-agent-proof&agentId=${Number(expected.id)}`)
  assertEqual(`chain evidence agent ${expected.id} scanUrl`, actual.scanUrl, scanUrlForAgent(expected.id))
}

console.log('\nagent proof endpoint')
const agentProof = await callApi(byKey.get('agent-proof-api').path)
assertEqual('agent proof ok', agentProof.ok, true)
assertEqual('agent proof chainId', agentProof.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('agent proof readOnly', agentProof.readOnly, true)
assertEqual('agent proof publicOnly', agentProof.publicOnly, true)
assertEqual('agent proof id', agentProof.agent?.agentId, 43)
assertEqual('agent proof owner', agentProof.agent?.owner, PROOF_OWNER)
assertEqual('agent proof builderCode', agentProof.agent?.builderCode, BUILDER_CODE)
assertEqual('agent proof registry', agentProof.agent?.registry, IDENTITY_REGISTRY)
assertEqual('agent proof mint tx', agentProof.agent?.mintTransactionHash, REGISTRY_MINT_EVENTS[0].transactionHash)
assertEqual('agent proof proofApi', agentProof.agent?.proofApi, '/api/injective?tool=get-agent-proof&agentId=43')
assertEqual('agent proof scanUrl', agentProof.agent?.scanUrl, scanUrlForAgent(43))
assertEqual('agent proof source repository', agentProof.sourceControl?.repository, INTEGRATION_REPOSITORY_URL)
assertEqual('agent proof verification command', agentProof.verification?.agentProof, 'npm run verify:agent-proof')

console.log('\nagent fleet endpoint')
const fleet = await suppressCardFetchWarnings(() => callApi(byKey.get('agent-fleet-api').path))
assertEqual('fleet sdk flag', fleet.sdk, true)
assertEqual('fleet builderCode', fleet.builderCode, BUILDER_CODE)
assertEqual('fleet total', fleet.total, FLEET_AGENTS.length)
assertEqual('fleet offset', fleet.offset, 0)
assertEqual('fleet limit', fleet.limit, FLEET_AGENTS.length)
assertTrue('fleet agents array', Array.isArray(fleet.agents))
assertEqual('fleet returned full Pocket Earth fleet', fleet.agents.length, FLEET_AGENTS.length)
for (const expected of FLEET_AGENTS) {
  const agent = fleet.agents.find((item) => Number(item.agentId) === Number(expected.id))
  assertTrue(`fleet includes agent ${expected.id}`, Boolean(agent))
  assertEqual(`fleet agent ${expected.id} owner`, agent.owner, PROOF_OWNER)
  assertEqual(`fleet agent ${expected.id} wallet`, agent.wallet, PROOF_OWNER)
  assertEqual(`fleet agent ${expected.id} builderCode`, agent.builderCode, BUILDER_CODE)
  assertEqual(`fleet agent ${expected.id} registry`, String(agent.identityTuple || '').split(':')[2], IDENTITY_REGISTRY)
  if (expected.requiredTag) {
    assertTrue(`fleet agent ${expected.id} decoded card object`, !!agent.card && typeof agent.card === 'object')
    assertEqual(`fleet agent ${expected.id} card name`, agent.card.name, expected.label)
    assertTrue(`fleet agent ${expected.id} card description`, String(agent.card.description || '').length > 10)
    assertTrue(`fleet agent ${expected.id} card tags array`, Array.isArray(agent.card.tags))
    assertTrue(`fleet agent ${expected.id} card tag ${expected.requiredTag}`, agent.card.tags.includes(expected.requiredTag))
    assertEqual(`fleet agent ${expected.id} card chain`, agent.card.metadata?.chain, 'injective')
    assertEqual(`fleet agent ${expected.id} card metadata builderCode`, agent.card.metadata?.builderCode, BUILDER_CODE)
    const allowedCardKeys = ['type', 'name', 'description', 'tags', 'metadata']
    assertTrue(`fleet agent ${expected.id} card public keys only`, Object.keys(agent.card).every((key) => allowedCardKeys.includes(key)))
  }
}

console.log('\nwallet timeline endpoint')
const timeline = await callApi(byKey.get('wallet-timeline-api').path)
assertEqual('timeline ok', timeline.ok, true)
assertEqual('timeline chainId', timeline.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('timeline readOnly', timeline.readOnly, true)
assertEqual('timeline publicOnly', timeline.publicOnly, true)
assertEqual('timeline owner', timeline.owner, PROOF_OWNER)
assertEqual('timeline event count', timeline.events?.length, TIMELINE_EVENTS.length)
assertEqual('timeline summary allSucceeded', timeline.summary?.allSucceeded, true)
assertEqual('timeline summary evidence API', timeline.summary?.evidenceApi, '/api/injective?tool=get-chain-evidence')

console.log('\nhardware bridge proof endpoint')
const hardwareProof = await callApi(byKey.get('hardware-bridge-api').path)
assertEqual('hardware proof ok', hardwareProof.ok, true)
assertEqual('hardware proof chainId', hardwareProof.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('hardware proof readOnly', hardwareProof.readOnly, true)
assertEqual('hardware proof publicOnly', hardwareProof.publicOnly, true)
assertEqual('hardware proof key', hardwareProof.hardwareBridge?.key, HARDWARE_BRIDGE_PROOF.key)
assertEqual('hardware proof moduleUrl', hardwareProof.hardwareBridge?.moduleUrl, HARDWARE_BRIDGE_PROOF.moduleUrl)
assertListIncludes('hardware proof eventKinds', hardwareProof.hardwareBridge?.eventKinds, ['music_now_playing', 'chain_dispatch'])
assertEqual('hardware proof chain source', hardwareProof.hardwareBridge?.chainDispatch?.source, 'injective-public-plaza')
assertEqual('hardware proof chainRead', hardwareProof.hardwareBridge?.chainDispatch?.chainRead, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=${topAgentId}`)
assertListIncludes('hardware proof skills', hardwareProof.hardwareBridge?.piRouter?.skills, ['music_now_playing', 'chain_dispatch'])
assertListIncludes('hardware proof Pi adapter actions', hardwareProof.hardwareBridge?.piAdapter?.actions, ['state', 'tts', 'display'])
assertEqual('hardware proof market role', hardwareProof.hardwareBridge?.marketBoundary?.role, HARDWARE_BRIDGE_PROOF.marketBoundary.role)
assertEqual('hardware proof market source', hardwareProof.hardwareBridge?.marketBoundary?.sourceUrl, HARDWARE_BRIDGE_PROOF.marketBoundary.sourceUrl)
assertEqual('hardware proof service boundary key', hardwareProof.hardwareBridge?.serviceBoundary?.key, HARDWARE_BRIDGE_PROOF.serviceBoundary.key)
assertTrue('hardware proof service boundary receipt slot', String(hardwareProof.hardwareBridge?.serviceBoundary?.futureReceiptSlot || '').includes('hardwareNodeServiceReceipt'))
assertListIncludes('hardware proof service forbidden services', hardwareProof.hardwareBridge?.serviceBoundary?.notAllowed, ['wallet signing', 'private profile export', 'mass-production revenue claim'])
assertTrue('hardware proof service ties to Agent Plaza receipts', String(hardwareProof.hardwareBridge?.serviceBoundary?.agentPlazaTieIn || '').includes('Agent Plaza service receipts'))
assertEqual('hardware proof roadmap current', hardwareProof.hardwareBridge?.roadmapBoundary?.current, HARDWARE_BRIDGE_PROOF.roadmapBoundary.current)
assertListIncludes('hardware proof roadmap pending adapters', hardwareProof.hardwareBridge?.roadmapBoundary?.pendingAdapters, HARDWARE_BRIDGE_PROOF.roadmapBoundary.pendingAdapters)
assertTrue('hardware proof roadmap integration rule', String(hardwareProof.hardwareBridge?.roadmapBoundary?.integrationRule || '').includes('optional/removable'))
assertListIncludes('hardware proof privacy boundary', hardwareProof.privacyBoundary?.hardware, ['no private keys', 'no wallet signing', 'no raw profile text', 'public JSONL events only'])
assertEqual('hardware proof source repository', hardwareProof.sourceControl?.repository, INTEGRATION_REPOSITORY_URL)
assertEqual('hardware proof verification command', hardwareProof.verification?.hardwareBridge, 'npm run verify:hardware')

console.log('\nPublic-only guard')
guardPublicText('publicReadApis', evidence.publicReadApis)
guardPublicText('chain evidence response', chainEvidence)
guardPublicText('agent proof response', agentProof)
guardPublicText('fleet response', fleet)
guardPublicText('wallet timeline response', timeline)
guardPublicText('hardware bridge response', hardwareProof)

console.log('\nOK publicReadApis opens the five judge-safe read-only Injective endpoints.')
