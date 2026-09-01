'use client';

import { ProposalWorkCard } from '@/components/Funding/ProposalWorkCard';
import { getFeedEntries } from '../lib/proposals';
import { NonNavigating } from './NonNavigating';

interface ProposalsBlockProps {
  readonly postIds: number[];
  readonly heading?: string;
}

/**
 * Renders proposals with the production feed card rather than a bespoke one, fed
 * by fixture JSON run through the real `transformFeedEntry`. The cards do not
 * navigate: see `NonNavigating`.
 */
export const ProposalsBlock = ({ postIds, heading }: ProposalsBlockProps) => {
  const entries = getFeedEntries(postIds);

  if (entries.length === 0) return null;

  return (
    <div className="mt-4">
      {heading && (
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          {heading}
        </div>
      )}
      <div className="grid gap-4 min-[560px]:grid-cols-2">
        {entries.map((entry) => (
          <NonNavigating key={entry.id}>
            <ProposalWorkCard entry={entry} />
          </NonNavigating>
        ))}
      </div>
    </div>
  );
};
