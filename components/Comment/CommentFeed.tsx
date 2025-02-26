'use client';

import { useState } from 'react';
import { Comment, CommentFilter, CommentType } from '@/types/comment';
import { useComments } from '@/hooks/useComments';
import { CommentEditor, CommentEditorProps } from './CommentEditor';
import { CommentItem } from './CommentItem';
import { ContentType } from '@/types/work';
import { CommentService } from '@/services/comment.service';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Star, Zap, ArrowUp, ChevronDown, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { CreateBountyModal } from '@/components/modals/CreateBountyModal';

type SortOption = {
  label: string;
  value: 'BEST' | 'CREATED_DATE' | 'TOP';
  icon: typeof Star | typeof Zap | typeof ArrowUp;
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
  const [isOpen, setIsOpen] = useState(false);
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

  const sortOptions: SortOption[] = [
    { label: 'Best', value: 'BEST', icon: Star },
    { label: 'Newest', value: 'CREATED_DATE', icon: Zap },
    { label: 'Top', value: 'TOP', icon: ArrowUp },
  ];

  const selectedOption = sortOptions.find((opt) => opt.value === sortBy);
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
          <div className="text-center py-4">
            <div className="animate-pulse">Loading comments...</div>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
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
