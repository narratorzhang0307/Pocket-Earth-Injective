import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, Check, ChevronLeft, Database, Download, ExternalLink,
  Link2, LoaderCircle, RadioTower, RefreshCw, ShieldCheck,
} from 'lucide-react';
import type {
  DailyKnowledgeResponse, KnowledgeRecord, KnowledgeTopic, KnowledgeVerdict,
} from '../lib/chronicle/types';
import {
  PUBLIC_KNOWLEDGE_SOURCE_URLS, PUBLIC_KNOWLEDGE_TOPIC_STORIES,
} from '../data/publicKnowledgeMap';

interface Props { onBack: () => void; initialTopic?: KnowledgeTopic }

interface ProofResult {
  proof: string[];
  factsRoot: string;
  editionRoot: string;
  verified: boolean;
}

const TOPICS: { key: KnowledgeTopic; label: string; subtitle: string; color: string }[] = [
  { key: 'ai', label: 'AI', subtitle: '模型产品', color: '#7CFF6B' },
  { key: 'technology', label: '科技', subtitle: '芯片机器', color: '#7c5cff' },
  { key: 'finance', label: '金融', subtitle: '市场监管', color: '#f4c542' },
  { key: 'climate', label: '气候', subtitle: '能源环境', color: '#35d4c7' },
  { key: 'science', label: '科学', subtitle: '研究发现', color: '#ff5ca8' },
  { key: 'health', label: '健康', subtitle: '医学生命', color: '#ff756d' },
  { key: 'culture', label: '文化', subtitle: '城市遗产', color: '#d3c0ff' },
  { key: 'policy', label: '政策', subtitle: '社会制度', color: '#b8d2ff' },
];

const VERDICTS: Record<KnowledgeVerdict, { label: string; color: string }> = {
  supported: { label: '证据支持', color: '#007b45' },
  refuted: { label: '证据反驳', color: '#c32f27' },
  mixed: { label: '证据混合', color: '#a45b00' },
  insufficient: { label: '证据不足', color: '#666' },
};

function shortHash(value: string, head = 10, tail = 8) {
  return value.length > head + tail + 3 ? `${value.slice(0, head)}…${value.slice(-tail)}` : value;
}

