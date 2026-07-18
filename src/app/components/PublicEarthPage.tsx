import { useState } from 'react';
import DailyKnowledgePage from './DailyKnowledgePage';
import PublicEarthPanel from './PublicEarthPanel';
import type { KnowledgeTopic } from '../lib/chronicle/types';

export default function PublicEarthPage() {
  const [knowledgeOpen, setKnowledgeOpen] = useState<KnowledgeTopic | null>(null);

  if (knowledgeOpen) return <DailyKnowledgePage initialTopic={knowledgeOpen} onBack={() => setKnowledgeOpen(null)} />;

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#EAEAEA] overflow-hidden">
      <h1 className="sr-only">PUBLIC EARTH</h1>
      <div className="flex-1 min-h-0 overflow-y-auto p-3 pb-[max(1rem,env(safe-area-inset-bottom))]" data-testid="public-earth-scroll">
        <PublicEarthPanel onOpenTopic={setKnowledgeOpen} />
      </div>
    </div>
  );
}
