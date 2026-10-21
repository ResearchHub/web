'use client';

import { type ReactNode, useRef, useState } from 'react';
import { Globe2, Link2 } from 'lucide-react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { useFundPanel } from '@/components/Funding/FundPanelContext';
import { CoverBadge, type CoverEyebrowSubject } from '@/components/work/WorkCover';
import { WorkCoverCard } from '@/components/work/WorkCoverCard';
import { ShareLinkModal } from '@/components/modals/ShareLinkModal';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { isFundraiseActive, getEffectiveStatus } from '@/components/Fund/lib/fundraiseUtils';
import { PostService } from '@/services/post.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { stripShareToken } from '@/lib/shareToken/url';
import { buildWorkUrl } from '@/utils/url';
import toast from 'react-hot-toast';
import { WorkHeader } from './WorkHeader';

interface WorkHeaderProposalProps {
  work: Work;
  metadata: WorkMetadata;
  preTitle?: ReactNode;
}

/** Who proposes it, for the Fund panel's cover: the lead author, and how many more. */
function proposerLabel(work: Work): string | undefined {
  const [lead, ...others] = work.authors;
  if (!lead) return undefined;
  const name = lead.authorProfile.fullName;
  return others.length > 0 ? `${name} and ${others.length} more` : name;
}

/** The same for the cover's top line: the lead author's face, linked to their profile. */
function proposerEyebrow(work: Work): CoverEyebrowSubject | undefined {
  const [lead, ...others] = work.authors;
  if (!lead) return undefined;
  const { id, fullName, profileImage } = lead.authorProfile;
  return {
    name: fullName,
    image: profileImage,
    authorId: id,
    more: others.length > 0 ? `and ${others.length} more` : undefined,
  };
}

/**
 * The proposal page's cover. The byline, tabs and funding card live in the
 * page beneath it; this keeps the Fund panel they open, and the proposal's
 * own menu actions (share link, make public).
 */
export function WorkHeaderProposal({ work, metadata, preTitle }: WorkHeaderProposalProps) {
  const { isFundPanelOpen, closeFundPanel } = useFundPanel();
  // Funding ends on the panel's thank-you screen; the share prompt waits for it to close.
  const hasJustFundedRef = useRef(false);
  const [isMakePublicModalOpen, setIsMakePublicModalOpen] = useState(false);
  const [isMakingPublic, setIsMakingPublic] = useState(false);
  const [isShareLinkModalOpen, setIsShareLinkModalOpen] = useState(false);
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
    displayedWork.linkedGrant?.applicationVisibility !== 'PRIVATE' &&
    (isOwner || !!user?.isModerator || !!user?.authorProfile?.isHubEditor);

  // Superset of the backend's rule, which is authoritative and also allows grant
  // creators — they aren't identifiable from `work`, so they don't see the option.
  const hasClearedModeration =
    displayedWork.moderationStatus !== 'PENDING' && displayedWork.moderationStatus !== 'DECLINED';
  const canShareLink =
    displayedWork.contentType === 'preregistration' &&
    displayedWork.isPublic === false &&
    displayedWork.unifiedDocumentId != null &&
    hasClearedModeration &&
    (isOwner || !!user?.isModerator || !!user?.authorProfile?.isHubEditor);

  const handleContributeSuccess = () => {
    hasJustFundedRef.current = true;
    router.refresh();
  };

  const handleFundPanelClose = () => {
    closeFundPanel();
    if (!hasJustFundedRef.current) return;
    hasJustFundedRef.current = false;
    showShareModal({
      url: stripShareToken(globalThis.location.href),
      docTitle: displayedWork.title,
      action: 'USER_FUNDED_PROPOSAL',
    });
  };

  const proposer = proposerLabel(displayedWork);

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

  const additionalMenuItems =
    canMakePublic || canShareLink ? (
      <>
        {canShareLink && (
          <BaseMenuItem onSelect={() => setIsShareLinkModalOpen(true)}>
            <Link2 className="h-4 w-4 mr-2" />
            Share link
          </BaseMenuItem>
        )}
        {canMakePublic && (
          <BaseMenuItem onSelect={() => setIsMakePublicModalOpen(true)}>
            <Globe2 className="h-4 w-4 mr-2" />
            Make public
          </BaseMenuItem>
        )}
      </>
    ) : undefined;

  const isClosed = fundraise ? getEffectiveStatus(fundraise) === 'CLOSED' : false;

  const closedBadge = isClosed ? <CoverBadge>Fundraise closed</CoverBadge> : undefined;

  return (
    <>
      <WorkHeader
        work={displayedWork}
        metadata={metadata}
        additionalMenuItems={additionalMenuItems}
        preTitle={preTitle}
        cover={{
          imageUrl: displayedWork.image,
          eyebrow: proposerEyebrow(displayedWork),
          badges: closedBadge,
        }}
      />

      {fundraise && isActive && (
        <ContributeToFundraiseModal
          isOpen={isFundPanelOpen}
          onClose={handleFundPanelClose}
          onContributeSuccess={handleContributeSuccess}
          fundraise={fundraise}
          proposalTitle={displayedWork.title}
          work={displayedWork}
          variant="panel"
          topContent={
            <WorkCoverCard
              title={displayedWork.title}
              eyebrow={proposer ? `Proposal · ${proposer}` : 'Proposal'}
              imageUrl={displayedWork.image}
            />
          }
          successText="Your name now shows with this proposal's funders."
        />
      )}

      {canShareLink && displayedWork.unifiedDocumentId != null && (
        <ShareLinkModal
          isOpen={isShareLinkModalOpen}
          onClose={() => setIsShareLinkModalOpen(false)}
          unifiedDocumentId={displayedWork.unifiedDocumentId}
          proposalPath={buildWorkUrl({
            id: displayedWork.id,
            contentType: displayedWork.contentType,
            slug: displayedWork.slug,
          })}
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
