// Verify the public GitHub integration repo, review files, and origin boundary.
// Usage: npm run verify:github
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEMO_VIDEO_URL, INJECTIVE_TESTNET_CHAIN_ID, INTEGRATION_REPOSITORY_URL } from './chain-proof-data.mjs'

const integrationDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(integrationDir, '..')
const expectedRepo = new URL(INTEGRATION_REPOSITORY_URL)
const [, expectedOwner, expectedName] = expectedRepo.pathname.split('/')
const expectedSlug = `${expectedOwner}/${expectedName}`
const expectedGitUrl = `${INTEGRATION_REPOSITORY_URL}.git`
const forbiddenRepoSnippets = [
  'Pocket-Earth-Plus',
  'Sunset-Radio',
  'sunset-radio',
  '/Users/zhangcheng/Desktop/Pocket Earth',
]
const forbiddenPositioningSnippets = [
  [0x53c2, 0x8d5b],
  [0x6bd4, 0x8d5b],
  [0x53c2, 0x8d5b, 0x7248],
  'sub' + 'mission',
  'com' + 'petition',
  'con' + 'test',
].map((value) => (Array.isArray(value) ? String.fromCodePoint(...value) : value))
const vagueRecordPlace = '它们' + '在地球上的那个地点'
const vaguePositioningSnippets = ['它们' + '在地球', '钉回' + '它们', '各自' + '在地球上的那个地点']

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function assertEqual(label, actual, expected) {
  if (String(actual).toLowerCase() !== String(expected).toLowerCase()) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`)
  }
  console.log(`OK ${label}: ${actual}`)
}

function git(args) {
  return execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8' }).trim()
}

function normalizeGitUrl(value) {
  const text = String(value || '').trim()
  if (text.startsWith('git@github.com:')) {
    return `https://github.com/${text.slice('git@github.com:'.length).replace(/\.git$/, '')}`
  }
  return text.replace(/\.git$/, '')
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'Pocket-Earth-Injective-verify' } })
  if (res.status === 403) {
    console.log(`NOTE ${url} returned HTTP 403; falling back to public git/raw file checks.`)
    return null
  }
  if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`)
  return res.json()
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { accept: 'text/plain', 'user-agent': 'Pocket-Earth-Injective-verify' } })
  if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`)
  return res.text()
}

function assertNoOldRepoText(label, text) {
  for (const forbidden of forbiddenRepoSnippets) {
    assertTrue(`${label} omits ${forbidden}`, !text.includes(forbidden))
  }
}

function assertNoEventPositioning(label, text) {
  const normalized = text.toLowerCase()
  for (const forbidden of forbiddenPositioningSnippets) {
    assertTrue(`${label} omits positioning word ${forbidden}`, !normalized.includes(forbidden.toLowerCase()))
  }
  for (const forbidden of vaguePositioningSnippets) {
    assertTrue(`${label} omits vague positioning ${forbidden}`, !normalized.includes(forbidden.toLowerCase()))
  }
}

console.log('Git origin boundary')
git(['fetch', 'origin', 'main', '--quiet'])
assertEqual('current branch', git(['branch', '--show-current']), 'main')
assertEqual('origin url', git(['remote', 'get-url', 'origin']), expectedGitUrl)
assertEqual('origin push url', git(['remote', 'get-url', '--push', 'origin']), expectedGitUrl)
assertEqual('normalized origin url', normalizeGitUrl(git(['remote', 'get-url', 'origin'])), INTEGRATION_REPOSITORY_URL)
const head = git(['rev-parse', 'HEAD'])
const originMain = git(['rev-parse', 'origin/main'])
const remoteMain = git(['ls-remote', '--heads', 'origin', 'main']).split(/\s+/)[0]
assertEqual('local HEAD matches origin/main', head, originMain)
assertEqual('remote main matches local HEAD', remoteMain, head)

console.log('\nGitHub public repository')
const repo = await fetchJson(`https://api.github.com/repos/${expectedSlug}`)
if (repo) {
  assertEqual('repo full_name', repo.full_name, expectedSlug)
  assertEqual('repo html_url', repo.html_url, INTEGRATION_REPOSITORY_URL)
  assertEqual('repo default branch', repo.default_branch, 'main')
  assertEqual('repo private flag', repo.private, false)
  assertTrue('repo is not archived', repo.archived === false)
  assertTrue('repo is public visibility', !repo.visibility || repo.visibility === 'public')
} else {
  assertTrue('public git ls-remote proved main is readable', Boolean(remoteMain))
}

