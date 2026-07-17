import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import solc from 'solc'
import { keccak256, stringToHex } from 'viem'

const source = readFileSync(new URL('./contracts/PublicEarthRegistry.sol', import.meta.url), 'utf8')
const manifest = JSON.parse(readFileSync(new URL('./public-earth-manifest.json', import.meta.url), 'utf8'))
const input = {
  language: 'Solidity',
  sources: { 'PublicEarthRegistry.sol': { content: source } },
  settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
}
const output = JSON.parse(solc.compile(JSON.stringify(input)))
const errors = (output.errors || []).filter((item) => item.severity === 'error')
assert.equal(errors.length, 0, errors.map((item) => item.formattedMessage).join('\n'))
const artifact = output.contracts['PublicEarthRegistry.sol'].PublicEarthRegistry
assert.ok(artifact.evm.bytecode.object.length > 0, 'PublicEarthRegistry bytecode is empty')

const functionNames = artifact.abi.filter((item) => item.type === 'function').map((item) => item.name)
assert.deepEqual(functionNames.sort(), ['identityRegistry', 'residences', 'setResidence'].sort())
assert.ok(artifact.abi.some((item) => item.type === 'event' && item.name === 'ResidenceSet'))
assert.equal(manifest.schema, 'pocket-earth-public-earth/v1')
assert.deepEqual(manifest.zones.map((zone) => zone.id), [1, 2, 3, 4, 5])
assert.deepEqual(manifest.residences.map((item) => item.agentId), [43, 44, 45, 46, 47])

const seenDoorplates = new Set()
const cardHashes = []
for (const residence of manifest.residences) {
  assert.ok(manifest.zones.some((zone) => zone.id === residence.zone), `unknown zone for agent ${residence.agentId}`)
  assert.match(residence.doorplate, new RegExp(`^PE-0${residence.zone}-${String(residence.agentId).padStart(4, '0')}$`))
  assert.ok(!seenDoorplates.has(residence.doorplate), `duplicate doorplate ${residence.doorplate}`)
  seenDoorplates.add(residence.doorplate)
  assert.ok(Math.abs(residence.x) <= 1000 && Math.abs(residence.y) <= 1000)
  assert.ok(Array.isArray(residence.publicTraits) && residence.publicTraits.length >= 2)
  const publicCard = {
    schema: manifest.schema,
    agentId: residence.agentId,
    displayName: residence.displayName,
    zone: residence.zone,
    doorplate: residence.doorplate,
    publicTraits: residence.publicTraits,
    cardVersion: residence.cardVersion,
  }
  cardHashes.push(keccak256(stringToHex(JSON.stringify(publicCard))))
}
assert.equal(new Set(cardHashes).size, manifest.residences.length, 'card hashes must be unique')
for (const forbidden of ['price', 'payment', 'auction', 'landOwner', 'realAddress', 'latitude', 'longitude']) {
  assert.ok(!JSON.stringify(manifest).toLowerCase().includes(forbidden.toLowerCase()), `manifest leaks forbidden field ${forbidden}`)
}

console.log(`OK PublicEarthRegistry compiles and ${manifest.residences.length} symbolic residences keep the no-land/no-private-location boundary.`)
