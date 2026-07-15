'use client';

import { ReactNode, useState } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useRouter } from 'next/navigation';
import { isFundraiseActive, getEffectiveStatus } from '@/components/Fund/lib/fundraiseUtils';
import { WorkHeader } from './WorkHeader';

interface WorkHeaderProposalProps {
  work: Work;
  metadata: WorkMetadata;
  updatesCount?: number;
  className?: string;
  preTitle?: ReactNode;
  tabsWrapper?: (tabs: ReactNode) => ReactNode;
}

export function WorkHeaderProposal({
  work,
  metadata,
  updatesCount,
  className,
  preTitle,
  tabsWrapper,
}: WorkHeaderProposalProps) {
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const { showShareModal } = useShareModalContext();
  const router = useRouter();

  const fundraise = metadata.fundraising ?? null;

  const isActive = fundraise ? isFundraiseActive(fundraise) : false;

  const handleContributeSuccess = () => {
    setIsFundModalOpen(false);
    showShareModal({
      url: globalThis.location.href,
      docTitle: work.title,
      action: 'USER_FUNDED_PROPOSAL',
    });
    router.refresh();
  };

  const primaryAction =
    isActive && fundraise ? (
      <Button
        variant="default"
        size="lg"
        onClick={() => setIsFundModalOpen(true)}
        className="hidden tablet:flex gap-2"
      >
        <Icon name="giveRSC" size={20} color="white" />
        Fund Proposal
      </Button>
    ) : undefined;

  const isClosed = fundraise ? getEffectiveStatus(fundraise) === 'CLOSED' : false;

  const closedEyebrow = isClosed ? (
    <span className="inline-flex items-center font-medium text-xs sm:text-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-gray-600 bg-gray-100">
      Fundraise Closed
    </span>
  ) : undefined;

  return (
    <>
      <WorkHeader
        work={work}
        metadata={metadata}
        contentType="fund"
        updatesCount={updatesCount}
        className={className}
        primaryAction={primaryAction}
        eyebrow={closedEyebrow}
        preTitle={preTitle}
        tabsWrapper={tabsWrapper}
      />

      {fundraise && isActive && (
        <ContributeToFundraiseModal
          isOpen={isFundModalOpen}
          onClose={() => setIsFundModalOpen(false)}
          onContributeSuccess={handleContributeSuccess}
          fundraise={fundraise}
          proposalTitle={work.title}
          work={work}
        />
      )}
    </>
  );
}
