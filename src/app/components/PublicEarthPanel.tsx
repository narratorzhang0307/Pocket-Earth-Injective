import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Globe2, IdCard, Link2, Newspaper, ShieldCheck } from 'lucide-react';
import PublicKnowledgeGlobe from './PublicKnowledgeGlobe';
import PublicKnowledgeDetails from './PublicKnowledgeDetails';
import type { KnowledgeTopic } from '../lib/chronicle/types';

type Zone = { id: number; name: string; english: string; color: string };
type Residence = {
  agentId: number;
  displayName: string;
  doorplate: string;
  publicTraits: string[];
  cardVersion: number;
  zone: number;
  zoneInfo?: Zone;
  cardHash: string;
  revision: number;
};
type PublicEarthResponse = {
  live: boolean;
  contract: { address: string; scanUrl: string };
  residences: Residence[];
};

interface Props { onOpenTopic?: (topic: KnowledgeTopic) => void }

const COLORS: Record<number, string> = { 43: '#273F58', 44: '#486B8A', 45: '#A05E47', 46: '#6E5A8A', 47: '#86713F' };
const PORTRAITS: Record<number, { src: string; viewBox: string }> = {
  43: { src: '/frost-identities/frost-nft-group-1.png', viewBox: '4 4 504 504' },
  44: { src: '/frost-identities/frost-nft-group-1.png', viewBox: '516 4 504 504' },
  45: { src: '/frost-identities/frost-nft-group-2.png', viewBox: '1028 4 504 504' },
  46: { src: '/frost-identities/frost-nft-group-1.png', viewBox: '516 516 504 504' },
  47: { src: '/frost-identities/frost-nft-group-1.png', viewBox: '1028 4 504 504' },
};

function shortHash(hash: string) {
  return hash ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : '—';
}

