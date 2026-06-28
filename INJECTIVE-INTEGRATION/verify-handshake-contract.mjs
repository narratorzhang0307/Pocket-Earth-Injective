// Verify the deployed SocialHandshake bytecode matches the local Solidity source.
// Usage: node INJECTIVE-INTEGRATION/verify-handshake-contract.mjs
import { readFileSync } from 'node:fs'
import solc from 'solc'
import { createPublicClient, defineChain, getContractAddress, http, keccak256 } from 'viem'

const RPC = 'https://testnet.sentry.chain.json-rpc.injective.network'
const OWNER = '0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934'
const CONTRACT = '0xe5338a162a44a685201e1f6120b1a851949e3aee'
const SOURCE_FILE = 'INJECTIVE-INTEGRATION/contracts/SocialHandshake.sol'
const DEPLOY_NONCE = 2n
const FROST_REGISTRATION_BLOCK = 131678496n
const CONTRACT_DEPLOY_BLOCK = 131678987n
const CONTRACT_DEPLOY_TX = '0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722'
const HANDSHAKE_BLOCK = 131869118n

const chain = defineChain({
  id: 1439,
  name: 'Injective Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
})

function assertEqual(label, actual, expected) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

function assertSame(label, actual, expected) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    throw new Error(`${label} mismatch`)
  }
  console.log(`OK ${label}`)
}

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

async function retry(label, fn, attempts = 4) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt === attempts) break
      console.log(`RETRY ${label}: ${attempt}/${attempts}`)
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
    }
  }
  throw lastError
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

const source = readFileSync(SOURCE_FILE, 'utf8')
const input = {
  language: 'Solidity',
  sources: { 'SocialHandshake.sol': { content: source } },
  settings: {
    evmVersion: 'paris',
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['evm.bytecode.object', 'evm.deployedBytecode.object'] } },
  },
}

const output = JSON.parse(solc.compile(JSON.stringify(input)))
const errors = (output.errors || []).filter((item) => item.severity === 'error')
if (errors.length) throw new Error(errors.map((item) => item.formattedMessage).join('\n'))

const contract = output.contracts?.['SocialHandshake.sol']?.SocialHandshake
const compiledCreationObject = contract?.evm?.bytecode?.object
const compiledRuntimeObject = contract?.evm?.deployedBytecode?.object
assertTrue('compiled creation bytecode exists', typeof compiledCreationObject === 'string' && compiledCreationObject.length > 0)
assertTrue('compiled runtime bytecode exists', typeof compiledRuntimeObject === 'string' && compiledRuntimeObject.length > 0)
const compiledCreation = '0x' + compiledCreationObject
const compiledRuntime = '0x' + compiledRuntimeObject

const client = createPublicClient({ chain, transport: http() })
const derivedAddress = getContractAddress({ from: OWNER, nonce: DEPLOY_NONCE })
assertEqual('deployer-derived contract address', derivedAddress, CONTRACT)
assertTrue('contract deploy block is after Frost registration', FROST_REGISTRATION_BLOCK < CONTRACT_DEPLOY_BLOCK)
assertTrue('contract deploy block is before handshake block', CONTRACT_DEPLOY_BLOCK < HANDSHAKE_BLOCK)

const deployBlock = await retry('deployment block', () => client.getBlock({ blockNumber: CONTRACT_DEPLOY_BLOCK, includeTransactions: true }))
const deployTx = deployBlock.transactions.find((tx) => tx.hash.toLowerCase() === CONTRACT_DEPLOY_TX.toLowerCase())
assertTrue('deployment tx is in deployment block', !!deployTx)
assertEqual('deployment tx.from', deployTx.from, OWNER)
assertEqual('deployment tx.to', deployTx.to, null)
assertEqual('deployment tx.nonce', deployTx.nonce, Number(DEPLOY_NONCE))
assertEqual('deployment tx creates', getContractAddress({ from: deployTx.from, nonce: BigInt(deployTx.nonce) }), CONTRACT)
assertTrue('deployment tx input exists', typeof deployTx.input === 'string' && deployTx.input.length > 2)
assertEqual('deployment creation bytecode length', deployTx.input.length, compiledCreation.length)
assertEqual('deployment creation bytecode hash', keccak256(deployTx.input), keccak256(compiledCreation))
assertSame('deployment creation bytecode', deployTx.input, compiledCreation)

const deployReceipt = await retry('deployment receipt', () => client.getTransactionReceipt({ hash: CONTRACT_DEPLOY_TX }))
assertEqual('deployment receipt.status', deployReceipt.status, 'success')
assertEqual('deployment receipt.contractAddress', deployReceipt.contractAddress, CONTRACT)
assertEqual('deployment receipt.blockNumber', deployReceipt.blockNumber, CONTRACT_DEPLOY_BLOCK)

const deployedRuntime = await retry('latest contract code', () => client.getCode({ address: CONTRACT }))
const codeAtRegistrationBlock = await retry('registration-block contract code', () => client.getCode({ address: CONTRACT, blockNumber: FROST_REGISTRATION_BLOCK }))
const codeBeforeDeploy = await retry('pre-deploy contract code', () => client.getCode({ address: CONTRACT, blockNumber: CONTRACT_DEPLOY_BLOCK - 1n }))
const codeBeforeHandshake = await retry('pre-handshake contract code', () => client.getCode({ address: CONTRACT, blockNumber: HANDSHAKE_BLOCK - 1n }))

assertTrue('no contract code at Frost registration block', !codeAtRegistrationBlock || codeAtRegistrationBlock === '0x')
assertTrue('no contract code before deployment block', !codeBeforeDeploy || codeBeforeDeploy === '0x')
assertTrue('contract code existed before handshake block', typeof codeBeforeHandshake === 'string' && codeBeforeHandshake.length > 2)
assertTrue('deployed runtime bytecode exists', typeof deployedRuntime === 'string' && deployedRuntime.length > 2)
assertEqual('runtime bytecode length', deployedRuntime.length, compiledRuntime.length)
assertEqual('runtime bytecode hash', keccak256(deployedRuntime), keccak256(compiledRuntime))
assertSame('deployed runtime bytecode', deployedRuntime, compiledRuntime)
assertSame('pre-handshake runtime bytecode', codeBeforeHandshake, deployedRuntime)

await assertHttp200('contract', `https://testnet.blockscout.injective.network/address/${CONTRACT}`)
await assertHttp200('deployment tx', `https://testnet.blockscout.injective.network/tx/${CONTRACT_DEPLOY_TX}`)

console.log(`OK solc version: ${solc.version()}`)
console.log('OK SocialHandshake deployed bytecode matches the local Solidity source.')
