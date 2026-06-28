// Verify the deployed SocialHandshake bytecode matches the local Solidity source.
// Usage: node INJECTIVE-INTEGRATION/verify-handshake-contract.mjs
import { readFileSync } from 'node:fs'
import solc from 'solc'
import { createPublicClient, defineChain, http, keccak256 } from 'viem'

const RPC = 'https://testnet.sentry.chain.json-rpc.injective.network'
const CONTRACT = '0xe5338a162a44a685201e1f6120b1a851949e3aee'
const SOURCE_FILE = 'INJECTIVE-INTEGRATION/contracts/SocialHandshake.sol'

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
    outputSelection: { '*': { '*': ['evm.deployedBytecode.object'] } },
  },
}

const output = JSON.parse(solc.compile(JSON.stringify(input)))
const errors = (output.errors || []).filter((item) => item.severity === 'error')
if (errors.length) throw new Error(errors.map((item) => item.formattedMessage).join('\n'))

const contract = output.contracts?.['SocialHandshake.sol']?.SocialHandshake
const compiledObject = contract?.evm?.deployedBytecode?.object
assertTrue('compiled runtime bytecode exists', typeof compiledObject === 'string' && compiledObject.length > 0)
const compiledRuntime = '0x' + compiledObject

const client = createPublicClient({ chain, transport: http() })
const deployedRuntime = await client.getCode({ address: CONTRACT })
assertTrue('deployed runtime bytecode exists', typeof deployedRuntime === 'string' && deployedRuntime.length > 2)
assertEqual('runtime bytecode length', deployedRuntime.length, compiledRuntime.length)
assertEqual('runtime bytecode hash', keccak256(deployedRuntime), keccak256(compiledRuntime))
assertSame('deployed runtime bytecode', deployedRuntime, compiledRuntime)

await assertHttp200('contract', `https://testnet.blockscout.injective.network/address/${CONTRACT}`)

console.log(`OK solc version: ${solc.version()}`)
console.log('OK SocialHandshake deployed bytecode matches the local Solidity source.')
