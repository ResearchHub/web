'use client';

import { FC } from 'react';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { GrantPreview, transformFeedEntryToGrantPreviewData } from './GrantPreview';
import { FundingProposalGrid } from './FundingProposalGrid';

interface FundingGrantViewProps {
  grant: FeedEntry;
}

export const FundingGrantView: FC<FundingGrantViewProps> = ({ grant }) => {
  const grantContent = grant.content as FeedGrantContent;
  const grantId = grantContent.grant?.id;
  const grantPreviewData = transformFeedEntryToGrantPreviewData(grant);

  if (!grantId || !grantPreviewData) return null;

  return (
    <>
      <GrantPreview grant={grantPreviewData} className="mb-8" />
      <FundingProposalGrid />
    </>
  );
};
