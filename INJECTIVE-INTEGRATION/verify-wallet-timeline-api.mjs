// Verify the product API wallet timeline used in the judge recording path.
// Usage: npm run verify:wallet
import { handleInjective } from '../injective-service.mjs'
import {
  IDENTITY_REGISTRY,
  PROOF_OWNER,
  SOCIAL_HANDSHAKE,
  TIMELINE_EVENTS,
  scanUrlForAddress,
  scanUrlForTx,
} from './chain-proof-data.mjs'

function lower(value) {
  return value == null ? null : String(value).toLowerCase()
}

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function assertEqual(label, actual, expected) {
  if (lower(actual) !== lower(expected)) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

async function callTimelineApi() {
  let statusCode = 0
  let body = ''
  const req = { method: 'GET' }
  const res = {
    writeHead(code) { statusCode = code },
    end(chunk) { body += chunk || '' },
  }
  await handleInjective(req, res, new URL('http://localhost/api/injective?tool=get-wallet-timeline'), { network: 'testnet' })
  assertEqual('wallet timeline HTTP status', statusCode, 200)
  const payload = JSON.parse(body)
  assertTrue('wallet timeline has no api error', !payload.error)
  return payload
}

const timeline = await callTimelineApi()

console.log('\nWallet timeline envelope')
assertEqual('timeline ok', timeline.ok, true)
assertEqual('timeline network', timeline.network, 'testnet')
assertEqual('timeline owner', timeline.owner, PROOF_OWNER)
assertEqual('timeline registry', timeline.registry, IDENTITY_REGISTRY)
assertEqual('timeline handshake contract', timeline.handshakeContract, SOCIAL_HANDSHAKE)
assertTrue('timeline events array', Array.isArray(timeline.events))
assertEqual('timeline event count', timeline.events.length, TIMELINE_EVENTS.length)
assertEqual('timeline unique hash count', new Set(timeline.events.map((event) => event.hash)).size, TIMELINE_EVENTS.length)
assertTrue('timeline summary object', !!timeline.summary && typeof timeline.summary === 'object')
assertEqual('timeline summary owner', timeline.summary.owner, PROOF_OWNER)
assertEqual('timeline summary wallet scanUrl', timeline.summary.walletScanUrl, scanUrlForAddress(PROOF_OWNER))
assertEqual('timeline summary event count', timeline.summary.eventCount, TIMELINE_EVENTS.length)
assertEqual('timeline summary all from owner', timeline.summary.allFromOwner, true)
assertEqual('timeline summary all succeeded', timeline.summary.allSucceeded, true)
assertEqual('timeline summary first block', timeline.summary.firstBlock, TIMELINE_EVENTS[0].blockNumber)
assertEqual('timeline summary last block', timeline.summary.lastBlock, TIMELINE_EVENTS.at(-1).blockNumber)
assertEqual('timeline summary first timestamp', timeline.summary.firstTimestamp, TIMELINE_EVENTS[0].timestamp)
assertEqual('timeline summary last timestamp', timeline.summary.lastTimestamp, TIMELINE_EVENTS.at(-1).timestamp)
assertEqual('timeline summary first role', timeline.summary.firstRole, TIMELINE_EVENTS[0].role)
assertEqual('timeline summary last role', timeline.summary.lastRole, TIMELINE_EVENTS.at(-1).role)
assertEqual('timeline summary evidence API', timeline.summary.evidenceApi, '/api/injective?tool=get-chain-evidence')

console.log('\nTimeline events')
for (const expected of TIMELINE_EVENTS) {
  const actual = timeline.events.find((event) => lower(event.hash) === lower(expected.hash))
  assertTrue(`${expected.role} exists`, Boolean(actual))
  assertEqual(`${expected.role} label`, actual.label, expected.label)
  assertEqual(`${expected.role} hash`, actual.hash, expected.hash)
  assertEqual(`${expected.role} from`, actual.from, PROOF_OWNER)
  assertEqual(`${expected.role} to`, actual.to, expected.to)
  assertEqual(`${expected.role} status`, actual.status, 'success')
  assertEqual(`${expected.role} blockNumber`, actual.blockNumber, expected.blockNumber)
  assertEqual(`${expected.role} timestamp`, actual.timestamp, expected.timestamp)
  assertEqual(`${expected.role} scanUrl`, actual.scanUrl, scanUrlForTx(expected.hash))
  if (expected.contractAddress) assertEqual(`${expected.role} contractAddress`, actual.contractAddress, expected.contractAddress)
}

for (let index = 1; index < timeline.events.length; index += 1) {
  const previous = timeline.events[index - 1]
  const current = timeline.events[index]
  assertTrue(`timeline block order ${index}`, BigInt(previous.blockNumber) <= BigInt(current.blockNumber))
}

assertEqual('first timeline event', timeline.events[0]?.hash, TIMELINE_EVENTS[0].hash)
assertEqual('final timeline event', timeline.events.at(-1)?.hash, TIMELINE_EVENTS.at(-1).hash)

console.log('\nPublic-only guard')
const publicText = JSON.stringify(timeline)
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB', '/Users/', 'Pocket-Earth-Plus', 'Sunset-Radio', 'sunset-radio']) {
  assertTrue(`timeline omits ${forbidden}`, !publicText.includes(forbidden))
}

console.log('\nOK wallet timeline API is a focused, public-only proof of the Injective transaction sequence.')
