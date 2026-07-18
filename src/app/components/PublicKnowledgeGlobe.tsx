import { useEffect, useRef, useState } from 'react';
import mapboxgl, { type Marker } from 'mapbox-gl';
import { Globe2 } from 'lucide-react';
import EarthMap from './EarthMap';
import { PUBLIC_SIGNAL_AGENTS } from '../data/publicKnowledgeAgents';
import { PUBLIC_KNOWLEDGE_MAP_CARDS } from '../data/publicKnowledgeMap';
import type { KnowledgeTopic } from '../lib/chronicle/types';

const TOPIC_COLORS = Object.fromEntries(PUBLIC_SIGNAL_AGENTS.map((agent) => [agent.id, agent.color])) as Record<KnowledgeTopic, string>;
const TOPIC_PAPERS: Record<KnowledgeTopic, string> = {
  ai: '#e5efd1',
  technology: '#e4def1',
  finance: '#f2dda0',
  climate: '#cce7df',
  science: '#efd5df',
  health: '#efc9be',
  culture: '#e6d9ee',
  policy: '#d6e3ef',
};
const WORLD_CENTER: [number, number] = [42, 18];
const WORLD_ZOOM = -0.32;
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
const ORBIT_NOTE_OFFSETS: Partial<Record<KnowledgeTopic, [number, number]>> = {
  ai: [40, -2],
  technology: [-15, -7],
  finance: [14, -10],
  climate: [-11, 6],
  science: [2, -8],
  health: [-15, 12],
  culture: [16, 8],
  policy: [12, -6],
};

export default function PublicKnowledgeGlobe() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedId, setSelectedId] = useState(PUBLIC_KNOWLEDGE_MAP_CARDS[0].id);
  const [zoomedIn, setZoomedIn] = useState(false);
  const markersRef = useRef<Marker[]>([]);

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
      markersRef.current = PUBLIC_KNOWLEDGE_MAP_CARDS.map((card, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `public-news-marker${card.id === selectedId ? ' is-selected' : ''}`;
        button.style.setProperty('--topic-color', TOPIC_COLORS[card.topic]);
        button.style.setProperty('--paper-color', TOPIC_PAPERS[card.topic]);
        button.style.setProperty('--note-rotation', `${[-3, 2, -1, 3, -2, 1, 0, -2][index]}deg`);
        const [shiftX, shiftY] = CARD_OFFSETS[card.topic] || [0, 0];
        const [orbitX, orbitY] = ORBIT_NOTE_OFFSETS[card.topic] || [0, 0];
        button.style.setProperty('--news-card-x', `${shiftX}px`);
        button.style.setProperty('--news-card-y', `${shiftY}px`);
        button.style.setProperty('--orbit-note-x', `${orbitX}px`);
        button.style.setProperty('--orbit-note-y', `${orbitY}px`);
        button.title = `${card.locationLabel} · ${card.headline}`;
        button.setAttribute('aria-label', `查看${card.locationLabel}的${card.topicLabel}新闻：${card.headline}`);

        const signal = document.createElement('span');
        signal.className = 'public-news-marker__signal';
        signal.setAttribute('aria-hidden', 'true');
        signal.innerHTML = '<i></i><b></b>';

        const orbitNote = document.createElement('span');
        orbitNote.className = 'public-news-marker__orbit-note';
        const orbitTopic = document.createElement('strong');
        orbitTopic.textContent = `${card.locationLabel.split(' · ')[0]} · ${card.topicLabel}`;
        const orbitHeadline = document.createElement('em');
        orbitHeadline.textContent = card.headline;
        const orbitDate = document.createElement('small');
        orbitDate.textContent = card.date;
        orbitNote.append(orbitTopic, orbitHeadline, orbitDate);

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
        button.append(signal, orbitNote, paper);

        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          setSelectedId(card.id);
          const targetZoom = Math.max(map.getZoom(), 3.35);
          map.easeTo({ center: card.coordinates, zoom: targetZoom, duration: 900, essential: true });
        });

        const marker = new mapboxgl.Marker({
          element: button,
          anchor: 'bottom',
          pitchAlignment: 'viewport',
          rotationAlignment: 'viewport',
          occludedOpacity: 0,
        }).setLngLat(card.coordinates).addTo(map);
        // Mapbox labels custom marker elements as images by default. This one is
        // an actual control, so restore button semantics after Marker mounts it.
        button.setAttribute('role', 'button');
        return marker;
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
    <div className="public-news-map public-news-map--standalone" aria-label="Mapbox 公共知识新闻地图">
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
  );
}
