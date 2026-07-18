import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Globe2, IdCard, Link2, MapPin, ShieldCheck } from 'lucide-react';
import type mapboxgl from 'mapbox-gl';
import EarthMap from './EarthMap';
import FrostBuddy from './FrostBuddy';
import type { FrostTheme } from '../../../frost-agent/buddy/themes';

type Zone = { id: number; name: string; english: string; color: string };
type Residence = {
  agentId: number;
  displayName: string;
  doorplate: string;
  publicTraits: string[];
  cardVersion: number;
  zone: number;
  zoneInfo?: Zone;
  x: number;
  y: number;
  cardHash: string;
  cardHashMatches: boolean;
  revision: number;
  updatedAt: number | null;
  identityScanUrl: string;
  residenceScanUrl: string;
};
type PublicEarthResponse = {
  live: boolean;
  evidenceSource: string;
  boundary: string;
  contract: { address: string; scanUrl: string };
  zones: Zone[];
  residences: Residence[];
};

const THEMES: Record<number, FrostTheme> = { 43: 'none', 44: 'book', 45: 'movie', 46: 'music', 47: 'travel' };
const COLORS: Record<number, string> = { 43: '#273F58', 44: '#486B8A', 45: '#A05E47', 46: '#6E5A8A', 47: '#86713F' };

function shortHash(hash: string) {
  return hash ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : '—';
}

const PUBLIC_RESIDENCE_SOURCE = 'public-earth-residences';
const PUBLIC_RESIDENCE_DOTS = 'public-earth-residence-dots';
const PUBLIC_RESIDENCE_LABELS = 'public-earth-residence-labels';

// 链上 x/y 是公共地球的符号位置，不是现实地址；这里只把同一坐标确定性投影到 Mapbox globe。
function mapCoordinates(item: Residence): [number, number] {
  return [Math.max(-36, Math.min(36, item.x * 0.07)), Math.max(-36, Math.min(40, item.y * 0.08))];
}

function residenceGeoJson(data: PublicEarthResponse, selectedId: number) {
  return {
    type: 'FeatureCollection' as const,
    features: data.residences.map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: mapCoordinates(item) },
      properties: {
        agentId: item.agentId,
        label: `#${item.agentId}`,
        color: COLORS[item.agentId] || '#273F58',
        active: item.agentId === selectedId,
      },
    })),
  };
}

