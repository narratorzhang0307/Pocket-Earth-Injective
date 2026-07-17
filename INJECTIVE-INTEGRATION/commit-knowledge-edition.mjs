// Build the combined AI + finance daily edition and commit it to Injective testnet.
// Outputs a public proof bundle only; never writes or prints the private key.
import { readFileSync } from 'node:fs'
import { createPublicClient, createWalletClient, defineChain, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { createDailyKnowledgeService } from '../knowledge/daily-service.mjs'
import { buildDailyEditions, verifyMerkleProof } from '../src/app/lib/chronicle/kernel.mjs'
import { waitForInjectiveReceipt } from './wait-injective-receipt.mjs'

function loadEnv() {
  const values = { ...process.env }
  for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (!match || values[match[1]] !== undefined) continue
    values[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
  }
  return values
}

const env = loadEnv()
const privateKey = String(env.INJ_PRIVATE_KEY || '')
if (!/^0x[0-9a-f]{64}$/i.test(privateKey)) throw new Error('INJ_PRIVATE_KEY is missing or invalid')
const deployment = JSON.parse(readFileSync(new URL('./chronicle-deployment.json', import.meta.url), 'utf8'))
const contractAddress = deployment.contractAddress
const date = String(process.argv[2] || new Date().toISOString().slice(0, 10))
if (!/^20\d{2}-\d{2}-\d{2}$/.test(date)) throw new Error('date must be YYYY-MM-DD')

const rpcUrl = env.INJ_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/'
const chain = defineChain({
  id: 1439,
  name: 'Injective EVM Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
  blockExplorers: { default: { name: 'Injective Blockscout', url: 'https://testnet.blockscout.injective.network' } },
  testnet: true,
})
const abi = parseAbi([
  'function chainHeads(address publisher) view returns (bytes32 editionRoot, uint32 day, uint32 revision, uint64 committedAt)',
  'function commitEdition(uint32 day, bytes32 editionRoot, bytes32 previousEditionRoot, bytes32 manifestHash, bytes32 policyRoot, uint32 factCount) returns (uint32 revision)',
  'event EditionCommitted(address indexed publisher, uint32 indexed day, uint32 indexed revision, bytes32 editionRoot, bytes32 previousEditionRoot, bytes32 manifestHash, bytes32 policyRoot, uint32 factCount, uint64 committedAt)',
])
const account = privateKeyToAccount(privateKey)
const publicClient = createPublicClient({ chain, transport: http(rpcUrl) })
const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) })

const service = createDailyKnowledgeService({ env: {} })
const [ai, finance, head] = await Promise.all([
  service.get('ai', date),
  service.get('finance', date),
  publicClient.readContract({ address: contractAddress, abi, functionName: 'chainHeads', args: [account.address] }),
])
const previousEditionRoot = head[0]
const records = [...ai.records, ...finance.records]
const facts = records.map((record) => ({
  id: record.id,
  savedAt: record.createdAt,
  claim: record.claim,
  canonicalClaim: record.canonicalClaim || record.claim,
  verdict: record.verdict,
  truthScore: record.truthScore,
  commitment: record.commitment,
}))
const edition = (await buildDailyEditions(facts, previousEditionRoot))[0]
if (!edition || edition.factCount === 0) throw new Error('edition is empty')
for (const record of records) {
  const proof = edition.proofs[record.commitment.recordHash]
  if (!await verifyMerkleProof(record.commitment.recordHash, proof, edition.factsRoot)) throw new Error(`invalid local proof for ${record.id}`)
}

const args = [edition.day, edition.editionRoot, edition.previousEditionRoot, edition.manifestHash, edition.policyRoot, edition.factCount]
const simulation = await publicClient.simulateContract({ address: contractAddress, abi, functionName: 'commitEdition', args, account })
const transactionHash = await walletClient.writeContract(simulation.request)

const receipt = await waitForInjectiveReceipt(publicClient, transactionHash, account.address)
if (!receipt || receipt.status !== 'success') throw new Error(`edition commit not confirmed: ${transactionHash}`)

console.log(JSON.stringify({
  schema: 'pocket-earth-daily-knowledge-proof/v1',
  network: 'Injective EVM Testnet',
  chainId: 1439,
  publisher: account.address,
  contractAddress,
  date,
  day: edition.day,
  revision: Number(head[2]) + 1,
  factCount: edition.factCount,
  factsRoot: edition.factsRoot,
  manifestHash: edition.manifestHash,
  policyRoot: edition.policyRoot,
  previousEditionRoot: edition.previousEditionRoot,
  editionRoot: edition.editionRoot,
  transactionHash,
  blockNumber: receipt.blockNumber.toString(),
  scanUrl: `https://testnet.blockscout.injective.network/tx/${transactionHash}`,
  committedAt: new Date().toISOString(),
  records: records.map((record) => ({
    id: record.id,
    topic: record.topic,
    mode: record.mode,
    claim: record.claim,
    verdict: record.verdict,
    truthScore: record.truthScore,
    recordHash: record.commitment.recordHash,
    proof: edition.proofs[record.commitment.recordHash],
    sources: record.sources.map((source) => ({ title: source.title, url: source.url, publisher: source.publisher, publishedAt: source.publishedAt })),
  })),
}))
