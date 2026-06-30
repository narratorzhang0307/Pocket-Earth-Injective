// Verify /api/injective write tools stay dry-run unless server key and explicit confirm are present.
// Usage: node INJECTIVE-INTEGRATION/verify-api-write-boundaries.mjs
import { Readable } from 'node:stream'
import { handleInjective } from '../injective-service.mjs'

const HASH_A = '0x' + 'a'.repeat(64)
const HASH_B = '0x' + 'b'.repeat(64)
const FAKE_PRIVATE_KEY = 'test-only-not-a-real-key'
const HANDSHAKE_CONTRACT = '0xe5338a162a44a685201e1f6120b1a851949e3aee'
const OLD_PAYMENT_ROUTE_FIELD = ['x', '402'].join('')

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

function assertNoOldPaymentRoute(label, value) {
  assertTrue(`${label} omits old payment route field`, !JSON.stringify(value).includes(OLD_PAYMENT_ROUTE_FIELD))
}

async function postInjectiveApi(path, body, cfg = {}) {
  let statusCode = 0
  let text = ''
  const req = Readable.from([JSON.stringify(body)])
  req.method = 'POST'
  const res = {
    writeHead(code) { statusCode = code },
    end(chunk) { text += chunk || '' },
  }
  await handleInjective(req, res, new URL(`http://localhost${path}`), { network: 'testnet', ...cfg })
  assertEqual(`${path} HTTP status`, statusCode, 200)
  return JSON.parse(text)
}

const registerPreview = await postInjectiveApi('/api/injective?tool=register', {
  name: 'Boundary Check',
  passport: {
    description: 'Dry-run boundary check for Pocket Earth on Injective',
    topTags: ['boundary', 'injective'],
  },
  services: [{ name: 'MCP', endpoint: 'https://pocketearth.throughtheglass.art' }],
})

console.log('\n/api register without key or confirm')
assertEqual('register preview ok', registerPreview.ok, true)
assertEqual('register preview dryRun', registerPreview.dryRun, true)
assertEqual('register preview address', registerPreview.address, null)
assertTrue('register preview has no tx hashes', Array.isArray(registerPreview.txHashes) && registerPreview.txHashes.length === 0)
assertEqual('register preview scanUrl', registerPreview.scanUrl, null)
assertEqual('register preview builderCode', registerPreview.willRegister?.builderCode, 'pocket-earth')
assertTrue('register preview tags', registerPreview.willRegister?.tags?.includes('injective'))
assertTrue('register preview data URI card', String(registerPreview.willRegister?.uri || '').startsWith('data:application/json;base64,'))
assertEqual('register preview optional payment receipt', registerPreview.willRegister?.optionalPaymentReceipt, null)
assertNoOldPaymentRoute('register preview', registerPreview)

const registerConfirmedNoKey = await postInjectiveApi('/api/injective?tool=register', {
  name: 'Boundary Check',
  confirm: true,
  passport: { description: 'Confirmed write should still require a server key', topTags: ['boundary'] },
})

console.log('\n/api register confirm:true without key')
assertEqual('register confirm without key error', registerConfirmedNoKey.error, 'no_private_key')
assertTrue('register confirm without key has no tx hash', !registerConfirmedNoKey.txHash && !registerConfirmedNoKey.txHashes)
assertNoOldPaymentRoute('register confirm without key', registerConfirmedNoKey)

const handshakePreview = await postInjectiveApi('/api/injective?tool=handshake', {
  agentA: 43,
  agentB: 44,
  score: 88,
  profileHashA: HASH_A,
  profileHashB: HASH_B,
})

console.log('\n/api handshake without key or confirm')
assertEqual('handshake preview ok', handshakePreview.ok, true)
assertEqual('handshake preview dryRun', handshakePreview.dryRun, true)
assertEqual('handshake preview agentA', handshakePreview.willEmit?.agentA, 43)
assertEqual('handshake preview agentB', handshakePreview.willEmit?.agentB, 44)
assertEqual('handshake preview score', handshakePreview.willEmit?.score, 88)
assertEqual('handshake preview profileHashA', handshakePreview.willEmit?.profileHashA, HASH_A)
assertEqual('handshake preview profileHashB', handshakePreview.willEmit?.profileHashB, HASH_B)
assertTrue('handshake preview has no tx hash', !handshakePreview.txHash)

const handshakeConfirmedEmptyHashes = await postInjectiveApi('/api/injective?tool=handshake', {
  agentA: 43,
  agentB: 44,
  score: 88,
  confirm: true,
}, {
  privateKey: FAKE_PRIVATE_KEY,
  handshakeContract: HANDSHAKE_CONTRACT,
})

console.log('\n/api handshake confirm:true with empty hashes')
assertEqual('handshake empty hash error', handshakeConfirmedEmptyHashes.error, 'empty_profile_hash')
assertTrue('handshake empty hash has no tx hash', !handshakeConfirmedEmptyHashes.txHash)

const handshakeConfirmedInvalidHash = await postInjectiveApi('/api/injective?tool=handshake', {
  agentA: 43,
  agentB: 44,
  score: 88,
  confirm: true,
  profileHashA: 'not-a-bytes32',
  profileHashB: HASH_B,
}, {
  privateKey: FAKE_PRIVATE_KEY,
  handshakeContract: HANDSHAKE_CONTRACT,
})

console.log('\n/api handshake confirm:true with invalid hash')
assertEqual('handshake invalid hash error', handshakeConfirmedInvalidHash.error, 'invalid_profile_hash')
assertTrue('handshake invalid hash has no tx hash', !handshakeConfirmedInvalidHash.txHash)

console.log('\nOK /api/injective write tools require explicit key-backed confirmation before any on-chain transaction.')
