'use client';

import { useMemo } from 'react';
import { buildPioneersFeedEntries } from '@/components/Journal/lib/pioneersFeed';
import { PioneersPaperCard } from '@/components/Journal/PioneersPaperCard';

export function PioneersFeed() {
  const entries = useMemo(() => buildPioneersFeedEntries(), []);

  if (entries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-400">No publications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {entries.map((entry) => (
        <PioneersPaperCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
