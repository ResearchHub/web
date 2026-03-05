'use client';

import { FC } from 'react';
import { useFundraises } from '@/contexts/FundraiseContext';

export const ProposalCount: FC = () => {
  const { entries, isLoading } = useFundraises();

  if (isLoading) return <p className="mt-12 text-sm text-gray-600">&nbsp;</p>;

  return (
    <p className="mt-12 text-sm text-gray-600">
      <span className="font-semibold">
        {entries.length} proposal{entries.length !== 1 ? 's' : ''}
      </span>{' '}
      competing for award
    </p>
  );
};
