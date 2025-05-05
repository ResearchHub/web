import { Comment } from '@/types/comment';
import { getRealId, recordParentChildRelationship } from './commentIdUtils';
import { traverseCommentTree, findCommentById, updateReplyDeep } from './commentTreeUtils';
import { CommentContent } from './types';

/**
 * This file contains utilities for handling optimistic updates to comments,
 * including creating optimistic comments, reverting optimistic updates, and
 * updating comments with API responses.
 */

/**
 * Creates an optimistic comment for immediate UI feedback
 * @param content The content of the comment
 * @param authorId The ID of the author
 * @param authorName The name of the author
 * @param authorProfileImage The profile image of the author
 * @param documentId The ID of the document the comment is on
 * @param parentId Optional parent comment ID if this is a reply
 * @returns An optimistic comment object
 */
export const createOptimisticComment = (
  content: CommentContent,
  authorId: number,
  authorName: string,
  authorProfileImage: string,
  documentId: number,
  parentId?: number
): Comment => {
  const optimisticId = -Date.now();
  return {
    id: optimisticId,
    content,
    contentFormat: 'TIPTAP',
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    createdBy: {
      id: authorId,
      firstName: authorName.split(' ')[0],
      lastName: authorName.split(' ').slice(1).join(' '),
      fullName: authorName,
      email: '',
      isVerified: false,
      balance: 0,
      authorProfile: {
        id: authorId,
        firstName: authorName.split(' ')[0],
        lastName: authorName.split(' ').slice(1).join(' '),
        fullName: authorName,
        profileImage: authorProfileImage || '',
        headline: '',
        profileUrl: `/profile/${authorId}`,
        isClaimed: true,
      },
    },
    score: 0,
    reviewScore: 0,
    replies: [],
    replyCount: 0,
    childrenCount: 0,
    commentType: 'GENERIC_COMMENT',
    isPublic: true,
    isRemoved: false,
    bounties: [],
    parentId,
    thread: {
      id: -1,
      threadType: 'THREAD',
      privacyType: 'PUBLIC',
      objectId: documentId,
      raw: null,
    },
    raw: null,
    metadata: {
      isOptimistic: true,
    },
  };
};

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
  const realCommentId = getRealId(commentId);

  console.log(`Updating vote for comment ${commentId} (real ID: ${realCommentId})`);

  return traverseCommentTree(result, (comment) => {
    if (comment.id === realCommentId) {
      console.log(`Found and updating vote for comment ${realCommentId}`);
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
  const realCommentId = getRealId(commentId);

  console.log(`Reverting optimistic update for comment ${commentId} (real ID: ${realCommentId})`);

  return traverseCommentTree(result, (comment) => {
    if (comment.id === realCommentId && comment.metadata?.isOptimisticUpdate) {
      console.log(`Found and reverting optimistic update for comment ${realCommentId}`);
      return {
        ...comment,
        content: comment.metadata.originalContent,
        metadata: { ...comment.metadata, isOptimisticUpdate: false },
      };
    }
    return comment;
  });
};

/**
 * Updates a comment in a list with the actual API response
 * @param comments List of comments to update
 * @param updatedComment Updated comment from the API
 * @returns Updated list of comments
 */
export const updateCommentWithApiResponse = (
  comments: Comment[],
  updatedComment: Comment
): Comment[] => {
  // Make a deep copy to avoid mutation issues
  const result = JSON.parse(JSON.stringify(comments));

  // Get the real ID if this was an optimistic ID that has been replaced
  const realCommentId = getRealId(updatedComment.id);
  const realParentId = updatedComment.parentId ? getRealId(updatedComment.parentId) : undefined;

  console.log(
    `Updating comment ${updatedComment.id} (real ID: ${realCommentId}) with API response`
  );
  if (realParentId) {
    console.log(`Parent ID: ${updatedComment.parentId} (real ID: ${realParentId})`);
  }

  // Ensure the updated comment has the correct parentId if it's a reply
  const commentToUpdate = {
    ...updatedComment,
    parentId: realParentId || updatedComment.parentId,
  };

  // Record the parent-child relationship for future reference if it's a reply
  if (realParentId) {
    recordParentChildRelationship(realCommentId, realParentId);
  }

  // First check if the comment already exists with the real ID
  const foundWithRealId = findCommentById(result, realCommentId);

  // If found with real ID, just update it
  if (foundWithRealId) {
    console.log(`Found comment ${realCommentId} to update with API response`);
    return updateReplyDeep(result, commentToUpdate);
  }

  // If this is a reply and we couldn't find it with the real ID,
  // add it to the parent's replies
  if (realParentId) {
    console.log(`Comment ${realCommentId} not found, adding as reply to parent ${realParentId}`);
    return updateReplyDeep(result, commentToUpdate);
  }

  // If it's not a reply and we couldn't find it, add it to the top level
  console.log(`Comment ${realCommentId} not found, adding to top level`);
  return [commentToUpdate, ...result];
};
