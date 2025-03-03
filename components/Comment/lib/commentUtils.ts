import { Comment } from '@/types/comment';

/**
 * Finds a comment in a list of comments by its ID
 * @param comments List of comments to search in
 * @param commentId ID of the comment to find
 * @param parentId Optional parent ID if the comment is a reply
 * @returns Object containing the found comment, parent comment (if applicable), and original content
 */
export const findCommentById = (
  comments: Comment[],
  commentId: number,
  parentId?: number
): {
  comment: Comment | null;
  parentComment: Comment | null;
  originalContent: any | null;
} => {
  let foundComment: Comment | null = null;
  let parentComment: Comment | null = null;
  let originalContent: any = null;

  if (parentId) {
    // It's a reply
    parentComment = comments.find((c) => c.id === parentId) || null;
    if (parentComment) {
      const reply = parentComment.replies.find((r) => r.id === commentId);
      if (reply) {
        foundComment = reply;
        originalContent = reply.content;
      }
    }
  } else {
    // It's a top-level comment
    foundComment = comments.find((c) => c.id === commentId) || null;
    if (foundComment) {
      originalContent = foundComment.content;
    }
  }

  return { comment: foundComment, parentComment, originalContent };
};

/**
 * Updates a comment in a list of comments with new content
 * @param comments List of comments to update
 * @param commentId ID of the comment to update
 * @param content New content for the comment
 * @param parentId Optional parent ID if the comment is a reply
 * @returns Updated list of comments
 */
export const updateCommentInList = (
  comments: Comment[],
  commentId: number,
  content: any,
  parentId?: number
): Comment[] => {
  if (parentId) {
    // Update a reply
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies.map((reply) =>
            reply.id === commentId
              ? {
                  ...reply,
                  content,
                  updatedDate: new Date().toISOString(),
                  metadata: {
                    ...(reply.metadata || {}),
                    isOptimisticUpdate: true,
                    originalContent: reply.content,
                  },
                }
              : reply
          ),
        };
      }
      return comment;
    });
  } else {
    // Update a top-level comment
    return comments.map((comment) =>
      comment.id === commentId
        ? {
            ...comment,
            content,
            updatedDate: new Date().toISOString(),
            metadata: {
              ...(comment.metadata || {}),
              isOptimisticUpdate: true,
              originalContent: comment.content,
            },
          }
        : comment
    );
  }
};

/**
 * Reverts an optimistic update for a comment
 * @param comments List of comments to revert
 * @param commentId ID of the comment to revert
 * @param parentId Optional parent ID if the comment is a reply
 * @returns Updated list of comments with the optimistic update reverted
 */
export const revertOptimisticUpdate = (
  comments: Comment[],
  commentId: number,
  parentId?: number
): Comment[] => {
  if (parentId) {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies.map((reply) =>
            reply.id === commentId && reply.metadata?.isOptimisticUpdate
              ? {
                  ...reply,
                  content: reply.metadata.originalContent,
                  metadata: { ...reply.metadata, isOptimisticUpdate: false },
                }
              : reply
          ),
        };
      }
      return comment;
    });
  } else {
    return comments.map((comment) =>
      comment.id === commentId && comment.metadata?.isOptimisticUpdate
        ? {
            ...comment,
            content: comment.metadata.originalContent,
            metadata: { ...comment.metadata, isOptimisticUpdate: false },
          }
        : comment
    );
  }
};

/**
 * Updates a comment in a list with the actual API response
 * @param comments List of comments to update
 * @param updatedComment Updated comment from the API
 * @param parentId Optional parent ID if the comment is a reply
 * @returns Updated list of comments
 */
export const updateCommentWithApiResponse = (
  comments: Comment[],
  updatedComment: Comment,
  parentId?: number
): Comment[] => {
  if (parentId) {
    // Update a reply
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies.map((reply) =>
            reply.id === updatedComment.id ? updatedComment : reply
          ),
        };
      }
      return comment;
    });
  } else {
    // Update a top-level comment
    return comments.map((comment) => (comment.id === updatedComment.id ? updatedComment : comment));
  }
};

/**
 * Finds a comment by ID in a list of comments, including nested replies
 * @param comments List of comments to search in
 * @param commentId ID of the comment to find
 * @returns The found comment or null if not found
 */
export const findCommentInList = (comments: Comment[], commentId: number): Comment | null => {
  // Check top-level comments
  const topLevelComment = comments.find((c) => c.id === commentId);
  if (topLevelComment) {
    return topLevelComment;
  }

  // Check replies
  for (const comment of comments) {
    if (comment.replies && comment.replies.length > 0) {
      const reply = comment.replies.find((r) => r.id === commentId);
      if (reply) {
        return reply;
      }
    }
  }

  return null;
};

/**
 * Updates a comment's vote in a list of comments
 * @param comments List of comments to update
 * @param comment Comment to update
 * @param updatedComment Updated comment with new vote
 * @returns Updated list of comments
 */
export const updateCommentVoteInList = (
  comments: Comment[],
  commentId: number,
  updatedComment: Partial<Comment>
): Comment[] => {
  return comments.map((c) => {
    // Update top-level comment
    if (c.id === commentId) {
      return { ...c, ...updatedComment };
    }

    // Check if the comment is a reply
    if (c.replies && c.replies.length > 0) {
      return {
        ...c,
        replies: c.replies.map((reply) =>
          reply.id === commentId ? { ...reply, ...updatedComment } : reply
        ),
      };
    }

    return c;
  });
};
