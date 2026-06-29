// Verify the public evidence package maps Pocket Earth to the Injective Nova judging story.
// Usage: npm run verify:nova-alignment
import { readFile } from 'node:fs/promises'
import { handleInjective } from '../injective-service.mjs'
import { BUILDER_CODE, INTEGRATION_ALIGNMENT, IDENTITY_REGISTRY, SOCIAL_HANDSHAKE } from './chain-proof-data.mjs'

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
const demoScript = await readFile('INJECTIVE-INTEGRATION/DEMO-SCRIPT.md', 'utf8')
const evidence = await callEvidenceApi()
const alignment = evidence.integrationAlignment
const expectedByKey = new Map(INTEGRATION_ALIGNMENT.map((item) => [item.key, item]))

assertTrue('integrationAlignment array', Array.isArray(alignment))
assertEqual('integrationAlignment count', alignment.length, INTEGRATION_ALIGNMENT.length)
assertEqual('integrationAlignment unique key count', new Set(alignment.map((item) => item.key)).size, alignment.length)
assertEqual('nova alignment command', evidence.verification?.novaAlignment, 'npm run verify:nova-alignment')
assertEqual('nova alignment script', packageJson.scripts?.['verify:nova-alignment'], 'node INJECTIVE-INTEGRATION/verify-nova-alignment.mjs')

for (const expected of INTEGRATION_ALIGNMENT) {
  const actual = alignment.find((item) => item.key === expected.key)
  assertTrue(`alignment includes ${expected.key}`, Boolean(actual))
  assertEqual(`${expected.key} integrationSignal`, actual.integrationSignal, expected.integrationSignal)
  assertEqual(`${expected.key} projectSignal`, actual.projectSignal, expected.projectSignal)
  assertEqual(`${expected.key} evidence`, actual.evidence, expected.evidence)
  assertEqual(`${expected.key} machineCheck`, actual.machineCheck, expected.machineCheck)
  if (actual.machineCheck.startsWith('npm run ')) {
    const scriptName = actual.machineCheck.replace('npm run ', '')
    assertTrue(`${expected.key} npm script exists`, Boolean(packageJson.scripts?.[scriptName]))
  }
}

const aiSocial = expectedByKey.get('ai-social')
assertTrue('AI social alignment mentions public-plaza', aiSocial.projectSignal.includes('public-plaza'))
assertTrue('AI social alignment reads builderCode fleet', aiSocial.evidence.includes(`builderCode=${BUILDER_CODE}`) && aiSocial.evidence.includes('agentId 43-47'))

const executionLayer = expectedByKey.get('injective-execution-layer')
assertTrue('execution alignment mentions Injective testnet', executionLayer.projectSignal.includes('Injective testnet'))
assertTrue('execution alignment mentions ERC-8004 identity', executionLayer.projectSignal.includes('ERC-8004'))
assertTrue('execution alignment pins IdentityRegistry', executionLayer.evidence.includes(IDENTITY_REGISTRY))
assertTrue('execution alignment pins SocialHandshake', executionLayer.evidence.includes(SOCIAL_HANDSHAKE))

const physicalWorld = expectedByKey.get('agent-physical-world')
assertTrue('physical-world alignment mentions Frost Buddy', physicalWorld.projectSignal.includes('Frost Buddy'))
assertTrue('physical-world alignment mentions Raspberry Pi', physicalWorld.projectSignal.includes('Raspberry Pi'))
assertTrue('physical-world alignment mentions chain dispatch', physicalWorld.evidence.includes('chain_dispatch'))

const publicProof = expectedByKey.get('privacy-first-public-proof')
assertTrue('public proof alignment mentions publicOnly evidence', publicProof.evidence.includes('publicOnly'))
assertTrue('public proof alignment mentions registry mint events', publicProof.evidence.includes('registryMintEvents'))
assertTrue('public proof alignment mentions registry mint summary', publicProof.evidence.includes('registryMintSummary'))
assertTrue('public proof alignment mentions reviewBrief', publicProof.evidence.includes('reviewBrief'))
assertTrue('public proof alignment mentions privacyBoundary', publicProof.evidence.includes('privacyBoundary'))

assertTrue('README names AI social positioning', readme.includes('AI 社交') || readme.includes('代理社交'))
assertTrue('README names hardware extension', readme.includes('Raspberry Pi') && readme.includes('Frost Buddy'))
assertTrue('demo script names physical hardware carefully', demoScript.includes('硬件一句话') && demoScript.includes('不要说成已量产'))

const publicText = JSON.stringify(alignment)
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB', '/Users/zhangcheng/Desktop']) {
  assertTrue(`integrationAlignment omits ${forbidden}`, !publicText.includes(forbidden))
}

console.log('\nOK integrationAlignment maps Pocket Earth to the Injective Nova story without private data.')
