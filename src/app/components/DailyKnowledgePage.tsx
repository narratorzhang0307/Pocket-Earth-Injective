import { useEffect, useState } from 'react';
import {
  AlertTriangle, Check, ChevronLeft, Database, ExternalLink,
  Link2, LoaderCircle, RefreshCw, ShieldCheck,
} from 'lucide-react';
import type {
  DailyKnowledgeResponse, KnowledgeRecord, KnowledgeTopic, KnowledgeVerdict,
} from '../lib/chronicle/types';

interface Props { onBack: () => void }

interface ProofResult {
  proof: string[];
  factsRoot: string;
  editionRoot: string;
  verified: boolean;
}

const TOPICS: { key: KnowledgeTopic; label: string; subtitle: string }[] = [
  { key: 'ai', label: 'AI', subtitle: '模型与产品' },
  { key: 'finance', label: '金融', subtitle: '链上与市场' },
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
    <article className="border-2 border-black bg-white p-3 shadow-[3px_3px_0_rgba(0,0,0,0.85)]">
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

      <p className="text-[11px] text-black/65 leading-relaxed mt-2">{record.summary}</p>

      <div className="mt-3 border-t border-black/20 pt-2">
        <div className="font-pixel text-[7px] tracking-wider mb-1.5">EVIDENCE · {record.sources.length} SOURCES</div>
        <div className="space-y-1.5">
          {record.sources.map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer"
              className="flex items-start gap-2 border border-black bg-[#f5f5f5] p-2 active:translate-y-px">
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
          className="font-pixel text-[7px] border-2 border-black bg-black text-[#7CFF6B] px-2 py-1.5 inline-flex items-center gap-1 active:translate-y-px disabled:opacity-50">
          {checking ? <LoaderCircle className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
          验证记录
        </button>
      </div>
      {proof && (
        <div className={`mt-2 border border-black p-2 text-[9px] flex items-center gap-1.5 ${proof.verified ? 'bg-[#dff8e9]' : 'bg-[#ffe4e1]'}`}>
          {proof.verified ? <Check className="w-3 h-3" strokeWidth={3} /> : <AlertTriangle className="w-3 h-3" />}
          {proof.verified ? `Merkle 证明通过 · ${proof.proof.length} 层路径` : 'Merkle 证明未通过'}
        </div>
      )}
      {proofError && <div className="mt-2 text-[9px] text-[#b42318]">暂时无法读取证明，请稍后重试。</div>}
    </article>
  );
}

export default function DailyKnowledgePage({ onBack }: Props) {
  const [topic, setTopic] = useState<KnowledgeTopic>('ai');
  const [data, setData] = useState<DailyKnowledgeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
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
  }, [topic]);

  return (
    <div className="h-full flex flex-col font-sans overflow-hidden bg-[#EAEAEA]">
      <header className="flex items-center gap-2 px-3 py-2.5 border-b-2 border-black bg-white shrink-0">
        <button onClick={onBack} className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center shadow-[1px_1px_0_#000] active:translate-y-px">
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
          <span className="text-white/35">PRIVATE MEMORY STAYS LOCAL</span>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <section className="border-2 border-black bg-[#e7efff] p-3 shadow-[2px_2px_0_#000]">
          <div className="font-pixel text-[9px] tracking-wider">今天值得留下什么？</div>
          <p className="text-[10px] text-black/65 leading-relaxed mt-1.5">Agent 筛选公共信息、交叉核验来源并生成每日知识版次；Injective 保存确定性的版次锚点，不上传你的私人记忆。</p>
        </section>

        <div className="grid grid-cols-2 gap-2">
          {TOPICS.map((item) => (
            <button key={item.key} onClick={() => setTopic(item.key)}
              className={`border-2 border-black p-2 text-left active:translate-y-px ${topic === item.key ? 'bg-[#2357d9] text-white shadow-[2px_2px_0_#000]' : 'bg-white text-black'}`}>
              <span className="block font-pixel text-[9px]">{item.label}</span>
              <span className={`block text-[8px] mt-1 ${topic === item.key ? 'text-white/65' : 'text-black/45'}`}>{item.subtitle}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="border-2 border-black bg-white p-8 flex flex-col items-center gap-3">
            <LoaderCircle className="w-5 h-5 animate-spin" />
            <span className="font-pixel text-[8px]">READING EDITION…</span>
          </div>
        )}

        {error && (
          <div className="border-2 border-black bg-[#ffe4e1] p-4 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
            <p className="text-[11px]">公共知识服务暂时不可用。</p>
            <button onClick={() => setTopic((value) => value === 'ai' ? 'finance' : 'ai')}
              className="mt-3 border-2 border-black bg-white px-3 py-1.5 font-pixel text-[7px] inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />重新读取
            </button>
          </div>
        )}

        {data && (
          <>
            <section className="border-2 border-black bg-white p-3 shadow-[2px_2px_0_#000]">
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
                    <div className="border border-black bg-[#f5f5f5] p-1.5"><span className="block font-pixel text-[9px]">{data.mode === 'live' ? 'LIVE' : 'DEMO'}</span><span className="text-[7px] text-black/45">MODE</span></div>
                  </div>
                  <code className="block mt-2 text-[8px] text-black/45 truncate">ROOT {shortHash(data.edition.editionRoot, 14, 10)}</code>
                  {data.edition.anchor && (
                    <a href={data.edition.anchor.scanUrl} target="_blank" rel="noreferrer"
                      className="mt-2 border-2 border-black bg-black text-[#7CFF6B] px-2 py-1.5 font-pixel text-[7px] inline-flex items-center gap-1 active:translate-y-px">
                      <Link2 className="w-3 h-3" />查看 Injective 交易<ExternalLink className="w-3 h-3" />
                    </a>
                  )}
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
      </main>
    </div>
  );
}
