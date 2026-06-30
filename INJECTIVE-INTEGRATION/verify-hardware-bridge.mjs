// Verify the optional Frost Buddy hardware bridge event contract.
// Usage: node INJECTIVE-INTEGRATION/verify-hardware-bridge.mjs
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { handleInjective } from '../injective-service.mjs'
import {
  EVENT_KIND,
  createChainDispatchEvent,
  createMusicNowPlayingEvent,
  toJsonLine,
} from '../hardware/frost-buddy/frost-hardware-bridge.mjs'
import {
  BUILDER_CODE,
  FLEET_AGENT_IDS,
  HARDWARE_BRIDGE_PROOF,
  INJECTIVE_TESTNET_CHAIN_ID,
  INTEGRATION_REPOSITORY_URL,
  scanUrlForRegistry,
} from './chain-proof-data.mjs'

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function assertEqual(label, actual, expected) {
  if (String(actual) !== String(expected)) throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  console.log(`OK ${label}: ${actual}`)
}

function assertNoSecrets(label, value) {
  const text = JSON.stringify(value)
  assertTrue(`${label} has no private key`, !/0x[0-9a-f]{64}/i.test(text))
  assertTrue(`${label} has no secret env names`, !/INJ_PRIVATE_KEY|PRIVATE_KEY|DASHSCOPE_API_KEY|PINATA_JWT/i.test(text))
}

function assertListIncludes(label, actual, expectedItems) {
  assertTrue(`${label} array`, Array.isArray(actual))
  for (const expected of expectedItems) assertTrue(`${label} includes ${expected}`, actual.includes(expected))
}

