// Quick smoke for the public /api/injective?tool=get-chain-evidence package.
// Usage: npm run verify:evidence
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  INTEGRATION_ALIGNMENT,
  DEMO_VIDEO_LIMIT_SECONDS,
  EVIDENCE_PRIVACY_BOUNDARY,
  FLEET_AGENTS,
  HARDWARE_BRIDGE_PROOF,
  IDENTITY_REGISTRY,
  INJECTIVE_TESTNET_CHAIN_ID,
  JUDGE_RUNBOOK,
  JUDGE_QUICKSTART_URL,
  PLAZA_DEMO_FLOW,
  PROOF_OWNER,
  REGISTRY_MINT_EVENTS,
  REGISTRY_MINT_ZERO_ADDRESS,
  REVIEW_BRIEF,
  REVIEW_CHECKLIST,
  REVIEW_LINKS,
  SOCIAL_HANDSHAKE,
  SOCIAL_HANDSHAKE_PROOF,
  DELIVERY_CHECKLIST,
  REVIEW_ENTRYPOINTS,
  INTEGRATION_REPOSITORY_URL,
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

function assertFocusIncludes(label, item, expected) {
  assertTrue(`${label} evidenceFocus array`, Array.isArray(item.evidenceFocus))
  const text = item.evidenceFocus.join(' | ')
  assertTrue(`${label} evidenceFocus includes ${expected}`, text.includes(expected))
}

