import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import solc from 'solc'
import { createPublicClient, decodeEventLog, defineChain, http, parseAbi } from 'viem'
import { IDENTITY_REGISTRY, INJECTIVE_TESTNET_CHAIN_ID, INJECTIVE_TESTNET_RPC, PROOF_OWNER } from './chain-proof-data.mjs'
import { publicEarthResidences } from './public-earth-data.mjs'

const deployment = JSON.parse(readFileSync(new URL('./public-earth-deployment.json', import.meta.url), 'utf8'))
const source = readFileSync(new URL('./contracts/PublicEarthRegistry.sol', import.meta.url), 'utf8')
const input = {
  language: 'Solidity',
  sources: { 'PublicEarthRegistry.sol': { content: source } },
  settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { '*': { '*': ['abi', 'evm.deployedBytecode.object', 'evm.deployedBytecode.immutableReferences'] } } },
}
const output = JSON.parse(solc.compile(JSON.stringify(input)))
const errors = (output.errors || []).filter((item) => item.severity === 'error')
assert.equal(errors.length, 0, errors.map((item) => item.formattedMessage).join('\n'))
const artifact = output.contracts['PublicEarthRegistry.sol'].PublicEarthRegistry
const chain = defineChain({
  id: INJECTIVE_TESTNET_CHAIN_ID,
  name: 'Injective EVM Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: { default: { http: [INJECTIVE_TESTNET_RPC] } },
  testnet: true,
})
const client = createPublicClient({ chain, transport: http(INJECTIVE_TESTNET_RPC) })
const code = await client.getCode({ address: deployment.contractAddress })
assert.ok(code && code !== '0x', 'PublicEarthRegistry has no runtime bytecode')
let expectedRuntime = artifact.evm.deployedBytecode.object
for (const references of Object.values(artifact.evm.deployedBytecode.immutableReferences || {})) {
  for (const reference of references) {
    const embeddedAddress = IDENTITY_REGISTRY.slice(2).padStart(reference.length * 2, '0')
    const start = reference.start * 2
    expectedRuntime = `${expectedRuntime.slice(0, start)}${embeddedAddress}${expectedRuntime.slice(start + reference.length * 2)}`
  }
}
assert.equal(code.toLowerCase(), `0x${expectedRuntime}`.toLowerCase(), 'runtime bytecode differs from local source and constructor immutable')
assert.equal(deployment.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assert.equal(deployment.identityRegistry.toLowerCase(), IDENTITY_REGISTRY.toLowerCase())
assert.equal(deployment.publisher.toLowerCase(), PROOF_OWNER.toLowerCase())

const abi = parseAbi([
  'function identityRegistry() view returns (address)',
  'function residences(uint256 agentId) view returns (uint16 zone, int32 x, int32 y, bytes32 cardHash, uint32 revision, uint64 updatedAt)',
  'event ResidenceSet(uint256 indexed agentId, address indexed owner, uint16 zone, int32 x, int32 y, bytes32 cardHash, uint32 revision, uint64 updatedAt)',
])
const identityRegistry = await client.readContract({ address: deployment.contractAddress, abi, functionName: 'identityRegistry' })
assert.equal(identityRegistry.toLowerCase(), IDENTITY_REGISTRY.toLowerCase())
const manifestResidences = publicEarthResidences()
assert.equal(deployment.residences.length, manifestResidences.length)

async function transactionProof(proof) {
  try {
    return await client.getTransactionReceipt({ hash: proof.transactionHash })
  } catch {
    const transactionResponse = await fetch(`https://testnet.blockscout-api.injective.network/api/v2/transactions/${proof.transactionHash}`)
    assert.equal(transactionResponse.ok, true, `Blockscout transaction lookup failed for ${proof.transactionHash}`)
    const transaction = await transactionResponse.json()
    assert.equal(transaction.status, 'ok', `Blockscout transaction status for ${proof.transactionHash}`)
    assert.equal(transaction.from?.hash?.toLowerCase(), PROOF_OWNER.toLowerCase())
    assert.equal(transaction.to?.hash?.toLowerCase(), deployment.contractAddress.toLowerCase())
    const logsUrl = new URL('https://testnet.blockscout-api.injective.network/api')
    logsUrl.searchParams.set('module', 'logs')
    logsUrl.searchParams.set('action', 'getLogs')
    logsUrl.searchParams.set('fromBlock', String(transaction.block_number))
    logsUrl.searchParams.set('toBlock', String(transaction.block_number))
    logsUrl.searchParams.set('address', deployment.contractAddress)
    const logsResponse = await fetch(logsUrl)
    const logsPayload = await logsResponse.json()
    const logs = (Array.isArray(logsPayload?.result) ? logsPayload.result : [])
      .filter((item) => item.transactionHash?.toLowerCase() === proof.transactionHash.toLowerCase())
      .map((item) => ({ address: item.address, data: item.data, topics: item.topics.filter(Boolean) }))
    return { status: 'success', blockNumber: BigInt(transaction.block_number), logs }
  }
}

for (const expected of manifestResidences) {
  const proof = deployment.residences.find((item) => item.agentId === expected.agentId)
  assert.ok(proof, `missing deployment proof for agentId ${expected.agentId}`)
  assert.equal(proof.cardHash.toLowerCase(), expected.cardHash.toLowerCase())
  const onChain = await client.readContract({
    address: deployment.contractAddress,
    abi,
    functionName: 'residences',
    args: [BigInt(expected.agentId)],
  })
  assert.equal(Number(onChain[0]), expected.zone, `agent ${expected.agentId} zone`)
  assert.equal(Number(onChain[1]), expected.x, `agent ${expected.agentId} x`)
  assert.equal(Number(onChain[2]), expected.y, `agent ${expected.agentId} y`)
  assert.equal(onChain[3].toLowerCase(), expected.cardHash.toLowerCase(), `agent ${expected.agentId} cardHash`)
  assert.equal(Number(onChain[4]), 1, `agent ${expected.agentId} revision`)
  assert.ok(Number(onChain[5]) > 0, `agent ${expected.agentId} updatedAt`)
  const receipt = await transactionProof(proof)
  assert.equal(receipt.status, 'success', `agent ${expected.agentId} transaction status`)
  assert.equal(receipt.blockNumber, BigInt(proof.blockNumber), `agent ${expected.agentId} block`)
  const log = receipt.logs.find((item) => item.address.toLowerCase() === deployment.contractAddress.toLowerCase())
  assert.ok(log, `agent ${expected.agentId} ResidenceSet log`)
  const decoded = decodeEventLog({ abi, data: log.data, topics: log.topics })
  assert.equal(decoded.eventName, 'ResidenceSet')
  assert.equal(Number(decoded.args.agentId), expected.agentId)
  assert.equal(decoded.args.owner.toLowerCase(), PROOF_OWNER.toLowerCase())
  assert.equal(decoded.args.cardHash.toLowerCase(), expected.cardHash.toLowerCase())
}

console.log(`OK Public Earth live proof reads ${manifestResidences.length} symbolic agent residences from Injective contract ${deployment.contractAddress}.`)
