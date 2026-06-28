// Pocket Earth Frost Buddy hardware bridge.
//
// This module is intentionally small and transport-free: it turns product events
// (music-agent playback, Injective chain dispatch) into newline-delimited JSON
// envelopes that a Raspberry Pi / BLE / serial adapter can forward to a device.
// No private keys, raw profile text, or wallet signing ever belongs here.

export const BRIDGE_VERSION = '0.1.0'

export const EVENT_KIND = Object.freeze({
  MUSIC_NOW_PLAYING: 'music_now_playing',
  CHAIN_DISPATCH: 'chain_dispatch',
  BUDDY_STATUS: 'buddy_status',
})

const SAFE_KEYS = new Set([
  'version',
  'kind',
  'source',
  'state',
  'priority',
  'title',
  'body',
  'speak',
  'agentIds',
  'scanUrl',
  'track',
  'city',
  'createdAt',
])

function text(value, max = 180) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function assertPublicEnvelope(envelope) {
  for (const key of Object.keys(envelope)) {
    if (!SAFE_KEYS.has(key)) throw new Error(`hardware envelope has unsupported key: ${key}`)
  }
  const serialized = JSON.stringify(envelope)
  if (/0x[0-9a-f]{64}/i.test(serialized)) throw new Error('hardware envelope must not contain private keys or bytes32 secrets')
  if (/INJ_PRIVATE_KEY|PRIVATE_KEY|DASHSCOPE_API_KEY|PINATA_JWT/i.test(serialized)) throw new Error('hardware envelope must not contain secret names')
}

export function deriveBuddyState(kind, priority = 'normal') {
  if (priority === 'urgent') return 'attention'
  if (kind === EVENT_KIND.CHAIN_DISPATCH) return 'attention'
  if (kind === EVENT_KIND.MUSIC_NOW_PLAYING) return 'busy'
  return 'idle'
}

export function createMusicNowPlayingEvent(input = {}) {
  const track = input.track || {}
  const city = input.city || {}
  const title = text(input.title || track.title || 'Frost Radio')
  const artist = text(track.artist || input.artist || 'music-agent')
  const cityName = text(city.nameZh || city.name || input.cityName || '')
  const body = text(input.body || [artist, cityName].filter(Boolean).join(' · ') || 'Music agent is playing a spatial track.')
  const envelope = {
    version: BRIDGE_VERSION,
    kind: EVENT_KIND.MUSIC_NOW_PLAYING,
    source: 'music-agent',
    state: deriveBuddyState(EVENT_KIND.MUSIC_NOW_PLAYING),
    priority: 'normal',
    title,
    body,
    speak: text(input.speak || `Frost 正在播放 ${title}${cityName ? `，来自 ${cityName}` : ''}。`, 120),
    track: {
      title,
      artist,
      city: cityName,
    },
    createdAt: input.createdAt || new Date().toISOString(),
  }
  assertPublicEnvelope(envelope)
  return envelope
}

export function createChainDispatchEvent(input = {}) {
  const agentIds = Array.isArray(input.agentIds) ? input.agentIds.map((id) => String(id)).filter(Boolean).slice(0, 12) : []
  const title = text(input.title || 'Injective chain dispatch')
  const count = Number(input.count || agentIds.length || 0)
  const body = text(input.body || `Read ${count} Pocket Earth agents from Injective testnet.`)
  const scanUrl = text(input.scanUrl || 'https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e', 240)
  const envelope = {
    version: BRIDGE_VERSION,
    kind: EVENT_KIND.CHAIN_DISPATCH,
    source: 'injective-public-plaza',
    state: deriveBuddyState(EVENT_KIND.CHAIN_DISPATCH, 'urgent'),
    priority: 'urgent',
    title,
    body,
    speak: text(input.speak || `Frost 在 Injective 链上遇见了 ${count} 个 Pocket Earth agent。`, 120),
    agentIds,
    scanUrl,
    createdAt: input.createdAt || new Date().toISOString(),
  }
  assertPublicEnvelope(envelope)
  return envelope
}

export function toJsonLine(envelope) {
  assertPublicEnvelope(envelope)
  return `${JSON.stringify(envelope)}\n`
}

function demoEvents() {
  return [
    createMusicNowPlayingEvent({
      track: { title: 'Midnight City', artist: 'Frost Radio' },
      city: { nameZh: '布宜诺斯艾利斯' },
      createdAt: '2026-06-29T00:00:00.000Z',
    }),
    createChainDispatchEvent({
      count: 5,
      agentIds: [43, 44, 45, 46, 47],
      body: 'builderCode=pocket-earth returned agentId 43-47 from Injective testnet.',
      createdAt: '2026-06-29T00:00:01.000Z',
    }),
  ]
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] || 'demo'
  if (mode !== 'demo') {
    console.error('Usage: node hardware/frost-buddy/frost-hardware-bridge.mjs demo')
    process.exit(2)
  }
  for (const event of demoEvents()) process.stdout.write(toJsonLine(event))
}
