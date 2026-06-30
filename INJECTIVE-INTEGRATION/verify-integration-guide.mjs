// Guard the integration guide against API and command-manifest drift.
// Usage: npm run verify:integration-guide
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const integrationDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(integrationDir, '..')
const guide = readFileSync(resolve(integrationDir, 'README.md'), 'utf8')
const readme = readFileSync(resolve(projectRoot, 'README.md'), 'utf8')
const demoScript = readFileSync(resolve(integrationDir, 'DEMO-SCRIPT.md'), 'utf8')
const progress = readFileSync(resolve(integrationDir, 'PROGRESS.md'), 'utf8')
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'))

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

function getRunbookBlock() {
  const sectionStart = Math.max(
    guide.indexOf('## 6. 复验路径'),
    guide.indexOf('## 怎么跑'),
  )
  assertTrue('guide has runbook section', sectionStart !== -1)
  const fenceStart = guide.indexOf('```bash', sectionStart)
  const fenceEnd = guide.indexOf('```', fenceStart + '```bash'.length)
  assertTrue('guide has bash runbook fence', fenceStart !== -1 && fenceEnd !== -1)
  return guide.slice(fenceStart, fenceEnd)
}

console.log('Integration guide story spine')
for (const phrase of [
  '## 叙事骨架',
  '## 最终整合版内容映射',
  '逐页覆盖索引',
  '把地球作为方法',
  'Frost 起源',
  '一条线走完',
  '三个入口一颗地球',
  '端云双脑和长期画像',
  'Frost Buddy',
  'agentId 43',
  'builderCode',
  'public-plaza',
  'agent-plaza',
  'Profile Chain',
  'AI 社交与 Profile Chain',
  '链上身份与隐私边界',
  'Agent Plaza 与物理节点',
  '商业判断、差异化、路线图',
  'Agent Personality Provenance',
  'Proof of Memory',
  'recordHash',
  'domainRoot',
  'ProfileRoot',
  'ProfileCheckpoint',
  'Profile Confidence',
  'FrostBus',
  'RunTrace',
  'x-accel-buffering:no',
  'reviewManifest',
  'toManifest',
  'agentGeo',
  'FNV-1a',
  'willEmit',
  'Roblox',
  'Apple',
  'Steamworks',
  '不过度承诺',
  '三条商业边界',
  '纯社交变现',
  '代币优先',
  '硬件收入优先',
  'Agent Plaza 是商业路径的中心',
  'manifest / schema / permissions',
  'hardware/frost-buddy/',
]) {
  assertTrue(`story spine includes ${phrase}`, guide.includes(phrase))
}

console.log('\nIntegration guide API manifest')
const serviceRow = guide.split('\n').find((line) => line.includes('| `/api/injective` 服务'))
assertTrue('implemented capability row exists', Boolean(serviceRow))
for (const tool of [
  'ping',
  'list-agents',
  'get-status',
  'get-reputation',
  'get-chain-evidence',
  'get-agent-proof',
  'get-wallet-timeline',
  'get-hardware-bridge-proof',
  'register',
  'handshake',
]) {
  assertTrue(`implemented capability row names ${tool}`, serviceRow.includes(tool))
}

for (const endpoint of [
  '/api/injective?tool=ping',
  'tool=list-agents&builderCode=pocket-earth',
  'tool=get-status&agentId=N',
  'tool=get-reputation&agentId=N',
  'tool=get-agent-proof&agentId=43',
  'tool=get-chain-evidence',
  'tool=get-wallet-timeline',
  'tool=get-hardware-bridge-proof',
  'tool=register',
  'tool=handshake',
]) {
  assertTrue(`API table contains ${endpoint}`, guide.includes(endpoint))
}

for (const phrase of [
  '{ sdk, agents, total, offset, limit }',
  'owner/wallet/identityTuple/builderCode',
  'card.tags',
  'card.metadata.builderCode',
  'agents[].owner',
  'agents[].wallet',
  'agents[].identityTuple',
  'agents[44-47].card.tags',
  'agents[44-47].card.metadata.builderCode',
]) {
  assertTrue(`integration guide documents fleet proof field ${phrase}`, guide.includes(phrase))
}

for (const phrase of [
  'sdk/total/offset/limit',
  'owner/wallet/identityTuple/builderCode',
  'card.tags',
  'card.metadata.builderCode',
]) {
  assertTrue(`root README documents fleet proof field ${phrase}`, readme.includes(phrase))
}

console.log('\nREADME first-minute evidence guide')
for (const phrase of [
  '### 0. 先看什么',
  'Frost 链上身份',
  '同钱包时间线',
  '产品闭环',
  '隐私边界',
  'get-agent-proof&agentId=43',
  'list-agents&builderCode=pocket-earth',
  'get-wallet-timeline',
  'verify:plaza-flow',
  'verify:public-proof',
  '### 5.1 最终整合版对照与技术深挖',
  'final-ppt-index',
  'Agent Personality Provenance',
  'ProfileCheckpoint',
  'RunTrace',
  'FrostBus',
  'reviewManifest',
  'FNV-1a',
  '### 5.3 商业路径与三条边界',
  '不走纯社交变现',
  '不走代币优先',
  '不走重资本硬件路线',
]) {
  assertTrue(`README evidence guide includes ${phrase}`, readme.includes(phrase))
}

