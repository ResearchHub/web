/**
 * Pure mappings between a note, the publishing form's values, and the API:
 * how a draft's saved Details fill the form, how one changed field becomes a
 * Details update, and where a published work lives. Nothing here touches
 * React or the network except `saveSelectedNonprofit`, which needs the
 * nonprofit stored before its id can be saved.
 */
import type { NoteDetailsSaver } from '@/hooks/useNoteDetailsSaver';
import { NonprofitService } from '@/services/nonprofit.service';
import { ARTICLE_TYPE_API_MAP } from '@/services/post.service';
import type { NonprofitOrg } from '@/types/nonprofit';
import type { NoteDetailsUpdate, NoteWithContent } from '@/types/note';
import { buildRegisteredReportUrl } from '@/utils/registeredReportRoute';
import { buildWorkUrl } from '@/utils/url';
import type { ArticleType, PublishingFormData, SelectOption } from './schema';

export const DEFAULT_FUNDRAISE_END_DAYS = '60';

export const FORM_DEFAULTS = {
  authors: [],
  contacts: [],
  rewardFunders: false,
  nftSupply: '1000',
  budget: '',
  coverImage: null,
  selectedNonprofit: null,
  selectedGrant: null,
  departmentLabName: '',
  shortDescription: '',
  organization: '',
  applicationDeadline: null,
  fundraiseEndDays: DEFAULT_FUNDRAISE_END_DAYS as '60',
  applicationVisibility: 'OPTIONAL' as const,
  isPublic: true,
};

type SetValue = (name: any, value: any) => void;
type GetValues = (name: any) => any;

const mapContentTypeToArticleType = (contentType: string): ArticleType => {
  if (contentType === 'preregistration') return 'preregistration';
  if (contentType === 'funding_request') return 'grant';
  return 'discussion';
};

export const mapDocumentTypeToArticleType = (documentType: string): ArticleType | null => {
  const map: Record<string, ArticleType> = {
    DISCUSSION: 'discussion',
    GRANT: 'grant',
    PREREGISTRATION: 'preregistration',
    REGISTERED_REPORT: 'registered_report',
  };
  return map[documentType] ?? null;
};

const populateGrantFields = (grant: any, setValue: SetValue) => {
  if (!grant) return;
  if (grant.endDate) setValue('applicationDeadline', new Date(grant.endDate));
  if (grant.description) setValue('shortDescription', grant.description);
  if (grant.organization) setValue('organization', grant.organization);
  if (grant.amount) setValue('budget', grant.amount.usd.toString());
  if (grant.contacts?.length > 0) {
    setValue(
      'contacts',
      grant.contacts.map((c: any) => ({
        value: c.id.toString(),
        label: c.authorProfile?.fullName || c.name,
      }))
    );
  }
  if (grant.applicationVisibility) {
    setValue('applicationVisibility', grant.applicationVisibility);
  }
};

/** Populates the form from the work this note was published as. */
export const populateFromPost = (post: any, setValue: SetValue) => {
  setValue('workId', post.id.toString());
  setValue(
    'articleType',
    (post.documentType && mapDocumentTypeToArticleType(post.documentType)) ??
      mapContentTypeToArticleType(post.contentType)
  );

  if (post.contentType === 'preregistration') {
    setValue('budget', post.fundraise?.goalAmount.usd.toString());
  }
  if (post.contentType === 'funding_request') {
    populateGrantFields(post.grant, setValue);
  }
  if (post.image) {
    setValue('coverImage', { file: null, url: post.image });
  }
  if (post.authors?.length > 0) {
    setValue(
      'authors',
      post.authors.map((a: any) => ({ value: a.authorId.toString(), label: a.name }))
    );
  }
};

export const mapOptionsToIds = (options: SelectOption[]): number[] =>
  options.map((option) => Number(option.value)).filter((id) => !Number.isNaN(id));

/** Both amount inputs accept digits only, so a saved `5000.00` reads back as `5000`. */
const dropZeroCents = (amount: string): string => amount.replace(/\.0+$/, '');

/** Populates the form from this draft's saved Details. */
export const populateFormFromNoteDetails = (note: NoteWithContent, setValue: SetValue) => {
  if (note.image || note.previewImage) {
    setValue('coverImage', { file: null, key: note.image, url: note.previewImage });
  }
  if (note.authors?.length) {
    setValue(
      'authors',
      note.authors.map((author) => ({ value: author.authorId.toString(), label: author.name }))
    );
  }
  if (note.selectedGrant) {
    setValue('selectedGrant', note.selectedGrant);
  }

  const { grantSettings, preregistrationSettings } = note;
  if (grantSettings) {
    if (grantSettings.amount) setValue('budget', dropZeroCents(grantSettings.amount));
    if (grantSettings.organization) setValue('organization', grantSettings.organization);
    if (grantSettings.description) setValue('shortDescription', grantSettings.description);
    if (grantSettings.applicationVisibility) {
      setValue('applicationVisibility', grantSettings.applicationVisibility);
    }
    if (grantSettings.contacts.length > 0) {
      setValue(
        'contacts',
        grantSettings.contacts.map((contact) => ({
          value: contact.id.toString(),
          label: contact.name,
        }))
      );
    }
  }
  if (preregistrationSettings) {
    const { goalAmount, durationDays, isPublic, nonprofit } = preregistrationSettings;
    if (goalAmount) setValue('budget', dropZeroCents(goalAmount));
    if (durationDays) setValue('fundraiseEndDays', durationDays.toString());
    if (isPublic !== null) setValue('isPublic', isPublic);
    if (nonprofit) setValue('selectedNonprofit', nonprofit);
  }
};

