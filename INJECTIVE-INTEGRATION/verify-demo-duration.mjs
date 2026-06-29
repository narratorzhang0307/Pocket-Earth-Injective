// Verify the Injective demo script stays within the 3-minute demo limit.
// Usage: npm run verify:duration
import { readFile } from 'node:fs/promises'
import { DEMO_VIDEO_LIMIT_SECONDS } from './chain-proof-data.mjs'

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

function toSeconds(timecode) {
  const match = String(timecode).trim().match(/^(\d+):(\d{2})$/)
  if (!match) throw new Error(`invalid timecode: ${timecode}`)
  return Number(match[1]) * 60 + Number(match[2])
}

function parseRange(cell) {
  const match = String(cell).match(/(\d+:\d{2})\s*[–-]\s*(\d+:\d{2})/u)
  if (!match) throw new Error(`invalid time range: ${cell}`)
  return [toSeconds(match[1]), toSeconds(match[2])]
}

const demoScript = await readFile('INJECTIVE-INTEGRATION/DEMO-SCRIPT.md', 'utf8')
const rows = demoScript
  .split('\n')
  .filter((line) => /^\|\s*\d/.test(line) && /\d+:\d{2}\s*[–-]\s*\d+:\d{2}/u.test(line))
  .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))

assertTrue('demo title states 3-minute limit', demoScript.includes('≤ 3 分钟'))
assertTrue('demo summary names 180s limit', demoScript.includes('180s'))
assertEqual('shot row count', rows.length, 7)

let total = 0
let previousEnd = 0
const rowText = []
for (const [index, row] of rows.entries()) {
  const [label, timeRange, visual, narration] = row
  const [start, end] = parseRange(timeRange)
  assertEqual(`shot ${index} starts after previous shot`, start, previousEnd)
  assertTrue(`shot ${index} duration is positive`, end > start)
  total += end - start
  previousEnd = end
  rowText.push(`${label} ${timeRange} ${visual} ${narration}`)
}

const scriptText = rowText.join('\n')
assertEqual('timeline total equals final end', total, previousEnd)
assertTrue('demo duration within Injective 3-minute limit', total <= DEMO_VIDEO_LIMIT_SECONDS)
assertTrue('chain identity appears in first minute', scriptText.includes('agentId 43') && rows[1]?.[1] === '0:15–0:45')
assertTrue('wallet evidence appears before product demo', scriptText.includes('钱包页') || scriptText.includes('钱包'))
assertTrue('public-plaza is in the main product segment', scriptText.includes('public-plaza'))
assertTrue('globe marker segment is present', scriptText.includes('蓝紫色 agent 标记') || scriptText.includes('钉到地球'))
assertTrue('nightly chain dispatch segment is present', scriptText.includes('夜间') && scriptText.includes('链上见闻'))
assertTrue('privacy proof segment is present', scriptText.includes('隐私') && (demoScript.includes('永不上链') || scriptText.includes('证明物')))
assertTrue('fleet API proof names pagination fields', demoScript.includes('`sdk`') && demoScript.includes('`total`') && demoScript.includes('`offset`') && demoScript.includes('`limit`'))
assertTrue('fleet API proof names identity fields', demoScript.includes('`owner`') && demoScript.includes('`wallet`') && demoScript.includes('`identityTuple`') && demoScript.includes('`builderCode`'))
assertTrue('fleet API proof names public card fields', demoScript.includes('`card.tags`') && demoScript.includes('`card.metadata.builderCode`') && demoScript.includes('data URI 公开名片'))

const forbidden = ['INJ_PRIVATE_KEY', 'privateKey', '/Users/zhangcheng/Desktop', 'Pocket-Earth-Plus', 'Sunset-Radio']
for (const item of forbidden) {
  assertTrue(`demo duration script text omits ${item}`, !demoScript.includes(item))
}

console.log(`\nOK demo script totals ${total}s, within the ${DEMO_VIDEO_LIMIT_SECONDS}s Injective demo limit.`)
