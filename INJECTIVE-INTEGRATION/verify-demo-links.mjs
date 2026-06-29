// Verify the public Blockscout links shown in README, evidence pack, and the demo script.
// Usage: node INJECTIVE-INTEGRATION/verify-demo-links.mjs
import { readFile } from 'node:fs/promises'
import { BUILDER_CODE, IDENTITY_REGISTRY, PROOF_OWNER, SOCIAL_HANDSHAKE, TIMELINE_EVENTS, scanUrlForTx } from './chain-proof-data.mjs'

const FILES = [
  'README.md',
  'INJECTIVE-INTEGRATION/README.md',
  'INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md',
  'INJECTIVE-INTEGRATION/DEMO-SCRIPT.md',
]

const BLOCKSCOUT_BASE = 'https://testnet.blockscout.injective.network'
const FLEET_AGENT_IDS = [43, 44, 45, 46, 47]
const addressUrl = (address) => `${BLOCKSCOUT_BASE}/address/${address}`
const agentUrl = (agentId) => `${BLOCKSCOUT_BASE}/token/${IDENTITY_REGISTRY}/instance/${agentId}`
const mainRegistration = TIMELINE_EVENTS[0]
const handshakeDeployment = TIMELINE_EVENTS[1]
const realHandshake = TIMELINE_EVENTS.at(-1)

const REQUIRED_DEMO_LINKS = [
  agentUrl(43),
  addressUrl(PROOF_OWNER),
  scanUrlForTx(mainRegistration.hash),
  addressUrl(SOCIAL_HANDSHAKE),
  scanUrlForTx(handshakeDeployment.hash),
  scanUrlForTx(realHandshake.hash),
  addressUrl(IDENTITY_REGISTRY),
]

const REQUIRED_EVIDENCE_LINKS = [
  ...REQUIRED_DEMO_LINKS,
  ...FLEET_AGENT_IDS.slice(1).map(agentUrl),
  ...TIMELINE_EVENTS.slice(2, 6).map((event) => scanUrlForTx(event.hash)),
]

const REQUIRED_EVIDENCE_SNIPPETS = [
  `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47`,
  '/api/injective?tool=get-wallet-timeline',
  'node INJECTIVE-INTEGRATION/verify-api-read-tools.mjs',
]

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

async function assertHttp200(label, url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    if (!res.ok) throw new Error(`${label} returned HTTP ${res.status}`)
    console.log(`OK ${label}: HTTP ${res.status}`)
  } finally {
    clearTimeout(timer)
  }
}

function normalizeUrl(url) {
  return url.replace(/[.,;，。]+$/, '')
}

const docs = new Map()
for (const file of FILES) docs.set(file, await readFile(file, 'utf8'))

const allText = [...docs.values()].join('\n')
const blockscoutLinks = [...new Set(
  [...allText.matchAll(/https:\/\/testnet\.blockscout\.injective\.network\/[^\s)\]|<>]+/g)]
    .map((match) => normalizeUrl(match[0])),
)]

assertTrue('demo docs contain Blockscout links', blockscoutLinks.length >= REQUIRED_DEMO_LINKS.length)

const demoScript = docs.get('INJECTIVE-INTEGRATION/DEMO-SCRIPT.md') || ''
for (const link of REQUIRED_DEMO_LINKS) {
  assertTrue(`DEMO-SCRIPT contains ${link}`, demoScript.includes(link))
}

const evidencePack = docs.get('INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md') || ''
for (const link of REQUIRED_EVIDENCE_LINKS) {
  assertTrue(`CHAIN-EVIDENCE contains ${link}`, evidencePack.includes(link))
}
for (const snippet of REQUIRED_EVIDENCE_SNIPPETS) {
  assertTrue(`CHAIN-EVIDENCE contains ${snippet}`, evidencePack.includes(snippet))
}

for (const [index, link] of blockscoutLinks.entries()) {
  await assertHttp200(`doc Blockscout link ${index + 1}`, link)
}

console.log(`\nOK ${blockscoutLinks.length} public Injective Blockscout demo links are present and reachable.`)
