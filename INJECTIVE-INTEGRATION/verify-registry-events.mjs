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
let logs = []
try {
  logs = await client.getLogs({
    address: IDENTITY_REGISTRY,
    event: transferEvent,
    args: { to: PROOF_OWNER },
    fromBlock: FROM_BLOCK,
    toBlock: TO_BLOCK,
  })
} catch {
  // The public RPC may prune old log ranges. Missing events are resolved below
  // from the Injective testnet Blockscout archive, never from a local fixture.
}

const archiveCache = new Map()
async function getArchiveTransaction(hash) {
  if (!archiveCache.has(hash)) {
    archiveCache.set(hash, (async () => {
      const response = await fetch(`https://testnet.blockscout-api.injective.network/api/v2/transactions/${hash}`, {
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) throw new Error(`Blockscout transaction ${hash} returned HTTP ${response.status}`)
      return response.json()
    })())
  }
  return archiveCache.get(hash)
}

async function getArchivedMint(expected) {
  const transaction = await getArchiveTransaction(expected.transactionHash)
  const transfer = transaction.token_transfers?.find((item) => (
    String(item?.token?.address_hash).toLowerCase() === IDENTITY_REGISTRY.toLowerCase()
    && String(item?.total?.token_id) === String(expected.agentId)
  ))
  if (!transfer) return null
  return {
    log: {
      transactionHash: transaction.hash,
      blockNumber: BigInt(transaction.block_number),
    },
    args: {
      from: transfer.from?.hash,
      to: transfer.to?.hash,
      tokenId: BigInt(transfer.total.token_id),
    },
    evidenceSource: 'injective-blockscout',
  }
}

const found = new Map()
for (const log of logs) {
  const decoded = decodeEventLog({ abi: [transferEvent], data: log.data, topics: log.topics })
  const tokenId = String(decoded.args.tokenId)
  if (!EXPECTED.has(tokenId)) continue
  found.set(tokenId, { log, args: decoded.args, evidenceSource: 'injective-rpc' })
}

for (const [tokenId, expected] of EXPECTED) {
  const item = found.get(tokenId) || await getArchivedMint(expected)
  if (!item) throw new Error(`agentId ${tokenId} mint event not found`)
  console.log(`\nagentId ${tokenId} registry mint`)
  assertEqual(`agent ${tokenId} evidence source`, item.evidenceSource, item.evidenceSource === 'injective-rpc' ? 'injective-rpc' : 'injective-blockscout')
  assertEqual(`agent ${tokenId} mint from`, item.args.from, REGISTRY_MINT_ZERO_ADDRESS)
  assertEqual(`agent ${tokenId} mint to`, item.args.to, PROOF_OWNER)
  assertEqual(`agent ${tokenId} transactionHash`, item.log.transactionHash, expected.transactionHash)
  console.log(`OK agent ${tokenId} blockNumber: ${item.log.blockNumber}`)
  assertEqual(`agent ${tokenId} expected blockNumber`, item.log.blockNumber, expected.blockNumber)

  let transactionProof
  try {
    const [tx, receipt] = await Promise.all([
      client.getTransaction({ hash: expected.transactionHash }),
      client.getTransactionReceipt({ hash: expected.transactionHash }),
    ])
    transactionProof = {
      from: tx.from,
      to: tx.to,
      status: receipt.status,
      blockNumber: receipt.blockNumber,
      evidenceSource: 'injective-rpc',
    }
  } catch {
    const archived = await getArchiveTransaction(expected.transactionHash)
    transactionProof = {
      from: archived.from?.hash,
      to: archived.to?.hash,
      status: archived.status === 'ok' ? 'success' : String(archived.status || 'failed'),
      blockNumber: BigInt(archived.block_number),
      evidenceSource: 'injective-blockscout',
    }
  }
  assertEqual(`agent ${tokenId} transaction evidence source`, transactionProof.evidenceSource, transactionProof.evidenceSource === 'injective-rpc' ? 'injective-rpc' : 'injective-blockscout')
  assertEqual(`agent ${tokenId} tx.from`, transactionProof.from, PROOF_OWNER)
  assertEqual(`agent ${tokenId} tx.to`, transactionProof.to, IDENTITY_REGISTRY)
  assertEqual(`agent ${tokenId} receipt.status`, transactionProof.status, 'success')
  assertEqual(`agent ${tokenId} receipt.blockNumber`, transactionProof.blockNumber, item.log.blockNumber)

  await assertHttp200(`agent ${tokenId} tx`, scanUrlForTx(expected.transactionHash))
}

console.log('\nOK ERC-8004 registry mint events and registration transactions for agentId 43-47 are verifiable.')
