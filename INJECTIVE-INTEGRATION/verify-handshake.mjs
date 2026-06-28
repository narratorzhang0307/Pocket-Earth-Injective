// Verify the real SocialHandshake transaction on Injective testnet.
// Usage: node INJECTIVE-INTEGRATION/verify-handshake.mjs
import { createPublicClient, decodeEventLog, defineChain, http, parseAbi } from 'viem'

const RPC = 'https://testnet.sentry.chain.json-rpc.injective.network'
const CONTRACT = '0xe5338a162a44a685201e1f6120b1a851949e3aee'
const TX_HASH = '0xce15c72f42fb3d8b70acebff11560227613c347a3f28c70b9d885d310515c42e'
const EXPECTED = { agentA: 43n, agentB: 44n, score: 88 }

const abi = parseAbi([
  'event Handshake(uint256 indexed agentA,uint256 indexed agentB,bytes32 profileHashA,bytes32 profileHashB,uint16 score,uint256 timestamp)',
])

const chain = defineChain({
  id: 1439,
  name: 'Injective Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
})

const links = {
  tx: `https://testnet.blockscout.injective.network/tx/${TX_HASH}`,
  contract: `https://testnet.blockscout.injective.network/address/${CONTRACT}`,
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

const client = createPublicClient({ chain, transport: http() })
const tx = await client.getTransaction({ hash: TX_HASH })
const receipt = await client.getTransactionReceipt({ hash: TX_HASH })

assertEqual('tx.to', tx.to, CONTRACT)
assertEqual('receipt.status', receipt.status, 'success')

const log = receipt.logs.find((item) => item.address.toLowerCase() === CONTRACT.toLowerCase())
if (!log) throw new Error('Handshake log not found on SocialHandshake contract')

const event = decodeEventLog({ abi, data: log.data, topics: log.topics })
assertEqual('event', event.eventName, 'Handshake')
assertEqual('agentA', event.args.agentA, EXPECTED.agentA)
assertEqual('agentB', event.args.agentB, EXPECTED.agentB)
assertEqual('score', event.args.score, EXPECTED.score)
console.log(`OK blockNumber: ${receipt.blockNumber}`)

for (const [label, url] of Object.entries(links)) {
  await assertHttp200(label, url)
}

console.log('OK SocialHandshake transaction is verifiable on Injective testnet.')