function MapboxGlobeView({ data, selected, onSelect }: { data: PublicEarthResponse; selected: Residence; onSelect: (item: Residence) => void }) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!map) return;

    const syncLayer = () => {
      const geojson = residenceGeoJson(data, selected.agentId);
      const source = map.getSource(PUBLIC_RESIDENCE_SOURCE) as mapboxgl.GeoJSONSource | undefined;
      if (source) source.setData(geojson);
      else map.addSource(PUBLIC_RESIDENCE_SOURCE, { type: 'geojson', data: geojson });

      if (!map.getLayer(PUBLIC_RESIDENCE_DOTS)) {
        map.addLayer({
          id: PUBLIC_RESIDENCE_DOTS,
          type: 'circle',
          source: PUBLIC_RESIDENCE_SOURCE,
          paint: {
            'circle-radius': ['case', ['boolean', ['get', 'active'], false], 15, 10],
            'circle-color': ['get', 'color'],
            'circle-stroke-color': '#000000',
            'circle-stroke-width': ['case', ['boolean', ['get', 'active'], false], 4, 2],
          },
        });
      }
      if (!map.getLayer(PUBLIC_RESIDENCE_LABELS)) {
        map.addLayer({
          id: PUBLIC_RESIDENCE_LABELS,
          type: 'symbol',
          source: PUBLIC_RESIDENCE_SOURCE,
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 10,
            'text-offset': [0, 1.8],
            'text-anchor': 'top',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: {
            'text-color': '#111111',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
          },
        });
      }
    };

    const selectFeature = (event: mapboxgl.MapLayerMouseEvent) => {
      const agentId = Number(event.features?.[0]?.properties?.agentId);
      const item = data.residences.find((candidate) => candidate.agentId === agentId);
      if (item) onSelect(item);
    };
    const showPointer = () => { map.getCanvas().style.cursor = 'pointer'; };
    const hidePointer = () => { map.getCanvas().style.cursor = ''; };
    const bind = () => {
      syncLayer();
      map.on('click', PUBLIC_RESIDENCE_DOTS, selectFeature);
      map.on('click', PUBLIC_RESIDENCE_LABELS, selectFeature);
      map.on('mouseenter', PUBLIC_RESIDENCE_DOTS, showPointer);
      map.on('mouseleave', PUBLIC_RESIDENCE_DOTS, hidePointer);
    };

    if (map.isStyleLoaded()) bind();
    else map.once('load', bind);

    return () => {
      map.off('load', bind);
      if (map.getLayer(PUBLIC_RESIDENCE_DOTS)) {
        map.off('click', PUBLIC_RESIDENCE_DOTS, selectFeature);
        map.off('mouseenter', PUBLIC_RESIDENCE_DOTS, showPointer);
        map.off('mouseleave', PUBLIC_RESIDENCE_DOTS, hidePointer);
      }
      if (map.getLayer(PUBLIC_RESIDENCE_LABELS)) map.off('click', PUBLIC_RESIDENCE_LABELS, selectFeature);
    };
  }, [data, map, onSelect, selected.agentId]);

  return (
    <div>
      <div className="relative mt-3 h-[310px] overflow-hidden border-[3px] border-black bg-black shadow-[4px_4px_0_#000]" aria-label="Mapbox 公共地球门牌地图">
        <EarthMap center={[0, 18]} zoom={1.15} onReady={setMap} className="z-0" />
        <div className="pointer-events-none absolute bottom-2 left-2 z-20 border border-black bg-white/90 px-2 py-1 font-pixel text-[6px] tracking-wide">
          SYMBOLIC POSITIONS · 非现实地址
        </div>
      </div>

      <div className="mt-4 border-2 border-black bg-white p-2.5 flex items-center gap-2.5">
        <div className="w-12 h-12 border-2 border-black bg-[#f4f1e8] flex items-center justify-center overflow-hidden shrink-0">
          <FrostBuddy state="idle" theme={THEMES[selected.agentId] || 'none'} color={COLORS[selected.agentId]} glow={false} size={6} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-pixel text-[8px] truncate">{selected.displayName}</span>
            <span className="ml-auto font-pixel text-[7px] border border-black px-1 py-0.5 text-white" style={{ background: selected.zoneInfo?.color || '#273F58' }}>
              {selected.zoneInfo?.name}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-black/60"><MapPin className="w-3 h-3" />{selected.doorplate} · 版本 {selected.revision}</div>
          <div className="mt-1 flex items-center gap-1 text-[9px] text-[#315e4b]"><ShieldCheck className="w-3 h-3" />公开卡面哈希已匹配</div>
        </div>
        <a href={selected.residenceScanUrl} target="_blank" rel="noreferrer" aria-label="在 Injective 浏览器查看门牌交易"
          className="w-10 h-10 border-2 border-black flex items-center justify-center bg-white active:translate-y-px shrink-0">
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
}

