import { useEffect, useRef, useState, type CSSProperties } from 'react';
import mapboxgl, { type Marker } from 'mapbox-gl';
import { ArrowDownToLine, Globe2, MapPin, RadioTower, ShieldCheck } from 'lucide-react';
import EarthMap from './EarthMap';
import { PUBLIC_SIGNAL_AGENTS } from '../data/publicKnowledgeAgents';
import { PUBLIC_KNOWLEDGE_MAP_CARDS } from '../data/publicKnowledgeMap';
import type { KnowledgeTopic } from '../lib/chronicle/types';

interface Props { onOpenTopic: (topic: KnowledgeTopic) => void }

const TOPIC_COLORS = Object.fromEntries(PUBLIC_SIGNAL_AGENTS.map((agent) => [agent.id, agent.color])) as Record<KnowledgeTopic, string>;
const WORLD_CENTER: [number, number] = [12, 20];
const WORLD_ZOOM = 0.58;
const NEWS_CARD_ZOOM = 2.15;
const FIELD_CARD_ZOOM = 4.25;

// A small visual offset keeps nearby East-Asia cards legible after zooming in.
// The pin itself remains on the exact coordinates; only the paper card shifts.
const CARD_OFFSETS: Partial<Record<KnowledgeTopic, [number, number]>> = {
  finance: [32, -5],
  health: [-34, 12],
  policy: [10, -20],
  technology: [-26, -6],
  culture: [28, 14],
};

