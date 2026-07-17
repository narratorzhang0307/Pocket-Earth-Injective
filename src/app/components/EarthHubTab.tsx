import { useState } from 'react';
import EarthModeTabs, { type EarthMode } from './EarthModeTabs';
import MyMapTab from './MyMapTab';
import PublicEarthPage from './PublicEarthPage';

export default function EarthHubTab() {
  const [mode, setMode] = useState<EarthMode>('private');

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#EAEAEA] font-sans">
      <div className="flex justify-center items-center h-[30px] px-4 border-b-2 border-black bg-[#EAEAEA] shrink-0">
        <div className="font-pixel text-[9px] uppercase tracking-[0.14em] leading-none">POCKET EARTH ON INJECTIVE</div>
      </div>
      <EarthModeTabs active={mode} onChange={setMode} />
      <div className="flex-1 min-h-0 overflow-hidden">
        {mode === 'private'
          ? <MyMapTab embedded />
          : <PublicEarthPage />}
      </div>
    </div>
  );
}