console.log('\nREADME Injective network integration guide')
for (const phrase of [
  '### 1.1 如何集成 Injective 网络',
  '本地画像 -> 公开名片 -> ERC-8004 身份 -> 链上事件 -> 产品读回',
  'buildTastePassport()',
  'IdentityRegistry',
  'confirm:true',
  'get-agent-proof&agentId=43',
  'list-agents&builderCode=pocket-earth',
  'get-wallet-timeline',
  'SocialHandshake',
  'agentGeo',
  'readOnly: true',
  'publicOnly: true',
  'get-hardware-bridge-proof',
  'hardwareBridge.marketBoundary',
]) {
  assertTrue(`README network integration guide includes ${phrase}`, readme.includes(phrase))
}

console.log('\nHardware proof recording guard')
for (const phrase of [
  '/api/injective?tool=get-hardware-bridge-proof',
  '独立 Frost Edge Node 硬件证明 API',
  'public-plaza / agent-plaza smoke',
]) {
  assertTrue(`PROGRESS names standalone hardware proof: ${phrase}`, progress.includes(phrase))
}
for (const phrase of [
  '硬件证明要当作独立镜头',
  '放在钱包时间线之后、plaza smoke 之前',
  'privacyBoundary.hardware',
]) {
  assertTrue(`DEMO-SCRIPT names hardware proof recording step: ${phrase}`, demoScript.includes(phrase))
}

console.log('\nProgress document alignment guard')
for (const phrase of [
  '## 当前状态（2026-06-30）',
  '商业路径边界',
  '5.3 商业路径与三条边界',
  '不走纯社交变现 / 不走代币优先 / 不走重资本硬件路线',
  'Agent Plaza 是安装、调用、评价和可选付费回执的中心',
  '三条商业边界',
  'manifest / schema / permissions',
  'reviewManifest',
  'toManifest',
  'willEmit',
]) {
  assertTrue(`PROGRESS keeps current alignment: ${phrase}`, progress.includes(phrase))
}

console.log('\nPlaza demo split guard')
for (const phrase of [
  'public-plaza 镜头',
  '不要把 public-plaza 说成安装市场',
  'agent-plaza 安装闭环镜头',
  '商业路径一句话',
  'manifest / schema / permissions',
  'Injective chain identity badge',
  'reviewManifest',
  'toManifest',
  'INSTALL -> My Agents -> RUN',
  '长期使用 -> 可信画像 -> Agent 市场',
  'Profile Confidence',
  '不要说成代币优先或硬件收入优先',
  'INSTALL',
  'My Agents',
  'willEmit',
]) {
  assertTrue(`DEMO-SCRIPT names plaza split step: ${phrase}`, demoScript.includes(phrase))
}

console.log('\nIntegration guide runbook')
const runbook = getRunbookBlock()
const numberedSteps = [...runbook.matchAll(/^#\s+(\d+)\.\s+(.+)$/gm)]
if (numberedSteps.length) {
  for (const [index, match] of numberedSteps.entries()) {
    assertEqual(`runbook step ${index + 1}`, Number(match[1]), index + 1)
  }
} else {
  assertTrue('runbook has concise command manifest', runbook.includes('npm install') && runbook.includes('npm run verify:injective'))
}

const documentedScripts = [...new Set(
  [...runbook.matchAll(/npm run (verify:[a-z0-9:-]+)/g)].map((match) => match[1]),
)]
assertTrue('runbook includes verify:integration-guide', documentedScripts.includes('verify:integration-guide'))
assertEqual(
  'package script verify:integration-guide',
  packageJson.scripts?.['verify:integration-guide'],
  'node INJECTIVE-INTEGRATION/verify-integration-guide.mjs',
)
for (const scriptName of documentedScripts) {
  assertTrue(`package script exists for ${scriptName}`, Boolean(packageJson.scripts?.[scriptName]))
}

const standaloneFiles = [...new Set(
  [...runbook.matchAll(/node (INJECTIVE-INTEGRATION\/[a-z0-9-]+\.mjs)/g)].map((match) => match[1]),
)]
for (const file of standaloneFiles) {
  assertTrue(`standalone verification file exists ${file}`, existsSync(resolve(projectRoot, file)))
}

for (const forbidden of [
  'Pocket-Earth-Plus',
  'Sunset-Radio',
  'sunset-radio',
  '/Users/zhangcheng/Desktop/Pocket Earth',
]) {
  assertTrue(`integration guide omits ${forbidden}`, !guide.includes(forbidden))
}

console.log('\nOK integration guide matches the current Injective API and verification manifest.')