export default function PublicKnowledgeGlobe({ onOpenTopic }: Props) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedId, setSelectedId] = useState(PUBLIC_KNOWLEDGE_MAP_CARDS[0].id);
  const [zoomedIn, setZoomedIn] = useState(false);
  const markersRef = useRef<Marker[]>([]);
  const selected = PUBLIC_KNOWLEDGE_MAP_CARDS.find((card) => card.id === selectedId) || PUBLIC_KNOWLEDGE_MAP_CARDS[0];

  useEffect(() => {
    if (!map) return;

    const syncZoomMode = () => {
      const showCards = map.getZoom() >= NEWS_CARD_ZOOM;
      const showNeighbourCards = map.getZoom() >= FIELD_CARD_ZOOM;
      setZoomedIn((current) => current === showCards ? current : showCards);
      markersRef.current.forEach((marker) => {
        marker.getElement().classList.toggle('is-zoom-card', showCards);
        marker.getElement().classList.toggle('is-field-card', showNeighbourCards);
      });
    };

    const mountSignals = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = PUBLIC_KNOWLEDGE_MAP_CARDS.map((card) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `public-news-marker${card.id === selectedId ? ' is-selected' : ''}`;
        button.style.setProperty('--topic-color', TOPIC_COLORS[card.topic]);
        const [shiftX, shiftY] = CARD_OFFSETS[card.topic] || [0, 0];
        button.style.setProperty('--news-card-x', `${shiftX}px`);
        button.style.setProperty('--news-card-y', `${shiftY}px`);
        button.title = `${card.locationLabel} · ${card.headline}`;
        button.setAttribute('aria-label', `查看${card.locationLabel}的${card.topicLabel}新闻：${card.headline}`);

        const signal = document.createElement('span');
        signal.className = 'public-news-marker__signal';
        signal.setAttribute('aria-hidden', 'true');
        signal.innerHTML = '<i></i><b></b>';

        const paper = document.createElement('span');
        paper.className = 'public-news-marker__paper';

        const visual = document.createElement('span');
        visual.className = 'public-news-marker__visual';
        const image = document.createElement('img');
        image.src = card.imageUrl;
        image.alt = '';
        image.loading = 'lazy';
        image.draggable = false;
        image.referrerPolicy = 'no-referrer';
        const visualMeta = document.createElement('span');
        visualMeta.className = 'public-news-marker__visual-meta';
        visualMeta.textContent = `${card.topicLabel} · ${card.date}`;
        visual.append(image, visualMeta);

        const headline = document.createElement('strong');
        headline.textContent = card.headline;
        const source = document.createElement('small');
        source.textContent = `${card.locationLabel} · ${card.publisher}`;
        paper.append(visual, headline, source);
        button.append(signal, paper);

        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          setSelectedId(card.id);
          const targetZoom = Math.max(map.getZoom(), 3.35);
          map.easeTo({ center: card.coordinates, zoom: targetZoom, duration: 900, essential: true });
        });

        return new mapboxgl.Marker({
          element: button,
          anchor: 'bottom',
          pitchAlignment: 'viewport',
          rotationAlignment: 'viewport',
          occludedOpacity: 0.08,
        }).setLngLat(card.coordinates).addTo(map);
      });
      syncZoomMode();
    };

    // map.loaded() also turns false while new tiles are being fetched during an
    // easeTo. Re-mounting after a card selection must depend on style readiness,
    // otherwise all markers can disappear mid-flight and wait for a load event
    // that will never fire a second time.
    if (map.isStyleLoaded()) mountSignals();
    else map.once('load', mountSignals);
    map.on('zoom', syncZoomMode);
    return () => {
      map.off('load', mountSignals);
      map.off('zoom', syncZoomMode);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, selectedId]);

  const resetWorld = () => {
    map?.easeTo({ center: WORLD_CENTER, zoom: WORLD_ZOOM, duration: 900, essential: true });
  };

  return (
    <div>
      <div className="public-news-map" aria-label="Mapbox 公共知识新闻地图">
        <EarthMap theme="public" center={WORLD_CENTER} zoom={WORLD_ZOOM} onReady={setMap} className="z-0" />

        <div className="public-news-map__legend">
          <div><span />PUBLIC KNOWLEDGE SIGNALS</div>
          <p>8 fields · 16 cached signals</p>
        </div>

        <div className="public-news-map__instruction">
          {zoomedIn ? 'IMAGE CARDS · TAP TO READ' : 'SIGNAL POINTS · TAP TO APPROACH'}
        </div>

        {zoomedIn && (
          <button type="button" onClick={resetWorld} className="public-news-map__reset" aria-label="返回全球新闻视图">
            <Globe2 className="h-3.5 w-3.5" />返回全球
          </button>
        )}
      </div>

      <article className="public-news-editorial" aria-live="polite">
        <div className="public-news-editorial__visual">
          <img src={selected.imageUrl} alt={selected.imageAlt} draggable={false} referrerPolicy="no-referrer" />
          <div className="public-news-editorial__shade" />
          <div className="public-news-editorial__visual-meta">
            <span>CONTEXT IMAGE · 非证据图片</span>
            <strong>{selected.locationLabel}</strong>
          </div>
        </div>

        <div className="public-news-editorial__paper">
          <header>
            <span>{selected.date}</span>
            <span className="public-news-editorial__topic" style={{ background: TOPIC_COLORS[selected.topic] }}>{selected.topicLabel}</span>
            <span>{selected.publisher}</span>
          </header>
          <h2>{selected.headline}</h2>
          <p className="public-news-editorial__claim">{selected.claim}</p>
          <div className="public-news-editorial__why">
            <small>WHY IT MATTERS</small>
            <p>{selected.why}</p>
          </div>

          <footer>
            <span><RadioTower className="h-3 w-3" />待交叉核验 · 尚未进入 Merkle 版次</span>
            <button type="button" onClick={() => onOpenTopic(selected.topic)}>查看核验</button>
          </footer>
        </div>
      </article>

      <div className="public-news-verification-note">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>今日已有 2 条知识进入可验证版次；候选新闻不会冒充事实。</span>
        <ArrowDownToLine className="ml-auto h-3.5 w-3.5 shrink-0" />
      </div>

      <div className="public-news-topic-index" aria-label="切换八领域新闻卡片">
        {PUBLIC_KNOWLEDGE_MAP_CARDS.map((card) => (
          <button key={card.id} type="button" onClick={() => {
            setSelectedId(card.id);
            map?.easeTo({ center: card.coordinates, zoom: Math.max(map.getZoom(), 3.35), duration: 780, essential: true });
          }} aria-pressed={card.id === selected.id}
            style={{ '--topic-color': TOPIC_COLORS[card.topic] } as CSSProperties}>
            <i />
            <span>{card.topicLabel}</span>
            <small>{card.locationLabel.split(' · ')[0]}</small>
            <MapPin className="h-3 w-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
