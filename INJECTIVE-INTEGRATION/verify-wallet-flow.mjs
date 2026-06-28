// Verify the wallet-level evidence chain shown in the demo.
// Usage: node INJECTIVE-INTEGRATION/verify-wallet-flow.mjs
import { createPublicClient, decodeEventLog, defineChain, http, parseAbi, parseAbiItem } from 'viem'

const RPC = 'https://testnet.sentry.chain.json-rpc.injective.network'
const OWNER = '0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934'
const REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e'
const HANDSHAKE_CONTRACT = '0xe5338a162a44a685201e1f6120b1a851949e3aee'
const REGISTER_TX = '0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554'
const HANDSHAKE_TX = '0xce15c72f42fb3d8b70acebff11560227613c347a3f28c70b9d885d310515c42e'

const chain = defineChain({
  id: 1439,
  name: 'Injective Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
})

const handshakeAbi = parseAbi([
  'event Handshake(uint256 indexed agentA,uint256 indexed agentB,bytes32 profileHashA,bytes32 profileHashB,uint16 score,uint256 timestamp)',
])
const transferEvent = parseAbiItem('event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)')

const links = {
  wallet: `https://testnet.blockscout.injective.network/address/${OWNER}`,
  registrationTx: `https://testnet.blockscout.injective.network/tx/${REGISTER_TX}`,
  handshakeContract: `https://testnet.blockscout.injective.network/address/${HANDSHAKE_CONTRACT}`,
  handshakeTx: `https://testnet.blockscout.injective.network/tx/${HANDSHAKE_TX}`,
}

function assertEqual(label, actual, expected) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
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

const [registerTx, registerReceipt, handshakeTx, handshakeReceipt, handshakeCode] = await Promise.all([
  client.getTransaction({ hash: REGISTER_TX }),
  client.getTransactionReceipt({ hash: REGISTER_TX }),
  client.getTransaction({ hash: HANDSHAKE_TX }),
  client.getTransactionReceipt({ hash: HANDSHAKE_TX }),
  client.getCode({ address: HANDSHAKE_CONTRACT }),
])
const [registerBlock, handshakeBlock, handshakeCodeBeforeTx] = await Promise.all([
  client.getBlock({ blockNumber: registerReceipt.blockNumber }),
  client.getBlock({ blockNumber: handshakeReceipt.blockNumber }),
  client.getCode({ address: HANDSHAKE_CONTRACT, blockNumber: handshakeReceipt.blockNumber - 1n }),
])

console.log('Registration transaction')
assertEqual('register tx.from', registerTx.from, OWNER)
assertEqual('register tx.to', registerTx.to, REGISTRY)
assertEqual('register receipt.status', registerReceipt.status, 'success')
assertTrue('register receipt has registry logs', registerReceipt.logs.some((log) => log.address.toLowerCase() === REGISTRY.toLowerCase()))
console.log(`OK register block timestamp: ${new Date(Number(registerBlock.timestamp) * 1000).toISOString()}`)

const transferLog = registerReceipt.logs.find((log) => log.address.toLowerCase() === REGISTRY.toLowerCase())
if (!transferLog) throw new Error('agentId 43 Transfer log not found')
const transfer = decodeEventLog({ abi: [transferEvent], data: transferLog.data, topics: transferLog.topics })
assertEqual('register event tokenId', transfer.args.tokenId, 43n)
assertEqual('register event owner', transfer.args.to, OWNER)

console.log('\nHandshake contract and transaction')
assertTrue('SocialHandshake contract code deployed', typeof handshakeCode === 'string' && handshakeCode.length > 2)
assertTrue('SocialHandshake code existed before handshake tx', typeof handshakeCodeBeforeTx === 'string' && handshakeCodeBeforeTx.length > 2)
assertEqual('handshake tx.from', handshakeTx.from, OWNER)
assertEqual('handshake tx.to', handshakeTx.to, HANDSHAKE_CONTRACT)
assertEqual('handshake receipt.status', handshakeReceipt.status, 'success')
assertTrue('registration block is before handshake block', registerReceipt.blockNumber < handshakeReceipt.blockNumber)
console.log(`OK handshake block timestamp: ${new Date(Number(handshakeBlock.timestamp) * 1000).toISOString()}`)

const handshakeLog = handshakeReceipt.logs.find((log) => log.address.toLowerCase() === HANDSHAKE_CONTRACT.toLowerCase())
if (!handshakeLog) throw new Error('Handshake log not found')
const event = decodeEventLog({ abi: handshakeAbi, data: handshakeLog.data, topics: handshakeLog.topics })
assertEqual('handshake event', event.eventName, 'Handshake')
assertEqual('handshake agentA', event.args.agentA, 43n)
assertEqual('handshake agentB', event.args.agentB, 44n)
assertEqual('handshake score', event.args.score, 88)

for (const [label, url] of Object.entries(links)) {
  await assertHttp200(label, url)
}

console.log('\nOK Wallet evidence chain links Frost registration, SocialHandshake contract, and handshake tx to the same testnet wallet.')
