// 记忆中枢 · FROST 类型化记忆的统一读出口。
// 取代各 agent 手工拼 getProfileSummary + getTasteSummary：一行 assembleMemory() 把
//   【口味气质叙事 + 按评分偏爱口味 + 长期标签画像】+「记忆即空气」规则
// 拼成注入云脑 system 的记忆块。只读现成端侧记忆、绝不触发云脑；新增 agent 统一走这里，杜绝漏接。
//
// 放应用层（不放 frost-agent 内核）——它要同时聚合内核的 profile 与应用层的 taste，
// 放内核会造成「内核反向依赖应用」破坏分层；这里依赖方向是 应用→内核，正确。
// 不碰 router/intentRegistry/validator 的封闭枚举，纯文本组装。
import { getProfileSummary, getCachedTasteLine, summarizeTaste } from '../../../frost-agent/harness/profile';
import { getFrostBrain } from '../../../frost-agent/harness/brain';
import { getTasteSummary } from './taste';
import { getMoodTrace } from './mood/retrospect';
import type { MemoryKind, MemoryRecall } from './memory/types';
import { formatPublicSemanticMemory, publicSemanticStore } from './memory/publicSemantic.mjs';

// 「记忆即空气」注入规则（抄 OpenHanako）：用记忆但不出戏、不谄媚、冲突以当前对话为准。
export const MEMORY_AIR_RULES =
  '【关于以下记忆】这是跨会话沉淀下来的、你对这位用户的了解。自然融进回答即可：' +
  '不要把它当对话内容复述、不要说「我记得 / 你之前说过 / 根据你的记忆」这类话；' +
  '若它和用户当前这句话冲突，一律以当前对话为准；绝不用旧记忆去纠正或反驳用户。';

// 让「一句话口味气质」叙事层在主路径生效（此前只有打开广场页才触发，平时 narrative 多半是空的）：
// 有画像就 fire-and-forget 触发 summarizeTaste 填充/刷新缓存（内部已有 fingerprint 缓存：口味没变则 skip 云脑）。
// 本次仍读旧缓存（同步、不阻塞），刷新供下次 assembleMemory 用。
let narrPending = false;
export function ensureNarrative(): void {
  if (narrPending || !getProfileSummary()) return;
  narrPending = true;
  summarizeTaste(getFrostBrain()).catch(() => {}).finally(() => { narrPending = false; });
}

function readPrivateMemory(_opts?: { domain?: string }): { block: string; lanes: MemoryKind[] } {
  ensureNarrative();                    // 后台保鲜叙事层（不阻塞，本次用已缓存的）
  const selfParts: string[] = [];
  // 以下是私人记忆的四种“读取视图”，不是冷热存储层级里的 L1 / L2 / L3。
  const line = getCachedTasteLine();    // 一句话口味气质（已缓存，不触发云脑）
  const loved = getTasteSummary();      // 按评分的偏爱口味视图（taste.ts）
  const moodTrace = getMoodTrace();     // 情绪足迹（独立 mood 通道，读 geoStickers，不走 ProfileDomain）
  const profile = getProfileSummary();  // 长期标签画像
  if (line) selfParts.push(`# 你的口味气质（一句话）\n${line}`);
  if (loved) selfParts.push(loved);
  if (profile) selfParts.push(profile);
  const parts = [...selfParts, ...(moodTrace ? [moodTrace] : [])];
  const lanes: MemoryKind[] = [];
  if (selfParts.length) lanes.push('self');
  if (moodTrace) lanes.push('episodic');
  return {
    block: parts.length ? `${MEMORY_AIR_RULES}\n\n${parts.join('\n\n')}` : '',
    lanes,
  };
}

/** 兼容原有同步 agent 的私人记忆读出口。无记忆时返回空串。 */
export function assembleMemory(opts?: { domain?: string }): string {
  return readPrivateMemory(opts).block;
}

/**
 * 按当前问题唤醒类型化记忆。
 *
 * 私人 self / episodic 记忆仍只从浏览器本地读取；公共 semantic 记忆只从
 * `/api/knowledge` 只读检索。本函数不写 profile，也不会把公共知识并入用户画像。
 */
export async function recallMemory(query: string, opts?: { domain?: string }): Promise<MemoryRecall> {
  const privateMemory = readPrivateMemory(opts);
  const privateBlock = privateMemory.block;
  const semanticEntries = await publicSemanticStore.retrieve(query);
  const semanticBlock = formatPublicSemanticMemory(semanticEntries);
  const blocks = [privateBlock, semanticBlock].filter(Boolean);
  const lanes: MemoryKind[] = [];
  const trace: string[] = [];
  if (privateBlock) {
    lanes.push(...privateMemory.lanes);
    trace.push(`Memory Router → 私人 ${privateMemory.lanes.join(' / ')} 记忆（端侧只读）`);
  }
  if (semanticEntries.length) {
    lanes.push('semantic');
    trace.push(`Memory Router → 公共 semantic 记忆（${semanticEntries.length} 条可信记录，只读）`);
  }
  return {
    block: blocks.join('\n\n'),
    lanes: [...new Set(lanes)],
    entries: semanticEntries,
    trace,
  };
}

/** 兼容只需要 prompt 文本的 agent。 */
export async function assembleMemoryForQuery(query: string, opts?: { domain?: string }): Promise<string> {
  return (await recallMemory(query, opts)).block;
}
