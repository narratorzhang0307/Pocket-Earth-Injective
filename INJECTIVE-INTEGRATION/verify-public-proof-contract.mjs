// Guard the judge-facing evidence package as a public-only contract.
// Usage: npm run verify:public-proof
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleInjective } from '../injective-service.mjs'
import {
  BUILDER_CODE,
  DEMO_VIDEO_LIMIT_SECONDS,
  FLEET_AGENTS,
  IDENTITY_REGISTRY,
  INJECTIVE_TESTNET_CHAIN_ID,
  PROOF_OWNER,
  REGISTRY_MINT_EVENTS,
  REGISTRY_MINT_ZERO_ADDRESS,
  REVIEW_LINKS,
  SOCIAL_HANDSHAKE,
  SUBMISSION_REPOSITORY_URL,
  TIMELINE_EVENTS,
  scanUrlForAddress,
  scanUrlForAgent,
  scanUrlForTx,
} from './chain-proof-data.mjs'

const integrationDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(integrationDir, '..')
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'))

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

function assertSetEqual(label, actual, expected) {
  const a = [...actual].sort()
  const e = [...expected].sort()
  assertEqual(`${label} count`, a.length, e.length)
  for (const item of e) assertTrue(`${label} includes ${item}`, a.includes(item))
}

async function callEvidenceApi() {
  let statusCode = 0
  let body = ''
  const req = { method: 'GET' }
  const res = {
    writeHead(code) { statusCode = code },
    end(chunk) { body += chunk || '' },
  }
  await handleInjective(req, res, new URL('http://localhost/api/injective?tool=get-chain-evidence'), { network: 'testnet' })
  assertEqual('evidence HTTP status', statusCode, 200)
  const payload = JSON.parse(body)
  assertTrue('evidence has no api error', !payload.error)
  return payload
}

function flattenStrings(value, path = '$', out = []) {
  if (typeof value === 'string') out.push({ path, value })
  else if (Array.isArray(value)) value.forEach((item, index) => flattenStrings(item, `${path}[${index}]`, out))
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) flattenStrings(item, `${path}.${key}`, out)
  }
  return out
}

function assertKnownCommand(label, command) {
  const pieces = String(command).split(/\s*&&\s*/)
  for (const piece of pieces) {
    if (piece.startsWith('npm run ')) {
      const scriptName = piece.slice('npm run '.length).trim().split(/\s+/)[0]
      assertTrue(`${label} npm script ${scriptName}`, !!packageJson.scripts?.[scriptName])
    } else if (piece.startsWith('node ')) {
      const file = piece.slice('node '.length).trim().split(/\s+/)[0]
      assertTrue(`${label} node file ${file}`, existsSync(resolve(projectRoot, file)))
    } else if (piece.startsWith('python3 ')) {
      const file = piece.slice('python3 '.length).trim().split(/\s+/)[0]
      assertTrue(`${label} python file ${file}`, existsSync(resolve(projectRoot, file)))
    } else {
      throw new Error(`${label} has unsupported command: ${piece}`)
    }
  }
}

function collectCommands(evidence) {
  const commands = []
  for (const item of evidence.reviewBrief?.injectiveCore || []) commands.push(['reviewBrief.injectiveCore', item.machineCheck])
  for (const item of evidence.competitionAlignment || []) commands.push(['competitionAlignment', item.machineCheck])
  for (const item of evidence.reviewChecklist || []) commands.push(['reviewChecklist', item.machineCheck])
  for (const item of evidence.submissionChecklist || []) commands.push(['submissionChecklist', item.localCheck])
  for (const [key, value] of Object.entries(evidence.verification || {})) {
    if (typeof value === 'string' && (value.startsWith('npm run ') || value.startsWith('node '))) commands.push([`verification.${key}`, value])
  }
  for (const item of evidence.recordingOrder || []) {
    if (item.command) commands.push(['recordingOrder', item.command])
  }
  return commands.filter(([, command]) => command)
}

const evidence = await callEvidenceApi()

