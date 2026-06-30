// 空间 Agent 广场（前瞻）—— AGENTS 入口从「功能列表」长成「有边界·有审核·有分发·有支付」的 agent 平台。
// 每张卡把上架 agent 必须声明的五要素摆出来：① 空间对象 ② 权限 ③ 端/云 ④ Injective 链上身份 ⑤ 是否付费。
// 真 agent（旅行/音乐/电影/读书/照片）OPEN 直达真运行页（复用 onRun=runSkill），让前瞻广场立刻可信；
// 前瞻例（观鸟/播客/链上见闻）免费的 INSTALL 只切本地态、不真装载远程代码（PWA 跑第三方代码=安全黑洞），
// 付费的价签只展示不可点（支付入口随平台开放），底部守则带如实标注。
import { useState, useEffect } from 'react';
import { ChevronLeft, Boxes, Cpu, Cloud, Link2, ExternalLink, Lock, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { SPACE_AGENTS } from '../lib/plaza/catalog';
import {
  SPACE_OBJECT_LABEL, SCOPE_LABEL, RUNTIME_LABEL, pricingLabel, toManifest,
  type SpaceAgent, type OnChainIdentity,
} from '../lib/plaza/spaceAgent';
import { installAgent, getCustomAgents, subscribeCustomAgents } from '../lib/agent';

interface Props {
  onBack: () => void;
  onRun: (target: string) => void;   // 复用 MusicAgentsTab.runSkill：OPEN 直达真 agent、发布卡跳 agent-forge
}

const ACCENT = '#7c5cff';           // Injective 链上紫（与 public-plaza OnChainBadge 同源）
const PILL = 'text-[9px] border border-black px-1.5 py-0.5 bg-[#EAEAEA] tracking-wide inline-flex items-center gap-1';

// 链上身份徽章：实心紫 + 白字 + 黑框（与 PublicPlazaPage 的 OnChainBadge 逐字同款），点击跳 Injective blockscout（真实可查）。
function ChainBadge({ id }: { id: OnChainIdentity }) {
  return (
    <a href={id.explorerUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
      className="text-[9px] font-pixel tracking-wide border border-black text-white px-1.5 py-0.5 inline-flex items-center gap-1 active:translate-y-px"
      style={{ background: ACCENT }}>
      <Link2 className="w-2.5 h-2.5" strokeWidth={2.5} />{id.label}<ExternalLink className="w-2.5 h-2.5" strokeWidth={2.5} />
    </a>
  );
}

// 单张 agent 卡（真组件，五要素徽带是灵魂）。
function SpaceAgentCard({ a, index, isInstalled, onInstall, onRun }: {
  a: SpaceAgent; index: number; isInstalled: boolean; onInstall: () => void; onRun: (target: string) => void;
}) {
  const price = pricingLabel(a.pricing);
  // 主操作徽章：真 agent → OPEN 直达；免费前瞻 → INSTALL（切本地态）；付费前瞻 → 价签不可点；已装 → ✓
  let badge: { text: string; cls: string; onClick?: () => void };
  if (a.runTarget) {
    badge = { text: 'OPEN', cls: 'bg-black text-[#7CFF6B]', onClick: () => onRun(a.runTarget!) };
  } else if (isInstalled) {
    badge = { text: '✓ 已装', cls: 'bg-[#d9d9d9] text-black' };
  } else if (!price.paid) {
    badge = { text: '▶ INSTALL', cls: 'bg-black text-[#7CFF6B]', onClick: onInstall };
  } else {
    // 付费前瞻：价格只展示、不可点（支付入口随平台开放），避免「点价格=免费装上」的语义矛盾
    badge = { text: price.text, cls: 'bg-black text-[#ff8a3d]' };
  }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className={`bg-white border-2 border-black p-2.5 shadow-[2px_2px_0_rgba(0,0,0,0.85)] ${a.reviewed ? '' : 'opacity-60'}`}>
      {/* 顶行：方块 + 名 + 主操作 */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 shrink-0 bg-black border border-black flex items-center justify-center" style={{ boxShadow: `1px 1px 0px ${a.color}` }}>
          <div className="w-1.5 h-1.5" style={{ background: a.color }} />
        </div>
        <div className="font-pixel text-[9px] tracking-wide truncate flex-1">{a.name}</div>
        <button onClick={badge.onClick} disabled={!badge.onClick}
          className={`shrink-0 font-pixel text-[6px] uppercase tracking-wider border border-black px-1.5 py-1 active:translate-y-px ${badge.cls} ${badge.onClick ? '' : 'cursor-default'}`}>
          {badge.text}
        </button>
      </div>
      {/* 副行：一句话 + 发布者 */}
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[11px] text-black/60 leading-tight flex-1">{a.tagline}</span>
        <span className="text-[9px] text-black/40 shrink-0">by {a.publisher}</span>
      </div>
      {/* 五要素徽带（卡的灵魂）：① 空间对象 ② 权限 ③ 端/云 ④ 链上 ⑤ 付费 */}
      <div className="mt-2 flex flex-wrap gap-1">
        <span className={PILL}><span style={{ color: a.color }}>◍</span>{SPACE_OBJECT_LABEL[a.spaceObject]}</span>
        <span className={PILL}><Lock className="w-2.5 h-2.5" strokeWidth={2.5} />{a.permissions.scopes.map((s) => SCOPE_LABEL[s]).join('·')}</span>
        <span className={PILL}>{a.runtime === 'cloud' ? <Cloud className="w-2.5 h-2.5" strokeWidth={2.5} /> : <Cpu className="w-2.5 h-2.5" strokeWidth={2.5} />}{RUNTIME_LABEL[a.runtime]}</span>
        {a.onChain ? <ChainBadge id={a.onChain} /> : <span className={`${PILL} text-black/45`}>链上 —</span>}
        <span className={PILL} style={price.paid ? { borderColor: '#ff8a3d', color: '#c45a00' } : { borderColor: '#00aa55', color: '#00824a' }}>
          {price.paid ? '¥' : <Check className="w-2.5 h-2.5" strokeWidth={2.5} />}{price.text}
        </span>
      </div>
    </motion.div>
  );
}

type Filter = 'all' | 'free' | 'paid' | 'edge' | 'onchain';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '全部' }, { key: 'free', label: '免费' }, { key: 'paid', label: '付费' },
  { key: 'edge', label: '端侧' }, { key: 'onchain', label: '链上' },
];
function match(a: SpaceAgent, f: Filter): boolean {
  if (f === 'all') return true;
  if (f === 'free') return a.pricing.model === 'free';
  if (f === 'paid') return a.pricing.model !== 'free';
  if (f === 'edge') return a.runtime === 'edge' || a.runtime === 'hybrid';
  return !!a.onChain;
}

