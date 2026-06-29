// Verify the Pocket Earth agent fleet on Injective testnet.
// Usage: node INJECTIVE-INTEGRATION/verify-fleet.mjs
import { AgentReadClient } from '@injective/agent-sdk'
import { BUILDER_CODE, FLEET_AGENTS, IDENTITY_REGISTRY, PROOF_OWNER, scanUrlForAgent } from './chain-proof-data.mjs'

const CARD_TYPE = 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1'
const CARD_KEYS = ['description', 'metadata', 'name', 'tags', 'type']
const METADATA_KEYS = ['builderCode', 'chain']

function assertEqual(label, actual, expected) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function assertKeys(label, object, expected) {
  const keys = Object.keys(object || {}).sort()
  assertEqual(label, keys.join(','), expected.join(','))
}

function decodeDataCard(uri) {
  const prefix = 'data:application/json;base64,'
  if (typeof uri !== 'string' || !uri.startsWith(prefix)) return null
  return JSON.parse(Buffer.from(uri.slice(prefix.length), 'base64').toString('utf8'))
}

function assertPublicCardShape(id, card) {
  assertKeys(`agent ${id} card public fields`, card, CARD_KEYS)
  assertEqual(`agent ${id} card type`, card.type, CARD_TYPE)
  assertKeys(`agent ${id} card metadata public fields`, card.metadata, METADATA_KEYS)
  assertEqual(`agent ${id} card chain`, card.metadata.chain, 'injective')
  assertTrue(`agent ${id} card description is short public text`, typeof card.description === 'string' && card.description.length > 0 && card.description.length <= 160)
  assertTrue(`agent ${id} card tags are short public labels`, Array.isArray(card.tags) && card.tags.length > 0 && card.tags.length <= 10 && card.tags.every((tag) => typeof tag === 'string' && tag.length > 0 && tag.length <= 40))
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

const statuses = []
try {
  for (const agent of FLEET_AGENTS) statuses.push({ agent, status: await reader.getStatus(agent.id) })
} finally {
  console.warn = originalWarn
  console.error = originalError
}

for (const { agent, status } of statuses) {
  const id = String(agent.id)
  console.log(`\nagentId ${id} · ${agent.label}`)
  assertEqual(`agent ${id} id`, status.agentId, agent.id)
  assertEqual(`agent ${id} owner`, status.owner, PROOF_OWNER)
  assertEqual(`agent ${id} wallet`, status.wallet, PROOF_OWNER)
  assertEqual(`agent ${id} builderCode`, status.builderCode, BUILDER_CODE)
  assertEqual(`agent ${id} identity registry`, status.identityTuple.split(':')[2], IDENTITY_REGISTRY)
  await assertHttp200(`agent ${id} Blockscout`, scanUrlForAgent(id))

  const card = decodeDataCard(status.tokenUri)
  if (agent.requiredTag) {
    assertTrue(`agent ${id} data URI card`, !!card)
    assertPublicCardShape(id, card)
    assertEqual(`agent ${id} card builderCode`, card.metadata?.builderCode, BUILDER_CODE)
    assertEqual(`agent ${id} card name`, card.name, agent.label)
    assertTrue(`agent ${id} card tag ${agent.requiredTag}`, Array.isArray(card.tags) && card.tags.includes(agent.requiredTag))
  }
}

if (sdkWarnings.length) {
  console.log('\nNOTE Agent SDK card fetch warnings were suppressed; chain fields and data URI cards were verified directly.')
}

console.log('\nOK Pocket Earth agent fleet 43-47 and public data URI cards are verifiable on Injective testnet.')
