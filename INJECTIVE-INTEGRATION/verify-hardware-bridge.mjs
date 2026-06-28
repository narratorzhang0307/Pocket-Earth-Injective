// Verify the optional Frost Buddy hardware bridge event contract.
// Usage: node INJECTIVE-INTEGRATION/verify-hardware-bridge.mjs
import {
  EVENT_KIND,
  createChainDispatchEvent,
  createMusicNowPlayingEvent,
  toJsonLine,
} from '../hardware/frost-buddy/frost-hardware-bridge.mjs'

const REGISTRY_URL = 'https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e'

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
  count: 5,
  agentIds: [43, 44, 45, 46, 47],
  body: 'builderCode=pocket-earth returned agentId 43-47 from Injective testnet.',
  scanUrl: REGISTRY_URL,
  createdAt: '2026-06-29T00:00:01.000Z',
})

assertEqual('chain hardware event kind', chain.kind, EVENT_KIND.CHAIN_DISPATCH)
assertEqual('chain hardware event source', chain.source, 'injective-public-plaza')
assertEqual('chain hardware buddy state', chain.state, 'attention')
assertEqual('chain hardware priority', chain.priority, 'urgent')
assertEqual('chain hardware scanUrl', chain.scanUrl, REGISTRY_URL)
assertEqual('chain hardware fleet ids', chain.agentIds.join(','), '43,44,45,46,47')
assertTrue('chain hardware speech line', chain.speak.includes('Injective 链上'))
assertNoSecrets('chain hardware event', chain)

const jsonLine = toJsonLine(chain)
assertTrue('hardware bridge emits JSONL', jsonLine.endsWith('\n'))
assertEqual('hardware JSONL round-trip kind', JSON.parse(jsonLine).kind, EVENT_KIND.CHAIN_DISPATCH)

console.log('\nOK Frost Buddy hardware bridge can carry music-agent and Injective chain-dispatch events safely.')
