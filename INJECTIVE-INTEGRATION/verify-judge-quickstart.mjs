// Guard the one-page judge quickstart against link drift and private evidence leaks.
// Usage: npm run verify:judge
import { readFile } from 'node:fs/promises'
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  DEMO_VIDEO_LIMIT_SECONDS,
  IDENTITY_REGISTRY,
  INJECTIVE_TESTNET_CHAIN_ID,
  JUDGE_RUNBOOK,
  LIVE_DEMO_URL,
  PROOF_OWNER,
  REGISTRY_MINT_EVENTS,
  SOCIAL_HANDSHAKE,
  SOCIAL_HANDSHAKE_PROOF,
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
  if (String(actual) !== String(expected)) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
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

const quickstart = await readFile('INJECTIVE-INTEGRATION/JUDGE-QUICKSTART.md', 'utf8')
const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
const readme = await readFile('README.md', 'utf8')
const integrationReadme = await readFile('INJECTIVE-INTEGRATION/README.md', 'utf8')
const chainEvidence = await readFile('INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md', 'utf8')
const demoScript = await readFile('INJECTIVE-INTEGRATION/DEMO-SCRIPT.md', 'utf8')
const evidence = await callEvidenceApi()

console.log('\nJudge quickstart document')
for (const snippet of [
  '# Judge Quickstart',
  '60-Second Path',
  'What This Proves',
  'Review Package',
  'Public Links',
  'Local Commands',
  'Demo Reading Order',
]) {
  assertTrue(`quickstart contains ${snippet}`, quickstart.includes(snippet))
}

for (const snippet of [
  scanUrlForAgent(43),
  scanUrlForAddress(PROOF_OWNER),
  scanUrlForAddress(IDENTITY_REGISTRY),
  scanUrlForAddress(SOCIAL_HANDSHAKE),
  scanUrlForTx(TIMELINE_EVENTS[0].hash),
  scanUrlForTx(TIMELINE_EVENTS[1].hash),
  scanUrlForTx(TIMELINE_EVENTS.at(-1).hash),
  INTEGRATION_REPOSITORY_URL,
  LIVE_DEMO_URL,
  '/api/injective?tool=get-agent-proof&agentId=43',
  `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47`,
  '/api/injective?tool=get-chain-evidence',
  '/api/injective?tool=get-wallet-timeline',
]) {
  assertTrue(`quickstart contains ${snippet}`, quickstart.includes(snippet))
}

for (const snippet of [
  'ERC-8004',
  'agentId 43-47',
  'registryMintEvents',
  'registryMintSummary',
  'registry-mint-events',
  'judgeRunbook',
  'publicReadApis',
  'get-agent-proof',
  'expectedStatus',
  'timelineSummary',
  'handshakeProof',
  'recordingOrder[].evidenceFocus',
  'starting from its `summary`',
  `chainId ${INJECTIVE_TESTNET_CHAIN_ID}`,
  'builderCode=pocket-earth',
  'SocialHandshake',
  'score `88`',
  'public-plaza',
  'agent-plaza',
  'readOnly',
  'publicOnly',
  '180s',
  'secret keys stay off-chain',
]) {
  assertTrue(`quickstart explains ${snippet}`, quickstart.includes(snippet))
}

for (const command of [
  'npm run verify:github',
  'npm run verify:duration',
  'npm run verify:judge',
  'npm run verify:demo',
  'npm run verify:wallet',
  'npm run verify:public-apis',
  'npm run verify:integration-guide',
  'npm run verify:source',
  'npm run verify:registry',
  'npm run verify:agent-proof',
  'npm run verify:recording-order',
  'npm run verify:injective',
  'npm run verify:plaza',
  'npm run verify:pitch',
  'npm run verify:positioning',
]) {
  assertTrue(`quickstart contains ${command}`, quickstart.includes(command))
  const scriptName = command.replace('npm run ', '')
  assertTrue(`${command} script exists`, Boolean(packageJson.scripts?.[scriptName]))
}

