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
const vaguePositioningSnippets = [
  '它们' + '在地球',
  '钉回' + '它们',
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
const indexHtml = readFileSync(resolve(projectRoot, 'index.html'), 'utf8')
const webManifest = JSON.parse(readFileSync(resolve(projectRoot, 'public/manifest.webmanifest'), 'utf8'))
const publicPlaza = readFileSync(resolve(projectRoot, 'src/app/components/PublicPlazaPage.tsx'), 'utf8')
const vagueRecordPlace = '它们' + '在地球上的那个地点'
assertTrue('README uses explicit Pocket Earth definition heading', rootReadme.includes('## 一、Pocket Earth 是什么'))
assertTrue('README omits ambiguous product heading', !/^## 一、.{0,2}是什么$/m.test(rootReadme))
assertTrue('README uses product-first three-entry heading', rootReadme.includes('## 二、三入口，一颗地球'))
assertTrue('README omits UI-jargon three-tab heading', !/^## 二、.{0,4}Tab$/m.test(rootReadme))
assertTrue('README names Frost Edge Node hardware direction explicitly', rootReadme.includes('Frost Edge Node 硬件方向的商业判断'))
assertTrue('hardware README names module subject explicitly', hardwareReadme.includes('Frost Edge Node 模块先承担三个角色'))
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
  ['INJECTIVE-INTEGRATION/README.md', '证明它不是单页概念图'],
  ['INJECTIVE-INTEGRATION/README.md', '它会串起公开证据包'],
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
  for (const forbidden of vaguePositioningSnippets) {
    if (text.includes(forbidden.toLowerCase())) violations.push(`${label}: ${forbidden}`)
  }
}
if (violations.length) throw new Error(`outdated positioning found:\n${violations.join('\n')}`)
console.log(`OK scanned files: ${files.length}`)

console.log('\nOK public docs and integration code keep Injective core-integration positioning.')
