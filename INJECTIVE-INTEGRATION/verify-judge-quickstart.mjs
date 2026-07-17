// Guard the concise judge path against evidence drift and private-data leaks.
// Usage: npm run verify:judge
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { handleInjective } from '../injective-service.mjs'
import { createDailyKnowledgeService } from '../knowledge/daily-service.mjs'

const quickstart = await readFile(new URL('./JUDGE-QUICKSTART.md', import.meta.url), 'utf8')
const deployment = JSON.parse(await readFile(new URL('./chronicle-deployment.json', import.meta.url), 'utf8'))
const proof = JSON.parse(await readFile(new URL('./knowledge-edition-proof.json', import.meta.url), 'utf8'))
const publicEarthDeployment = JSON.parse(await readFile(new URL('./public-earth-deployment.json', import.meta.url), 'utf8'))
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

function check(label, condition) {
  assert.ok(condition, label)
  console.log(`PASS  ${label}`)
}

async function callEvidenceApi() {
  let statusCode = 0
  let body = ''
  const res = { writeHead(code) { statusCode = code }, end(chunk = '') { body += String(chunk) } }
  await handleInjective({ method: 'GET' }, res, new URL('http://localhost/api/injective?tool=get-chain-evidence'), { network: 'testnet' })
  assert.equal(statusCode, 200)
  return JSON.parse(body)
}

const evidence = await callEvidenceApi()
const knowledge = await createDailyKnowledgeService({ env: {} }).get('ai', '2026-07-17')

for (const snippet of [
  '# Judge Quickstart',
  '60-Second Path',
  'What This Proves',
  'Injective Proof Matrix',
  'Agent Platform Fast Check',
  'Daily Knowledge Chronicle Fast Check',
  'Frost Edge Node Fast Check',
  'Public Earth + FROST Identity Card',
  'Review Package',
  'Local Commands',
  'Demo Reading Order',
  'agentId 43-47',
  'builderCode=pocket-earth',
  'revision 2',
  'previousEditionRoot',
  'OFFLINE',
  '创建—审核—发布—安装—运行',
  'music_now_playing',
  'chain_dispatch',
  '口袋地球装记忆，公共地球住分身',
  '下载包自包含公开记录',
]) check(`quickstart contains ${snippet}`, quickstart.includes(snippet))

for (const value of [
  'https://github.com/narratorzhang0307/Pocket-Earth-Injective',
  'https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43',
  deployment.contractScanUrl,
  proof.scanUrl,
  '/api/injective?tool=get-chain-evidence',
  '/api/injective?tool=get-agent-proof&agentId=43',
  '/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47',
  '/api/injective?tool=get-hardware-bridge-proof',
  '/api/injective?tool=get-public-earth',
  '/api/knowledge?tool=today&topic=ai',
  '/api/knowledge?tool=proof&recordHash=...',
  '/api/knowledge?tool=pack&date=2026-07-17',
  publicEarthDeployment.contractScanUrl,
]) check(`quickstart links ${value}`, quickstart.includes(value))

const commands = [
  'build', 'verify:judge', 'verify:agent-proof', 'verify:registry', 'verify:handshake',
  'verify:chronicle-contract', 'verify:chronicle-live', 'verify:knowledge-api',
  'verify:knowledge-ui', 'verify:frost-feed', 'verify:foundry-provider',
  'verify:knowledge-pack', 'verify:public-earth-contract', 'verify:public-earth-live',
  'verify:public-earth-api', 'verify:public-earth-ui', 'verify:hardware', 'verify:injective',
]
for (const command of commands) {
  check(`quickstart names npm run ${command}`, quickstart.includes(`npm run ${command}`))
  check(`package exposes ${command}`, Boolean(packageJson.scripts?.[command]))
}

check('evidence is public Injective testnet data', evidence.ok === true && evidence.readOnly === true && evidence.publicOnly === true && evidence.chainId === 1439)
check('evidence contains Frost 43-47', evidence.agents?.map((item) => item.agentId).join(',') === '43,44,45,46,47')
check('evidence contains Public Earth contract and five residences', evidence.publicEarth?.contractAddress?.toLowerCase() === publicEarthDeployment.contractAddress.toLowerCase() && evidence.publicEarth?.residences?.length === 5)
check('evidence contains hardware bridge', evidence.hardwareBridge?.eventKinds?.includes('chain_dispatch'))
check('deployment is Injective testnet', deployment.chainId === 1439 && deployment.contractAddress === proof.contractAddress)
check('proof is current revision 2', proof.revision === 2 && proof.factCount === 2 && proof.day === 20260717)
check('proof preserves revision 1 root', proof.previousEditionRoot === '0x90e20c7b3e2e4c96e1dd4404cba79e815fc9d19e22fb751f43e9cd57d4a5e601')
check('knowledge API exposes the anchored edition', knowledge.edition.editionRoot === proof.editionRoot && knowledge.edition.anchor?.txHash === proof.transactionHash)

for (const forbidden of [
  'INJ_PRIVATE_KEY', 'DASHSCOPE_KEY', 'PINATA_JWT', 'privateKey', 'mnemonic',
  'seed phrase', '.env', '/Users/', 'profileHashA', 'profileHashB',
  '付费', '支付', '收入', '收益', '结算', '抽成', ['x', '402'].join(''),
  'soulbound', '不可转让',
]) check(`quickstart omits ${forbidden}`, !quickstart.includes(forbidden))

console.log('\nJudge quickstart ready: current identity, Chronicle, knowledge UI and hardware evidence are aligned.')
