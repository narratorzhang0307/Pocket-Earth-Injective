// Compile and deploy DailyKnowledgeChronicle to Injective EVM testnet.
// Prints public deployment evidence only; never prints the private key.
import { readFileSync } from 'node:fs'
import solc from 'solc'
import { createPublicClient, createWalletClient, defineChain, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
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
const source = readFileSync(new URL('./contracts/DailyKnowledgeChronicle.sol', import.meta.url), 'utf8')
const input = {
  language: 'Solidity',
  sources: { 'DailyKnowledgeChronicle.sol': { content: source } },
  settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
}
const output = JSON.parse(solc.compile(JSON.stringify(input)))
const errors = (output.errors || []).filter((item) => item.severity === 'error')
if (errors.length) throw new Error(errors.map((item) => item.formattedMessage).join('\n'))
const artifact = output.contracts['DailyKnowledgeChronicle.sol'].DailyKnowledgeChronicle
const account = privateKeyToAccount(privateKey)
const publicClient = createPublicClient({ chain, transport: http(rpcUrl) })
const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) })
const balance = await publicClient.getBalance({ address: account.address })
if (balance === 0n) throw new Error('testnet wallet has no INJ for deployment')
const transactionHash = await walletClient.deployContract({ abi: artifact.abi, bytecode: `0x${artifact.evm.bytecode.object}` })
const receipt = await waitForInjectiveReceipt(publicClient, transactionHash, account.address)
if (!receipt || receipt.status !== 'success' || !receipt.contractAddress) throw new Error(`chronicle deployment not confirmed: ${transactionHash}`)
console.log(JSON.stringify({
  network: 'Injective EVM Testnet',
  chainId: 1439,
  publisher: account.address,
  contractAddress: receipt.contractAddress,
  deploymentTransactionHash: transactionHash,
  blockNumber: receipt.blockNumber.toString(),
  scanUrl: `https://testnet.blockscout.injective.network/tx/${transactionHash}`,
  deployedAt: new Date().toISOString(),
}))
