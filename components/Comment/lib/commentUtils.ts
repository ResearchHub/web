import { Comment } from '@/types/comment';

/**
 * Keeps track of optimistic comment IDs that have been replaced with real IDs
 * This helps us find comments that were just created via the UI
 */
const optimisticToRealIdMap = new Map<number, number>();

/**
 * Keeps track of real comment IDs and their parent IDs
 * This helps us maintain the correct parent-child relationships
 */
const commentParentMap = new Map<number, number>();

/**
 * Updates the mapping of optimistic IDs to real IDs
 * @param optimisticId The optimistic ID
 * @param realId The real ID from the server
 */
export const mapOptimisticToRealId = (optimisticId: number, realId: number): void => {
  optimisticToRealIdMap.set(optimisticId, realId);
  console.log(`Mapped optimistic ID ${optimisticId} to real ID ${realId}`);
  console.log('Current optimistic to real ID map:', optimisticToRealIdMap);
};

/**
 * Records the parent-child relationship between comments
 * @param childId The child comment ID
 * @param parentId The parent comment ID
 */
export const recordParentChildRelationship = (childId: number, parentId: number): void => {
  // Check if we already have this relationship recorded
  const existingParentId = commentParentMap.get(childId);
  if (existingParentId === parentId) {
    console.log(`Parent-child relationship already recorded: child=${childId}, parent=${parentId}`);
    return;
  }

  // Record the new relationship
  commentParentMap.set(childId, parentId);
  console.log(`Recorded parent-child relationship: child=${childId}, parent=${parentId}`);

  // If this is a real ID that replaced an optimistic ID, update the relationship for the optimistic ID too
  for (const [optId, realId] of optimisticToRealIdMap.entries()) {
    if (realId === childId) {
      commentParentMap.set(optId, parentId);
      console.log(
        `Also recorded parent-child relationship for optimistic ID: child=${optId}, parent=${parentId}`
      );
    }
  }
};

/**
 * Gets the real ID for an optimistic ID if it exists
 * @param id The ID to check
 * @returns The real ID if the input was an optimistic ID that has been replaced, otherwise the original ID
 */
export const getRealId = (id: number): number => {
  return optimisticToRealIdMap.get(id) || id;
};

/**
 * Gets the parent ID for a comment ID if it exists in our mapping
 * @param id The comment ID
 * @returns The parent ID if it exists in our mapping, otherwise null
 */
export const getParentId = (id: number): number | null => {
  return commentParentMap.get(id) || null;
};

/**
 * Recursively traverses a comment tree and applies a transformation function
 * @param comments The comment tree to traverse
 * @param transformFn The function to apply to each comment
 * @param parent Optional parent comment for context
 * @returns The transformed comment tree
 */
export const traverseCommentTree = (
  comments: Comment[],
  transformFn: (comment: Comment, parent?: Comment) => Comment | null,
  parent?: Comment
): Comment[] => {
  // Make a deep copy to avoid mutation issues
  const result: Comment[] = [];

  for (const comment of comments) {
    const transformedComment = transformFn(comment, parent);

    if (transformedComment) {
      // Process replies recursively if they exist
      if (comment.replies && comment.replies.length > 0) {
        transformedComment.replies = traverseCommentTree(
          comment.replies,
          transformFn,
          transformedComment
        );
      }

      result.push(transformedComment);
    }
  }

  return result;
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
    const indent = '  '.repeat(depth);

    for (const comment of commentsToSearch) {
      // Match by direct ID (either the original ID or the real ID)
      if (comment.id === commentId || comment.id === realCommentId) {
        console.log(`${indent}Found comment ${comment.id} at depth ${depth}`);
        return comment;
      }

      // Check if this is an optimistic comment that matches
      if (comment.metadata?.originalOptimisticId === commentId) {
        console.log(
          `${indent}Found comment ${comment.id} with originalOptimisticId ${commentId} at depth ${depth}`
        );
        return comment;
      }

      // Check if this comment has the same parent-child relationship
      const parentId = getParentId(comment.id);
      const expectedParentId = getParentId(commentId);
      if (
        parentId &&
        expectedParentId &&
        parentId === expectedParentId &&
        comment.id === realCommentId
      ) {
        console.log(
          `${indent}Found comment ${comment.id} with matching parent-child relationship at depth ${depth}`
        );
        return comment;
      }

      if (comment.replies && comment.replies.length > 0) {
        console.log(
          `${indent}Searching in ${comment.replies.length} replies of comment ${comment.id}`
        );
        const result = search(comment.replies, depth + 1);
        if (result) {
          return result;
        }
      }
    }

    if (depth === 0) {
      console.log(
        `Comment with ID ${commentId} (or real ID ${realCommentId}) not found in the tree`
      );
    }
    return null;
  };

  return search(comments);
};

