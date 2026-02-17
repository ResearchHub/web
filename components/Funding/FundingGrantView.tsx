'use client';

import { FC } from 'react';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { GrantPreview } from './GrantPreview';
import { FundingProposalGrid } from './FundingProposalGrid';

interface FundingGrantViewProps {
  grant: FeedEntry;
}

export const FundingGrantView: FC<FundingGrantViewProps> = ({ grant }) => {
  const grantContent = grant.content as FeedGrantContent;
  const grantId = grantContent.grant?.id;

  if (!grantId) return null;

  return (
    <>
      <GrantPreview grant={grant} className="mb-8" />
      <FundingProposalGrid grantId={grantId} />
    </>
  );
};
