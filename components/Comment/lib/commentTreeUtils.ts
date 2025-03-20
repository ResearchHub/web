import { Comment } from '@/types/comment';
import { getRealId, recordParentChildRelationship } from './commentIdUtils';

/**
 * This file contains utilities for manipulating comment trees, including
 * traversing, finding, adding, updating, and removing comments.
 */

/**
 * Traverses a comment tree and applies a transform function to each comment
 * @param comments The array of comments to traverse
 * @param transformFn The function to apply to each comment
 * @param parent Optional parent comment
 * @returns A new array of comments with the transform function applied
 */
export const traverseCommentTree = (
  comments: Comment[],
  transformFn: (comment: Comment, parent?: Comment) => Comment | null,
  parent?: Comment
): Comment[] => {
  if (!comments || !Array.isArray(comments)) {
    console.warn('traverseCommentTree called with invalid comments:', comments);
    return [];
  }

  console.log(
    `[traverseCommentTree] Processing ${comments.length} comments${parent ? ` under parent ${parent.id}` : ''}`
  );

  return comments
    .map((comment) => {
      // Apply the transform function to the current comment
      const transformedComment = transformFn(comment, parent);

      // If the transform function returns null, filter out this comment
      if (transformedComment === null) {
        console.log(`[traverseCommentTree] Comment ${comment.id} was filtered out`);
        return null;
      }

      // If the comment has replies, recursively traverse them
      if (transformedComment.replies && transformedComment.replies.length > 0) {
        console.log(
          `[traverseCommentTree] Processing ${transformedComment.replies.length} replies of comment ${transformedComment.id}`
        );

        // Create a new comment object with transformed replies
        const commentWithTransformedReplies = {
          ...transformedComment,
          replies: traverseCommentTree(transformedComment.replies, transformFn, transformedComment),
        };

        return commentWithTransformedReplies;
      }

      // If the comment has no replies, return it as is
      return transformedComment;
    })
    .filter(Boolean) as Comment[]; // Filter out null comments
};

/**
 * Finds a comment in the comment tree by ID
 * @param comments The comment tree to search
 * @param commentId The ID of the comment to find
 * @returns The found comment or null if not found
 */
