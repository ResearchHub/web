'use client';

import { useState, useCallback } from 'react';
import { ArrowUp, ArrowDown, Share2, MoreHorizontal, Flag } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { Work } from '@/types/work';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useVote } from '@/hooks/useVote';
import { useUserVotes } from '@/hooks/useUserVotes';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useIsInList } from '@/components/UserList/lib/hooks/useIsInList';
import { useAddToList } from '@/components/UserList/lib/UserListsContext';
import { AddToListModal } from '@/components/UserList/AddToListModal';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import toast from 'react-hot-toast';

interface GrantActionBarProps {
  work: Work;
  className?: string;
}

export function GrantActionBar({ work, className }: GrantActionBarProps) {
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { showShareModal } = useShareModalContext();

  const { vote, isVoting } = useVote({
    votableEntityId: work.id,
    feedContentType: 'POST',
    relatedDocumentTopics: work.topics,
    relatedDocumentId: work.id.toString(),
    relatedDocumentContentType: work.contentType,
  });

  const [voteCount, setVoteCount] = useState(
    work.metrics?.adjustedScore ?? work.metrics?.votes ?? 0
  );

  const {
    data: userVotes,
    isLoading: isLoadingVotes,
    refresh: refreshVotes,
  } = useUserVotes({
    paperIds: [],
    postIds: [work.id],
  });

  const isUpvoted = userVotes?.posts[work.id]?.voteType === 'upvote';
  const isDownvoted = userVotes?.posts[work.id]?.voteType === 'downvote';

  const { isInList } = useIsInList(work.unifiedDocumentId);
  const { isTogglingDefaultList, handleAddToList } = useAddToList({
    unifiedDocumentId: work.unifiedDocumentId,
    isInList,
    onOpenModal: () => setIsAddToListModalOpen(true),
  });

  const handleVote = useCallback(
    async (direction: 'up' | 'down') => {
      const wasUpvoted = isUpvoted;
      const wasDownvoted = isDownvoted;

      try {
        let newVoteType: 'UPVOTE' | 'DOWNVOTE' | 'NEUTRAL';
        let countDelta: number;

        if (direction === 'up') {
          if (wasUpvoted) {
            newVoteType = 'NEUTRAL';
            countDelta = -1;
          } else if (wasDownvoted) {
            newVoteType = 'UPVOTE';
            countDelta = 2;
          } else {
            newVoteType = 'UPVOTE';
            countDelta = 1;
          }
        } else {
          if (wasDownvoted) {
            newVoteType = 'NEUTRAL';
            countDelta = 1;
          } else if (wasUpvoted) {
            newVoteType = 'DOWNVOTE';
            countDelta = -2;
          } else {
            newVoteType = 'DOWNVOTE';
            countDelta = -1;
          }
        }

        await vote(newVoteType);
        setVoteCount((prev) => prev + countDelta);
        await refreshVotes();
      } catch (error: any) {
        if (
          error?.status === 403 ||
          error?.response?.status === 403 ||
          error?.detail === 'Can not vote on own content'
        ) {
          toast.error('Cannot vote on your own content');
        } else {
          toast.error('Unable to process your vote. Please try again.');
        }
      }
    },
    [isUpvoted, isDownvoted, vote, refreshVotes]
  );

  return (
    <>
      <div className={cn('flex items-center gap-3', className)}>
        {/* Vote controls */}
        <div
          className={cn(
            'flex items-center rounded-lg bg-gray-50',
            (isVoting || isLoadingVotes) && 'opacity-50'
          )}
        >
          <button
            onClick={() => executeAuthenticatedAction(() => handleVote('up'))}
            disabled={isVoting || isLoadingVotes}
            className={cn(
              'px-3 py-2 rounded-l-lg transition-colors',
              isUpvoted ? 'text-green-600 hover:bg-green-100' : 'text-gray-600 hover:bg-gray-100',
              (isVoting || isLoadingVotes) ? 'cursor-not-allowed' : 'cursor-pointer'
            )}
            aria-label="Upvote"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">
            {voteCount}
          </span>
          <button
            onClick={() => executeAuthenticatedAction(() => handleVote('down'))}
            disabled={isVoting || isLoadingVotes}
            className={cn(
              'px-3 py-2 rounded-r-lg transition-colors',
              isDownvoted ? 'text-red-600 hover:bg-red-100' : 'text-gray-600 hover:bg-gray-100',
              (isVoting || isLoadingVotes) ? 'cursor-not-allowed' : 'cursor-pointer'
            )}
            aria-label="Downvote"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        </div>

        {/* Save to list */}
        {work.unifiedDocumentId && (
          <Button
            variant="ghost"
            onClick={handleAddToList}
            disabled={isTogglingDefaultList}
            className={cn(
              'flex items-center justify-center !px-3 !min-w-0 rounded-lg',
              isInList
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
              isTogglingDefaultList && 'opacity-50 cursor-not-allowed'
            )}
          >
            <FontAwesomeIcon icon={isInList ? faBookmarkSolid : faBookmark} className="h-5 w-5" />
          </Button>
        )}

        {/* Share */}
        <button
          onClick={() =>
            showShareModal({
              url: window.location.href,
              docTitle: work.title,
              action: 'USER_SHARED_DOCUMENT',
              shouldShowConfetti: false,
            })
          }
          className="flex items-center px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Share"
        >
          <Share2 className="h-5 w-5" />
        </button>

        {/* More options */}
        <BaseMenu
          align="start"
          trigger={
            <button
              className="flex items-center px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          }
        >
          <BaseMenuItem
            onSelect={() => executeAuthenticatedAction(() => setIsFlagModalOpen(true))}
          >
            <Flag className="h-4 w-4 mr-2" />
            <span>Flag Content</span>
          </BaseMenuItem>
        </BaseMenu>
      </div>

      {/* Modals */}
      {work.unifiedDocumentId && (
        <AddToListModal
          isOpen={isAddToListModalOpen}
          onClose={() => setIsAddToListModalOpen(false)}
          unifiedDocumentId={work.unifiedDocumentId}
        />
      )}

      <FlagContentModal
        isOpen={isFlagModalOpen}
        onClose={() => setIsFlagModalOpen(false)}
        documentId={work.id.toString()}
        workType={work.contentType}
      />
    </>
  );
}
