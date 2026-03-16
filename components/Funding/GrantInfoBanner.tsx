'use client';

import { useState, useCallback } from 'react';
import { ArrowUpFromLine, Share, MoreHorizontal, Edit, Flag, Search } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { SubmitProposalTooltip } from '@/components/tooltips/SubmitProposalTooltip';
import { AddToListModal } from '@/components/UserList/AddToListModal';
import { Tabs } from '@/components/ui/Tabs';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { Work } from '@/types/work';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useIsInList } from '@/components/UserList/lib/hooks/useIsInList';
import { useAddToList } from '@/components/UserList/lib/UserListsContext';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { useUser } from '@/contexts/UserContext';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icons/Icon';
import { PaperService } from '@/services/paper.service';
import toast from 'react-hot-toast';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

export type GrantBannerTab = 'proposals' | 'details';

const GRANT_BANNER_TABS = [
  { id: 'proposals' as const, label: 'Proposals' },
  { id: 'details' as const, label: 'Details' },
];

interface GrantInfoBannerProps {
  className?: string;
  amountUsd?: number;
  grantId?: string;
  isActive?: boolean;
  work?: Work;
  organization?: string;
  activeTab?: GrantBannerTab;
  onTabChange?: (tab: GrantBannerTab) => void;
}

function GrantSubtitle({
  amountUsd,
  isActive,
  organization,
}: {
  amountUsd?: number;
  isActive: boolean;
  organization?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {amountUsd != null && amountUsd > 0 && (
        <span
          className={cn(
            'font-mono font-bold text-sm px-2 py-0.5 rounded-md tabular-nums',
            isActive ? 'text-green-700 bg-green-100' : 'text-gray-500 bg-gray-100'
          )}
        >
          {formatCompactAmount(amountUsd)} available
        </span>
      )}
      {organization && <span className="text-sm text-gray-500">Offered by {organization}</span>}
    </div>
  );
}

