// Run the read-only Injective proof checks used in the competition demo.
// Usage: npm run verify:injective

const checks = [
  {
    label: 'Frost ERC-8004 identity: agentId 43 + builderCode pocket-earth',
    moduleUrl: new URL('./verify-agent43.mjs', import.meta.url),
  },
  {
    label: 'Pocket Earth agent fleet: agentId 43-47 + public data URI cards',
    moduleUrl: new URL('./verify-fleet.mjs', import.meta.url),
  },
  {
    label: 'App /api/injective list-agents route returns agentId 43-47',
    moduleUrl: new URL('./verify-api-list-agents.mjs', import.meta.url),
  },
  {
    label: 'Public chain evidence API is self-contained and safe to show',
    moduleUrl: new URL('./verify-chain-evidence-api.mjs', import.meta.url),
  },
  {
    label: 'Review brief gives judges a concise Injective proof path',
    moduleUrl: new URL('./verify-review-brief.mjs', import.meta.url),
  },
  {
    label: 'Reviewer checklist maps proof steps to public links and commands',
    moduleUrl: new URL('./verify-review-checklist.mjs', import.meta.url),
  },
  {
    label: 'Reviewer API links are complete and reachable on Blockscout',
    moduleUrl: new URL('./verify-review-links.mjs', import.meta.url),
  },
  {
    label: 'Pitch notes cover the deck story, source, and hardware boundary',
    moduleUrl: new URL('./verify-pitch-notes.mjs', import.meta.url),
  },
  {
    label: 'Judge quickstart gives a public one-page review path',
    moduleUrl: new URL('./verify-judge-quickstart.mjs', import.meta.url),
  },
  {
    label: 'App /api/injective ping, get-status, get-reputation read tools',
    moduleUrl: new URL('./verify-api-read-tools.mjs', import.meta.url),
  },
  {
    label: 'App /api/injective write tools stay dry-run without confirmation',
    moduleUrl: new URL('./verify-api-write-boundaries.mjs', import.meta.url),
  },
  {
    label: 'ERC-8004 registry mint events: agentId 43-47',
    moduleUrl: new URL('./verify-registry-events.mjs', import.meta.url),
  },
  {
    label: 'Wallet evidence chain: registration tx + contract code + handshake tx',
    moduleUrl: new URL('./verify-wallet-flow.mjs', import.meta.url),
  },
  {
    label: 'Wallet transaction timeline: blocks + timestamps from Injective RPC',
    moduleUrl: new URL('./verify-chain-timeline.mjs', import.meta.url),
  },
  {
    label: 'SocialHandshake deployer, timing, and source bytecode',
    moduleUrl: new URL('./verify-handshake-contract.mjs', import.meta.url),
  },
  {
    label: 'SocialHandshake hash derivation + calldata + event',
    moduleUrl: new URL('./verify-handshake.mjs', import.meta.url),
  },
  {
    label: 'README, evidence pack, and demo Blockscout links are reachable',
    moduleUrl: new URL('./verify-demo-links.mjs', import.meta.url),
  },
  {
    label: 'Reviewer recording order follows public Blockscout and API evidence',
    moduleUrl: new URL('./verify-recording-order.mjs', import.meta.url),
  },
  {
    label: 'Plaza flow separates public chain discovery from agent install loop',
    moduleUrl: new URL('./verify-plaza-flow.mjs', import.meta.url),
  },
  {
    label: 'Competition alignment maps Injective Nova story to public proof',
    moduleUrl: new URL('./verify-nova-alignment.mjs', import.meta.url),
  },
  {
    label: 'Submission links point to the Injective review entry points',
    moduleUrl: new URL('./verify-submission-pack.mjs', import.meta.url),
  },
  {
    label: 'Frost Buddy hardware bridge: music + Injective chain dispatch events',
    moduleUrl: new URL('./verify-hardware-bridge.mjs', import.meta.url),
  },
]

console.log('Pocket Earth x Injective chain proof')
console.log('Mode: read-only, testnet, no private key required')

for (const [index, check] of checks.entries()) {
  console.log(`\n[${index + 1}/${checks.length}] ${check.label}`)
  await import(check.moduleUrl.href)
}

console.log('\nOK Injective proof suite passed.')
console.log('Evidence:')
console.log('- agentId 43: https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e/instance/43')
console.log('- agent fleet 43-47: https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e')
console.log('- wallet: https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934')
console.log('- registration tx: https://testnet.blockscout.injective.network/tx/0xd2b574dee473a0eecd550535e23445accfd49c326a443796a496ea85d8b10554')
console.log('- fleet registration txs:')
console.log('  - agent 44: https://testnet.blockscout.injective.network/tx/0x02a0590c2f1bc1e475d7cdfb2fa4c3eb5e0b9f7de4ac1f97e66663e0f5a38f44')
console.log('  - agent 45: https://testnet.blockscout.injective.network/tx/0xc161f0df707b1c9b1e29311e944b7c1b40f3d525c9d1cbd2d71c67713333fffe')
console.log('  - agent 46: https://testnet.blockscout.injective.network/tx/0x1bbd3df139b2558ff315d2029f00c01dc881a45542d5854176bbc49e6dfaea4e')
console.log('  - agent 47: https://testnet.blockscout.injective.network/tx/0xada3e082b8e8988e414bcf201739f2a2a3b5fe9c947db71ebe1e7467f3de1a50')
console.log('- SocialHandshake deploy tx: https://testnet.blockscout.injective.network/tx/0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722')
console.log('- handshake tx: https://testnet.blockscout.injective.network/tx/0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6')
