import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const app = read('../src/app/App.tsx')
const hub = read('../src/app/components/EarthHubTab.tsx')
const tabs = read('../src/app/components/EarthModeTabs.tsx')
const publicEarth = read('../src/app/components/PublicEarthPage.tsx')
const agents = read('../src/app/components/PublicKnowledgeAgents.tsx')
const data = read('../src/app/data/publicKnowledgeAgents.ts')
const consolePage = read('../src/app/components/MusicAgentsTab.tsx')

assert.match(app, /<EarthHubTab/)
assert.match(hub, /mode === 'private'/)
assert.match(tabs, /PRIVATE MAP/)
assert.match(tabs, /PUBLIC EARTH/)
assert.match(publicEarth, /<PublicEarthPanel/)
assert.match(publicEarth, /PUBLIC KNOWLEDGE LAYER/)
assert.match(consolePage, /PUBLIC AGENTS/)
assert.match(consolePage, /<PublicKnowledgeAgents/)
assert.equal((data.match(/id: '(ai|technology|finance|climate|science|health|culture|policy)'/g) || []).length, 8)
assert.equal((data.match(/id: '(intake|evidence-scout|investigator|skeptic|judge|receipt)'/g) || []).length, 6)
assert.match(agents, /Signal Supervisor/)
assert.match(agents, /FactRelay Supervisor/)
assert.doesNotMatch(`${publicEarth}\n${agents}\n${consolePage}`, /付费|支付|结算|售价|创作者收入/)

console.log('Earth split and complete public-agent network UI verified.')
