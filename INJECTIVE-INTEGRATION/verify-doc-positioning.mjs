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
