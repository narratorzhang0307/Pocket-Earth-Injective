// Guard the judge-facing evidence package as a public-only contract.
// Usage: npm run verify:public-proof
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  DEMO_VIDEO_URL,
  DEMO_VIDEO_LIMIT_SECONDS,
  FLEET_AGENTS,
  HARDWARE_BRIDGE_PROOF,
  IDENTITY_REGISTRY,
  INJECTIVE_TESTNET_CHAIN_ID,
  JUDGE_RUNBOOK,
  JUDGE_QUICKSTART_URL,
  MARKET_LANDSCAPE_BOUNDARY,
  PROOF_OWNER,
  REGISTRY_MINT_EVENTS,
  REGISTRY_MINT_ZERO_ADDRESS,
  REVIEW_LINKS,
  ROADMAP_SAFETY_BOUNDARY,
  SOCIAL_HANDSHAKE,
  SOCIAL_HANDSHAKE_PROOF,
  INTEGRATION_REPOSITORY_URL,
  TIMELINE_EVENTS,
  scanUrlForAddress,
  scanUrlForAgent,
  scanUrlForRegistry,
  scanUrlForTx,
} from './chain-proof-data.mjs'

const integrationDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(integrationDir, '..')
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'))

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

function assertSetEqual(label, actual, expected) {
  const a = [...actual].sort()
  const e = [...expected].sort()
  assertEqual(`${label} count`, a.length, e.length)
  for (const item of e) assertTrue(`${label} includes ${item}`, a.includes(item))
}

function assertFocusIncludes(label, item, expected) {
  assertTrue(`${label} evidenceFocus array`, Array.isArray(item.evidenceFocus))
  const text = item.evidenceFocus.join(' | ')
  assertTrue(`${label} evidenceFocus includes ${expected}`, text.includes(expected))
}

function assertListIncludes(label, actual, expectedItems) {
  assertTrue(`${label} array`, Array.isArray(actual))
  for (const expected of expectedItems) assertTrue(`${label} includes ${expected}`, actual.includes(expected))
}

function assertTextIncludes(label, actual, expectedItems) {
  const text = String(actual || '')
  for (const expected of expectedItems) assertTrue(`${label} includes ${expected}`, text.includes(expected))
}

async function callEvidenceApi() {
  let statusCode = 0
  let body = ''
  const req = { method: 'GET' }
  const res = {
    writeHead(code) { statusCode = code },
    end(chunk) { body += chunk || '' },
  }
  await handleInjective(req, res, new URL('http://localhost/api/injective?tool=get-chain-evidence'), { network: 'testnet' })
  assertEqual('evidence HTTP status', statusCode, 200)
  const payload = JSON.parse(body)
  assertTrue('evidence has no api error', !payload.error)
  return payload
}

function flattenStrings(value, path = '$', out = []) {
  if (typeof value === 'string') out.push({ path, value })
  else if (Array.isArray(value)) value.forEach((item, index) => flattenStrings(item, `${path}[${index}]`, out))
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) flattenStrings(item, `${path}.${key}`, out)
  }
  return out
}

function assertKnownCommand(label, command) {
  const pieces = String(command).split(/\s*&&\s*/)
  for (const piece of pieces) {
    if (piece.startsWith('npm run ')) {
      const scriptName = piece.slice('npm run '.length).trim().split(/\s+/)[0]
      assertTrue(`${label} npm script ${scriptName}`, !!packageJson.scripts?.[scriptName])
    } else if (piece.startsWith('node ')) {
      const file = piece.slice('node '.length).trim().split(/\s+/)[0]
      assertTrue(`${label} node file ${file}`, existsSync(resolve(projectRoot, file)))
    } else if (piece.startsWith('python3 ')) {
      const file = piece.slice('python3 '.length).trim().split(/\s+/)[0]
      assertTrue(`${label} python file ${file}`, existsSync(resolve(projectRoot, file)))
    } else {
      throw new Error(`${label} has unsupported command: ${piece}`)
    }
  }
}

function collectCommands(evidence) {
  const commands = []
  for (const item of evidence.publicReadApis || []) commands.push(['publicReadApis', item.verification])
  for (const item of evidence.reviewBrief?.injectiveCore || []) commands.push(['reviewBrief.injectiveCore', item.machineCheck])
  for (const item of evidence.judgeRunbook?.steps || []) commands.push(['judgeRunbook.steps', item.localCheck || item.command])
  for (const item of evidence.integrationAlignment || []) commands.push(['integrationAlignment', item.machineCheck])
  for (const item of evidence.reviewChecklist || []) commands.push(['reviewChecklist', item.machineCheck])
  for (const item of evidence.deliveryChecklist || []) commands.push(['deliveryChecklist', item.localCheck])
  if (evidence.handshakeProof?.localVerification) commands.push(['handshakeProof', evidence.handshakeProof.localVerification])
  for (const [key, value] of Object.entries(evidence.verification || {})) {
    if (typeof value === 'string' && (value.startsWith('npm run ') || value.startsWith('node '))) commands.push([`verification.${key}`, value])
  }
  for (const item of evidence.recordingOrder || []) {
    if (item.command) commands.push(['recordingOrder', item.command])
  }
  return commands.filter(([, command]) => command)
}

const evidence = await callEvidenceApi()

