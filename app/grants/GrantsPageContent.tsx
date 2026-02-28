'use client';

import { FC } from 'react';
import { FeedEntry } from '@/types/feed';
import { GrantCard } from '@/components/Funding/GrantCard';
import { PageHeader } from '@/components/ui/PageHeader';

interface GrantsPageContentProps {
  openGrants: FeedEntry[];
  closedGrants: FeedEntry[];
}

export const GrantsPageContent: FC<GrantsPageContentProps> = ({ openGrants, closedGrants }) => {
  return (
    <div className="py-4">
      <PageHeader title="Awards" className="mb-6" />

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Open
          {openGrants.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">{openGrants.length}</span>
          )}
        </h2>
        {openGrants.length > 0 ? (
          <div className="flex flex-col gap-3">
            {openGrants.map((entry) => (
              <GrantCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-gray-400 text-sm">No open awards right now</p>
        )}
      </section>

      {closedGrants.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Completed
            <span className="ml-2 text-sm font-normal text-gray-400">{closedGrants.length}</span>
          </h2>
          <div className="flex flex-col gap-3">
            {closedGrants.map((entry) => (
              <GrantCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