export const findCommentById = (comments: Comment[], commentId: number): Comment | null => {
  // Check if the ID is an optimistic ID that has been replaced
  const realCommentId = getRealId(commentId);

  if (realCommentId !== commentId) {
    console.log(`Looking for comment with real ID ${realCommentId} instead of ${commentId}`);
  }

  // Helper function to search recursively
  const search = (commentsToSearch: Comment[], depth: number = 0): Comment | null => {
    if (!commentsToSearch || !Array.isArray(commentsToSearch)) {
      return null;
    }

    // Check if the comment is in the current level
    for (const comment of commentsToSearch) {
      if (comment.id === realCommentId) {
        return comment;
      }

      // If the comment has replies, search them recursively
      if (comment.replies && comment.replies.length > 0) {
        const found = search(comment.replies, depth + 1);
        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  return search(comments);
};

/**
 * Adds a reply to a parent comment in the comment tree
 * @param comments The comment tree
 * @param parentId The ID of the parent comment
 * @param reply The reply to add
 * @returns The updated comment tree
 */
export const addReplyDeep = (comments: Comment[], parentId: number, reply: Comment): Comment[] => {
  // Make a deep copy to avoid mutation issues
  const result = JSON.parse(JSON.stringify(comments));
  const realParentId = getRealId(parentId);

  console.log(`Adding reply to parent ${parentId} (real ID: ${realParentId})`);

  // Ensure the reply has the correct parentId
  const replyToAdd = {
    ...reply,
    parentId: realParentId,
  };

  // Record the parent-child relationship for future reference
  recordParentChildRelationship(reply.id, realParentId);

  // Check if this reply already exists in the tree
  const existingReply = findCommentById(result, reply.id);
  if (existingReply) {
    console.log(`Reply ${reply.id} already exists in the tree, skipping addition`);
    return result;
  }

  // Find the parent comment
  const found = findCommentById(result, realParentId);

  if (found) {
    console.log(`Found parent comment ${realParentId}, adding reply ${reply.id}`);

    // Initialize replies array if it doesn't exist
    if (!found.replies) {
      found.replies = [];
    }

    // Check if the reply is already in the parent's replies
    const alreadyExists = found.replies.some(
      (existingReply: Comment) => existingReply.id === reply.id
    );
    if (alreadyExists) {
      console.log(
        `Reply ${reply.id} already exists in parent ${realParentId}'s replies, skipping addition`
      );
      return result;
    }

    // Add the reply
    found.replies.push(replyToAdd);

    // Update reply count
    found.replyCount = (found.replyCount || 0) + 1;
    found.childrenCount = (found.childrenCount || 0) + 1;
  } else {
    console.error(`Could not find parent comment with ID ${realParentId}`);
  }

  return result;
};

/**
 * Updates a comment in the comment tree
 * @param comments The comment tree
 * @param updatedComment The updated comment
 * @returns The updated comment tree
 */
export const updateReplyDeep = (comments: Comment[], updatedComment: Comment): Comment[] => {
  // Make a deep copy to avoid mutation issues
  const result = JSON.parse(JSON.stringify(comments));
  const realCommentId = getRealId(updatedComment.id);

  console.log(`Updating comment ${updatedComment.id} (real ID: ${realCommentId})`);

  // Check if this is an optimistic comment being updated with real data
  const isOptimisticUpdate =
    updatedComment.metadata?.wasOptimistic ||
    updatedComment.metadata?.originalOptimisticId !== undefined;

  // If this is an optimistic update, also look for the original optimistic ID
  const originalOptimisticId = updatedComment.metadata?.originalOptimisticId;

  return traverseCommentTree(result, (comment) => {
    // Match by real ID
    if (comment.id === realCommentId) {
      console.log(`Found and updating comment ${realCommentId}`);
      return {
        ...comment,
        ...updatedComment,
        // Preserve replies
        replies: comment.replies || updatedComment.replies || [],
      };
    }

    // If this is an optimistic update, also check for the original optimistic ID
    if (isOptimisticUpdate && originalOptimisticId && comment.id === originalOptimisticId) {
      console.log(
        `Found optimistic comment ${originalOptimisticId} and updating with real data ${realCommentId}`
      );
      return {
        ...comment,
        ...updatedComment,
        id: realCommentId, // Ensure the ID is updated to the real one
        // Preserve replies
        replies: comment.replies || updatedComment.replies || [],
      };
    }

    return comment;
  });
};

/**
 * Removes a comment from the comment tree
 * @param comments The comment tree
 * @param commentId The ID of the comment to remove
 * @returns The updated comment tree
 */
export const removeCommentDeep = (comments: Comment[], commentId: number): Comment[] => {
  // Make a deep copy to avoid mutation issues
  const result = JSON.parse(JSON.stringify(comments));
  const realCommentId = getRealId(commentId);

  console.log(`Removing comment ${commentId} (real ID: ${realCommentId})`);

  // Filter out the comment at the top level
  let filteredComments = result.filter((comment: Comment) => comment.id !== realCommentId);

  // If the length is the same, the comment wasn't at the top level
  if (filteredComments.length === result.length) {
    console.log(`Comment ${realCommentId} not found at top level, searching in replies`);

    // Process each comment to filter out the target from replies
    filteredComments = traverseCommentTree(filteredComments, (comment) => {
      if (comment.replies && comment.replies.length > 0) {
        const originalLength = comment.replies.length;
        comment.replies = comment.replies.filter((reply) => reply.id !== realCommentId);

        if (comment.replies.length < originalLength) {
          console.log(`Removed comment ${realCommentId} from replies of comment ${comment.id}`);
          // Update reply count
          comment.replyCount = (comment.replyCount || 0) - 1;
          comment.childrenCount = (comment.childrenCount || 0) - 1;
        }
      }
      return comment;
    });
  } else {
    console.log(`Removed top-level comment ${realCommentId}`);
  }

  return filteredComments;
};
