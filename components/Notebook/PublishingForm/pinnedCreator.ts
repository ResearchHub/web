import type { ArticleType } from './schema';
import type { Author, Contact, NoteWithContent } from '@/types/note';

/**
 * The form value of the person who created a published proposal or RFP.
 * Authors are stored by author-profile id; RFP contacts are stored by user id.
 * Null when the note is still a draft, or the creator is not on the list.
 */
export function pinnedCreatorValue(
  note: NoteWithContent | null,
  articleType: ArticleType | undefined
): string | null {
  if (!note?.post || note.createdByUserId == null) return null;
  const createdBy = note.createdByUserId;

  if (articleType === 'grant' || note.post.contentType === 'funding_request') {
    const contacts = note.post.grant?.contacts ?? note.grantSettings?.contacts ?? [];
    const creator = contacts.find((contact) => contactMatchesCreator(contact, createdBy));
    return creator ? creator.id.toString() : null;
  }

  const authors = [...(note.post.authors ?? []), ...(note.authors ?? [])];
  const creator = authors.find((author) => authorMatchesCreator(author, createdBy));
  return creator ? creator.authorId.toString() : null;
}

export function creatorRemovalMessage(articleType: ArticleType | undefined): string {
  return articleType === 'grant'
    ? 'The person who created this RFP has to stay a contact.'
    : 'The person who created this proposal has to stay an author.';
}

function authorMatchesCreator(author: Author, createdBy: number): boolean {
  return readId(author.userId) === createdBy;
}

function contactMatchesCreator(contact: Contact, createdBy: number): boolean {
  return contact.id === createdBy || readId(contact.authorProfile?.user?.id) === createdBy;
}

function readId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value !== '' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  if (value && typeof value === 'object' && 'id' in value) {
    return readId((value as { id: unknown }).id);
  }
  return null;
}
