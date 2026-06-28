// Verify Pocket Earth's own /api/injective read-only tools against Injective testnet.
// Usage: node INJECTIVE-INTEGRATION/verify-api-read-tools.mjs
import { handleInjective } from '../injective-service.mjs'

const OWNER = '0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934'
const BUILDER_CODE = 'pocket-earth'
const REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e'
const HANDSHAKE_CONTRACT = '0xe5338a162a44a685201e1f6120b1a851949e3aee'

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

async function callInjectiveApi(path) {
  let statusCode = 0
  let body = ''
  const req = { method: 'GET' }
  const res = {
    writeHead(code) { statusCode = code },
    end(chunk) { body += chunk || '' },
  }
  await handleInjective(req, res, new URL(`http://localhost${path}`), { network: 'testnet' })
  assertEqual(`${path} HTTP status`, statusCode, 200)
  const payload = JSON.parse(body)
  assertTrue(`${path} has no api error`, !payload.error)
  return payload
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

let ping, status, reputation, timeline
try {
  ping = await callInjectiveApi('/api/injective?tool=ping')
  status = await callInjectiveApi('/api/injective?tool=get-status&agentId=43')
  reputation = await callInjectiveApi('/api/injective?tool=get-reputation&agentId=43')
  timeline = await callInjectiveApi('/api/injective?tool=get-wallet-timeline')
} finally {
  console.warn = originalWarn
  console.error = originalError
}

console.log('\n/api ping')
assertEqual('ping sdk flag', ping.sdk, true)
assertEqual('ping reachable', ping.reachable, true)
assertEqual('ping network', ping.network, 'testnet')

console.log('\n/api get-status agentId 43')
assertEqual('status agentId', status.agentId, 43)
assertEqual('status owner', status.owner, OWNER)
assertEqual('status wallet', status.wallet, OWNER)
assertEqual('status builderCode', status.builderCode, BUILDER_CODE)
assertEqual('status identity registry', String(status.identityTuple || '').split(':')[2], REGISTRY)

console.log('\n/api get-reputation agentId 43')
assertTrue('reputation score is numeric', Number.isFinite(Number(reputation.score)))
assertTrue('reputation count is numeric', Number.isFinite(Number(reputation.count)))
assertTrue('reputation clients array', Array.isArray(reputation.clients))

console.log('\n/api get-wallet-timeline')
assertEqual('timeline ok', timeline.ok, true)
assertEqual('timeline owner', timeline.owner, OWNER)
assertEqual('timeline registry', timeline.registry, REGISTRY)
assertEqual('timeline handshake contract', timeline.handshakeContract, HANDSHAKE_CONTRACT)
assertTrue('timeline events array', Array.isArray(timeline.events))
assertEqual('timeline event count', timeline.events.length, 7)
assertEqual('timeline first role', timeline.events[0].role, 'agentId 43')
assertEqual('timeline first block', timeline.events[0].blockNumber, '131678496')
assertEqual('timeline first timestamp', timeline.events[0].timestamp, '2026-06-27T01:46:30.000Z')
assertEqual('timeline deployment contract', timeline.events[1].contractAddress, HANDSHAKE_CONTRACT)
assertEqual('timeline final role', timeline.events[6].role, 'agentId 43 <-> 44')
assertEqual('timeline final to', timeline.events[6].to, HANDSHAKE_CONTRACT)
assertEqual('timeline final timestamp', timeline.events[6].timestamp, '2026-06-28T21:34:21.000Z')
for (let i = 1; i < timeline.events.length; i += 1) {
  assertTrue(`timeline block order ${i}`, BigInt(timeline.events[i - 1].blockNumber) <= BigInt(timeline.events[i].blockNumber))
}

if (sdkWarnings.length) {
  console.log('\nNOTE Agent SDK card fetch warnings were suppressed; API read-tool fields were verified directly.')
}

console.log('\nOK /api/injective ping, get-status, get-reputation, and get-wallet-timeline read from Injective testnet.')
