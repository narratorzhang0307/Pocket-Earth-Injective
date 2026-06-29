// Verify the reviewer-facing checklist is complete and wired to existing proof commands.
// Usage: node INJECTIVE-INTEGRATION/verify-review-checklist.mjs
import { access, readFile } from 'node:fs/promises'
import { BUILDER_CODE, PROOF_OWNER, REVIEW_CHECKLIST, REVIEW_LINKS } from './chain-proof-data.mjs'

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function assertEqual(label, actual, expected) {
  if (String(actual) !== String(expected)) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

async function fileExists(path) {
  await access(path)
  return true
}

async function assertMachineCheck(command, scripts) {
  for (const part of command.split(/\s*&&\s*/)) {
    const trimmed = part.trim()
    if (trimmed.startsWith('npm run ')) {
      const scriptName = trimmed.slice('npm run '.length).trim()
      assertTrue(`machine check npm script ${scriptName}`, Boolean(scripts[scriptName]))
      continue
    }
    if (trimmed.startsWith('node ')) {
      const file = trimmed.slice('node '.length).trim().split(/\s+/)[0]
      assertTrue(`machine check node file ${file}`, await fileExists(file))
      continue
    }
    if (trimmed.startsWith('python3 ')) {
      const file = trimmed.slice('python3 '.length).trim().split(/\s+/)[0]
      assertTrue(`machine check python file ${file}`, await fileExists(file))
      continue
    }
    throw new Error(`unsupported machine check command: ${trimmed}`)
  }
}

const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
const reviewLinkKeys = new Set(REVIEW_LINKS.map((link) => link.key))
const checklistKeys = new Set(REVIEW_CHECKLIST.map((item) => item.key))

assertEqual('review link key count', reviewLinkKeys.size, REVIEW_LINKS.length)
assertEqual('review checklist key count', checklistKeys.size, REVIEW_CHECKLIST.length)
assertEqual('review checklist count', REVIEW_CHECKLIST.length, 7)

for (const required of [
  'erc8004-identity',
  'fleet-builder-code',
  'registry-mint-events',
  'wallet-timeline',
  'social-handshake',
  'privacy-boundary',
  'product-demo-loop',
]) {
  assertTrue(`review checklist includes ${required}`, checklistKeys.has(required))
}

for (const item of REVIEW_CHECKLIST) {
  assertTrue(`${item.key} label`, Boolean(item.label))
  assertTrue(`${item.key} evidence`, Boolean(item.evidence))
  assertTrue(`${item.key} primary link exists`, reviewLinkKeys.has(item.primaryLinkKey))
  assertTrue(`${item.key} pass criteria array`, Array.isArray(item.passCriteria))
  assertTrue(`${item.key} pass criteria count`, item.passCriteria.length >= 2)
  assertTrue(`${item.key} machine check`, Boolean(item.machineCheck))
  await assertMachineCheck(item.machineCheck, packageJson.scripts || {})
}

const checklistText = JSON.stringify(REVIEW_CHECKLIST)
assertTrue('checklist mentions owner wallet', checklistText.includes(PROOF_OWNER))
assertTrue('checklist mentions builderCode', checklistText.includes(BUILDER_CODE))
assertTrue('checklist names registryMintEvents', checklistText.includes('registryMintEvents'))
assertTrue('checklist names zero-address mint proof', checklistText.includes('zero address'))
for (const forbidden of ['INJ_PRIVATE_KEY', 'privateKey', 'profileHashA', 'profileHashB']) {
  assertTrue(`checklist omits ${forbidden}`, !checklistText.includes(forbidden))
}

console.log('\nOK reviewer checklist is wired to public proof links and existing verification commands.')