/**
 * Adds a reply to a comment in the comment tree
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
  } else {
    console.error(`Could not find parent comment with ID ${realParentId}`);

    // As a fallback, add as a top-level comment
    console.log(`Adding reply ${reply.id} as a top-level comment`);
    result.unshift(replyToAdd);
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
export const removeOptimisticReplyDeep = (comments: Comment[], commentId: number): Comment[] => {
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
        }
      }
      return comment;
    });
  } else {
    console.log(`Removed top-level comment ${realCommentId}`);
  }

  return filteredComments;
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

  // Check if there's an optimistic version of this comment
  // Look through the optimisticToRealIdMap for any optimistic ID that maps to this real ID
  let foundOptimisticId = null;
  for (const [optId, realId] of optimisticToRealIdMap.entries()) {
    if (realId === realCommentId) {
      foundOptimisticId = optId;
      break;
    }
  }

  // If we found an optimistic version, update that instead of adding a new one
  if (foundOptimisticId) {
    const foundOptimistic = findCommentById(result, foundOptimisticId);
    if (foundOptimistic) {
      console.log(
        `Found optimistic comment ${foundOptimisticId} to update with real data ${realCommentId}`
      );
      // Replace the optimistic comment with the real one
      return updateReplyDeep(result, {
        ...commentToUpdate,
        metadata: {
          ...commentToUpdate.metadata,
          wasOptimistic: true,
          originalOptimisticId: foundOptimisticId,
        },
      });
    }
  }

  // If we couldn't find the comment with either ID, check if it already exists elsewhere in the tree
  const existingComment = findCommentById(result, realCommentId);
  if (existingComment) {
    console.log(`Comment ${realCommentId} already exists elsewhere in the tree, updating it`);
    return updateReplyDeep(result, commentToUpdate);
  }

  console.log(`Could not find comment ${realCommentId} to update with API response`);

  // If it's a reply, try to add it to the parent
  if (realParentId) {
    // Check if this comment already exists as a reply to the parent
    const parent = findCommentById(result, realParentId);
    if (parent && parent.replies) {
      const alreadyExists = parent.replies.some((reply: Comment) => reply.id === realCommentId);
      if (alreadyExists) {
        console.log(
          `Comment ${realCommentId} already exists as a reply to ${realParentId}, skipping addition`
        );
        return result;
      }
    }

    console.log(`Adding reply ${realCommentId} to parent ${realParentId}`);
    return addReplyDeep(result, realParentId, commentToUpdate);
  } else {
    // If it's a top-level comment, check if it already exists
    const alreadyExists = result.some((comment: Comment) => comment.id === realCommentId);
    if (alreadyExists) {
      console.log(`Top-level comment ${realCommentId} already exists, skipping addition`);
      return result;
    }

    // Add it to the list
    console.log(`Adding top-level comment ${realCommentId} to the list`);
    return [commentToUpdate, ...result];
  }
};

/**
 * Finds a comment by ID in a list of comments, including nested replies
 * @param comments List of comments to search in
 * @param commentId ID of the comment to find
 * @returns The found comment or null if not found
 */
export const findCommentInList = (comments: Comment[], commentId: number): Comment | null => {
  return findCommentById(comments, commentId);
};
