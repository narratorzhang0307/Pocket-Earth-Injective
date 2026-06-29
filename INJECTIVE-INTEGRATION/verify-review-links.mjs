// Verify reviewer-facing links returned by the product evidence API.
// Usage: npm run verify:review-links
import { handleInjective } from '../injective-service.mjs'
import { REVIEW_CHECKLIST, REVIEW_LINKS } from './chain-proof-data.mjs'

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

async function assertHttpOk(label, url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`)
    console.log(`OK ${label}: HTTP ${response.status}`)
  } finally {
    clearTimeout(timer)
  }
}

const evidence = await callEvidenceApi()
const apiLinks = evidence.reviewLinks
const apiChecklist = evidence.reviewChecklist

assertTrue('api reviewLinks array', Array.isArray(apiLinks))
assertEqual('api reviewLinks count', apiLinks.length, REVIEW_LINKS.length)
const expectedByKey = new Map(REVIEW_LINKS.map((link) => [link.key, link]))
const apiKeys = new Set(apiLinks.map((link) => link.key))
assertEqual('api reviewLinks unique key count', apiKeys.size, REVIEW_LINKS.length)
assertTrue('api reviewChecklist array', Array.isArray(apiChecklist))
assertEqual('api reviewChecklist count', apiChecklist.length, REVIEW_CHECKLIST.length)

for (const expected of REVIEW_LINKS) {
  const actual = apiLinks.find((link) => link.key === expected.key)
  assertTrue(`api review link ${expected.key} exists`, Boolean(actual))
  assertEqual(`${expected.key} label`, actual.label, expected.label)
  assertEqual(`${expected.key} type`, actual.type, expected.type)
  assertEqual(`${expected.key} url`, actual.url, expected.url)
  if (expected.txHash || actual.txHash) assertEqual(`${expected.key} txHash`, actual.txHash, expected.txHash)
  assertTrue(`${expected.key} uses Injective testnet Blockscout`, String(actual.url).startsWith('https://testnet.blockscout.injective.network/'))
  await assertHttpOk(`${expected.key} Blockscout page`, actual.url)
}

for (const item of apiChecklist) {
  assertTrue(`${item.key} primary review link exists in API`, apiKeys.has(item.primaryLinkKey))
  assertTrue(`${item.key} primary review link exists in facts`, expectedByKey.has(item.primaryLinkKey))
}

const publicText = JSON.stringify({ reviewLinks: apiLinks, reviewChecklist: apiChecklist })
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB']) {
  assertTrue(`api reviewer links omit ${forbidden}`, !publicText.includes(forbidden))
}

console.log('\nOK API reviewer links are complete, public-only, and reachable on Injective Blockscout.')
