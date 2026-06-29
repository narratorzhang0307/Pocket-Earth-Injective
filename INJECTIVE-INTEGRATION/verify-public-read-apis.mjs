// Verify the judge-facing publicReadApis manifest and each public read-only endpoint.
// Usage: npm run verify:public-apis
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  FLEET_AGENTS,
  IDENTITY_REGISTRY,
  INJECTIVE_TESTNET_CHAIN_ID,
  PROOF_OWNER,
  REGISTRY_MINT_EVENTS,
  SUBMISSION_REPOSITORY_URL,
  TIMELINE_EVENTS,
  scanUrlForAgent,
  scanUrlForRegistry,
} from './chain-proof-data.mjs'

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function assertEqual(label, actual, expected) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

async function callApi(path) {
  let statusCode = 0
  let body = ''
  const req = { method: 'GET' }
  const res = {
    writeHead(code) { statusCode = code },
    end(chunk) { body += chunk || '' },
  }
  await handleInjective(req, res, new URL(`http://localhost${path}`), { network: 'testnet' })
  assertEqual(`${path} HTTP status`, statusCode, 200)
  const payload = JSON.parse(body)
  assertTrue(`${path} has no api error`, !payload.error)
  return payload
}

function guardPublicText(label, value) {
  const text = JSON.stringify(value)
  for (const forbidden of [
    'INJ_PRIVATE_KEY',
    'DASHSCOPE_KEY',
    'PINATA_JWT',
    'privateKey',
    'mnemonic',
    'seed phrase',
    '.env',
    '/Users/',
    'Pocket-Earth-Plus',
    'Sunset-Radio',
    'sunset-radio',
    'profileHashA',
    'profileHashB',
  ]) {
    assertTrue(`${label} omits ${forbidden}`, !text.includes(forbidden))
  }
}

async function suppressCardFetchWarnings(fn) {
  const sdkWarnings = []
  const originalWarn = console.warn
  const originalError = console.error
  console.warn = (...args) => {
    const msg = args.join(' ')
    if (msg.includes('Failed to fetch card')) sdkWarnings.push(msg)
    else originalWarn(...args)
  }
  console.error = (...args) => {
    const msg = args.join(' ')
    if (msg.includes('Failed to fetch card')) sdkWarnings.push(msg)
    else originalError(...args)
  }
  try {
    const result = await fn()
    if (sdkWarnings.length) {
      console.log('\nNOTE Agent SDK card fetch warnings were suppressed; /api decoded data URI cards directly.')
    }
    return result
  } finally {
    console.warn = originalWarn
    console.error = originalError
  }
}

const topAgentId = Math.max(...FLEET_AGENTS.map((agent) => Number(agent.id)))
const expectedPaths = new Map([
  ['chain-evidence-api', '/api/injective?tool=get-chain-evidence'],
  ['agent-proof-api', '/api/injective?tool=get-agent-proof&agentId=43'],
  ['agent-fleet-api', `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=${FLEET_AGENTS.length}&top=${topAgentId}`],
  ['wallet-timeline-api', '/api/injective?tool=get-wallet-timeline'],
])

const evidence = await callApi('/api/injective?tool=get-chain-evidence')

console.log('\npublicReadApis manifest')
assertTrue('publicReadApis array', Array.isArray(evidence.publicReadApis))
assertEqual('publicReadApis count', evidence.publicReadApis.length, expectedPaths.size)
const byKey = new Map(evidence.publicReadApis.map((item) => [item.key, item]))
for (const [key, path] of expectedPaths) {
  const item = byKey.get(key)
  assertTrue(`manifest includes ${key}`, Boolean(item))
  assertEqual(`${key} method`, item.method, 'GET')
  assertEqual(`${key} path`, item.path, path)
  assertEqual(`${key} chainId`, item.chainId, INJECTIVE_TESTNET_CHAIN_ID)
  assertEqual(`${key} readOnly`, item.readOnly, true)
  assertEqual(`${key} publicOnly`, item.publicOnly, true)
  assertTrue(`${key} purpose`, String(item.purpose || '').length > 20)
  assertTrue(`${key} verification command`, String(item.verification || '').length > 0)
}
assertEqual('advertised publicReadApis command', evidence.verification?.publicReadApis, 'npm run verify:public-apis')

