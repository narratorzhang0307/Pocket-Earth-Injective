// Fast pre-recording check for the Injective demo evidence path.
// Usage: npm run verify:demo

const checks = [
  {
    label: 'public evidence API package',
    moduleUrl: new URL('./verify-chain-evidence-api.mjs', import.meta.url),
  },
  {
    label: 'public evidence contract stays review-safe',
    moduleUrl: new URL('./verify-public-proof-contract.mjs', import.meta.url),
  },
  {
    label: 'GitHub submission repo is public and aligned',
    moduleUrl: new URL('./verify-github-submission.mjs', import.meta.url),
  },
  {
    label: 'public evidence API is tied to the current source commit',
    moduleUrl: new URL('./verify-source-control.mjs', import.meta.url),
  },
  {
    label: 'pitch notes cover deck story and hardware boundaries',
    moduleUrl: new URL('./verify-pitch-notes.mjs', import.meta.url),
  },
  {
    label: 'judge quickstart is public and followable',
    moduleUrl: new URL('./verify-judge-quickstart.mjs', import.meta.url),
  },
  {
    label: 'review brief explains the Injective proof path',
    moduleUrl: new URL('./verify-review-brief.mjs', import.meta.url),
  },
  {
    label: 'demo script stays under 3 minutes',
    moduleUrl: new URL('./verify-demo-duration.mjs', import.meta.url),
  },
  {
    label: 'builderCode API reads agentId 43-47',
    moduleUrl: new URL('./verify-api-list-agents.mjs', import.meta.url),
  },
  {
    label: 'ERC-8004 registry mint events prove agentId 43-47',
    moduleUrl: new URL('./verify-registry-events.mjs', import.meta.url),
  },
  {
    label: 'demo Blockscout links and evidence snippets',
    moduleUrl: new URL('./verify-demo-links.mjs', import.meta.url),
  },
  {
    label: 'recording order Blockscout/API path is followable',
    moduleUrl: new URL('./verify-recording-order.mjs', import.meta.url),
  },
  {
    label: 'plaza flow manifest separates chain discovery and install loop',
    moduleUrl: new URL('./verify-plaza-flow.mjs', import.meta.url),
  },
  {
    label: 'competition alignment maps Injective Nova story to public proof',
    moduleUrl: new URL('./verify-nova-alignment.mjs', import.meta.url),
  },
  {
    label: 'submission links point to the Injective review entry points',
    moduleUrl: new URL('./verify-submission-pack.mjs', import.meta.url),
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
