// Verify the main Frost identity on Injective testnet.
// Usage: node INJECTIVE-INTEGRATION/verify-agent43.mjs
import { AgentReadClient } from '@injective/agent-sdk'

const AGENT_ID = 43n
const OWNER = '0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934'
const BUILDER_CODE = 'pocket-earth'
const REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e'

const links = {
  agent43: `https://testnet.blockscout.injective.network/token/${REGISTRY}/instance/${AGENT_ID}`,
  wallet: `https://testnet.blockscout.injective.network/address/${OWNER}`,
  handshake: 'https://testnet.blockscout.injective.network/address/0xe5338a162a44a685201e1f6120b1a851949e3aee',
}

function assertEqual(label, actual, expected) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
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

const reader = new AgentReadClient({ network: 'testnet' })
const sdkWarnings = []
const originalWarn = console.warn
const originalError = console.error
console.warn = (...args) => {
  const msg = args.join(' ')
  if (msg.includes('Failed to fetch card')) sdkWarnings.push(msg)
  else originalWarn(...args)
}
console.error = (...args) => {
  const msg = args.join(' ')
  if (msg.includes('Failed to fetch card')) sdkWarnings.push(msg)
  else originalError(...args)
}

let status
try {
  status = await reader.getStatus(AGENT_ID)
} finally {
  console.warn = originalWarn
  console.error = originalError
}

assertEqual('agentId', status.agentId, AGENT_ID)
assertEqual('owner', status.owner, OWNER)
assertEqual('wallet', status.wallet, OWNER)
assertEqual('builderCode', status.builderCode, BUILDER_CODE)
assertEqual('identity registry', status.identityTuple.split(':')[2], REGISTRY)

for (const [label, url] of Object.entries(links)) {
  await assertHttp200(label, url)
}

if (sdkWarnings.length) {
  console.log('NOTE Agent Card metadata fetch was skipped; chain identity fields were verified directly.')
}
console.log('OK Frost agentId 43 is verifiably Pocket Earth on Injective testnet.')
