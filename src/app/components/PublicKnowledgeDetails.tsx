import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowRight, BookOpenText, ChevronLeft, ChevronRight, Database, Download, ExternalLink, MapPin, RadioTower, ShieldCheck } from 'lucide-react';
import { PUBLIC_SIGNAL_AGENTS } from '../data/publicKnowledgeAgents';
import { PUBLIC_KNOWLEDGE_SOURCE_URLS, PUBLIC_KNOWLEDGE_TOPIC_BRIEFS, PUBLIC_KNOWLEDGE_TOPIC_STORIES } from '../data/publicKnowledgeMap';
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

const compactDate = (date: string) => date.slice(5).replace('-', '.');

export default function PublicKnowledgeDetails({ onOpenTopic }: Props) {
  const [selectedId, setSelectedId] = useState(PUBLIC_KNOWLEDGE_TOPIC_STORIES[0].id);
  const [readerOpen, setReaderOpen] = useState(false);
  const readerRef = useRef<HTMLElement>(null);
  const selected = PUBLIC_KNOWLEDGE_TOPIC_STORIES.find((story) => story.id === selectedId) || PUBLIC_KNOWLEDGE_TOPIC_STORIES[0];
  const topicStories = PUBLIC_KNOWLEDGE_TOPIC_STORIES.filter((story) => story.topic === selected.topic);
  const selectedIndex = Math.max(0, topicStories.findIndex((story) => story.id === selected.id));

  useEffect(() => {
    if (readerOpen) readerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [readerOpen, selected.id]);

  const moveWithinTopic = (delta: number) => {
    const nextIndex = (selectedIndex + delta + topicStories.length) % topicStories.length;
    setSelectedId(topicStories[nextIndex].id);
  };

  const selectTopic = (topic: KnowledgeTopic) => {
    const firstStory = PUBLIC_KNOWLEDGE_TOPIC_STORIES.find((story) => story.topic === topic);
    if (firstStory) setSelectedId(firstStory.id);
  };

  const openReader = () => setReaderOpen(true);

  if (readerOpen) {
    return (
      <article ref={readerRef} className="public-story-reader" aria-label={`${selected.headline} 详细阅读`}>
        <button type="button" className="public-story-reader__back" onClick={() => setReaderOpen(false)}>
          <ArrowLeft aria-hidden="true" />返回知识卡
        </button>

        <header className="public-story-reader__header">
          <div>
            <span className="public-story-reader__topic" style={{ background: TOPIC_PAPERS[selected.topic] }}>{selected.topicLabel}</span>
            <span>原文 {selected.publishedAt.replaceAll('-', '.')}</span>
            <span>收录 {selected.date}</span>
            <span>{selectedIndex + 1} / {topicStories.length}</span>
          </div>
          <small>CURATED PUBLIC SIGNAL</small>
          <h2>{selected.headline}</h2>
          <p>{PUBLIC_KNOWLEDGE_TOPIC_BRIEFS[selected.topic]}</p>
        </header>

        <section className="public-story-reader__section">
          <small>核心信号</small>
          <p>{selected.claim}</p>
        </section>

        <section className="public-story-reader__section is-why">
          <small>WHY IT MATTERS · 为什么重要</small>
          <p>{selected.why}</p>
        </section>

        <section className="public-story-reader__source-notes">
          <small>SOURCE NOTES · 源内要点</small>
          <ol>
            {selected.keyFacts.map((fact, index) => <li key={fact}><span>0{index + 1}</span><p>{fact}</p></li>)}
          </ol>
        </section>

        <div className="public-story-reader__facts" aria-label="新闻信号元数据">
          <div><small>来源</small><strong>{selected.publisher}</strong></div>
          <div><small>原文发布</small><strong>{selected.publishedAt}</strong></div>
          <div><small>位置</small><strong>{selected.locationLabel}</strong></div>
          <div><small>重要度</small><strong>{selected.importance} / 100</strong></div>
          <div><small>收录版次</small><strong>2026-{selected.date.replace('.', '-')}</strong></div>
          <div><small>知识状态</small><strong>原始来源已定位</strong></div>
        </div>

        <section className="public-story-reader__verification">
          <div><ShieldCheck aria-hidden="true" /><small>VERIFICATION PATH · 核验路径</small></div>
          <ol>
            <li>已回看原始来源的标题、发布时间与上下文。</li>
            <li>寻找独立来源或一手文件进行交叉确认。</li>
            <li>核验通过后才进入每日知识版次与 Merkle 证明。</li>
          </ol>
          <p>当前仍是候选新闻信号，不作为已经上链确认的事实展示。</p>
        </section>

        <div className="public-story-reader__actions">
          <a href={PUBLIC_KNOWLEDGE_SOURCE_URLS[selected.id]} target="_blank" rel="noreferrer">
            打开原始来源<ExternalLink aria-hidden="true" />
          </a>
          <button type="button" onClick={() => onOpenTopic(selected.topic)}>进入核验</button>
        </div>

        <footer className="public-story-reader__pager">
          <button type="button" onClick={() => moveWithinTopic(-1)} aria-label={`阅读上一条${selected.topicLabel}新闻`}>
            <ArrowLeft aria-hidden="true" /><span>上一篇</span>
          </button>
          <span>{selected.topicLabel} · {selectedIndex + 1}/{topicStories.length}</span>
          <button type="button" onClick={() => moveWithinTopic(1)} aria-label={`阅读下一条${selected.topicLabel}新闻`}>
            <span>下一篇</span><ArrowRight aria-hidden="true" />
          </button>
        </footer>
      </article>
    );
  }

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

        <div className="public-news-editorial__paper is-clickable" onClick={openReader}>
          <header>
            <span>发布 {compactDate(selected.publishedAt)}</span>
            <span className="public-news-editorial__topic" style={{ background: TOPIC_PAPERS[selected.topic] }}>{selected.topicLabel}</span>
            <span>{selected.publisher} · 收录 {selected.date} · {selectedIndex + 1}/{topicStories.length}</span>
          </header>
          <h2>{selected.headline}</h2>
          <p className="public-news-editorial__claim">{selected.claim}</p>
          <div className="public-news-editorial__why">
            <small>WHY IT MATTERS</small>
            <p>{selected.why}</p>
          </div>

          <button type="button" className="public-news-editorial__expand" onClick={(event) => { event.stopPropagation(); openReader(); }}>
            <BookOpenText aria-hidden="true" />展开阅读全文<ArrowRight aria-hidden="true" />
          </button>

          <footer onClick={(event) => event.stopPropagation()}>
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
