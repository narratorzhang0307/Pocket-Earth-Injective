// Guard public docs and integration code against outdated positioning terms.
// Usage: npm run verify:positioning
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const integrationDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(integrationDir, '..')
const scanExtensions = new Set(['.md', '.mjs', '.js', '.ts', '.tsx', '.json', '.html', '.txt'])
const scanRoots = [
  'README.md',
  'ARCHITECTURE.md',
  'index.html',
  'package.json',
  'Pocket Earth_产品文档_Final.md',
  'Pocket Earth 口播稿_电台版.txt',
  'Pocket Earth 口播稿_电台版_纯文本.txt',
  'injective-service.mjs',
  'INJECTIVE-INTEGRATION',
  'docs',
  'frost-agent',
  'hardware',
  'src',
]
const ignoredPathParts = [
  'INJECTIVE-INTEGRATION/_research',
  'INJECTIVE-INTEGRATION/test-cors.mjs',
  'src/app/data',
]
const forbiddenPositioningSnippets = [
  [0x53c2, 0x8d5b],
  [0x6bd4, 0x8d5b],
  [0x53c2, 0x8d5b, 0x7248],
  'sub' + 'mission',
  'com' + 'petition',
  'con' + 'test',
].map((value) => (Array.isArray(value) ? String.fromCodePoint(...value) : value))
const forbiddenPaymentSnippets = [
  ['x', '402'].join(''),
  ['http', '402'].join(' '),
  ['402', String.fromCodePoint(0x20, 0x652f, 0x4ed8)].join(''),
  ['payment', 'facilitator'].join(' '),
  ['bank', 'send'].join(' '),
  ['inj', 'pk'].join('_'),
]
const vaguePositioningSnippets = [
  String.fromCodePoint(0x672c, 0x9879, 0x76ee),
  '它们' + '在地球',
  '钉回' + '它们',
  '各自' + '在地球上的那个地点',
]

function assertTrue(label, condition) {
  if (!condition) throw new Error(`${label} failed`)
  console.log(`OK ${label}`)
}

function shouldIgnore(file) {
  const normalized = relative(projectRoot, file).split('\\').join('/')
  return ignoredPathParts.some((part) => normalized === part || normalized.startsWith(`${part}/`))
}

function collectFiles(entry, out = []) {
  if (!existsSync(entry) || shouldIgnore(entry)) return out
  const stats = statSync(entry)
  if (stats.isDirectory()) {
    for (const name of readdirSync(entry)) collectFiles(resolve(entry, name), out)
  } else if (stats.isFile() && scanExtensions.has(extname(entry))) {
    out.push(entry)
  }
  return out
}

const files = scanRoots.flatMap((root) => collectFiles(resolve(projectRoot, root))).sort()

