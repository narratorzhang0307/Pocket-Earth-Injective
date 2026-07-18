import { useState, type CSSProperties } from 'react';
import { ArrowDownToLine, ChevronLeft, ChevronRight, Database, Download, MapPin, RadioTower, ShieldCheck } from 'lucide-react';
import { PUBLIC_SIGNAL_AGENTS } from '../data/publicKnowledgeAgents';
import { PUBLIC_KNOWLEDGE_TOPIC_STORIES } from '../data/publicKnowledgeMap';
import type { KnowledgeTopic } from '../lib/chronicle/types';

interface Props { onOpenTopic: (topic: KnowledgeTopic) => void }

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

export default function PublicKnowledgeDetails({ onOpenTopic }: Props) {
  const [selectedId, setSelectedId] = useState(PUBLIC_KNOWLEDGE_TOPIC_STORIES[0].id);
  const selected = PUBLIC_KNOWLEDGE_TOPIC_STORIES.find((story) => story.id === selectedId) || PUBLIC_KNOWLEDGE_TOPIC_STORIES[0];
  const topicStories = PUBLIC_KNOWLEDGE_TOPIC_STORIES.filter((story) => story.topic === selected.topic);
  const selectedIndex = Math.max(0, topicStories.findIndex((story) => story.id === selected.id));

  const moveWithinTopic = (delta: number) => {
    const nextIndex = (selectedIndex + delta + topicStories.length) % topicStories.length;
    setSelectedId(topicStories[nextIndex].id);
  };

  const selectTopic = (topic: KnowledgeTopic) => {
    const firstStory = PUBLIC_KNOWLEDGE_TOPIC_STORIES.find((story) => story.topic === topic);
    if (firstStory) setSelectedId(firstStory.id);
  };

  return (
    <div className="public-knowledge-details">
      <div className="public-knowledge-details__heading">
        <span>KNOWLEDGE READER · {selected.topicLabel}</span>
        <span>{selectedIndex + 1} / {topicStories.length}</span>
      </div>

      <article className="public-news-editorial" aria-live="polite">
        <button type="button" className="public-news-editorial__nav is-prev" onClick={() => moveWithinTopic(-1)} aria-label={`上一条${selected.topicLabel}新闻`}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <button type="button" className="public-news-editorial__nav is-next" onClick={() => moveWithinTopic(1)} aria-label={`下一条${selected.topicLabel}新闻`}>
          <ChevronRight aria-hidden="true" />
        </button>

        <div className="public-news-editorial__paper">
          <header>
            <span>{selected.date}</span>
            <span className="public-news-editorial__topic" style={{ background: TOPIC_PAPERS[selected.topic] }}>{selected.topicLabel}</span>
            <span>{selected.publisher} · {selectedIndex + 1}/{topicStories.length}</span>
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

      <div className="public-news-topic-index" aria-label="切换八领域新闻主题">
        {PUBLIC_SIGNAL_AGENTS.map((agent) => {
          const agentStories = PUBLIC_KNOWLEDGE_TOPIC_STORIES.filter((story) => story.topic === agent.id);
          return (
            <button key={agent.id} type="button" onClick={() => selectTopic(agent.id)} aria-pressed={agent.id === selected.topic}
              style={{ '--topic-color': TOPIC_COLORS[agent.id], '--paper-color': TOPIC_PAPERS[agent.id] } as CSSProperties}>
              <i />
              <span>{agentStories[0]?.topicLabel || agent.label}</span>
              <small>{agentStories.length} 条</small>
              <MapPin className="h-3 w-3" />
            </button>
          );
        })}
      </div>

      <button type="button" onClick={() => onOpenTopic(selected.topic)} aria-label="打开公共知识层与今日可验证版次"
        className="public-knowledge-details__edition" data-testid="public-knowledge-entry">
        <div className="public-knowledge-details__edition-icon"><Database aria-hidden="true" /></div>
        <div className="min-w-0 flex-1">
          <strong>PUBLIC KNOWLEDGE LAYER</strong>
          <p>核验后的知识形成版次，可下载资源包并校验 Merkle 证明。</p>
        </div>
        <span>OPEN</span>
        <div className="public-knowledge-details__edition-meta">
          <small><ShieldCheck />Merkle 证明</small>
          <small><Download />离线资源包</small>
        </div>
      </button>
    </div>
  );
}