console.log('\nPublic evidence contract shape')
assertSetEqual('top-level keys', Object.keys(evidence), [
  'agents',
  'builderCode',
  'chainId',
  'integrationAlignment',
  'marketLandscapeBoundary',
  'demoVideoLimitSeconds',
  'handshakeContract',
  'handshakeProof',
  'handshakeScanUrl',
  'hardwareBridge',
  'judgeRunbook',
  'network',
  'ok',
  'owner',
  'ownerScanUrl',
  'plazaFlow',
  'privacyBoundary',
  'publicOnly',
  'publicReadApis',
  'readOnly',
  'recordingOrder',
  'registry',
  'registryMintEvents',
  'registryMintSummary',
  'registryScanUrl',
  'reviewBrief',
  'reviewChecklist',
  'reviewLinks',
  'roadmapSafetyBoundary',
  'sourceControl',
  'deliveryChecklist',
  'reviewEntrypoints',
  'timeline',
  'timelineSummary',
  'verification',
])
assertEqual('ok flag', evidence.ok, true)
assertEqual('network', evidence.network, 'testnet')
assertEqual('chainId', evidence.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('readOnly flag', evidence.readOnly, true)
assertEqual('publicOnly flag', evidence.publicOnly, true)
assertEqual('demo limit', evidence.demoVideoLimitSeconds, DEMO_VIDEO_LIMIT_SECONDS)
assertEqual('builderCode', evidence.builderCode, BUILDER_CODE)
assertEqual('owner', evidence.owner, PROOF_OWNER)
assertEqual('registry', evidence.registry, IDENTITY_REGISTRY)
assertEqual('handshake contract', evidence.handshakeContract, SOCIAL_HANDSHAKE)
assertTrue('handshake proof object', !!evidence.handshakeProof && typeof evidence.handshakeProof === 'object')
assertEqual('handshake proof key', evidence.handshakeProof.key, SOCIAL_HANDSHAKE_PROOF.key)
assertEqual('handshake proof contract', evidence.handshakeProof.contract, SOCIAL_HANDSHAKE)
assertEqual('handshake proof contract scanUrl', evidence.handshakeProof.contractScanUrl, scanUrlForAddress(SOCIAL_HANDSHAKE))
assertEqual('handshake proof transactionHash', evidence.handshakeProof.transactionHash, TIMELINE_EVENTS.at(-1).hash)
assertEqual('handshake proof transactionScanUrl', evidence.handshakeProof.transactionScanUrl, scanUrlForTx(TIMELINE_EVENTS.at(-1).hash))
assertEqual('handshake proof agentA', evidence.handshakeProof.agentA, 43)
assertEqual('handshake proof agentB', evidence.handshakeProof.agentB, 44)
assertEqual('handshake proof score', evidence.handshakeProof.score, 88)
assertEqual('handshake proof block', evidence.handshakeProof.blockNumber, TIMELINE_EVENTS.at(-1).blockNumber)
assertEqual('handshake proof timestamp', evidence.handshakeProof.timestamp, TIMELINE_EVENTS.at(-1).timestamp)
assertTrue('handshake proof only exposes commitment policy', String(evidence.handshakeProof.profileCommitmentPolicy || '').includes('raw profile fields stay off-chain'))
assertTrue('handshake proof public fields include commitments', evidence.handshakeProof.publicFields?.includes('profile commitment hashes'))
assertEqual('handshake proof local verification', evidence.handshakeProof.localVerification, SOCIAL_HANDSHAKE_PROOF.localVerification)
assertTrue('hardwareBridge object', !!evidence.hardwareBridge && typeof evidence.hardwareBridge === 'object')
assertEqual('hardwareBridge key', evidence.hardwareBridge.key, HARDWARE_BRIDGE_PROOF.key)
assertEqual('hardwareBridge label', evidence.hardwareBridge.label, HARDWARE_BRIDGE_PROOF.label)
assertEqual('hardwareBridge modulePath', evidence.hardwareBridge.modulePath, 'hardware/frost-buddy/')
assertEqual('hardwareBridge moduleUrl', evidence.hardwareBridge.moduleUrl, HARDWARE_BRIDGE_PROOF.moduleUrl)
assertListIncludes('hardwareBridge eventKinds', evidence.hardwareBridge.eventKinds, ['music_now_playing', 'chain_dispatch'])
assertEqual('hardwareBridge chain source', evidence.hardwareBridge.chainDispatch?.source, 'injective-public-plaza')
assertEqual('hardwareBridge builderCode', evidence.hardwareBridge.chainDispatch?.builderCode, BUILDER_CODE)
assertEqual('hardwareBridge chainRead', evidence.hardwareBridge.chainDispatch?.chainRead, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=47`)
assertEqual('hardwareBridge scanUrl', evidence.hardwareBridge.chainDispatch?.scanUrl, scanUrlForRegistry())
assertEqual('hardwareBridge agentIds', evidence.hardwareBridge.chainDispatch?.agentIds?.join(','), FLEET_AGENTS.map((agent) => Number(agent.id)).join(','))
assertTrue('hardwareBridge Pi router skills include music', evidence.hardwareBridge.piRouter?.skills?.includes('music_now_playing'))
assertTrue('hardwareBridge Pi router skills include chain', evidence.hardwareBridge.piRouter?.skills?.includes('chain_dispatch'))
assertEqual('hardwareBridge Pi smoke', evidence.hardwareBridge.piRouter?.smoke, 'python3 hardware/frost-buddy/raspi/frost_pi_skill_agent_smoke.py')
assertEqual('hardwareBridge Pi adapter path', evidence.hardwareBridge.piAdapter?.modulePath, 'hardware/frost-buddy/raspi/frost_pi_event_adapter.py')
assertListIncludes('hardwareBridge Pi adapter actions', evidence.hardwareBridge.piAdapter?.actions, ['state', 'tts', 'display'])
assertTrue('hardwareBridge Pi adapter boundary', String(evidence.hardwareBridge.piAdapter?.boundary || '').includes('transport-neutral adapter lane'))
assertListIncludes('hardwareBridge privacy boundary', evidence.hardwareBridge.privacyBoundary, ['no private keys', 'no wallet signing', 'no raw profile text', 'no precise location payloads', 'public JSONL events only'])
assertEqual('hardwareBridge market role', evidence.hardwareBridge.marketBoundary?.role, HARDWARE_BRIDGE_PROOF.marketBoundary.role)
assertEqual('hardwareBridge market source', evidence.hardwareBridge.marketBoundary?.sourceUrl, HARDWARE_BRIDGE_PROOF.marketBoundary.sourceUrl)
assertTrue('hardwareBridge market business path', String(evidence.hardwareBridge.marketBoundary?.businessPath || '').includes('Agent Plaza'))
assertTrue('hardwareBridge market risk line', String(evidence.hardwareBridge.marketBoundary?.riskLine || '').includes('No mass-production'))
assertEqual('hardwareBridge service boundary key', evidence.hardwareBridge.serviceBoundary?.key, HARDWARE_BRIDGE_PROOF.serviceBoundary.key)
assertTrue('hardwareBridge service boundary receipt slot', String(evidence.hardwareBridge.serviceBoundary?.futureReceiptSlot || '').includes('hardwareNodeServiceReceipt'))
assertListIncludes('hardwareBridge service boundary allowed services', evidence.hardwareBridge.serviceBoundary?.allowedServices, HARDWARE_BRIDGE_PROOF.serviceBoundary.allowedServices)
assertListIncludes('hardwareBridge service boundary forbidden services', evidence.hardwareBridge.serviceBoundary?.notAllowed, ['wallet signing', 'private profile export', 'mass-production revenue claim'])
assertTrue('hardwareBridge service boundary Agent Plaza tie-in', String(evidence.hardwareBridge.serviceBoundary?.agentPlazaTieIn || '').includes('Agent Plaza service receipts'))
assertEqual('hardwareBridge roadmap current', evidence.hardwareBridge.roadmapBoundary?.current, HARDWARE_BRIDGE_PROOF.roadmapBoundary.current)
assertListIncludes('hardwareBridge roadmap pending adapters', evidence.hardwareBridge.roadmapBoundary?.pendingAdapters, HARDWARE_BRIDGE_PROOF.roadmapBoundary.pendingAdapters)
assertTrue('hardwareBridge roadmap integration rule', String(evidence.hardwareBridge.roadmapBoundary?.integrationRule || '').includes('optional/removable'))
assertTrue('hardwareBridge roadmap P4 framing', String(evidence.hardwareBridge.roadmapBoundary?.p4Framing || '').includes('not a mass-produced revenue product'))
assertEqual('hardwareBridge local verification', evidence.hardwareBridge.localVerification, 'npm run verify:hardware')
assertTrue('marketLandscapeBoundary object', !!evidence.marketLandscapeBoundary && typeof evidence.marketLandscapeBoundary === 'object')
assertEqual('marketLandscapeBoundary key', evidence.marketLandscapeBoundary.key, MARKET_LANDSCAPE_BOUNDARY.key)
assertEqual('marketLandscapeBoundary core thesis', evidence.marketLandscapeBoundary.coreThesis, MARKET_LANDSCAPE_BOUNDARY.coreThesis)
assertSetEqual('marketLandscapeBoundary commercial flywheel', new Set(evidence.marketLandscapeBoundary.commercialFlywheel || []), new Set(MARKET_LANDSCAPE_BOUNDARY.commercialFlywheel))
assertEqual('marketLandscapeBoundary preferred path label', evidence.marketLandscapeBoundary.preferredPath?.label, MARKET_LANDSCAPE_BOUNDARY.preferredPath.label)
assertTrue('marketLandscapeBoundary preferred path names manifest review', String(evidence.marketLandscapeBoundary.preferredPath?.proof || '').includes('manifest review'))
assertTrue('marketLandscapeBoundary preferred path names willEmit', String(evidence.marketLandscapeBoundary.preferredPath?.proof || '').includes('willEmit'))
assertTrue('marketLandscapeBoundary precedent boundary avoids revenue claim', String(evidence.marketLandscapeBoundary.preferredPath?.precedentBoundary || '').includes('not as Pocket Earth revenue claims'))
assertSetEqual('marketLandscapeBoundary negative coordinate keys', new Set((evidence.marketLandscapeBoundary.negativeCoordinates || []).map((item) => item.key)), new Set(MARKET_LANDSCAPE_BOUNDARY.negativeCoordinates.map((item) => item.key)))
assertTrue('marketLandscapeBoundary pure-social coordinate cites public-plaza', evidence.marketLandscapeBoundary.negativeCoordinates?.some((item) => item.key === 'pure-social' && item.examples?.includes('friend.tech') && item.examples?.includes('Farcaster') && item.pocketEarthBoundary.includes('public-plaza')))
assertTrue('marketLandscapeBoundary token-first coordinate cites Agent Plaza', evidence.marketLandscapeBoundary.negativeCoordinates?.some((item) => item.key === 'token-first-agent-market' && item.examples?.includes('Virtuals-style agent token path') && item.pocketEarthBoundary.includes('Agent Plaza')))
assertTrue('marketLandscapeBoundary hardware-first coordinate cites Frost Edge Node', evidence.marketLandscapeBoundary.negativeCoordinates?.some((item) => item.key === 'consumer-ai-hardware-first' && item.examples?.includes('Rabbit r1') && item.pocketEarthBoundary.includes('Frost Edge Node')))
assertSetEqual('marketLandscapeBoundary rejected path keys', new Set((evidence.marketLandscapeBoundary.rejectedPaths || []).map((item) => item.key)), new Set(MARKET_LANDSCAPE_BOUNDARY.rejectedPaths.map((item) => item.key)))
assertTrue('marketLandscapeBoundary rejects token-first path', evidence.marketLandscapeBoundary.rejectedPaths?.some((item) => item.key === 'token-first' && item.boundary.includes('identity, versioning, receipts')))
assertTrue('marketLandscapeBoundary rejects hardware revenue first', evidence.marketLandscapeBoundary.rejectedPaths?.some((item) => item.key === 'hardware-revenue-first' && item.boundary.includes('developer-kit')))
assertSetEqual('marketLandscapeBoundary differentiation', new Set(evidence.marketLandscapeBoundary.differentiation || []), new Set(MARKET_LANDSCAPE_BOUNDARY.differentiation))
assertEqual('marketLandscapeBoundary local verification', evidence.marketLandscapeBoundary.localVerification, MARKET_LANDSCAPE_BOUNDARY.localVerification)
assertKnownCommand('marketLandscapeBoundary local verification command', evidence.marketLandscapeBoundary.localVerification)
assertTrue('roadmapSafetyBoundary object', !!evidence.roadmapSafetyBoundary && typeof evidence.roadmapSafetyBoundary === 'object')
assertEqual('roadmapSafetyBoundary key', evidence.roadmapSafetyBoundary.key, ROADMAP_SAFETY_BOUNDARY.key)
assertEqual('roadmapSafetyBoundary product roadmap count', evidence.roadmapSafetyBoundary.productRoadmap?.length, ROADMAP_SAFETY_BOUNDARY.productRoadmap.length)
assertEqual('roadmapSafetyBoundary chain roadmap count', evidence.roadmapSafetyBoundary.chainRoadmap?.length, ROADMAP_SAFETY_BOUNDARY.chainRoadmap.length)
assertListIncludes('roadmapSafetyBoundary alwaysOn', evidence.roadmapSafetyBoundary.alwaysOn, ROADMAP_SAFETY_BOUNDARY.alwaysOn)
assertTrue('roadmapSafetyBoundary P2 suggestion boundary', evidence.roadmapSafetyBoundary.productRoadmap?.some((item) => item.phase === 'P2 self-learning' && item.boundary.includes('never execute arbitrary code')))
assertTrue('roadmapSafetyBoundary NOW write boundary', evidence.roadmapSafetyBoundary.chainRoadmap?.some((item) => item.phase === 'NOW chain identity and handshake' && item.boundary.includes('confirm:true')))
assertTrue('roadmapSafetyBoundary P4 hardware boundary', evidence.roadmapSafetyBoundary.chainRoadmap?.some((item) => item.phase === 'P4 Frost Network' && item.boundary.includes('devices do not sign wallets')))
assertEqual('roadmapSafetyBoundary local verification', evidence.roadmapSafetyBoundary.localVerification, ROADMAP_SAFETY_BOUNDARY.localVerification)
assertTrue('sourceControl object', !!evidence.sourceControl && typeof evidence.sourceControl === 'object')
assertEqual('sourceControl repository', evidence.sourceControl.repository, INTEGRATION_REPOSITORY_URL)
assertEqual('sourceControl branch', evidence.sourceControl.branch, 'main')
assertTrue('sourceControl commit is sha or null', evidence.sourceControl.commit === null || /^[0-9a-f]{40}$/i.test(evidence.sourceControl.commit))
if (evidence.sourceControl.commit) assertEqual('sourceControl commitUrl', evidence.sourceControl.commitUrl, `${INTEGRATION_REPOSITORY_URL}/commit/${evidence.sourceControl.commit}`)
assertEqual('sourceControl evidenceApi', evidence.sourceControl.evidenceApi, '/api/injective?tool=get-chain-evidence')

console.log('\nPublic read API manifest')
assertTrue('publicReadApis array', Array.isArray(evidence.publicReadApis))
assertEqual('publicReadApis count', evidence.publicReadApis.length, 5)
const publicReadApiByKey = new Map(evidence.publicReadApis.map((item) => [item.key, item]))
assertEqual('publicReadApis chain evidence path', publicReadApiByKey.get('chain-evidence-api')?.path, '/api/injective?tool=get-chain-evidence')
assertEqual('publicReadApis agent proof path', publicReadApiByKey.get('agent-proof-api')?.path, '/api/injective?tool=get-agent-proof&agentId=43')
assertEqual('publicReadApis fleet path', publicReadApiByKey.get('agent-fleet-api')?.path, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=47`)
assertEqual('publicReadApis wallet path', publicReadApiByKey.get('wallet-timeline-api')?.path, '/api/injective?tool=get-wallet-timeline')
assertEqual('publicReadApis hardware path', publicReadApiByKey.get('hardware-bridge-api')?.path, '/api/injective?tool=get-hardware-bridge-proof')
assertEqual('publicReadApis chain evidence verification', publicReadApiByKey.get('chain-evidence-api')?.verification, 'npm run verify:public-proof')
assertEqual('publicReadApis agent proof verification', publicReadApiByKey.get('agent-proof-api')?.verification, 'npm run verify:agent-proof')
assertEqual('publicReadApis fleet verification', publicReadApiByKey.get('agent-fleet-api')?.verification, 'node INJECTIVE-INTEGRATION/verify-api-list-agents.mjs')
assertEqual('publicReadApis wallet verification', publicReadApiByKey.get('wallet-timeline-api')?.verification, 'npm run verify:wallet')
assertEqual('publicReadApis hardware verification', publicReadApiByKey.get('hardware-bridge-api')?.verification, 'npm run verify:hardware')
assertListIncludes('publicReadApis chain evidence expected fields', publicReadApiByKey.get('chain-evidence-api')?.expectedFields, ['sourceControl', 'judgeRunbook', 'publicReadApis', 'registryMintSummary', 'timelineSummary', 'handshakeProof', 'hardwareBridge', 'hardwareBridge.piAdapter', 'hardwareBridge.marketBoundary', 'hardwareBridge.serviceBoundary', 'hardwareBridge.roadmapBoundary', 'marketLandscapeBoundary', 'roadmapSafetyBoundary', 'recordingOrder[].evidenceFocus'])
assertListIncludes('publicReadApis chain evidence judge focus', publicReadApiByKey.get('chain-evidence-api')?.judgeFocus, ['chainId 1439 and publicOnly flags', 'same owner wallet across timeline', 'ERC-8004 mint summary for agentId 43-47', 'real SocialHandshake proof', 'Frost Edge Node Pi adapter action contract', 'hardware services stay future Agent Plaza receipts', 'Agent Plaza market boundary', 'roadmap safety boundary'])
assertListIncludes('publicReadApis agent proof expected fields', publicReadApiByKey.get('agent-proof-api')?.expectedFields, ['agent.agentId', 'agent.owner', 'agent.builderCode', 'agent.mintTransactionHash', 'reviewPath', 'sourceControl'])
assertListIncludes('publicReadApis agent proof judge focus', publicReadApiByKey.get('agent-proof-api')?.judgeFocus, ['agentId 43 identity', 'owner wallet match', 'mint transaction from ERC-8004 registry'])
assertListIncludes('publicReadApis fleet expected fields', publicReadApiByKey.get('agent-fleet-api')?.expectedFields, ['agents[].agentId', 'agents[].owner', 'agents[].wallet', 'agents[].builderCode', 'agents[].identityTuple', 'agents[].card', 'agents[44-47].card.tags', 'agents[44-47].card.metadata.builderCode', 'total', 'offset', 'limit', 'sdk'])
assertListIncludes('publicReadApis fleet judge focus', publicReadApiByKey.get('agent-fleet-api')?.judgeFocus, [`builderCode=${BUILDER_CODE}`, 'agentId 43-47 fleet', 'limit/offset return the full scoped fleet', 'public data URI card fields only', 'public-plaza chain discovery input'])
assertListIncludes('publicReadApis wallet expected fields', publicReadApiByKey.get('wallet-timeline-api')?.expectedFields, ['summary.owner', 'summary.eventCount', 'summary.allSucceeded', 'events[].hash', 'events[].status'])
assertListIncludes('publicReadApis wallet judge focus', publicReadApiByKey.get('wallet-timeline-api')?.judgeFocus, ['same owner wallet', 'all receipts succeeded', 'registration to real handshake sequence'])
assertListIncludes('publicReadApis hardware expected fields', publicReadApiByKey.get('hardware-bridge-api')?.expectedFields, ['hardwareBridge.key', 'hardwareBridge.eventKinds', 'hardwareBridge.chainDispatch.chainRead', 'hardwareBridge.piRouter.skills', 'hardwareBridge.piAdapter.actions', 'hardwareBridge.marketBoundary', 'hardwareBridge.serviceBoundary', 'hardwareBridge.roadmapBoundary', 'privacyBoundary.hardware', 'sourceControl'])
assertListIncludes('publicReadApis hardware judge focus', publicReadApiByKey.get('hardware-bridge-api')?.judgeFocus, ['Frost Edge Node public-event bridge', 'music_now_playing and chain_dispatch only', `builderCode=${BUILDER_CODE} chain read`, 'transport-neutral Pi adapter actions', 'future hardware node services route through Agent Plaza receipts', 'optional physical adapters remain after public actions', 'no wallet signing or raw profile text'])
for (const [key, item] of publicReadApiByKey) {
  assertEqual(`publicReadApis ${key} method`, item.method, 'GET')
  assertEqual(`publicReadApis ${key} chainId`, item.chainId, INJECTIVE_TESTNET_CHAIN_ID)
  assertEqual(`publicReadApis ${key} readOnly`, item.readOnly, true)
  assertEqual(`publicReadApis ${key} publicOnly`, item.publicOnly, true)
  assertTrue(`publicReadApis ${key} purpose`, String(item.purpose || '').length > 20)
  assertTrue(`publicReadApis ${key} expectedFields count`, item.expectedFields.length >= 4)
  assertTrue(`publicReadApis ${key} judgeFocus count`, item.judgeFocus.length >= 4)
}

const publicProofAlignment = evidence.integrationAlignment?.find((item) => item.key === 'privacy-first-public-proof')
assertTrue('integrationAlignment public proof item', !!publicProofAlignment)
assertEqual('integrationAlignment public proof machine check', publicProofAlignment.machineCheck, 'npm run verify:public-proof')
assertTextIncludes('integrationAlignment public proof evidence', publicProofAlignment.evidence, [
  'sourceControl',
  'publicReadApis',
  'judgeRunbook',
  'registryMintEvents',
  'registryMintSummary',
  'timelineSummary',
  'handshakeProof',
  'hardwareBridge',
  'reviewEntrypoints',
  'recordingOrder',
  'privacyBoundary',
  'plazaFlow',
  'get-hardware-bridge-proof',
])

console.log('\nReview entry points')
assertEqual('judge quickstart link stays on Injective integration repo', evidence.reviewEntrypoints.find((item) => item.key === 'judge-quickstart')?.url, JUDGE_QUICKSTART_URL)
assertEqual('repo link stays on Injective integration repo', evidence.reviewEntrypoints.find((item) => item.key === 'github-repo')?.url, INTEGRATION_REPOSITORY_URL)
assertEqual('demo video link stays public', evidence.reviewEntrypoints.find((item) => item.key === 'demo-video')?.url, DEMO_VIDEO_URL)
assertEqual('demo video entrypoint type', evidence.reviewEntrypoints.find((item) => item.key === 'demo-video')?.type, 'video')
assertEqual('agentId 43 link', evidence.reviewLinks.find((item) => item.key === 'frost-agent-43')?.url, scanUrlForAgent(43))
assertEqual('owner wallet link', evidence.reviewLinks.find((item) => item.key === 'owner-wallet')?.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('real handshake link', evidence.reviewLinks.find((item) => item.key === 'real-handshake-tx')?.url, scanUrlForTx(TIMELINE_EVENTS.at(-1).hash))
assertEqual('hardware bridge API entrypoint', evidence.reviewEntrypoints.find((item) => item.key === 'hardware-bridge-api')?.path, '/api/injective?tool=get-hardware-bridge-proof')
assertEqual('review link count', evidence.reviewLinks.length, REVIEW_LINKS.length)
assertTrue('recording order array', Array.isArray(evidence.recordingOrder))
assertEqual('recording order count', evidence.recordingOrder.length, 8)
assertTrue('recording order starts from #43', evidence.recordingOrder?.[0]?.url === scanUrlForAgent(43))
assertTrue('recording order includes public evidence API', evidence.recordingOrder?.some((item) => item.path === '/api/injective?tool=get-chain-evidence'))
assertTrue('recording order includes agent proof API', evidence.recordingOrder?.some((item) => item.path === evidence.verification?.agentProofApi))
assertTrue('recording order includes fleet API', evidence.recordingOrder?.some((item) => item.path === evidence.verification?.listAgentsApi))
assertTrue('recording order includes wallet timeline API', evidence.recordingOrder?.some((item) => item.path === evidence.verification?.walletTimelineApi))
assertTrue('recording order includes hardware proof API', evidence.recordingOrder?.some((item) => item.path === evidence.verification?.hardwareBridgeApi))
assertFocusIncludes('recording step 1', evidence.recordingOrder[0], 'agentId 43')
assertFocusIncludes('recording step 1', evidence.recordingOrder[0], 'owner')
assertFocusIncludes('recording step 2', evidence.recordingOrder[1], 'same wallet')
assertFocusIncludes('recording step 2', evidence.recordingOrder[1], 'SocialHandshake deployment transaction')
assertFocusIncludes('recording step 2', evidence.recordingOrder[1], 'real handshake transaction')
assertFocusIncludes('recording step 3', evidence.recordingOrder[2], 'registryMintSummary')
assertFocusIncludes('recording step 3', evidence.recordingOrder[2], 'timelineSummary')
assertFocusIncludes('recording step 3', evidence.recordingOrder[2], 'handshakeProof')
assertFocusIncludes('recording step 3', evidence.recordingOrder[2], 'agentA/agentB/score/profileHash')
assertFocusIncludes('recording step 3', evidence.recordingOrder[2], 'creation/runtime bytecode')
assertFocusIncludes('recording step 3', evidence.recordingOrder[2], 'sourceControl')
assertFocusIncludes('recording step 4', evidence.recordingOrder[3], 'agentId 43')
assertFocusIncludes('recording step 4', evidence.recordingOrder[3], 'sourceControl')
assertFocusIncludes('recording step 5', evidence.recordingOrder[4], `builderCode=${BUILDER_CODE}`)
assertFocusIncludes('recording step 5', evidence.recordingOrder[4], 'agentId 43-47')
assertFocusIncludes('recording step 6', evidence.recordingOrder[5], 'allSucceeded')
assertFocusIncludes('recording step 6', evidence.recordingOrder[5], `chainId ${INJECTIVE_TESTNET_CHAIN_ID}`)
assertFocusIncludes('recording step 6', evidence.recordingOrder[5], 'handshake')
assertFocusIncludes('recording step 6', evidence.recordingOrder[5], 'agentA/agentB/score/profileHash')
assertFocusIncludes('recording step 6', evidence.recordingOrder[5], 'creation/runtime bytecode')
assertFocusIncludes('recording step 7', evidence.recordingOrder[6], 'Frost Edge Node')
assertFocusIncludes('recording step 7', evidence.recordingOrder[6], 'chain_dispatch')
assertFocusIncludes('recording step 7', evidence.recordingOrder[6], 'privacyBoundary.hardware')
assertFocusIncludes('recording step 7', evidence.recordingOrder[6], 'hardwareBridge.serviceBoundary')
assertFocusIncludes('recording step 7', evidence.recordingOrder[6], 'hardwareBridge.roadmapBoundary')
assertFocusIncludes('recording step 8', evidence.recordingOrder[7], 'public-plaza')
assertFocusIncludes('recording step 8', evidence.recordingOrder[7], 'agent-plaza')
assertFocusIncludes('recording step 8', evidence.recordingOrder[7], 'hardware proof API')

console.log('\nJudge runbook')
assertTrue('judgeRunbook object', !!evidence.judgeRunbook && typeof evidence.judgeRunbook === 'object')
assertEqual('judgeRunbook title', evidence.judgeRunbook.title, JUDGE_RUNBOOK.title)
assertEqual('judgeRunbook estimated seconds', evidence.judgeRunbook.estimatedSeconds, 60)
assertEqual('judgeRunbook quickstart URL', evidence.judgeRunbook.quickstartUrl, JUDGE_QUICKSTART_URL)
assertEqual('judgeRunbook publicOnly', evidence.judgeRunbook.publicOnly, true)
assertTrue('judgeRunbook steps array', Array.isArray(evidence.judgeRunbook.steps))
assertEqual('judgeRunbook step count', evidence.judgeRunbook.steps.length, JUDGE_RUNBOOK.steps.length)
assertEqual('judgeRunbook step 1 URL', evidence.judgeRunbook.steps[0]?.url, scanUrlForAgent(43))
assertEqual('judgeRunbook step 2 URL', evidence.judgeRunbook.steps[1]?.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('judgeRunbook step 3 path', evidence.judgeRunbook.steps[2]?.path, '/api/injective?tool=get-chain-evidence')
assertTrue('judgeRunbook step 4 paths include agent proof', evidence.judgeRunbook.steps[3]?.paths?.includes(evidence.verification?.agentProofApi))
assertTrue('judgeRunbook step 4 paths include fleet', evidence.judgeRunbook.steps[3]?.paths?.includes(evidence.verification?.listAgentsApi))
assertTrue('judgeRunbook step 4 paths include wallet timeline', evidence.judgeRunbook.steps[3]?.paths?.includes(evidence.verification?.walletTimelineApi))
assertTrue('judgeRunbook step 4 paths include hardware proof', evidence.judgeRunbook.steps[3]?.paths?.includes(evidence.verification?.hardwareBridgeApi))
assertEqual('judgeRunbook step 5 command', evidence.judgeRunbook.steps[4]?.command, 'npm run verify:demo')
for (const [index, step] of evidence.judgeRunbook.steps.entries()) {
  assertEqual(`judgeRunbook step ${index + 1} number`, step.step, index + 1)
  assertTrue(`judgeRunbook step ${index + 1} key`, String(step.key || '').length > 4)
  assertTrue(`judgeRunbook step ${index + 1} action`, String(step.action || '').length > 10)
  assertTrue(`judgeRunbook step ${index + 1} verifies`, String(step.verifies || '').length > 20)
  assertTrue(`judgeRunbook step ${index + 1} focus`, Array.isArray(step.focus) && step.focus.length >= 3)
  assertTrue(`judgeRunbook step ${index + 1} localCheck`, String(step.localCheck || '').startsWith('npm run verify:'))
}
assertTextIncludes('judgeRunbook public evidence step', evidence.judgeRunbook.steps[2]?.verifies, ['sourceControl', 'publicReadApis', 'hardwareBridge', 'reviewEntrypoints'])
assertListIncludes('judgeRunbook public evidence focus', evidence.judgeRunbook.steps[2]?.focus, ['sourceControl', 'publicReadApis', 'hardwareBridge', 'reviewEntrypoints'])

console.log('\nFleet and timeline are review-ready')
assertEqual('fleet agent count', evidence.agents.length, FLEET_AGENTS.length)
for (const agent of FLEET_AGENTS) {
  const actual = evidence.agents.find((item) => Number(item.agentId) === Number(agent.id))
  const mintEvent = REGISTRY_MINT_EVENTS.find((event) => Number(event.agentId) === Number(agent.id))
  assertTrue(`agent ${agent.id} exists`, !!actual)
  assertTrue(`agent ${agent.id} mint event exists`, !!mintEvent)
  assertEqual(`agent ${agent.id} owner`, actual.owner, PROOF_OWNER)
  assertEqual(`agent ${agent.id} builderCode`, actual.builderCode, BUILDER_CODE)
  assertEqual(`agent ${agent.id} registry`, actual.registry, IDENTITY_REGISTRY)
  assertEqual(`agent ${agent.id} registryScanUrl`, actual.registryScanUrl, scanUrlForRegistry())
  assertEqual(`agent ${agent.id} mintedFromZero`, actual.mintedFromZero, true)
  assertEqual(`agent ${agent.id} mintTransactionHash`, actual.mintTransactionHash, mintEvent.transactionHash)
  assertEqual(`agent ${agent.id} mintBlockNumber`, actual.mintBlockNumber, mintEvent.blockNumber)
  assertEqual(`agent ${agent.id} mintScanUrl`, actual.mintScanUrl, mintEvent.scanUrl)
  assertEqual(`agent ${agent.id} proofApi`, actual.proofApi, `/api/injective?tool=get-agent-proof&agentId=${Number(agent.id)}`)
  assertEqual(`agent ${agent.id} scanUrl`, actual.scanUrl, scanUrlForAgent(agent.id))
}
assertEqual('registry mint event count', evidence.registryMintEvents.length, REGISTRY_MINT_EVENTS.length)
for (const event of REGISTRY_MINT_EVENTS) {
  const actual = evidence.registryMintEvents.find((item) => Number(item.agentId) === event.agentId)
  assertTrue(`registry mint agent ${event.agentId} exists`, !!actual)
  assertEqual(`registry mint agent ${event.agentId} from`, actual.from, REGISTRY_MINT_ZERO_ADDRESS)
  assertEqual(`registry mint agent ${event.agentId} to`, actual.to, PROOF_OWNER)
  assertEqual(`registry mint agent ${event.agentId} transactionHash`, actual.transactionHash, event.transactionHash)
  assertEqual(`registry mint agent ${event.agentId} block`, actual.blockNumber, event.blockNumber)
  assertEqual(`registry mint agent ${event.agentId} scanUrl`, actual.scanUrl, scanUrlForTx(event.transactionHash))
}
assertTrue('registry mint summary object', !!evidence.registryMintSummary && typeof evidence.registryMintSummary === 'object')
assertEqual('registry mint summary owner', evidence.registryMintSummary.owner, PROOF_OWNER)
assertEqual('registry mint summary owner scanUrl', evidence.registryMintSummary.ownerScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('registry mint summary registry', evidence.registryMintSummary.registry, IDENTITY_REGISTRY)
assertEqual('registry mint summary event count', evidence.registryMintSummary.eventCount, REGISTRY_MINT_EVENTS.length)
assertEqual('registry mint summary agent ids', evidence.registryMintSummary.agentIds.join(','), REGISTRY_MINT_EVENTS.map((event) => event.agentId).join(','))
assertEqual('registry mint summary all mint from zero', evidence.registryMintSummary.allMintFromZero, true)
assertEqual('registry mint summary all to owner', evidence.registryMintSummary.allToOwner, true)
assertEqual('registry mint summary first block', evidence.registryMintSummary.firstBlock, REGISTRY_MINT_EVENTS[0].blockNumber)
assertEqual('registry mint summary last block', evidence.registryMintSummary.lastBlock, REGISTRY_MINT_EVENTS.at(-1).blockNumber)
assertEqual('registry mint summary local verification', evidence.registryMintSummary.localVerification, evidence.verification?.registryEvents)
assertEqual('registry mint checklist command', evidence.reviewChecklist.find((item) => item.key === 'registry-mint-events')?.machineCheck, 'npm run verify:registry')
assertEqual('timeline count', evidence.timeline.length, TIMELINE_EVENTS.length)
for (const event of TIMELINE_EVENTS) {
  const actual = evidence.timeline.find((item) => item.hash === event.hash)
  assertTrue(`timeline ${event.role} exists`, !!actual)
  assertEqual(`timeline ${event.role} from`, actual.from, PROOF_OWNER)
  assertEqual(`timeline ${event.role} to`, actual.to, event.to)
  assertEqual(`timeline ${event.role} expectedStatus`, actual.expectedStatus, 'success')
  assertEqual(`timeline ${event.role} scanUrl`, actual.scanUrl, scanUrlForTx(event.hash))
}
assertTrue('timeline summary object', !!evidence.timelineSummary && typeof evidence.timelineSummary === 'object')
assertEqual('timeline summary owner', evidence.timelineSummary.owner, PROOF_OWNER)
assertEqual('timeline summary wallet scanUrl', evidence.timelineSummary.walletScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('timeline summary event count', evidence.timelineSummary.eventCount, TIMELINE_EVENTS.length)
assertEqual('timeline summary all from owner', evidence.timelineSummary.allFromOwner, true)
assertEqual('timeline summary expectedStatus', evidence.timelineSummary.expectedStatus, 'success')
assertEqual('timeline summary first block', evidence.timelineSummary.firstBlock, TIMELINE_EVENTS[0].blockNumber)
assertEqual('timeline summary last block', evidence.timelineSummary.lastBlock, TIMELINE_EVENTS.at(-1).blockNumber)
assertEqual('timeline summary first role', evidence.timelineSummary.firstRole, TIMELINE_EVENTS[0].role)
assertEqual('timeline summary last role', evidence.timelineSummary.lastRole, TIMELINE_EVENTS.at(-1).role)
assertEqual('timeline summary RPC verification', evidence.timelineSummary.rpcVerification, evidence.verification?.walletTimelineApi)

console.log('\nVerification commands remain runnable')
assertEqual('public proof command is advertised', evidence.verification?.publicProof, 'npm run verify:public-proof')
assertEqual('public read APIs command is advertised', evidence.verification?.publicReadApis, 'npm run verify:public-apis')
assertEqual('integration guide command is advertised', evidence.verification?.integrationGuide, 'npm run verify:integration-guide')
assertEqual('github repo command is advertised', evidence.verification?.githubRepo, 'npm run verify:github')
assertEqual('source control command is advertised', evidence.verification?.sourceControl, 'npm run verify:source')
assertEqual('registry events command is advertised', evidence.verification?.registryEvents, 'npm run verify:registry')
assertEqual('pitch notes command is advertised', evidence.verification?.pitchNotes, 'npm run verify:pitch')
assertEqual('judge quickstart command is advertised', evidence.verification?.judgeQuickstart, 'npm run verify:judge')
for (const [label, command] of collectCommands(evidence)) assertKnownCommand(label, command)

console.log('\nPublic-only leak guard')
const publicText = JSON.stringify(evidence)
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
  assertTrue(`evidence omits ${forbidden}`, !publicText.includes(forbidden))
}

console.log('\nPublic URL guard')
const allowedHosts = new Set([
  'github.com',
  'investors.raspberrypi.com',
  'pocketearth.throughtheglass.art',
  'testnet.blockscout.injective.network',
  'youtu.be',
])
for (const { path, value } of flattenStrings(evidence)) {
  if (!value.startsWith('http')) continue
  const url = new URL(value)
  assertEqual(`${path} uses https`, url.protocol, 'https:')
  assertTrue(`${path} host is allowed public host`, allowedHosts.has(url.host))
}

console.log('\nOK public evidence package is a stable, public-only review contract.')
