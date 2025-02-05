'use client';

import { useState } from 'react';
import { Comment, CommentFilter, CommentType } from '@/types/comment';
import { useComments } from '@/hooks/useComments';
import { CommentEditor } from './CommentEditor';
import { CommentItem } from './CommentItem';
import { ContentType } from '@/types/work';
import { CommentService } from '@/services/comment.service';

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

  const handleSubmit = async (content: string) => {
    const newComment = await CommentService.createComment({
      workId: documentId,
      contentType,
      content,
      contentFormat: 'HTML',
      commentType,
      threadType: commentType,
    });
    updateCommentTree(newComment);
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <select
            className="rounded-md border border-gray-300 py-1 px-2"
            value={commentFilter}
            onChange={(e) => {
              setCommentFilter(e.target.value as CommentFilter);
              refresh();
            }}
          >
            <option value="DISCUSSION">Discussion</option>
            <option value="QUESTION">Questions</option>
            <option value="PEER_REVIEW">Peer Reviews</option>
            <option value="BOUNTY">Bounties</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {commentCount} comment{commentCount !== 1 ? 's' : ''}
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
            {comments.map((comment) => (
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
