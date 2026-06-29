// Verify the optional Frost Buddy hardware bridge event contract.
// Usage: node INJECTIVE-INTEGRATION/verify-hardware-bridge.mjs
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import {
  EVENT_KIND,
  createChainDispatchEvent,
  createMusicNowPlayingEvent,
  toJsonLine,
} from '../hardware/frost-buddy/frost-hardware-bridge.mjs'
import { BUILDER_CODE, FLEET_AGENT_IDS, scanUrlForRegistry } from './chain-proof-data.mjs'

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

console.log('\nHardware documentation anchors')
const rootReadme = readFileSync('README.md', 'utf8')
const integrationReadme = readFileSync('INJECTIVE-INTEGRATION/README.md', 'utf8')
const hardwareReadme = readFileSync('hardware/frost-buddy/README.md', 'utf8')
const raspiReadme = readFileSync('hardware/frost-buddy/raspi/README.md', 'utf8')

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
]) {
  assertTrue(`raspi README keeps router boundary ${snippet}`, raspiReadme.includes(snippet))
}

console.log('\nRaspberry Pi skill router smoke')
const python = process.env.PYTHON || 'python3'
execFileSync(python, ['hardware/frost-buddy/raspi/frost_pi_skill_agent_smoke.py'], { stdio: 'inherit' })

console.log('\nOK Frost Buddy hardware bridge can carry music-agent and Injective chain-dispatch events safely.')
