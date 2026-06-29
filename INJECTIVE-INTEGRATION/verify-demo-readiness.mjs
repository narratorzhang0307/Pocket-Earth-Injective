// Fast pre-recording check for the Injective demo evidence path.
// Usage: npm run verify:demo

const checks = [
  {
    label: 'public evidence API package',
    moduleUrl: new URL('./verify-chain-evidence-api.mjs', import.meta.url),
  },
  {
    label: 'builderCode API reads agentId 43-47',
    moduleUrl: new URL('./verify-api-list-agents.mjs', import.meta.url),
  },
  {
    label: 'demo Blockscout links and evidence snippets',
    moduleUrl: new URL('./verify-demo-links.mjs', import.meta.url),
  },
]

console.log('Pocket Earth x Injective demo readiness')
console.log('Mode: read-only, no private key, no browser automation')

for (const [index, check] of checks.entries()) {
  console.log(`\n[${index + 1}/${checks.length}] ${check.label}`)
  await import(check.moduleUrl.href)
}

console.log('\nOK Injective demo evidence path is ready for recording.')
console.log('Next UI check: npm run verify:plaza')