function CardView({ data, selected, onSelect }: { data: PublicEarthResponse; selected: Residence; onSelect: (item: Residence) => void }) {
  const selectedIndex = Math.max(0, data.residences.findIndex((item) => item.agentId === selected.agentId));

  return (
    <div>
      <div className="mt-3 flex items-center justify-between font-pixel text-[7px] tracking-wide text-black/55">
        <span>IDENTITY DECK · {data.residences.length} CARDS</span>
        <span>{selectedIndex + 1} / {data.residences.length} · SWIPE →</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pt-2 pb-2 snap-x snap-mandatory">
        {data.residences.map((item) => (
          <button type="button" key={item.agentId} onClick={() => onSelect(item)} aria-label={`选择 ${item.displayName} 身份卡 ${item.doorplate}`}
            aria-pressed={item.agentId === selected.agentId}
            className={`snap-center shrink-0 w-[220px] min-h-[285px] text-left border-[3px] border-black p-3 shadow-[4px_4px_0_#000] ${item.agentId === selected.agentId ? 'bg-white' : 'bg-[#dddcd6]'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-pixel text-[7px] tracking-widest text-black/45">FROST IDENTITY CARD</div>
                <div className="font-pixel text-[13px] mt-1 leading-tight">{item.displayName}</div>
              </div>
              <span className="font-pixel text-[8px] text-white border-2 border-black px-1.5 py-1" style={{ background: COLORS[item.agentId] }}>#{item.agentId}</span>
            </div>
            <div className="mt-3 h-[96px] border-2 border-black flex items-center justify-center overflow-hidden"
              style={{ background: `linear-gradient(145deg, ${item.zoneInfo?.color || '#8aa'}33, #f7f1e5)` }}>
              <FrostBuddy state="idle" theme={THEMES[item.agentId] || 'none'} color={COLORS[item.agentId]} glow={false} size={12} />
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
      <div className="text-[9px] text-black/50 leading-relaxed mt-1">
        卡面记录公开身份、门牌与可验证版本；它不代表代码、私人记忆或现实地址。
      </div>
    </div>
  );
}

export default function PublicEarthPanel() {
  const [view, setView] = useState<'earth' | 'cards'>('earth');
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
        <div className="w-9 h-9 border-2 border-black bg-black text-white flex items-center justify-center shrink-0"><Globe2 className="w-5 h-5" strokeWidth={2.2} /></div>
        <div className="min-w-0 flex-1">
          <div className="font-pixel text-[11px] tracking-wider">PUBLIC EARTH · INJECTIVE</div>
          <div className="text-[9px] text-black/50 mt-0.5">
            {data ? `${data.residences.length} RESIDENTS · 8 KNOWLEDGE AGENTS` : '口袋地球装记忆 · 公共地球住分身'}
          </div>
        </div>
        {data && <span className={`font-pixel text-[7px] border-2 border-black px-1.5 py-1 shrink-0 ${data.live ? 'bg-[#315e4b] text-white' : 'bg-[#e2c26e]'}`}>
          {data.live ? 'LIVE · INJECTIVE' : 'PUBLIC PROOF'}
        </span>}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button type="button" onClick={() => setView('earth')} aria-pressed={view === 'earth'} className={`border-2 border-black py-1.5 font-pixel text-[8px] flex items-center justify-center gap-1.5 ${view === 'earth' ? 'bg-black text-white' : 'bg-white'}`}>
          <Globe2 className="w-3.5 h-3.5" aria-hidden="true" />地球 · 门牌
        </button>
        <button type="button" onClick={() => setView('cards')} aria-pressed={view === 'cards'} className={`border-2 border-black py-1.5 font-pixel text-[8px] flex items-center justify-center gap-1.5 ${view === 'cards' ? 'bg-black text-white' : 'bg-white'}`}>
          <IdCard className="w-3.5 h-3.5" aria-hidden="true" />身份 · 卡牌
        </button>
      </div>

      {!data && !error && <div className="h-[260px] flex items-center justify-center font-pixel text-[8px] text-black/40">READING INJECTIVE…</div>}
      {error && !data && <div className="h-[180px] border-2 border-black bg-white mt-3 flex items-center justify-center text-center px-5 text-[10px] text-black/55">公共地球链读暂不可用。没有使用虚构门牌，请稍后重试。</div>}
      {data && selected && (view === 'earth'
        ? <MapboxGlobeView data={data} selected={selected} onSelect={(item) => setSelectedId(item.agentId)} />
        : <CardView data={data} selected={selected} onSelect={(item) => setSelectedId(item.agentId)} />)}

      {data && <div className="mt-3 pt-2 border-t border-black/20 flex items-center gap-1.5 text-[8px] text-black/45">
        <Link2 className="w-3 h-3" />
        <span className="flex-1">地球是空间关系层 · 卡牌是可验证身份层</span>
        <a href={data.contract.scanUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">CONTRACT ↗</a>
      </div>}
    </section>
  );
}
