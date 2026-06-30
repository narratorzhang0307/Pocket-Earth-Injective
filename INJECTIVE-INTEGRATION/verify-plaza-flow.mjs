// Verify the public evidence API keeps public-plaza and agent-plaza separated.
// Usage: npm run verify:plaza-flow
import { access, readFile } from 'node:fs/promises'
import { handleInjective } from '../injective-service.mjs'
import { BUILDER_CODE, PLAZA_DEMO_FLOW } from './chain-proof-data.mjs'

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

async function fileExists(path) {
  await access(path)
  return true
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

function smokeScripts(flow) {
  return String(flow.smoke || '')
    .split(/\s*\+\s*/)
    .map((script) => script.trim())
    .filter(Boolean)
}

const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
const plazaInstallScript = await readFile('INJECTIVE-INTEGRATION/verify-plaza-install.mjs', 'utf8')
const evidence = await callEvidenceApi()
const flow = evidence.plazaFlow
const expectedByKey = new Map(PLAZA_DEMO_FLOW.map((item) => [item.key, item]))

assertTrue('plazaFlow array', Array.isArray(flow))
assertEqual('plazaFlow count', flow.length, PLAZA_DEMO_FLOW.length)
assertEqual('plazaFlow unique key count', new Set(flow.map((item) => item.key)).size, flow.length)
assertEqual('plaza smoke script', packageJson.scripts?.['verify:plaza'], 'node INJECTIVE-INTEGRATION/verify-plaza-suite.mjs')

for (const expected of PLAZA_DEMO_FLOW) {
  const actual = flow.find((item) => item.key === expected.key)
  assertTrue(`plazaFlow includes ${expected.key}`, Boolean(actual))
  assertEqual(`${expected.key} purpose`, actual.purpose, expected.purpose)
  assertEqual(`${expected.key} entry`, actual.entry, expected.entry)
  assertEqual(`${expected.key} chainRead`, actual.chainRead, expected.chainRead)
  assertEqual(`${expected.key} verifies`, actual.verifies, expected.verifies)
  assertEqual(`${expected.key} smoke`, actual.smoke, expected.smoke)
  for (const script of smokeScripts(actual)) {
    assertTrue(`${expected.key} smoke file ${script}`, await fileExists(script))
  }
}

const publicPlaza = expectedByKey.get('public-plaza')
assertTrue('public-plaza entry uses RUN action', publicPlaza.entry.includes('RUN'))
assertTrue('public-plaza chainRead uses Injective API', publicPlaza.chainRead.startsWith('/api/injective?tool=list-agents'))
assertTrue('public-plaza filters builderCode', publicPlaza.chainRead.includes(`builderCode=${BUILDER_CODE}`))
assertTrue('public-plaza reads full fleet', publicPlaza.chainRead.includes('limit=5') && publicPlaza.chainRead.includes('top=47'))
assertTrue('public-plaza verifies chain discovery', publicPlaza.verifies.includes('reads agentId 43-47 from Injective testnet'))
assertTrue('public-plaza verifies globe markers', publicPlaza.verifies.includes('pins agent markers'))
assertTrue('public-plaza verifies dispatch story', publicPlaza.verifies.includes('Nightly Chain Dispatch'))

const agentPlaza = expectedByKey.get('agent-plaza')
assertTrue('agent-plaza entry is catalog, not RUN card', !agentPlaza.entry.includes('RUN'))
assertTrue('agent-plaza shows chain badge', agentPlaza.chainRead.includes('Injective chain identity badge'))
assertTrue('agent-plaza verifies install gate', agentPlaza.verifies.includes('manifest review gate'))
assertTrue('agent-plaza verifies cafe-map install', agentPlaza.verifies.includes('installs cafe-map'))
assertTrue('agent-plaza verifies My Agents return', agentPlaza.verifies.includes('My Agents'))
for (const phrase of ['installedCafe.domain ===', 'geoStrategy.includes', 'mark_place', '▶ RUN']) {
  assertTrue(`plaza install script keeps ${phrase}`, plazaInstallScript.includes(phrase))
}

const productLoop = evidence.reviewChecklist?.find((item) => item.key === 'product-demo-loop')
assertTrue('product demo loop checklist exists', Boolean(productLoop))
assertTrue('product loop mentions public-plaza', productLoop.passCriteria?.some((item) => item.includes('public-plaza')))
assertTrue('product loop mentions agent-plaza', productLoop.passCriteria?.some((item) => item.includes('agent-plaza')))
assertEqual('product loop machine check', productLoop.machineCheck, 'npm run verify:plaza')

const publicText = JSON.stringify(flow)
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB']) {
  assertTrue(`plazaFlow omits ${forbidden}`, !publicText.includes(forbidden))
}

console.log('\nOK plazaFlow keeps public-plaza chain discovery separate from agent-plaza install loop.')
