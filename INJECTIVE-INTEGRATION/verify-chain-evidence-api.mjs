// Quick smoke for the public /api/injective?tool=get-chain-evidence package.
// Usage: npm run verify:evidence
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  EVIDENCE_PRIVACY_BOUNDARY,
  FLEET_AGENTS,
  IDENTITY_REGISTRY,
  INJECTIVE_TESTNET_CHAIN_ID,
  PLAZA_DEMO_FLOW,
  PROOF_OWNER,
  SOCIAL_HANDSHAKE,
  TIMELINE_EVENTS,
  scanUrlForAddress,
  scanUrlForAgent,
  scanUrlForRegistry,
  scanUrlForTx,
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

const evidence = await callEvidenceApi()

console.log('\nPublic evidence envelope')
assertEqual('ok', evidence.ok, true)
assertEqual('network', evidence.network, 'testnet')
assertEqual('chainId', evidence.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('readOnly', evidence.readOnly, true)
assertEqual('publicOnly', evidence.publicOnly, true)
assertEqual('builderCode', evidence.builderCode, BUILDER_CODE)
assertEqual('owner', evidence.owner, PROOF_OWNER)
assertEqual('ownerScanUrl', evidence.ownerScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('registry', evidence.registry, IDENTITY_REGISTRY)
assertEqual('registryScanUrl', evidence.registryScanUrl, scanUrlForRegistry())
assertEqual('handshakeContract', evidence.handshakeContract, SOCIAL_HANDSHAKE)
assertEqual('handshakeScanUrl', evidence.handshakeScanUrl, scanUrlForAddress(SOCIAL_HANDSHAKE))
assertTrue('privacy boundary on-chain list', Array.isArray(evidence.privacyBoundary?.onChain))
assertTrue('privacy boundary off-chain list', Array.isArray(evidence.privacyBoundary?.offChain))
assertEqual('privacy boundary write rule', evidence.privacyBoundary?.writeBoundary, EVIDENCE_PRIVACY_BOUNDARY.writeBoundary)
for (const item of EVIDENCE_PRIVACY_BOUNDARY.offChain) {
  assertTrue(`privacy boundary keeps off-chain: ${item}`, evidence.privacyBoundary.offChain.includes(item))
}
assertTrue('plaza flow array', Array.isArray(evidence.plazaFlow))
assertEqual('plaza flow count', evidence.plazaFlow.length, PLAZA_DEMO_FLOW.length)
assertEqual('plaza flow first key', evidence.plazaFlow[0]?.key, 'public-plaza')
assertEqual('plaza flow first chain read', evidence.plazaFlow[0]?.chainRead, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47`)
assertEqual('plaza flow second key', evidence.plazaFlow[1]?.key, 'agent-plaza')
assertTrue('plaza flow second smoke mentions install', String(evidence.plazaFlow[1]?.smoke || '').includes('verify-plaza-install.mjs'))

console.log('\nAgent fleet evidence')
assertTrue('agents array', Array.isArray(evidence.agents))
assertEqual('agent count', evidence.agents.length, FLEET_AGENTS.length)
for (const expected of FLEET_AGENTS) {
  const actual = evidence.agents.find((agent) => Number(agent.agentId) === Number(expected.id))
  assertTrue(`agent ${expected.id} present`, !!actual)
  assertEqual(`agent ${expected.id} label`, actual.label, expected.label)
  assertEqual(`agent ${expected.id} scanUrl`, actual.scanUrl, scanUrlForAgent(expected.id))
  if (expected.requiredTag) assertEqual(`agent ${expected.id} requiredTag`, actual.requiredTag, expected.requiredTag)
}

console.log('\nTimeline evidence')
assertTrue('timeline array', Array.isArray(evidence.timeline))
assertEqual('timeline count', evidence.timeline.length, TIMELINE_EVENTS.length)
for (const expected of TIMELINE_EVENTS) {
  const actual = evidence.timeline.find((event) => event.hash === expected.hash)
  assertTrue(`timeline ${expected.role} present`, !!actual)
  assertEqual(`timeline ${expected.role} block`, actual.blockNumber, expected.blockNumber)
  assertEqual(`timeline ${expected.role} timestamp`, actual.timestamp, expected.timestamp)
  assertEqual(`timeline ${expected.role} scanUrl`, actual.scanUrl, scanUrlForTx(expected.hash))
}

console.log('\nReviewer follow-up paths')
assertEqual('demo readiness command', evidence.verification?.demoReadiness, 'npm run verify:demo')
assertEqual('evidence smoke command', evidence.verification?.evidenceSmoke, 'npm run verify:evidence')
assertEqual('proof suite command', evidence.verification?.proofSuite, 'npm run verify:injective')
assertEqual('api read tools command', evidence.verification?.apiReadTools, 'node INJECTIVE-INTEGRATION/verify-api-read-tools.mjs')
assertEqual('list-agents api', evidence.verification?.listAgentsApi, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=${Math.max(...FLEET_AGENTS.map((agent) => Number(agent.id)))}`)
assertEqual('wallet timeline api', evidence.verification?.walletTimelineApi, '/api/injective?tool=get-wallet-timeline')

console.log('\nRecording order')
assertTrue('recording order array', Array.isArray(evidence.recordingOrder))
assertEqual('recording order count', evidence.recordingOrder.length, 6)
assertEqual('recording step 1 url', evidence.recordingOrder[0]?.url, scanUrlForAgent(43))
assertEqual('recording step 2 url', evidence.recordingOrder[1]?.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('recording step 3 path', evidence.recordingOrder[2]?.path, '/api/injective?tool=get-chain-evidence')
assertEqual('recording step 4 path', evidence.recordingOrder[3]?.path, evidence.verification?.listAgentsApi)
assertEqual('recording step 5 path', evidence.recordingOrder[4]?.path, evidence.verification?.walletTimelineApi)
assertEqual('recording step 6 command', evidence.recordingOrder[5]?.command, 'npm run verify:plaza')

console.log('\nPublic-only guard')
const evidenceText = JSON.stringify(evidence)
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB']) {
  assertTrue(`evidence omits ${forbidden}`, !evidenceText.includes(forbidden))
}

console.log('\nOK public chain evidence API is self-contained and safe to show in review.')
