// Verify the public Blockscout links shown in README, evidence pack, and the demo script.
// Usage: node INJECTIVE-INTEGRATION/verify-demo-links.mjs
import { readFile } from 'node:fs/promises'
import { BUILDER_CODE, FLEET_AGENT_IDS, IDENTITY_REGISTRY, PROOF_OWNER, SOCIAL_HANDSHAKE, TIMELINE_EVENTS, scanUrlForAddress, scanUrlForAgent, scanUrlForTx } from './chain-proof-data.mjs'

const FILES = [
  'README.md',
  'INJECTIVE-INTEGRATION/README.md',
  'INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md',
  'INJECTIVE-INTEGRATION/DEMO-SCRIPT.md',
]

const mainRegistration = TIMELINE_EVENTS[0]
const handshakeDeployment = TIMELINE_EVENTS[1]
const realHandshake = TIMELINE_EVENTS.at(-1)

const REQUIRED_DEMO_LINKS = [
  scanUrlForAgent(43),
  scanUrlForAddress(PROOF_OWNER),
  scanUrlForTx(mainRegistration.hash),
  scanUrlForAddress(SOCIAL_HANDSHAKE),
  scanUrlForTx(handshakeDeployment.hash),
  scanUrlForTx(realHandshake.hash),
  scanUrlForAddress(IDENTITY_REGISTRY),
]

const REQUIRED_EVIDENCE_LINKS = [
  ...REQUIRED_DEMO_LINKS,
  ...FLEET_AGENT_IDS.slice(1).map(scanUrlForAgent),
  ...TIMELINE_EVENTS.slice(2, 6).map((event) => scanUrlForTx(event.hash)),
]

const REQUIRED_EVIDENCE_SNIPPETS = [
  '/api/injective?tool=get-chain-evidence',
  `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47`,
  '/api/injective?tool=get-wallet-timeline',
  'registryMintEvents',
  'registryMintSummary',
  '| Fleet |',
  '| Wallet timeline |',
  'timelineSummary',
  'all-succeeded status',
  'reviewBrief',
  'reviewEntrypoints',
  'reviewChecklist',
  'deliveryChecklist',
  'sourceControl',
  'JUDGE-QUICKSTART.md',
  'recordingOrder',
  'Public-only privacy boundary',
  'plazaFlow',
  'public-plaza',
  'agent-plaza',
  'Product demo loop',
  'npm run verify:demo',
  'npm run verify:duration',
  'npm run verify:evidence',
  'npm run verify:public-proof',
  'npm run verify:github',
  'npm run verify:positioning',
  'app source, hardware bridge, docs, and frost-agent wording guard',
  'npm run verify:pitch',
  'npm run verify:judge',
  'npm run verify:brief',
  'npm run verify:review',
  'npm run verify:review-links',
  'npm run verify:recording-order',
  'npm run verify:wallet',
  'npm run verify:source',
  'npm run verify:registry',
  'npm run verify:plaza-flow',
  'npm run verify:nova-alignment',
  'npm run verify:delivery',
  'npm run verify:injective',
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
