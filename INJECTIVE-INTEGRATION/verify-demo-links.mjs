// Verify the public Blockscout links shown in README and the demo script.
// Usage: node INJECTIVE-INTEGRATION/verify-demo-links.mjs
import { readFile } from 'node:fs/promises'

const FILES = [
  'README.md',
  'INJECTIVE-INTEGRATION/README.md',
  'INJECTIVE-INTEGRATION/DEMO-SCRIPT.md',
]

const REQUIRED_DEMO_LINKS = [
  'https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43',
  'https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934',
  'https://testnet.blockscout.injective.network/tx/0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554',
  'https://testnet.blockscout.injective.network/address/0xe5338a162a44a685201e1f6120b1a851949e3aee',
  'https://testnet.blockscout.injective.network/tx/0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722',
  'https://testnet.blockscout.injective.network/tx/0xce15c72f42fb3d8b70acebff11560227613c347a3f28c70b9d885d310515c42e',
  'https://testnet.blockscout.injective.network/address/0x8004A818BFB912233c491871b3d84c89A494BD9e',
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

for (const [index, link] of blockscoutLinks.entries()) {
  await assertHttp200(`doc Blockscout link ${index + 1}`, link)
}

console.log(`\nOK ${blockscoutLinks.length} public Injective Blockscout demo links are present and reachable.`)
