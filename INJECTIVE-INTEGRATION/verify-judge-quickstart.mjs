// Guard the one-page judge quickstart against link drift and private evidence leaks.
// Usage: npm run verify:judge
import { readFile } from 'node:fs/promises'
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  DEMO_VIDEO_LIMIT_SECONDS,
  IDENTITY_REGISTRY,
  LIVE_DEMO_URL,
  PROOF_OWNER,
  SOCIAL_HANDSHAKE,
  SUBMISSION_REPOSITORY_URL,
  TIMELINE_EVENTS,
  scanUrlForAddress,
  scanUrlForAgent,
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
  'Submission Package',
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
  SUBMISSION_REPOSITORY_URL,
  LIVE_DEMO_URL,
  `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47`,
  '/api/injective?tool=get-chain-evidence',
  '/api/injective?tool=get-wallet-timeline',
]) {
  assertTrue(`quickstart contains ${snippet}`, quickstart.includes(snippet))
}

for (const snippet of [
  'ERC-8004',
  'agentId 43-47',
  'SocialHandshake',
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
  'npm run verify:injective',
  'npm run verify:plaza',
  'npm run verify:pitch',
]) {
  assertTrue(`quickstart contains ${command}`, quickstart.includes(command))
  const scriptName = command.replace('npm run ', '')
  assertTrue(`${command} script exists`, Boolean(packageJson.scripts?.[scriptName]))
}

console.log('\nEvidence API wiring')
assertEqual('judge command advertised', evidence.verification?.judgeQuickstart, 'npm run verify:judge')
assertEqual('judge npm script', packageJson.scripts?.['verify:judge'], 'node INJECTIVE-INTEGRATION/verify-judge-quickstart.mjs')
assertEqual('demo limit still 180 seconds', evidence.demoVideoLimitSeconds, DEMO_VIDEO_LIMIT_SECONDS)
assertEqual('evidence builderCode', evidence.builderCode, BUILDER_CODE)
assertTrue('evidence still public-only', evidence.readOnly === true && evidence.publicOnly === true)

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