function RecordCard({ record }: { record: KnowledgeRecord }) {
  const [proof, setProof] = useState<ProofResult | null>(null);
  const [proofError, setProofError] = useState(false);
  const [checking, setChecking] = useState(false);
  const verdict = VERDICTS[record.verdict];

  const verify = async () => {
    setChecking(true);
    setProofError(false);
    try {
      const response = await fetch(`/api/knowledge?tool=proof&recordHash=${encodeURIComponent(record.commitment.recordHash)}`);
      if (!response.ok) throw new Error(`proof_${response.status}`);
      setProof(await response.json() as ProofResult);
    } catch {
      setProofError(true);
    } finally {
      setChecking(false);
    }
  };

  return (
    <article className="relative overflow-hidden border-2 border-black bg-white p-3 pt-4 shadow-[3px_3px_0_rgba(0,0,0,0.85)]" data-testid="knowledge-record-card">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: verdict.color }} />
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="font-pixel text-[7px] border border-black px-1.5 py-1 text-white" style={{ background: verdict.color }}>{verdict.label}</span>
            <span className="font-pixel text-[7px] border border-black px-1.5 py-1 bg-[#EAEAEA]">可信度 {record.truthScore}</span>
            <span className="font-pixel text-[7px] border border-black px-1.5 py-1 bg-[#EAEAEA]">{record.mode === 'live' ? 'LIVE 核验' : 'OFFLINE 策展样例'}</span>
          </div>
          <h2 className="text-[13px] font-bold leading-snug">{record.claim}</h2>
        </div>
        <div className="shrink-0 w-12 h-12 border-2 border-black flex flex-col items-center justify-center bg-[#e7efff]">
          <span className="font-pixel text-[13px] leading-none">{record.truthScore}</span>
          <span className="text-[7px] mt-1">TRUTH</span>
        </div>
      </div>

      <p className="text-[11px] text-black/65 leading-[1.55] mt-2">{record.summary}</p>

      <div className="mt-2 h-2 border border-black bg-[#EAEAEA]" aria-label={`可信度 ${record.truthScore}`}>
        <div className="h-full border-r border-black" style={{ width: `${record.truthScore}%`, background: verdict.color }} />
      </div>

      <div className="mt-3 border-t border-black/20 pt-2">
        <div className="font-pixel text-[7px] tracking-wider mb-1.5 flex items-center justify-between">
          <span>EVIDENCE</span><span>{record.sources.length} INDEPENDENT SOURCES</span>
        </div>
        <div className="space-y-1.5">
          {record.sources.map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer"
              className="flex min-h-11 items-start gap-2 border border-black bg-[#f5f5f5] p-2 active:translate-y-px">
              <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" strokeWidth={2.5} />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold leading-tight">{source.title}</span>
                <span className="block text-[8px] text-black/45 mt-0.5">{source.publisher}{source.publishedAt ? ` · ${source.publishedAt}` : ''}</span>
              </span>
              <span className="font-pixel text-[7px] shrink-0">{source.reliability}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 border-t border-black/20 pt-2">
        <code className="text-[8px] text-black/45 flex-1 truncate">{shortHash(record.commitment.recordHash)}</code>
        <button onClick={verify} disabled={checking}
          className="min-h-10 font-pixel text-[7px] border-2 border-black bg-black text-[#7CFF6B] px-2.5 py-2 inline-flex items-center gap-1 active:translate-y-px disabled:opacity-50">
          {checking ? <LoaderCircle className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
          验证记录
        </button>
      </div>
      {proof && (
        <div className={`mt-2 border border-black p-2 text-[9px] ${proof.verified ? 'bg-[#dff8e9]' : 'bg-[#ffe4e1]'}`}>
          <div className="flex items-center gap-1.5 font-bold">
            {proof.verified ? <Check className="w-3 h-3" strokeWidth={3} /> : <AlertTriangle className="w-3 h-3" />}
            {proof.verified ? `Merkle 证明通过 · ${proof.proof.length} 层路径` : 'Merkle 证明未通过'}
          </div>
          {proof.verified && <code className="mt-1 block truncate text-[7px] text-black/50">EDITION {shortHash(proof.editionRoot, 14, 10)}</code>}
        </div>
      )}
      {proofError && <div className="mt-2 text-[9px] text-[#b42318]">暂时无法读取证明，请稍后重试。</div>}
    </article>
  );
}

function CachedSignals({ topic }: { topic: KnowledgeTopic }) {
  const stories = PUBLIC_KNOWLEDGE_TOPIC_STORIES.filter((story) => story.topic === topic);

  if (!stories.length) return (
    <div className="border-2 border-black bg-[#fff4d7] p-4 text-center shadow-[2px_2px_0_#000]">
      <RadioTower className="w-5 h-5 mx-auto mb-2" />
      <p className="font-pixel text-[8px]">NO QUALIFIED EDITION</p>
      <p className="text-[10px] text-black/55 leading-relaxed mt-2">这个领域今天还没有达到多来源核验门槛。Agent 不会为了填满信息流而虚构知识卡。</p>
    </div>
  );

  return (
    <section className="space-y-2" data-testid="knowledge-cached-signals">
      <div className="border-2 border-black bg-[#fff4d7] p-3 shadow-[2px_2px_0_#000]">
        <div className="flex items-center gap-2">
          <RadioTower className="w-4 h-4 shrink-0" />
          <div>
            <p className="font-pixel text-[8px]">7-DAY SIGNAL CACHE</p>
            <p className="text-[9px] text-black/55 leading-relaxed mt-1">本领域今日尚无合格版次。以下是真实来源候选信号，等待独立来源交叉核验后才会进入 Merkle 版次。</p>
          </div>
        </div>
      </div>
      {stories.map((story) => (
        <article key={story.id} className="relative overflow-hidden border-2 border-black bg-white p-3 pt-4 shadow-[3px_3px_0_rgba(0,0,0,0.85)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#f4c542]" />
          <div className="flex items-center justify-between gap-2 text-[8px] text-black/45">
            <span className="font-pixel">CANDIDATE · {story.publishedAt.slice(5)}</span>
            <span className="truncate">{story.publisher}</span>
          </div>
          <h2 className="text-[13px] font-bold leading-snug mt-2">{story.headline}</h2>
          <p className="text-[10px] text-black/65 leading-[1.55] mt-2">{story.claim}</p>
          <div className="mt-2 border-l-4 border-[#4f9b84] bg-[#efede5] p-2">
            <div className="font-pixel text-[7px] text-[#386b5b]">WHY IT MATTERS</div>
            <p className="text-[9px] text-black/65 leading-relaxed mt-1">{story.why}</p>
          </div>
          <a href={PUBLIC_KNOWLEDGE_SOURCE_URLS[story.id]} target="_blank" rel="noreferrer"
            className="mt-2 min-h-10 border-2 border-black bg-black px-3 py-2 font-pixel text-[7px] text-[#7CFF6B] inline-flex items-center gap-1.5 active:translate-y-px">
            <ExternalLink className="w-3 h-3" />查看原始来源
          </a>
        </article>
      ))}
    </section>
  );
}

