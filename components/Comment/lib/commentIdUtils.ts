/**
 * This file contains utilities for managing comment IDs, including mapping between
 * optimistic IDs and real IDs, and tracking parent-child relationships.
 */

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
