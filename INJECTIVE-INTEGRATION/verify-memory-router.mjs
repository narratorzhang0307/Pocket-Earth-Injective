import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  formatPublicSemanticMemory,
  publicSemanticStore,
  retrievePublicSemanticMemory,
  selectPublicKnowledgeTopics,
} from '../src/app/lib/memory/publicSemantic.mjs'

const root = resolve(import.meta.dirname, '..')

assert.deepEqual(selectPublicKnowledgeTopics('今天 AI 有什么最新进展？'), ['ai'])
assert.deepEqual(selectPublicKnowledgeTopics('最近金融和监管有什么可信消息？'), ['finance', 'policy'])
assert.deepEqual(selectPublicKnowledgeTopics('我喜欢什么电影？'), [])
assert.equal(publicSemanticStore.kind, 'semantic')
assert.equal(publicSemanticStore.retrieve, retrievePublicSemanticMemory)

let calls = 0
const fetcher = async (url) => {
  calls += 1
  assert.match(String(url), /tool=today&topic=ai/)
  return {
    ok: true,
    async json() {
      return {
        mode: 'archive',
        topic: 'ai',
        memoryTier: 'L3-long-term-reviewed-memory',
        generatedAt: '2026-07-18T00:10:00.000Z',
        edition: { editionRoot: `0x${'1'.repeat(64)}`, anchor: { txHash: `0x${'2'.repeat(64)}` } },
        records: [
          {
            id: 'kept', topic: 'ai', createdAt: '2026-07-18T00:10:00.000Z',
            claim: '一条经过交叉核验的 AI 事实。', summary: '这是摘要。', verdict: 'supported', truthScore: 91,
            recordHash: `0x${'3'.repeat(64)}`,
            sources: [{ title: 'Official source', publisher: 'Official Lab', url: 'https://example.com/source', publishedAt: '2026-07-18' }],
          },
          {
            id: 'dropped', topic: 'ai', claim: '证据不足的候选。', verdict: 'insufficient', truthScore: 48,
            sources: [{ title: 'Weak source', publisher: 'Unknown', url: 'https://example.com/weak' }],
          },
        ],
      }
    },
  }
}

const entries = await retrievePublicSemanticMemory('今天 AI 有什么新闻？', { fetcher })
assert.equal(calls, 1)
assert.equal(entries.length, 1)
assert.equal(entries[0].kind, 'semantic')
assert.equal(entries[0].tier, 'long-term')
assert.equal(entries[0].metadata.anchored, true)
assert.equal(entries[0].trustScore, 91)

const block = formatPublicSemanticMemory(entries)
assert.match(block, /公共语义记忆（只读，与私人画像隔离）/)
assert.match(block, /Injective 版次已锚定/)
assert.match(block, /Official Lab/)
assert.doesNotMatch(block, /证据不足的候选/)

const noFetch = await retrievePublicSemanticMemory('我喜欢什么电影？', {
  fetcher: async () => { throw new Error('private question must not fetch public knowledge') },
})
assert.deepEqual(noFetch, [])

const memoryRouter = readFileSync(resolve(root, 'src/app/lib/memoryRouter.ts'), 'utf8')
const frostPage = readFileSync(resolve(root, 'src/app/components/FrostBuddyPage.tsx'), 'utf8')
const contextTypes = readFileSync(resolve(root, 'frost-agent/harness/types.ts'), 'utf8')
const generalAgent = readFileSync(resolve(root, 'frost-agent/agents/general/index.ts'), 'utf8')
assert.match(memoryRouter, /publicSemanticStore\.retrieve\(query\)/)
assert.match(memoryRouter, /不会把公共知识并入用户画像/)
assert.doesNotMatch(memoryRouter, /recordSignals\(/)
assert.match(frostPage, /const recalled = await recallMemory\(text\)/)
assert.match(frostPage, /memory: recalled\.block/)
assert.match(contextTypes, /memory\?: string/)
assert.match(generalAgent, /读取公共地球的可信知识版次/)
assert.match(generalAgent, /不得冒充已经锚定/)
assert.match(generalAgent, /不要再把话题转回电台或邀请用户听歌/)

console.log('memory router verification passed')
