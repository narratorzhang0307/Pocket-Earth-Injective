// Verify the on-chain transaction timeline behind the wallet evidence page.
// Usage: node INJECTIVE-INTEGRATION/verify-chain-timeline.mjs
import { createPublicClient, defineChain, http } from 'viem'
import { INJECTIVE_TESTNET_CHAIN_ID, INJECTIVE_TESTNET_RPC, PROOF_OWNER, TIMELINE_EVENTS } from './chain-proof-data.mjs'

const chain = defineChain({
  id: INJECTIVE_TESTNET_CHAIN_ID,
  name: 'Injective Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: [INJECTIVE_TESTNET_RPC] } },
})

function lower(value) {
  return value == null ? null : String(value).toLowerCase()
}

function assertEqual(label, actual, expected) {
  if (lower(actual) !== lower(expected)) throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  console.log(`OK ${label}: ${actual}`)
}

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

const client = createPublicClient({ chain, transport: http(INJECTIVE_TESTNET_RPC) })
const rows = []

for (const expected of TIMELINE_EVENTS) {
  const [tx, receipt] = await Promise.all([
    client.getTransaction({ hash: expected.hash }),
    client.getTransactionReceipt({ hash: expected.hash }),
  ])
  const block = await client.getBlock({ blockNumber: receipt.blockNumber })
  const timestamp = new Date(Number(block.timestamp) * 1000).toISOString()

  console.log(`\n${expected.label} · ${expected.role}`)
  assertEqual('tx.hash', tx.hash, expected.hash)
  assertEqual('tx.from', tx.from, PROOF_OWNER)
  assertEqual('tx.to', tx.to, expected.to)
  assertEqual('receipt.status', receipt.status, 'success')
  assertEqual('receipt.blockNumber', receipt.blockNumber, expected.blockNumber)
  assertEqual('block.timestamp', timestamp, expected.timestamp)
  if (expected.contractAddress) assertEqual('receipt.contractAddress', receipt.contractAddress, expected.contractAddress)

  rows.push({ ...expected, tx, receipt, timestamp })
}

for (let index = 1; index < rows.length; index += 1) {
  const prev = rows[index - 1]
  const next = rows[index]
  assertTrue(`${prev.role} block <= ${next.role} block`, prev.receipt.blockNumber <= next.receipt.blockNumber)
}

assertTrue('SocialHandshake deployed after Frost registration', rows[1].receipt.blockNumber > rows[0].receipt.blockNumber)
assertTrue('real handshake happened after fleet registration', rows[6].receipt.blockNumber > rows[5].receipt.blockNumber)

console.log('\nOK Injective wallet timeline is machine-verifiable through JSON-RPC transaction, receipt, and block data.')