/** Fills the author gap from a Registered Report's proposal. */
export const populateRegisteredReportPrefill = (
  note: NoteWithContent,
  getValues: GetValues,
  setValue: SetValue
) => {
  const { authorIds = [] } = note.registeredReportPrefill ?? {};

  if (authorIds.length > 0 && getValues('authors').length === 0) {
    setValue(
      'authors',
      authorIds.map((id) => ({ value: id.toString(), label: `Author ${id}` }))
    );
  }
};

/** Builds a Note Details update for one changed form field. */
export const buildNoteDetailsUpdate = (
  field: string,
  values: PublishingFormData
): NoteDetailsUpdate | null => {
  const isGrant = values.articleType === 'grant';
  const isProposal = values.articleType === 'preregistration';

  switch (field) {
    case 'articleType':
      return { documentType: ARTICLE_TYPE_API_MAP[values.articleType] };
    case 'coverImage':
      // A file is still uploading, and the key it produces triggers this again.
      if (values.coverImage?.file) return null;
      // The API clears an image with a blank string; null is rejected.
      return { image: values.coverImage?.key ?? '', previewImage: values.coverImage?.url ?? '' };
    case 'authors':
      return { authorIds: mapOptionsToIds(values.authors) };
    case 'contacts':
      return isGrant ? { grantSettings: { contactIds: mapOptionsToIds(values.contacts) } } : null;
    case 'organization':
      return isGrant ? { grantSettings: { organization: values.organization } } : null;
    case 'shortDescription':
      return isGrant ? { grantSettings: { description: values.shortDescription } } : null;
    case 'applicationVisibility':
      return isGrant
        ? { grantSettings: { applicationVisibility: values.applicationVisibility } }
        : null;
    case 'fundraiseEndDays':
      return isProposal
        ? { preregistrationSettings: { durationDays: Number(values.fundraiseEndDays) } }
        : null;
    case 'isPublic':
      return isProposal ? { preregistrationSettings: { isPublic: values.isPublic } } : null;
    case 'budget': {
      const amount = values.budget || null;
      if (isGrant) return { grantSettings: { amount, currency: 'USD' } };
      return isProposal
        ? { preregistrationSettings: { goalAmount: amount, goalCurrency: 'USD' } }
        : null;
    }
    default:
      return null;
  }
};

/** Saves the nonprofit under the id the Note API stores, not its Endaoment one. */
export const saveSelectedNonprofit = async (
  nonprofit: NonprofitOrg | null,
  saveDetailsSoon: NoteDetailsSaver['saveDetailsSoon'],
  getValues: GetValues
) => {
  if (!nonprofit) {
    saveDetailsSoon({ preregistrationSettings: { nonprofitId: null } });
    return;
  }

  try {
    const saved = await NonprofitService.createNonprofit({
      name: nonprofit.name,
      endaomentOrgId: nonprofit.endaomentOrgId,
      ein: nonprofit.ein,
      baseWalletAddress: nonprofit.baseWalletAddress,
    });
    // A newer choice may have replaced this one while it was being created.
    if (getValues('selectedNonprofit') !== nonprofit) return;
    saveDetailsSoon({ preregistrationSettings: { nonprofitId: saved.id } });
  } catch (error) {
    console.error('Error saving selected nonprofit:', error);
  }
};

export const applyGrantDefaults = (getValues: GetValues, setValue: SetValue) => {
  if (getValues('articleType') === 'grant') {
    setValue('applicationDeadline', new Date('2029-12-31'));
  }
};

/** Names the field it defaulted, which the caller has to save like any edit. */
export const autoAddCurrentUser = (
  getValues: GetValues,
  setValue: SetValue,
  currentUser: any
): 'authors' | 'contacts' | null => {
  const articleType = getValues('articleType');
  if (!currentUser || articleType === 'registered_report') return null;

  const isGrant = articleType === 'grant';
  const field = isGrant ? 'contacts' : 'authors';
  if (getValues(field).length > 0) return null;

  const profile = currentUser.authorProfile;
  setValue(field, [
    {
      value: isGrant
        ? currentUser.id.toString()
        : profile?.id?.toString() || currentUser.id.toString(),
      label: currentUser.fullName || currentUser.email || 'Unknown User',
    },
  ]);
  return field;
};

/** The work type a notebook route asked for (`?newFunding=true`, `?template=grant`…). */
export const resolveArticleType = (
  params: { get(key: string): string | null } | null
): ArticleType | null => {
  if (params?.get('newFunding') === 'true') return 'preregistration';
  if (params?.get('newChangelog') === 'true') return 'discussion';
  if (params?.get('newGrant') === 'true') return 'grant';

  const template = params?.get('template');
  if (template === 'preregistration') return 'preregistration';
  if (template === 'grant') return 'grant';
  return null;
};

/** Where a work of this type lives once published. */
export const getWorkPath = (articleType: string, workId: string, slug: string): string => {
  if (articleType === 'preregistration') return `/proposal/${workId}/${slug}?new=true`;
  if (articleType === 'grant')
    return buildWorkUrl({ id: workId, slug, contentType: 'funding_request' });
  if (articleType === 'registered_report') return buildRegisteredReportUrl(workId, slug);
  return `/post/${workId}/${slug}`;
};
