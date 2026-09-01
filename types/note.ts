import { CHANGELOG_NOTEBOOK_ROLLOUT_AT, CHANGELOG_POST_IDS } from '@/constants/changelog';
import type { Organization } from './organization';
import { createTransformer, BaseTransformed } from './transformer';
import { transformOrganization } from './organization';
import { Currency, ID } from './root';
import { ContentType, ModerationStatus } from './work';
import { Fundraise, transformFundraise } from './funding';
import { Topic, transformTopic } from './topic';
import {
  Grant,
  GrantApplicationVisibility,
  SelectedGrantData,
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

/**
 * A grant note's draft settings row. The route masks it to `null` unless the
 * note is a `GRANT`, and keeps the row when the work type moves away.
 */
export interface NoteGrantSettings {
  /** Decimal string end to end, so a `(19,2)` amount never loses its cents. */
  amount: string | null;
  organization: string | null;
  description: string | null;
  applicationVisibility: GrantApplicationVisibility | '' | null;
  contacts: Contact[];
}

/** A preregistration note's draft settings row, masked and kept the same way. */
export interface NotePreregistrationSettings {
  goalAmount: string | null;
  /** Relative while drafting; publishing turns it into an absolute deadline. */
  durationDays: number | null;
  /** Null until the author picks one, which is how the publisher knows to keep its own default. */
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
  topics?: Topic[];
  authors?: Author[];
  /** The draft settings row, present only for the work type that owns it. */
  grantSettings?: NoteGrantSettings | null;
  preregistrationSettings?: NotePreregistrationSettings | null;
  selectedGrant?: SelectedGrantData | null;
  registeredReportPrefill?: RegisteredReportPrefill | null;
}

/** The grant fields a notebook draft autosaves. Any other work type answers 400. */
export interface NoteGrantSettingsDraft {
  amount?: string;
  currency?: Currency | '';
  organization?: string;
  description?: string;
  applicationVisibility?: GrantApplicationVisibility | '';
  /** User ids, not author profile ids. */
  contactIds?: number[];
}

/** The preregistration fields a notebook draft autosaves. Any other work type answers 400. */
export interface NotePreregistrationSettingsDraft {
  goalAmount?: string;
  goalCurrency?: Currency | '';
  durationDays?: number;
  isPublic?: boolean | null;
  nonprofitId?: ID;
}

/** The Details a notebook draft autosaves to `PATCH /api/note/{id}/`. */
export interface NoteDetailsDraft {
  title?: string;
  image?: string;
  previewImage?: string | null;
  authorIds?: number[];
  hubIds?: number[];
  selectedGrantId?: ID;
  grantSettings?: NoteGrantSettingsDraft;
  preregistrationSettings?: NotePreregistrationSettingsDraft;
}

type NoteDetailsScalarDraft = Omit<NoteDetailsDraft, 'grantSettings' | 'preregistrationSettings'>;

const NOTE_DETAILS_PAYLOAD_KEYS: Record<keyof NoteDetailsScalarDraft, string> = {
  title: 'title',
  image: 'image',
  previewImage: 'preview_img',
  authorIds: 'author_ids',
  hubIds: 'hub_ids',
  selectedGrantId: 'selected_grant',
};

const NOTE_GRANT_SETTINGS_PAYLOAD_KEYS: Record<keyof NoteGrantSettingsDraft, string> = {
  amount: 'amount',
  currency: 'currency',
  organization: 'organization',
  description: 'description',
  applicationVisibility: 'application_visibility',
  contactIds: 'contact_ids',
};

const NOTE_PREREGISTRATION_SETTINGS_PAYLOAD_KEYS: Record<
  keyof NotePreregistrationSettingsDraft,
  string
> = {
  goalAmount: 'goal_amount',
  goalCurrency: 'goal_currency',
  durationDays: 'duration_days',
  isPublic: 'is_public',
  nonprofitId: 'nonprofit_id',
};

/**
 * Only the keys the draft actually carries, because the route reads an absent
 * key as "leave this alone". Each field's draft type defines its clear value.
 */
const buildPayload = <T extends object>(keys: Record<keyof T, string>, draft: T) =>
  Object.fromEntries(
    Object.entries(draft).map(([field, value]) => [keys[field as keyof T], value])
  );

/** The nested settings objects are partial in exactly the same way as the row itself. */
export const buildNoteDetailsPayload = ({
  grantSettings,
  preregistrationSettings,
  ...scalars
}: NoteDetailsDraft): Record<string, unknown> => ({
  ...buildPayload(NOTE_DETAILS_PAYLOAD_KEYS, scalars),
  ...(grantSettings
    ? { grant_settings: buildPayload(NOTE_GRANT_SETTINGS_PAYLOAD_KEYS, grantSettings) }
    : {}),
  ...(preregistrationSettings
    ? {
        preregistration_settings: buildPayload(
          NOTE_PREREGISTRATION_SETTINGS_PAYLOAD_KEYS,
          preregistrationSettings
        ),
      }
    : {}),
});

/**
 * Folds two drafts together, letting the later one win. The settings objects
 * merge field by field, because a plain spread would let a later `grantSettings`
 * replace an earlier one and lose an amount edited just before an organization.
 */
export const mergeNoteDetails = (
  earlier: NoteDetailsDraft,
  later: NoteDetailsDraft
): NoteDetailsDraft => {
  const merged = { ...earlier, ...later };
  if (earlier.grantSettings && later.grantSettings) {
    merged.grantSettings = { ...earlier.grantSettings, ...later.grantSettings };
  }
  if (earlier.preregistrationSettings && later.preregistrationSettings) {
    merged.preregistrationSettings = {
      ...earlier.preregistrationSettings,
      ...later.preregistrationSettings,
    };
  }
  return merged;
};

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

/** A draft grant names its contacts by user id and spells the name out itself. */
const transformNoteGrantContact = createTransformer<any, Contact>((raw) => ({
  id: raw.id,
  name: buildFullName(raw),
}));

const transformNoteGrantSettings = createTransformer<any, NoteGrantSettings>((raw) => ({
  amount: raw.amount ?? null,
  organization: raw.organization ?? null,
  description: raw.description ?? null,
  applicationVisibility: (raw.application_visibility as GrantApplicationVisibility | '') ?? null,
  contacts: Array.isArray(raw.contacts)
    ? raw.contacts.map((contact: any) => transformNoteGrantContact(contact))
    : [],
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
    image:
      raw.image ||
      raw.registered_report_prefill?.image ||
      raw.registered_report_prefill?.image_url ||
      null,
    previewImage:
      raw.preview_img ||
      raw.registered_report_prefill?.preview_img ||
      raw.registered_report_prefill?.image_url ||
      null,
    // Saved note values first; the registered-report prefill only fills gaps.
    topics: transformTopicsFromSources(
      raw.hubs,
      raw.topics,
      raw.unified_document?.hubs,
      raw.registered_report_prefill?.topics,
      raw.registered_report_prefill?.hubs
    ),
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
