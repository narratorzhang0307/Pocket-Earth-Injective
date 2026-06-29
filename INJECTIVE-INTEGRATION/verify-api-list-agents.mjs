// Verify Pocket Earth's own /api/injective list-agents route reads the on-chain Injective agent fleet.
// Usage: node INJECTIVE-INTEGRATION/verify-api-list-agents.mjs
import { handleInjective } from '../injective-service.mjs'
import { BUILDER_CODE, FLEET_AGENTS, IDENTITY_REGISTRY, PROOF_OWNER } from './chain-proof-data.mjs'

const topAgentId = Math.max(...FLEET_AGENTS.map((agent) => Number(agent.id)))
const API_URL = `http://localhost/api/injective?tool=list-agents&limit=${FLEET_AGENTS.length}&top=${topAgentId}&builderCode=${BUILDER_CODE}`

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function assertEqual(label, actual, expected) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

async function callInjectiveApi(url) {
  let statusCode = 0
  let body = ''
  const req = { method: 'GET' }
  const res = {
    writeHead(code) { statusCode = code },
    end(chunk) { body += chunk || '' },
  }
  await handleInjective(req, res, new URL(url), { network: 'testnet' })
  assertEqual('api HTTP status', statusCode, 200)
  return JSON.parse(body)
}

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

let payload
try {
  payload = await callInjectiveApi(API_URL)
} finally {
  console.warn = originalWarn
  console.error = originalError
}

assertEqual('api sdk flag', payload.sdk, true)
assertEqual('api builderCode filter', payload.builderCode, BUILDER_CODE)
assertEqual('api total', payload.total, FLEET_AGENTS.length)
assertEqual('api offset', payload.offset, 0)
assertEqual('api limit', payload.limit, FLEET_AGENTS.length)
assertTrue('api agents array', Array.isArray(payload.agents))
assertEqual('api returned full Pocket Earth fleet', payload.agents.length, FLEET_AGENTS.length)

const byId = new Map(payload.agents.map((agent) => [String(agent.agentId), agent]))
for (const agent of FLEET_AGENTS) {
  const id = String(agent.id)
  const status = byId.get(id)
  console.log(`\n/api list-agents agentId ${id} · ${agent.label}`)
  assertTrue(`agent ${id} present in /api list-agents`, !!status)
  assertEqual(`agent ${id} owner`, status.owner, PROOF_OWNER)
  assertEqual(`agent ${id} wallet`, status.wallet, PROOF_OWNER)
  assertEqual(`agent ${id} builderCode`, status.builderCode, BUILDER_CODE)
  assertEqual(`agent ${id} identity registry`, String(status.identityTuple || '').split(':')[2], IDENTITY_REGISTRY)
  if (agent.requiredTag) {
    assertEqual(`agent ${id} decoded card builderCode`, status.card?.metadata?.builderCode, BUILDER_CODE)
    assertEqual(`agent ${id} decoded card chain`, status.card?.metadata?.chain, 'injective')
    assertEqual(`agent ${id} decoded card name`, status.card?.name, agent.label)
    assertTrue(`agent ${id} decoded card description`, String(status.card?.description || '').length > 10)
    assertTrue(`agent ${id} decoded card tag ${agent.requiredTag}`, Array.isArray(status.card?.tags) && status.card.tags.includes(agent.requiredTag))
    const allowedCardKeys = ['type', 'name', 'description', 'tags', 'metadata']
    assertTrue(`agent ${id} decoded card public keys only`, Object.keys(status.card || {}).every((key) => allowedCardKeys.includes(key)))
  }
}

if (sdkWarnings.length) {
  console.log('\nNOTE Agent SDK card fetch warnings were suppressed; /api decoded data URI cards directly.')
}

console.log('\nOK /api/injective list-agents returns the verifiable Pocket Earth fleet from Injective testnet.')
