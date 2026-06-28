// Run the read-only Injective proof checks used in the competition demo.
// Usage: npm run verify:injective

const checks = [
  {
    label: 'Frost ERC-8004 identity: agentId 43 + builderCode pocket-earth',
    moduleUrl: new URL('./verify-agent43.mjs', import.meta.url),
  },
  {
    label: 'Pocket Earth agent fleet: agentId 43-47 + builderCode pocket-earth',
    moduleUrl: new URL('./verify-fleet.mjs', import.meta.url),
  },
  {
    label: 'App /api/injective list-agents route returns agentId 43-47',
    moduleUrl: new URL('./verify-api-list-agents.mjs', import.meta.url),
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
    label: 'SocialHandshake deployer, timing, and source bytecode',
    moduleUrl: new URL('./verify-handshake-contract.mjs', import.meta.url),
  },
  {
    label: 'SocialHandshake hash derivation + calldata + event',
    moduleUrl: new URL('./verify-handshake.mjs', import.meta.url),
  },
  {
    label: 'README and demo Blockscout links are reachable',
    moduleUrl: new URL('./verify-demo-links.mjs', import.meta.url),
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
console.log('- fleet registration txs: 0x02a0590c...a38f44, 0xc161f0df...33fffe, 0x1bbd3df1...aea4e, 0xada3e082...e1a50')
console.log('- SocialHandshake deploy tx: https://testnet.blockscout.injective.network/tx/0x6048425a7da4516d5041e815228b0e08099c6f72e00f708bbb2a9363abbfa722')
console.log('- handshake tx: https://testnet.blockscout.injective.network/tx/0x0e597f334c6517b993d61ce9cfe372a88bbbf2c308d181c90bfe23c36a63f2d6')