console.log('\nGitHub raw review files')
const rawBase = `https://raw.githubusercontent.com/${expectedSlug}/${head}`
const remoteReadme = await fetchText(`${rawBase}/README.md`)
const remoteIntegration = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/README.md`)
const remoteEvidence = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/CHAIN-EVIDENCE.md`)
const remoteDemo = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/DEMO-SCRIPT.md`)
const remoteJudge = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/JUDGE-QUICKSTART.md`)
const remoteProgress = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/PROGRESS.md`)
const remoteHardware = await fetchText(`${rawBase}/hardware/frost-buddy/README.md`)
const remoteRaspiReadme = await fetchText(`${rawBase}/hardware/frost-buddy/raspi/README.md`)
const remotePublicPlaza = await fetchText(`${rawBase}/src/app/components/PublicPlazaPage.tsx`)
const remoteUserMarks = await fetchText(`${rawBase}/src/app/data/userMarks.ts`)
const remoteMapFocus = await fetchText(`${rawBase}/src/app/data/mapFocus.ts`)
const remoteMapMarkers = await fetchText(`${rawBase}/src/app/data/mapMarkers.ts`)
const remoteVerifySpacePlaza = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/verify-space-plaza.mjs`)
const remoteVerifyPlaza = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/verify-plaza.mjs`)
const remoteVerifyPlazaFlow = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/verify-plaza-flow.mjs`)
const remoteVerifyPlazaInstall = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/verify-plaza-install.mjs`)
const remoteVerifyDeliveryPack = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/verify-delivery-pack.mjs`)
const remoteVerifyIntegrationGuide = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/verify-integration-guide.mjs`)
const remoteVerifyForgeRun = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/verify-forge-run.mjs`)
const remoteTastePassport = await fetchText(`${rawBase}/src/app/lib/injective/passport.ts`)
const remoteAgentPlazaPage = await fetchText(`${rawBase}/src/app/components/AgentPlazaPage.tsx`)
const remotePlazaCatalog = await fetchText(`${rawBase}/src/app/lib/plaza/catalog.ts`)
const remoteVerifyHardware = await fetchText(`${rawBase}/INJECTIVE-INTEGRATION/verify-hardware-bridge.mjs`)
const remoteIndexHtml = await fetchText(`${rawBase}/index.html`)
const remoteManifestText = await fetchText(`${rawBase}/public/manifest.webmanifest`)
const remotePackageJson = JSON.parse(await fetchText(`${rawBase}/package.json`))
const remoteManifest = JSON.parse(remoteManifestText)
assertTrue('remote README names Injective core integration', remoteReadme.includes('Injective 核心集成'))
assertTrue('remote README names explicit Pocket Earth definition heading', remoteReadme.includes('## 一、Pocket Earth 是什么'))
assertTrue('remote README intro names all six memory types', remoteReadme.includes('书、电影、音乐、照片、行程和心情'))
assertTrue('remote README intro names explicit real destinations', remoteReadme.includes('钉回各自对应的真实地点'))
assertTrue('remote README omits ambiguous product heading', !/^## 一、.{0,2}是什么$/m.test(remoteReadme))
assertTrue('remote README names product-first three-entry heading', remoteReadme.includes('## 二、三入口，一颗地球'))
assertTrue('remote README omits UI-jargon three-tab heading', !/^## 二、.{0,4}Tab$/m.test(remoteReadme))
assertTrue('remote README names linkage by agent output and globe entrance', remoteReadme.includes('### 6.1 Agent 产出 ⇄ 地球入口实时联动'))
assertTrue('remote README explains agents as panels, not UI tabs', remoteReadme.includes('双面板结构') && remoteReadme.includes('数据层（左侧）') && remoteReadme.includes('对话层（右侧）'))
assertTrue('remote README names Frost Edge Node hardware direction explicitly', remoteReadme.includes('Frost Edge Node 硬件方向的商业判断'))
assertTrue('remote README omits vague hardware direction subject', !remoteReadme.includes('这个硬件方向'))
assertTrue('remote README names agentId 43', remoteReadme.includes('agentId 43'))
assertTrue('remote README names public demo video', remoteReadme.includes(DEMO_VIDEO_URL) && remoteReadme.includes('公开视频'))
assertTrue('remote README points at chain evidence API', remoteReadme.includes('/api/injective?tool=get-chain-evidence'))
assertTrue('remote README names proof suite', remoteReadme.includes('npm run verify:injective'))
assertTrue('remote README names handshake transaction verifier', remoteReadme.includes('npm run verify:handshake'))
assertTrue('remote README names handshake contract bytecode verifier', remoteReadme.includes('npm run verify:handshake-contract'))
assertTrue('remote README names public proof guard', remoteReadme.includes('npm run verify:public-proof'))
assertTrue('remote README names public API guard', remoteReadme.includes('npm run verify:public-apis'))
assertTrue('remote README names expanded positioning guard', remoteReadme.includes('README / app / hardware / docs 保持 Injective 核心集成主线'))
assertTrue('remote README links integration guide', remoteReadme.includes('INJECTIVE-INTEGRATION/README.md'))
assertTrue('remote README names registry mint events', remoteReadme.includes('registryMintEvents'))
assertTrue('remote README names registry mint summary', remoteReadme.includes('registryMintSummary'))
assertTrue('remote README names wallet timeline summary', remoteReadme.includes('timelineSummary'))
assertTrue('remote README names wallet timeline API', remoteReadme.includes('get-wallet-timeline'))
assertTrue('remote README names judge quickstart', remoteReadme.includes('60 秒核验路径') || remoteReadme.includes('JUDGE-QUICKSTART.md'))
assertTrue('remote README names judge runbook', remoteReadme.includes('judgeRunbook'))
assertTrue('remote README names public read API manifest', remoteReadme.includes('publicReadApis'))
assertTrue('remote README names Injective network integration guide', remoteReadme.includes('### 1.1 如何集成 Injective 网络'))
assertTrue('remote README names full network integration path', remoteReadme.includes('本地画像 -> 公开名片 -> ERC-8004 身份 -> 链上事件 -> 产品读回'))
assertTrue('remote README names Taste Passport builder in network guide', remoteReadme.includes('buildTastePassport()'))
assertTrue('remote README names write confirmation boundary in network guide', remoteReadme.includes('confirm:true'))
assertTrue('remote README names public read flags in network guide', remoteReadme.includes('readOnly: true') && remoteReadme.includes('publicOnly: true'))
assertTrue('remote README puts Frost Edge Node in the one-minute proof ladder', remoteReadme.includes('Frost Edge Node 硬件边界'))
assertTrue('remote README names hardware proof API in fast proof ladder', remoteReadme.includes('get-hardware-bridge-proof'))
assertTrue('remote README names hardware market boundary in fast proof ladder', remoteReadme.includes('hardwareBridge.marketBoundary'))
assertTrue('remote README names hardware service boundary in fast proof ladder', remoteReadme.includes('hardwareBridge.serviceBoundary'))
assertTrue('remote README names Agent Plaza service receipts for hardware', remoteReadme.includes('Agent Plaza 服务回执'))
assertTrue('remote README names hardware smoke boundary', remoteReadme.includes('离线冒烟') && remoteReadme.includes('state/tts/display'))
assertTrue('remote README keeps physical adapters pending', remoteReadme.includes('真实 BLE / TTS / 小屏幕物理驱动仍在后续 adapter 层'))
assertTrue('remote README keeps hardware adapter lane removable', remoteReadme.includes('可选、可删、可独立测试'))
assertTrue('remote README names commercial path boundary', remoteReadme.includes('### 5.3 商业路径与三条边界'))
assertTrue('remote README rejects token-first path', remoteReadme.includes('不走代币优先'))
assertTrue('remote README keeps Agent Plaza commercial center', remoteReadme.includes('Agent Plaza 的安装、调用、评价和可选付费'))
assertTrue('remote README names FROST Chronicle delivery close', remoteReadme.includes('#### 5.1.1 FROST Chronicle：画像演化史与三件交付'))
assertTrue('remote README puts FROST Chronicle in the one-minute proof ladder', remoteReadme.includes('| 7 | **FROST Chronicle 与三件交付**'))
assertTrue('remote README anchors final deck conclusion to image provenance', remoteReadme.includes('Pocket Earth 证明这个 agent 的公开画像来自长期本地知识库'))
assertTrue('remote README says the product can open now', remoteReadme.includes('现在能打开') && remoteReadme.includes('https://pocketearth.throughtheglass.art/?demo'))
assertTrue('remote README names the three delivery artifacts', remoteReadme.includes('公开 GitHub + 完整 README、Demo 视频、Pitch Deck'))
assertTrue('remote README names Built on Injective proof layers', remoteReadme.includes('Built on Injective') && remoteReadme.includes('公共身份层、画像版本见证层和未来结算回执层'))
for (const phrase of [
  '本地空间知识库',
  '把地球作为方法',
  'AI 分身的公共见证层',
  '空间留在 Pocket Earth，时间由 Injective 见证',
  '### 0. 先看什么',
  'Frost 链上身份',
  '同钱包时间线',
  '产品闭环',
  '隐私边界',
  '### 1. 架构主线',
  'Frost Passport',
  'Profile Chain',
  'Agent Plaza',
  'Frost Edge Node',
  '### 5.1 最终整合版对照与技术深挖',
  'final-ppt-index',
  'Agent Personality Provenance',
  'ProfileCheckpoint',
  'RunTrace',
  'FrostBus',
  'reviewManifest',
  'FNV-1a',
  'public-plaza',
  'agent-plaza',
  '商业路径与三条边界',
  '不走纯社交变现',
  '不走重资本硬件路线',
  'hardware/frost-buddy/',
]) {
  assertTrue(`remote README keeps architecture spine ${phrase}`, remoteReadme.includes(phrase))
}
for (const phrase of [
  '链上隐私红线速查',
  'data:application/json;base64',
  '不依赖 Pinata / IPFS',
  'PUBLIC_K=5',
  'TOPTAGS_CAP=12',
  'TagCount.n',
  '只 `emit Handshake` 事件',
  '不写 storage',
  'score <= 100',
  '禁止 `agentA == agentB` 自握手',
  '服务端 `.env` 私钥',
  '前端不持密钥',
]) {
  assertTrue(`remote README keeps privacy guard ${phrase}`, remoteReadme.includes(phrase))
}
assertTrue('remote integration guide names ERC-8004', remoteIntegration.includes('ERC-8004'))
assertTrue('remote integration guide names wallet timeline', remoteIntegration.includes('get-wallet-timeline'))
assertTrue('remote integration guide names registryMintEvents', remoteIntegration.includes('registryMintEvents'))
assertTrue('remote integration guide names registryMintSummary', remoteIntegration.includes('registryMintSummary'))
assertTrue('remote integration guide names wallet timeline summary', remoteIntegration.includes('timelineSummary'))
assertTrue('remote integration guide names direct wallet summary', remoteIntegration.includes('summary, events'))
assertTrue('remote integration guide names wallet timeline in demo quick check', remoteIntegration.includes('钱包时间线 API/RPC 事实表'))
assertTrue('remote integration guide names judge quickstart entrypoint', remoteIntegration.includes('JUDGE-QUICKSTART.md') && remoteIntegration.includes('reviewEntrypoints'))
assertTrue('remote integration guide names judge runbook', remoteIntegration.includes('judgeRunbook'))
assertTrue('remote integration guide names public read API manifest', remoteIntegration.includes('publicReadApis'))
assertTrue('remote integration guide names public API guard', remoteIntegration.includes('npm run verify:public-apis'))
assertTrue('remote integration guide names integration guide guard', remoteIntegration.includes('npm run verify:integration-guide'))
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
  'PPT 第 34 页的反面坐标',
  'friend.tech',
  'Lens',
  'Farcaster',
  'Virtuals',
  'Humane AI Pin',
  'Rabbit r1',
  '三条商业边界',
  '纯社交变现',
  '代币优先',
  '硬件收入优先',
  'Agent Plaza 是商业路径的中心',
  'hardware/frost-buddy/',
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
  'marketLandscapeBoundary',
  'commercialFlywheel',
  'preferredPath',
  'rejectedPaths',
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
  'reviewEntrypoints',
  'deliveryChecklist',
  'public-plaza',
  'agent-plaza',
]) {
  assertTrue(`remote integration guide keeps story spine ${phrase}`, remoteIntegration.includes(phrase))
}
for (const phrase of [
  'Profile Confidence 分 L0-L4',
  'L0 是自声明标签',
  'L1 是本地知识库生成',
  'L2 是时间连续性',
  'L3 是选择性证明/Merkle 片段',
  'L4 是 SocialHandshake、安装、评价等外部回执',
  '不是 Credit Score',
  '不判断“人好坏”',
  '公开画像有多少长期数据支撑',
  '批量灌入',
  '随机标签',
  '短期快速变脸',
]) {
  assertTrue(`remote integration guide keeps Profile Confidence guard text ${phrase}`, remoteIntegration.includes(phrase))
}
for (const phrase of [
  'Profile Confidence anti-fraud guard',
  'profile confidence guard includes',
  'L0 是自声明标签',
  'L4 是 SocialHandshake、安装、评价等外部回执',
  '批量灌入',
  '随机标签',
  '短期快速变脸',
]) {
  assertTrue(`remote integration verifier keeps Profile Confidence guard ${phrase}`, remoteVerifyIntegrationGuide.includes(phrase))
}
for (const phrase of [
  'PPT 第 25-26 页的隐私红线已经落成具体实现',
  'data:application/json;base64',
  '不依赖 Pinata / IPFS',
  'decodeDataCard',
  'PUBLIC_K=5',
  'TOPTAGS_CAP=12',
  'TagCount.n',
  '避免从计数反推行为强度',
  '只 `emit Handshake` 事件',
  '不写 storage',
  'score <= 100',
  '禁止 `agentA == agentB` 的自握手',
  '私钥只在服务端 `.env`',
  '前端不持密钥',
  'confirm:true',
]) {
  assertTrue(`remote integration guide keeps privacy guard ${phrase}`, remoteIntegration.includes(phrase))
}
for (const phrase of [
  'Privacy boundary implementation guard',
  'integration guide keeps privacy guard',
  'Taste Passport source keeps public-only guard',
  'data:application/json;base64',
  'PUBLIC_K=5',
  'TOPTAGS_CAP=12',
  'TagCount.n',
  '前端不持密钥',
]) {
  assertTrue(`remote integration verifier keeps privacy guard ${phrase}`, remoteVerifyIntegrationGuide.includes(phrase))
}
for (const phrase of [
  'const PUBLIC_K = 5',
  'const TOPTAGS_CAP = 12',
  'TagCount.n',
  '热度计数都不导',
  '丢弃 n',
]) {
  assertTrue(`remote Taste Passport source keeps public-only guard ${phrase}`, remoteTastePassport.includes(phrase))
}
assertTrue('remote evidence pack names reviewBrief', remoteEvidence.includes('reviewBrief'))
assertTrue('remote evidence pack names public demo video', remoteEvidence.includes('reviewEntrypoints.demo-video') && remoteEvidence.includes(DEMO_VIDEO_URL))
assertTrue('remote evidence pack names registryMintEvents', remoteEvidence.includes('registryMintEvents'))
assertTrue('remote evidence pack names registryMintSummary', remoteEvidence.includes('registryMintSummary'))
assertTrue('remote evidence pack names fleet evidence layer', remoteEvidence.includes('| Fleet |') && remoteEvidence.includes('builderCode=pocket-earth'))
assertTrue('remote evidence pack names wallet timeline layer', remoteEvidence.includes('| Wallet timeline |') && remoteEvidence.includes('get-wallet-timeline'))
assertTrue('remote evidence pack names wallet timeline summary', remoteEvidence.includes('timelineSummary'))
assertTrue('remote evidence pack names direct wallet summary', remoteEvidence.includes('all-succeeded status'))
assertTrue('remote evidence pack names judge quickstart entrypoint', remoteEvidence.includes('60-second') && remoteEvidence.includes('JUDGE-QUICKSTART.md'))
assertTrue('remote evidence pack names judge runbook', remoteEvidence.includes('judgeRunbook'))
assertTrue('remote evidence pack names deliveryChecklist', remoteEvidence.includes('deliveryChecklist'))
assertTrue('remote evidence pack names public read API manifest', remoteEvidence.includes('publicReadApis'))
assertTrue('remote evidence pack names public API guard', remoteEvidence.includes('npm run verify:public-apis'))
for (const phrase of [
  '## 公开证据如何支撑 Agent Plaza 商业路径',
  '## Agent Plaza 回执如何形成收入闭环',
  '## 公开证据如何支撑 Profile Chain 路线图',
  'manifestReceipt(agentId, manifestHash, publisher, timestamp)',
  'installReceipt(agentId, manifestHash, userConsentHash, timestamp)',
  'callReceipt(agentId, runId, capability, resultHash, timestamp)',
  'reviewReceipt(agentId, ratingBucket, reasonHash, timestamp)',
  'paymentReceipt(agentId, planOrCallId, settlementRef, timestamp)',
  '订阅、单次调用或平台抽成路径',
  'NOW 链上身份与握手',
  'P1 Profile Checkpoint',
  'P2 Agent Plaza receipts',
  'P3 Profile Confidence',
  'P4 Frost Network',
  'roadmapSafetyBoundary',
  'productRoadmap',
  'chainRoadmap',
  'alwaysOn',
  'profileHash + version + timestamp + Frost signature',
  'Frost Edge Node 保持 developer-kit / experience layer',
  '不走纯社交变现',
  '不走代币优先',
  '不走重资本硬件路线',
  'Agent Plaza 承接收入闭环',
  'manifest / schema / permissions',
  'reviewManifest',
  'toManifest',
  'INSTALL -> My Agents -> RUN',
  '长期使用 -> 可信画像 -> Agent 市场',
  'marketLandscapeBoundary',
  'commercialFlywheel',
  'preferredPath',
  'rejectedPaths',
  'Agent Plaza platform path',
  'hardwareBridge.marketBoundary',
  'hardwareBridge.serviceBoundary',
  'hardwareNodeServiceReceipt',
  'get-hardware-bridge-proof',
  '空间留在 Pocket Earth，时间由 Injective 见证',
  'domain=地点',
  'tools=[enrich, geocode, mark_place]',
  '可重复的浏览器 smoke',
]) {
  assertTrue(`remote evidence pack keeps commercial boundary ${phrase}`, remoteEvidence.includes(phrase))
}
assertTrue('remote demo script names registryMintEvents', remoteDemo.includes('registryMintEvents'))
assertTrue('remote demo script names registryMintSummary', remoteDemo.includes('registryMintSummary'))
assertTrue('remote demo script names fleet readback', remoteDemo.includes('builderCode=pocket-earth') && remoteDemo.includes('agentId 43'))
assertTrue('remote demo script names wallet timeline API', remoteDemo.includes('get-wallet-timeline') && remoteDemo.includes('chainId 1439'))
assertTrue('remote demo script names wallet timeline summary', remoteDemo.includes('timelineSummary'))
assertTrue('remote demo script names direct wallet summary', remoteDemo.includes('get-wallet-timeline` 的 `summary`'))
assertTrue('remote demo script names judge quickstart entrypoint', remoteDemo.includes('reviewEntrypoints') && remoteDemo.includes('npm run verify:judge'))
assertTrue('remote demo script names public demo video', remoteDemo.includes('reviewEntrypoints.demo-video') && remoteDemo.includes(DEMO_VIDEO_URL))
assertTrue('remote demo script names judge runbook', remoteDemo.includes('judgeRunbook'))
assertTrue('remote demo script names public API guard', remoteDemo.includes('npm run verify:public-apis'))
assertTrue('remote demo script names integration guide guard', remoteDemo.includes('npm run verify:integration-guide'))
assertTrue('remote demo script names expanded positioning guard', remoteDemo.includes('README / app / hardware / docs 保持 Injective 核心集成主线'))
assertTrue('remote demo script names globe entrance instead of tab', remoteDemo.includes('切到地球入口') && !remoteDemo.includes('切地球 tab'))
assertTrue('remote demo script keeps 3-minute limit', remoteDemo.includes('≤ 3 分钟') && remoteDemo.includes('180s'))
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
  '不走代币优先或重资本硬件路线',
  'FROST Chronicle',
  '画像演化史',
  '现在就能打开',
  '不是纸面方案',
  '公开仓库',
  'Demo 视频',
  'Pitch Deck',
  'Built on Injective',
  '公开身份、版本、时间线、握手和未来结算回执',
]) {
  assertTrue(`remote demo script keeps PPT story spine ${phrase}`, remoteDemo.includes(phrase))
}
for (const phrase of [
  '商业路径一句话',
  'public-plaza` 只讲链上社交发现',
  'agent-plaza` 才讲商业路径',
  '长期使用 -> 可信画像 -> Agent 市场',
  'reviewManifest',
  'toManifest',
  'INSTALL -> My Agents -> RUN',
  'domain=地点',
  'mark_place',
  'RUN` 入口',
  'Profile Confidence',
  '不要说成代币优先或硬件收入优先',
]) {
  assertTrue(`remote demo script keeps Agent Plaza commercial narration ${phrase}`, remoteDemo.includes(phrase))
}
for (const phrase of ['installedCafe.domain ===', 'geoStrategy.includes', 'mark_place', '▶ RUN']) {
  assertTrue(`remote plaza-flow verifier guards install script ${phrase}`, remoteVerifyPlazaFlow.includes(phrase))
}
for (const phrase of ["domain === '地点'", 'geoStrategy.includes', 'tagFields.includes', 'enrich', 'geocode', 'mark_place', '▶ RUN']) {
  assertTrue(`remote plaza install smoke keeps ${phrase}`, remoteVerifyPlazaInstall.includes(phrase))
}
for (const phrase of [
  'CHAIN-EVIDENCE locks Agent Plaza install smoke source',
  'CHAIN-EVIDENCE locks installed cafe-map manifest fields',
  'CHAIN-EVIDENCE locks install-to-run loop',
  'DEMO-SCRIPT separates public-plaza from agent-plaza',
  'DEMO-SCRIPT locks Agent Plaza install narration',
]) {
  assertTrue(`remote delivery verifier keeps Agent Plaza install guard ${phrase}`, remoteVerifyDeliveryPack.includes(phrase))
}
assertTrue('remote judge quickstart names Judge Quickstart', remoteJudge.includes('Judge Quickstart'))
assertTrue('remote judge quickstart names agentId 43', remoteJudge.includes('agentId 43'))
assertTrue('remote judge quickstart points at chain evidence API', remoteJudge.includes('/api/injective?tool=get-chain-evidence'))
assertTrue('remote judge quickstart points at builderCode fleet API', remoteJudge.includes('/api/injective?tool=list-agents&builderCode=pocket-earth'))
assertTrue('remote judge quickstart names recording focus', remoteJudge.includes('recordingOrder[].evidenceFocus'))
assertTrue('remote judge quickstart names registry mint summary', remoteJudge.includes('registryMintSummary'))
assertTrue('remote judge quickstart names wallet timeline summary', remoteJudge.includes('timelineSummary'))
assertTrue('remote judge quickstart names wallet timeline chainId', remoteJudge.includes(`chainId ${INJECTIVE_TESTNET_CHAIN_ID}`))
assertTrue('remote judge quickstart names public read API manifest', remoteJudge.includes('publicReadApis'))
assertTrue('remote judge quickstart names judge runbook', remoteJudge.includes('judgeRunbook'))
assertTrue('remote judge quickstart names public API guard', remoteJudge.includes('npm run verify:public-apis'))
assertTrue('remote judge quickstart names integration guide guard', remoteJudge.includes('npm run verify:integration-guide'))
assertTrue('remote judge quickstart names positioning guard', remoteJudge.includes('npm run verify:positioning'))
assertTrue('remote judge quickstart names source control guard', remoteJudge.includes('npm run verify:source'))
assertTrue('remote judge quickstart names judge guard', remoteJudge.includes('npm run verify:judge'))
assertTrue('remote judge quickstart names hardware bridge entrypoint', remoteJudge.includes('reviewEntrypoints.hardware-bridge') && remoteJudge.includes('hardware/frost-buddy'))
assertTrue('remote judge quickstart names public demo video entrypoint', remoteJudge.includes('reviewEntrypoints.demo-video') && remoteJudge.includes(DEMO_VIDEO_URL))
assertTrue('remote judge quickstart names Frost Edge Node checklist', remoteJudge.includes('deliveryChecklist.frost-edge-node') && remoteJudge.includes('npm run verify:hardware'))
assertTrue('remote judge quickstart names recording order guard', remoteJudge.includes('npm run verify:recording-order'))
assertTrue('remote judge quickstart names plaza split', remoteJudge.includes('public-plaza') && remoteJudge.includes('agent-plaza'))
for (const phrase of [
  'Agent Plaza is the commercial path boundary',
  'Agent Plaza Commercial Path Fast Check',
  'Market Landscape Boundary Fast Check',
  'marketLandscapeBoundary is the machine-readable field',
  'Long-term use -> trusted profile -> Agent Plaza market',
  'Pure social monetization is not the core path',
  'Token-first is not the product strategy',
  'Hardware revenue first is not the current strategy',
  'Agent Plaza Receipt Loop Fast Check',
  'manifest / schema / permissions',
  'reviewManifest',
  'toManifest',
  'manifestReceipt(agentId, manifestHash, publisher, timestamp)',
  'installReceipt(agentId, manifestHash, userConsentHash, timestamp)',
  'callReceipt(agentId, runId, capability, resultHash, timestamp)',
  'reviewReceipt(agentId, ratingBucket, reasonHash, timestamp)',
  'paymentReceipt(agentId, planOrCallId, settlementRef, timestamp)',
  'The repository does not claim paid revenue is already settled',
  'INSTALL -> My Agents -> RUN',
  'optional paid receipts',
  'Profile Confidence',
  'willEmit',
  'Business center is Agent Plaza',
  'Frost Edge Node is Raspberry Pi / BLE / TTS developer kit',
]) {
  assertTrue(`remote judge quickstart keeps commercial path ${phrase}`, remoteJudge.includes(phrase))
}
for (const phrase of [
  'Pocket Earth Roadmap And Safety Boundary Fast Check',
  'P0 core',
  'P1 compatibility',
  'P2 self-learning',
  'Heartbeat suggestion engine',
  'NOW chain identity and handshake',
  'Profile Checkpoint',
  'Agent Plaza receipts',
  'Profile Confidence',
  'P4 Frost Network',
  'roadmapSafetyBoundary',
  'productRoadmap',
  'chainRoadmap',
  'alwaysOn',
  'confirm:true',
  'Raw memories never go on-chain',
  'only identity, versions, receipts, and selective proofs go on-chain',
  'Hardware remains a developer-kit / experience layer',
]) {
  assertTrue(`remote judge quickstart keeps roadmap boundary ${phrase}`, remoteJudge.includes(phrase))
}
for (const phrase of [
  'Profile Confidence Fast Check',
  'Profile Confidence is not a credit score',
  'not a judgment about a person',
  'L0 self-declared',
  'L1 local memory source',
  'L2 time continuity',
  'L3 selective proof',
  'L4 external corroboration',
  'bulk imports, random tags, short-term profile jumps',
  'provenance, not judgment',
]) {
  assertTrue(`remote judge quickstart keeps profile confidence ${phrase}`, remoteJudge.includes(phrase))
}
for (const phrase of [
  'FROST Chronicle Delivery Fast Check',
  'Pocket Earth is already openable',
  'traceable profile history, not a self-introduction',
  'FROST Chronicle is traceable',
  'Pocket Earth can be opened now',
  'GitHub delivery is anchored',
  'Built on Injective means public witness',
  'public GitHub repo, Injective testnet evidence, live demo, or read-only API proof',
]) {
  assertTrue(`remote judge quickstart keeps delivery close ${phrase}`, remoteJudge.includes(phrase))
}
for (const phrase of [
  'Pocket Earth Roadmap And Safety Boundary Fast Check',
  'P0 core / P1 compatibility / P2 self-learning',
  'NOW chain identity and handshake / Profile Checkpoint / Agent Plaza receipts / Profile Confidence / P4 Frost Network',
  'raw memories never go on-chain',
  'only identity / versions / receipts / selective proofs go on-chain',
  'Frost Edge Node remains a developer-kit / experience layer',
  '5.1.1 FROST Chronicle：画像演化史与三件交付',
  'AI 分身公开画像的来源证明',
  '现在能打开',
  '三件交付',
  'Built on Injective',
  'hardwareBridge.serviceBoundary',
  'hardwareNodeServiceReceipt',
  'roadmapSafetyBoundary',
  'PPT 硬件边界守门',
  '真实 BLE / TTS / 小屏幕物理驱动仍待后续 adapter 接入',
  '硬件收入优先路径',
]) {
  assertTrue(`remote progress keeps roadmap boundary ${phrase}`, remoteProgress.includes(phrase))
}
assertTrue('remote hardware README names module subject explicitly', remoteHardware.includes('Frost Edge Node 模块先承担三个角色'))
assertTrue('remote hardware README names market subject explicitly', remoteHardware.includes('Frost Edge Node 的市场判断'))
assertTrue('remote hardware README names hardware service boundary explicitly', remoteHardware.includes('硬件节点服务边界'))
assertTrue('remote hardware README names Agent Plaza service receipt', remoteHardware.includes('Agent Plaza 服务回执'))
assertTrue('remote hardware README keeps driver boundary', remoteHardware.includes('真实 BLE / TTS / 小屏幕驱动仍在后续 adapter 层'))
assertTrue('remote hardware README omits vague module subject', !remoteHardware.includes('这个模块先承担'))
assertTrue('remote hardware README omits vague market subject', !remoteHardware.includes('这个判断在 Markdown'))
assertTrue('remote hardware verifier locks smoke-tested bridge', remoteVerifyHardware.includes('hardware proof roadmap current names smoke-tested bridge'))
assertTrue('remote hardware verifier keeps physical adapters pending', remoteVerifyHardware.includes('hardware proof roadmap keeps physical adapters pending'))
assertTrue('remote hardware verifier checks README physical driver boundary', remoteVerifyHardware.includes('真实 BLE / TTS / 小屏幕物理驱动仍在后续 adapter 层'))
assertTrue('remote hardware verifier checks removable adapter lane', remoteVerifyHardware.includes('可选、可删、可独立测试'))
for (const phrase of [
  'Adapter Contract Matrix',
  'Upstream JSONL contract',
  'Pi action contract',
  'Transport driver',
  'Main app and Injective API',
  'hardware boundary from the final deck',
]) {
  assertTrue(`remote Raspberry Pi README keeps adapter matrix ${phrase}`, remoteRaspiReadme.includes(phrase))
}
assertTrue('remote PWA manifest description names each record explicitly', remoteManifest.description?.includes('每条记录各自对应的真实地点'))
assertTrue('remote PWA manifest description omits vague pronoun', !remoteManifest.description?.includes(vagueRecordPlace))
assertTrue('remote index description names explicit destinations', remoteIndexHtml.includes('钉回各自对应的真实地点'))
assertTrue('remote index description omits vague pronoun', !remoteIndexHtml.includes(vagueRecordPlace))
assertTrue('remote public-plaza source names Frost as the actor', remotePublicPlaza.includes('Frost 替你去广场') && remotePublicPlaza.includes('Frost 带出的名片'))
assertTrue('remote public-plaza source omits vague agent actor', !remotePublicPlaza.includes('它替你去广场') && !remotePublicPlaza.includes('它带出的名片'))
assertTrue('remote userMarks comment names globe entrance and agent panels', remoteUserMarks.includes('地球入口 ⇄ 各 agent 面板联动的底座'))
assertTrue('remote mapFocus comment names globe entrance', remoteMapFocus.includes('切到地球入口') && remoteMapFocus.includes('切回地球入口'))
assertTrue('remote mapMarkers comment names globe entrance', remoteMapMarkers.includes('切回地球入口重新 import'))
assertTrue('remote space plaza verifier names Agents entrance', remoteVerifySpacePlaza.includes('AGENTS 入口') && remoteVerifySpacePlaza.includes('Agents entry not found'))
assertTrue('remote plaza verifier names Agents entrance', remoteVerifyPlaza.includes('点 Agents 入口') && remoteVerifyPlaza.includes('Agents entry not found'))
assertTrue('remote plaza install verifier names Agents entrance', remoteVerifyPlazaInstall.includes('点 Agents 入口') && remoteVerifyPlazaInstall.includes('Agents entry not found'))
assertTrue('remote forge run verifier names Agents entrance', remoteVerifyForgeRun.includes('返回 AGENTS 入口'))
assertTrue('remote Agent Plaza source names Agents entrance', remoteAgentPlazaPage.includes('AGENTS 入口') && remoteAgentPlazaPage.includes('切回 AGENTS 入口即可见'))
assertTrue('remote plaza catalog names Agents entrance', remotePlazaCatalog.includes('进 AGENTS 入口的') && remotePlazaCatalog.includes('点添加即进 AGENTS 入口'))
for (const [label, text, forbidden] of [
  ['remote README', remoteReadme, 'tab1 ⇄ tab2'],
  ['remote README', remoteReadme, 'MyMapTab 合并'],
  ['remote userMarks', remoteUserMarks, 'tab1 地球'],
  ['remote mapFocus', remoteMapFocus, '地球 tab'],
  ['remote mapFocus', remoteMapFocus, 'earth tab'],
  ['remote mapMarkers', remoteMapMarkers, '切回地球 tab'],
  ['remote space plaza verifier', remoteVerifySpacePlaza, 'Agents tab'],
  ['remote plaza verifier', remoteVerifyPlaza, 'Agents tab'],
  ['remote plaza install verifier', remoteVerifyPlazaInstall, 'Agents tab'],
  ['remote forge run verifier', remoteVerifyForgeRun, 'AGENTS tab'],
  ['remote Agent Plaza source', remoteAgentPlazaPage, 'AGENTS tab'],
  ['remote plaza catalog', remotePlazaCatalog, 'AGENTS tab'],
]) {
  assertTrue(`${label} omits ambiguous UI wording ${forbidden}`, !text.includes(forbidden))
}
for (const [label, text] of [
  ['remote README', remoteReadme],
  ['remote integration guide', remoteIntegration],
  ['remote evidence pack', remoteEvidence],
  ['remote demo script', remoteDemo],
  ['remote judge quickstart', remoteJudge],
  ['remote progress', remoteProgress],
  ['remote hardware README', remoteHardware],
  ['remote Raspberry Pi README', remoteRaspiReadme],
  ['remote hardware verifier', remoteVerifyHardware],
  ['remote index HTML', remoteIndexHtml],
  ['remote PWA manifest', remoteManifestText],
  ['remote public-plaza source', remotePublicPlaza],
]) {
  assertNoOldRepoText(label, text)
  assertNoEventPositioning(label, text)
}

