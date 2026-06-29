// Verify the pitch notes stay aligned with the Injective integration story.
// Usage: npm run verify:pitch
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { handleInjective } from '../injective-service.mjs'

const PITCH_FILE = 'INJECTIVE-INTEGRATION/PITCH-NOTES.md'
const RASPBERRY_PI_SOURCE = 'https://data.fca.org.uk/artefacts/NSM/RNS/5182805.html'

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

async function callEvidenceApi() {
  let statusCode = 0
  let body = ''
  const req = { method: 'GET' }
  const res = {
    writeHead(code) { statusCode = code },
    end(chunk) { body += chunk || '' },
  }
  await handleInjective(req, res, new URL('http://localhost/api/injective?tool=get-chain-evidence'), { network: 'testnet' })
  assertEqual('evidence HTTP status', statusCode, 200)
  const payload = JSON.parse(body)
  assertTrue('evidence has no api error', !payload.error)
  return payload
}

async function assertSourceReachable() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(RASPBERRY_PI_SOURCE, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Pocket-Earth-Injective-verify' },
    })
    assertEqual('Raspberry Pi source HTTP status', res.status, 200)
    const text = await res.text()
    assertTrue('Raspberry Pi source mentions 60 million units', /60\s+million/i.test(text))
  } finally {
    clearTimeout(timer)
  }
}

const pitch = readFileSync(PITCH_FILE, 'utf8')
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const evidence = await callEvidenceApi()

console.log('\nPitch notes structure')
assertTrue('pitch notes file exists', existsSync(PITCH_FILE))
assertTrue('pitch has one-line recommendation', pitch.includes('## 建议放在 PPT 的一句话'))
assertTrue('pitch has slide outline', pitch.includes('## PPT 页内建议'))
assertTrue('pitch has speaking boundaries', pitch.includes('## 讲法边界'))
assertTrue('pitch has cited facts', pitch.includes('## 可引用的事实'))

console.log('\nInjective story anchors')
for (const snippet of [
  'Injective ERC-8004',
  'agentId 43-47',
  'Blockscout',
  'SocialHandshake',
  'public-plaza',
  'Nightly Chain Dispatch',
  'npm run verify:injective',
  'npm run verify:pitch',
]) {
  assertTrue(`pitch mentions ${snippet}`, pitch.includes(snippet))
}

console.log('\nHardware boundary anchors')
for (const snippet of [
  'Raspberry Pi',
  'BLE',
  'TTS',
  'music-agent',
  'chain_dispatch',
  'npm run verify:hardware',
  '不要说成已量产',
  '不接触私钥',
  '画像原文',
  '精确坐标',
  '名片哈希',
]) {
  assertTrue(`pitch hardware boundary mentions ${snippet}`, pitch.includes(snippet))
}
assertTrue('hardware bridge README exists', existsSync(resolve('hardware/frost-buddy/README.md')))
assertTrue('raspi skill router exists', existsSync(resolve('hardware/frost-buddy/raspi/frost_pi_skill_agent.py')))
assertTrue('raspi smoke exists', existsSync(resolve('hardware/frost-buddy/raspi/frost_pi_skill_agent_smoke.py')))

console.log('\nDelivery contract wiring')
assertEqual('verify:pitch script', packageJson.scripts?.['verify:pitch'], 'node INJECTIVE-INTEGRATION/verify-pitch-notes.mjs')
assertEqual('evidence pitch command', evidence.verification?.pitchNotes, 'npm run verify:pitch')
assertEqual('delivery pitch local check', evidence.deliveryChecklist?.find((item) => item.key === 'pitch-deck-notes')?.localCheck, 'npm run verify:pitch')

console.log('\nSource and leak guard')
assertTrue('pitch cites Raspberry Pi source URL', pitch.includes(RASPBERRY_PI_SOURCE))
await assertSourceReachable()
for (const forbidden of [
  'INJ_PRIVATE_KEY',
  'privateKey',
  'profileHashA',
  'profileHashB',
  'Pocket-Earth-Plus',
  'Sunset-Radio',
  'sunset-radio',
  '/Users/zhangcheng/Desktop',
]) {
  assertTrue(`pitch omits ${forbidden}`, !pitch.includes(forbidden))
}

console.log('\nOK pitch notes are aligned with the Injective integration and safe for the deck.')