async function callInjectiveApi(path) {
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

const music = createMusicNowPlayingEvent({
  track: { title: 'Midnight City', artist: 'Frost Radio' },
  city: { nameZh: '布宜诺斯艾利斯' },
  createdAt: '2026-06-29T00:00:00.000Z',
})

assertEqual('music hardware event kind', music.kind, EVENT_KIND.MUSIC_NOW_PLAYING)
assertEqual('music hardware event source', music.source, 'music-agent')
assertEqual('music hardware buddy state', music.state, 'busy')
assertTrue('music hardware speech line', music.speak.includes('Frost 正在播放'))
assertNoSecrets('music hardware event', music)

const chain = createChainDispatchEvent({
  count: FLEET_AGENT_IDS.length,
  agentIds: FLEET_AGENT_IDS,
  body: `builderCode=${BUILDER_CODE} returned agentId ${FLEET_AGENT_IDS[0]}-${FLEET_AGENT_IDS.at(-1)} from Injective testnet.`,
  scanUrl: scanUrlForRegistry(),
  createdAt: '2026-06-29T00:00:01.000Z',
})

assertEqual('chain hardware event kind', chain.kind, EVENT_KIND.CHAIN_DISPATCH)
assertEqual('chain hardware event source', chain.source, 'injective-public-plaza')
assertEqual('chain hardware buddy state', chain.state, 'attention')
assertEqual('chain hardware priority', chain.priority, 'urgent')
assertEqual('chain hardware scanUrl', chain.scanUrl, scanUrlForRegistry())
assertEqual('chain hardware fleet ids', chain.agentIds.join(','), FLEET_AGENT_IDS.join(','))
assertTrue('chain hardware speech line', chain.speak.includes('Injective 链上'))
assertNoSecrets('chain hardware event', chain)

const jsonLine = toJsonLine(chain)
assertTrue('hardware bridge emits JSONL', jsonLine.endsWith('\n'))
assertEqual('hardware JSONL round-trip kind', JSON.parse(jsonLine).kind, EVENT_KIND.CHAIN_DISPATCH)

console.log('\nHardware proof API')
const hardwareProof = await callInjectiveApi('/api/injective?tool=get-hardware-bridge-proof')
assertEqual('hardware proof ok', hardwareProof.ok, true)
assertEqual('hardware proof network', hardwareProof.network, 'testnet')
assertEqual('hardware proof chainId', hardwareProof.chainId, INJECTIVE_TESTNET_CHAIN_ID)
assertEqual('hardware proof readOnly', hardwareProof.readOnly, true)
assertEqual('hardware proof publicOnly', hardwareProof.publicOnly, true)
assertEqual('hardware proof key', hardwareProof.hardwareBridge?.key, HARDWARE_BRIDGE_PROOF.key)
assertEqual('hardware proof module URL', hardwareProof.hardwareBridge?.moduleUrl, HARDWARE_BRIDGE_PROOF.moduleUrl)
assertListIncludes('hardware proof event kinds', hardwareProof.hardwareBridge?.eventKinds, HARDWARE_BRIDGE_PROOF.eventKinds)
assertEqual('hardware proof chain source', hardwareProof.hardwareBridge?.chainDispatch?.source, HARDWARE_BRIDGE_PROOF.chainDispatch.source)
assertEqual('hardware proof builderCode', hardwareProof.hardwareBridge?.chainDispatch?.builderCode, BUILDER_CODE)
assertEqual('hardware proof chain read', hardwareProof.hardwareBridge?.chainDispatch?.chainRead, HARDWARE_BRIDGE_PROOF.chainDispatch.chainRead)
assertEqual('hardware proof scanUrl', hardwareProof.hardwareBridge?.chainDispatch?.scanUrl, scanUrlForRegistry())
assertEqual('hardware proof agent ids', hardwareProof.hardwareBridge?.chainDispatch?.agentIds?.join(','), FLEET_AGENT_IDS.join(','))
assertListIncludes('hardware proof Pi skills', hardwareProof.hardwareBridge?.piRouter?.skills, ['music_now_playing', 'chain_dispatch'])
assertEqual('hardware proof Pi adapter path', hardwareProof.hardwareBridge?.piAdapter?.modulePath, 'hardware/frost-buddy/raspi/frost_pi_event_adapter.py')
assertListIncludes('hardware proof Pi adapter actions', hardwareProof.hardwareBridge?.piAdapter?.actions, ['state', 'tts', 'display'])
assertTrue('hardware proof Pi adapter boundary', String(hardwareProof.hardwareBridge?.piAdapter?.boundary || '').includes('transport-neutral adapter lane'))
assertEqual('hardware proof market role', hardwareProof.hardwareBridge?.marketBoundary?.role, HARDWARE_BRIDGE_PROOF.marketBoundary.role)
assertEqual('hardware proof market source', hardwareProof.hardwareBridge?.marketBoundary?.sourceUrl, HARDWARE_BRIDGE_PROOF.marketBoundary.sourceUrl)
assertTrue('hardware proof market business path', String(hardwareProof.hardwareBridge?.marketBoundary?.businessPath || '').includes('Agent Plaza'))
assertTrue('hardware proof market risk line', String(hardwareProof.hardwareBridge?.marketBoundary?.riskLine || '').includes('No mass-production'))
assertListIncludes('hardware proof privacy boundary', hardwareProof.privacyBoundary?.hardware, ['no private keys', 'no wallet signing', 'no raw profile text', 'public JSONL events only'])
assertEqual('hardware proof source repository', hardwareProof.sourceControl?.repository, INTEGRATION_REPOSITORY_URL)
assertEqual('hardware proof local verification', hardwareProof.verification?.hardwareBridge, 'npm run verify:hardware')
assertNoSecrets('hardware proof API', hardwareProof)

console.log('\nHardware documentation anchors')
const rootReadme = readFileSync('README.md', 'utf8')
const integrationReadme = readFileSync('INJECTIVE-INTEGRATION/README.md', 'utf8')
const hardwareReadme = readFileSync('hardware/frost-buddy/README.md', 'utf8')
const raspiReadme = readFileSync('hardware/frost-buddy/raspi/README.md', 'utf8')
const piAdapter = readFileSync('hardware/frost-buddy/raspi/frost_pi_event_adapter.py', 'utf8')
const piAdapterSmoke = readFileSync('hardware/frost-buddy/raspi/frost_pi_event_adapter_smoke.py', 'utf8')

for (const snippet of [
  'Frost Edge Node',
  'Raspberry Pi',
  'BLE',
  'TTS',
  'music_now_playing',
  'chain_dispatch',
  'builderCode=pocket-earth',
  'agentId 43-47',
  '公开事件',
  '不碰私钥',
  '不签名',
  '不读取原始画像',
  '不是重资本硬件路线',
  '开发套件',
  '体验差异化',
  '市场边界',
  'Raspberry Pi 事件适配分支保持解耦',
  'frost_pi_event_adapter.py',
  'state',
  'tts',
  'display',
  'Raspberry Pi',
  '隐私与安全边界',
  'https://investors.raspberrypi.com/',
]) {
  assertTrue(`hardware README keeps ${snippet}`, hardwareReadme.includes(snippet))
}

for (const snippet of [
  '### 5.2 Frost Edge Node',
  'Raspberry Pi',
  'public-plaza',
  '公开事件',
  '体验差异化',
  '开发套件',
]) {
  assertTrue(`root README keeps hardware summary ${snippet}`, rootReadme.includes(snippet))
}

for (const snippet of [
  '## 12. 技术深挖：Frost Edge Node 硬件原理与市场边界',
  'music-agent 实体化',
  '链上见闻实体化',
  'Raspberry Pi 适合做原型平台',
  'Agent Plaza 的安装、调用、评价和可选付费回执',
]) {
  assertTrue(`integration README keeps hardware depth ${snippet}`, integrationReadme.includes(snippet))
}

for (const snippet of [
  'Raspberry Pi edge',
  'skill registry',
  'JSONL events such as `chain_dispatch`',
  'Decoupled Event Adapter Lane',
  'frost_pi_event_adapter.py',
  'transport-neutral device',
]) {
  assertTrue(`raspi README keeps router boundary ${snippet}`, raspiReadme.includes(snippet))
}

for (const snippet of [
  'Transport-neutral Raspberry Pi adapter',
  'SAFE_EVENT_KEYS',
  'SAFE_ACTION_KEYS',
  'ALLOWED_ACTION_TYPES',
  'event_to_actions',
  'local-tts',
  'display',
  'sourceKind',
]) {
  assertTrue(`Pi adapter keeps decoupled action contract ${snippet}`, piAdapter.includes(snippet))
}

for (const snippet of [
  'music-now-playing.sample.json',
  'chain-dispatch.sample.json',
  'state/tts/display',
  'CLI should emit three action lines',
]) {
  assertTrue(`Pi adapter smoke covers ${snippet}`, piAdapterSmoke.includes(snippet))
}

console.log('\nRaspberry Pi skill router smoke')
const python = process.env.PYTHON || 'python3'
execFileSync(python, ['hardware/frost-buddy/raspi/frost_pi_skill_agent_smoke.py'], { stdio: 'inherit' })

console.log('\nRaspberry Pi event adapter smoke')
execFileSync(python, ['hardware/frost-buddy/raspi/frost_pi_event_adapter_smoke.py'], { stdio: 'inherit' })

console.log('\nOK Frost Buddy hardware bridge can carry music-agent and Injective chain-dispatch events safely.')
