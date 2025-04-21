interface AvatarItem {
  src: string;
  alt: string;
  tooltip?: string;
  authorId?: number;
}

/**
 * Deduplicates an array of avatar items based on authorId.
 * Keeps the first occurrence of each authorId.
 */
export const dedupeAvatars = (avatars: AvatarItem[]): AvatarItem[] => {
  if (!avatars) return [];

  const seenAuthorIds = new Set<number>();
  return avatars.filter((avatar) => {
    // If authorId is undefined or null, keep the avatar (cannot dedupe)
    if (avatar.authorId === undefined || avatar.authorId === null) {
      return true;
    }
    // If authorId has been seen, filter it out
    if (seenAuthorIds.has(avatar.authorId)) {
      return false;
    }
    // Otherwise, mark authorId as seen and keep the avatar
    seenAuthorIds.add(avatar.authorId);
    return true;
  });
};