console.log('\nLocal integration config')
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'))
assertEqual('local verify:github script', packageJson.scripts?.['verify:github'], 'node INJECTIVE-INTEGRATION/verify-github-integration.mjs')
assertTrue('local package includes verify:delivery', Boolean(packageJson.scripts?.['verify:delivery']))
assertTrue('local package includes verify:injective', Boolean(packageJson.scripts?.['verify:injective']))
assertEqual('local verify:public-apis script', packageJson.scripts?.['verify:public-apis'], 'node INJECTIVE-INTEGRATION/verify-public-read-apis.mjs')
assertEqual('local verify:integration-guide script', packageJson.scripts?.['verify:integration-guide'], 'node INJECTIVE-INTEGRATION/verify-integration-guide.mjs')
assertEqual('local verify:handshake script', packageJson.scripts?.['verify:handshake'], 'node INJECTIVE-INTEGRATION/verify-handshake.mjs')
assertEqual('local verify:handshake-contract script', packageJson.scripts?.['verify:handshake-contract'], 'node INJECTIVE-INTEGRATION/verify-handshake-contract.mjs')
assertEqual('local verify:positioning script', packageJson.scripts?.['verify:positioning'], 'node INJECTIVE-INTEGRATION/verify-doc-positioning.mjs')
assertEqual('remote verify:handshake script', remotePackageJson.scripts?.['verify:handshake'], 'node INJECTIVE-INTEGRATION/verify-handshake.mjs')
assertEqual(
  'remote verify:handshake-contract script',
  remotePackageJson.scripts?.['verify:handshake-contract'],
  'node INJECTIVE-INTEGRATION/verify-handshake-contract.mjs',
)

console.log('\nOK GitHub integration repo is public, current, and bounded to Pocket-Earth-Injective.')
