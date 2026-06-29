// Verify the public submission links point to the Injective repo, demo, and review APIs.
// Usage: npm run verify:submission
import { readFile } from 'node:fs/promises'
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  DEMO_VIDEO_LIMIT_SECONDS,
  LIVE_DEMO_URL,
  SUBMISSION_CHECKLIST,
  SUBMISSION_LINKS,
  SUBMISSION_REPOSITORY_URL,
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

const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
const readme = await readFile('README.md', 'utf8')
const chainEvidence = await readFile('INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md', 'utf8')
const demoScript = await readFile('INJECTIVE-INTEGRATION/DEMO-SCRIPT.md', 'utf8')
const evidence = await callEvidenceApi()
const links = evidence.submissionLinks
const checklist = evidence.submissionChecklist
const expectedByKey = new Map(SUBMISSION_LINKS.map((item) => [item.key, item]))
const checklistByKey = new Map(SUBMISSION_CHECKLIST.map((item) => [item.key, item]))
const linkKeys = new Set(SUBMISSION_LINKS.map((item) => item.key))

assertTrue('submissionLinks array', Array.isArray(links))
assertEqual('submissionLinks count', links.length, SUBMISSION_LINKS.length)
assertEqual('submissionLinks unique key count', new Set(links.map((item) => item.key)).size, links.length)
assertEqual('submission command', evidence.verification?.submissionPack, 'npm run verify:submission')
assertEqual('submission script', packageJson.scripts?.['verify:submission'], 'node INJECTIVE-INTEGRATION/verify-submission-pack.mjs')
assertEqual('github repo command', evidence.verification?.githubRepo, 'npm run verify:github')
assertEqual('github repo script', packageJson.scripts?.['verify:github'], 'node INJECTIVE-INTEGRATION/verify-github-submission.mjs')
assertEqual('demo duration command', evidence.verification?.demoDuration, 'npm run verify:duration')
assertEqual('demo duration script', packageJson.scripts?.['verify:duration'], 'node INJECTIVE-INTEGRATION/verify-demo-duration.mjs')
assertEqual('demo video limit seconds', evidence.demoVideoLimitSeconds, DEMO_VIDEO_LIMIT_SECONDS)

for (const expected of SUBMISSION_LINKS) {
  const actual = links.find((item) => item.key === expected.key)
  assertTrue(`submissionLinks includes ${expected.key}`, Boolean(actual))
  assertEqual(`${expected.key} label`, actual.label, expected.label)
  assertEqual(`${expected.key} type`, actual.type, expected.type)
  if (expected.url) assertEqual(`${expected.key} url`, actual.url, expected.url)
  if (expected.path) assertEqual(`${expected.key} path`, actual.path, expected.path)
}

assertEqual('repository url', expectedByKey.get('github-repo').url, SUBMISSION_REPOSITORY_URL)
assertTrue('repository url points at Injective repo', SUBMISSION_REPOSITORY_URL.endsWith('/Pocket-Earth-Injective'))
assertTrue('repository url is not the old plus repo', !SUBMISSION_REPOSITORY_URL.includes('Pocket-Earth-Plus'))
assertTrue('repository url is not the sunset repo', !SUBMISSION_REPOSITORY_URL.includes('Sunset-Radio'))

assertEqual('live demo url', expectedByKey.get('live-demo').url, LIVE_DEMO_URL)
assertTrue('live demo url includes demo seed', LIVE_DEMO_URL.endsWith('/?demo'))
assertTrue('live demo url uses Pocket Earth domain', LIVE_DEMO_URL.startsWith('https://pocketearth.throughtheglass.art/'))

assertEqual('chain evidence API path', expectedByKey.get('chain-evidence-api').path, '/api/injective?tool=get-chain-evidence')
assertEqual('agent fleet API path', expectedByKey.get('agent-fleet-api').path, `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47`)
assertEqual('wallet timeline API path', expectedByKey.get('wallet-timeline-api').path, '/api/injective?tool=get-wallet-timeline')

console.log('\nSubmission checklist')
assertTrue('submissionChecklist array', Array.isArray(checklist))
assertEqual('submissionChecklist count', checklist.length, SUBMISSION_CHECKLIST.length)
assertEqual('submissionChecklist unique key count', new Set(checklist.map((item) => item.key)).size, checklist.length)
for (const expected of SUBMISSION_CHECKLIST) {
  const actual = checklist.find((item) => item.key === expected.key)
  assertTrue(`submissionChecklist includes ${expected.key}`, Boolean(actual))
  assertEqual(`${expected.key} requirement`, actual.requirement, expected.requirement)
  assertEqual(`${expected.key} status`, actual.status, expected.status)
  assertEqual(`${expected.key} evidence`, actual.evidence, expected.evidence)
  assertEqual(`${expected.key} localCheck`, actual.localCheck, expected.localCheck)
  assertEqual(`${expected.key} linkKey`, actual.linkKey, expected.linkKey)
  assertTrue(`${expected.key} linkKey points to submissionLinks`, linkKeys.has(actual.linkKey))
  if (actual.localCheck.startsWith('npm run ')) {
    const scriptName = actual.localCheck.replace('npm run ', '')
    assertTrue(`${expected.key} npm script exists`, Boolean(packageJson.scripts?.[scriptName]))
  }
}
assertEqual('GitHub checklist status', checklistByKey.get('public-github-readme').status, 'ready')
assertEqual('GitHub checklist local check', checklistByKey.get('public-github-readme').localCheck, 'npm run verify:github')
assertEqual('Injective checklist status', checklistByKey.get('injective-integration').status, 'ready')
assertEqual('Demo checklist status', checklistByKey.get('demo-video-script').status, 'ready-for-recording')
assertEqual('Demo checklist local check', checklistByKey.get('demo-video-script').localCheck, 'npm run verify:duration')
assertEqual('Pitch checklist status', checklistByKey.get('pitch-deck-notes').status, 'ready-for-deck')
assertEqual('Public API checklist local check', checklistByKey.get('public-review-apis').localCheck, 'npm run verify:public-proof')
assertTrue('checklist mentions no private keys', checklistByKey.get('public-review-apis').evidence.includes('without private keys') || checklistByKey.get('public-review-apis').evidence.includes('read-only'))

assertTrue('README mentions live demo', readme.includes('https://pocketearth.throughtheglass.art'))
assertTrue('README names Injective repository evidence package', readme.includes('Injective 参赛版本'))
assertTrue('CHAIN-EVIDENCE mentions submission links', chainEvidence.includes('submissionLinks'))
assertTrue('CHAIN-EVIDENCE mentions submission checklist', chainEvidence.includes('submissionChecklist'))
assertTrue('DEMO-SCRIPT mentions submission check', demoScript.includes('npm run verify:submission'))
assertTrue('DEMO-SCRIPT mentions 3-minute limit', demoScript.includes('≤ 3 分钟') && demoScript.includes('180s'))

const publicText = JSON.stringify({ links, checklist })
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB', '/Users/zhangcheng/Desktop', 'Pocket-Earth-Plus', 'Sunset-Radio']) {
  assertTrue(`submission pack omits ${forbidden}`, !publicText.includes(forbidden))
}

console.log('\nOK submissionLinks and submissionChecklist point to the correct Injective review package.')