console.log('\nEvidence API wiring')
assertEqual('judge command advertised', evidence.verification?.judgeQuickstart, 'npm run verify:judge')
assertEqual('public read APIs command advertised', evidence.verification?.publicReadApis, 'npm run verify:public-apis')
assertEqual('integration guide command advertised', evidence.verification?.integrationGuide, 'npm run verify:integration-guide')
assertEqual('source control command advertised', evidence.verification?.sourceControl, 'npm run verify:source')
assertEqual('registry events command advertised', evidence.verification?.registryEvents, 'npm run verify:registry')
assertEqual('recording order command advertised', evidence.verification?.recordingOrder, 'npm run verify:recording-order')
assertEqual('judge npm script', packageJson.scripts?.['verify:judge'], 'node INJECTIVE-INTEGRATION/verify-judge-quickstart.mjs')
assertEqual('public read APIs npm script', packageJson.scripts?.['verify:public-apis'], 'node INJECTIVE-INTEGRATION/verify-public-read-apis.mjs')
assertEqual('integration guide npm script', packageJson.scripts?.['verify:integration-guide'], 'node INJECTIVE-INTEGRATION/verify-integration-guide.mjs')
assertEqual('positioning npm script', packageJson.scripts?.['verify:positioning'], 'node INJECTIVE-INTEGRATION/verify-doc-positioning.mjs')
assertEqual('source control npm script', packageJson.scripts?.['verify:source'], 'node INJECTIVE-INTEGRATION/verify-source-control.mjs')
assertEqual('registry npm script', packageJson.scripts?.['verify:registry'], 'node INJECTIVE-INTEGRATION/verify-registry-events.mjs')
assertEqual('demo limit still 180 seconds', evidence.demoVideoLimitSeconds, DEMO_VIDEO_LIMIT_SECONDS)
assertEqual('evidence chainId', evidence.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('evidence builderCode', evidence.builderCode, BUILDER_CODE)
assertTrue('evidence still public-only', evidence.readOnly === true && evidence.publicOnly === true)
assertTrue('evidence public read APIs array', Array.isArray(evidence.publicReadApis))
assertEqual('evidence public read API count', evidence.publicReadApis.length, 4)
assertEqual('evidence public read agent proof path', evidence.publicReadApis.find((item) => item.key === 'agent-proof-api')?.path, '/api/injective?tool=get-agent-proof&agentId=43')
assertEqual('evidence public read fleet path', evidence.publicReadApis.find((item) => item.key === 'agent-fleet-api')?.path, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47`)
assertEqual('evidence public read wallet path', evidence.publicReadApis.find((item) => item.key === 'wallet-timeline-api')?.path, '/api/injective?tool=get-wallet-timeline')
assertTrue('evidence judgeRunbook object', !!evidence.judgeRunbook && typeof evidence.judgeRunbook === 'object')
assertEqual('evidence judgeRunbook title', evidence.judgeRunbook.title, JUDGE_RUNBOOK.title)
assertEqual('evidence judgeRunbook estimated seconds', evidence.judgeRunbook.estimatedSeconds, JUDGE_RUNBOOK.estimatedSeconds)
assertEqual('evidence judgeRunbook quickstart URL', evidence.judgeRunbook.quickstartUrl, JUDGE_RUNBOOK.quickstartUrl)
assertEqual('evidence judgeRunbook publicOnly', evidence.judgeRunbook.publicOnly, true)
assertTrue('evidence judgeRunbook steps array', Array.isArray(evidence.judgeRunbook.steps))
assertEqual('evidence judgeRunbook step count', evidence.judgeRunbook.steps.length, JUDGE_RUNBOOK.steps.length)
assertEqual('evidence judgeRunbook first URL', evidence.judgeRunbook.steps[0]?.url, scanUrlForAgent(43))
assertEqual('evidence judgeRunbook wallet URL', evidence.judgeRunbook.steps[1]?.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('evidence judgeRunbook evidence API path', evidence.judgeRunbook.steps[2]?.path, '/api/injective?tool=get-chain-evidence')
assertTrue('evidence judgeRunbook API suite includes agent proof', evidence.judgeRunbook.steps[3]?.paths?.includes('/api/injective?tool=get-agent-proof&agentId=43'))
assertEqual('evidence judgeRunbook final command', evidence.judgeRunbook.steps[4]?.command, 'npm run verify:demo')
assertEqual('evidence timeline summary owner', evidence.timelineSummary?.owner, PROOF_OWNER)
assertEqual('evidence timeline summary event count', evidence.timelineSummary?.eventCount, TIMELINE_EVENTS.length)
assertEqual('evidence timeline summary RPC verification', evidence.timelineSummary?.rpcVerification, '/api/injective?tool=get-wallet-timeline')
assertEqual('evidence handshake proof key', evidence.handshakeProof?.key, SOCIAL_HANDSHAKE_PROOF.key)
assertEqual('evidence handshake proof contract', evidence.handshakeProof?.contract, SOCIAL_HANDSHAKE)
assertEqual('evidence handshake proof transactionHash', evidence.handshakeProof?.transactionHash, TIMELINE_EVENTS.at(-1).hash)
assertEqual('evidence handshake proof agentA', evidence.handshakeProof?.agentA, 43)
assertEqual('evidence handshake proof agentB', evidence.handshakeProof?.agentB, 44)
assertEqual('evidence handshake proof score', evidence.handshakeProof?.score, 88)
assertTrue('evidence handshake proof protects raw profile fields', String(evidence.handshakeProof?.profileCommitmentPolicy || '').includes('raw profile fields stay off-chain'))
assertEqual('evidence handshake proof local verification', evidence.handshakeProof?.localVerification, SOCIAL_HANDSHAKE_PROOF.localVerification)
assertEqual('evidence registry mint summary owner', evidence.registryMintSummary?.owner, PROOF_OWNER)
assertEqual('evidence registry mint summary owner scan URL', evidence.registryMintSummary?.ownerScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('evidence registry mint summary registry', evidence.registryMintSummary?.registry, IDENTITY_REGISTRY)
assertEqual('evidence registry mint summary registry scan URL', evidence.registryMintSummary?.registryScanUrl, scanUrlForRegistry())
assertEqual('evidence registry mint summary event count', evidence.registryMintSummary?.eventCount, REGISTRY_MINT_EVENTS.length)
assertEqual('evidence registry mint summary first agent', evidence.registryMintSummary?.firstAgentId, REGISTRY_MINT_EVENTS[0].agentId)
assertEqual('evidence registry mint summary last agent', evidence.registryMintSummary?.lastAgentId, REGISTRY_MINT_EVENTS.at(-1).agentId)
assertTrue('evidence registry mint summary has agent ids', evidence.registryMintSummary?.agentIds?.join(',') === REGISTRY_MINT_EVENTS.map((event) => event.agentId).join(','))
assertTrue('evidence registry mint summary all mints from zero', evidence.registryMintSummary?.allMintFromZero === true)
assertTrue('evidence registry mint summary all mints to owner', evidence.registryMintSummary?.allToOwner === true)
assertEqual('evidence registry mint summary first block', evidence.registryMintSummary?.firstBlock, REGISTRY_MINT_EVENTS[0].blockNumber)
assertEqual('evidence registry mint summary last block', evidence.registryMintSummary?.lastBlock, REGISTRY_MINT_EVENTS.at(-1).blockNumber)
assertEqual('evidence registry mint summary local verification', evidence.registryMintSummary?.localVerification, evidence.verification?.registryEvents)
assertTrue('evidence recording order array', Array.isArray(evidence.recordingOrder))
assertEqual('evidence recording order count', evidence.recordingOrder.length, 7)
assertFocusIncludes('judge step 1', evidence.recordingOrder[0], 'agentId 43')
assertFocusIncludes('judge step 1', evidence.recordingOrder[0], 'owner')
assertFocusIncludes('judge step 3', evidence.recordingOrder[2], 'registryMintSummary')
assertFocusIncludes('judge step 4', evidence.recordingOrder[3], 'agentId 43')
assertFocusIncludes('judge step 4', evidence.recordingOrder[3], 'sourceControl')
assertFocusIncludes('judge step 5', evidence.recordingOrder[4], `builderCode=${BUILDER_CODE}`)
assertFocusIncludes('judge step 6', evidence.recordingOrder[5], 'allSucceeded')
assertFocusIncludes('judge step 6', evidence.recordingOrder[5], `chainId ${INJECTIVE_TESTNET_CHAIN_ID}`)
assertFocusIncludes('judge step 7', evidence.recordingOrder[6], 'agent-plaza')

console.log('\nDocs link the one-page path')
assertTrue('README links judge quickstart', readme.includes('INJECTIVE-INTEGRATION/JUDGE-QUICKSTART.md'))
assertTrue('integration README links judge quickstart', integrationReadme.includes('JUDGE-QUICKSTART.md'))
assertTrue('chain evidence links judge quickstart', chainEvidence.includes('JUDGE-QUICKSTART.md'))
assertTrue('demo script mentions judge check', demoScript.includes('npm run verify:judge'))

console.log('\nPublic-only guard')
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
  assertTrue(`quickstart omits ${forbidden}`, !quickstart.includes(forbidden))
}

console.log('\nOK judge quickstart is public, followable, and wired into the evidence API.')
