// Verify the on-chain transaction timeline behind the wallet evidence page.
// Usage: node INJECTIVE-INTEGRATION/verify-chain-timeline.mjs
import { createPublicClient, defineChain, http } from 'viem'

const RPC = 'https://testnet.sentry.chain.json-rpc.injective.network'
const OWNER = '0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934'
const REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e'
const HANDSHAKE_CONTRACT = '0xe5338a162a44a685201e1f6120b1a851949e3aee'

const EXPECTED = [
  {
    label: 'Frost main identity registration',
    role: 'agentId 43',
    hash: '0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554',
    to: REGISTRY,
    blockNumber: 131678496n,
    timestamp: '2026-06-27T01:46:30.000Z',
  },
  {
    label: 'SocialHandshake deployment',
    role: 'contract deployment',
    hash: '0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722',
    to: null,
    contractAddress: HANDSHAKE_CONTRACT,
    blockNumber: 131678987n,
    timestamp: '2026-06-27T01:53:16.000Z',
  },
  {
    label: 'Fleet agent registration',
    role: 'agentId 44',
    hash: '0x02a0590c2f1bc1e475d7cdfb2fa4c3eb5e0b9f7de4ac1f97e66663e0f5a38f44',
    to: REGISTRY,
    blockNumber: 131679781n,
    timestamp: '2026-06-27T02:04:14.000Z',
  },
  {
    label: 'Fleet agent registration',
    role: 'agentId 45',
    hash: '0xc161f0df707b1c9b1e29311e944b7c1b40f3d525c9d1cbd2d71c67713333fffe',
    to: REGISTRY,
    blockNumber: 131679930n,
    timestamp: '2026-06-27T02:06:17.000Z',
  },
  {
    label: 'Fleet agent registration',
    role: 'agentId 46',
    hash: '0x1bbd3df139b2558ff315d2029f00c01dc881a45542d5854176bbc49e6dfaea4e',
    to: REGISTRY,
    blockNumber: 131679941n,
    timestamp: '2026-06-27T02:06:26.000Z',
  },
  {
    label: 'Fleet agent registration',
    role: 'agentId 47',
    hash: '0xada3e082b8e8988e414bcf201739f2a2a3b5fe9c947db71ebe1e7467f3de1a50',
    to: REGISTRY,
    blockNumber: 131679948n,
    timestamp: '2026-06-27T02:06:32.000Z',
  },
  {
    label: 'Real SocialHandshake',
    role: 'agentId 43 <-> 44',
    hash: '0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6',
    to: HANDSHAKE_CONTRACT,
    blockNumber: 131869118n,
    timestamp: '2026-06-28T21:34:21.000Z',
  },
]

const chain = defineChain({
  id: 1439,
  name: 'Injective Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
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

const client = createPublicClient({ chain, transport: http(RPC) })
const rows = []

for (const expected of EXPECTED) {
  const [tx, receipt] = await Promise.all([
    client.getTransaction({ hash: expected.hash }),
    client.getTransactionReceipt({ hash: expected.hash }),
  ])
  const block = await client.getBlock({ blockNumber: receipt.blockNumber })
  const timestamp = new Date(Number(block.timestamp) * 1000).toISOString()

  console.log(`\n${expected.label} · ${expected.role}`)
  assertEqual('tx.hash', tx.hash, expected.hash)
  assertEqual('tx.from', tx.from, OWNER)
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
