// Guard the judge-facing evidence package as a public-only contract.
// Usage: npm run verify:public-proof
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  DEMO_VIDEO_LIMIT_SECONDS,
  FLEET_AGENTS,
  IDENTITY_REGISTRY,
  INJECTIVE_TESTNET_CHAIN_ID,
  JUDGE_QUICKSTART_URL,
  PROOF_OWNER,
  REGISTRY_MINT_EVENTS,
  REGISTRY_MINT_ZERO_ADDRESS,
  REVIEW_LINKS,
  SOCIAL_HANDSHAKE,
  SUBMISSION_REPOSITORY_URL,
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
  for (const item of evidence.competitionAlignment || []) commands.push(['competitionAlignment', item.machineCheck])
  for (const item of evidence.reviewChecklist || []) commands.push(['reviewChecklist', item.machineCheck])
  for (const item of evidence.submissionChecklist || []) commands.push(['submissionChecklist', item.localCheck])
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
  'competitionAlignment',
  'demoVideoLimitSeconds',
  'handshakeContract',
  'handshakeScanUrl',
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
  'sourceControl',
  'submissionChecklist',
  'submissionLinks',
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
assertTrue('sourceControl object', !!evidence.sourceControl && typeof evidence.sourceControl === 'object')
assertEqual('sourceControl repository', evidence.sourceControl.repository, SUBMISSION_REPOSITORY_URL)
assertEqual('sourceControl branch', evidence.sourceControl.branch, 'main')
assertTrue('sourceControl commit is sha or null', evidence.sourceControl.commit === null || /^[0-9a-f]{40}$/i.test(evidence.sourceControl.commit))
if (evidence.sourceControl.commit) assertEqual('sourceControl commitUrl', evidence.sourceControl.commitUrl, `${SUBMISSION_REPOSITORY_URL}/commit/${evidence.sourceControl.commit}`)
assertEqual('sourceControl evidenceApi', evidence.sourceControl.evidenceApi, '/api/injective?tool=get-chain-evidence')

console.log('\nPublic read API manifest')
assertTrue('publicReadApis array', Array.isArray(evidence.publicReadApis))
assertEqual('publicReadApis count', evidence.publicReadApis.length, 3)
const publicReadApiByKey = new Map(evidence.publicReadApis.map((item) => [item.key, item]))
assertEqual('publicReadApis chain evidence path', publicReadApiByKey.get('chain-evidence-api')?.path, '/api/injective?tool=get-chain-evidence')
assertEqual('publicReadApis fleet path', publicReadApiByKey.get('agent-fleet-api')?.path, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=47`)
assertEqual('publicReadApis wallet path', publicReadApiByKey.get('wallet-timeline-api')?.path, '/api/injective?tool=get-wallet-timeline')
assertEqual('publicReadApis chain evidence verification', publicReadApiByKey.get('chain-evidence-api')?.verification, 'npm run verify:public-proof')
assertEqual('publicReadApis fleet verification', publicReadApiByKey.get('agent-fleet-api')?.verification, 'node INJECTIVE-INTEGRATION/verify-api-list-agents.mjs')
assertEqual('publicReadApis wallet verification', publicReadApiByKey.get('wallet-timeline-api')?.verification, 'npm run verify:wallet')
for (const [key, item] of publicReadApiByKey) {
  assertEqual(`publicReadApis ${key} method`, item.method, 'GET')
  assertEqual(`publicReadApis ${key} chainId`, item.chainId, INJECTIVE_TESTNET_CHAIN_ID)
  assertEqual(`publicReadApis ${key} readOnly`, item.readOnly, true)
  assertEqual(`publicReadApis ${key} publicOnly`, item.publicOnly, true)
  assertTrue(`publicReadApis ${key} purpose`, String(item.purpose || '').length > 20)
}

console.log('\nReview entry points')
assertEqual('judge quickstart link stays on Injective submission repo', evidence.submissionLinks.find((item) => item.key === 'judge-quickstart')?.url, JUDGE_QUICKSTART_URL)
assertEqual('repo link stays on Injective submission repo', evidence.submissionLinks.find((item) => item.key === 'github-repo')?.url, SUBMISSION_REPOSITORY_URL)
assertEqual('agentId 43 link', evidence.reviewLinks.find((item) => item.key === 'frost-agent-43')?.url, scanUrlForAgent(43))
assertEqual('owner wallet link', evidence.reviewLinks.find((item) => item.key === 'owner-wallet')?.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('real handshake link', evidence.reviewLinks.find((item) => item.key === 'real-handshake-tx')?.url, scanUrlForTx(TIMELINE_EVENTS.at(-1).hash))
assertEqual('review link count', evidence.reviewLinks.length, REVIEW_LINKS.length)
assertTrue('recording order array', Array.isArray(evidence.recordingOrder))
assertEqual('recording order count', evidence.recordingOrder.length, 6)
assertTrue('recording order starts from #43', evidence.recordingOrder?.[0]?.url === scanUrlForAgent(43))
assertTrue('recording order includes public evidence API', evidence.recordingOrder?.some((item) => item.path === '/api/injective?tool=get-chain-evidence'))
assertTrue('recording order includes fleet API', evidence.recordingOrder?.some((item) => item.path === evidence.verification?.listAgentsApi))
assertTrue('recording order includes wallet timeline API', evidence.recordingOrder?.some((item) => item.path === evidence.verification?.walletTimelineApi))
assertFocusIncludes('recording step 1', evidence.recordingOrder[0], 'agentId 43')
assertFocusIncludes('recording step 1', evidence.recordingOrder[0], 'owner')
assertFocusIncludes('recording step 2', evidence.recordingOrder[1], 'same wallet')
assertFocusIncludes('recording step 3', evidence.recordingOrder[2], 'registryMintSummary')
assertFocusIncludes('recording step 3', evidence.recordingOrder[2], 'timelineSummary')
assertFocusIncludes('recording step 3', evidence.recordingOrder[2], 'sourceControl')
assertFocusIncludes('recording step 4', evidence.recordingOrder[3], `builderCode=${BUILDER_CODE}`)
assertFocusIncludes('recording step 4', evidence.recordingOrder[3], 'agentId 43-47')
assertFocusIncludes('recording step 5', evidence.recordingOrder[4], 'allSucceeded')
assertFocusIncludes('recording step 5', evidence.recordingOrder[4], `chainId ${INJECTIVE_TESTNET_CHAIN_ID}`)
assertFocusIncludes('recording step 5', evidence.recordingOrder[4], 'handshake')
assertFocusIncludes('recording step 6', evidence.recordingOrder[5], 'public-plaza')
assertFocusIncludes('recording step 6', evidence.recordingOrder[5], 'agent-plaza')

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
  'pocketearth.throughtheglass.art',
  'testnet.blockscout.injective.network',
])
for (const { path, value } of flattenStrings(evidence)) {
  if (!value.startsWith('http')) continue
  const url = new URL(value)
  assertEqual(`${path} uses https`, url.protocol, 'https:')
  assertTrue(`${path} host is public review host`, allowedHosts.has(url.host))
}

console.log('\nOK public evidence package is a stable, public-only review contract.')
