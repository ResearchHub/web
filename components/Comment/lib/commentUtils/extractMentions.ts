import { JSONContent } from '@tiptap/react';

/**
 * Extracts user IDs from mention nodes in TipTap content
 * @param content TipTap JSON content
 * @returns Array of user IDs that were mentioned
 */
export const extractUserMentions = (content: JSONContent): string[] => {
  const userIds: string[] = [];

  const traverseNodes = (node: JSONContent) => {
    // just in case we get an empty node
    if (!node) return;

    // Check if this is a mention node with user/author entity type
    if (node.type === 'mention') {
      const entityType = node.attrs?.entityType;
      const id = node.attrs?.userId;

      // Only include user and author mentions that have valid IDs
      if ((entityType === 'user' || entityType === 'author') && id) {
        userIds.push(id);
      }
    }

    // Recursively traverse child nodes
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverseNodes);
    }
  };

  traverseNodes(content);

  // Remove duplicates and return
  return [...new Set(userIds)];
};