function assertListIncludes(label, actual, expectedItems) {
  assertTrue(`${label} array`, Array.isArray(actual))
  for (const expected of expectedItems) assertTrue(`${label} includes ${expected}`, actual.includes(expected))
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
assertEqual('demo video limit seconds', evidence.demoVideoLimitSeconds, DEMO_VIDEO_LIMIT_SECONDS)
assertEqual('builderCode', evidence.builderCode, BUILDER_CODE)
assertTrue('sourceControl object', !!evidence.sourceControl && typeof evidence.sourceControl === 'object')
assertEqual('sourceControl repository', evidence.sourceControl.repository, INTEGRATION_REPOSITORY_URL)
assertEqual('sourceControl branch', evidence.sourceControl.branch, 'main')
assertTrue('sourceControl commit is a sha or null', evidence.sourceControl.commit === null || /^[0-9a-f]{40}$/i.test(evidence.sourceControl.commit))
if (evidence.sourceControl.commit) assertEqual('sourceControl commitUrl', evidence.sourceControl.commitUrl, `${INTEGRATION_REPOSITORY_URL}/commit/${evidence.sourceControl.commit}`)
assertEqual('sourceControl evidenceApi', evidence.sourceControl.evidenceApi, '/api/injective?tool=get-chain-evidence')
assertTrue('public read APIs array', Array.isArray(evidence.publicReadApis))
assertEqual('public read API count', evidence.publicReadApis.length, 5)
const publicReadApiByKey = new Map(evidence.publicReadApis.map((item) => [item.key, item]))
assertEqual('public read evidence API path', publicReadApiByKey.get('chain-evidence-api')?.path, '/api/injective?tool=get-chain-evidence')
assertEqual('public read agent proof API path', publicReadApiByKey.get('agent-proof-api')?.path, '/api/injective?tool=get-agent-proof&agentId=43')
assertEqual('public read fleet API path', publicReadApiByKey.get('agent-fleet-api')?.path, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=47`)
assertEqual('public read wallet API path', publicReadApiByKey.get('wallet-timeline-api')?.path, '/api/injective?tool=get-wallet-timeline')
assertEqual('public read hardware API path', publicReadApiByKey.get('hardware-bridge-api')?.path, '/api/injective?tool=get-hardware-bridge-proof')
assertListIncludes('public read chain evidence expected fields', publicReadApiByKey.get('chain-evidence-api')?.expectedFields, ['sourceControl', 'judgeRunbook', 'registryMintSummary', 'timelineSummary', 'handshakeProof', 'hardwareBridge', 'recordingOrder[].evidenceFocus'])
assertListIncludes('public read chain evidence judge focus', publicReadApiByKey.get('chain-evidence-api')?.judgeFocus, ['chainId 1439 and publicOnly flags', 'same owner wallet across timeline', 'real SocialHandshake proof'])
assertListIncludes('public read agent proof expected fields', publicReadApiByKey.get('agent-proof-api')?.expectedFields, ['agent.agentId', 'agent.owner', 'agent.builderCode', 'agent.mintTransactionHash', 'sourceControl'])
assertListIncludes('public read agent proof judge focus', publicReadApiByKey.get('agent-proof-api')?.judgeFocus, ['agentId 43 identity', 'owner wallet match', 'single-card sourceControl anchor'])
assertListIncludes('public read fleet expected fields', publicReadApiByKey.get('agent-fleet-api')?.expectedFields, ['agents[].agentId', 'agents[].builderCode', 'agents[].card', 'total'])
assertListIncludes('public read fleet judge focus', publicReadApiByKey.get('agent-fleet-api')?.judgeFocus, [`builderCode=${BUILDER_CODE}`, 'agentId 43-47 fleet', 'public-plaza chain discovery input'])
assertListIncludes('public read wallet expected fields', publicReadApiByKey.get('wallet-timeline-api')?.expectedFields, ['summary.owner', 'summary.eventCount', 'summary.allSucceeded', 'events[].hash', 'events[].status'])
assertListIncludes('public read wallet judge focus', publicReadApiByKey.get('wallet-timeline-api')?.judgeFocus, ['same owner wallet', 'all receipts succeeded', 'registration to real handshake sequence'])
assertListIncludes('public read hardware expected fields', publicReadApiByKey.get('hardware-bridge-api')?.expectedFields, ['hardwareBridge.key', 'hardwareBridge.eventKinds', 'hardwareBridge.chainDispatch.chainRead', 'hardwareBridge.piRouter.skills', 'privacyBoundary.hardware', 'sourceControl'])
assertListIncludes('public read hardware judge focus', publicReadApiByKey.get('hardware-bridge-api')?.judgeFocus, ['Frost Edge Node public-event bridge', 'music_now_playing and chain_dispatch only', `builderCode=${BUILDER_CODE} chain read`, 'no wallet signing or raw profile text'])
for (const [key, item] of publicReadApiByKey) {
  assertEqual(`public read ${key} method`, item.method, 'GET')
  assertEqual(`public read ${key} chainId`, item.chainId, INJECTIVE_TESTNET_CHAIN_ID)
  assertEqual(`public read ${key} readOnly`, item.readOnly, true)
  assertEqual(`public read ${key} publicOnly`, item.publicOnly, true)
  assertTrue(`public read ${key} purpose`, String(item.purpose || '').length > 20)
  assertTrue(`public read ${key} expectedFields`, item.expectedFields.length >= 4)
  assertTrue(`public read ${key} judgeFocus`, item.judgeFocus.length >= 4)
}
assertEqual('owner', evidence.owner, PROOF_OWNER)
assertEqual('ownerScanUrl', evidence.ownerScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('registry', evidence.registry, IDENTITY_REGISTRY)
assertEqual('registryScanUrl', evidence.registryScanUrl, scanUrlForRegistry())
assertEqual('handshakeContract', evidence.handshakeContract, SOCIAL_HANDSHAKE)
assertEqual('handshakeScanUrl', evidence.handshakeScanUrl, scanUrlForAddress(SOCIAL_HANDSHAKE))
assertTrue('handshake proof object', !!evidence.handshakeProof && typeof evidence.handshakeProof === 'object')
assertEqual('handshake proof key', evidence.handshakeProof.key, SOCIAL_HANDSHAKE_PROOF.key)
assertEqual('handshake proof contract', evidence.handshakeProof.contract, SOCIAL_HANDSHAKE)
assertEqual('handshake proof contract scanUrl', evidence.handshakeProof.contractScanUrl, scanUrlForAddress(SOCIAL_HANDSHAKE))
assertEqual('handshake proof transaction hash', evidence.handshakeProof.transactionHash, TIMELINE_EVENTS.at(-1).hash)
assertEqual('handshake proof transaction scanUrl', evidence.handshakeProof.transactionScanUrl, scanUrlForTx(TIMELINE_EVENTS.at(-1).hash))
assertEqual('handshake proof agentA', evidence.handshakeProof.agentA, 43)
assertEqual('handshake proof agentB', evidence.handshakeProof.agentB, 44)
assertEqual('handshake proof score', evidence.handshakeProof.score, 88)
assertEqual('handshake proof block', evidence.handshakeProof.blockNumber, TIMELINE_EVENTS.at(-1).blockNumber)
assertEqual('handshake proof timestamp', evidence.handshakeProof.timestamp, TIMELINE_EVENTS.at(-1).timestamp)
assertTrue('handshake proof commitment policy', evidence.handshakeProof.profileCommitmentPolicy?.includes('non-zero bytes32'))
assertTrue('handshake proof public fields', evidence.handshakeProof.publicFields?.includes('profile commitment hashes'))
assertEqual('handshake proof local verification', evidence.handshakeProof.localVerification, SOCIAL_HANDSHAKE_PROOF.localVerification)
assertTrue('hardware bridge object', !!evidence.hardwareBridge && typeof evidence.hardwareBridge === 'object')
assertEqual('hardware bridge key', evidence.hardwareBridge.key, HARDWARE_BRIDGE_PROOF.key)
assertEqual('hardware bridge module path', evidence.hardwareBridge.modulePath, HARDWARE_BRIDGE_PROOF.modulePath)
assertEqual('hardware bridge module url', evidence.hardwareBridge.moduleUrl, HARDWARE_BRIDGE_PROOF.moduleUrl)
assertTrue('hardware bridge role mentions Raspberry Pi', evidence.hardwareBridge.role.includes('Raspberry Pi'))
assertListIncludes('hardware bridge event kinds', evidence.hardwareBridge.eventKinds, HARDWARE_BRIDGE_PROOF.eventKinds)
assertEqual('hardware bridge chain source', evidence.hardwareBridge.chainDispatch?.source, 'injective-public-plaza')
assertEqual('hardware bridge chain builderCode', evidence.hardwareBridge.chainDispatch?.builderCode, BUILDER_CODE)
assertEqual('hardware bridge chain read', evidence.hardwareBridge.chainDispatch?.chainRead, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=47`)
assertEqual('hardware bridge chain scanUrl', evidence.hardwareBridge.chainDispatch?.scanUrl, scanUrlForRegistry())
assertEqual('hardware bridge agent ids', evidence.hardwareBridge.chainDispatch?.agentIds?.join(','), FLEET_AGENTS.map((agent) => Number(agent.id)).join(','))
assertTrue('hardware bridge Pi skills include chain dispatch', evidence.hardwareBridge.piRouter?.skills?.includes('chain_dispatch'))
assertEqual('hardware bridge local verification', evidence.hardwareBridge.localVerification, 'npm run verify:hardware')
assertListIncludes('hardware bridge privacy boundary', evidence.hardwareBridge.privacyBoundary, ['no private keys', 'no wallet signing', 'no raw profile text', 'public JSONL events only'])
assertTrue('review links array', Array.isArray(evidence.reviewLinks))
assertEqual('review links count', evidence.reviewLinks.length, REVIEW_LINKS.length)
assertEqual('review link first url', evidence.reviewLinks[0]?.url, scanUrlForAgent(43))
assertEqual('review link wallet url', evidence.reviewLinks.find((link) => link.key === 'owner-wallet')?.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('review link handshake tx url', evidence.reviewLinks.find((link) => link.key === 'real-handshake-tx')?.url, scanUrlForTx(TIMELINE_EVENTS.at(-1).hash))
assertTrue('review brief object', !!evidence.reviewBrief && typeof evidence.reviewBrief === 'object')
assertEqual('review brief title', evidence.reviewBrief.title, REVIEW_BRIEF.title)
assertEqual('review brief core count', evidence.reviewBrief.injectiveCore?.length, REVIEW_BRIEF.injectiveCore.length)
assertEqual('review brief integration fit count', evidence.reviewBrief.integrationFit?.length, REVIEW_BRIEF.integrationFit.length)
assertTrue('review brief names ERC-8004', evidence.reviewBrief.oneLiner?.includes('ERC-8004'))
assertTrue('review brief maps to AI social', evidence.reviewBrief.integrationFit?.some((item) => item.alignmentKey === 'ai-social'))
assertTrue('review brief maps to physical world', evidence.reviewBrief.integrationFit?.some((item) => item.alignmentKey === 'agent-physical-world'))
assertTrue('judge runbook object', !!evidence.judgeRunbook && typeof evidence.judgeRunbook === 'object')
assertEqual('judge runbook title', evidence.judgeRunbook.title, JUDGE_RUNBOOK.title)
assertEqual('judge runbook estimated seconds', evidence.judgeRunbook.estimatedSeconds, JUDGE_RUNBOOK.estimatedSeconds)
assertEqual('judge runbook quickstart URL', evidence.judgeRunbook.quickstartUrl, JUDGE_QUICKSTART_URL)
assertEqual('judge runbook publicOnly', evidence.judgeRunbook.publicOnly, true)
assertTrue('judge runbook steps array', Array.isArray(evidence.judgeRunbook.steps))
assertEqual('judge runbook step count', evidence.judgeRunbook.steps.length, JUDGE_RUNBOOK.steps.length)
for (const [index, step] of evidence.judgeRunbook.steps.entries()) {
  const expected = JUDGE_RUNBOOK.steps[index]
  assertEqual(`judge runbook step ${index + 1} number`, step.step, index + 1)
  assertEqual(`judge runbook step ${index + 1} key`, step.key, expected.key)
  assertEqual(`judge runbook step ${index + 1} type`, step.type, expected.type)
  assertEqual(`judge runbook step ${index + 1} local check`, step.localCheck, expected.localCheck)
  assertTrue(`judge runbook step ${index + 1} focus`, Array.isArray(step.focus) && step.focus.length >= 3)
}
assertEqual('judge runbook identity URL', evidence.judgeRunbook.steps[0]?.url, scanUrlForAgent(43))
assertEqual('judge runbook wallet URL', evidence.judgeRunbook.steps[1]?.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('judge runbook evidence path', evidence.judgeRunbook.steps[2]?.path, '/api/injective?tool=get-chain-evidence')
assertTrue('judge runbook public APIs include agent proof', evidence.judgeRunbook.steps[3]?.paths?.includes(evidence.verification?.agentProofApi))
assertTrue('judge runbook public APIs include fleet proof', evidence.judgeRunbook.steps[3]?.paths?.includes(evidence.verification?.listAgentsApi))
assertTrue('judge runbook public APIs include wallet timeline', evidence.judgeRunbook.steps[3]?.paths?.includes(evidence.verification?.walletTimelineApi))
assertTrue('judge runbook public APIs include hardware proof', evidence.judgeRunbook.steps[3]?.paths?.includes(evidence.verification?.hardwareBridgeApi))
assertTrue('judge runbook command step runs demo', evidence.judgeRunbook.steps[4]?.command === 'npm run verify:demo')
assertTrue('review checklist array', Array.isArray(evidence.reviewChecklist))
assertEqual('review checklist count', evidence.reviewChecklist.length, REVIEW_CHECKLIST.length)
assertEqual('review checklist first key', evidence.reviewChecklist[0]?.key, 'erc8004-identity')
assertTrue('review checklist first owner criterion', evidence.reviewChecklist[0]?.passCriteria?.some((item) => item.includes(PROOF_OWNER)))
assertEqual('review checklist registry mint command', evidence.reviewChecklist.find((item) => item.key === 'registry-mint-events')?.machineCheck, 'npm run verify:registry')
assertEqual('review checklist product loop command', evidence.reviewChecklist.at(-1)?.machineCheck, 'npm run verify:plaza')
assertTrue('integration alignment array', Array.isArray(evidence.integrationAlignment))
assertEqual('integration alignment count', evidence.integrationAlignment.length, INTEGRATION_ALIGNMENT.length)
assertEqual('integration alignment first key', evidence.integrationAlignment[0]?.key, 'ai-social')
assertTrue('integration alignment mentions Injective execution', evidence.integrationAlignment.some((item) => item.key === 'injective-execution-layer'))
assertTrue('integration alignment mentions hardware bridge', evidence.integrationAlignment.some((item) => item.key === 'agent-physical-world'))
const publicProofAlignment = evidence.integrationAlignment.find((item) => item.key === 'privacy-first-public-proof')
assertTrue('integration alignment public proof item', !!publicProofAlignment)
for (const expected of ['sourceControl', 'publicReadApis', 'judgeRunbook', 'hardwareBridge', 'reviewEntrypoints', 'get-hardware-bridge-proof']) {
  assertTrue(`integration alignment public proof evidence includes ${expected}`, String(publicProofAlignment.evidence || '').includes(expected))
}
assertTrue('review entrypoints array', Array.isArray(evidence.reviewEntrypoints))
assertEqual('review entrypoints count', evidence.reviewEntrypoints.length, REVIEW_ENTRYPOINTS.length)
assertEqual('review link judge quickstart url', evidence.reviewEntrypoints.find((link) => link.key === 'judge-quickstart')?.url, JUDGE_QUICKSTART_URL)
assertEqual('review link repo url', evidence.reviewEntrypoints.find((link) => link.key === 'github-repo')?.url, REVIEW_ENTRYPOINTS.find((link) => link.key === 'github-repo')?.url)
assertEqual('review link live demo url', evidence.reviewEntrypoints.find((link) => link.key === 'live-demo')?.url, REVIEW_ENTRYPOINTS.find((link) => link.key === 'live-demo')?.url)
assertEqual('review link chain evidence path', evidence.reviewEntrypoints.find((link) => link.key === 'chain-evidence-api')?.path, '/api/injective?tool=get-chain-evidence')
assertTrue('delivery checklist array', Array.isArray(evidence.deliveryChecklist))
assertEqual('delivery checklist count', evidence.deliveryChecklist.length, DELIVERY_CHECKLIST.length)
assertTrue('delivery checklist includes GitHub README', evidence.deliveryChecklist.some((item) => item.key === 'public-github-readme'))
assertTrue('delivery checklist includes Injective integration', evidence.deliveryChecklist.some((item) => item.key === 'injective-integration'))
assertTrue('delivery checklist includes demo script', evidence.deliveryChecklist.some((item) => item.key === 'demo-video-script'))
assertTrue('delivery checklist includes pitch notes', evidence.deliveryChecklist.some((item) => item.key === 'pitch-deck-notes'))
assertEqual('delivery checklist demo local check', evidence.deliveryChecklist.find((item) => item.key === 'demo-video-script')?.localCheck, 'npm run verify:duration')
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
  const mintEvent = REGISTRY_MINT_EVENTS.find((event) => Number(event.agentId) === Number(expected.id))
  assertTrue(`agent ${expected.id} present`, !!actual)
  assertTrue(`agent ${expected.id} mint event present`, !!mintEvent)
  assertEqual(`agent ${expected.id} label`, actual.label, expected.label)
  assertEqual(`agent ${expected.id} owner`, actual.owner, PROOF_OWNER)
  assertEqual(`agent ${expected.id} builderCode`, actual.builderCode, BUILDER_CODE)
  assertEqual(`agent ${expected.id} registry`, actual.registry, IDENTITY_REGISTRY)
  assertEqual(`agent ${expected.id} registryScanUrl`, actual.registryScanUrl, scanUrlForRegistry())
  assertEqual(`agent ${expected.id} mintedFromZero`, actual.mintedFromZero, true)
  assertEqual(`agent ${expected.id} mintTransactionHash`, actual.mintTransactionHash, mintEvent.transactionHash)
  assertEqual(`agent ${expected.id} mintBlockNumber`, actual.mintBlockNumber, mintEvent.blockNumber)
  assertEqual(`agent ${expected.id} mintScanUrl`, actual.mintScanUrl, mintEvent.scanUrl)
  assertEqual(`agent ${expected.id} proofApi`, actual.proofApi, `/api/injective?tool=get-agent-proof&agentId=${Number(expected.id)}`)
  assertEqual(`agent ${expected.id} scanUrl`, actual.scanUrl, scanUrlForAgent(expected.id))
  if (expected.requiredTag) assertEqual(`agent ${expected.id} requiredTag`, actual.requiredTag, expected.requiredTag)
}

console.log('\nRegistry mint evidence')
assertTrue('registry mint events array', Array.isArray(evidence.registryMintEvents))
assertEqual('registry mint event count', evidence.registryMintEvents.length, REGISTRY_MINT_EVENTS.length)
for (const expected of REGISTRY_MINT_EVENTS) {
  const actual = evidence.registryMintEvents.find((event) => Number(event.agentId) === expected.agentId)
  assertTrue(`registry mint agent ${expected.agentId} present`, !!actual)
  assertEqual(`registry mint agent ${expected.agentId} from`, actual.from, REGISTRY_MINT_ZERO_ADDRESS)
  assertEqual(`registry mint agent ${expected.agentId} to`, actual.to, PROOF_OWNER)
  assertEqual(`registry mint agent ${expected.agentId} transactionHash`, actual.transactionHash, expected.transactionHash)
  assertEqual(`registry mint agent ${expected.agentId} block`, actual.blockNumber, expected.blockNumber)
  assertEqual(`registry mint agent ${expected.agentId} scanUrl`, actual.scanUrl, scanUrlForTx(expected.transactionHash))
  assertEqual(`registry mint agent ${expected.agentId} agentScanUrl`, actual.agentScanUrl, scanUrlForAgent(expected.agentId))
}
assertTrue('registry mint summary object', !!evidence.registryMintSummary && typeof evidence.registryMintSummary === 'object')
assertEqual('registry mint summary owner', evidence.registryMintSummary.owner, PROOF_OWNER)
assertEqual('registry mint summary owner scanUrl', evidence.registryMintSummary.ownerScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('registry mint summary registry', evidence.registryMintSummary.registry, IDENTITY_REGISTRY)
assertEqual('registry mint summary registry scanUrl', evidence.registryMintSummary.registryScanUrl, scanUrlForRegistry())
assertEqual('registry mint summary event count', evidence.registryMintSummary.eventCount, REGISTRY_MINT_EVENTS.length)
assertEqual('registry mint summary agent ids', evidence.registryMintSummary.agentIds.join(','), REGISTRY_MINT_EVENTS.map((event) => event.agentId).join(','))
assertEqual('registry mint summary first agent', evidence.registryMintSummary.firstAgentId, REGISTRY_MINT_EVENTS[0].agentId)
assertEqual('registry mint summary last agent', evidence.registryMintSummary.lastAgentId, REGISTRY_MINT_EVENTS.at(-1).agentId)
assertEqual('registry mint summary all mint from zero', evidence.registryMintSummary.allMintFromZero, true)
assertEqual('registry mint summary all to owner', evidence.registryMintSummary.allToOwner, true)
assertEqual('registry mint summary first block', evidence.registryMintSummary.firstBlock, REGISTRY_MINT_EVENTS[0].blockNumber)
assertEqual('registry mint summary last block', evidence.registryMintSummary.lastBlock, REGISTRY_MINT_EVENTS.at(-1).blockNumber)
assertEqual('registry mint summary local verification', evidence.registryMintSummary.localVerification, 'npm run verify:registry')

console.log('\nTimeline evidence')
assertTrue('timeline array', Array.isArray(evidence.timeline))
assertEqual('timeline count', evidence.timeline.length, TIMELINE_EVENTS.length)
for (const expected of TIMELINE_EVENTS) {
  const actual = evidence.timeline.find((event) => event.hash === expected.hash)
  assertTrue(`timeline ${expected.role} present`, !!actual)
  assertEqual(`timeline ${expected.role} from`, actual.from, PROOF_OWNER)
  assertEqual(`timeline ${expected.role} to`, actual.to, expected.to)
  assertEqual(`timeline ${expected.role} expectedStatus`, actual.expectedStatus, 'success')
  assertEqual(`timeline ${expected.role} block`, actual.blockNumber, expected.blockNumber)
  assertEqual(`timeline ${expected.role} timestamp`, actual.timestamp, expected.timestamp)
  assertEqual(`timeline ${expected.role} scanUrl`, actual.scanUrl, scanUrlForTx(expected.hash))
}
assertTrue('timeline summary object', !!evidence.timelineSummary && typeof evidence.timelineSummary === 'object')
assertEqual('timeline summary owner', evidence.timelineSummary.owner, PROOF_OWNER)
assertEqual('timeline summary wallet scanUrl', evidence.timelineSummary.walletScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('timeline summary event count', evidence.timelineSummary.eventCount, TIMELINE_EVENTS.length)
assertEqual('timeline summary all from owner', evidence.timelineSummary.allFromOwner, true)
assertEqual('timeline summary expectedStatus', evidence.timelineSummary.expectedStatus, 'success')
assertEqual('timeline summary first block', evidence.timelineSummary.firstBlock, TIMELINE_EVENTS[0].blockNumber)
assertEqual('timeline summary last block', evidence.timelineSummary.lastBlock, TIMELINE_EVENTS.at(-1).blockNumber)
assertEqual('timeline summary first timestamp', evidence.timelineSummary.firstTimestamp, TIMELINE_EVENTS[0].timestamp)
assertEqual('timeline summary last timestamp', evidence.timelineSummary.lastTimestamp, TIMELINE_EVENTS.at(-1).timestamp)
assertEqual('timeline summary first role', evidence.timelineSummary.firstRole, TIMELINE_EVENTS[0].role)
assertEqual('timeline summary last role', evidence.timelineSummary.lastRole, TIMELINE_EVENTS.at(-1).role)
assertEqual('timeline summary RPC verification', evidence.timelineSummary.rpcVerification, '/api/injective?tool=get-wallet-timeline')

console.log('\nReviewer follow-up paths')
assertEqual('demo readiness command', evidence.verification?.demoReadiness, 'npm run verify:demo')
assertEqual('demo duration command', evidence.verification?.demoDuration, 'npm run verify:duration')
assertEqual('evidence smoke command', evidence.verification?.evidenceSmoke, 'npm run verify:evidence')
assertEqual('public proof command', evidence.verification?.publicProof, 'npm run verify:public-proof')
assertEqual('public read APIs command', evidence.verification?.publicReadApis, 'npm run verify:public-apis')
assertEqual('integration guide command', evidence.verification?.integrationGuide, 'npm run verify:integration-guide')
assertEqual('github repo command', evidence.verification?.githubRepo, 'npm run verify:github')
assertEqual('pitch notes command', evidence.verification?.pitchNotes, 'npm run verify:pitch')
assertEqual('judge quickstart command', evidence.verification?.judgeQuickstart, 'npm run verify:judge')
assertEqual('review brief command', evidence.verification?.reviewBrief, 'npm run verify:brief')
assertEqual('review checklist command', evidence.verification?.reviewChecklist, 'npm run verify:review')
assertEqual('review links command', evidence.verification?.reviewLinks, 'npm run verify:review-links')
assertEqual('recording order command', evidence.verification?.recordingOrder, 'npm run verify:recording-order')
assertEqual('wallet timeline command', evidence.verification?.walletTimeline, 'npm run verify:wallet')
assertEqual('source control command', evidence.verification?.sourceControl, 'npm run verify:source')
assertEqual('registry events command', evidence.verification?.registryEvents, 'npm run verify:registry')
assertEqual('plaza flow command', evidence.verification?.plazaFlow, 'npm run verify:plaza-flow')
assertEqual('nova alignment command', evidence.verification?.novaAlignment, 'npm run verify:nova-alignment')
assertEqual('delivery pack command', evidence.verification?.deliveryPack, 'npm run verify:delivery')
assertEqual('proof suite command', evidence.verification?.proofSuite, 'npm run verify:injective')
assertEqual('api read tools command', evidence.verification?.apiReadTools, 'node INJECTIVE-INTEGRATION/verify-api-read-tools.mjs')
assertEqual('agent proof command', evidence.verification?.agentProof, 'npm run verify:agent-proof')
assertEqual('agent proof api', evidence.verification?.agentProofApi, '/api/injective?tool=get-agent-proof&agentId=43')
assertEqual('list-agents api', evidence.verification?.listAgentsApi, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=${Math.max(...FLEET_AGENTS.map((agent) => Number(agent.id)))}`)
assertEqual('wallet timeline api', evidence.verification?.walletTimelineApi, '/api/injective?tool=get-wallet-timeline')
assertEqual('hardware bridge api', evidence.verification?.hardwareBridgeApi, '/api/injective?tool=get-hardware-bridge-proof')

console.log('\nRecording order')
assertTrue('recording order array', Array.isArray(evidence.recordingOrder))
assertEqual('recording order count', evidence.recordingOrder.length, 8)
assertEqual('recording step 1 url', evidence.recordingOrder[0]?.url, scanUrlForAgent(43))
assertEqual('recording step 2 url', evidence.recordingOrder[1]?.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('recording step 3 path', evidence.recordingOrder[2]?.path, '/api/injective?tool=get-chain-evidence')
assertEqual('recording step 4 path', evidence.recordingOrder[3]?.path, evidence.verification?.agentProofApi)
assertEqual('recording step 5 path', evidence.recordingOrder[4]?.path, evidence.verification?.listAgentsApi)
assertEqual('recording step 6 path', evidence.recordingOrder[5]?.path, evidence.verification?.walletTimelineApi)
assertEqual('recording step 7 path', evidence.recordingOrder[6]?.path, evidence.verification?.hardwareBridgeApi)
assertEqual('recording step 8 command', evidence.recordingOrder[7]?.command, 'npm run verify:plaza')
assertFocusIncludes('recording step 1', evidence.recordingOrder[0], 'agentId 43')
assertFocusIncludes('recording step 2', evidence.recordingOrder[1], 'same wallet')
assertFocusIncludes('recording step 3', evidence.recordingOrder[2], 'registryMintSummary')
assertFocusIncludes('recording step 3', evidence.recordingOrder[2], 'sourceControl')
assertFocusIncludes('recording step 4', evidence.recordingOrder[3], 'agentId 43')
assertFocusIncludes('recording step 4', evidence.recordingOrder[3], 'sourceControl')
assertFocusIncludes('recording step 5', evidence.recordingOrder[4], 'builderCode=pocket-earth')
assertFocusIncludes('recording step 5', evidence.recordingOrder[4], 'agentId 43-47')
assertFocusIncludes('recording step 6', evidence.recordingOrder[5], 'allSucceeded')
assertFocusIncludes('recording step 6', evidence.recordingOrder[5], `chainId ${INJECTIVE_TESTNET_CHAIN_ID}`)
assertFocusIncludes('recording step 7', evidence.recordingOrder[6], 'Frost Edge Node')
assertFocusIncludes('recording step 7', evidence.recordingOrder[6], 'chain_dispatch')
assertFocusIncludes('recording step 7', evidence.recordingOrder[6], 'privacyBoundary.hardware')
assertFocusIncludes('recording step 8', evidence.recordingOrder[7], 'public-plaza')
assertFocusIncludes('recording step 8', evidence.recordingOrder[7], 'agent-plaza')
assertFocusIncludes('recording step 8', evidence.recordingOrder[7], 'hardware proof API')

console.log('\nPublic-only guard')
const evidenceText = JSON.stringify(evidence)
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB', 'Pocket-Earth-Plus', 'Sunset-Radio']) {
  assertTrue(`evidence omits ${forbidden}`, !evidenceText.includes(forbidden))
}

console.log('\nOK public chain evidence API is self-contained and safe to show in review.')
