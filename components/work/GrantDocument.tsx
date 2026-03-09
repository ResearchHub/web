'use client';

import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { WorkLineItems } from './WorkLineItems';
import { PageHeader } from '@/components/ui/PageHeader';
import { isDeadlineInFuture } from '@/utils/date';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';

import { GrantInfoBanner } from '@/components/Funding/GrantInfoBanner';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { buildWorkUrl } from '@/utils/url';

interface GrantDocumentProps {
  work: Work;
  metadata: WorkMetadata;
}

export const GrantDocument = ({ work, metadata }: GrantDocumentProps) => {
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

        <PageHeader
          title={work.title}
          className="text-2xl md:!text-3xl mt-0"
          hasBounty={metadata.openBounties > 0}
          bountyUrl={buildWorkUrl({
            id: work.id,
            contentType: 'post',
            slug: work.slug,
            tab: 'bounties',
          })}
        />
        <WorkLineItems work={work} showClaimButton={false} metadata={metadata} />

        {work.note?.post?.grant?.description ? (
          <>
            <GrantInfoBanner
              className="mt-4"
              description={work.note.post.grant.description}
              content={work.previewContent}
              amountUsd={work.note.post.grant.amount?.usd}
              grantId={grantId.toString()}
              isActive={isActive}
              imageUrl={work.image}
              work={work}
              organization={work.note?.post?.grant?.organization}
            />
            <ProposalSortAndFilters variant="grant" />
          </>
        ) : (
          <p className="mt-4 text-gray-500">No content available</p>
        )}

        <ProposalFeed />
      </div>
    </FundraiseProvider>
  );
};
