import type { Author } from '@/components/ui/AuthorList';
import type { Authorship } from '@/types/work';

/** A work's authors as AuthorList lists them, each linking to their profile. */
export function toAuthorListAuthors(authorships: Authorship[]): Author[] {
  return authorships.map(({ authorProfile }) => ({
    name: authorProfile.fullName,
    verified: authorProfile.user?.isVerified,
    profileUrl: `/author/${authorProfile.id}`,
    authorUrl: authorProfile.user ? `/author/${authorProfile.id}` : undefined,
  }));
}
