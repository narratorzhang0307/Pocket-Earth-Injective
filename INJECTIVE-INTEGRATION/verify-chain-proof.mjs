// Run the read-only Injective proof checks used in the competition demo.
// Usage: npm run verify:injective

const checks = [
  {
    label: 'Frost ERC-8004 identity: agentId 43 + builderCode pocket-earth',
    moduleUrl: new URL('./verify-agent43.mjs', import.meta.url),
  },
  {
    label: 'SocialHandshake event: agentA 43, agentB 44, score 88',
    moduleUrl: new URL('./verify-handshake.mjs', import.meta.url),
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
console.log('- wallet: https://testnet.blockscout.injective.network/address/0x6D5ABec67Ba6387691DB42c48Dd1DA736e1dC934')
console.log('- handshake tx: https://testnet.blockscout.injective.network/tx/0xce15c72f42fb3d8b70acebff11560227613c347a3f28c70b9d885d310515c42e')
