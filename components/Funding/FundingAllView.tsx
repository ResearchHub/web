'use client';

import { FC } from 'react';
import { GrantPreviewAll } from './GrantPreviewAll';
import { FundingProposalGrid } from './FundingProposalGrid';

export const FundingAllView: FC = () => {
  return (
    <>
      <GrantPreviewAll className="mb-8" />
      <FundingProposalGrid />
    </>
  );
};
