// Verify Pocket Earth's own /api/injective read-only tools against Injective testnet.
// Usage: node INJECTIVE-INTEGRATION/verify-api-read-tools.mjs
import { handleInjective } from '../injective-service.mjs'
import { BUILDER_CODE, COMPETITION_ALIGNMENT, EVIDENCE_PRIVACY_BOUNDARY, FLEET_AGENTS, IDENTITY_REGISTRY, INJECTIVE_TESTNET_CHAIN_ID, PLAZA_DEMO_FLOW, PROOF_OWNER, REVIEW_BRIEF, REVIEW_CHECKLIST, REVIEW_LINKS, SOCIAL_HANDSHAKE, SUBMISSION_LINKS, TIMELINE_EVENTS, scanUrlForAgent, scanUrlForAddress, scanUrlForRegistry, scanUrlForTx } from './chain-proof-data.mjs'

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
assertEqual('evidence builderCode', evidence.builderCode, BUILDER_CODE)
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
assertEqual('evidence smoke command', evidence.verification?.evidenceSmoke, 'npm run verify:evidence')
assertEqual('evidence review brief command', evidence.verification?.reviewBrief, 'npm run verify:brief')
assertEqual('evidence review checklist command', evidence.verification?.reviewChecklist, 'npm run verify:review')
assertEqual('evidence review links command', evidence.verification?.reviewLinks, 'npm run verify:review-links')
assertEqual('evidence recording order command', evidence.verification?.recordingOrder, 'npm run verify:recording-order')
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
assertTrue('evidence agents array', Array.isArray(evidence.agents))
assertEqual('evidence agent count', evidence.agents.length, FLEET_AGENTS.length)
for (const expected of FLEET_AGENTS) {
  const actual = evidence.agents.find((agent) => Number(agent.agentId) === Number(expected.id))
  assertTrue(`evidence agent ${expected.id} present`, !!actual)
  assertEqual(`evidence agent ${expected.id} label`, actual.label, expected.label)
  assertEqual(`evidence agent ${expected.id} scanUrl`, actual.scanUrl, scanUrlForAgent(expected.id))
  if (expected.requiredTag) assertEqual(`evidence agent ${expected.id} requiredTag`, actual.requiredTag, expected.requiredTag)
}
assertTrue('evidence timeline array', Array.isArray(evidence.timeline))
assertEqual('evidence timeline count', evidence.timeline.length, TIMELINE_EVENTS.length)
for (const expected of TIMELINE_EVENTS) {
  const actual = evidence.timeline.find((event) => event.hash === expected.hash)
  assertTrue(`evidence timeline ${expected.role} present`, !!actual)
  assertEqual(`evidence timeline ${expected.role} block`, actual.blockNumber, expected.blockNumber)
  assertEqual(`evidence timeline ${expected.role} timestamp`, actual.timestamp, expected.timestamp)
  assertEqual(`evidence timeline ${expected.role} scanUrl`, actual.scanUrl, scanUrlForTx(expected.hash))
}

console.log('\n/api get-wallet-timeline')
assertEqual('timeline ok', timeline.ok, true)
assertEqual('timeline owner', timeline.owner, PROOF_OWNER)
assertEqual('timeline registry', timeline.registry, IDENTITY_REGISTRY)
assertEqual('timeline handshake contract', timeline.handshakeContract, SOCIAL_HANDSHAKE)
assertTrue('timeline events array', Array.isArray(timeline.events))
assertEqual('timeline event count', timeline.events.length, TIMELINE_EVENTS.length)
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
