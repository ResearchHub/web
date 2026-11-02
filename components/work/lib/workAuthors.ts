import type { Author } from '@/components/ui/AuthorList';
import type { Authorship } from '@/types/work';

/**
 * A work's authors as AuthorList lists them, each who has claimed their
 * profile linking to it. With `profileCards`, hovering one of those names
 * opens their profile card too.
 */
export function toAuthorListAuthors(
  authorships: Authorship[],
  { profileCards = false }: { profileCards?: boolean } = {}
): Author[] {
  return authorships.map(({ authorProfile }) => {
    const isClaimed = Boolean(authorProfile.user);
    return {
      name: authorProfile.fullName,
      verified: authorProfile.user?.isVerified,
      profileUrl: `/author/${authorProfile.id}`,
      authorUrl: isClaimed ? `/author/${authorProfile.id}` : undefined,
      authorId: profileCards && isClaimed ? authorProfile.id : undefined,
    };
  });
}
