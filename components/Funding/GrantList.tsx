'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { GrantCarousel } from '@/components/Funding/GrantCarousel';
import { FeedEntry } from '@/types/feed';

interface GrantListProps {
  grants: FeedEntry[];
  emptyMessage?: string;
  showCreateCTA?: boolean;
  isDashboard?: boolean;
  onInviteExperts?: (grantId: number) => void;
  onEditGrant?: (grantId: number) => void;
}

export const GrantList: FC<GrantListProps> = ({
  grants,
  emptyMessage = 'No grants found.',
  showCreateCTA = false,
  isDashboard,
  onInviteExperts,
  onEditGrant,
}) => {
  if (grants.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-400">{emptyMessage}</p>
        {showCreateCTA && (
          <Link
            href="/funding/create"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Open a funding opportunity
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="py-4">
      {grants.map((grant) => (
        <GrantCarousel
          key={grant.id}
          grant={grant}
          isDashboard={isDashboard}
          onInviteExperts={onInviteExperts ? () => onInviteExperts(Number(grant.id)) : undefined}
          onEditGrant={onEditGrant ? () => onEditGrant(Number(grant.id)) : undefined}
        />
      ))}

      {showCreateCTA && (
        <div className="flex items-center justify-center py-10 mt-4 rounded-lg border border-dashed border-gray-200">
          <div className="text-center">
            <Link
              href="/funding/create"
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Open a funding opportunity
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
