'use client';

import { useState } from 'react';
import { Comment, CommentFilter, CommentType } from '@/types/comment';
import { useComments } from '@/hooks/useComments';
import { CommentEditor, CommentEditorProps } from './CommentEditor';
import { CommentItem } from './CommentItem';
import { ContentType } from '@/types/work';
import { CommentService } from '@/services/comment.service';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Star, Zap, ArrowUp, ChevronDown, Plus, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { CreateBountyModal } from '@/components/modals/CreateBountyModal';
import { CommentSkeleton } from '@/components/skeletons/CommentSkeleton';

type SortOption = {
  label: string;
  value: 'BEST' | 'CREATED_DATE' | 'TOP';
  icon: typeof Star | typeof Zap | typeof ArrowUp;
};

type BountyFilterOption = {
  label: string;
  value: 'ALL' | 'OPEN' | 'CLOSED';
};

const commentTypeToFilter: Record<CommentType, CommentFilter | undefined> = {
  GENERIC_COMMENT: undefined,
  REVIEW: 'REVIEW',
  BOUNTY: 'BOUNTY',
};

interface CommentFeedProps {
  documentId: number;
  contentType: ContentType;
  className?: string;
  commentType?: CommentType;
  editorProps?: Partial<CommentEditorProps>;
  renderBountyAwardActions?: (comment: Comment) => React.ReactNode;
  renderCommentActions?: boolean;
  hideEditor?: boolean;
}

