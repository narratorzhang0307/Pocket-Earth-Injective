import assert from 'node:assert/strict'
import { handleInjective } from '../injective-service.mjs'
import { IDENTITY_REGISTRY, INJECTIVE_TESTNET_CHAIN_ID } from './chain-proof-data.mjs'
import { PUBLIC_EARTH_DEPLOYMENT, publicEarthResidences } from './public-earth-data.mjs'

function callApi() {
  return new Promise((resolve, reject) => {
    let statusCode = 0
    let body = ''
    const res = {
      writeHead(code) { statusCode = code },
      end(chunk = '') {
        body += chunk
        try { resolve({ statusCode, payload: JSON.parse(body) }) } catch (error) { reject(error) }
      },
    }
    handleInjective({ method: 'GET' }, res, new URL('http://localhost/api/injective?tool=get-public-earth'), { network: 'testnet' }).catch(reject)
  })
}

const { statusCode, payload } = await callApi()
assert.equal(statusCode, 200)
assert.equal(payload.ok, true)
assert.equal(payload.network, 'testnet')
assert.equal(payload.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assert.equal(payload.readOnly, true)
assert.equal(payload.publicOnly, true)
assert.equal(payload.live, true, `expected live Injective state, got ${payload.evidenceSource}`)
assert.equal(payload.evidenceSource, 'injective-rpc')
assert.equal(payload.contract.address.toLowerCase(), PUBLIC_EARTH_DEPLOYMENT.contractAddress.toLowerCase())
assert.equal(payload.contract.identityRegistry.toLowerCase(), IDENTITY_REGISTRY.toLowerCase())
assert.equal(payload.residences.length, 5)
const expected = publicEarthResidences()
for (const residence of payload.residences) {
  const manifest = expected.find((item) => item.agentId === residence.agentId)
  assert.ok(manifest, `unexpected agentId ${residence.agentId}`)
  assert.equal(residence.doorplate, manifest.doorplate)
  assert.equal(residence.cardHash.toLowerCase(), manifest.cardHash.toLowerCase())
  assert.equal(residence.cardHashMatches, true)
  assert.equal(residence.revision, 1)
  assert.ok(residence.updatedAt > 0)
  assert.match(residence.identityScanUrl, /testnet\.blockscout\.injective\.network/)
  assert.match(residence.residenceScanUrl, /testnet\.blockscout\.injective\.network\/tx\//)
}
const payloadKeys = []
function collectKeys(value) {
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) { payloadKeys.push(key.toLowerCase()); collectKeys(child) }
}
collectKeys(payload)
for (const forbidden of ['privateKey', 'INJ_PRIVATE_KEY', 'latitude', 'longitude', 'realAddress', 'price', 'auction']) {
  assert.ok(!payloadKeys.includes(forbidden.toLowerCase()), `public API leaks forbidden field ${forbidden}`)
}

console.log(`OK get-public-earth returns ${payload.residences.length} live Injective residences with verified public card hashes.`)
