import { Bot, Database, RadioTower, ShieldCheck } from 'lucide-react';
import { PUBLIC_SIGNAL_AGENTS, VERIFICATION_AGENTS } from '../data/publicKnowledgeAgents';
import type { KnowledgeTopic } from '../lib/chronicle/types';

interface Props {
  onOpenTopic: (topic: KnowledgeTopic) => void;
}

export default function PublicKnowledgeAgents({ onOpenTopic }: Props) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4" data-testid="public-knowledge-agents">
      <button
        type="button"
        onClick={() => onOpenTopic('ai')}
        className="w-full text-left border-[3px] border-black bg-[#e7efff] p-3 shadow-[3px_3px_0_#000] active:translate-y-px"
      >
        <div className="flex items-start gap-2.5">
          <div className="w-11 h-11 border-2 border-black bg-[#2357d9] text-white flex items-center justify-center shrink-0"><Database className="w-5 h-5" /></div>
          <div className="min-w-0 flex-1">
            <div className="font-pixel text-[10px]">PUBLIC KNOWLEDGE NETWORK</div>
            <p className="text-[10px] text-black/60 leading-relaxed mt-1">领域 Agent 找出重要信号，事实核验 Agent 交叉审查；通过的知识进入每日版次与可下载资源包。</p>
          </div>
          <span className="font-pixel text-[7px] border-2 border-black bg-black text-[#7CFF6B] px-1.5 py-1 shrink-0">OPEN</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-3 text-center">
          <span className="border border-black bg-white p-1.5"><b className="block font-pixel text-[10px]">8</b><small className="text-[7px]">领域 AGENT</small></span>
          <span className="border border-black bg-white p-1.5"><b className="block font-pixel text-[10px]">6</b><small className="text-[7px]">核验 AGENT</small></span>
          <span className="border border-black bg-white p-1.5"><b className="block font-pixel text-[10px]">1</b><small className="text-[7px]">每日版次</small></span>
        </div>
      </button>

      <section>
        <div className="flex items-end justify-between gap-2 mb-2">
          <div>
            <h2 className="font-pixel text-[10px] tracking-widest">SIGNAL DESK</h2>
            <p className="text-[9px] text-black/45 mt-1">全球信号主理人 · 路由八个公共领域</p>
          </div>
          <span className="font-pixel text-[7px] border border-black bg-[#7CFF6B] px-1.5 py-1">8 SUBAGENTS</span>
        </div>
        <div className="border-2 border-black bg-black text-white p-2.5 mb-2 flex items-center gap-2.5 shadow-[2px_2px_0_#7CFF6B]">
          <div className="w-9 h-9 border-2 border-white/70 text-[#7CFF6B] flex items-center justify-center shrink-0"><Bot className="w-4 h-4" /></div>
          <div className="min-w-0 flex-1"><span className="font-pixel text-[7px] text-white/45">MAIN AGENT</span><b className="block text-[11px] mt-0.5">Signal Supervisor · 全球信号主理人</b><small className="block text-[8px] text-white/55 mt-0.5">按领域与日期路由公共信号</small></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PUBLIC_SIGNAL_AGENTS.map((agent) => (
            <button
              type="button"
              key={agent.id}
              onClick={() => onOpenTopic(agent.id)}
              className="min-h-[106px] text-left border-2 border-black bg-white p-2 shadow-[2px_2px_0_#000] active:translate-y-px relative overflow-hidden"
            >
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: agent.color }} />
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="w-7 h-7 border-2 border-black flex items-center justify-center" style={{ background: agent.color }}><RadioTower className="w-3.5 h-3.5" /></span>
                <span className="font-pixel text-[6px] border border-black px-1 py-0.5 bg-[#EAEAEA]">PUBLIC</span>
              </div>
              <div className="font-pixel text-[7px] leading-tight mt-2">{agent.name}</div>
              <div className="text-[10px] font-bold mt-1">{agent.label}</div>
              <div className="text-[8px] text-black/45 leading-tight mt-1">{agent.role}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-2 mb-2">
          <div>
            <h2 className="font-pixel text-[10px] tracking-widest">FACT RELAY</h2>
            <p className="text-[9px] text-black/45 mt-1">事实核验主理人 · 六个有边界的角色</p>
          </div>
          <span className="font-pixel text-[7px] border border-black bg-black text-[#7CFF6B] px-1.5 py-1">6 STAGES</span>
        </div>
        <div className="border-2 border-black bg-[#315e4b] text-white p-2.5 mb-2 flex items-center gap-2.5 shadow-[2px_2px_0_#000]">
          <div className="w-9 h-9 border-2 border-white/70 flex items-center justify-center shrink-0"><ShieldCheck className="w-4 h-4" /></div>
          <div className="min-w-0 flex-1"><span className="font-pixel text-[7px] text-white/50">MAIN AGENT</span><b className="block text-[11px] mt-0.5">FactRelay Supervisor · 事实核验主理人</b><small className="block text-[8px] text-white/60 mt-0.5">把单条主张送入有边界的核验程序</small></div>
        </div>
        <div className="space-y-2">
          {VERIFICATION_AGENTS.map((agent, index) => (
            <div key={agent.id} className="border-2 border-black bg-white p-2.5 shadow-[2px_2px_0_rgba(0,0,0,0.85)] flex items-start gap-2.5">
              <div className="w-9 h-9 border-2 border-black bg-black text-[#7CFF6B] flex flex-col items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
                <span className="font-pixel text-[6px] mt-0.5">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-pixel text-[8px] leading-tight">{agent.name} · {agent.label}</div>
                <div className="text-[9px] text-black/55 leading-snug mt-1">{agent.role}</div>
              </div>
              <span className="font-pixel text-[6px] border border-black bg-[#EAEAEA] px-1 py-1 shrink-0 max-w-[74px] text-center leading-tight">{agent.skill}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="border-2 border-black bg-[#dff8e9] p-2.5 flex items-start gap-2 text-[9px] leading-relaxed">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
        <p><b>边界：</b>重要性评分不等于真实度。领域 Agent 只负责发现信号；进入公共知识版次前，仍需证据检索、双角色交叉核验与确定性评分。</p>
      </div>
    </div>
  );
}
