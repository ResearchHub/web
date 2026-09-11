import type { User } from '@/types/user';

/**
 * Site moderators and hub editors: the audience for moderation controls and
 * the research assistant. The backend gates the assistant on the same pair,
 * so this is the one place the frontend spells out who that is.
 */
export function isHubEditorOrModerator(user: User | null | undefined): boolean {
  if (!user) return false;
  return (
    Boolean(user.isModerator || user.moderator) ||
    (user.editorOfHubs?.length ?? 0) > 0 ||
    Boolean(user.authorProfile?.isHubEditor)
  );
}
