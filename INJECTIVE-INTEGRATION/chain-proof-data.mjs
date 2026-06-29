export const INJECTIVE_TESTNET_RPC = 'https://testnet.sentry.chain.json-rpc.injective.network'
export const INJECTIVE_TESTNET_CHAIN_ID = 1439

export const BUILDER_CODE = 'pocket-earth'
export const SUBMISSION_REPOSITORY_URL = 'https://github.com/narratorzhang0307/Pocket-Earth-Injective'
export const LIVE_DEMO_URL = 'https://pocketearth.throughtheglass.art/?demo'
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

export const COMPETITION_ALIGNMENT = [
  {
    key: 'ai-social',
    contestSignal: 'AI social agent experience',
    projectSignal: 'Frost carries a public Taste Passport into public-plaza, reads on-chain agents, ranks taste overlap, pins agent markers, and returns a Nightly Chain Dispatch.',
    evidence: `public-plaza reads /api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47 and verifies agentId 43-47.`,
    machineCheck: 'npm run verify:plaza-flow',
  },
  {
    key: 'injective-execution-layer',
    contestSignal: 'Injective as the on-chain execution layer for agents',
    projectSignal: 'Pocket Earth uses Injective testnet ERC-8004 identity, builderCode pocket-earth, RPC transaction timelines, and a real SocialHandshake contract event.',
    evidence: `agentId 43-47 are registered in IdentityRegistry ${IDENTITY_REGISTRY}; SocialHandshake is deployed at ${SOCIAL_HANDSHAKE}.`,
    machineCheck: 'npm run verify:injective',
  },
  {
    key: 'agent-physical-world',
    contestSignal: 'Agent x physical-world product surface',
    projectSignal: 'Frost Buddy keeps a Raspberry Pi / BLE / TTS event bridge so music-agent events and Injective chain dispatches can be spoken by a physical Frost device.',
    evidence: 'hardware/frost-buddy emits safe JSONL events and the Pi skill router maps chain_dispatch and music requests without private keys.',
    machineCheck: 'npm run verify:hardware',
  },
  {
    key: 'privacy-first-public-proof',
    contestSignal: 'Demo-ready product with verifiable public evidence',
    projectSignal: 'The review path exposes public-only chain evidence while raw books, films, music, photos, mood text, precise locations, and secret env values stay off-chain.',
    evidence: '/api/injective?tool=get-chain-evidence returns readOnly, publicOnly evidence with reviewBrief, reviewLinks, reviewChecklist, submissionChecklist, recordingOrder, privacyBoundary, and plazaFlow.',
    machineCheck: 'npm run verify:evidence',
  },
]

export const REVIEW_BRIEF = {
  title: 'Frost Passport on Injective',
  oneLiner: 'Pocket Earth gives each Frost agent an Injective ERC-8004 identity, lets it meet other on-chain agents through public-plaza, and keeps private memories off-chain.',
  injectiveCore: [
    {
      key: 'erc8004-identity',
      label: 'ERC-8004 agent identity',
      proof: `agentId 43 is owned by ${PROOF_OWNER} and uses builderCode ${BUILDER_CODE}.`,
      linkKey: 'frost-agent-43',
      machineCheck: 'node INJECTIVE-INTEGRATION/verify-agent43.mjs',
    },
    {
      key: 'agent-fleet',
      label: 'Builder-scoped agent fleet',
      proof: 'agentId 43-47 are readable from Injective testnet and expose only public data URI card fields.',
      linkKey: 'identity-registry',
      machineCheck: 'node INJECTIVE-INTEGRATION/verify-api-list-agents.mjs',
    },
    {
      key: 'social-handshake',
      label: 'On-chain social proof',
      proof: `SocialHandshake ${SOCIAL_HANDSHAKE} records agent ids, non-zero profile commitments, score, and block timestamp.`,
      linkKey: 'real-handshake-tx',
      machineCheck: 'node INJECTIVE-INTEGRATION/verify-handshake.mjs',
    },
    {
      key: 'product-loop',
      label: 'Product loop reads the chain',
      proof: 'public-plaza reads the builderCode fleet, ranks taste overlap, pins agent markers, and returns a Nightly Chain Dispatch.',
      linkKey: 'frost-agent-43',
      machineCheck: 'npm run verify:plaza',
    },
  ],
  contestFit: [
    {
      theme: 'AI social',
      alignmentKey: 'ai-social',
      why: 'Frost is a digital agent persona that meets other agents through public chain identity and taste overlap.',
    },
    {
      theme: 'Agent infrastructure',
      alignmentKey: 'injective-execution-layer',
      why: 'Injective testnet is the identity, wallet timeline, contract, and proof layer instead of a decorative badge.',
    },
    {
      theme: 'Agent x physical world',
      alignmentKey: 'agent-physical-world',
      why: 'Frost Buddy keeps a Raspberry Pi / BLE / TTS bridge for music-agent events and Injective chain dispatches.',
    },
  ],
  reviewerPath: [
    { step: 1, label: 'Open agentId 43', linkKey: 'frost-agent-43', verifies: 'Frost has a public ERC-8004 identity on Injective testnet.' },
    { step: 2, label: 'Open owner wallet', linkKey: 'owner-wallet', verifies: 'Registration, fleet, contract deployment, and handshake belong to the same wallet.' },
    { step: 3, label: 'Read public evidence API', submissionKey: 'chain-evidence-api', verifies: 'The product exposes the same public facts through /api/injective.' },
    { step: 4, label: 'Run demo smoke', command: 'npm run verify:demo', verifies: 'The recording path, Blockscout links, plaza split, alignment, submission entries, and submission checklist still pass.' },
  ],
  privacyLine: 'Only public proofs go on-chain: identities, card fields, wallet/contract addresses, profile commitments, similarity score, and timestamps. Raw media, mood text, precise locations, profile counts, and secret env values stay off-chain.',
}

