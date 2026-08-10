import type { Organization } from './organization';
import { createTransformer, BaseTransformed } from './transformer';
import { transformOrganization } from './organization';
import { ID } from './root';
import { ContentType, ModerationStatus } from './work';
import { Fundraise, transformFundraise } from './funding';
import { Topic, transformTopic } from './topic';
import { Grant, transformGrant } from './grant';
import { AuthorProfile, transformAuthorProfile } from './authorProfile';

export type NoteAccess = 'WORKSPACE' | 'PRIVATE' | 'SHARED';

export type Author = {
  authorId: number;
  userId: number;
  name: string;
};

export interface RegisteredReportPrefill {
  authorIds?: number[];
  topicIds?: number[];
}

export type Contact = {
  id: number;
  name: string;
  authorProfile?: AuthorProfile;
};

export type Post = {
  id: number;
  slug: string;
  contentType: ContentType;
  documentType?: string | null;
  moderationStatus?: ModerationStatus;
  fundraise?: Fundraise;
  grant?: Grant;
  topics?: Topic[];
  authors?: Author[];
  contacts?: Contact[];
  doi?: string;
  image?: string;
};

export interface Note {
  id: number;
  access: NoteAccess;
  organization: Organization;
  createdDate: string;
  updatedDate: string;
  title: string;
  isRemoved: boolean;
  post: Post | null;
  documentType: string | null;
  proposalId?: number | null;
  image?: string | null;
  previewImage?: string | null;
  topics?: Topic[];
  authors?: Author[];
  registeredReportPrefill?: RegisteredReportPrefill | null;
}

export interface NoteWithContent extends Note {
  content?: string;
  contentJson?: string;
  versionId: number;
  versionDate: string;
  plainText: string;
}

export interface NoteApiItem {
  id: number;
  access: NoteAccess;
  organization: {
    id: number;
    cover_image: string | null;
    name: string;
    slug: string;
  };
  created_date: string;
  updated_date: string;
  title: string;
}

export type TransformedNote = Note & BaseTransformed;

export const transformAuthor = createTransformer<any, Author>((raw: any) => ({
  authorId: raw.id,
  userId: raw.user,
  name: `${raw.first_name || ''} ${raw.last_name || ''}`.trim() || 'Unknown',
}));

export const transformContact = createTransformer<any, Contact>((raw) => ({
  id: raw.id,
  name: raw.name,
  authorProfile: raw.author_profile ? transformAuthorProfile(raw.author_profile) : undefined,
}));

const getDocumentType = (raw: any): string | null =>
  [raw.document_type, raw.unified_document?.document_type, raw.type]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)
    ?.trim() ?? null;

export const transformPost = createTransformer<any, Post>((raw) => ({
  id: raw.id,
  slug: raw.slug,
  contentType:
    getDocumentType(raw)?.toLowerCase() === 'preregistration'
      ? 'preregistration'
      : getDocumentType(raw)?.toLowerCase() === 'grant'
        ? 'funding_request'
        : 'post',
  documentType: getDocumentType(raw),
  moderationStatus: raw.status as ModerationStatus | undefined,
  fundraise: raw.unified_document?.fundraise
    ? transformFundraise(raw.unified_document.fundraise)
    : undefined,
  grant: raw.unified_document?.grant ? transformGrant(raw.unified_document.grant) : undefined,
  doi: raw.doi,
  topics: Array.isArray(raw.hubs) ? raw.hubs.map((hub: any) => transformTopic(hub)) : undefined,
  authors: Array.isArray(raw.authors)
    ? raw.authors.map((author: any) => transformAuthor(author))
    : undefined,
  contacts: Array.isArray(raw.contacts)
    ? raw.contacts.map((contact: any) => transformContact(contact))
    : undefined,
  image: raw.image_url,
}));

const findFirstPopulatedArray = (sources: unknown[]): unknown[] | undefined =>
  sources.find((source): source is unknown[] => Array.isArray(source) && source.length > 0) ??
  sources.find((source): source is unknown[] => Array.isArray(source));

const transformTopicsFromSources = (...sources: unknown[]): Topic[] | undefined => {
  const topicSource = findFirstPopulatedArray(sources);
  return topicSource?.map((topic) => transformTopic(topic));
};

