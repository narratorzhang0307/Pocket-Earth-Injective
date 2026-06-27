// 部署 SocialHandshake.sol 到 Injective testnet（inEVM, chainId 1439）。
// solc 纯 JS 编译 → viem deployContract。私钥从副本 .env 读，仅 testnet。
// 用法：cd 副本 && node INJECTIVE-INTEGRATION/deploy-handshake.mjs
import solc from 'solc'
import { readFileSync } from 'fs'
import { createWalletClient, createPublicClient, http, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

// —— 1. 编译 ——
const source = readFileSync('INJECTIVE-INTEGRATION/contracts/SocialHandshake.sol', 'utf8')
const input = {
  language: 'Solidity',
  sources: { 'SocialHandshake.sol': { content: source } },
  settings: {
    evmVersion: 'paris',   // 避开 PUSH0，保 inEVM 兼容
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
  },
}
const out = JSON.parse(solc.compile(JSON.stringify(input)))
if (out.errors) {
  const errs = out.errors.filter((e) => e.severity === 'error')
  if (errs.length) { console.error('编译错误:\n' + errs.map((e) => e.formattedMessage).join('\n')); process.exit(1) }
}
const c = out.contracts['SocialHandshake.sol']['SocialHandshake']
const abi = c.abi
const bytecode = '0x' + c.evm.bytecode.object
console.log('✅ 编译成功 · bytecode 长度', bytecode.length)

// —— 2. 部署 ——
const env = readFileSync('.env', 'utf8')
const pk = env.match(/INJ_PRIVATE_KEY=(0x[0-9a-fA-F]{64})/)?.[1]
if (!pk) { console.error('未在 .env 找到 INJ_PRIVATE_KEY'); process.exit(1) }
const chain = defineChain({
  id: 1439, name: 'Injective Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet.sentry.chain.json-rpc.injective.network'] } },
})
const account = privateKeyToAccount(pk)
const wallet = createWalletClient({ account, chain, transport: http() })
const pub = createPublicClient({ chain, transport: http() })
console.log('部署者:', account.address)

const hash = await wallet.deployContract({ abi, bytecode, args: [] })
console.log('部署交易:', hash)
const receipt = await pub.waitForTransactionReceipt({ hash })
console.log('✅ 合约已部署')
console.log('CONTRACT_ADDRESS=' + receipt.contractAddress)
console.log('SCAN=https://testnet.blockscout.injective.network/address/' + receipt.contractAddress)