export const PLAZA_DEMO_FLOW = [
  {
    key: 'public-plaza',
    purpose: 'chain social discovery',
    entry: 'AGENTS > PLAZA > public-plaza > RUN',
    chainRead: '/api/injective?tool=list-agents&builderCode=pocket-earth&limit=5&top=47',
    verifies: 'reads agentId 43-47 from Injective testnet, ranks taste overlap, pins agent markers, and creates Nightly Chain Dispatch',
    smoke: 'INJECTIVE-INTEGRATION/verify-plaza.mjs',
  },
  {
    key: 'agent-plaza',
    purpose: 'agent marketplace and install loop',
    entry: 'AGENTS > PLAZA > agent-plaza',
    chainRead: 'shows Injective chain identity badge for on-chain capable agents',
    verifies: 'opens the agent catalog, keeps the boundary strip visible, installs cafe-map through the manifest review gate, and shows it in My Agents',
    smoke: 'INJECTIVE-INTEGRATION/verify-space-plaza.mjs + INJECTIVE-INTEGRATION/verify-plaza-install.mjs',
  },
]

export const SUBMISSION_LINKS = [
  { key: 'github-repo', label: 'GitHub repository for review', type: 'repository', url: SUBMISSION_REPOSITORY_URL },
  { key: 'live-demo', label: 'Live demo with demo profile seed', type: 'demo', url: LIVE_DEMO_URL },
  { key: 'chain-evidence-api', label: 'Public chain evidence API', type: 'api', path: '/api/injective?tool=get-chain-evidence' },
  { key: 'agent-fleet-api', label: 'Read agentId 43-47 by builderCode', type: 'api', path: `/api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47` },
  { key: 'wallet-timeline-api', label: 'Read wallet transaction timeline from RPC', type: 'api', path: '/api/injective?tool=get-wallet-timeline' },
]

export const SUBMISSION_CHECKLIST = [
  {
    key: 'public-github-readme',
    requirement: 'Public GitHub repository with a complete README',
    status: 'ready',
    evidence: 'README.md opens with the Injective submission story and links to the evidence pack, demo script, and integration guide.',
    localCheck: 'npm run verify:submission',
    linkKey: 'github-repo',
  },
  {
    key: 'injective-integration',
    requirement: 'Project is deployed/integrated with Injective',
    status: 'ready',
    evidence: 'agentId 43-47, SocialHandshake, wallet timeline, and public API read paths are verifiable on Injective testnet.',
    localCheck: 'npm run verify:injective',
    linkKey: 'chain-evidence-api',
  },
  {
    key: 'demo-video-script',
    requirement: 'Demo video under 3 minutes that shows core features',
    status: 'ready-for-recording',
    evidence: 'DEMO-SCRIPT.md is structured as a 175-second recording path: agentId 43, wallet, public-plaza, globe markers, nightly dispatch, and privacy proof.',
    localCheck: 'npm run verify:demo',
    linkKey: 'live-demo',
  },
  {
    key: 'pitch-deck-notes',
    requirement: 'Pitch deck covers vision, technical approach, and future plan',
    status: 'ready-for-deck',
    evidence: 'INJECTIVE-INTEGRATION/PITCH-NOTES.md gives the hardware/Frost Buddy positioning and boundaries; CHAIN-EVIDENCE.md supplies the on-chain proof slides.',
    localCheck: 'npm run verify:brief',
    linkKey: 'github-repo',
  },
  {
    key: 'public-review-apis',
    requirement: 'Judges can reproduce public evidence without private keys',
    status: 'ready',
    evidence: 'get-chain-evidence, list-agents by builderCode, and get-wallet-timeline are read-only and publicOnly/testnet-scoped.',
    localCheck: 'npm run verify:evidence',
    linkKey: 'chain-evidence-api',
  },
]

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

