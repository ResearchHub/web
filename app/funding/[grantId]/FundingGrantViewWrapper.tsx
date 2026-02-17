'use client';

import { FC } from 'react';
import { FeedEntry } from '@/types/feed';
import { FundingGrantView } from '@/components/Funding/FundingGrantView';

interface FundingGrantViewWrapperProps {
  grant: FeedEntry;
}

export const FundingGrantViewWrapper: FC<FundingGrantViewWrapperProps> = ({ grant }) => {
  return <FundingGrantView grant={grant} />;
};
