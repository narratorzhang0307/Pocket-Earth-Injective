// Verify the public Blockscout links shown in README, evidence pack, and the demo script.
// Usage: node INJECTIVE-INTEGRATION/verify-demo-links.mjs
import { readFile } from 'node:fs/promises'

const FILES = [
  'README.md',
  'INJECTIVE-INTEGRATION/README.md',
  'INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md',
  'INJECTIVE-INTEGRATION/DEMO-SCRIPT.md',
]

const REQUIRED_DEMO_LINKS = [
  'https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43',
  'https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934',
  'https://testnet.blockscout.injective.network/tx/0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554',
  'https://testnet.blockscout.injective.network/address/0xe5338a162a44a685201e1f6120b1a851949e3aee',
  'https://testnet.blockscout.injective.network/tx/0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722',
  'https://testnet.blockscout.injective.network/tx/0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6',
  'https://testnet.blockscout.injective.network/address/0x8004A818BFB912233c491871b3d84c89A494BD9e',
]

const REQUIRED_EVIDENCE_LINKS = [
  ...REQUIRED_DEMO_LINKS,
  'https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/44',
  'https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/45',
  'https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/46',
  'https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/47',
  'https://testnet.blockscout.injective.network/tx/0x02a0590c2f1bc1e475d7cdfb2fa4c3eb5e0b9f7de4ac1f97e66663e0f5a38f44',
  'https://testnet.blockscout.injective.network/tx/0xc161f0df707b1c9b1e29311e944b7c1b40f3d525c9d1cbd2d71c67713333fffe',
  'https://testnet.blockscout.injective.network/tx/0x1bbd3df139b2558ff315d2029f00c01dc881a45542d5854176bbc49e6dfaea4e',
  'https://testnet.blockscout.injective.network/tx/0xada3e082b8e8988e414bcf201739f2a2a3b5fe9c947db71ebe1e7467f3de1a50',
]

const REQUIRED_EVIDENCE_SNIPPETS = [
  '/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47',
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
