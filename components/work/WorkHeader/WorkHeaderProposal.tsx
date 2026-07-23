'use client';

import { useState } from 'react';
import { Globe2 } from 'lucide-react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/icons';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { isFundraiseActive, getEffectiveStatus } from '@/components/Fund/lib/fundraiseUtils';
import { PostService } from '@/services/post.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import toast from 'react-hot-toast';
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
  const [isMakePublicModalOpen, setIsMakePublicModalOpen] = useState(false);
  const [isMakingPublic, setIsMakingPublic] = useState(false);
  const [updatedWork, setUpdatedWork] = useState<Work | null>(null);
  const { showShareModal } = useShareModalContext();
  const { user } = useUser();
  const router = useRouter();

  const displayedWork = updatedWork ?? work;
  const fundraise = metadata.fundraising ?? null;

  const isActive = fundraise ? isFundraiseActive(fundraise) : false;
  const isOwner = user?.id != null && displayedWork.createdByUserId === user.id;
  const canMakePublic =
    displayedWork.contentType === 'preregistration' &&
    displayedWork.isPublic === false &&
    (isOwner || !!user?.isModerator || !!user?.authorProfile?.isHubEditor);

  const handleContributeSuccess = () => {
    setIsFundModalOpen(false);
    showShareModal({
      url: globalThis.location.href,
      docTitle: displayedWork.title,
      action: 'USER_FUNDED_PROPOSAL',
    });
    router.refresh();
  };

  const handleMakePublic = async () => {
    setIsMakingPublic(true);

    try {
      const publicProposal = await PostService.makePublic(displayedWork.id);
      setUpdatedWork(publicProposal);
      setIsMakePublicModalOpen(false);
      toast.success('Proposal is now public');
      router.refresh();
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Failed to make proposal public'));
    } finally {
      setIsMakingPublic(false);
    }
  };

  const makePublicAction = canMakePublic ? (
    <Button
      variant="outlined"
      size="sm"
      onClick={() => setIsMakePublicModalOpen(true)}
      className="h-7 shrink-0 gap-1.5 border-gray-300 bg-gray-100 px-2.5 text-gray-700 hover:bg-gray-200"
    >
      <Globe2 className="h-3.5 w-3.5" />
      Make public
    </Button>
  ) : undefined;

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
        work={displayedWork}
        metadata={metadata}
        contentType="fund"
        updatesCount={updatesCount}
        className={className}
        primaryAction={primaryAction}
        privateProposalAction={makePublicAction}
        eyebrow={closedEyebrow}
      />

      {fundraise && isActive && (
        <ContributeToFundraiseModal
          isOpen={isFundModalOpen}
          onClose={() => setIsFundModalOpen(false)}
          onContributeSuccess={handleContributeSuccess}
          fundraise={fundraise}
          proposalTitle={displayedWork.title}
          work={displayedWork}
        />
      )}

      <ConfirmationModal
        isOpen={isMakePublicModalOpen}
        onClose={() => setIsMakePublicModalOpen(false)}
        onConfirm={handleMakePublic}
        title="Make this proposal public?"
        description="Anyone will be able to view it. This cannot be undone."
        confirmLabel={isMakingPublic ? 'Making public...' : 'Make public'}
        isConfirming={isMakingPublic}
      />
    </>
  );
}