export default function AgentPlazaPage({ onBack, onRun }: Props) {
  // 已装 = 控制台里已有同名 agent（订阅 customAgents，与 AGENTS 入口实时同步）
  const [installedNames, setInstalledNames] = useState<Set<string>>(() => new Set(getCustomAgents().map((c) => c.name)));
  useEffect(() => subscribeCustomAgents(() => setInstalledNames(new Set(getCustomAgents().map((c) => c.name)))), []);
  const [filter, setFilter] = useState<Filter>('all');

  // 添加 = 过安全闸 installAgent，真的进控制台「我的 AGENT」（切回 AGENTS 入口即可见）
  const install = (a: SpaceAgent) => {
    const { review } = installAgent(toManifest(a));
    if (!review.ok) console.warn('[plaza] 安装失败：', a.name, review.reasons);   // 防未来改 catalog 触发静默失败
  };

  const shown = SPACE_AGENTS.filter((a) => match(a, filter));
  const featured = shown.filter((a) => a.group === 'featured');
  const builtin = shown.filter((a) => a.group === 'installed');
  // 状态条是广场总况（不随筛选变）：已装=自带真 agent + 已添加的前瞻例；可装=免费前瞻例里还没添加的。
  const nInstalled = SPACE_AGENTS.filter((a) => a.group === 'installed').length + SPACE_AGENTS.filter((a) => a.group === 'featured' && installedNames.has(a.name)).length;
  const nAvail = SPACE_AGENTS.filter((a) => a.group === 'featured' && !a.runTarget && a.pricing.model === 'free' && !installedNames.has(a.name)).length;

  return (
    <div className="h-full flex flex-col font-sans overflow-hidden" style={{ background: '#EAEAEA' }}>
      {/* [A] Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b-2 border-black bg-white shrink-0">
        <button onClick={onBack} className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center shadow-[1px_1px_0_#000] active:translate-y-px">
          <ChevronLeft className="w-4 h-4" strokeWidth={3} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-pixel text-[11px] tracking-wider truncate">AGENT-PLAZA</div>
          <div className="text-[9px] text-black/45 leading-tight mt-0.5">空间 agent 广场 · 前瞻</div>
        </div>
        <Boxes className="w-4 h-4" strokeWidth={2.5} style={{ color: ACCENT }} />
      </div>

      {/* [B] 黑底状态条：呼应「有边界·有审核·有分发·有支付」 */}
      <div className="px-4 py-2.5 border-b-2 border-black bg-black shrink-0" style={{ color: '#7CFF6B' }}>
        <div className="font-pixel text-[8px] flex justify-between items-center tracking-wider">
          <span>已装 {nInstalled}</span><span className="opacity-40">|</span>
          <span>可装 {nAvail}</span><span className="opacity-40">|</span>
          <span>有边界·有审核</span><span className="opacity-40">|</span>
          <span>有分发·有支付</span>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2.5">
        {/* [C] 平台说明卡：把「五要素必须说明」前置为全局规则 */}
        <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0_rgba(0,0,0,0.85)]">
          <div className="text-[11px] text-black/70 leading-snug">
            每个空间 agent 都说清：处理哪类<b>空间对象</b> · 需要哪些<b>权限</b> · 跑在<b>端侧/云端</b> · 有没有 <b>Injective 链上身份</b> · 未来<b>是否付费</b>。
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className={PILL}>◍ 空间对象</span>
            <span className={PILL}><Lock className="w-2.5 h-2.5" strokeWidth={2.5} />权限</span>
            <span className={PILL}><Cpu className="w-2.5 h-2.5" strokeWidth={2.5} />端 / 云</span>
            <span className="text-[9px] font-pixel tracking-wide border border-black text-white px-1.5 py-0.5 inline-flex items-center gap-1" style={{ background: ACCENT }}><Link2 className="w-2.5 h-2.5" strokeWidth={2.5} />链上身份</span>
            <span className={PILL} style={{ borderColor: '#ff8a3d', color: '#c45a00' }}>¥ 支付</span>
          </div>
        </div>

        {/* [D] 发布入口卡：接真 AGENT-FORGE（声明式 manifest 工厂正是「发布符合空间逻辑 agent」的真通道） */}
        <button onClick={() => onRun('agent-forge')}
          className="w-full text-left flex items-center gap-2.5 border-2 border-black p-2.5 shadow-[3px_3px_0_rgba(0,0,0,0.85)] active:translate-y-px"
          style={{ background: '#f1eeff' }}>
          <div className="w-3 h-3 shrink-0 bg-black border border-black flex items-center justify-center" style={{ boxShadow: `1px 1px 0px ${ACCENT}` }}>
            <div className="w-1.5 h-1.5" style={{ background: ACCENT }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-pixel text-[11px] tracking-wider text-black">PUBLISH · 发布你的 agent</div>
            <div className="text-[10px] text-black/60 leading-snug mt-0.5">符合空间逻辑才能上架：声明五要素 · 申请最小权限 · 选端/云 · 可选绑 Injective · 设价 → 过审分发</div>
          </div>
          <span className="shrink-0 font-pixel text-[6px] uppercase tracking-wider border border-black bg-black text-[#ff8a3d] px-1.5 py-1">▶ 去发布</span>
        </button>

        {/* [E] 筛选药丸条：呼应「免费或付费」 */}
        <div className="grid grid-cols-5 gap-1.5">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`border-2 border-black py-1.5 font-pixel text-[7px] uppercase tracking-wider active:translate-y-px ${filter === f.key ? 'text-white shadow-[1px_1px_0_#000]' : 'bg-white text-black'}`}
              style={filter === f.key ? { background: ACCENT } : undefined}>
              {f.label}
            </button>
          ))}
        </div>

        {/* [F] 精选：四个口播前瞻例 */}
        {featured.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h2 className="font-pixel text-[11px] tracking-widest">★ 精选 FEATURED</h2>
              <span className="text-[9px] text-black/45">符合空间逻辑的示例</span>
            </div>
            {featured.map((a, i) => (
              <SpaceAgentCard key={a.id} a={a} index={i} isInstalled={installedNames.has(a.name)} onInstall={() => install(a)} onRun={onRun} />
            ))}
          </div>
        )}

        {/* [G] 自带：已上架的真 agent（OPEN 直达，证明广场不空壳） */}
        {builtin.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h2 className="font-pixel text-[11px] tracking-widest">自带 BUILT-IN</h2>
              <span className="text-[9px] text-black/45">已上架运行</span>
            </div>
            {builtin.map((a, i) => (
              <SpaceAgentCard key={a.id} a={a} index={i} isInstalled={installedNames.has(a.name)} onInstall={() => install(a)} onRun={onRun} />
            ))}
          </div>
        )}

        {/* [H] 守则带 + 诚实脚注 */}
        <div className="text-center text-[8px] font-pixel text-black/30 pt-1.5 tracking-widest leading-relaxed">
          有边界 · 有审核 · 有分发 · 有支付 — 不是杂乱的 AI 工具箱<br />
          前瞻接口 · 安装 / 支付 / 链上身份将随平台开放 · 主动权始终在你
        </div>
      </div>
    </div>
  );
}
