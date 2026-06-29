export const INJECTIVE_TESTNET_RPC = 'https://testnet.sentry.chain.json-rpc.injective.network'
export const INJECTIVE_TESTNET_CHAIN_ID = 1439

export const BUILDER_CODE = 'pocket-earth'
export const PROOF_OWNER = '0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934'
export const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e'
export const SOCIAL_HANDSHAKE = '0xe5338a162a44a685201e1f6120b1a851949e3aee'

export const FLEET_AGENTS = [
  { id: 43n, label: 'Frost main identity' },
  { id: 44n, label: 'FROST·拉美文学旅人', requiredTag: '拉美文学' },
  { id: 45n, label: 'FROST·黑色电影迷', requiredTag: '黑色电影' },
  { id: 46n, label: 'FROST·爵士夜行者', requiredTag: '爵士' },
  { id: 47n, label: 'FROST·北欧极光客', requiredTag: '北欧' },
]
export const FLEET_AGENT_IDS = FLEET_AGENTS.map((agent) => Number(agent.id))

export const EVIDENCE_PRIVACY_BOUNDARY = {
  onChain: [
    'ERC-8004 agent identity',
    'public data URI agent card fields',
    'wallet address',
    'SocialHandshake agent ids',
    'profile hash commitment',
    'similarity score',
    'block timestamp',
  ],
  offChain: [
    'raw books, films, music, photos, and mood text',
    'precise location payloads',
    'long-term profile counts',
    'private keys and secret env values',
  ],
  writeBoundary: 'testnet-only writes require a server-side private key and explicit confirm:true; otherwise register/handshake stay dry-run',
}

export const TIMELINE_EVENTS = [
  { label: 'Frost main identity registration', role: 'agentId 43', hash: '0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554', to: IDENTITY_REGISTRY, blockNumber: 131678496n, timestamp: '2026-06-27T01:46:30.000Z' },
  { label: 'SocialHandshake deployment', role: 'contract deployment', hash: '0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722', to: null, contractAddress: SOCIAL_HANDSHAKE, blockNumber: 131678987n, timestamp: '2026-06-27T01:53:16.000Z' },
  { label: 'Fleet agent registration', role: 'agentId 44', hash: '0x02a0590c2f1bc1e475d7cdfb2fa4c3eb5e0b9f7de4ac1f97e66663e0f5a38f44', to: IDENTITY_REGISTRY, blockNumber: 131679781n, timestamp: '2026-06-27T02:04:14.000Z' },
  { label: 'Fleet agent registration', role: 'agentId 45', hash: '0xc161f0df707b1c9b1e29311e944b7c1b40f3d525c9d1cbd2d71c67713333fffe', to: IDENTITY_REGISTRY, blockNumber: 131679930n, timestamp: '2026-06-27T02:06:17.000Z' },
  { label: 'Fleet agent registration', role: 'agentId 46', hash: '0x1bbd3df139b2558ff315d2029f00c01dc881a45542d5854176bbc49e6dfaea4e', to: IDENTITY_REGISTRY, blockNumber: 131679941n, timestamp: '2026-06-27T02:06:26.000Z' },
  { label: 'Fleet agent registration', role: 'agentId 47', hash: '0xada3e082b8e8988e414bcf201739f2a2a3b5fe9c947db71ebe1e7467f3de1a50', to: IDENTITY_REGISTRY, blockNumber: 131679948n, timestamp: '2026-06-27T02:06:32.000Z' },
  { label: 'Real SocialHandshake', role: 'agentId 43 <-> 44', hash: '0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6', to: SOCIAL_HANDSHAKE, blockNumber: 131869118n, timestamp: '2026-06-28T21:34:21.000Z' },
]

export function sameAddress(a, b) {
  return String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase()
}

export function scanUrlForTx(hash) {
  return `https://testnet.blockscout.injective.network/tx/${hash}`
}

export function scanUrlForAddress(address) {
  return `https://testnet.blockscout.injective.network/address/${address}`
}

export function scanUrlForAgent(agentId) {
  return `https://testnet.blockscout.injective.network/token/${IDENTITY_REGISTRY}/instance/${agentId}`
}

export function scanUrlForRegistry() {
  return `https://testnet.blockscout.injective.network/token/${IDENTITY_REGISTRY}`
}
