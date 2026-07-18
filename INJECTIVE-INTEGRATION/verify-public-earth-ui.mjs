import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const panel = readFileSync(new URL('../src/app/components/PublicEarthPanel.tsx', import.meta.url), 'utf8')
const plaza = readFileSync(new URL('../src/app/components/PublicPlazaPage.tsx', import.meta.url), 'utf8')

for (const anchor of [
  'PUBLIC EARTH',
  '<EarthMap',
  'Mapbox 公共地球门牌地图',
  'theme="public"',
  'SYMBOLIC COORDINATES · NOT REAL ADDRESSES',
  '口袋地球装记忆 · 公共地球住分身',
  '/api/injective?tool=get-public-earth',
  '地球 · 门牌',
  '身份 · 卡牌',
  'FROST IDENTITY CARD',
  'INJECTIVE VERIFIED',
  '地球是空间关系层 · 卡牌是可验证身份层',
]) assert.ok(panel.includes(anchor), `PublicEarthPanel missing ${anchor}`)
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

console.log('OK Public Earth UI keeps Earth as the spatial layer, cards as the identity layer, and economic/virtual-land framing out.')
