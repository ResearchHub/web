'use client';

import { useState, useCallback } from 'react';
import {
  ArrowUp,
  Flag,
  Edit,
  MoreHorizontal,
  FileUp,
  Octagon,
  Share2,
  CheckCircle,
  Download,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { Work } from '@/types/work';
import { AuthorList } from '@/components/ui/AuthorList';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useVote } from '@/hooks/useVote';
import { useUserVotes } from '@/hooks/useUserVotes';
import { useCloseFundraise } from '@/hooks/useFundraise';
import toast from 'react-hot-toast';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useRouter } from 'next/navigation';
import { TipContentModal } from '@/components/modals/TipContentModal';
import { Icon } from '@/components/ui/icons/Icon';
import { PaperService } from '@/services/paper.service';
import { useUser } from '@/contexts/UserContext';
import { Contact } from '@/types/note';
import { WorkEditModal } from './WorkEditModal';
import { WorkMetadata } from '@/services/metadata.service';
import { useShareModalContext } from '@/contexts/ShareContext';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useCompleteFundraise } from '@/hooks/useFundraise';
import { AddToListModal } from '@/components/UserList/AddToListModal';
import { useIsInList } from '@/components/UserList/lib/hooks/useIsInList';
import { useAddToList } from '@/components/UserList/lib/UserListsContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { handleDownload } from '@/utils/download';

interface WorkLineItemsProps {
  work: Work;
  showClaimButton?: boolean;
  insightsButton?: React.ReactNode;
  metadata: WorkMetadata;
  onEditClick?: () => void;
}

