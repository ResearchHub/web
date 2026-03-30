'use client';

import { useState } from 'react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useRouter } from 'next/navigation';
import { WorkHeader } from './WorkHeader';

interface WorkHeaderProposalProps {
  work: Work;
  metadata: WorkMetadata;
  updatesCount?: number;
  className?: string;
}

export function WorkHeaderProposal({
  work,
  metadata,
  updatesCount,
  className,
}: WorkHeaderProposalProps) {
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const { showShareModal } = useShareModalContext();
  const router = useRouter();

  const activeFundraise = metadata.fundraising?.status === 'OPEN' ? metadata.fundraising : null;

  const handleContributeSuccess = () => {
    setIsFundModalOpen(false);
    showShareModal({
      url: globalThis.location.href,
      docTitle: work.title,
      action: 'USER_FUNDED_PROPOSAL',
    });
    router.refresh();
  };

  const primaryAction = activeFundraise ? (
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

  return (
    <>
      <WorkHeader
        work={work}
        metadata={metadata}
        contentType="fund"
        updatesCount={updatesCount}
        className={className}
        primaryAction={primaryAction}
      />

      {activeFundraise && (
        <ContributeToFundraiseModal
          isOpen={isFundModalOpen}
          onClose={() => setIsFundModalOpen(false)}
          onContributeSuccess={handleContributeSuccess}
          fundraise={activeFundraise}
          proposalTitle={work.title}
          work={work}
        />
      )}
    </>
  );
}
