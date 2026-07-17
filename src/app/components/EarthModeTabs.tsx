import { Globe2, LockKeyhole } from 'lucide-react';

export type EarthMode = 'private' | 'public';

interface Props {
  active: EarthMode;
  onChange: (mode: EarthMode) => void;
}

export default function EarthModeTabs({ active, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 border-b-2 border-black bg-[#EAEAEA] p-2 gap-2 shrink-0" aria-label="地球图层">
      <button
        type="button"
        onClick={() => onChange('private')}
        aria-pressed={active === 'private'}
        className={`min-h-11 border-2 border-black px-2 py-1.5 text-left flex items-center gap-2 active:translate-y-px ${active === 'private' ? 'bg-black text-white shadow-[2px_2px_0_#00ff88]' : 'bg-white text-black'}`}
      >
        <LockKeyhole className="w-4 h-4 shrink-0" strokeWidth={2.5} />
        <span className="min-w-0">
          <span className="block font-pixel text-[8px] leading-tight">PRIVATE MAP</span>
          <span className={`block text-[8px] mt-0.5 ${active === 'private' ? 'text-white/60' : 'text-black/45'}`}>私人知识库</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onChange('public')}
        aria-pressed={active === 'public'}
        className={`min-h-11 border-2 border-black px-2 py-1.5 text-left flex items-center gap-2 active:translate-y-px ${active === 'public' ? 'bg-[#315e4b] text-white shadow-[2px_2px_0_#000]' : 'bg-white text-black'}`}
      >
        <Globe2 className="w-4 h-4 shrink-0" strokeWidth={2.5} />
        <span className="min-w-0">
          <span className="block font-pixel text-[8px] leading-tight">PUBLIC EARTH</span>
          <span className={`block text-[8px] mt-0.5 ${active === 'public' ? 'text-white/65' : 'text-black/45'}`}>公共地球</span>
        </span>
      </button>
    </div>
  );
}
