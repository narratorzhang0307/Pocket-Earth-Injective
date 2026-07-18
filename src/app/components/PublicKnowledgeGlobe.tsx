import { useEffect, useRef, useState } from 'react';
import mapboxgl, { type Marker } from 'mapbox-gl';
import { RadioTower, ShieldCheck } from 'lucide-react';
import EarthMap from './EarthMap';
import { PUBLIC_SIGNAL_AGENTS } from '../data/publicKnowledgeAgents';
import { PUBLIC_KNOWLEDGE_MAP_CARDS, type PublicKnowledgeMapCard } from '../data/publicKnowledgeMap';
import type { KnowledgeTopic } from '../lib/chronicle/types';

interface Props { onOpenTopic: (topic: KnowledgeTopic) => void }

const TOPIC_COLORS = Object.fromEntries(PUBLIC_SIGNAL_AGENTS.map((agent) => [agent.id, agent.color])) as Record<KnowledgeTopic, string>;

const REGION_STACKS: { id: string; label: string; coordinates: [number, number]; offset: [number, number]; topics: KnowledgeTopic[] }[] = [
  { id: 'americas', label: '美洲', coordinates: [-84, 30], offset: [28, 0], topics: ['ai', 'science'] },
  { id: 'europe', label: '欧洲', coordinates: [11, 50], offset: [0, 2], topics: ['climate'] },
  { id: 'south-asia', label: '南亚', coordinates: [82, 15], offset: [-12, 8], topics: ['technology', 'culture'] },
  { id: 'east-asia', label: '东亚', coordinates: [108, 36], offset: [-34, 0], topics: ['finance', 'health', 'policy'] },
];

export default function PublicKnowledgeGlobe({ onOpenTopic }: Props) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedId, setSelectedId] = useState(PUBLIC_KNOWLEDGE_MAP_CARDS[0].id);
  const markersRef = useRef<Marker[]>([]);
  const selected = PUBLIC_KNOWLEDGE_MAP_CARDS.find((card) => card.id === selectedId) || PUBLIC_KNOWLEDGE_MAP_CARDS[0];

  useEffect(() => {
    if (!map) return;
    const mountCards = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = REGION_STACKS.map((region) => {
        const cards = PUBLIC_KNOWLEDGE_MAP_CARDS.filter((card) => region.topics.includes(card.topic));
        const card = cards[0];
        const selectedHere = cards.some((item) => item.id === selectedId);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `public-knowledge-map-card${selectedHere ? ' is-selected' : ''}`;
        button.style.setProperty('--topic-color', TOPIC_COLORS[card.topic]);
        button.setAttribute('aria-label', `${region.label}新闻卡片栈，共 ${cards.length} 条：${card.headline}`);

        const meta = document.createElement('span');
        meta.className = 'public-knowledge-map-card__meta';
        meta.textContent = `${region.label} · ${card.date}`;
        const score = document.createElement('b');
        score.textContent = cards.length > 1 ? `+${cards.length - 1}` : String(card.importance);
        meta.append(score);

        const headline = document.createElement('strong');
        headline.textContent = card.headline;
        button.append(meta, headline);
        button.addEventListener('click', () => setSelectedId(selectedHere ? selected.id : card.id));
        return new mapboxgl.Marker({ element: button, anchor: 'bottom', offset: region.offset })
          .setLngLat(region.coordinates)
          .addTo(map);
      });
    };

    if (map.loaded()) mountCards();
    else map.once('load', mountCards);
    return () => {
      map.off('load', mountCards);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, selectedId]);

  return (
    <div>
      <div className="relative mt-3 h-[390px] overflow-hidden border-2 border-[#334c43] bg-[#02050a] shadow-[4px_4px_0_#000]" aria-label="Mapbox 公共知识新闻地图">
        <EarthMap theme="public" center={[12, 20]} zoom={0.58} onReady={setMap} className="z-0" />
        <div className="pointer-events-none absolute left-3 top-3 z-20 border border-[#739786]/55 bg-[#030806]/88 px-2.5 py-2 text-[#d8eee4] backdrop-blur-sm">
          <div className="flex items-center gap-1.5 font-pixel text-[7px] tracking-widest"><span className="h-1.5 w-1.5 bg-[#35e79a] shadow-[0_0_8px_#35e79a]" />PUBLIC SIGNAL MAP</div>
          <div className="mt-1 text-[8px] text-[#8da99d]">8 fields · 16 cached signals</div>
        </div>
        <div className="pointer-events-none absolute bottom-2 left-2 z-20 border border-[#739786]/40 bg-[#030806]/88 px-2 py-1 font-pixel text-[6px] tracking-wide text-[#9ab4a8] backdrop-blur-sm">
          NEWS CARDS · TAP TO INSPECT
        </div>
      </div>

      <article className="mt-3 border-2 border-[#334c43] bg-[#0b1113] p-3 text-[#d8eee4] shadow-[3px_3px_0_#000]" aria-live="polite">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 border border-[#769488] px-1.5 py-1 font-pixel text-[7px] text-black" style={{ background: TOPIC_COLORS[selected.topic] }}>{selected.topicLabel}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[8px] text-[#8da99d]"><span>{selected.date}</span><span>·</span><span className="truncate">{selected.publisher}</span><span className="ml-auto shrink-0">重要度 {selected.importance}</span></div>
            <h2 className="mt-1.5 text-[13px] font-bold leading-snug text-white">{selected.headline}</h2>
          </div>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-[#a8bbb3]">{selected.why}</p>
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#334c43] pt-2">
          <span className="inline-flex items-center gap-1 text-[8px] text-[#f2c15f]"><RadioTower className="h-3 w-3" />待交叉核验 · 尚未进入 Merkle 版次</span>
          <button type="button" onClick={() => onOpenTopic(selected.topic)} className="shrink-0 border border-[#7fa493] bg-[#122019] px-2 py-1.5 font-pixel text-[7px] text-[#7CFFB2] active:translate-y-px">
            查看核验
          </button>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[8px] text-[#6ee0a8]"><ShieldCheck className="h-3 w-3" />今日已有 2 条知识进入可验证版次；候选新闻不会冒充事实。</div>
        <div className="mt-2 grid grid-cols-4 gap-1 border-t border-[#334c43] pt-2" aria-label="切换八领域新闻卡片">
          {PUBLIC_KNOWLEDGE_MAP_CARDS.map((card) => (
            <button key={card.id} type="button" onClick={() => setSelectedId(card.id)} aria-pressed={card.id === selected.id}
              className={`min-h-8 border px-1 py-1 text-[8px] font-bold ${card.id === selected.id ? 'border-white text-white' : 'border-[#40554c] text-[#8da99d]'}`}
              style={card.id === selected.id ? { background: `${TOPIC_COLORS[card.topic]}33` } : undefined}>
              {card.topicLabel}
            </button>
          ))}
        </div>
      </article>
    </div>
  );
}