console.log('\nchain evidence endpoint')
const chainEvidence = await callApi(byKey.get('chain-evidence-api').path)
assertEqual('chain evidence ok', chainEvidence.ok, true)
assertEqual('chain evidence chainId', chainEvidence.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('chain evidence readOnly', chainEvidence.readOnly, true)
assertEqual('chain evidence publicOnly', chainEvidence.publicOnly, true)
assertEqual('chain evidence source repository', chainEvidence.sourceControl?.repository, SUBMISSION_REPOSITORY_URL)
assertTrue('chain evidence carries publicReadApis', Array.isArray(chainEvidence.publicReadApis))
assertTrue('chain evidence carries agent proof rows', Array.isArray(chainEvidence.agents))
assertEqual('chain evidence agent proof row count', chainEvidence.agents.length, FLEET_AGENTS.length)
for (const expected of FLEET_AGENTS) {
  const actual = chainEvidence.agents.find((agent) => Number(agent.agentId) === Number(expected.id))
  const mintEvent = REGISTRY_MINT_EVENTS.find((event) => Number(event.agentId) === Number(expected.id))
  assertTrue(`chain evidence agent ${expected.id} row`, Boolean(actual))
  assertTrue(`chain evidence agent ${expected.id} mint event`, Boolean(mintEvent))
  assertEqual(`chain evidence agent ${expected.id} owner`, actual.owner, PROOF_OWNER)
  assertEqual(`chain evidence agent ${expected.id} builderCode`, actual.builderCode, BUILDER_CODE)
  assertEqual(`chain evidence agent ${expected.id} registry`, actual.registry, IDENTITY_REGISTRY)
  assertEqual(`chain evidence agent ${expected.id} registryScanUrl`, actual.registryScanUrl, scanUrlForRegistry())
  assertEqual(`chain evidence agent ${expected.id} mintedFromZero`, actual.mintedFromZero, true)
  assertEqual(`chain evidence agent ${expected.id} mintTransactionHash`, actual.mintTransactionHash, mintEvent.transactionHash)
  assertEqual(`chain evidence agent ${expected.id} mintBlockNumber`, actual.mintBlockNumber, mintEvent.blockNumber)
  assertEqual(`chain evidence agent ${expected.id} mintScanUrl`, actual.mintScanUrl, mintEvent.scanUrl)
  assertEqual(`chain evidence agent ${expected.id} proofApi`, actual.proofApi, `/api/injective?tool=get-agent-proof&agentId=${Number(expected.id)}`)
  assertEqual(`chain evidence agent ${expected.id} scanUrl`, actual.scanUrl, scanUrlForAgent(expected.id))
}

console.log('\nagent proof endpoint')
const agentProof = await callApi(byKey.get('agent-proof-api').path)
assertEqual('agent proof ok', agentProof.ok, true)
assertEqual('agent proof chainId', agentProof.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('agent proof readOnly', agentProof.readOnly, true)
assertEqual('agent proof publicOnly', agentProof.publicOnly, true)
assertEqual('agent proof id', agentProof.agent?.agentId, 43)
assertEqual('agent proof owner', agentProof.agent?.owner, PROOF_OWNER)
assertEqual('agent proof builderCode', agentProof.agent?.builderCode, BUILDER_CODE)
assertEqual('agent proof registry', agentProof.agent?.registry, IDENTITY_REGISTRY)
assertEqual('agent proof mint tx', agentProof.agent?.mintTransactionHash, REGISTRY_MINT_EVENTS[0].transactionHash)
assertEqual('agent proof proofApi', agentProof.agent?.proofApi, '/api/injective?tool=get-agent-proof&agentId=43')
assertEqual('agent proof scanUrl', agentProof.agent?.scanUrl, scanUrlForAgent(43))
assertEqual('agent proof source repository', agentProof.sourceControl?.repository, SUBMISSION_REPOSITORY_URL)
assertEqual('agent proof verification command', agentProof.verification?.agentProof, 'npm run verify:agent-proof')

console.log('\nagent fleet endpoint')
const fleet = await suppressCardFetchWarnings(() => callApi(byKey.get('agent-fleet-api').path))
assertEqual('fleet builderCode', fleet.builderCode, BUILDER_CODE)
assertTrue('fleet agents array', Array.isArray(fleet.agents))
assertTrue('fleet returned full Pocket Earth fleet', fleet.agents.length >= FLEET_AGENTS.length)
for (const expected of FLEET_AGENTS) {
  const agent = fleet.agents.find((item) => Number(item.agentId) === Number(expected.id))
  assertTrue(`fleet includes agent ${expected.id}`, Boolean(agent))
  assertEqual(`fleet agent ${expected.id} builderCode`, agent.builderCode, BUILDER_CODE)
}

console.log('\nwallet timeline endpoint')
const timeline = await callApi(byKey.get('wallet-timeline-api').path)
assertEqual('timeline ok', timeline.ok, true)
assertEqual('timeline chainId', timeline.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('timeline readOnly', timeline.readOnly, true)
assertEqual('timeline publicOnly', timeline.publicOnly, true)
assertEqual('timeline owner', timeline.owner, PROOF_OWNER)
assertEqual('timeline event count', timeline.events?.length, TIMELINE_EVENTS.length)
assertEqual('timeline summary allSucceeded', timeline.summary?.allSucceeded, true)
assertEqual('timeline summary evidence API', timeline.summary?.evidenceApi, '/api/injective?tool=get-chain-evidence')

console.log('\nPublic-only guard')
guardPublicText('publicReadApis', evidence.publicReadApis)
guardPublicText('chain evidence response', chainEvidence)
guardPublicText('agent proof response', agentProof)
guardPublicText('fleet response', fleet)
guardPublicText('wallet timeline response', timeline)

console.log('\nOK publicReadApis opens the four judge-safe read-only Injective endpoints.')
