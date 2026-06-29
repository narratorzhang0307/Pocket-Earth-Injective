// Guard public docs and integration code against outdated positioning terms.
// Usage: npm run verify:positioning
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const integrationDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(integrationDir, '..')
const scanExtensions = new Set(['.md', '.mjs', '.js', '.ts', '.tsx', '.json'])
const scanRoots = [
  'README.md',
  'ARCHITECTURE.md',
  'package.json',
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
assertTrue('README uses explicit Pocket Earth definition heading', rootReadme.includes('## 一、Pocket Earth 是什么'))
assertTrue('README omits ambiguous product heading', !rootReadme.includes('## 一、它是什么'))
const explicitPublicDocSnippets = [
  ['README.md', '它立刻被钉回真实坐标'],
  ['README.md', 'Injective 在这里不是装饰徽章'],
  ['README.md', '这个集成是否扎实'],
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
}
if (violations.length) throw new Error(`outdated positioning found:\n${violations.join('\n')}`)
console.log(`OK scanned files: ${files.length}`)

console.log('\nOK public docs and integration code keep Injective core-integration positioning.')
