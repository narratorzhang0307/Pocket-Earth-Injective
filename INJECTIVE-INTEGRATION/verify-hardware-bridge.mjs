// Verify the optional Frost Buddy hardware bridge event contract.
// Usage: node INJECTIVE-INTEGRATION/verify-hardware-bridge.mjs
import { execFileSync } from 'node:child_process'

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

console.log('\nRaspberry Pi skill router smoke')
const python = process.env.PYTHON || 'python3'
execFileSync(python, ['hardware/frost-buddy/raspi/frost_pi_skill_agent_smoke.py'], { stdio: 'inherit' })

console.log('\nOK Frost Buddy hardware bridge can carry music-agent and Injective chain-dispatch events safely.')
