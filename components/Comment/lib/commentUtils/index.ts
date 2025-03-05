/**
 * This file re-exports all comment utilities from their respective files
 * to maintain backward compatibility with existing imports.
 */

// Re-export ID utilities
export {
  mapOptimisticToRealId,
  recordParentChildRelationship,
  getRealId,
  getParentId,
  clearIdMappings,
} from '../commentIdUtils';

// Re-export tree utilities
export {
  traverseCommentTree,
  findCommentById,
  addReplyDeep,
  updateReplyDeep,
  removeCommentDeep,
} from '../commentTreeUtils';

// Re-export optimistic update utilities
export {
  createOptimisticComment,
  updateCommentVoteInList,
  revertOptimisticUpdate,
  updateCommentWithApiResponse,
} from '../commentOptimisticUtils';
