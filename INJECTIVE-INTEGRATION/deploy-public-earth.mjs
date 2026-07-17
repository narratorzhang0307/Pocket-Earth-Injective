// Compile and deploy PublicEarthRegistry, then give agentId 43-47 symbolic residences.
// Prints public deployment evidence only; never prints the private key.
import { readFileSync } from 'node:fs'
import solc from 'solc'
import { createPublicClient, createWalletClient, defineChain, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { IDENTITY_REGISTRY, PROOF_OWNER } from './chain-proof-data.mjs'
import { publicEarthResidences } from './public-earth-data.mjs'
import { waitForInjectiveReceipt } from './wait-injective-receipt.mjs'

function loadEnv() {
  const values = { ...process.env }
  try {
    for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (!match || values[match[1]] !== undefined) continue
      values[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
    }
  } catch { /* process env is enough */ }
  return values
}

const env = loadEnv()
const privateKey = String(env.INJ_PRIVATE_KEY || '')
if (!/^0x[0-9a-f]{64}$/i.test(privateKey)) throw new Error('INJ_PRIVATE_KEY is missing or invalid')
const rpcUrl = env.INJ_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/'
const chain = defineChain({
  id: 1439,
  name: 'Injective EVM Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
  blockExplorers: { default: { name: 'Injective Blockscout', url: 'https://testnet.blockscout.injective.network' } },
  testnet: true,
})
const account = privateKeyToAccount(privateKey)
if (account.address.toLowerCase() !== PROOF_OWNER.toLowerCase()) throw new Error('INJ_PRIVATE_KEY does not match the public proof owner')

const source = readFileSync(new URL('./contracts/PublicEarthRegistry.sol', import.meta.url), 'utf8')
const input = {
  language: 'Solidity',
  sources: { 'PublicEarthRegistry.sol': { content: source } },
  settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
}
const output = JSON.parse(solc.compile(JSON.stringify(input)))
const errors = (output.errors || []).filter((item) => item.severity === 'error')
if (errors.length) throw new Error(errors.map((item) => item.formattedMessage).join('\n'))
const artifact = output.contracts['PublicEarthRegistry.sol'].PublicEarthRegistry

const publicClient = createPublicClient({ chain, transport: http(rpcUrl) })
const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) })
const ownerAbi = parseAbi(['function ownerOf(uint256 agentId) view returns (address)'])
const residences = publicEarthResidences()
const owners = await Promise.all(residences.map((item) => publicClient.readContract({
  address: IDENTITY_REGISTRY,
  abi: ownerAbi,
  functionName: 'ownerOf',
  args: [BigInt(item.agentId)],
})))
for (let index = 0; index < owners.length; index += 1) {
  if (owners[index].toLowerCase() !== account.address.toLowerCase()) throw new Error(`agentId ${residences[index].agentId} is not owned by the publisher`)
}
const balance = await publicClient.getBalance({ address: account.address })
if (balance === 0n) throw new Error('testnet wallet has no INJ for deployment')

const deploymentTransactionHash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: `0x${artifact.evm.bytecode.object}`,
  args: [IDENTITY_REGISTRY],
})
const deploymentReceipt = await waitForInjectiveReceipt(publicClient, deploymentTransactionHash, account.address)
if (!deploymentReceipt || deploymentReceipt.status !== 'success' || !deploymentReceipt.contractAddress) {
  throw new Error(`PublicEarthRegistry deployment not confirmed: ${deploymentTransactionHash}`)
}
const contractAddress = deploymentReceipt.contractAddress
const residenceTransactions = []
for (const residence of residences) {
  const args = [BigInt(residence.agentId), residence.zone, residence.x, residence.y, residence.cardHash]
  const simulation = await publicClient.simulateContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: 'setResidence',
    args,
    account,
  })
  const transactionHash = await walletClient.writeContract(simulation.request)
  const receipt = await waitForInjectiveReceipt(publicClient, transactionHash, account.address)
  if (!receipt || receipt.status !== 'success') throw new Error(`residence write not confirmed for agentId ${residence.agentId}: ${transactionHash}`)
  residenceTransactions.push({
    agentId: residence.agentId,
    doorplate: residence.doorplate,
    zone: residence.zone,
    x: residence.x,
    y: residence.y,
    cardHash: residence.cardHash,
    transactionHash,
    blockNumber: receipt.blockNumber.toString(),
    scanUrl: `https://testnet.blockscout.injective.network/tx/${transactionHash}`,
  })
}

console.log(JSON.stringify({
  schema: 'pocket-earth-public-earth-deployment/v1',
  network: 'Injective EVM Testnet',
  chainId: 1439,
  publisher: account.address,
  identityRegistry: IDENTITY_REGISTRY,
  contractAddress,
  deploymentTransactionHash,
  deploymentBlockNumber: deploymentReceipt.blockNumber.toString(),
  deploymentScanUrl: `https://testnet.blockscout.injective.network/tx/${deploymentTransactionHash}`,
  contractScanUrl: `https://testnet.blockscout.injective.network/address/${contractAddress}`,
  deployedAt: new Date().toISOString(),
  boundary: 'symbolic agent residences only; no land scarcity, auctions, resale, private memory, or real-world location',
  residences: residenceTransactions,
}, null, 2))