console.log('\nPublic evidence contract shape')
assertSetEqual('top-level keys', Object.keys(evidence), [
  'agents',
  'builderCode',
  'chainId',
  'competitionAlignment',
  'demoVideoLimitSeconds',
  'handshakeContract',
  'handshakeScanUrl',
  'network',
  'ok',
  'owner',
  'ownerScanUrl',
  'plazaFlow',
  'privacyBoundary',
  'publicOnly',
  'readOnly',
  'recordingOrder',
  'registry',
  'registryMintEvents',
  'registryScanUrl',
  'reviewBrief',
  'reviewChecklist',
  'reviewLinks',
  'sourceControl',
  'submissionChecklist',
  'submissionLinks',
  'timeline',
  'verification',
])
assertEqual('ok flag', evidence.ok, true)
assertEqual('network', evidence.network, 'testnet')
assertEqual('chainId', evidence.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('readOnly flag', evidence.readOnly, true)
assertEqual('publicOnly flag', evidence.publicOnly, true)
assertEqual('demo limit', evidence.demoVideoLimitSeconds, DEMO_VIDEO_LIMIT_SECONDS)
assertEqual('builderCode', evidence.builderCode, BUILDER_CODE)
assertEqual('owner', evidence.owner, PROOF_OWNER)
assertEqual('registry', evidence.registry, IDENTITY_REGISTRY)
assertEqual('handshake contract', evidence.handshakeContract, SOCIAL_HANDSHAKE)
assertTrue('sourceControl object', !!evidence.sourceControl && typeof evidence.sourceControl === 'object')
assertEqual('sourceControl repository', evidence.sourceControl.repository, SUBMISSION_REPOSITORY_URL)
assertEqual('sourceControl branch', evidence.sourceControl.branch, 'main')
assertTrue('sourceControl commit is sha or null', evidence.sourceControl.commit === null || /^[0-9a-f]{40}$/i.test(evidence.sourceControl.commit))
if (evidence.sourceControl.commit) assertEqual('sourceControl commitUrl', evidence.sourceControl.commitUrl, `${SUBMISSION_REPOSITORY_URL}/commit/${evidence.sourceControl.commit}`)
assertEqual('sourceControl evidenceApi', evidence.sourceControl.evidenceApi, '/api/injective?tool=get-chain-evidence')

console.log('\nReview entry points')
assertEqual('repo link stays on Injective submission repo', evidence.submissionLinks.find((item) => item.key === 'github-repo')?.url, SUBMISSION_REPOSITORY_URL)
assertEqual('agentId 43 link', evidence.reviewLinks.find((item) => item.key === 'frost-agent-43')?.url, scanUrlForAgent(43))
assertEqual('owner wallet link', evidence.reviewLinks.find((item) => item.key === 'owner-wallet')?.url, scanUrlForAddress(PROOF_OWNER))
assertEqual('real handshake link', evidence.reviewLinks.find((item) => item.key === 'real-handshake-tx')?.url, scanUrlForTx(TIMELINE_EVENTS.at(-1).hash))
assertEqual('review link count', evidence.reviewLinks.length, REVIEW_LINKS.length)
assertTrue('recording order starts from #43', evidence.recordingOrder?.[0]?.url === scanUrlForAgent(43))
assertTrue('recording order includes public evidence API', evidence.recordingOrder?.some((item) => item.path === '/api/injective?tool=get-chain-evidence'))
assertTrue('recording order includes fleet API', evidence.recordingOrder?.some((item) => item.path === evidence.verification?.listAgentsApi))
assertTrue('recording order includes wallet timeline API', evidence.recordingOrder?.some((item) => item.path === evidence.verification?.walletTimelineApi))

console.log('\nFleet and timeline are review-ready')
assertEqual('fleet agent count', evidence.agents.length, FLEET_AGENTS.length)
for (const agent of FLEET_AGENTS) {
  const actual = evidence.agents.find((item) => Number(item.agentId) === Number(agent.id))
  assertTrue(`agent ${agent.id} exists`, !!actual)
  assertEqual(`agent ${agent.id} scanUrl`, actual.scanUrl, scanUrlForAgent(agent.id))
}
assertEqual('registry mint event count', evidence.registryMintEvents.length, REGISTRY_MINT_EVENTS.length)
for (const event of REGISTRY_MINT_EVENTS) {
  const actual = evidence.registryMintEvents.find((item) => Number(item.agentId) === event.agentId)
  assertTrue(`registry mint agent ${event.agentId} exists`, !!actual)
  assertEqual(`registry mint agent ${event.agentId} from`, actual.from, REGISTRY_MINT_ZERO_ADDRESS)
  assertEqual(`registry mint agent ${event.agentId} to`, actual.to, PROOF_OWNER)
  assertEqual(`registry mint agent ${event.agentId} transactionHash`, actual.transactionHash, event.transactionHash)
  assertEqual(`registry mint agent ${event.agentId} block`, actual.blockNumber, event.blockNumber)
  assertEqual(`registry mint agent ${event.agentId} scanUrl`, actual.scanUrl, scanUrlForTx(event.transactionHash))
}
assertEqual('registry mint checklist command', evidence.reviewChecklist.find((item) => item.key === 'registry-mint-events')?.machineCheck, 'npm run verify:registry')
assertEqual('timeline count', evidence.timeline.length, TIMELINE_EVENTS.length)
for (const event of TIMELINE_EVENTS) {
  const actual = evidence.timeline.find((item) => item.hash === event.hash)
  assertTrue(`timeline ${event.role} exists`, !!actual)
  assertEqual(`timeline ${event.role} scanUrl`, actual.scanUrl, scanUrlForTx(event.hash))
}

console.log('\nVerification commands remain runnable')
assertEqual('public proof command is advertised', evidence.verification?.publicProof, 'npm run verify:public-proof')
assertEqual('github repo command is advertised', evidence.verification?.githubRepo, 'npm run verify:github')
assertEqual('source control command is advertised', evidence.verification?.sourceControl, 'npm run verify:source')
assertEqual('registry events command is advertised', evidence.verification?.registryEvents, 'npm run verify:registry')
assertEqual('pitch notes command is advertised', evidence.verification?.pitchNotes, 'npm run verify:pitch')
assertEqual('judge quickstart command is advertised', evidence.verification?.judgeQuickstart, 'npm run verify:judge')
for (const [label, command] of collectCommands(evidence)) assertKnownCommand(label, command)

console.log('\nPublic-only leak guard')
const publicText = JSON.stringify(evidence)
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
  assertTrue(`evidence omits ${forbidden}`, !publicText.includes(forbidden))
}

console.log('\nPublic URL guard')
const allowedHosts = new Set([
  'github.com',
  'pocketearth.throughtheglass.art',
  'testnet.blockscout.injective.network',
])
for (const { path, value } of flattenStrings(evidence)) {
  if (!value.startsWith('http')) continue
  const url = new URL(value)
  assertEqual(`${path} uses https`, url.protocol, 'https:')
  assertTrue(`${path} host is public review host`, allowedHosts.has(url.host))
}

console.log('\nOK public evidence package is a stable, public-only review contract.')
