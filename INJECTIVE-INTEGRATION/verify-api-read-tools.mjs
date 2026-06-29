// Verify Pocket Earth's own /api/injective read-only tools against Injective testnet.
// Usage: node INJECTIVE-INTEGRATION/verify-api-read-tools.mjs
import { handleInjective } from '../injective-service.mjs'
import { BUILDER_CODE, COMPETITION_ALIGNMENT, DEMO_VIDEO_LIMIT_SECONDS, EVIDENCE_PRIVACY_BOUNDARY, FLEET_AGENTS, IDENTITY_REGISTRY, INJECTIVE_TESTNET_CHAIN_ID, PLAZA_DEMO_FLOW, PROOF_OWNER, REGISTRY_MINT_EVENTS, REGISTRY_MINT_ZERO_ADDRESS, REVIEW_BRIEF, REVIEW_CHECKLIST, REVIEW_LINKS, SOCIAL_HANDSHAKE, SUBMISSION_CHECKLIST, SUBMISSION_LINKS, SUBMISSION_REPOSITORY_URL, TIMELINE_EVENTS, scanUrlForAgent, scanUrlForAddress, scanUrlForRegistry, scanUrlForTx } from './chain-proof-data.mjs'

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

let ping, status, reputation, evidence, timeline
try {
  ping = await callInjectiveApi('/api/injective?tool=ping')
  status = await callInjectiveApi('/api/injective?tool=get-status&agentId=43')
  reputation = await callInjectiveApi('/api/injective?tool=get-reputation&agentId=43')
  evidence = await callInjectiveApi('/api/injective?tool=get-chain-evidence')
  timeline = await callInjectiveApi('/api/injective?tool=get-wallet-timeline')
} finally {
  console.warn = originalWarn
  console.error = originalError
}

console.log('\n/api ping')
assertEqual('ping sdk flag', ping.sdk, true)
assertEqual('ping reachable', ping.reachable, true)
assertEqual('ping network', ping.network, 'testnet')

console.log('\n/api get-status agentId 43')
assertEqual('status agentId', status.agentId, 43)
assertEqual('status owner', status.owner, PROOF_OWNER)
assertEqual('status wallet', status.wallet, PROOF_OWNER)
assertEqual('status builderCode', status.builderCode, BUILDER_CODE)
assertEqual('status identity registry', String(status.identityTuple || '').split(':')[2], IDENTITY_REGISTRY)

console.log('\n/api get-reputation agentId 43')
assertTrue('reputation score is numeric', Number.isFinite(Number(reputation.score)))
assertTrue('reputation count is numeric', Number.isFinite(Number(reputation.count)))
assertTrue('reputation clients array', Array.isArray(reputation.clients))

