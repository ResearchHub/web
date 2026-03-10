'use client';

import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';
import { FundraiseProvider } from '@/contexts/FundraiseContext';

interface GrantDocumentProps {
  work: Work;
  metadata: WorkMetadata;
}

export const GrantDocument = ({ work, metadata }: GrantDocumentProps) => {
  const grantId = Number(work.note?.post?.grant?.id);

  return (
    <FundraiseProvider grantId={grantId}>
      <div id="grant-content">
        <WorkLineItems work={work} showClaimButton={false} metadata={metadata} />

        {work.note?.post?.grant?.description && <ProposalSortAndFilters variant="grant" />}

        <ProposalFeed />
      </div>
    </FundraiseProvider>
  );
};
