// Verify Pocket Earth's own /api/injective list-agents route reads the on-chain Injective agent fleet.
// Usage: node INJECTIVE-INTEGRATION/verify-api-list-agents.mjs
import { handleInjective } from '../injective-service.mjs'

const OWNER = '0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934'
const BUILDER_CODE = 'pocket-earth'
const REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e'
const API_URL = 'http://localhost/api/injective?tool=list-agents&limit=5&top=47&builderCode=pocket-earth'

const REQUIRED = [
  { id: '43', label: 'Frost main identity' },
  { id: '44', label: 'FROST·拉美文学旅人', requiredTag: '拉美文学' },
  { id: '45', label: 'FROST·黑色电影迷', requiredTag: '黑色电影' },
  { id: '46', label: 'FROST·爵士夜行者', requiredTag: '爵士' },
  { id: '47', label: 'FROST·北欧极光客', requiredTag: '北欧' },
]

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
assertTrue('api agents array', Array.isArray(payload.agents))
assertTrue('api returned full Pocket Earth fleet', payload.agents.length >= REQUIRED.length)

const byId = new Map(payload.agents.map((agent) => [String(agent.agentId), agent]))
for (const agent of REQUIRED) {
  const status = byId.get(agent.id)
  console.log(`\n/api list-agents agentId ${agent.id} · ${agent.label}`)
  assertTrue(`agent ${agent.id} present in /api list-agents`, !!status)
  assertEqual(`agent ${agent.id} owner`, status.owner, OWNER)
  assertEqual(`agent ${agent.id} wallet`, status.wallet, OWNER)
  assertEqual(`agent ${agent.id} builderCode`, status.builderCode, BUILDER_CODE)
  assertEqual(`agent ${agent.id} identity registry`, String(status.identityTuple || '').split(':')[2], REGISTRY)
  if (agent.requiredTag) {
    assertEqual(`agent ${agent.id} decoded card builderCode`, status.card?.metadata?.builderCode, BUILDER_CODE)
    assertEqual(`agent ${agent.id} decoded card name`, status.card?.name, agent.label)
    assertTrue(`agent ${agent.id} decoded card tag ${agent.requiredTag}`, Array.isArray(status.card?.tags) && status.card.tags.includes(agent.requiredTag))
  }
}

if (sdkWarnings.length) {
  console.log('\nNOTE Agent SDK card fetch warnings were suppressed; /api decoded data URI cards directly.')
}

console.log('\nOK /api/injective list-agents returns the verifiable Pocket Earth fleet from Injective testnet.')
