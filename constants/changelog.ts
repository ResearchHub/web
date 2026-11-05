/**
 * localStorage key recording that this browser has seen the changelog up to
 * `latestPostId`. A newer entry gets a new key, which brings back the "new
 * changelog" indicator for everyone.
 */
export const getChangelogStorageKey = (latestPostId: number | string) =>
  `rh-changelog-seen-${latestPostId}`;