export const GrantInfoBanner = ({
  className,
  amountUsd,
  grantId,
  isActive = true,
  work,
  organization,
  activeTab = 'proposals',
  onTabChange,
}: GrantInfoBannerProps) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { showShareModal } = useShareModalContext();
  const { isInList } = useIsInList(work?.unifiedDocumentId);
  const { isTogglingDefaultList, handleAddToList } = useAddToList({
    unifiedDocumentId: work?.unifiedDocumentId,
    isInList,
    onOpenModal: () => setIsAddToListModalOpen(true),
  });
  const { user } = useUser();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { selectedOrg } = useOrganizationContext();
  const router = useRouter();

  const isModerator = !!user?.isModerator;
  const isHubEditor = !!user?.authorProfile?.isHubEditor;
  const isAuthor =
    user?.authorProfile != null &&
    work?.authors?.some((a) => a.authorProfile.id === user.authorProfile?.id);
  const isGrantContact =
    user?.authorProfile != null &&
    work?.note?.post?.grant?.contacts?.some(
      (contact) => contact.authorProfile?.id === user.authorProfile?.id
    );
  const canEdit = isGrantContact || isAuthor || isModerator;

  const handleEdit = useCallback(() => {
    if (selectedOrg && work?.note) {
      router.push(`/notebook/${work.note.organization.slug}/${work.note.id}`);
    } else {
      toast.error('Unable to edit');
    }
  }, [selectedOrg, work?.note, router]);

  const latestVersion = work?.versions?.find((v) => v.isLatest);
  const isPublished = latestVersion?.publicationStatus === 'PUBLISHED';

  const handlePublish = useCallback(async () => {
    if (!work || isPublished) return;
    setIsPublishing(true);
    try {
      await PaperService.publishPaper(work.id);
      toast.success('Published to ResearchHub Journal');

      if (typeof router.refresh === 'function') {
        router.refresh();
      } else if (typeof globalThis !== 'undefined') {
        globalThis.location.reload();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to publish. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  }, [work?.id, isPublished, router]);

  const shareAction = () =>
    showShareModal({
      url: globalThis.location.href,
      docTitle: work?.title || '',
      action: 'USER_SHARED_DOCUMENT',
      shouldShowConfetti: false,
    });

  const moreMenuItems = (
    <>
      {canEdit && (
        <BaseMenuItem onSelect={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          <span>Edit</span>
        </BaseMenuItem>
      )}
      {!isPublished && isModerator && (
        <BaseMenuItem
          disabled={isPublishing}
          onSelect={() => executeAuthenticatedAction(handlePublish)}
        >
          <Icon name="rhJournal1" size={16} className="mr-2" />
          <span>Publish to Journal</span>
        </BaseMenuItem>
      )}
      {(isModerator || isHubEditor) && work?.unifiedDocumentId != null && (
        <BaseMenuItem
          onSelect={() =>
            router.push(`/expert-finder/library/new?unifiedDocumentId=${work.unifiedDocumentId}`)
          }
        >
          <Search className="h-4 w-4 mr-2" />
          <span>Find experts</span>
        </BaseMenuItem>
      )}
      <BaseMenuItem onSelect={() => executeAuthenticatedAction(() => setIsFlagModalOpen(true))}>
        <Flag className="h-4 w-4 mr-2" />
        <span>Flag Content</span>
      </BaseMenuItem>
    </>
  );

  const ctaButtons = (
    <div className="flex flex-shrink-0 flex-col items-stretch gap-2">
      {grantId && isActive && (
        <SubmitProposalTooltip>
          <Button
            variant="default"
            size="lg"
            onClick={() => setIsApplyModalOpen(true)}
            className="gap-2 w-full max-sm:!text-xs max-sm:!h-8 max-sm:!px-2"
          >
            Submit Proposal
            <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </SubmitProposalTooltip>
      )}

      <div className="hidden sm:flex items-center gap-2 justify-center">
        <Button
          variant="outlined"
          size="lg"
          className="flex-1 gap-2"
          aria-label="Share"
          onClick={shareAction}
        >
          <Share className="h-4 w-4" />
          <span className="text-sm">Share</span>
        </Button>

        {work?.unifiedDocumentId && (
          <Button
            variant="outlined"
            size="lg"
            onClick={handleAddToList}
            disabled={isTogglingDefaultList}
            className={cn('flex-1 gap-2', isInList && 'text-green-600 border-green-300')}
            aria-label="Save"
          >
            <FontAwesomeIcon icon={isInList ? faBookmarkSolid : faBookmark} className="h-4 w-4" />
            <span className="text-sm">Save</span>
          </Button>
        )}

        <BaseMenu
          align="end"
          trigger={
            <Button variant="outlined" size="lg" className="gap-2 !px-3" aria-label="More options">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        >
          {moreMenuItems}
        </BaseMenu>
      </div>
    </div>
  );

  const mobileSecondaryActions = (
    <div className="flex sm:hidden items-center gap-1.5 flex-shrink-0 mb-2">
      <Button variant="outlined" size="sm" aria-label="Share" onClick={shareAction}>
        <Share className="h-3.5 w-3.5" />
      </Button>
      {work?.unifiedDocumentId && (
        <Button
          variant="outlined"
          size="sm"
          onClick={handleAddToList}
          disabled={isTogglingDefaultList}
          className={cn(isInList && 'text-green-600 border-green-300')}
          aria-label="Save"
        >
          <FontAwesomeIcon icon={isInList ? faBookmarkSolid : faBookmark} className="h-3.5 w-3.5" />
        </Button>
      )}
      <BaseMenu
        align="end"
        trigger={
          <Button variant="outlined" size="sm" aria-label="More options">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        }
      >
        {moreMenuItems}
      </BaseMenu>
    </div>
  );

  return (
    <>
      <HeroHeader
        title={work?.title || ''}
        subtitle={
          <GrantSubtitle amountUsd={amountUsd} isActive={isActive} organization={organization} />
        }
        cta={ctaButtons}
        className={className}
      >
        {onTabChange && (
          <div className="flex items-end justify-between mt-3 sm:mt-4">
            <div className="min-w-0 flex-1">
              <Tabs
                tabs={GRANT_BANNER_TABS}
                activeTab={activeTab}
                onTabChange={(tabId) => onTabChange(tabId as GrantBannerTab)}
              />
            </div>
            {mobileSecondaryActions}
          </div>
        )}
      </HeroHeader>

      {grantId && (
        <ApplyToGrantModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onUseSelected={() => setIsApplyModalOpen(false)}
          grantId={grantId}
          grantTitle={work?.title}
          grantAmountUsd={amountUsd}
        />
      )}

      {work?.unifiedDocumentId && (
        <AddToListModal
          isOpen={isAddToListModalOpen}
          onClose={() => setIsAddToListModalOpen(false)}
          unifiedDocumentId={work.unifiedDocumentId}
        />
      )}

      {work && (
        <FlagContentModal
          isOpen={isFlagModalOpen}
          onClose={() => setIsFlagModalOpen(false)}
          documentId={work.id.toString()}
          workType={work.contentType}
        />
      )}
    </>
  );
};
