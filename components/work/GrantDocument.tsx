'use client';

import { useState } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { isDeadlineInFuture } from '@/utils/date';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { GrantDetailsCallout } from '@/components/Funding/GrantDetailsCallout';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';

interface GrantDocumentProps {
  work: Work;
  metadata: WorkMetadata;
}

export const GrantDocument = ({ work, metadata }: GrantDocumentProps) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const grantId = Number(work.note?.post?.grant?.id);

  const isActive =
    work.note?.post?.grant?.status === 'OPEN' &&
    (work.note?.post?.grant?.endDate ? isDeadlineInFuture(work.note?.post?.grant?.endDate) : true);

  return (
    <FundraiseProvider grantId={grantId}>
      <div>
        <div className="flex items-center gap-2 mb-2 mt-2">
          <RadiatingDot color={isActive ? 'bg-green-500' : 'bg-gray-400'} isRadiating={isActive} />
          <span className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
            {isActive ? 'Accepting Proposals' : 'Closed'}
          </span>
        </div>

        <PageHeader title={work.title} className="text-2xl md:!text-3xl mt-0" />
        <WorkLineItems work={work} showClaimButton={false} metadata={metadata} />

        {work.previewContent ? (
          <GrantDetailsCallout content={work.previewContent} />
        ) : (
          <p className="mt-4 text-gray-500">No content available</p>
        )}

        {work.note?.post?.grant?.amount && work.note?.post?.grant?.currency && (
          <div className="mt-2 text-sm text-gray-600 right-sidebar:hidden">
            <div className="flex items-start gap-4 min-w-0">
              <span className="font-medium text-gray-900 flex-shrink-0 w-16 tablet:w-28">
                Amount
              </span>
              <div className="flex-1 min-w-0 space-y-1 md:space-y-0 md:flex md:items-center md:gap-2">
                <div className="font-semibold text-primary-600 flex items-center gap-1">
                  <span>$</span>
                  {(work.note?.post?.grant?.amount.usd || 0).toLocaleString()}
                  <span>USD</span>
                </div>
                <div className="hidden md:block h-4 w-px bg-gray-300" />
                <div className="text-sm text-gray-600">
                  May be divided across multiple proposals.
                </div>
              </div>
            </div>
          </div>
        )}

        <FundingProposalGrid className="mt-6" />

        <ApplyToGrantModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onUseSelected={() => setIsApplyModalOpen(false)}
          grantId={grantId.toString()}
        />
      </div>
    </FundraiseProvider>
  );
};
