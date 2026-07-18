import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const panel = readFileSync(new URL('../src/app/components/PublicEarthPanel.tsx', import.meta.url), 'utf8')
const knowledgeGlobe = readFileSync(new URL('../src/app/components/PublicKnowledgeGlobe.tsx', import.meta.url), 'utf8')
const knowledgeDetails = readFileSync(new URL('../src/app/components/PublicKnowledgeDetails.tsx', import.meta.url), 'utf8')
const knowledgeMap = readFileSync(new URL('../src/app/data/publicKnowledgeMap.ts', import.meta.url), 'utf8')
const plaza = readFileSync(new URL('../src/app/components/PublicPlazaPage.tsx', import.meta.url), 'utf8')

for (const anchor of [
  'PUBLIC EARTH',
  'PublicKnowledgeGlobe',
  '8 KNOWLEDGE AGENTS · 5 CHAIN IDENTITIES',
  '/api/injective?tool=get-public-earth',
  '知识地图',
  '知识详情',
  '身份卡牌',
  'FROST IDENTITY CARD',
  'INJECTIVE VERIFIED',
  '知识卡是信息分发层 · 身份卡是可验证身份层',
]) assert.ok(panel.includes(anchor), `PublicEarthPanel missing ${anchor}`)
for (const portrait of [
  'frost-43-core.png',
  'frost-44-literature.png',
  'frost-45-noir.png',
  'frost-46-jazz.png',
  'frost-47-aurora.png',
]) {
  assert.ok(panel.includes(`/frost-identities/${portrait}`), `PublicEarthPanel missing portrait ${portrait}`)
  assert.ok(existsSync(new URL(`../public/frost-identities/${portrait}`, import.meta.url)), `portrait file missing ${portrait}`)
}
for (const anchor of [
  '<EarthMap',
  'Mapbox 公共知识新闻地图',
  'theme="public"',
  'PUBLIC KNOWLEDGE SIGNALS',
  'public-news-marker__orbit-note',
  'TOPIC_PAPERS',
  'occludedOpacity: 0',
  'SIGNAL POINTS · TAP TO APPROACH',
  'IMAGE CARDS · TAP TO READ',
  '返回全球',
]) assert.ok(knowledgeGlobe.includes(anchor), `PublicKnowledgeGlobe missing ${anchor}`)
for (const anchor of [
  'PUBLIC_KNOWLEDGE_TOPIC_STORIES',
  'moveWithinTopic',
  '上一条',
  '下一条',
  '切换八领域新闻主题',
  '待交叉核验 · 尚未进入 Merkle 版次',
  '候选新闻不会冒充事实',
]) assert.ok(knowledgeDetails.includes(anchor), `PublicKnowledgeDetails missing ${anchor}`)
assert.ok(!knowledgeGlobe.includes('public-news-editorial'), 'knowledge map tab must only render the map')
assert.ok(!knowledgeDetails.includes('public-news-editorial__visual'), 'detail view should lead with the news instead of a decorative context image')
assert.ok(knowledgeMap.includes('PUBLIC_KNOWLEDGE_TOPIC_STORIES'), 'detail reader must use the 16-signal topic cache')
for (const topic of ['ai', 'technology', 'finance', 'climate', 'science', 'health', 'culture', 'policy']) {
  assert.ok(knowledgeMap.includes(`topic: '${topic}'`), `public knowledge map missing ${topic} news card`)
}
for (const boundary of [
  '它不代表代码、私人记忆或现实地址',
  '没有使用虚构门牌',
]) assert.ok(panel.includes(boundary), `PublicEarthPanel missing boundary ${boundary}`)
assert.ok(plaza.includes('<PublicEarthPanel />'), 'public-plaza must render PublicEarthPanel')
assert.ok(plaza.includes('链上分身的空间身份与公共广场'))
assert.ok(plaza.includes('私人记忆与现实地址始终留在端侧'))
for (const forbidden of ['BUY', 'PRICE', 'RARE', 'LEGENDARY', '开卡包', '拍卖', '虚拟土地']) {
  assert.ok(!panel.toUpperCase().includes(forbidden.toUpperCase()), `PublicEarthPanel contains forbidden audience-facing wording ${forbidden}`)
}

console.log('OK Public Earth maps news-card stacks, keeps identity cards separate, and preserves candidate-versus-verified boundaries.')
