// Verify the public submission links point to the Injective repo, demo, and review APIs.
// Usage: npm run verify:submission
import { readFile } from 'node:fs/promises'
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  LIVE_DEMO_URL,
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
const expectedByKey = new Map(SUBMISSION_LINKS.map((item) => [item.key, item]))

assertTrue('submissionLinks array', Array.isArray(links))
assertEqual('submissionLinks count', links.length, SUBMISSION_LINKS.length)
assertEqual('submissionLinks unique key count', new Set(links.map((item) => item.key)).size, links.length)
assertEqual('submission command', evidence.verification?.submissionPack, 'npm run verify:submission')
assertEqual('submission script', packageJson.scripts?.['verify:submission'], 'node INJECTIVE-INTEGRATION/verify-submission-pack.mjs')

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

assertTrue('README mentions live demo', readme.includes('https://pocketearth.throughtheglass.art'))
assertTrue('README names Injective repository evidence package', readme.includes('Injective 参赛版本'))
assertTrue('CHAIN-EVIDENCE mentions submission links', chainEvidence.includes('submissionLinks'))
assertTrue('DEMO-SCRIPT mentions submission check', demoScript.includes('npm run verify:submission'))

const publicText = JSON.stringify(links)
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB', '/Users/zhangcheng/Desktop', 'Pocket-Earth-Plus', 'Sunset-Radio']) {
  assertTrue(`submissionLinks omits ${forbidden}`, !publicText.includes(forbidden))
}

console.log('\nOK submissionLinks point to the correct Injective review entry points.')
