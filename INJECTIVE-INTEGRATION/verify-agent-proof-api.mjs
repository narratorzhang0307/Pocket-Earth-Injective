// Verify the single-agent public proof card exposed by /api/injective.
// Usage: npm run verify:agent-proof
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  FLEET_AGENTS,
  IDENTITY_REGISTRY,
  INJECTIVE_TESTNET_CHAIN_ID,
  PROOF_OWNER,
  REGISTRY_MINT_EVENTS,
  REGISTRY_MINT_ZERO_ADDRESS,
  INTEGRATION_REPOSITORY_URL,
  TIMELINE_EVENTS,
  scanUrlForAddress,
  scanUrlForAgent,
  scanUrlForRegistry,
  scanUrlForTx,
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

async function callAgentProof(agentId) {
  let statusCode = 0
  let body = ''
  const req = { method: 'GET' }
  const res = {
    writeHead(code) { statusCode = code },
    end(chunk) { body += chunk || '' },
  }
  await handleInjective(req, res, new URL(`http://localhost/api/injective?tool=get-agent-proof&agentId=${agentId}`), { network: 'testnet' })
  assertEqual(`agent ${agentId} HTTP status`, statusCode, 200)
  const payload = JSON.parse(body)
  assertTrue(`agent ${agentId} has no api error`, !payload.error)
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

console.log('Single-agent proof API')

for (const expected of FLEET_AGENTS) {
  const agentId = Number(expected.id)
  const payload = await callAgentProof(agentId)
  const mintEvent = REGISTRY_MINT_EVENTS.find((event) => Number(event.agentId) === agentId)
  const timelineEvent = TIMELINE_EVENTS.find((event) => event.role === `agentId ${agentId}`)

  assertEqual(`agent ${agentId} ok`, payload.ok, true)
  assertEqual(`agent ${agentId} network`, payload.network, 'testnet')
  assertEqual(`agent ${agentId} chainId`, payload.chainId, INJECTIVE_TESTNET_CHAIN_ID)
  assertEqual(`agent ${agentId} readOnly`, payload.readOnly, true)
  assertEqual(`agent ${agentId} publicOnly`, payload.publicOnly, true)
  assertTrue(`agent ${agentId} agent object`, !!payload.agent && typeof payload.agent === 'object')
  assertEqual(`agent ${agentId} id`, payload.agent.agentId, agentId)
  assertEqual(`agent ${agentId} label`, payload.agent.label, expected.label)
  assertEqual(`agent ${agentId} owner`, payload.agent.owner, PROOF_OWNER)
  assertEqual(`agent ${agentId} builderCode`, payload.agent.builderCode, BUILDER_CODE)
  assertEqual(`agent ${agentId} registry`, payload.agent.registry, IDENTITY_REGISTRY)
  assertEqual(`agent ${agentId} registryScanUrl`, payload.agent.registryScanUrl, scanUrlForRegistry())
  assertEqual(`agent ${agentId} mintedFromZero`, payload.agent.mintedFromZero, true)
  assertEqual(`agent ${agentId} mintTransactionHash`, payload.agent.mintTransactionHash, mintEvent.transactionHash)
  assertEqual(`agent ${agentId} mintBlockNumber`, payload.agent.mintBlockNumber, mintEvent.blockNumber)
  assertEqual(`agent ${agentId} mintScanUrl`, payload.agent.mintScanUrl, scanUrlForTx(mintEvent.transactionHash))
  assertEqual(`agent ${agentId} proofApi`, payload.agent.proofApi, `/api/injective?tool=get-agent-proof&agentId=${agentId}`)
  assertEqual(`agent ${agentId} scanUrl`, payload.agent.scanUrl, scanUrlForAgent(agentId))
  if (expected.requiredTag) assertEqual(`agent ${agentId} requiredTag`, payload.agent.requiredTag, expected.requiredTag)

  assertTrue(`agent ${agentId} mint event object`, !!payload.mintEvent && typeof payload.mintEvent === 'object')
  assertEqual(`agent ${agentId} mint from`, payload.mintEvent.from, REGISTRY_MINT_ZERO_ADDRESS)
  assertEqual(`agent ${agentId} mint to`, payload.mintEvent.to, PROOF_OWNER)
  assertEqual(`agent ${agentId} mint tx`, payload.mintEvent.transactionHash, mintEvent.transactionHash)
  assertEqual(`agent ${agentId} mint scanUrl`, payload.mintEvent.scanUrl, scanUrlForTx(mintEvent.transactionHash))
  assertEqual(`agent ${agentId} mint agentScanUrl`, payload.mintEvent.agentScanUrl, scanUrlForAgent(agentId))

  assertTrue(`agent ${agentId} timeline object`, !!payload.timelineEvent && typeof payload.timelineEvent === 'object')
  assertEqual(`agent ${agentId} timeline hash`, payload.timelineEvent.hash, timelineEvent.hash)
  assertEqual(`agent ${agentId} timeline from`, payload.timelineEvent.from, PROOF_OWNER)
  assertEqual(`agent ${agentId} timeline to`, payload.timelineEvent.to, IDENTITY_REGISTRY)
  assertEqual(`agent ${agentId} timeline expectedStatus`, payload.timelineEvent.expectedStatus, 'success')
  assertEqual(`agent ${agentId} timeline block`, payload.timelineEvent.blockNumber, timelineEvent.blockNumber)
  assertEqual(`agent ${agentId} timeline timestamp`, payload.timelineEvent.timestamp, timelineEvent.timestamp)
  assertEqual(`agent ${agentId} timeline scanUrl`, payload.timelineEvent.scanUrl, scanUrlForTx(timelineEvent.hash))

  assertEqual(`agent ${agentId} source repository`, payload.sourceControl?.repository, INTEGRATION_REPOSITORY_URL)
  assertEqual(`agent ${agentId} source branch`, payload.sourceControl?.branch, 'main')
  assertTrue(`agent ${agentId} source commit is sha or null`, payload.sourceControl?.commit === null || /^[0-9a-f]{40}$/i.test(payload.sourceControl?.commit))
  assertEqual(`agent ${agentId} review path count`, payload.reviewPath?.length, 3)
  assertEqual(`agent ${agentId} review path identity url`, payload.reviewPath?.[0]?.url, scanUrlForAgent(agentId))
  assertEqual(`agent ${agentId} review path mint url`, payload.reviewPath?.[1]?.url, scanUrlForTx(mintEvent.transactionHash))
  assertEqual(`agent ${agentId} review path wallet url`, payload.reviewPath?.[2]?.url, scanUrlForAddress(PROOF_OWNER))
  assertEqual(`agent ${agentId} verification command`, payload.verification?.agentProof, 'npm run verify:agent-proof')
  assertEqual(`agent ${agentId} verification registry command`, payload.verification?.registryEvents, 'npm run verify:registry')
  assertEqual(`agent ${agentId} verification source command`, payload.verification?.sourceControl, 'npm run verify:source')

  guardPublicText(`agent ${agentId} proof`, payload)
}

console.log('\nOK single-agent proof API is public, source-anchored, and complete for agentId 43-47.')
