import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, FileText, Pause, Play, Radio, ShieldCheck, Square } from 'lucide-react';
import FrostNftAvatar from './FrostNftAvatar';

interface PodcastSource { title: string; publisher: string; publishedAt: string | null; url: string }
interface PodcastSegment {
  id: string;
  topic: string;
  label: string;
  role: string;
  title: string;
  claim: string;
  summary: string;
  verdict: string;
  truthScore: number;
  recordHash: string | null;
  sources: PodcastSource[];
  narration: string;
}
interface PodcastResponse {
  schema: 'pocket-earth-daily-podcast/v1';
  podcastId: string;
  date: string;
  state: 'ready' | 'waiting-for-verified-knowledge';
  title: string;
  intro: string;
  outro: string;
  script: string;
  segments: PodcastSegment[];
  memory: { hotWindowDays: number; editionRoots: string[]; anchoredRoots: string[]; policy: string };
  run: { events: Array<{ sequence: number; stage: string; status: string }> };
}

interface Props { onBack: () => void }
type Mode = 'podcast' | 'text';
type Playback = 'idle' | 'playing' | 'paused';

function shortHash(value: string | null) {
  return value ? `${value.slice(0, 8)}…${value.slice(-6)}` : '等待长期版次';
}

export default function PocketPodcastPage({ onBack }: Props) {
  const [mode, setMode] = useState<Mode>('podcast');
  const [data, setData] = useState<PodcastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [playback, setPlayback] = useState<Playback>('idle');
  const playSession = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/knowledge?tool=podcast', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`podcast_${response.status}`)))
      .then((payload: PodcastResponse) => setData(payload))
      .catch((cause) => { if (cause?.name !== 'AbortError') setError('今天的可验证播客还没有准备好。'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => () => {
    playSession.current += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const segments = data?.segments || [];
  const selected = segments[Math.min(current, Math.max(0, segments.length - 1))];
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const verifiedSources = useMemo(() => segments.reduce((sum, segment) => sum + segment.sources.length, 0), [segments]);

  const speak = (index: number) => {
    if (!canSpeak || !segments.length) return;
    const safeIndex = (index + segments.length) % segments.length;
    const session = playSession.current + 1;
    playSession.current = session;
    window.speechSynthesis.cancel();
    setCurrent(safeIndex);
    const utterance = new SpeechSynthesisUtterance(`${safeIndex === 0 ? `${data?.intro} ` : ''}${segments[safeIndex].narration}${safeIndex === segments.length - 1 ? ` ${data?.outro}` : ''}`);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.94;
    utterance.pitch = 1;
    utterance.onstart = () => { if (playSession.current === session) setPlayback('playing'); };
    utterance.onend = () => {
      if (playSession.current !== session) return;
      if (safeIndex + 1 < segments.length) speak(safeIndex + 1);
      else setPlayback('idle');
    };
    utterance.onerror = () => { if (playSession.current === session) setPlayback('idle'); };
    window.speechSynthesis.speak(utterance);
  };

  const togglePlayback = () => {
    if (!canSpeak || !segments.length) return;
    if (playback === 'playing') {
      window.speechSynthesis.pause();
      setPlayback('paused');
    } else if (playback === 'paused') {
      window.speechSynthesis.resume();
      setPlayback('playing');
    } else speak(current);
  };

  const stop = () => {
    playSession.current += 1;
    if (canSpeak) window.speechSynthesis.cancel();
    setPlayback('idle');
  };

  const move = (step: -1 | 1) => {
    stop();
    if (segments.length) setCurrent((value) => (value + step + segments.length) % segments.length);
  };

  return (
    <div className="h-full flex flex-col bg-[#EAEAEA] font-sans">
      <header className="flex items-center gap-2 px-3 py-2.5 border-b-2 border-black bg-white shrink-0">
        <button type="button" onClick={onBack} aria-label="返回 Agents" className="w-8 h-8 border-2 border-black bg-white grid place-items-center shadow-[1px_1px_0_#000] active:translate-y-px"><ChevronLeft className="w-4 h-4" strokeWidth={3} /></button>
        <div className="min-w-0 flex-1"><h1 className="font-pixel text-[11px] tracking-wider">POCKET PODCAST</h1><p className="text-[9px] text-black/45 mt-0.5">可验证公共知识的每日音频 Agent</p></div>
        <Radio className="w-5 h-5 text-[#315e4b]" />
      </header>

      <div className="grid grid-cols-2 gap-2 p-2 border-b-2 border-black bg-[#EAEAEA] shrink-0">
        <button type="button" onClick={() => setMode('podcast')} className={`border-2 border-black py-2 font-pixel text-[8px] flex items-center justify-center gap-1.5 ${mode === 'podcast' ? 'bg-[#315e4b] text-white shadow-[2px_2px_0_#000]' : 'bg-white'}`}><Radio className="w-3.5 h-3.5" />播客模式</button>
        <button type="button" onClick={() => { stop(); setMode('text'); }} className={`border-2 border-black py-2 font-pixel text-[8px] flex items-center justify-center gap-1.5 ${mode === 'text' ? 'bg-black text-white shadow-[2px_2px_0_#7CFFB2]' : 'bg-white'}`}><FileText className="w-3.5 h-3.5" />文字模式</button>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        <section className="border-[3px] border-black bg-[#f3f0e7] p-3 shadow-[3px_3px_0_#000]">
          <div className="flex items-center gap-3">
            <FrostNftAvatar agentId={43} label="口袋播客 Frost 主持人" className="w-[76px] h-[76px] border-2 border-black shrink-0" imageStyle={{ inset: 2 }} />
            <div className="min-w-0 flex-1">
              <div className="font-pixel text-[8px] text-[#315e4b] tracking-wider">FROST · DAILY HOST</div>
              <h2 className="text-[17px] font-bold mt-1">{data?.title || '今日口袋播客'}</h2>
              <p className="text-[9px] text-black/55 mt-1 leading-relaxed">8 个领域 Agent 找信号，核验流水线守事实，Frost 只负责把通过审查的知识讲清楚。</p>
            </div>
          </div>
          {data && <div className="grid grid-cols-3 gap-1.5 mt-3 text-center">
            <div className="border border-black bg-white py-1.5"><b className="font-pixel text-[9px]">{segments.length}</b><span className="block text-[7px]">今日条目</span></div>
            <div className="border border-black bg-white py-1.5"><b className="font-pixel text-[9px]">{verifiedSources}</b><span className="block text-[7px]">来源凭据</span></div>
            <div className="border border-black bg-white py-1.5"><b className="font-pixel text-[9px]">7D</b><span className="block text-[7px]">热缓存</span></div>
          </div>}
        </section>

        {loading && <div className="border-2 border-black bg-white p-5 text-center font-pixel text-[8px]">LOADING VERIFIED EDITION…</div>}
        {error && <div className="border-2 border-black bg-[#fff1e6] p-4 text-[10px]">{error}</div>}
        {!loading && data?.state !== 'ready' && !error && <div className="border-2 border-black bg-white p-4 text-[10px] leading-relaxed">今天尚无达到播报门槛的交叉核验记录。Agent 会等待，不会用未经核验的候选新闻填满节目。</div>}

        {mode === 'podcast' && selected && (
          <section className="border-[3px] border-black bg-white p-3 shadow-[3px_3px_0_#000]">
            <div className="flex items-center justify-between gap-2"><span className="font-pixel text-[7px] text-black/45">NOW PLAYING · {current + 1}/{segments.length}</span><span className="border border-black px-1.5 py-0.5 text-[8px]" style={{ background: '#dff8e9' }}>{selected.label}</span></div>
            <h3 className="text-[17px] font-bold leading-snug mt-3">{selected.title}</h3>
            <p className="text-[11px] text-black/65 leading-relaxed mt-2">{selected.summary}</p>
            <div className="mt-3 border-l-4 border-[#315e4b] bg-[#f0eee7] px-3 py-2 text-[9px] leading-relaxed">{selected.narration}</div>
            <div className="grid grid-cols-[44px_1fr_44px] gap-2 items-center mt-4">
              <button type="button" onClick={() => move(-1)} aria-label="上一条" className="h-11 border-2 border-black grid place-items-center bg-[#f3f0e7] active:translate-y-px"><ChevronLeft strokeWidth={3} /></button>
              <div className="grid grid-cols-[1fr_46px] gap-2">
                <button type="button" onClick={togglePlayback} disabled={!canSpeak} className="h-11 border-2 border-black bg-[#315e4b] text-white font-pixel text-[8px] flex items-center justify-center gap-2 shadow-[2px_2px_0_#000] disabled:opacity-40">{playback === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{playback === 'playing' ? '暂停' : playback === 'paused' ? '继续' : '播放今日播客'}</button>
                <button type="button" onClick={stop} aria-label="停止" className="border-2 border-black bg-white grid place-items-center"><Square className="w-3.5 h-3.5" fill="currentColor" /></button>
              </div>
              <button type="button" onClick={() => move(1)} aria-label="下一条" className="h-11 border-2 border-black grid place-items-center bg-[#f3f0e7] active:translate-y-px"><ChevronRight strokeWidth={3} /></button>
            </div>
            {!canSpeak && <p className="text-[8px] text-black/45 mt-2">当前浏览器不支持本地语音合成，可切换文字模式。</p>}
          </section>
        )}

        {mode === 'text' && data && (
          <div className="space-y-3">
            {segments.map((segment, index) => (
              <article key={segment.id} className="border-[3px] border-black bg-white p-3 shadow-[3px_3px_0_#000]">
                <div className="flex items-center gap-2"><span className="font-pixel text-[7px] text-black/45">{String(index + 1).padStart(2, '0')} · {segment.label}</span><span className="ml-auto text-[8px] font-bold text-[#315e4b]">TRUTH {segment.truthScore}</span></div>
                <h3 className="text-[16px] font-bold leading-snug mt-2">{segment.claim}</h3>
                <p className="text-[10px] text-black/60 leading-relaxed mt-2">{segment.summary}</p>
                <div className="mt-3 border-t border-black/20 pt-2 space-y-1.5">
                  {segment.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="flex items-start gap-1.5 text-[8px] text-[#315e4b] underline underline-offset-2"><ExternalLink className="w-3 h-3 shrink-0" />{source.publisher} · {source.title}</a>)}
                </div>
                <div className="mt-3 flex items-center gap-1 text-[8px] text-black/45"><ShieldCheck className="w-3 h-3 text-[#315e4b]" />RECORD {shortHash(segment.recordHash)}</div>
              </article>
            ))}
          </div>
        )}

        {data && <div className="border-2 border-black bg-[#dff8e9] p-2.5 text-[9px] leading-relaxed"><b>记忆策略：</b>{data.memory.policy}</div>}
      </main>
    </div>
  );
}