const transformAuthorsFromSources = (...sources: unknown[]): Author[] | undefined => {
  const authorSource = findFirstPopulatedArray(sources);
  return authorSource?.map((author) => transformAuthor(author));
};

const transformRegisteredReportPrefill = (raw: any): RegisteredReportPrefill | null => {
  if (!raw) return null;

  const authorIds = raw.author_ids as number[] | undefined;
  const topicIds = (raw.hub_ids ?? raw.topic_ids) as number[] | undefined;
  return authorIds || topicIds ? { authorIds, topicIds } : null;
};

const isRegisteredReportDocumentType = (documentType?: string | null): boolean =>
  documentType?.trim().toUpperCase() === 'REGISTERED_REPORT';

const serializeNoteJson = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return undefined;

  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
};

export const transformNote = createTransformer<any, Note>((raw) => {
  const documentType = getDocumentType(raw);
  const post = raw.post ? transformPost(raw.post) : null;
  const proposalId = raw.proposal_id ?? raw.registered_report_prefill?.proposal_id ?? null;

  return {
    id: raw.id,
    access: raw.access,
    organization: transformOrganization(raw.organization),
    createdDate: raw.created_date,
    updatedDate: raw.updated_date,
    title: raw.title,
    isRemoved: raw.unifiedDocument?.isRemoved || false,
    post,
    documentType,
    proposalId,
    registeredReportPrefill: transformRegisteredReportPrefill(raw.registered_report_prefill),
    image: raw.registered_report_prefill?.image || raw.registered_report_prefill?.image_url || null,
    previewImage:
      raw.registered_report_prefill?.preview_img ||
      raw.registered_report_prefill?.image_url ||
      null,
    topics: transformTopicsFromSources(
      raw.registered_report_prefill?.topics,
      raw.registered_report_prefill?.hubs,
      raw.hubs,
      raw.topics,
      raw.unified_document?.hubs
    ),
    authors: transformAuthorsFromSources(
      raw.registered_report_prefill?.authors,
      raw.authors,
      raw.author_profiles
    ),
  };
});

export const transformNoteWithContent = createTransformer<any, NoteWithContent>((raw) => ({
  ...transformNote(raw),
  content: raw.latest_version?.src,
  versionId: raw.latest_version?.id || 0,
  versionDate: raw.latest_version?.created_date || raw.created_date,
  plainText: raw.latest_version?.plain_text || '',
  contentJson: serializeNoteJson(raw.latest_version?.json),
}));

export interface NoteContent {
  id: ID;
  note: ID;
  plain_text: string;
  src: string;
  json: string;
}

export const transformNoteContent = createTransformer<any, NoteContent>((raw) => ({
  id: raw.id,
  note: raw.note,
  plain_text: raw.plain_text,
  src: raw.src,
  json: serializeNoteJson(raw.json) ?? '',
}));

export const isRegisteredReportNote = (
  note?: Pick<Note, 'documentType' | 'post' | 'proposalId'> | null
): boolean =>
  isRegisteredReportDocumentType(note?.documentType) ||
  isRegisteredReportDocumentType(note?.post?.documentType) ||
  note?.proposalId != null;

export const isPublishedRegisteredReportNote = (
  note?: Pick<Note, 'documentType' | 'post' | 'proposalId'> | null
): boolean => Boolean(note?.post?.id) && isRegisteredReportNote(note);

/** ChangeLog entries reuse the legacy preprint post and document types. */
export const isChangelogNote = (
  note?: Pick<Note, 'documentType' | 'post' | 'proposalId'> | null
): boolean => {
  const noteDocumentType = note?.documentType?.trim().toUpperCase();
  const postDocumentType = note?.post?.documentType?.trim().toUpperCase();

  return (
    !isRegisteredReportNote(note) &&
    (noteDocumentType === 'DISCUSSION' ||
      postDocumentType === 'DISCUSSION' ||
      (!noteDocumentType &&
        !postDocumentType &&
        (note?.post?.contentType === 'post' || note?.post?.contentType === 'discussion')))
  );
};