export const CommentFeed = ({
  documentId,
  contentType,
  className,
  commentType = 'GENERIC_COMMENT',
  editorProps = {},
  renderBountyAwardActions,
  renderCommentActions = true,
  hideEditor = false,
}: CommentFeedProps) => {
  const [sortBy, setSortBy] = useState<SortOption['value']>('BEST');
  const [bountyFilter, setBountyFilter] = useState<BountyFilterOption['value']>('ALL');
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCreateBountyModalOpen, setIsCreateBountyModalOpen] = useState(false);

  const {
    comments,
    setComments,
    count,
    isLoading: isLoadingComments,
    error: commentsError,
    hasMore,
    loadMore,
    refresh,
  } = useComments({
    documentId,
    contentType,
    filter: commentTypeToFilter[commentType],
    sort: sortBy,
  });

  // Filter comments based on bounty status if this is a bounty feed
  const filteredComments =
    commentType === 'BOUNTY' && bountyFilter !== 'ALL'
      ? comments.filter((comment) => {
          const hasOpenBounty = comment.bounties?.some(
            (b) => b.status === 'OPEN' && !b.isContribution
          );
          const hasClosedBounty = comment.bounties?.some(
            (b) => b.status === 'CLOSED' && !b.isContribution
          );

          if (bountyFilter === 'OPEN') return hasOpenBounty;
          if (bountyFilter === 'CLOSED') return hasClosedBounty;
          return true;
        })
      : comments;

  const handleSubmit = async ({
    content,
    rating: overallRating,
  }: {
    content: any;
    rating?: number;
  }) => {
    // Check if content exists and has text
    if (!content || !content.content || content.content.length === 0) {
      toast.error('Please enter some content before submitting');
      return;
    }

    setIsLoading(true);
    try {
      // Create the comment first
      const comment = await CommentService.createComment({
        workId: documentId,
        contentType,
        content,
        commentType,
        threadType: commentType,
      });

      // If this is a review, create the community review
      if (commentType === 'REVIEW') {
        if (!overallRating) {
          toast.error('Please provide an overall rating before submitting the review');
          return;
        }

        // Create the community review
        await CommentService.createCommunityReview({
          unifiedDocumentId: documentId,
          commentId: comment.id,
          score: overallRating,
        });
      }

      // Add the new comment to the list
      setComments([comment, ...comments]);
      toast.success('Comment submitted successfully');

      // Only reset the editor after successful submission
      if (editorProps.onReset) {
        editorProps.onReset();
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to submit comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (newSort: SortOption['value']) => {
    setSortBy(newSort);
    setIsOpen(false);
    refresh();
  };

  const handleBountyFilterChange = (newFilter: BountyFilterOption['value']) => {
    setBountyFilter(newFilter);
    setIsFilterOpen(false);
  };

  const sortOptions: SortOption[] = [
    { label: 'Best', value: 'BEST', icon: Star },
    { label: 'Newest', value: 'CREATED_DATE', icon: Zap },
    { label: 'Top', value: 'TOP', icon: ArrowUp },
  ];

  const bountyFilterOptions: BountyFilterOption[] = [
    { label: 'All Bounties', value: 'ALL' },
    { label: 'Open Bounties', value: 'OPEN' },
    { label: 'Closed Bounties', value: 'CLOSED' },
  ];

  const selectedOption = sortOptions.find((opt) => opt.value === sortBy);
  const selectedFilterOption = bountyFilterOptions.find((opt) => opt.value === bountyFilter);
  const SelectedIcon = selectedOption?.icon;

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <BaseMenu
            align="start"
            trigger={
              <button className="flex items-center gap-2 px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50">
                {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
                <span>{selectedOption?.label}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            }
          >
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <BaseMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={sortBy === option.value ? 'bg-gray-100' : ''}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </div>
                </BaseMenuItem>
              );
            })}
          </BaseMenu>

          {/* Bounty Filter - Only show for bounty comments */}
          {commentType === 'BOUNTY' && (
            <BaseMenu
              align="start"
              trigger={
                <button className="flex items-center gap-2 px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                  <span>{selectedFilterOption?.label}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              }
            >
              {bountyFilterOptions.map((option) => (
                <BaseMenuItem
                  key={option.value}
                  onClick={() => handleBountyFilterChange(option.value)}
                  className={bountyFilter === option.value ? 'bg-gray-100' : ''}
                >
                  <div className="flex items-center gap-2">
                    <span>{option.label}</span>
                  </div>
                </BaseMenuItem>
              ))}
            </BaseMenu>
          )}
        </div>

        {commentType === 'BOUNTY' && (
          <Button onClick={() => setIsCreateBountyModalOpen(true)} size="md" variant="default">
            <Plus className="h-4 w-4 mr-1" /> Create Bounty
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {!isLoading && commentType === 'REVIEW' && !hideEditor && (
          <CommentEditor
            onSubmit={handleSubmit}
            {...editorProps}
            commentType={commentType}
            placeholder="Write your review..."
            initialRating={0}
          />
        )}

        {(error || commentsError) && (
          <div className="text-red-600 p-4 rounded-md bg-red-50">
            Failed to load comments. Please try again.
          </div>
        )}

        {isLoadingComments ? (
          <div className="space-y-4">
            {/* Render multiple skeleton items based on comment type */}
            {Array.from({ length: 3 }).map((_, index) => (
              <CommentSkeleton key={index} commentType={commentType} />
            ))}
          </div>
        ) : (
          <>
            {filteredComments.length > 0 ? (
              <>
                {filteredComments.map((comment) => (
                  <div key={comment.id}>
                    <CommentItem
                      comment={comment}
                      contentType={contentType}
                      commentType={commentType}
                      onCommentUpdate={(newComment, parentId) => {
                        const updatedComments = comments.map((c) =>
                          c.id === newComment.id ? newComment : c
                        );
                        setComments(updatedComments);
                      }}
                      onCommentDelete={(commentId) => {
                        const updatedComments = comments.filter((c) => c.id !== commentId);
                        setComments(updatedComments);
                      }}
                      renderCommentActions={renderCommentActions}
                    />
                    {renderBountyAwardActions && renderBountyAwardActions(comment)}
                  </div>
                ))}

                {hasMore && (
                  <button
                    onClick={loadMore}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Load more comments
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Show "No reviews yet" message only for the REVIEW comment type */}
                {commentType === 'REVIEW' && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="text-center text-gray-500">
                      No reviews yet. Be the first to review this work.
                    </div>
                  </div>
                )}

                {/* Show appropriate message for bounty filters */}
                {commentType === 'BOUNTY' && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="text-center text-gray-500">
                      {bountyFilter === 'OPEN' && 'No open bounties available.'}
                      {bountyFilter === 'CLOSED' && 'No closed bounties found.'}
                      {bountyFilter === 'ALL' && 'No bounties available for this work.'}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {commentType === 'BOUNTY' && (
        <CreateBountyModal
          isOpen={isCreateBountyModalOpen}
          onClose={() => setIsCreateBountyModalOpen(false)}
          workId={documentId.toString()}
        />
      )}
    </div>
  );
};
