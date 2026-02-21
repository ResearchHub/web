'use client';

import { FC } from 'react';
import { GrantCarousel } from '@/components/Funding/GrantCarousel';
import { FeedEntry } from '@/types/feed';

interface GrantListProps {
  grants: FeedEntry[];
  emptyMessage?: string;
}

export const GrantList: FC<GrantListProps> = ({ grants, emptyMessage = 'No grants found.' }) => {
  if (grants.length === 0) {
    return <p className="text-center text-gray-400 py-16">{emptyMessage}</p>;
  }

  return (
    <div className="py-4">
      {grants.map((grant) => (
        <GrantCarousel key={grant.id} grant={grant} />
      ))}
    </div>
  );
};