function CardView({ data, selected, onSelect }: { data: PublicEarthResponse; selected: Residence; onSelect: (item: Residence) => void }) {
  const selectedIndex = Math.max(0, data.residences.findIndex((item) => item.agentId === selected.agentId));
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackRef.current?.querySelector<HTMLElement>(`[data-agent-id="${selected.agentId}"]`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [selected.agentId]);

  const moveCard = (direction: -1 | 1) => {
    const nextIndex = (selectedIndex + direction + data.residences.length) % data.residences.length;
    onSelect(data.residences[nextIndex]);
  };

  return (
    <div>
      <div className="mt-3 flex items-center justify-between font-pixel text-[7px] tracking-wide text-black/55">
        <span>IDENTITY DECK · {data.residences.length} CARDS</span>
        <span>{selectedIndex + 1} / {data.residences.length} · SWIPE →</span>
      </div>
      <div className="relative">
        <div ref={trackRef} className="flex gap-2 overflow-x-auto px-7 pt-2 pb-2 snap-x snap-mandatory">
          {data.residences.map((item) => (
            <button type="button" key={item.agentId} data-agent-id={item.agentId} onClick={() => onSelect(item)} aria-label={`选择 ${item.displayName} 身份卡 ${item.doorplate}`}
              aria-pressed={item.agentId === selected.agentId}
              className={`snap-center shrink-0 w-[220px] min-h-[285px] text-left border-[3px] border-black p-3 shadow-[4px_4px_0_#000] ${item.agentId === selected.agentId ? 'bg-white' : 'bg-[#dddcd6]'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-pixel text-[7px] tracking-widest text-black/45">FROST IDENTITY CARD</div>
                  <div className="font-pixel text-[13px] mt-1 leading-tight">{item.displayName}</div>
                </div>
                <span className="font-pixel text-[8px] text-white border-2 border-black px-1.5 py-1" style={{ background: COLORS[item.agentId] }}>#{item.agentId}</span>
              </div>
              <div className="mt-3 h-[118px] border-2 border-black bg-black overflow-hidden">
                <svg viewBox={PORTRAITS[item.agentId].viewBox} preserveAspectRatio="xMidYMid slice" role="img"
                  aria-label={`${item.displayName} Frost 身份肖像`} className="h-full w-full">
                  <title>{item.displayName} Frost 身份肖像</title>
                  <image href={PORTRAITS[item.agentId].src} width="1536" height="1024" />
                </svg>
              </div>
              <div className="mt-3 flex items-center justify-between border-y border-black py-1.5">
                <span className="font-pixel text-[7px]">{item.doorplate}</span>
                <span className="text-[9px]">{item.zoneInfo?.name}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {item.publicTraits.map((trait) => <span key={trait} className="text-[8px] border border-black px-1.5 py-0.5 bg-[#f0eee7]">{trait}</span>)}
              </div>
              <div className="mt-3 text-[8px] text-black/50 leading-relaxed">
                CARD v{item.cardVersion} · CHAIN REV {item.revision}<br />HASH {shortHash(item.cardHash)}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[8px] text-[#315e4b] font-bold"><ShieldCheck className="w-3 h-3" />INJECTIVE VERIFIED</div>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => moveCard(-1)} aria-label="上一张身份卡"
          className="absolute left-0 top-1/2 z-10 flex h-12 w-8 -translate-y-1/2 items-center justify-center border-2 border-black bg-[#f3f0e7] shadow-[2px_2px_0_#000] active:translate-x-[2px] active:shadow-none">
          <ChevronLeft className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => moveCard(1)} aria-label="下一张身份卡"
          className="absolute right-0 top-1/2 z-10 flex h-12 w-8 -translate-y-1/2 items-center justify-center border-2 border-black bg-[#f3f0e7] shadow-[2px_2px_0_#000] active:translate-x-[2px] active:shadow-none">
          <ChevronRight className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
        </button>
      </div>
      <div className="text-[9px] text-black/50 leading-relaxed mt-1">
        卡面记录公开身份、门牌与可验证版本；它不代表代码、私人记忆或现实地址。
      </div>
    </div>
  );
}

export default function PublicEarthPanel({ onOpenTopic = () => {} }: Props) {
  const [view, setView] = useState<'map' | 'details' | 'cards'>('map');
  const [data, setData] = useState<PublicEarthResponse | null>(null);
  const [selectedId, setSelectedId] = useState(43);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/injective?tool=get-public-earth')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
      .then((payload) => { if (alive && Array.isArray(payload?.residences) && payload.residences.length) setData(payload); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, []);

  const selected = useMemo(() => data?.residences.find((item) => item.agentId === selectedId) || data?.residences[0], [data, selectedId]);

  return (
    <section className="border-[3px] border-black bg-[#f3f0e7] p-3 shadow-[3px_3px_0_#000]" data-testid="public-earth-panel">
      <div className="flex items-start gap-2">
        <div className="w-9 h-9 border-2 border-black bg-[#07110f] text-[#7CFFB2] flex items-center justify-center shrink-0"><Globe2 className="w-5 h-5" strokeWidth={2.2} /></div>
        <div className="min-w-0 flex-1">
          <span className="sr-only">PUBLIC EARTH · INJECTIVE</span>
          <div className="font-pixel text-[12px] tracking-wider">PUBLIC EARTH</div>
          <div className="font-pixel text-[7px] text-[#315e4b] mt-1 tracking-wide">8 KNOWLEDGE AGENTS · 5 CHAIN IDENTITIES</div>
        </div>
        {data && <span className={`inline-flex items-center gap-1.5 font-pixel text-[7px] border-2 border-black px-2 py-1.5 shrink-0 ${data.live ? 'bg-[#07110f] text-[#7CFFB2]' : 'bg-[#e2c26e]'}`}>
          {data.live && <span className="h-1.5 w-1.5 bg-[#35e79a] shadow-[0_0_7px_#35e79a]" />}{data.live ? 'LIVE' : 'PUBLIC PROOF'}
        </span>}
      </div>

      <div className="grid grid-cols-3 gap-1.5 mt-3" aria-label="公共地球内容视图">
        <button type="button" onClick={() => setView('map')} aria-pressed={view === 'map'} className={`border-2 border-black py-2 font-pixel text-[7px] flex items-center justify-center gap-1 ${view === 'map' ? 'bg-[#07110f] text-[#7CFFB2]' : 'bg-white'}`}>
          <Globe2 className="w-3 h-3" aria-hidden="true" />知识地图
        </button>
        <button type="button" onClick={() => setView('details')} aria-pressed={view === 'details'} className={`border-2 border-black py-2 font-pixel text-[7px] flex items-center justify-center gap-1 ${view === 'details' ? 'bg-[#315e4b] text-white' : 'bg-white'}`}>
          <Newspaper className="w-3 h-3" aria-hidden="true" />知识详情
        </button>
        <button type="button" onClick={() => setView('cards')} aria-pressed={view === 'cards'} className={`border-2 border-black py-2 font-pixel text-[7px] flex items-center justify-center gap-1 ${view === 'cards' ? 'bg-black text-white' : 'bg-white'}`}>
          <IdCard className="w-3 h-3" aria-hidden="true" />身份卡牌
        </button>
      </div>

      {view === 'map' && <PublicKnowledgeGlobe />}
      {view === 'details' && <PublicKnowledgeDetails onOpenTopic={onOpenTopic} />}
      {view === 'cards' && !data && !error && <div className="h-[260px] flex items-center justify-center font-pixel text-[8px] text-black/40">READING INJECTIVE…</div>}
      {view === 'cards' && error && !data && <div className="h-[180px] border-2 border-black bg-white mt-3 flex items-center justify-center text-center px-5 text-[10px] text-black/55">身份链读暂不可用。没有使用虚构门牌，请稍后重试。</div>}
      {view === 'cards' && data && selected && <CardView data={data} selected={selected} onSelect={(item) => setSelectedId(item.agentId)} />}

      {view === 'cards' && data && <div className="mt-3 pt-2 border-t border-black/20 flex items-center gap-1.5 text-[8px] text-black/45">
        <Link2 className="w-3 h-3" />
        <span className="flex-1">知识卡是信息分发层 · 身份卡是可验证身份层</span>
        <a href={data.contract.scanUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">CONTRACT ↗</a>
      </div>}
    </section>
  );
}