export default function DailyKnowledgePage({ onBack, initialTopic = 'ai' }: Props) {
  const [topic, setTopic] = useState<KnowledgeTopic>(initialTopic);
  const [data, setData] = useState<DailyKnowledgeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setData(null);
    fetch(`/api/knowledge?tool=today&topic=${topic}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`knowledge_${response.status}`);
        return response.json() as Promise<DailyKnowledgeResponse>;
      })
      .then(setData)
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return;
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [topic, reloadKey]);

  return (
    <div className="h-full flex flex-col font-sans overflow-hidden bg-[#EAEAEA]">
      <header className="flex items-center gap-2 px-3 py-2.5 border-b-2 border-black bg-white shrink-0">
        <button type="button" onClick={onBack} aria-label="返回上一层" className="w-9 h-9 border-2 border-black bg-white flex items-center justify-center shadow-[1px_1px_0_#000] active:translate-y-px">
          <ChevronLeft className="w-4 h-4" strokeWidth={3} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-pixel text-[11px] tracking-wider">DAILY-KNOWLEDGE</div>
          <div className="text-[9px] text-black/45 mt-0.5">公共知识策展 · 每日可验证版次</div>
        </div>
        <Database className="w-4 h-4 text-[#2357d9]" strokeWidth={2.5} />
      </header>

      <div className="bg-black text-[#7CFF6B] px-3 py-2 border-b-2 border-black shrink-0">
        <div className="font-pixel text-[8px] flex items-center justify-between tracking-wider">
          <span>PUBLIC KNOWLEDGE</span>
          <span className="text-white/60">PRIVATE MEMORY STAYS LOCAL</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        role="region"
        aria-label="每日公共知识版次"
        className="flex-1 overflow-y-auto px-3 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3"
        data-testid="daily-knowledge-scroll"
      >
        <section className="relative overflow-hidden border-2 border-black bg-[#e7efff] p-2.5 shadow-[2px_2px_0_#000]">
          <div className="absolute -right-5 -top-6 h-20 w-20 rounded-full border-2 border-black/15 bg-white/45" />
          <div className="relative font-pixel text-[9px] tracking-wider">今天值得留下什么？</div>
          <p className="relative text-[10px] text-black/65 leading-[1.55] mt-1.5 pr-5">Agent 筛选公共信息、交叉核验来源并生成每日知识版次；Injective 保存确定性的版次锚点，不上传你的私人记忆。</p>
        </section>

        <div className="grid grid-cols-4 gap-1.5" aria-label="公共知识领域">
          {TOPICS.map((item) => (
            <button key={item.key} onClick={() => setTopic(item.key)} aria-pressed={topic === item.key}
              className={`relative min-h-14 overflow-hidden border-2 border-black px-1.5 pb-1.5 pt-2.5 text-left active:translate-y-px ${topic === item.key ? 'bg-black text-white shadow-[2px_2px_0_#000]' : 'bg-white text-black'}`}>
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: item.color }} />
              <span className="block font-pixel text-[8px]">{item.label}</span>
              <span className={`block text-[7px] mt-1 leading-tight ${topic === item.key ? 'text-white/65' : 'text-black/45'}`}>{item.subtitle}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="border-2 border-black bg-white p-6 flex flex-col items-center gap-3" aria-live="polite">
            <LoaderCircle className="w-5 h-5 animate-spin" />
            <span className="font-pixel text-[8px]">READING EDITION…</span>
          </div>
        )}

        {error && (
          <div className="border-2 border-black bg-[#ffe4e1] p-4 text-center" role="alert">
            <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
            <p className="text-[11px]">公共知识服务暂时不可用。</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)}
              className="mt-3 border-2 border-black bg-white px-3 py-1.5 font-pixel text-[7px] inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />重新读取
            </button>
          </div>
        )}

        {!loading && !error && data && !data.edition && <CachedSignals topic={topic} />}

        {data?.edition && (
          <>
            <section className="relative overflow-hidden border-2 border-black bg-white p-3 pt-4 shadow-[2px_2px_0_#000]" data-testid="knowledge-edition-card">
              <div className="absolute inset-x-0 top-0 h-1 bg-[#7c5cff]" />
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#2357d9]" strokeWidth={2.5} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-pixel text-[8px]">EDITION · {data.edition.date}</span>
                    <span className={`font-pixel text-[7px] border border-black px-1.5 py-1 ${data.edition.anchor ? 'bg-[#7c5cff] text-white' : 'bg-[#EAEAEA]'}`}>
                      {data.edition.anchor ? 'INJECTIVE 已锚定' : '本地版次'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-2 text-center">
                    <div className="border border-black bg-[#f5f5f5] p-1.5"><span className="block font-pixel text-[9px]">{data.edition.factCount}</span><span className="text-[7px] text-black/45">FACTS</span></div>
                    <div className="border border-black bg-[#f5f5f5] p-1.5"><span className="block font-pixel text-[9px]">R{data.edition.revision}</span><span className="text-[7px] text-black/45">REVISION</span></div>
                    <div className="border border-black bg-[#f5f5f5] p-1.5"><span className="block font-pixel text-[9px]">{data.mode === 'live' ? 'LIVE' : 'CURATED'}</span><span className="text-[7px] text-black/45">MODE</span></div>
                  </div>
                  <code className="block mt-2 text-[8px] text-black/45 truncate">ROOT {shortHash(data.edition.editionRoot, 14, 10)}</code>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {data.edition.anchor ? (
                      <a href={data.edition.anchor.scanUrl} target="_blank" rel="noreferrer"
                        className="min-h-10 border-2 border-black bg-black text-[#7CFF6B] px-2 py-2 font-pixel text-[7px] inline-flex items-center justify-center gap-1 active:translate-y-px">
                        <Link2 className="w-3 h-3" />链上版次<ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span className="min-h-10 border-2 border-black bg-[#EAEAEA] px-2 py-2 font-pixel text-[7px] inline-flex items-center justify-center">WAITING ANCHOR</span>}
                    <a href={`/api/knowledge?tool=pack&date=${encodeURIComponent(data.edition.date)}`} download={`pocket-earth-public-knowledge-${data.edition.date}.json`}
                      className="min-h-10 border-2 border-black bg-white text-black px-2 py-2 font-pixel text-[7px] inline-flex items-center justify-center gap-1 active:translate-y-px">
                      <Download className="w-3 h-3" />下载验证包
                    </a>
                  </div>
                  <p className="mt-2 text-[8px] text-black/45 leading-relaxed">资源包包含公共知识、来源与 Merkle proof；下载到本地后可离线核验，并与 Injective 版次根对齐。</p>
                </div>
              </div>
            </section>

            {data.records.map((record) => <RecordCard key={record.id} record={record} />)}

            <div className="text-center text-[8px] text-black/35 leading-relaxed pb-2">
              {data.mode === 'offline'
                ? '当前为官方来源策展样例，不声称已经运行实时模型核验。'
                : '本版次由实时检索与双角色模型核验生成。'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