console.log('\n/api get-chain-evidence')
assertEqual('evidence ok', evidence.ok, true)
assertEqual('evidence network', evidence.network, 'testnet')
assertEqual('evidence chainId', evidence.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('evidence readOnly', evidence.readOnly, true)
assertEqual('evidence publicOnly', evidence.publicOnly, true)
assertEqual('evidence demo video limit seconds', evidence.demoVideoLimitSeconds, DEMO_VIDEO_LIMIT_SECONDS)
assertEqual('evidence builderCode', evidence.builderCode, BUILDER_CODE)
assertTrue('evidence sourceControl object', !!evidence.sourceControl && typeof evidence.sourceControl === 'object')
assertEqual('evidence sourceControl repository', evidence.sourceControl.repository, SUBMISSION_REPOSITORY_URL)
assertEqual('evidence sourceControl branch', evidence.sourceControl.branch, 'main')
assertTrue('evidence sourceControl commit is sha or null', evidence.sourceControl.commit === null || /^[0-9a-f]{40}$/i.test(evidence.sourceControl.commit))
assertEqual('evidence sourceControl evidence API', evidence.sourceControl.evidenceApi, '/api/injective?tool=get-chain-evidence')
assertEqual('evidence owner', evidence.owner, PROOF_OWNER)
assertEqual('evidence owner scanUrl', evidence.ownerScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('evidence registry', evidence.registry, IDENTITY_REGISTRY)
assertEqual('evidence registry scanUrl', evidence.registryScanUrl, scanUrlForRegistry())
assertEqual('evidence handshake contract', evidence.handshakeContract, SOCIAL_HANDSHAKE)
assertEqual('evidence handshake scanUrl', evidence.handshakeScanUrl, scanUrlForAddress(SOCIAL_HANDSHAKE))
assertTrue('evidence review links array', Array.isArray(evidence.reviewLinks))
assertEqual('evidence review links count', evidence.reviewLinks.length, REVIEW_LINKS.length)
assertEqual('evidence review links first key', evidence.reviewLinks[0]?.key, 'frost-agent-43')
assertEqual('evidence review links wallet', evidence.reviewLinks.find((link) => link.key === 'owner-wallet')?.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('evidence review links handshake tx', evidence.reviewLinks.find((link) => link.key === 'real-handshake-tx')?.url, scanUrlForTx(TIMELINE_EVENTS.at(-1).hash))
assertTrue('evidence review brief object', !!evidence.reviewBrief && typeof evidence.reviewBrief === 'object')
assertEqual('evidence review brief title', evidence.reviewBrief.title, REVIEW_BRIEF.title)
assertEqual('evidence review brief core count', evidence.reviewBrief.injectiveCore?.length, REVIEW_BRIEF.injectiveCore.length)
assertTrue('evidence review brief names product chain loop', evidence.reviewBrief.injectiveCore?.some((item) => item.key === 'product-loop'))
assertTrue('evidence review brief maps Injective execution', evidence.reviewBrief.contestFit?.some((item) => item.alignmentKey === 'injective-execution-layer'))
assertTrue('evidence review checklist array', Array.isArray(evidence.reviewChecklist))
assertEqual('evidence review checklist count', evidence.reviewChecklist.length, REVIEW_CHECKLIST.length)
assertEqual('evidence review checklist first key', evidence.reviewChecklist[0]?.key, 'erc8004-identity')
assertEqual('evidence review checklist registry mint command', evidence.reviewChecklist.find((item) => item.key === 'registry-mint-events')?.machineCheck, 'npm run verify:registry')
assertEqual('evidence review checklist wallet link', evidence.reviewChecklist.find((item) => item.key === 'wallet-timeline')?.primaryLinkKey, 'owner-wallet')
assertEqual('evidence review checklist product command', evidence.reviewChecklist.at(-1)?.machineCheck, 'npm run verify:plaza')
assertTrue('evidence competition alignment array', Array.isArray(evidence.competitionAlignment))
assertEqual('evidence competition alignment count', evidence.competitionAlignment.length, COMPETITION_ALIGNMENT.length)
assertTrue('evidence competition alignment includes ai-social', evidence.competitionAlignment.some((item) => item.key === 'ai-social'))
assertTrue('evidence competition alignment includes injective execution layer', evidence.competitionAlignment.some((item) => item.key === 'injective-execution-layer'))
assertTrue('evidence competition alignment includes physical hardware', evidence.competitionAlignment.some((item) => item.key === 'agent-physical-world'))
assertTrue('evidence submission links array', Array.isArray(evidence.submissionLinks))
assertEqual('evidence submission links count', evidence.submissionLinks.length, SUBMISSION_LINKS.length)
assertEqual('evidence submission repo url', evidence.submissionLinks.find((item) => item.key === 'github-repo')?.url, SUBMISSION_LINKS.find((item) => item.key === 'github-repo')?.url)
assertEqual('evidence submission live demo url', evidence.submissionLinks.find((item) => item.key === 'live-demo')?.url, SUBMISSION_LINKS.find((item) => item.key === 'live-demo')?.url)
assertEqual('evidence submission fleet api', evidence.submissionLinks.find((item) => item.key === 'agent-fleet-api')?.path, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47`)
assertTrue('evidence submission checklist array', Array.isArray(evidence.submissionChecklist))
assertEqual('evidence submission checklist count', evidence.submissionChecklist.length, SUBMISSION_CHECKLIST.length)
assertTrue('evidence submission checklist includes public GitHub', evidence.submissionChecklist.some((item) => item.key === 'public-github-readme'))
assertTrue('evidence submission checklist includes demo script', evidence.submissionChecklist.some((item) => item.key === 'demo-video-script'))
assertEqual('evidence demo script local check', evidence.submissionChecklist.find((item) => item.key === 'demo-video-script')?.localCheck, 'npm run verify:duration')
assertTrue('evidence privacy on-chain list', Array.isArray(evidence.privacyBoundary?.onChain))
assertTrue('evidence privacy off-chain list', Array.isArray(evidence.privacyBoundary?.offChain))
assertTrue('evidence privacy mentions ERC-8004 identity', evidence.privacyBoundary.onChain.includes('ERC-8004 agent identity'))
assertTrue('evidence privacy keeps precise locations off-chain', evidence.privacyBoundary.offChain.includes('precise location payloads'))
assertEqual('evidence privacy write boundary', evidence.privacyBoundary?.writeBoundary, EVIDENCE_PRIVACY_BOUNDARY.writeBoundary)
assertTrue('evidence plaza flow array', Array.isArray(evidence.plazaFlow))
assertEqual('evidence plaza flow count', evidence.plazaFlow.length, PLAZA_DEMO_FLOW.length)
assertEqual('evidence public-plaza smoke', evidence.plazaFlow[0]?.smoke, 'INJECTIVE-INTEGRATION/verify-plaza.mjs')
assertEqual('evidence agent-plaza key', evidence.plazaFlow[1]?.key, 'agent-plaza')
assertTrue('evidence agent-plaza verifies install loop', String(evidence.plazaFlow[1]?.verifies || '').includes('installs cafe-map'))
assertEqual('evidence demo readiness command', evidence.verification?.demoReadiness, 'npm run verify:demo')
assertEqual('evidence demo duration command', evidence.verification?.demoDuration, 'npm run verify:duration')
assertEqual('evidence smoke command', evidence.verification?.evidenceSmoke, 'npm run verify:evidence')
assertEqual('evidence public proof command', evidence.verification?.publicProof, 'npm run verify:public-proof')
assertEqual('evidence github repo command', evidence.verification?.githubRepo, 'npm run verify:github')
assertEqual('evidence pitch notes command', evidence.verification?.pitchNotes, 'npm run verify:pitch')
assertEqual('evidence judge quickstart command', evidence.verification?.judgeQuickstart, 'npm run verify:judge')
assertEqual('evidence review brief command', evidence.verification?.reviewBrief, 'npm run verify:brief')
assertEqual('evidence review checklist command', evidence.verification?.reviewChecklist, 'npm run verify:review')
assertEqual('evidence review links command', evidence.verification?.reviewLinks, 'npm run verify:review-links')
assertEqual('evidence recording order command', evidence.verification?.recordingOrder, 'npm run verify:recording-order')
assertEqual('evidence wallet timeline command', evidence.verification?.walletTimeline, 'npm run verify:wallet')
assertEqual('evidence source control command', evidence.verification?.sourceControl, 'npm run verify:source')
assertEqual('evidence registry events command', evidence.verification?.registryEvents, 'npm run verify:registry')
assertEqual('evidence plaza flow command', evidence.verification?.plazaFlow, 'npm run verify:plaza-flow')
assertEqual('evidence nova alignment command', evidence.verification?.novaAlignment, 'npm run verify:nova-alignment')
assertEqual('evidence submission pack command', evidence.verification?.submissionPack, 'npm run verify:submission')
assertEqual('evidence proof suite command', evidence.verification?.proofSuite, 'npm run verify:injective')
assertEqual('evidence api read tools command', evidence.verification?.apiReadTools, 'node INJECTIVE-INTEGRATION/verify-api-read-tools.mjs')
assertEqual('evidence list-agents api', evidence.verification?.listAgentsApi, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=${Math.max(...FLEET_AGENTS.map((agent) => Number(agent.id)))}`)
assertEqual('evidence wallet timeline api', evidence.verification?.walletTimelineApi, '/api/injective?tool=get-wallet-timeline')
assertTrue('evidence recording order array', Array.isArray(evidence.recordingOrder))
assertEqual('evidence recording order count', evidence.recordingOrder.length, 6)
assertEqual('evidence recording step 1 url', evidence.recordingOrder[0]?.url, scanUrlForAgent(43))
assertEqual('evidence recording step 2 url', evidence.recordingOrder[1]?.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('evidence recording step 3 path', evidence.recordingOrder[2]?.path, '/api/injective?tool=get-chain-evidence')
assertEqual('evidence recording step 4 path', evidence.recordingOrder[3]?.path, evidence.verification?.listAgentsApi)
assertEqual('evidence recording step 5 path', evidence.recordingOrder[4]?.path, evidence.verification?.walletTimelineApi)
assertEqual('evidence recording step 6 command', evidence.recordingOrder[5]?.command, 'npm run verify:plaza')
assertFocusIncludes('evidence recording step 1', evidence.recordingOrder[0], 'agentId 43')
assertFocusIncludes('evidence recording step 2', evidence.recordingOrder[1], 'same wallet')
assertFocusIncludes('evidence recording step 3', evidence.recordingOrder[2], 'registryMintSummary')
assertFocusIncludes('evidence recording step 3', evidence.recordingOrder[2], 'sourceControl')
assertFocusIncludes('evidence recording step 4', evidence.recordingOrder[3], 'builderCode=pocket-earth')
assertFocusIncludes('evidence recording step 4', evidence.recordingOrder[3], 'agentId 43-47')
assertFocusIncludes('evidence recording step 5', evidence.recordingOrder[4], 'allSucceeded')
assertFocusIncludes('evidence recording step 6', evidence.recordingOrder[5], 'public-plaza')
assertFocusIncludes('evidence recording step 6', evidence.recordingOrder[5], 'agent-plaza')
assertTrue('evidence agents array', Array.isArray(evidence.agents))
assertEqual('evidence agent count', evidence.agents.length, FLEET_AGENTS.length)
for (const expected of FLEET_AGENTS) {
  const actual = evidence.agents.find((agent) => Number(agent.agentId) === Number(expected.id))
  assertTrue(`evidence agent ${expected.id} present`, !!actual)
  assertEqual(`evidence agent ${expected.id} label`, actual.label, expected.label)
  assertEqual(`evidence agent ${expected.id} scanUrl`, actual.scanUrl, scanUrlForAgent(expected.id))
  if (expected.requiredTag) assertEqual(`evidence agent ${expected.id} requiredTag`, actual.requiredTag, expected.requiredTag)
}
assertTrue('evidence registry mint events array', Array.isArray(evidence.registryMintEvents))
assertEqual('evidence registry mint event count', evidence.registryMintEvents.length, REGISTRY_MINT_EVENTS.length)
for (const expected of REGISTRY_MINT_EVENTS) {
  const actual = evidence.registryMintEvents.find((event) => Number(event.agentId) === expected.agentId)
  assertTrue(`evidence registry mint agent ${expected.agentId} present`, !!actual)
  assertEqual(`evidence registry mint agent ${expected.agentId} from`, actual.from, REGISTRY_MINT_ZERO_ADDRESS)
  assertEqual(`evidence registry mint agent ${expected.agentId} to`, actual.to, PROOF_OWNER)
  assertEqual(`evidence registry mint agent ${expected.agentId} transactionHash`, actual.transactionHash, expected.transactionHash)
  assertEqual(`evidence registry mint agent ${expected.agentId} block`, actual.blockNumber, expected.blockNumber)
  assertEqual(`evidence registry mint agent ${expected.agentId} scanUrl`, actual.scanUrl, scanUrlForTx(expected.transactionHash))
  assertEqual(`evidence registry mint agent ${expected.agentId} agentScanUrl`, actual.agentScanUrl, scanUrlForAgent(expected.agentId))
}
assertTrue('evidence registry mint summary object', !!evidence.registryMintSummary && typeof evidence.registryMintSummary === 'object')
assertEqual('evidence registry mint summary owner', evidence.registryMintSummary.owner, PROOF_OWNER)
assertEqual('evidence registry mint summary owner scanUrl', evidence.registryMintSummary.ownerScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('evidence registry mint summary registry', evidence.registryMintSummary.registry, IDENTITY_REGISTRY)
assertEqual('evidence registry mint summary registry scanUrl', evidence.registryMintSummary.registryScanUrl, scanUrlForRegistry())
assertEqual('evidence registry mint summary event count', evidence.registryMintSummary.eventCount, REGISTRY_MINT_EVENTS.length)
assertEqual('evidence registry mint summary agent ids', evidence.registryMintSummary.agentIds.join(','), REGISTRY_MINT_EVENTS.map((event) => event.agentId).join(','))
assertEqual('evidence registry mint summary all mint from zero', evidence.registryMintSummary.allMintFromZero, true)
assertEqual('evidence registry mint summary all to owner', evidence.registryMintSummary.allToOwner, true)
assertEqual('evidence registry mint summary first block', evidence.registryMintSummary.firstBlock, REGISTRY_MINT_EVENTS[0].blockNumber)
assertEqual('evidence registry mint summary last block', evidence.registryMintSummary.lastBlock, REGISTRY_MINT_EVENTS.at(-1).blockNumber)
assertEqual('evidence registry mint summary local verification', evidence.registryMintSummary.localVerification, evidence.verification?.registryEvents)
assertTrue('evidence timeline array', Array.isArray(evidence.timeline))
assertEqual('evidence timeline count', evidence.timeline.length, TIMELINE_EVENTS.length)
for (const expected of TIMELINE_EVENTS) {
  const actual = evidence.timeline.find((event) => event.hash === expected.hash)
  assertTrue(`evidence timeline ${expected.role} present`, !!actual)
  assertEqual(`evidence timeline ${expected.role} from`, actual.from, PROOF_OWNER)
  assertEqual(`evidence timeline ${expected.role} to`, actual.to, expected.to)
  assertEqual(`evidence timeline ${expected.role} expectedStatus`, actual.expectedStatus, 'success')
  assertEqual(`evidence timeline ${expected.role} block`, actual.blockNumber, expected.blockNumber)
  assertEqual(`evidence timeline ${expected.role} timestamp`, actual.timestamp, expected.timestamp)
  assertEqual(`evidence timeline ${expected.role} scanUrl`, actual.scanUrl, scanUrlForTx(expected.hash))
}
assertTrue('evidence timeline summary object', !!evidence.timelineSummary && typeof evidence.timelineSummary === 'object')
assertEqual('evidence timeline summary owner', evidence.timelineSummary.owner, PROOF_OWNER)
assertEqual('evidence timeline summary wallet scanUrl', evidence.timelineSummary.walletScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('evidence timeline summary event count', evidence.timelineSummary.eventCount, TIMELINE_EVENTS.length)
assertEqual('evidence timeline summary all from owner', evidence.timelineSummary.allFromOwner, true)
assertEqual('evidence timeline summary expectedStatus', evidence.timelineSummary.expectedStatus, 'success')
assertEqual('evidence timeline summary first block', evidence.timelineSummary.firstBlock, TIMELINE_EVENTS[0].blockNumber)
assertEqual('evidence timeline summary last block', evidence.timelineSummary.lastBlock, TIMELINE_EVENTS.at(-1).blockNumber)
assertEqual('evidence timeline summary first role', evidence.timelineSummary.firstRole, TIMELINE_EVENTS[0].role)
assertEqual('evidence timeline summary last role', evidence.timelineSummary.lastRole, TIMELINE_EVENTS.at(-1).role)
assertEqual('evidence timeline summary RPC verification', evidence.timelineSummary.rpcVerification, evidence.verification?.walletTimelineApi)

console.log('\n/api get-wallet-timeline')
assertEqual('timeline ok', timeline.ok, true)
assertEqual('timeline owner', timeline.owner, PROOF_OWNER)
assertEqual('timeline registry', timeline.registry, IDENTITY_REGISTRY)
assertEqual('timeline handshake contract', timeline.handshakeContract, SOCIAL_HANDSHAKE)
assertTrue('timeline events array', Array.isArray(timeline.events))
assertEqual('timeline event count', timeline.events.length, TIMELINE_EVENTS.length)
assertTrue('timeline summary object', !!timeline.summary && typeof timeline.summary === 'object')
assertEqual('timeline summary owner', timeline.summary.owner, PROOF_OWNER)
assertEqual('timeline summary wallet scanUrl', timeline.summary.walletScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('timeline summary event count', timeline.summary.eventCount, TIMELINE_EVENTS.length)
assertEqual('timeline summary all from owner', timeline.summary.allFromOwner, true)
assertEqual('timeline summary all succeeded', timeline.summary.allSucceeded, true)
assertEqual('timeline summary first block', timeline.summary.firstBlock, TIMELINE_EVENTS[0].blockNumber)
assertEqual('timeline summary last block', timeline.summary.lastBlock, TIMELINE_EVENTS.at(-1).blockNumber)
assertEqual('timeline summary first role', timeline.summary.firstRole, TIMELINE_EVENTS[0].role)
assertEqual('timeline summary last role', timeline.summary.lastRole, TIMELINE_EVENTS.at(-1).role)
assertEqual('timeline summary evidence API', timeline.summary.evidenceApi, '/api/injective?tool=get-chain-evidence')
assertEqual('timeline first role', timeline.events[0].role, TIMELINE_EVENTS[0].role)
assertEqual('timeline first block', timeline.events[0].blockNumber, TIMELINE_EVENTS[0].blockNumber)
assertEqual('timeline first timestamp', timeline.events[0].timestamp, TIMELINE_EVENTS[0].timestamp)
assertEqual('timeline deployment contract', timeline.events[1].contractAddress, SOCIAL_HANDSHAKE)
assertEqual('timeline final role', timeline.events.at(-1).role, TIMELINE_EVENTS.at(-1).role)
assertEqual('timeline final to', timeline.events.at(-1).to, SOCIAL_HANDSHAKE)
assertEqual('timeline final timestamp', timeline.events.at(-1).timestamp, TIMELINE_EVENTS.at(-1).timestamp)
for (let i = 1; i < timeline.events.length; i += 1) {
  assertTrue(`timeline block order ${i}`, BigInt(timeline.events[i - 1].blockNumber) <= BigInt(timeline.events[i].blockNumber))
}

if (sdkWarnings.length) {
  console.log('\nNOTE Agent SDK card fetch warnings were suppressed; API read-tool fields were verified directly.')
}

console.log('\nOK /api/injective ping, get-status, get-reputation, get-chain-evidence, and get-wallet-timeline read from Injective testnet.')
