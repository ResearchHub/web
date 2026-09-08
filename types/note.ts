import { CHANGELOG_NOTEBOOK_ROLLOUT_AT, CHANGELOG_POST_IDS } from '@/constants/changelog';
import type { Organization } from './organization';
import { createTransformer, BaseTransformed } from './transformer';
import { transformOrganization } from './organization';
import { Currency, ID } from './root';
import { ContentType, ModerationStatus } from './work';
import { Fundraise, transformFundraise } from './funding';
import {
  Grant,
  GrantApplicationVisibility,
  SelectedGrantDetails,
  transformGrant,
  transformSelectedGrant,
} from './grant';
import { NonprofitOrg, transformNonprofitDetailsToOrg } from './nonprofit';
import { AuthorProfile, transformAuthorProfile } from './authorProfile';

export type NoteAccess = 'WORKSPACE' | 'PRIVATE' | 'SHARED';

export type Author = {
  authorId: number;
  userId: number;
  name: string;
};

export interface RegisteredReportPrefill {
  authorIds?: number[];
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
  authors?: Author[];
  contacts?: Contact[];
  doi?: string;
  image?: string;
};

/** What a draft Request for Proposal has filled in so far. */
export interface NoteGrantSettings {
  /** A decimal string, so cents cannot be rounded away in JavaScript. */
  amount: string | null;
  organization: string | null;
  description: string | null;
  applicationVisibility: GrantApplicationVisibility | null;
  contacts: Contact[];
}

/** What a draft proposal has filled in so far. */
export interface NotePreregistrationSettings {
  goalAmount: string | null;
  /** How long the fundraise runs; publishing turns it into a deadline. */
  durationDays: number | null;
  isPublic: boolean | null;
  nonprofit: NonprofitOrg | null;
}

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
  authors?: Author[];
  grantSettings?: NoteGrantSettings | null;
  preregistrationSettings?: NotePreregistrationSettings | null;
  selectedGrant?: SelectedGrantDetails | null;
  registeredReportPrefill?: RegisteredReportPrefill | null;
}

/** Grant fields the Note API accepts; an omitted key keeps its saved value. */
export interface NoteGrantSettingsUpdate {
  amount?: string | null;
  currency?: Currency;
  organization?: string;
  description?: string;
  applicationVisibility?: GrantApplicationVisibility;
  /** User ids, not author profile ids. */
  contactIds?: number[];
}

/** Proposal funding fields the Note API accepts. */
export interface NotePreregistrationSettingsUpdate {
  goalAmount?: string | null;
  goalCurrency?: Currency;
  durationDays?: number;
  isPublic?: boolean;
  nonprofitId?: string | null;
}

/**
 * A partial update to a note's own fields: the title the editor derives from
 * the document, plus the Details a draft fills in before it is published.
 */
export interface NoteDetailsUpdate {
  title?: string;
  documentType?: string;
  authorIds?: number[];
  image?: string;
  previewImage?: string;
  grantSettings?: NoteGrantSettingsUpdate;
  preregistrationSettings?: NotePreregistrationSettingsUpdate;
}

type NoteDetailsFields = Omit<NoteDetailsUpdate, 'grantSettings' | 'preregistrationSettings'>;

const NOTE_FIELD_KEYS: Record<keyof NoteDetailsFields, string> = {
  title: 'title',
  documentType: 'document_type',
  authorIds: 'author_ids',
  image: 'image',
  previewImage: 'preview_img',
};

const GRANT_SETTINGS_KEYS: Record<keyof NoteGrantSettingsUpdate, string> = {
  amount: 'amount',
  currency: 'currency',
  organization: 'organization',
  description: 'description',
  applicationVisibility: 'application_visibility',
  contactIds: 'contact_ids',
};

const PREREGISTRATION_SETTINGS_KEYS: Record<keyof NotePreregistrationSettingsUpdate, string> = {
  goalAmount: 'goal_amount',
  goalCurrency: 'goal_currency',
  durationDays: 'duration_days',
  isPublic: 'is_public',
  nonprofitId: 'nonprofit_id',
};

