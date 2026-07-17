import { useState } from 'react';
import { Database, Download, Globe2, ShieldCheck } from 'lucide-react';
import DailyKnowledgePage from './DailyKnowledgePage';
import PublicEarthPanel from './PublicEarthPanel';

export default function PublicEarthPage() {
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);

  if (knowledgeOpen) return <DailyKnowledgePage onBack={() => setKnowledgeOpen(false)} />;

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#EAEAEA] overflow-hidden">
      <header className="px-4 py-3 border-b-2 border-black bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 border-2 border-black bg-[#315e4b] text-white flex items-center justify-center shrink-0">
            <Globe2 className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h1 className="font-pixel text-[15px] uppercase tracking-wider">PUBLIC EARTH</h1>
            <p className="text-[9px] text-black/55 mt-1">公共身份住在地球上 · 公共知识以可验证版次流动</p>
          </div>
        </div>
      </header>

      <div className="px-3 py-2 border-b-2 border-black bg-black text-[#7CFF6B] shrink-0">
        <div className="font-pixel text-[8px] flex items-center justify-between tracking-wider">
          <span>5 RESIDENTS · 8 KNOWLEDGE AGENTS</span>
          <span className="text-white/45">INJECTIVE TESTNET</span>
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <PublicEarthPanel />

        <button
          type="button"
          onClick={() => setKnowledgeOpen(true)}
          className="w-full text-left border-[3px] border-black bg-[#e7efff] p-3 shadow-[3px_3px_0_#000] active:translate-y-px"
          data-testid="public-knowledge-entry"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-10 h-10 border-2 border-black bg-[#2357d9] text-white flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-pixel text-[10px] tracking-wider">PUBLIC KNOWLEDGE LAYER</div>
              <div className="text-[10px] text-black/60 leading-relaxed mt-1">AI、科技、金融、气候、科学、健康、文化与政策 Agent 每日筛选公开信息，核验后形成版次。</div>
            </div>
            <span className="font-pixel text-[7px] border-2 border-black bg-black text-[#7CFF6B] px-2 py-1.5 shrink-0">OPEN</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <span className="min-h-10 border-2 border-black bg-white px-2 py-2 flex items-center gap-1.5 text-[9px]"><ShieldCheck className="w-3.5 h-3.5" />Merkle 证明</span>
            <span className="min-h-10 border-2 border-black bg-white px-2 py-2 flex items-center gap-1.5 text-[9px]"><Download className="w-3.5 h-3.5" />离线资源包</span>
          </div>
          <p className="text-[8px] text-black/45 mt-2 leading-relaxed">渲染在端上，内容在包里，指纹在 Injective 上；私人记忆不会进入公共知识层。</p>
        </button>
      </main>
    </div>
  );
}
