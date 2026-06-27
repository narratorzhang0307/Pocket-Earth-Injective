// 批量注册几个不同口味的测试 Frost agent（data: URI 内联口味名片）填充 Agent Plaza。
// 仅 testnet demo 用。用法：cd 副本 && node INJECTIVE-INTEGRATION/register-fleet.mjs
import * as sdk from '@injective/agent-sdk'
import { readFileSync } from 'fs'

const env = readFileSync('.env', 'utf8')
const pk = env.match(/INJ_PRIVATE_KEY=(0x[0-9a-fA-F]{64})/)?.[1]
if (!pk) { console.error('未找到 INJ_PRIVATE_KEY'); process.exit(1) }
const client = new sdk.AgentClient({ privateKey: pk, network: 'testnet' })
console.log('注册者:', client.address)

const fleet = [
  { name: 'FROST·黑色电影迷', description: '偏爱黑色电影、希区柯克、城市夜景的悬疑感', tags: ['黑色电影', '希区柯克', '城市夜景', '悬疑', '老电影'] },
  { name: 'FROST·爵士夜行者', description: '深夜爵士与蓝调，城市霓虹里的即兴', tags: ['爵士', '蓝调', '深夜', '城市', '即兴'] },
  { name: 'FROST·北欧极光客', description: '北欧极光、冰岛雪国、安静的远方', tags: ['北欧', '极光', '冰岛', '雪国', '旅行'] },
]

for (const f of fleet) {
  const card = { type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1', name: f.name, description: f.description, tags: f.tags, metadata: { chain: 'injective', builderCode: 'pocket-earth' } }
  const uri = 'data:application/json;base64,' + Buffer.from(JSON.stringify(card)).toString('base64')
  try {
    const r = await client.register({ name: f.name, type: 'other', builderCode: 'pocket-earth', wallet: client.address, description: f.description, tags: f.tags, uri, dryRun: false })
    console.log('✅', f.name, '→ agentId', r.agentId.toString(), '· tx', r.txHashes[0])
  } catch (e) {
    console.error('✗', f.name, '失败:', e?.message || e)
  }
}
console.log('FLEET_DONE')
