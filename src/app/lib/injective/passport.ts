// ════════════════════════════════════════════════════════════════════════════
// Taste Passport · 公开口味名片（Injective 集成 P0-1）
// ────────────────────────────────────────────────────────────────────────────
// 从长期画像 profile.ts 导出一张「可公开、可上链、可社交」的脱敏名片。
// 隐私铁律（守 profile.ts 红线，再收一道）：
//   · 只导 top-K 标签【字符串】，连 TagCount.n 热度计数都不导（防从 n 反推行为强度）；
//   · 绝不碰任何原文（书 / 影 / 乐 / 照片 / 行程 / 心情 的具体内容）；
//   · 只导「你是谁」的口味气质，不导「你做过什么」的明细。
// 这张名片才是出门社交时 FROST 带的东西；私人记忆永远留在端侧 / 你的服务器，不上链。
// ════════════════════════════════════════════════════════════════════════════
import { getProfile, profileFingerprint, getCachedTasteLine } from '../../../../frost-agent/harness/profile';

export interface TastePassport {
  v: 1;
  fingerprint: string;                 // 画像指纹：画像实质变化才变，作版本键；不暴露内容
  tasteLine: string;                   // 一句话口味气质（已是云脑脱敏摘要，可为空）
  domains: Record<string, string[]>;   // 各域 top-K 标签（纯字符串，无 n）：books/movies/music/photos/travel
  topTags: string[];                   // 跨域 top 标签（给广场相似度匹配用）
  generatedAt: string;
}

const PUBLIC_K = 5;       // 每个字段最多导出 5 个标签
const TOPTAGS_CAP = 12;   // 跨域合并后名片正面最多展示 12 个标签

/** 从长期画像组装公开 Taste Passport（脱敏：只 tag 字符串、不含 n、不含原文）。 */
export function buildTastePassport(opts?: { perField?: number }): TastePassport {
  const k = opts?.perField ?? PUBLIC_K;
  const profile = getProfile();
  const domains: Record<string, string[]> = {};
  const all: string[] = [];
  for (const [domain, fields] of Object.entries(profile.domains)) {
    const tags: string[] = [];
    for (const list of Object.values(fields)) {
      if (!Array.isArray(list) || !list.length) continue;
      // 按热度排序取 top-k 的 tag 字符串 —— 丢弃 n（热度计数不出端）
      const top = [...list].sort((a, b) => (b?.n ?? 0) - (a?.n ?? 0)).slice(0, k).map((t) => t.tag).filter(Boolean);
      tags.push(...top);
    }
    const uniq = dedup(tags);
    if (uniq.length) { domains[domain] = uniq; all.push(...uniq); }
  }
  return {
    v: 1,
    fingerprint: profileFingerprint(),
    tasteLine: getCachedTasteLine() || '',
    domains,
    topTags: dedup(all).slice(0, TOPTAGS_CAP),
    generatedAt: new Date().toISOString(),
  };
}

/** 名片是否为空（没攒够画像就别急着出门社交）。 */
export function isPassportEmpty(p: TastePassport): boolean {
  return !p.topTags.length && !p.tasteLine;
}

/** 把名片折成一段人话描述（注册 Agent Card 的 description / 广场展示用）。 */
export function passportToDescription(p: TastePassport): string {
  const parts: string[] = [];
  if (p.tasteLine) parts.push(p.tasteLine);
  if (p.topTags.length) parts.push(`口味关键词：${p.topTags.slice(0, 8).join('、')}`);
  return parts.join('。') || 'Pocket Earth 探索者';
}

/** 两张名片的口味相似度（Jaccard 标签交并比）—— 广场上「找口味相近的人」用。 */
export function passportSimilarity(a: TastePassport, b: TastePassport): number {
  const sa = new Set(a.topTags), sb = new Set(b.topTags);
  if (!sa.size || !sb.size) return 0;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  const union = sa.size + sb.size - inter;
  return union ? inter / union : 0;
}

function dedup(a: string[]): string[] { return [...new Set(a)]; }