/** Renames the fields the update actually set, so an untouched key is never sent. */
const toApiPayload = <T extends object>(apiKeys: Record<keyof T, string>, update: T) =>
  Object.fromEntries(
    Object.entries(update).map(([field, value]) => [apiKeys[field as keyof T], value])
  );

export const buildNoteDetailsPayload = ({
  grantSettings,
  preregistrationSettings,
  ...noteFields
}: NoteDetailsUpdate): Record<string, unknown> => ({
  ...toApiPayload(NOTE_FIELD_KEYS, noteFields),
  ...(grantSettings && { grant_settings: toApiPayload(GRANT_SETTINGS_KEYS, grantSettings) }),
  ...(preregistrationSettings && {
    preregistration_settings: toApiPayload(PREREGISTRATION_SETTINGS_KEYS, preregistrationSettings),
  }),
});

/** Combines queued edits so a later settings change cannot drop an earlier one. */
export const mergeNoteDetailsUpdates = (
  earlier: NoteDetailsUpdate,
  later: NoteDetailsUpdate
): NoteDetailsUpdate => ({
  ...earlier,
  ...later,
  ...(earlier.grantSettings &&
    later.grantSettings && {
      grantSettings: { ...earlier.grantSettings, ...later.grantSettings },
    }),
  ...(earlier.preregistrationSettings &&
    later.preregistrationSettings && {
      preregistrationSettings: {
        ...earlier.preregistrationSettings,
        ...later.preregistrationSettings,
      },
    }),
});

/**
 * Who committed a note version: the editor autosave endpoint, the notebook AI
 * tools, or a programmatic writer (publish snapshots, imports). The backend
 * may add sources; unknown strings should be treated like `'system'`. `null`
 * on versions predating attribution.
 */
export type NoteVersionSource = 'editor' | 'agent' | 'system';

export interface NoteWithContent extends Note {
  content?: string;
  contentJson?: string;
  versionId: number;
  versionDate: string;
  plainText: string;
  /** Plain string on the wire — {@link NoteVersionSource} lists the known values. */
  versionCreatedVia: string | null;
}

/**
 * One `note_version_created` frame from `ws/notebook/notes/<id>/` — emitted
 * whenever any writer commits a new content version. Ids and attribution
 * only, never content: the consumer compares version ids and refetches.
 */
export interface NoteVersionEvent {
  type: string;
  note_id: number;
  version_id: number;
  parent_version_id: number | null;
  created_by: number | null;
  /** Plain string on the wire — {@link NoteVersionSource} lists the known values. */
  created_via: string | null;
  created_date: string;
}

export const NOTE_VERSION_CREATED = 'note_version_created';

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

const buildFullName = (raw: any): string =>
  `${raw.first_name || ''} ${raw.last_name || ''}`.trim() || 'Unknown';

export const transformAuthor = createTransformer<any, Author>((raw: any) => ({
  authorId: raw.id,
  userId: raw.user,
  name: buildFullName(raw),
}));

export const transformContact = createTransformer<any, Contact>((raw) => ({
  id: raw.id,
  name: raw.name,
  authorProfile: raw.author_profile ? transformAuthorProfile(raw.author_profile) : undefined,
}));

const transformNoteGrantSettings = createTransformer<any, NoteGrantSettings>((raw) => ({
  amount: raw.amount ?? null,
  organization: raw.organization ?? null,
  description: raw.description ?? null,
  applicationVisibility: raw.application_visibility ?? null,
  // Saved grant contacts are users, so they arrive as names rather than a label.
  contacts: (raw.contacts ?? []).map((contact: any) => ({
    id: contact.id,
    name: buildFullName(contact),
  })),
}));

const transformNotePreregistrationSettings = createTransformer<any, NotePreregistrationSettings>(
  (raw) => ({
    goalAmount: raw.goal_amount ?? null,
    durationDays: raw.duration_days ?? null,
    isPublic: raw.is_public ?? null,
    nonprofit: raw.nonprofit_details ? transformNonprofitDetailsToOrg(raw.nonprofit_details) : null,
  })
);

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

const transformAuthorsFromSources = (...sources: unknown[]): Author[] | undefined => {
  const authorSource = findFirstPopulatedArray(sources);
  return authorSource?.map((author) => transformAuthor(author));
};

