// Verify ERC-8004 IdentityRegistry mint events for the Pocket Earth agent fleet.
// Usage: node INJECTIVE-INTEGRATION/verify-registry-events.mjs
import { createPublicClient, decodeEventLog, defineChain, http, parseAbiItem } from 'viem'

const RPC = 'https://testnet.sentry.chain.json-rpc.injective.network'
const OWNER = '0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934'
const REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e'
const ZERO = '0x0000000000000000000000000000000000000000'
const FROM_BLOCK = 131678000n
const TO_BLOCK = 131687999n

const EXPECTED = new Map([
  ['43', '0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554'],
  ['44', '0x02a0590c2f1bc1e475d7cdfb2fa4c3eb5e0b9f7de4ac1f97e66663e0f5a38f44'],
  ['45', '0xc161f0df707b1c9b1e29311e944b7c1b40f3d525c9d1cbd2d71c67713333fffe'],
  ['46', '0x1bbd3df139b2558ff315d2029f00c01dc881a45542d5854176bbc49e6dfaea4e'],
  ['47', '0xada3e082b8e8988e414bcf201739f2a2a3b5fe9c947db71ebe1e7467f3de1a50'],
])

const chain = defineChain({
  id: 1439,
  name: 'Injective Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
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

const client = createPublicClient({ chain, transport: http(RPC) })
const logs = await client.getLogs({
  address: REGISTRY,
  event: transferEvent,
  args: { to: OWNER },
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

for (const [tokenId, txHash] of EXPECTED) {
  const item = found.get(tokenId)
  if (!item) throw new Error(`agentId ${tokenId} mint event not found`)
  console.log(`\nagentId ${tokenId} registry mint`)
  assertEqual(`agent ${tokenId} mint from`, item.args.from, ZERO)
  assertEqual(`agent ${tokenId} mint to`, item.args.to, OWNER)
  assertEqual(`agent ${tokenId} transactionHash`, item.log.transactionHash, txHash)
  console.log(`OK agent ${tokenId} blockNumber: ${item.log.blockNumber}`)

  const [tx, receipt] = await Promise.all([
    client.getTransaction({ hash: txHash }),
    client.getTransactionReceipt({ hash: txHash }),
  ])
  assertEqual(`agent ${tokenId} tx.from`, tx.from, OWNER)
  assertEqual(`agent ${tokenId} tx.to`, tx.to, REGISTRY)
  assertEqual(`agent ${tokenId} receipt.status`, receipt.status, 'success')
  assertEqual(`agent ${tokenId} receipt.blockNumber`, receipt.blockNumber, item.log.blockNumber)

  await assertHttp200(`agent ${tokenId} tx`, `https://testnet.blockscout.injective.network/tx/${txHash}`)
}

console.log('\nOK ERC-8004 registry mint events and registration transactions for agentId 43-47 are verifiable.')
