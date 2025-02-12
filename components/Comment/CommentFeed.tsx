'use client';

import { useState } from 'react';
import { Comment, CommentFilter, CommentType } from '@/types/comment';
import { useComments } from '@/hooks/useComments';
import { CommentEditor } from './CommentEditor';
import { CommentItem } from './CommentItem';
import { ContentType } from '@/types/work';
import { CommentService } from '@/services/comment.service';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Star, Zap, ArrowUp, ChevronDown } from 'lucide-react';

type SortOption = {
  label: string;
  value: 'BEST' | 'CREATED_DATE' | 'TOP';
  icon: typeof Star | typeof Zap | typeof ArrowUp;
};

interface CommentFeedProps {
  documentId: number;
  contentType: ContentType;
  className?: string;
  commentType?: CommentType;
}

export const CommentFeed = ({
  documentId,
  contentType,
  className,
  commentType = 'GENERIC_COMMENT',
}: CommentFeedProps) => {
  const [commentFilter, setCommentFilter] = useState<CommentFilter>('DISCUSSION');
  const [sortBy, setSortBy] = useState<SortOption['value']>('BEST');
  const [isOpen, setIsOpen] = useState(false);

  const {
    comments,
    count: commentCount,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    setComments,
    setCount,
  } = useComments({
    documentId,
    contentType,
    filter: commentFilter,
    sort: sortBy,
  });

  const updateCommentTree = (newComment: Comment, parentId?: number) => {
    console.log('updateCommentTree called with:', {
      newComment,
      parentId,
      currentComments: comments,
    });

    // Helper function to update a comment in a list
    const updateCommentInList = (commentList: Comment[]): Comment[] => {
      console.log('Processing comment list:', {
        commentIds: commentList.map((c) => c.id),
        lookingForCommentId: newComment.id,
        lookingForParentId: parentId,
      });

      return commentList.map((comment) => {
        // If this is the comment being updated
        if (comment.id === newComment.id) {
          console.log('Found and updating comment:', comment.id);
          return {
            ...newComment,
            replies: comment.replies, // Preserve existing replies
          };
        }

        // If this is the parent comment and we're adding a new reply
        if (comment.id === parentId) {
          console.log('Adding new reply to parent:', parentId);
          return {
            ...comment,
            replies: [newComment, ...(comment.replies || [])],
            replyCount: (comment.replyCount || 0) + 1,
          };
        }

        // If this comment has replies, recursively search them
        if (comment.replies?.length > 0) {
          console.log('Checking replies for comment:', comment.id);
          const updatedReplies = updateCommentInList(comment.replies);
          if (updatedReplies !== comment.replies) {
            console.log('Found and updated nested reply in comment:', comment.id);
            return {
              ...comment,
              replies: updatedReplies,
            };
          }
        }

        return comment;
      });
    };

    // If this is a new top-level comment (no parent ID)
    if (!parentId) {
      console.log('Adding/updating top-level comment');
      // If it's an existing comment being updated
      if (comments.some((c) => c.id === newComment.id)) {
        setComments(updateCommentInList(comments));
      } else {
        // It's a new top-level comment
        setComments([newComment, ...comments]);
        setCount(commentCount + 1);
      }
      return;
    }

    // Handle replies (new or updates)
    console.log('Starting recursive update for reply');
    const updatedComments = updateCommentInList(comments);
    console.log('Finished recursive update:', updatedComments);
    setComments(updatedComments);
  };

  const handleCommentDelete = (commentId: number) => {
    const deleteComment = (commentList: Comment[]): Comment[] => {
      return commentList.filter((comment) => {
        if (comment.id === commentId) {
          return false;
        }
        if (comment.replies?.length > 0) {
          comment.replies = deleteComment(comment.replies);
        }
        return true;
      });
    };

    setComments(deleteComment(comments));
    setCount(commentCount - 1);
  };

  const handleSubmit = async (content: any) => {
    const newComment = await CommentService.createComment({
      workId: documentId,
      contentType,
      content,
      commentType,
      threadType: commentType,
    });

    updateCommentTree(newComment);
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
      </div>

      <div className="space-y-4">
        <CommentEditor onSubmit={handleSubmit} />

        {error && (
          <div className="text-red-600 p-4 rounded-md bg-red-50">
            Failed to load comments. Please try again.
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-pulse">Loading comments...</div>
          </div>
        ) : (
          <>
            {comments
              .filter((comment) => comment.content && comment.content !== '')
              .map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  contentType={contentType}
                  commentType={commentType}
                  onCommentUpdate={updateCommentTree}
                  onCommentDelete={handleCommentDelete}
                />
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
    </div>
  );
};
