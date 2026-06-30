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
  '作者方法来源与证据边界',
  '独立开发者 × 小说作者',
  '需求定义、Prompt、交互原型、前后端、云端部署',
  '《收获》《花城》《芙蓉》《天涯》',
  '我还未读懂漫山白雪',
  '文化艺术出版社年度十佳图书',
  '南京大学硕士',
  '国家一级注册建筑师',
  '香港青年文学奖',
  '贺财霖科幻文学奖',
  '读客科幻文学奖',
  '鸟骨',
  '梁晓声青年文学奖',
  '新荷计划',
  '杭州市文联青年文艺人才',
  '浙江青年文学之星',
  '虎嗅认证作者',
  '自媒体逾 4 万关注',
  '建筑/空间背景',
  '个人网站与作品入口',
  '方法来源可解释，工程证据可复验',
  '把地球作为方法',
  'Frost 起源',
  '一条线走完',
  '一条线走完：从票根到链上见闻',
  '票根 / 截图 / 书影音输入',
  '端侧脱敏与结构化',
  '形成公开名片',
  'Frost 出门社交',
  '链上见闻回到产品',
  '随手记一笔，看它怎么长成你的地球',
  '三入口，一颗地球',
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
  'Skills 能力沉淀与依赖边界',
  'visionExtract = visionRead + textExtract',
  'src/app/lib/skills/README.md',
  '领域 agent 不复制读图',
  '路由器不是仓库',
  '三个家目录',
  '单向分层',
  'schema / 噪声词 / keyPath / geo.kind',
  '新增 agent 零改 skill',
  'curatePlaylist',
  'MNN / ollama / stub',
  'MNN(Arm SME2)',
  'manifest / schema / permissions',
  'HUMAN_VOICE',
  'reviewManifest',
  'toManifest',
  'agentGeo',
  'FNV-1a',
  'willEmit',
  'Roblox',
  'Apple',
  'Steamworks',
  '不过度承诺',
  'PPT 第 34 页的反面坐标',
  'friend.tech',
  'Lens',
  'Farcaster',
  'Virtuals',
  'Humane AI Pin',
  'Rabbit r1',
  '三条商业边界',
  '市场边界机器字段',
  'marketLandscapeBoundary',
  'commercialFlywheel',
  'preferredPath',
  'rejectedPaths',
  '纯社交变现',
  '代币优先',
  '硬件收入优先',
  'Agent Plaza 是商业路径的中心',
  'manifest / schema / permissions',
  'hardware/frost-buddy/',
  'Pi 事件适配分支',
  'frost_pi_event_adapter.py',
  'state',
  'tts',
  'display',
  '用户痛点与对症解决',
  '个人记忆缺一根',
  '散落各处',
  '按时间记不牢',
  '记完就沉底',
  '工具不懂你',
  '隐私不敢交',
  '整理太费劲',
  '地球作索引',
  '端云双脑 + 链上身份',
  '能力沉淀 skill',
  '越用越懂你',
  '2124 部影',
  '1055 本书',
  '619 位艺人',
  '536 张照片',
  '只建议不偷改',
  '产品演进路线',
  '链上信誉网络路线',
  'P2 自学',
  'heartbeat 建议引擎',
  '学习型 skill + 安全闸',
  '真 SSE 流式渲染',
  '记忆合并 / 历史检索',
  'NOW 链上身份与握手',
  'P4 Frost Network',
  'roadmapSafetyBoundary',
  'productRoadmap',
  'chainRoadmap',
  'alwaysOn',
  'Pocket Earth 收尾交付',
  'AI 分身公开画像的来源证明',
  'FROST Chronicle',
  '现在能打开',
  '三件交付',
  'Built on Injective',
  'pocketearth.throughtheglass.art/?demo',
  'https://youtu.be/KjmrjTnvVo0',
  'reviewEntrypoints.demo-video',
  'reviewEntrypoints',
  'deliveryChecklist',
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
  'marketLandscapeBoundary',
  'commercialFlywheel',
  'preferredPath',
  'rejectedPaths',
  'Agent Plaza platform path',
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
  'hardwareBridge.serviceBoundary',
  'hardwareNodeServiceReceipt',
  'hardwareBridge.roadmapBoundary',
  'marketLandscapeBoundary',
  'roadmapSafetyBoundary',
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
  'hardwareBridge.serviceBoundary',
  'hardwareBridge.roadmapBoundary',
  'roadmapSafetyBoundary',
  'privacyBoundary.hardware',
]) {
  assertTrue(`DEMO-SCRIPT names hardware proof recording step: ${phrase}`, demoScript.includes(phrase))
}

console.log('\nDemo story spine guard')
for (const phrase of [
  'Pocket Earth 30 秒主线讲法',
  '个人记忆散落各处',
  '按时间记不牢',
  '工具不懂你',
  'Pocket Earth 把真实地点当索引',
  'Frost-agent 端云双脑',
  'Injective 负责公共见证',
  'ERC-8004 `agentId 43`',
  '`agentId 43-47` fleet',
  '同钱包时间线',
  'SocialHandshake',
  '未来 Profile Checkpoint',
  'Frost Edge Node 只消费公开 JSONL 事件',
  'Agent Plaza 承接安装、调用、评价和可选付费回执',
  '未来硬件节点服务也只能走 Agent Plaza 服务回执',
  '不走代币优先或重资本硬件路线',
]) {
  assertTrue(`DEMO-SCRIPT keeps PPT story spine: ${phrase}`, demoScript.includes(phrase))
}

console.log('\nProgress document alignment guard')
for (const phrase of [
  '## 当前状态（2026-06-30）',
  '商业路径边界',
  '市场边界机器字段',
  'marketLandscapeBoundary',
  'commercialFlywheel',
  'rejectedPaths',
  '5.1.1 FROST Chronicle：画像演化史与三件交付',
  'AI 分身公开画像的来源证明',
  '现在能打开',
  '三件交付',
  'Built on Injective',
  '5.3 商业路径与三条边界',
  '不走纯社交变现 / 不走代币优先 / 不走重资本硬件路线',
  'Agent Plaza 是安装、调用、评价和可选付费回执的中心',
  '三条商业边界',
  'manifest / schema / permissions',
  'reviewManifest',
  'toManifest',
  'willEmit',
  '用户痛点与对症解决',
  '散落各处',
  '按时间记不牢',
  '隐私不敢交',
  '只建议不偷改',
  '产品演进路线',
  '链上信誉网络路线',
  'P2 自学',
  'heartbeat 建议引擎',
  '学习型 skill + 安全闸',
  '真 SSE 流式渲染',
  'NOW 链上身份与握手',
  'Frost Network',
  'Pocket Earth Roadmap And Safety Boundary Fast Check',
  'P0 core / P1 compatibility / P2 self-learning',
  'NOW chain identity and handshake / Profile Checkpoint / Agent Plaza receipts / Profile Confidence / P4 Frost Network',
  'raw memories never go on-chain',
  'only identity / versions / receipts / selective proofs go on-chain',
  'Frost Edge Node remains a developer-kit / experience layer',
  'hardwareBridge.serviceBoundary',
  'hardwareNodeServiceReceipt',
  'hardwareBridge.roadmapBoundary',
  'roadmapSafetyBoundary',
  '真实 BLE/TTS/display 驱动仍留在可选 adapter 层',
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