const transformRegisteredReportPrefill = (raw: any): RegisteredReportPrefill | null => {
  if (!raw) return null;

  const authorIds = raw.author_ids as number[] | undefined;
  return authorIds ? { authorIds } : null;
};

const isRegisteredReportDocumentType = (documentType?: string | null): boolean =>
  documentType?.trim().toUpperCase() === 'REGISTERED_REPORT';

const isGrantDocumentType = (documentType?: string | null): boolean =>
  documentType?.trim().toUpperCase() === 'GRANT';

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
    // Saved values first, so a Registered Report prefill only fills the gaps.
    // `image` holds a storage key, which the prefill's `image_url` is not.
    image: raw.image || raw.registered_report_prefill?.image || null,
    previewImage:
      raw.preview_img ||
      raw.registered_report_prefill?.preview_img ||
      raw.registered_report_prefill?.image_url ||
      null,
    authors: transformAuthorsFromSources(
      raw.authors,
      raw.author_profiles,
      raw.registered_report_prefill?.authors
    ),
    grantSettings: raw.grant_settings ? transformNoteGrantSettings(raw.grant_settings) : null,
    preregistrationSettings: raw.preregistration_settings
      ? transformNotePreregistrationSettings(raw.preregistration_settings)
      : null,
    selectedGrant: raw.selected_grant_details
      ? transformSelectedGrant(raw.selected_grant_details)
      : null,
  };
});

export const transformNoteWithContent = createTransformer<any, NoteWithContent>((raw) => ({
  ...transformNote(raw),
  content: raw.latest_version?.src,
  versionId: raw.latest_version?.id || 0,
  versionDate: raw.latest_version?.created_date || raw.created_date,
  plainText: raw.latest_version?.plain_text || '',
  contentJson: serializeNoteJson(raw.latest_version?.json),
  versionCreatedVia: raw.latest_version?.created_via ?? null,
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

type ClassifiableNoteKey = 'documentType' | 'post' | 'proposalId';
type ClassifiableNote = Pick<Note, ClassifiableNoteKey>;
type ClassifiableChangelogNote = ClassifiableNote & Pick<Note, 'createdDate'>;

const CHANGELOG_POST_ID_SET: ReadonlySet<string> = new Set(CHANGELOG_POST_IDS);
const CHANGELOG_ROLLOUT_TIMESTAMP = Date.parse(CHANGELOG_NOTEBOOK_ROLLOUT_AT);

export const isRegisteredReportNote = (note?: ClassifiableNote | null): boolean =>
  isRegisteredReportDocumentType(note?.documentType) ||
  isRegisteredReportDocumentType(note?.post?.documentType) ||
  note?.proposalId != null;

export const isPublishedRegisteredReportNote = (note?: ClassifiableNote | null): boolean =>
  Boolean(note?.post?.id) && isRegisteredReportNote(note);

/**
 * A Request for Proposal — the funder's call for work, as opposed to the
 * proposals answering it. Reads the same signals as the editor's work-type
 * label, including `contentType`, which is where a note carrying only a post
 * records it.
 */
export const isRfpNote = (note?: ClassifiableNote | null): boolean =>
  isGrantDocumentType(note?.documentType) ||
  isGrantDocumentType(note?.post?.documentType) ||
  note?.post?.contentType === 'funding_request';

/** Uses exact legacy IDs because ordinary preprints also used DISCUSSION before rollout. */
export const isChangelogNote = (note?: ClassifiableChangelogNote | null): boolean => {
  if (!note || isRegisteredReportNote(note)) return false;

  const postId = note.post?.id;
  if (postId != null && CHANGELOG_POST_ID_SET.has(String(postId))) return true;

  const wasCreatedOnOrAfterRollout = Date.parse(note.createdDate) >= CHANGELOG_ROLLOUT_TIMESTAMP;
  if (!wasCreatedOnOrAfterRollout) return false;

  return (
    note.documentType?.trim().toUpperCase() === 'DISCUSSION' ||
    note.post?.documentType?.trim().toUpperCase() === 'DISCUSSION'
  );
};
