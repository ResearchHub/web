import { Comment } from '@/types/comment';
import { traverseCommentTree } from './commentTreeUtils';

/**
 * Utilities for optimistic updates to comments: applying a vote locally and
 * reverting an optimistic edit.
 */

/**
 * Updates a comment's vote in the comment tree
 * @param comments The comment tree
 * @param commentId The ID of the comment to update
 * @param updatedComment The partial comment with updated vote data
 * @returns The updated comment tree
 */
export const updateCommentVoteInList = (
  comments: Comment[],
  commentId: number,
  updatedComment: Partial<Comment>
): Comment[] => {
  // Make a deep copy to avoid mutation issues
  const result = JSON.parse(JSON.stringify(comments));
  console.log(`Updating vote for comment ${commentId}`);

  return traverseCommentTree(result, (comment) => {
    if (comment.id === commentId) {
      console.log(`Found and updating vote for comment ${commentId}`);
      return { ...comment, ...updatedComment };
    }
    return comment;
  });
};

/**
 * Reverts an optimistic update for a comment
 * @param comments The comment tree
 * @param commentId The ID of the comment to revert
 * @returns The updated comment tree
 */
export const revertOptimisticUpdate = (comments: Comment[], commentId: number): Comment[] => {
  // Make a deep copy to avoid mutation issues
  const result = JSON.parse(JSON.stringify(comments));
  console.log(`Reverting optimistic update for comment ${commentId}`);

  return traverseCommentTree(result, (comment) => {
    if (comment.id === commentId && comment.metadata?.isOptimisticUpdate) {
      console.log(`Found and reverting optimistic update for comment ${commentId}`);
      return {
        ...comment,
        content: comment.metadata.originalContent,
        metadata: { ...comment.metadata, isOptimisticUpdate: false },
      };
    }
    return comment;
  });
};
