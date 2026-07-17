import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createPublicClient, defineChain, http, parseAbi } from 'viem'
import { verifyMerkleProof } from '../src/app/lib/chronicle/kernel.mjs'

const deployment = JSON.parse(readFileSync(new URL('./chronicle-deployment.json', import.meta.url), 'utf8'))
const proof = JSON.parse(readFileSync(new URL('./knowledge-edition-proof.json', import.meta.url), 'utf8'))
assert.equal(deployment.chainId, 1439)
assert.equal(proof.chainId, 1439)
assert.equal(proof.contractAddress.toLowerCase(), deployment.contractAddress.toLowerCase())
assert.equal(proof.factCount, proof.records.length)

for (const record of proof.records) {
  assert.equal(await verifyMerkleProof(record.recordHash, record.proof, proof.factsRoot), true)
  assert.match(record.sources[0].url, /^https:\/\//)
}

const rpcUrl = process.env.INJ_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/'
const chain = defineChain({ id: 1439, name: 'Injective EVM Testnet', nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } }, testnet: true })
const client = createPublicClient({ chain, transport: http(rpcUrl) })
assert.notEqual(await client.getBytecode({ address: deployment.contractAddress }), undefined)
const abi = parseAbi(['function chainHeads(address) view returns (bytes32 editionRoot,uint32 day,uint32 revision,uint64 committedAt)'])
const head = await client.readContract({ address: deployment.contractAddress, abi, functionName: 'chainHeads', args: [deployment.publisher] })
assert.equal(head[0], proof.editionRoot)
assert.equal(Number(head[1]), proof.day)
assert.equal(Number(head[2]), proof.revision)
assert.ok(head[3] > 0n)

console.log(`chronicle live verification passed · ${deployment.contractAddress} · revision ${head[2]}`)
