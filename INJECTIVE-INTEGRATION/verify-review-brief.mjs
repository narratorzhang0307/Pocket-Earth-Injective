// Verify the short judge-facing review brief embedded in the public evidence API.
// Usage: npm run verify:brief
import { readFile } from 'node:fs/promises'
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  INTEGRATION_ALIGNMENT,
  PROOF_OWNER,
  REVIEW_BRIEF,
  REVIEW_LINKS,
  REVIEW_ENTRYPOINTS,
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

const evidence = await callEvidenceApi()
const brief = evidence.reviewBrief

assertTrue('reviewBrief object', !!brief && typeof brief === 'object' && !Array.isArray(brief))
assertEqual('reviewBrief title', brief.title, REVIEW_BRIEF.title)
assertEqual('reviewBrief oneLiner', brief.oneLiner, REVIEW_BRIEF.oneLiner)
assertTrue('oneLiner names Injective', brief.oneLiner.includes('Injective'))
assertTrue('oneLiner names ERC-8004', brief.oneLiner.includes('ERC-8004'))
assertTrue('oneLiner states off-chain privacy', brief.oneLiner.includes('off-chain'))

const linkKeys = new Set(REVIEW_LINKS.map((link) => link.key))
const alignmentKeys = new Set(INTEGRATION_ALIGNMENT.map((item) => item.key))
const entrypointKeys = new Set(REVIEW_ENTRYPOINTS.map((link) => link.key))

console.log('\nInjective core proof cards')
assertTrue('injectiveCore array', Array.isArray(brief.injectiveCore))
assertEqual('injectiveCore count', brief.injectiveCore.length, REVIEW_BRIEF.injectiveCore.length)
assertEqual('injectiveCore unique key count', new Set(brief.injectiveCore.map((item) => item.key)).size, brief.injectiveCore.length)
assertTrue('identity card present', brief.injectiveCore.some((item) => item.key === 'erc8004-identity'))
assertTrue('fleet card present', brief.injectiveCore.some((item) => item.key === 'agent-fleet'))
assertTrue('handshake card present', brief.injectiveCore.some((item) => item.key === 'social-handshake'))
assertTrue('product loop card present', brief.injectiveCore.some((item) => item.key === 'product-loop'))
for (const item of brief.injectiveCore) {
  const expected = REVIEW_BRIEF.injectiveCore.find((candidate) => candidate.key === item.key)
  assertTrue(`${item.key} exists in source of truth`, !!expected)
  assertEqual(`${item.key} label`, item.label, expected.label)
  assertEqual(`${item.key} proof`, item.proof, expected.proof)
  assertEqual(`${item.key} linkKey`, item.linkKey, expected.linkKey)
  assertTrue(`${item.key} linkKey is public review link`, linkKeys.has(item.linkKey))
  assertEqual(`${item.key} machineCheck`, item.machineCheck, expected.machineCheck)
}
assertTrue('identity proof names owner wallet', brief.injectiveCore.find((item) => item.key === 'erc8004-identity')?.proof.includes(PROOF_OWNER))
assertTrue('identity proof names builderCode', brief.injectiveCore.find((item) => item.key === 'erc8004-identity')?.proof.includes(BUILDER_CODE))
assertTrue('handshake proof names commitments', brief.injectiveCore.find((item) => item.key === 'social-handshake')?.proof.includes('commitments'))
assertTrue('product loop proof names public-plaza', brief.injectiveCore.find((item) => item.key === 'product-loop')?.proof.includes('public-plaza'))

console.log('\nIntegration fit')
assertTrue('integrationFit array', Array.isArray(brief.integrationFit))
assertEqual('integrationFit count', brief.integrationFit.length, REVIEW_BRIEF.integrationFit.length)
assertTrue('integrationFit includes AI social', brief.integrationFit.some((item) => item.alignmentKey === 'ai-social'))
assertTrue('integrationFit includes Injective execution layer', brief.integrationFit.some((item) => item.alignmentKey === 'injective-execution-layer'))
assertTrue('integrationFit includes physical world', brief.integrationFit.some((item) => item.alignmentKey === 'agent-physical-world'))
for (const item of brief.integrationFit) {
  const expected = REVIEW_BRIEF.integrationFit.find((candidate) => candidate.alignmentKey === item.alignmentKey)
  assertTrue(`${item.alignmentKey} exists in source of truth`, !!expected)
  assertEqual(`${item.alignmentKey} theme`, item.theme, expected.theme)
  assertEqual(`${item.alignmentKey} why`, item.why, expected.why)
  assertTrue(`${item.alignmentKey} points to integrationAlignment`, alignmentKeys.has(item.alignmentKey))
}

console.log('\nReviewer path')
assertTrue('reviewerPath array', Array.isArray(brief.reviewerPath))
assertEqual('reviewerPath count', brief.reviewerPath.length, REVIEW_BRIEF.reviewerPath.length)
for (const [index, item] of brief.reviewerPath.entries()) {
  const expected = REVIEW_BRIEF.reviewerPath[index]
  assertEqual(`reviewer step ${index + 1} number`, item.step, index + 1)
  assertEqual(`reviewer step ${index + 1} label`, item.label, expected.label)
  assertEqual(`reviewer step ${index + 1} verifies`, item.verifies, expected.verifies)
  if (item.linkKey) assertTrue(`reviewer step ${index + 1} linkKey is public`, linkKeys.has(item.linkKey))
  if (item.entrypointKey) assertTrue(`reviewer step ${index + 1} entrypointKey is public`, entrypointKeys.has(item.entrypointKey))
  if (item.command) assertEqual(`reviewer step ${index + 1} command`, item.command, 'npm run verify:demo')
}

assertEqual('privacyLine', brief.privacyLine, REVIEW_BRIEF.privacyLine)
assertTrue('privacyLine states on-chain proof scope', brief.privacyLine.includes('Only public proofs go on-chain'))
assertTrue('privacyLine keeps raw media off-chain', brief.privacyLine.includes('Raw media'))
assertTrue('privacyLine keeps secret env values off-chain', brief.privacyLine.includes('secret env values'))

const [readme, evidenceDoc, demoScript] = await Promise.all([
  readFile(new URL('../README.md', import.meta.url), 'utf8'),
  readFile(new URL('./CHAIN-EVIDENCE.md', import.meta.url), 'utf8'),
  readFile(new URL('./DEMO-SCRIPT.md', import.meta.url), 'utf8'),
])
assertTrue('README mentions reviewBrief', readme.includes('reviewBrief'))
assertTrue('CHAIN-EVIDENCE mentions reviewBrief', evidenceDoc.includes('reviewBrief'))
assertTrue('DEMO-SCRIPT mentions reviewBrief', demoScript.includes('reviewBrief'))

const publicText = JSON.stringify(brief)
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB', '/Users/zhangcheng/Desktop', 'Pocket-Earth-Plus', 'Sunset-Radio']) {
  assertTrue(`reviewBrief omits ${forbidden}`, !publicText.includes(forbidden))
}

console.log('\nOK reviewBrief gives judges a concise, public-only Injective proof path.')
