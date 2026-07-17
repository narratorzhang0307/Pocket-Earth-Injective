import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const page = read('../src/app/components/DailyKnowledgePage.tsx')
const tab = read('../src/app/components/MusicAgentsTab.tsx')
const catalog = read('../src/app/lib/plaza/catalog.ts')
const plaza = read('../src/app/components/AgentPlazaPage.tsx')

const checks = [
  ['knowledge page reads today API', page.includes('/api/knowledge?tool=today&topic=')],
  ['record card reads Merkle proof API', page.includes('/api/knowledge?tool=proof&recordHash=')],
  ['offline sample is labelled honestly', page.includes('OFFLINE 策展样例') && page.includes('不声称已经运行实时模型核验')],
  ['private/public boundary is visible', page.includes('PRIVATE MEMORY STAYS LOCAL') && page.includes('不上传你的私人记忆')],
  ['Injective anchor link is rendered from API', page.includes('data.edition.anchor.scanUrl') && page.includes('INJECTIVE 已锚定')],
  ['agent console routes to knowledge page', tab.includes("'daily-knowledge': 'knowledge'") && tab.includes('<DailyKnowledgePage')],
  ['plaza card links real Chronicle contract', catalog.includes('0x3f0e5daeb81eea1b41ca80ae483acdb8de0f0c25') && catalog.includes("runTarget: 'daily-knowledge'")],
  ['final plaza UI has no payment pitch', !/(付费|支付|结算|售价|创作者收入)/.test(plaza) && !/(付费|支付|结算|售价|创作者收入)/.test(tab)],
]

let failed = false
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
  if (!ok) failed = true
}

if (failed) process.exit(1)
console.log(`\nKnowledge UI ready: ${checks.length}/${checks.length}`)
