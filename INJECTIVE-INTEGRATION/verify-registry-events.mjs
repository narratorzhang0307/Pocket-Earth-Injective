// Verify ERC-8004 IdentityRegistry mint events for the Pocket Earth agent fleet.
// Usage: node INJECTIVE-INTEGRATION/verify-registry-events.mjs
import { createPublicClient, decodeEventLog, defineChain, http, parseAbiItem } from 'viem'
import { IDENTITY_REGISTRY, INJECTIVE_TESTNET_CHAIN_ID, INJECTIVE_TESTNET_RPC, PROOF_OWNER, REGISTRY_MINT_EVENTS, REGISTRY_MINT_ZERO_ADDRESS, scanUrlForTx } from './chain-proof-data.mjs'

const EXPECTED = new Map(REGISTRY_MINT_EVENTS.map((event) => [String(event.agentId), event]))
const FROM_BLOCK = REGISTRY_MINT_EVENTS.reduce((min, event) => event.blockNumber < min ? event.blockNumber : min, REGISTRY_MINT_EVENTS[0].blockNumber) - 500n
const TO_BLOCK = REGISTRY_MINT_EVENTS.reduce((max, event) => event.blockNumber > max ? event.blockNumber : max, REGISTRY_MINT_EVENTS[0].blockNumber) + 500n

const chain = defineChain({
  id: INJECTIVE_TESTNET_CHAIN_ID,
  name: 'Injective Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: [INJECTIVE_TESTNET_RPC] } },
})
const transferEvent = parseAbiItem('event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)')

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

const client = createPublicClient({ chain, transport: http(INJECTIVE_TESTNET_RPC) })
const logs = await client.getLogs({
  address: IDENTITY_REGISTRY,
  event: transferEvent,
  args: { to: PROOF_OWNER },
  fromBlock: FROM_BLOCK,
  toBlock: TO_BLOCK,
})

const found = new Map()
for (const log of logs) {
  const decoded = decodeEventLog({ abi: [transferEvent], data: log.data, topics: log.topics })
  const tokenId = String(decoded.args.tokenId)
  if (!EXPECTED.has(tokenId)) continue
  found.set(tokenId, { log, args: decoded.args })
}

for (const [tokenId, expected] of EXPECTED) {
  const item = found.get(tokenId)
  if (!item) throw new Error(`agentId ${tokenId} mint event not found`)
  console.log(`\nagentId ${tokenId} registry mint`)
  assertEqual(`agent ${tokenId} mint from`, item.args.from, REGISTRY_MINT_ZERO_ADDRESS)
  assertEqual(`agent ${tokenId} mint to`, item.args.to, PROOF_OWNER)
  assertEqual(`agent ${tokenId} transactionHash`, item.log.transactionHash, expected.transactionHash)
  console.log(`OK agent ${tokenId} blockNumber: ${item.log.blockNumber}`)
  assertEqual(`agent ${tokenId} expected blockNumber`, item.log.blockNumber, expected.blockNumber)

  const [tx, receipt] = await Promise.all([
    client.getTransaction({ hash: expected.transactionHash }),
    client.getTransactionReceipt({ hash: expected.transactionHash }),
  ])
  assertEqual(`agent ${tokenId} tx.from`, tx.from, PROOF_OWNER)
  assertEqual(`agent ${tokenId} tx.to`, tx.to, IDENTITY_REGISTRY)
  assertEqual(`agent ${tokenId} receipt.status`, receipt.status, 'success')
  assertEqual(`agent ${tokenId} receipt.blockNumber`, receipt.blockNumber, item.log.blockNumber)

  await assertHttp200(`agent ${tokenId} tx`, scanUrlForTx(expected.transactionHash))
}

console.log('\nOK ERC-8004 registry mint events and registration transactions for agentId 43-47 are verifiable.')