console.log('Positioning text guard')
assertTrue('scan has files', files.length > 0)
const rootReadme = readFileSync(resolve(projectRoot, 'README.md'), 'utf8')
const hardwareReadme = readFileSync(resolve(projectRoot, 'hardware/frost-buddy/README.md'), 'utf8')
const demoScript = readFileSync(resolve(projectRoot, 'INJECTIVE-INTEGRATION/DEMO-SCRIPT.md'), 'utf8')
const indexHtml = readFileSync(resolve(projectRoot, 'index.html'), 'utf8')
const webManifest = JSON.parse(readFileSync(resolve(projectRoot, 'public/manifest.webmanifest'), 'utf8'))
const publicPlaza = readFileSync(resolve(projectRoot, 'src/app/components/PublicPlazaPage.tsx'), 'utf8')
const vagueRecordPlace = '它们' + '在地球上的那个地点'
assertTrue('README uses explicit Pocket Earth definition heading', rootReadme.includes('## 一、Pocket Earth 是什么'))
assertTrue('README intro names all six memory types', rootReadme.includes('书、电影、音乐、照片、行程和心情'))
assertTrue('README intro names explicit real destinations', rootReadme.includes('钉回各自对应的真实地点'))
assertTrue('README omits ambiguous product heading', !/^## 一、.{0,2}是什么$/m.test(rootReadme))
assertTrue('README uses product-first three-entry heading', rootReadme.includes('## 二、三入口，一颗地球'))
assertTrue('README omits UI-jargon three-tab heading', !/^## 二、.{0,4}Tab$/m.test(rootReadme))
assertTrue('README names linkage by agent output and globe entrance', rootReadme.includes('### 6.1 Agent 产出 ⇄ 地球入口实时联动'))
assertTrue('README explains agents as panels, not UI tabs', rootReadme.includes('双面板结构') && rootReadme.includes('数据层（左侧）') && rootReadme.includes('对话层（右侧）'))
assertTrue('demo script names globe entrance instead of tab', demoScript.includes('切到地球入口'))
assertTrue('README one-minute proof ladder names seven layers', rootReadme.includes('按下面七层看') && !rootReadme.includes('按下面六层看'))
assertTrue('README names Frost Edge Node hardware direction explicitly', rootReadme.includes('Frost Edge Node 硬件方向的商业判断'))
assertTrue('README puts Frost Edge Node in the one-minute proof ladder', rootReadme.includes('Frost Edge Node 硬件边界'))
assertTrue('README names hardware proof API in fast proof ladder', rootReadme.includes('get-hardware-bridge-proof'))
assertTrue('README names hardware market boundary in fast proof ladder', rootReadme.includes('hardwareBridge.marketBoundary'))
assertTrue('README names hardware service boundary in fast proof ladder', rootReadme.includes('hardwareBridge.serviceBoundary'))
assertTrue('README routes hardware services to Agent Plaza service receipts', rootReadme.includes('Agent Plaza 服务回执'))
assertTrue('README names commercial path boundary explicitly', rootReadme.includes('### 5.3 商业路径与三条边界'))
assertTrue('README rejects token-first path explicitly', rootReadme.includes('不走代币优先'))
assertTrue('README keeps Agent Plaza as commercial center', rootReadme.includes('Agent Plaza 的安装、调用、评价和可选付费'))
assertTrue('demo script keeps Agent Plaza optional payment receipt wording', demoScript.includes('Agent Plaza 承接安装、调用、评价和可选付费回执'))
assertTrue('README maps deck negative coordinates into public API', rootReadme.includes('negativeCoordinates') && rootReadme.includes('PPT 第 34 页反面坐标') && rootReadme.includes('friend.tech / Lens / Farcaster') && rootReadme.includes('Virtuals-style agent token path') && rootReadme.includes('Humane AI Pin / Rabbit r1'))
assertTrue('README names Profile Chain as Proof of Memory', rootReadme.includes('### 5. Profile Chain / Proof of Memory 路线') && rootReadme.includes('Proof of Memory 证明公开画像来自长期本地知识库'))
assertTrue('README names FROST Chronicle delivery close explicitly', rootReadme.includes('#### 5.1.1 FROST Chronicle：画像演化史与三件交付'))
assertTrue('README puts FROST Chronicle in the one-minute proof ladder', rootReadme.includes('| 7 | **FROST Chronicle 与三件交付**'))
assertTrue('README anchors final deck conclusion to image provenance', rootReadme.includes('Pocket Earth 证明这个 agent 的公开画像来自长期本地知识库'))
assertTrue('README says the product can open now', rootReadme.includes('现在能打开') && rootReadme.includes('https://pocketearth.throughtheglass.art/?demo'))
assertTrue('README names the three delivery artifacts', rootReadme.includes('公开 GitHub + 完整 README、Demo 视频、Pitch Deck'))
assertTrue('README names Built on Injective proof layers', rootReadme.includes('Built on Injective') && rootReadme.includes('公共身份层、画像版本见证层和未来结算回执层'))
assertTrue('hardware README names module subject explicitly', hardwareReadme.includes('Frost Edge Node 模块先承担三个角色'))
assertTrue('hardware README names service boundary explicitly', hardwareReadme.includes('硬件节点服务边界'))
assertTrue('hardware README names hardwareNodeServiceReceipt', hardwareReadme.includes('hardwareNodeServiceReceipt'))
assertTrue('PWA manifest description names each record explicitly', webManifest.description.includes('每条记录各自对应的真实地点'))
assertTrue('PWA manifest description omits vague pronoun', !webManifest.description.includes(vagueRecordPlace))
assertTrue('HTML description names explicit destinations', indexHtml.includes('钉回各自对应的真实地点'))
assertTrue('HTML description omits vague pronoun', !indexHtml.includes(vagueRecordPlace))
assertTrue('public-plaza UI names Frost as the actor', publicPlaza.includes('Frost 替你去广场') && publicPlaza.includes('Frost 带出的名片'))
const explicitPublicDocSnippets = [
  ['README.md', '它立刻被钉回真实坐标'],
  ['README.md', 'Injective 在这里不是装饰徽章'],
  ['README.md', '这个集成是否扎实'],
  ['README.md', '这个硬件方向'],
  ['README.md', '落在这里'],
  ['README.md', '它由下面这些部件组成'],
  ['README.md', '它不亲自吞下所有原始数据'],
  ['README.md', '它不靠你手选歌单'],
  ['README.md', '夜里它回来'],
  ['README.md', '它不再只是示意界面'],
  ['README.md', '控制台 tab'],
  ['README.md', '控制台（右 Tab）'],
  ['README.md', '双 Tab 结构'],
  ['README.md', '数据层（左 Tab）'],
  ['README.md', '对话层（右 Tab）'],
  ['README.md', '双 Tab 骨架'],
  ['README.md', '双 Tab 容器'],
  ['README.md', '通用双 Tab'],
  ['README.md', '两 tab 联动'],
  ['README.md', 'tab1 ⇄ tab2'],
  ['README.md', 'MyMapTab 合并'],
  ['src/app/data/userMarks.ts', 'tab1 地球'],
  ['src/app/data/mapFocus.ts', '地球 tab'],
  ['src/app/data/mapFocus.ts', 'earth tab'],
  ['src/app/data/mapMarkers.ts', '切回地球 tab'],
  ['INJECTIVE-INTEGRATION/verify-space-plaza.mjs', 'Agents tab'],
  ['INJECTIVE-INTEGRATION/verify-plaza.mjs', 'Agents tab'],
  ['INJECTIVE-INTEGRATION/verify-plaza-install.mjs', 'Agents tab'],
  ['INJECTIVE-INTEGRATION/verify-forge-run.mjs', 'AGENTS tab'],
  ['src/app/components/AgentPlazaPage.tsx', 'AGENTS tab'],
  ['src/app/lib/plaza/catalog.ts', 'AGENTS tab'],
  ['INJECTIVE-INTEGRATION/README.md', '证明它不是单页概念图'],
  ['INJECTIVE-INTEGRATION/README.md', '它会串起公开证据包'],
  ['INJECTIVE-INTEGRATION/DEMO-SCRIPT.md', '切地球 tab'],
  ['INJECTIVE-INTEGRATION/DEMO-SCRIPT.md', '今天它有了新身份'],
  ['INJECTIVE-INTEGRATION/DEMO-SCRIPT.md', '它带着你的长期口味画像'],
  ['INJECTIVE-INTEGRATION/DEMO-SCRIPT.md', '跳到它的链上身份页'],
  ['INJECTIVE-INTEGRATION/DEMO-SCRIPT.md', '它直接读 Injective RPC'],
  ['hardware/frost-buddy/README.md', '这个模块先承担'],
  ['hardware/frost-buddy/README.md', '这个判断在 Markdown'],
  ['src/app/components/PublicPlazaPage.tsx', '它带着你的长期口味画像'],
  ['src/app/components/PublicPlazaPage.tsx', '它替你去广场'],
  ['src/app/components/PublicPlazaPage.tsx', '它带出的名片'],
]
for (const [relativePath, ambiguous] of explicitPublicDocSnippets) {
  const text = readFileSync(resolve(projectRoot, relativePath), 'utf8')
  assertTrue(`${relativePath} omits ambiguous wording: ${ambiguous}`, !text.includes(ambiguous))
}
const violations = []
for (const file of files) {
  const label = relative(projectRoot, file).split('\\').join('/')
  const text = readFileSync(file, 'utf8').toLowerCase()
  for (const forbidden of forbiddenPositioningSnippets) {
    if (text.includes(forbidden.toLowerCase())) violations.push(`${label}: ${forbidden}`)
  }
  for (const forbidden of forbiddenPaymentSnippets) {
    if (text.includes(forbidden.toLowerCase())) violations.push(`${label}: old payment route wording`)
  }
  for (const forbidden of vaguePositioningSnippets) {
    if (text.includes(forbidden.toLowerCase())) violations.push(`${label}: ${forbidden}`)
  }
}
if (violations.length) throw new Error(`outdated positioning found:\n${violations.join('\n')}`)
console.log(`OK scanned files: ${files.length}`)

console.log('\nOK public docs and integration code keep Injective core-integration positioning.')
