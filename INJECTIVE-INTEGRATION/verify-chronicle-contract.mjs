import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import solc from 'solc'

const file = new URL('./contracts/DailyKnowledgeChronicle.sol', import.meta.url)
const source = readFileSync(file, 'utf8')
const input = {
  language: 'Solidity',
  sources: { 'DailyKnowledgeChronicle.sol': { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
  },
}
const output = JSON.parse(solc.compile(JSON.stringify(input)))
const errors = (output.errors || []).filter((item) => item.severity === 'error')
assert.deepEqual(errors, [])
const artifact = output.contracts?.['DailyKnowledgeChronicle.sol']?.DailyKnowledgeChronicle
assert.ok(artifact)
assert.match(artifact.evm.bytecode.object, /^[0-9a-f]+$/i)
const functionNames = artifact.abi.filter((item) => item.type === 'function').map((item) => item.name)
assert.ok(functionNames.includes('commitEdition'))
assert.ok(functionNames.includes('chainHeads'))
assert.ok(functionNames.includes('editions'))
assert.match(source, /previousEditionRoot != head\.editionRoot/)
assert.match(source, /factCount == 0/)
assert.match(source, /private memories remain off-chain/)

console.log(`chronicle contract verification passed · solc ${solc.version()} · bytecode ${artifact.evm.bytecode.object.length / 2} bytes`)

