/**
 * Source of truth for changelog post IDs. The first ID is treated as the
 * "latest" entry and is used to derive the storage key that drives the
 * "new changelog" indicator in the footer — adding a new ID at the top
 * automatically invalidates the seen-flag for all users.
 */
export const CHANGELOG_POST_IDS = [
  '32266',
  '32263',
  '32262',
  '32261',
  '32260',
  '32259',
  '32258',
  '32256',
  '32257',
  '32255',
  '17886',
  '17884',
  '17874',
  '17859',
  '17850',
  '17846',
  '17841',
  '17839',
  '17833',
  '4594',
] as const;

export const LATEST_CHANGELOG_POST_ID = CHANGELOG_POST_IDS[0];
export const CHANGELOG_STORAGE_KEY = `rh-changelog-seen-${LATEST_CHANGELOG_POST_ID}`;
