/**
 * This file re-exports all comment utilities from their respective files
 * to maintain backward compatibility with existing imports.
 */

// Re-export tree utilities
export {
  traverseCommentTree,
  findCommentById,
  addReplyDeep,
  updateReplyDeep,
} from '../commentTreeUtils';

// Re-export optimistic update utilities
export { updateCommentVoteInList, revertOptimisticUpdate } from '../commentOptimisticUtils';

// Re-export mention utilities
export { extractUserMentions } from './extractMentions';