export const WorkLineItems = ({
  work,
  showClaimButton = true,
  insightsButton,
  metadata,
  onEditClick,
}: WorkLineItemsProps) => {
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showFundraiseActionModal, setShowFundraiseActionModal] = useState(false);
  const [fundraiseAction, setFundraiseAction] = useState<'close' | 'complete' | null>(null);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { vote, isVoting } = useVote({
    votableEntityId: work.id,
    feedContentType: work.contentType === 'paper' ? 'PAPER' : 'POST',
    relatedDocumentTopics: work.topics,
    relatedDocumentId: work.id.toString(),
    relatedDocumentContentType: work.contentType,
  });

  const [voteCount, setVoteCount] = useState(
    work.metrics?.adjustedScore ?? work.metrics?.votes ?? 0
  );
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const router = useRouter();
  const { selectedOrg } = useOrganizationContext();
  const { user } = useUser();
  const [isWorkEditModalOpen, setIsWorkEditModalOpen] = useState(false);
  const { showShareModal } = useShareModalContext();
  const { isInList, listIdsContainingDocument } = useIsInList(work.unifiedDocumentId);
  const { isTogglingDefaultList, handleAddToList } = useAddToList({
    unifiedDocumentId: work.unifiedDocumentId,
    isInList,
    onOpenModal: () => setIsAddToListModalOpen(true),
  });

  // Extract PDF format for download
  const pdfFormat = work.formats?.find((format) => format.type === 'PDF');

  const {
    data: userVotes,
    isLoading: isLoadingVotes,
    refresh: refreshVotes,
  } = useUserVotes({
    paperIds: work.contentType === 'paper' ? [work.id] : [],
    postIds:
      work.contentType === 'post' ||
      work.contentType === 'preregistration' ||
      work.contentType === 'funding_request'
        ? [work.id]
        : [],
  });

  const isUpvoted =
    work.contentType === 'paper'
      ? userVotes?.papers[work.id]?.voteType === 'upvote'
      : userVotes?.posts[work.id]?.voteType === 'upvote';

  const handleVote = useCallback(async () => {
    const wasUpvoted = isUpvoted;

    try {
      await vote(wasUpvoted ? 'NEUTRAL' : 'UPVOTE');

      setVoteCount((prevCount) => (wasUpvoted ? prevCount - 1 : prevCount + 1));

      await refreshVotes();
    } catch (error: any) {
      // Check if it's a 403 error or contains the specific error message
      if (
        error?.status === 403 ||
        (error?.response && error?.response?.status === 403) ||
        (typeof error === 'object' && error?.detail === 'Can not vote on own content')
      ) {
        toast.error('Cannot vote on your own content');
      } else {
        // For other errors, show a generic message
        toast.error(
          error instanceof Error ? error.message : 'Unable to process your vote. Please try again.'
        );
      }
    }
  }, [work.contentType, work.id, isUpvoted, vote, refreshVotes]);

  // Determine if current user is a moderator
  const isModerator = !!user?.isModerator;
  // Determine if current user is a hub editor
  const isHubEditor = !!user?.authorProfile?.isHubEditor;

  // Determine if current user is an author
  const isAuthor =
    user?.authorProfile != null &&
    work.authors?.some((a) => a.authorProfile.id === user.authorProfile?.id);

  const handleEdit = useCallback(() => {
    if (work.contentType === 'paper' && (isModerator || isHubEditor)) {
      setIsWorkEditModalOpen(true);
    } else if (selectedOrg && work.note) {
      router.push(`/notebook/${work.note.organization.slug}/${work.note.id}`);
    } else if (
      (work.contentType === 'post' || work.contentType === 'preregistration') &&
      isAuthor &&
      onEditClick
    ) {
      onEditClick();
    } else {
      toast.error('Unable to edit');
    }
  }, [
    work.contentType,
    work.note,
    selectedOrg,
    router,
    isModerator,
    isHubEditor,
    isAuthor,
    onEditClick,
  ]);

  const handleTipSuccess = (amount: number) => {
    toast.success(`Successfully tipped ${amount} RSC`);
    setIsTipModalOpen(false);
  };

  // Determine if the latest version has already been published
  const latestVersion = work.versions?.find((v) => v.isLatest);
  const isPublished = latestVersion?.publicationStatus === 'PUBLISHED';

  const handlePublish = useCallback(async () => {
    if (isPublished) return;

    setIsPublishing(true);
    try {
      await PaperService.publishPaper(work.id);
      toast.success('Paper published to ResearchHub Journal');

      // Refresh the page data to reflect new publication status
      if (typeof router.refresh === 'function') {
        router.refresh();
      } else if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to publish paper. Please try again.'
      );
    } finally {
      setIsPublishing(false);
    }
  }, [work.id, isPublished, router]);

  const isGrantContact =
    user?.authorProfile != null &&
    work.contentType === 'funding_request' &&
    work.note?.post?.grant?.contacts?.some(
      (contact) => contact.authorProfile?.id === user.authorProfile?.id
    );

  const canEdit = (() => {
    switch (work.contentType) {
      case 'paper':
        return isModerator || isHubEditor;
      case 'funding_request':
        return isGrantContact || isAuthor || isModerator;
      case 'post':
      case 'preregistration':
        return isAuthor;
      default:
        return selectedOrg && work.note;
    }
  })();

  const handleAddVersion = useCallback(() => {
    if (!user) return; // should be authenticated already

    // Determine the latest version's paperId to pre-populate the form with the most recent data
    let latestPaperId = work.id;

    if (work.versions && work.versions.length > 0) {
      // Try to use the version flagged as latest first
      const latestFlag = work.versions.find((v) => v.isLatest);

      if (latestFlag) {
        latestPaperId = latestFlag.paperId;
      } else {
        // Fallback: pick the version with newest publishedDate
        const sorted = [...work.versions].sort(
          (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
        );
        latestPaperId = sorted[0].paperId;
      }
    }

    router.push(`/paper/${latestPaperId}/create/version`);
  }, [work.id, work.versions, user, router]);

  const [{ isLoading: isClosingFundraise }, closeFundraise] = useCloseFundraise();
  const [{ isLoading: isCompletingFundraise }, completeFundraise] = useCompleteFundraise();

  const handleCloseFundraise = useCallback(() => {
    setFundraiseAction('close');
    setShowFundraiseActionModal(true);
  }, []);

  const handleCompleteFundraise = useCallback(() => {
    setFundraiseAction('complete');
    setShowFundraiseActionModal(true);
  }, []);

  const confirmFundraiseAction = useCallback(async () => {
    if (!metadata.fundraising?.id) {
      toast.error('No fundraise found');
      return;
    }

    try {
      if (fundraiseAction === 'close') {
        await closeFundraise(metadata.fundraising.id);
        toast.success('Fundraise closed successfully');
      } else if (fundraiseAction === 'complete') {
        await completeFundraise(metadata.fundraising.id);
        toast.success('Fundraise completed successfully');
      }

      // Refresh the page data to reflect new status
      if (typeof router.refresh === 'function') {
        router.refresh();
      } else if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error: any) {
      const action = fundraiseAction === 'close' ? 'close' : 'complete';
      toast.error(
        error instanceof Error ? error.message : `Failed to ${action} fundraise. Please try again.`
      );
    }
  }, [metadata.fundraising?.id, fundraiseAction, closeFundraise, completeFundraise, router]);

  const getModalConfig = () => {
    switch (fundraiseAction) {
      case 'close':
        return {
          title: 'Close fundraise & refund contributors',
          message:
            'Are you sure you want to close this fundraise? This will immediately refund all contributions to contributors and close the fundraise permanently. No funds will be distributed to Endaoment or the researcher. This action cannot be undone.',
          confirmText: 'Close fundraise & refund contributors',
          confirmButtonClass: 'bg-red-600 hover:bg-red-700',
          isLoading: isClosingFundraise,
        };
      case 'complete':
        return {
          title: 'Complete fundraise',
          message:
            'Are you sure you want to complete this fundraise? This will mark the fundraise as completed and distribute the funds to the researcher. This action cannot be undone.',
          confirmText: 'Complete fundraise',
          confirmButtonClass: 'bg-green-600 hover:bg-green-700',
          isLoading: isCompletingFundraise,
        };
      default:
        return {
          title: '',
          message: '',
          confirmText: '',
          confirmButtonClass: '',
          isLoading: false,
        };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <div>
      {/* Primary Actions */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => executeAuthenticatedAction(handleVote)}
            disabled={isVoting || isLoadingVotes}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isUpvoted
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            } ${isVoting || isLoadingVotes ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowUp className={`h-4 w-4`} />
            <span>{voteCount}</span>
          </button>

          {work.unifiedDocumentId && work.postType !== 'QUESTION' && (
            <Button
              variant="ghost"
              onClick={handleAddToList}
              disabled={isTogglingDefaultList}
              className={cn(
                'flex items-center justify-center !px-4 !min-w-0 rounded-lg',
                isInList
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
                isTogglingDefaultList && 'opacity-50 cursor-not-allowed'
              )}
            >
              <FontAwesomeIcon
                icon={isInList ? faBookmarkSolid : faBookmark}
                className="h-3.
              5 w-3.5"
              />
            </Button>
          )}

          <button
            onClick={() =>
              showShareModal({
                url: window.location.href,
                docTitle: work.title,
                action: 'USER_SHARED_DOCUMENT',
                shouldShowConfetti: false,
              })
            }
            className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Share2 className="h-6 w-6" />
          </button>

          {/* Render insights button if provided */}
          {insightsButton}

          {/* More Actions Dropdown */}
          <BaseMenu
            align="start"
            trigger={
              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            }
          >
            {canEdit && (
              <BaseMenuItem onSelect={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                <span>Edit</span>
              </BaseMenuItem>
            )}
            {isAuthor && (
              <BaseMenuItem onSelect={() => executeAuthenticatedAction(handleAddVersion)}>
                <FileUp className="h-4 w-4 mr-2" />
                <span>Upload New Version</span>
              </BaseMenuItem>
            )}
            {!isPublished && isModerator && work.contentType !== 'preregistration' && (
              <BaseMenuItem
                disabled={isPublishing}
                onSelect={() => executeAuthenticatedAction(handlePublish)}
              >
                <Icon name="rhJournal1" size={16} className="mr-2" />
                <span>Publish to Journal</span>
              </BaseMenuItem>
            )}
            {isModerator && work.contentType === 'preregistration' && metadata.fundraising?.id && (
              <>
                <BaseMenuItem
                  disabled={isClosingFundraise}
                  onSelect={() => executeAuthenticatedAction(handleCloseFundraise)}
                >
                  <Octagon className="h-4 w-4 mr-2" />
                  <span>Close fundraise & refund contributors</span>
                </BaseMenuItem>
                <BaseMenuItem
                  disabled={isCompletingFundraise}
                  onSelect={() => executeAuthenticatedAction(handleCompleteFundraise)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Complete fundraise</span>
                </BaseMenuItem>
              </>
            )}
            {pdfFormat && (
              <BaseMenuItem onSelect={() => handleDownload(pdfFormat.url, 'document.pdf')}>
                <Download className="h-4 w-4 mr-2" />
                <span>Download PDF</span>
              </BaseMenuItem>
            )}
            <BaseMenuItem
              onSelect={() => executeAuthenticatedAction(() => setIsFlagModalOpen(true))}
            >
              <Flag className="h-4 w-4 mr-2" />
              <span>Flag Content</span>
            </BaseMenuItem>
          </BaseMenu>
        </div>
      </div>

      {/* Authors/Contacts */}
      <div className="mt-6 space-y-2 text-sm text-gray-600">
        <div>
          {work.contentType === 'funding_request' ? (
            // Only render if there is an organization OR at least one contact
            work.note?.post?.grant?.organization ||
            (work.note?.post?.grant?.contacts && work.note.post.grant.contacts.length > 0) ? (
              <div className="flex items-start">
                <span className="!hidden tablet:!block font-medium text-gray-900 w-28">
                  Funder{work.note?.post?.grant?.organization ? '' : '(s)'}
                </span>
                <div className="flex-1">
                  {work.note?.post?.grant?.organization ? (
                    <span>{work.note.post.grant.organization}</span>
                  ) : (
                    <AuthorList
                      authors={
                        work.note?.post?.grant?.contacts?.map((contact: Contact) => ({
                          name: contact.authorProfile?.fullName || contact.name,
                          verified: contact.authorProfile?.user?.isVerified,
                          profileUrl: contact.authorProfile
                            ? `/author/${contact.authorProfile?.id}`
                            : undefined,
                          authorUrl: contact.authorProfile?.user
                            ? `/author/${contact.authorProfile?.id}`
                            : undefined,
                        })) || []
                      }
                      size="sm"
                      className="inline-flex items-center text-gray-600 font-medium"
                      delimiterClassName="mx-2 text-gray-400"
                      delimiter="•"
                    />
                  )}
                </div>
              </div>
            ) : null
          ) : (
            // NON-GRANT: Authors section
            <div className="flex items-start">
              <span className="!hidden tablet:!block font-medium text-gray-900 w-28">Authors</span>
              <div className="flex-1">
                <AuthorList
                  authors={work.authors.map((authorship) => ({
                    name: authorship.authorProfile.fullName,
                    verified: authorship.authorProfile.user?.isVerified,
                    profileUrl: `/author/${authorship.authorProfile.id}`,
                    authorUrl: authorship.authorProfile.user
                      ? `/author/${authorship.authorProfile.id}`
                      : undefined,
                  }))}
                  size="sm"
                  className="inline-flex items-center text-gray-600 font-medium"
                  delimiterClassName="mx-2 text-gray-400"
                  delimiter="•"
                />
              </div>
            </div>
          )}
        </div>

        {/* Published Date */}
        {work.publishedDate && (
          <div className="flex items-start">
            <span className="!hidden tablet:!block font-medium text-gray-900 w-28">Published</span>
            <div className="flex-1">
              <span>
                {new Date(work.publishedDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      <FlagContentModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        documentId={work.id.toString()}
        workType={work.contentType}
      />

      {/* Tip Modal */}
      <TipContentModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        contentId={work.id}
        feedContentType={work.contentType === 'paper' ? 'PAPER' : 'POST'}
        onTipSuccess={handleTipSuccess}
      />

      {work.unifiedDocumentId && (
        <AddToListModal
          isOpen={isAddToListModalOpen}
          onClose={() => setIsAddToListModalOpen(false)}
          unifiedDocumentId={work.unifiedDocumentId}
        />
      )}

      {work.contentType === 'paper' && (
        <WorkEditModal
          isOpen={isWorkEditModalOpen}
          onClose={() => setIsWorkEditModalOpen(false)}
          work={work}
          metadata={metadata}
        />
      )}

      <ConfirmModal
        isOpen={showFundraiseActionModal}
        onClose={() => {
          setShowFundraiseActionModal(false);
          setFundraiseAction(null);
        }}
        onConfirm={confirmFundraiseAction}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText="Cancel"
        confirmButtonClass={modalConfig.confirmButtonClass}
        cancelButtonClass="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
      />
    </div>
  );
};