export const REVIEW_LINKS = [
  { key: 'frost-agent-43', label: 'Frost main identity #43', type: 'agent', url: scanUrlForAgent(43) },
  { key: 'owner-wallet', label: 'Owner wallet evidence chain', type: 'wallet', url: scanUrlForAddress(PROOF_OWNER) },
  { key: 'identity-registry', label: 'ERC-8004 IdentityRegistry contract', type: 'contract', url: scanUrlForAddress(IDENTITY_REGISTRY) },
  { key: 'social-handshake', label: 'SocialHandshake contract', type: 'contract', url: scanUrlForAddress(SOCIAL_HANDSHAKE) },
  { key: 'frost-registration-tx', label: 'Frost identity registration transaction', type: 'transaction', txHash: TIMELINE_EVENTS[0].hash, url: scanUrlForTx(TIMELINE_EVENTS[0].hash) },
  { key: 'handshake-deployment-tx', label: 'SocialHandshake deployment transaction', type: 'transaction', txHash: TIMELINE_EVENTS[1].hash, url: scanUrlForTx(TIMELINE_EVENTS[1].hash) },
  { key: 'real-handshake-tx', label: 'Real SocialHandshake 43 <-> 44 transaction', type: 'transaction', txHash: TIMELINE_EVENTS.at(-1).hash, url: scanUrlForTx(TIMELINE_EVENTS.at(-1).hash) },
]

export const REVIEW_CHECKLIST = [
  {
    key: 'erc8004-identity',
    label: 'ERC-8004 identity ownership',
    evidence: 'Open the Frost agentId 43 Blockscout instance page.',
    primaryLinkKey: 'frost-agent-43',
    passCriteria: [
      `agentId 43 is owned by ${PROOF_OWNER}`,
      `builderCode equals ${BUILDER_CODE}`,
      `IdentityRegistry equals ${IDENTITY_REGISTRY}`,
    ],
    machineCheck: 'node INJECTIVE-INTEGRATION/verify-agent43.mjs',
  },
  {
    key: 'fleet-builder-code',
    label: 'Pocket Earth agent fleet',
    evidence: `Read /api/injective?tool=list-agents&builderCode=${BUILDER_CODE}&limit=5&top=47.`,
    primaryLinkKey: 'identity-registry',
    passCriteria: [
      'agentId 43-47 are returned from Injective testnet',
      `each returned agent has builderCode ${BUILDER_CODE}`,
      'public data URI cards contain only type, name, description, tags, and metadata',
    ],
    machineCheck: 'node INJECTIVE-INTEGRATION/verify-api-list-agents.mjs',
  },
  {
    key: 'wallet-timeline',
    label: 'Wallet evidence chain',
    evidence: 'Open the owner wallet page or call /api/injective?tool=get-wallet-timeline.',
    primaryLinkKey: 'owner-wallet',
    passCriteria: [
      'registration, SocialHandshake deployment, fleet registration, and handshake txs are in block order',
      `all timeline txs are sent by ${PROOF_OWNER}`,
      'RPC block timestamps match the public timeline',
    ],
    machineCheck: 'node INJECTIVE-INTEGRATION/verify-chain-timeline.mjs',
  },
  {
    key: 'social-handshake',
    label: 'Real SocialHandshake proof',
    evidence: 'Open the real SocialHandshake transaction and deployed contract pages.',
    primaryLinkKey: 'real-handshake-tx',
    passCriteria: [
      'call and event decode to agentA 43, agentB 44, score 88',
      'two non-zero bytes32 Taste Passport commitments are recorded',
      'deployed runtime bytecode matches the local SocialHandshake.sol source',
    ],
    machineCheck: 'node INJECTIVE-INTEGRATION/verify-handshake.mjs && node INJECTIVE-INTEGRATION/verify-handshake-contract.mjs',
  },
  {
    key: 'privacy-boundary',
    label: 'Public-only privacy boundary',
    evidence: 'Inspect /api/injective?tool=get-chain-evidence.',
    primaryLinkKey: 'owner-wallet',
    passCriteria: [
      'evidence package is marked readOnly and publicOnly',
      'raw books, films, music, photos, mood text, precise locations, and private keys stay off-chain',
      'write tools stay dry-run without server key plus explicit confirm:true',
    ],
    machineCheck: 'node INJECTIVE-INTEGRATION/verify-api-write-boundaries.mjs',
  },
  {
    key: 'product-demo-loop',
    label: 'Product demo loop',
    evidence: 'Run the plaza smoke after chain evidence is ready.',
    primaryLinkKey: 'frost-agent-43',
    passCriteria: [
      'public-plaza reads agentId 43-47 from Injective',
      'agent markers are pinned to the globe',
      'agent-plaza keeps the install loop demonstrable',
    ],
    machineCheck: 'npm run verify:plaza',
  },
]
