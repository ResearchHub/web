import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseBudget, publishingFormSchema } from './schema';
import type { PublishingFormData, SelectOption } from './schema';
import { WorkImageSection } from './components/WorkImageSection';
import { FundingSection } from './components/FundingSection';
import { AuthorsSection } from './components/AuthorsSection';
import { ContactsSection } from './components/ContactsSection';
import { TopicsSection } from './components/TopicsSection';
import { GrantDescriptionSection } from './components/GrantDescriptionSection';
import { GrantOrganizationSection } from './components/GrantOrganizationSection';
import { GrantFundingAmountSection } from './components/GrantFundingAmountSection';
import { GrantApplicationVisibilitySection } from './components/GrantApplicationVisibilitySection';
import {
  PreregistrationPrivacySection,
  PreregistrationPrivacyLockedAlert,
} from './components/PreregistrationPrivacySection';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { buildWorkUrl } from '@/utils/url';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUpsertPost } from '@/hooks/useDocument';
import { ConfirmPublishModal } from '@/components/modals/ConfirmPublishModal';
import {
  getDocumentTitleFromEditor,
  setDocumentTitle,
} from '@/components/Editor/lib/utils/documentTitle';
import { ResearchCoinSection } from './components/ResearchCoinSection';
import { EndDateSection } from './components/EndDateSection';
import { toast } from 'react-hot-toast';
import {
  loadPublishingFormFromStorage,
  savePublishingFormToStorage,
  getPendingGrant,
  clearPendingGrant,
  SERVER_OWNED_FIELDS,
} from '@/components/Editor/lib/utils/publishingFormStorage';
import { PublishingFormSkeleton } from '@/components/skeletons/PublishingFormSkeleton';
import { Loader2 } from 'lucide-react';
import { DOISection } from '@/components/work/components/DOISection';
import { getFieldErrorMessage } from '@/utils/form';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useUser } from '@/contexts/UserContext';
import { useAssetUpload } from '@/hooks/useAssetUpload';
import { useNonprofitLink } from '@/hooks/useNonprofitLink';
import { NonprofitConfirmModal } from '@/components/Nonprofit';
import { ApiError } from '@/services/types';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ARTICLE_TYPE_API_MAP } from '@/services/post.service';
import { mergeRegisteredReportPrefill } from '@/utils/registeredReportPrefill';
import { buildRegisteredReportUrl } from '@/utils/registeredReportRoute';
import {
  isChangelogNote,
  isRegisteredReportNote,
  mergeNoteDetails,
  type NoteDetailsDraft,
  type NoteGrantSettingsDraft,
  type NotePreregistrationSettingsDraft,
  type NoteWithContent,
} from '@/types/note';
import type { NonprofitOrg } from '@/types/nonprofit';
import type { Currency } from '@/types/root';
import { NonprofitService } from '@/services/nonprofit.service';
import type { NoteDetailsSaver } from '@/hooks/useNoteDetailsSaver';
import { getAvailableNotebookWorkTypes } from '@/components/Notebook/NotebookPrimaryNavigation';

const FEATURE_FLAG_RESEARCH_COIN = false;
const DEFAULT_FUNDRAISE_END_DAYS = '60';
const CHANGELOG_PUBLISH_ERROR_MESSAGE = 'Cannot publish changelog';
// Both amount inputs are labelled USD and the form offers no other choice.
const FUNDING_CURRENCY: Currency = 'USD';

/** Which settings object the note row accepts, if any. */
type NoteFundingType = 'grant' | 'preregistration';

const PUBLISH_LABEL: Record<string, string> = {
  preregistration: 'Proposal',
  grant: 'Request for Proposal',
  registered_report: 'Registered Report',
};

const PUBLISHING_FORM_WORK_TYPES = getAvailableNotebookWorkTypes(false);

interface PublishingFormProps {
  bountyAmount?: number | null;
  onBountyClick?: () => void;
  readOnly?: boolean;
  /** The note's one debounced writer — every Details control marks fields dirty here. */
  detailsSaver: NoteDetailsSaver;
  saveContentNow: () => Promise<boolean>;
}

const getButtonText = ({
  isLoadingUpsert,
  isRedirecting,
  isLinkingNonprofit,
  hasWorkId,
}: {
  isLoadingUpsert: boolean;
  isRedirecting: boolean;
  isLinkingNonprofit: boolean;
  hasWorkId: boolean;
}) => {
  switch (true) {
    case isLoadingUpsert:
      return 'Publishing...';
    case isLinkingNonprofit:
      return 'Linking nonprofit...';
    case isRedirecting:
      return 'Redirecting...';
    case hasWorkId:
      return 'Publish';
    default:
      return 'Publish';
  }
};

const FORM_DEFAULTS = {
  authors: [],
  contacts: [],
  topics: [],
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
  // Undefined until the author picks, which is how the publisher knows to keep
  // its own default and the target grant's visibility rules.
  isPublic: undefined as boolean | undefined,
};

const mapContentTypeToArticleType = (contentType: string): PublishingFormData['articleType'] => {
  if (contentType === 'preregistration') return 'preregistration';
  if (contentType === 'funding_request') return 'grant';
  return 'discussion';
};

const mapDocumentTypeToArticleType = (
  documentType: string
): PublishingFormData['articleType'] | null => {
  const map: Record<string, PublishingFormData['articleType']> = {
    DISCUSSION: 'discussion',
    GRANT: 'grant',
    PREREGISTRATION: 'preregistration',
    REGISTERED_REPORT: 'registered_report',
  };
  return map[documentType] ?? null;
};

const resolveFundingType = (documentType?: string | null): NoteFundingType | null => {
  const articleType = documentType ? mapDocumentTypeToArticleType(documentType) : null;
  if (articleType === 'grant') return 'grant';
  if (articleType === 'preregistration') return 'preregistration';
  return null;
};

const populateGrantFields = (grant: any, setValue: (name: any, value: any) => void) => {
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

const populateFromPost = (post: any, setValue: (name: any, value: any) => void) => {
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
  if (post.topics?.length > 0) {
    setValue(
      'topics',
      post.topics.map((t: any) => ({ value: t.id.toString(), label: t.name }))
    );
  }
  if (post.authors?.length > 0) {
    setValue(
      'authors',
      post.authors.map((a: any) => ({ value: a.authorId.toString(), label: a.name }))
    );
  }
};

const mapOptionsToIds = (options: SelectOption[]): number[] =>
  options.map((option) => Number(option.value)).filter((id) => !Number.isNaN(id));

/** A cover still uploading is not durable yet, so it stays out of the dirty set. */
const buildCoverDetails = (values: PublishingFormData): NoteDetailsDraft | null =>
  values.coverImage?.file
    ? null
    : { image: values.coverImage?.key ?? null, previewImage: values.coverImage?.url ?? null };

/** An empty or unparsed amount is a half-finished edit, not a deliberate clear. */
const readDraftAmount = (budget?: string): string | null =>
  budget && parseBudget(budget) > 0 ? budget : null;

/** The Details every work type accepts. */
const buildChangedSharedDetails = (
  field: string,
  values: PublishingFormData
): NoteDetailsDraft | null => {
  switch (field) {
    case 'authors':
      return { authorIds: mapOptionsToIds(values.authors) };
    case 'topics':
      return { hubIds: mapOptionsToIds(values.topics) };
    case 'coverImage':
      return buildCoverDetails(values);
    case 'selectedGrant':
      return { selectedGrantId: values.selectedGrant?.id ?? null };
    default:
      return null;
  }
};

const buildChangedGrantSettings = (
  field: string,
  values: PublishingFormData
): NoteGrantSettingsDraft | null => {
  switch (field) {
    case 'budget': {
      const amount = readDraftAmount(values.budget);
      return amount === null ? null : { amount, currency: FUNDING_CURRENCY };
    }
    case 'organization':
      return { organization: values.organization ?? '' };
    case 'shortDescription':
      return { description: values.shortDescription ?? '' };
    case 'applicationVisibility':
      return { applicationVisibility: values.applicationVisibility ?? 'OPTIONAL' };
    // An empty contact list is a real clear, so it goes as one.
    case 'contacts':
      return { contactIds: mapOptionsToIds(values.contacts) };
    default:
      return null;
  }
};

const buildChangedPreregistrationSettings = (
  field: string,
  values: PublishingFormData
): NotePreregistrationSettingsDraft | null => {
  switch (field) {
    case 'budget': {
      const goalAmount = readDraftAmount(values.budget);
      return goalAmount === null ? null : { goalAmount, goalCurrency: FUNDING_CURRENCY };
    }
    case 'fundraiseEndDays':
      return { durationDays: Number(values.fundraiseEndDays ?? DEFAULT_FUNDRAISE_END_DAYS) };
    case 'isPublic':
      return { isPublic: values.isPublic ?? null };
    default:
      return null;
  }
};

/**
 * What one changed field saves. Settings fields follow the note's own type,
 * never the locally chosen `articleType`, because the route rejects
 * `grant_settings` on a note that is not a grant and
 * `preregistration_settings` on a note that is not a preregistration — and
 * masks its reads by the same rule.
 */
const buildChangedDetails = (
  field: string,
  values: PublishingFormData,
  fundingType: NoteFundingType | null
): NoteDetailsDraft | null => {
  const shared = buildChangedSharedDetails(field, values);
  if (shared) return shared;

  if (fundingType === 'grant') {
    const grantSettings = buildChangedGrantSettings(field, values);
    return grantSettings ? { grantSettings } : null;
  }
  if (fundingType === 'preregistration') {
    const preregistrationSettings = buildChangedPreregistrationSettings(field, values);
    return preregistrationSettings ? { preregistrationSettings } : null;
  }
  return null;
};

/** Every server-owned field at once, for the one-time move out of localStorage. */
const buildMigrationDetails = (
  values: PublishingFormData,
  fundingType: NoteFundingType | null
): NoteDetailsDraft =>
  SERVER_OWNED_FIELDS.reduce<NoteDetailsDraft>((merged, field) => {
    const details = buildChangedDetails(field, values, fundingType);
    return details ? mergeNoteDetails(merged, details) : merged;
  }, {});

/**
 * The nonprofit saves itself, because only a canonical id means anything to the
 * note and a search result's prefixed Endaoment id has to be traded for one
 * first. Keeping that request out of the field mapping is what lets a control
 * mark itself dirty before the flush it goes on to trigger.
 */
const saveNonprofitDetails = async (
  nonprofit: NonprofitOrg | null,
  fundingType: NoteFundingType | null,
  saveDetails: NoteDetailsSaver['saveDetails']
) => {
  if (fundingType !== 'preregistration') return;
  if (!nonprofit) {
    saveDetails({ preregistrationSettings: { nonprofitId: null } });
    return;
  }

  try {
    // Idempotent, which is why the post-publish link can run it again.
    const { id } = await NonprofitService.createNonprofit({
      name: nonprofit.name,
      endaomentOrgId: nonprofit.endaomentOrgId,
      ein: nonprofit.ein,
      baseWalletAddress: nonprofit.baseWalletAddress,
    });
    saveDetails({ preregistrationSettings: { nonprofitId: id } });
  } catch (error) {
    console.error('Error resolving nonprofit:', error);
  }
};

/** The saved Details, which every later step may only fill gaps around. */
const populateSharedDetails = (
  note: NoteWithContent,
  setValue: (name: any, value: any) => void
) => {
  if (note.image || note.previewImage) {
    setValue('coverImage', {
      file: null,
      key: note.image ?? null,
      url: note.previewImage ?? null,
    });
  }
  if (note.topics?.length) {
    setValue(
      'topics',
      note.topics.map((topic) => ({ value: topic.id.toString(), label: topic.name }))
    );
  }
  if (note.authors?.length) {
    setValue(
      'authors',
      note.authors.map((author) => ({ value: author.authorId.toString(), label: author.name }))
    );
  }
};

/** The note's saved settings row, for whichever form its work type owns. */
const populateFundingDetails = (
  note: NoteWithContent,
  setValue: (name: any, value: any) => void
) => {
  const { grantSettings, preregistrationSettings, selectedGrant } = note;

  if (selectedGrant) {
    setValue('selectedGrant', selectedGrant);
  }
  if (grantSettings) {
    // Both amount inputs hold digits, so a `(19,2)` string arrives as one.
    if (grantSettings.amount) setValue('budget', parseBudget(grantSettings.amount).toString());
    if (grantSettings.organization) setValue('organization', grantSettings.organization);
    if (grantSettings.description) setValue('shortDescription', grantSettings.description);
    if (grantSettings.applicationVisibility) {
      setValue('applicationVisibility', grantSettings.applicationVisibility);
    }
    if (grantSettings.contacts.length) {
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
    if (goalAmount) setValue('budget', parseBudget(goalAmount).toString());
    if (durationDays) setValue('fundraiseEndDays', durationDays.toString());
    if (isPublic != null) setValue('isPublic', isPublic);
    if (nonprofit) setValue('selectedNonprofit', nonprofit);
  }
};

/** Whether this browser still holds pre-cutover Details the note row now owns. */
const hasStoredServerDetails = (stored: Partial<PublishingFormData> | null): boolean =>
  stored != null && SERVER_OWNED_FIELDS.some((field) => field in stored);

/**
 * The prefill's bare ids, for the gaps `populateSharedDetails` left. Its
 * populated topics and authors already reach the form through `note`.
 */
const populateRegisteredReportPrefill = (
  note: NoteWithContent,
  getValues: (name: any) => any,
  setValue: (name: any, value: any) => void
) => {
  const { topicIds = [], authorIds = [] } = note.registeredReportPrefill ?? {};

  if (topicIds.length > 0 && getValues('topics').length === 0) {
    setValue(
      'topics',
      topicIds.map((id) => ({ value: id.toString(), label: `Topic ${id}` }))
    );
  }

  if (authorIds.length > 0 && getValues('authors').length === 0) {
    setValue(
      'authors',
      authorIds.map((id) => ({ value: id.toString(), label: `Author ${id}` }))
    );
  }
};

const restoreFromStorage = (
  data: Record<string, any>,
  setValue: (name: any, value: any) => void
) => {
  for (const [key, value] of Object.entries(data)) {
    setValue(key, key === 'applicationDeadline' && value ? new Date(value) : value);
  }
};

const applyGrantDefaults = (getValues: any, setValue: (name: any, value: any) => void) => {
  if (getValues('articleType') === 'grant') {
    setValue('applicationDeadline', new Date('2029-12-31'));
  }
};

const autoAddCurrentUser = (
  getValues: any,
  setValue: (name: any, value: any) => void,
  currentUser: any
) => {
  const articleType = getValues('articleType');
  if (!currentUser || articleType === 'registered_report') return;

  const isGrant = articleType === 'grant';
  const field = isGrant ? 'contacts' : 'authors';

  if (getValues(field).length === 0) {
    const profile = currentUser.authorProfile;
    setValue(field, [
      {
        value: isGrant
          ? currentUser.id.toString()
          : profile?.id?.toString() || currentUser.id.toString(),
        label: currentUser.fullName || currentUser.email || 'Unknown User',
      },
    ]);
  }
};

const resolveArticleType = (
  params: { get(key: string): string | null } | null
): PublishingFormData['articleType'] | null => {
  if (params?.get('newFunding') === 'true') return 'preregistration';
  if (params?.get('newChangelog') === 'true') return 'discussion';
  if (params?.get('newGrant') === 'true') return 'grant';

  const template = params?.get('template');
  if (template === 'preregistration') return 'preregistration';
  if (template === 'grant') return 'grant';
  return null;
};

const getRedirectPath = (articleType: string, responseId: string, slug: string): string => {
  if (articleType === 'preregistration') return `/proposal/${responseId}/${slug}?new=true`;
  if (articleType === 'grant')
    return buildWorkUrl({ id: responseId, slug, contentType: 'funding_request' });
  if (articleType === 'registered_report') return buildRegisteredReportUrl(responseId, slug);
  return `/post/${responseId}/${slug}`;
};

export function PublishingForm({
  bountyAmount,
  onBountyClick,
  readOnly = false,
  detailsSaver,
  saveContentNow,
}: Readonly<PublishingFormProps>) {
  const { currentNote: note, editor } = useNotebookContext();
  const { user: currentUser } = useUser();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [{ loading: isUploadingImage }, uploadAsset] = useAssetUpload();
  const { linkNonprofitToFundraise, isLoading: isLinkingNonprofit } = useNonprofitLink();
  const [showNonprofitConfirmModal, setShowNonprofitConfirmModal] = useState(false);

  const methods = useForm<PublishingFormData>({
    defaultValues: FORM_DEFAULTS,
    resolver: zodResolver(publishingFormSchema),
    mode: 'onChange',
  });

  const noteId = note?.id;
  const isPublished = Boolean(note?.post);
  const fundingType = resolveFundingType(note?.documentType);
  const { saveDetails, flushDetails, markPublished } = detailsSaver;

  // Hydration runs before the autosave subscription below resubscribes, so
  // seeding the form never schedules a save of what it just read. That holds
  // only while these deps stay a subset of the subscription's: React runs
  // every cleanup before any effect body, but it skips the ones whose deps
  // did not change.
  useEffect(() => {
    if (!note) return;

    methods.reset(FORM_DEFAULTS);
    const isRegisteredReport = isRegisteredReportNote(note);
    let storedData: Partial<PublishingFormData> | null = null;

    if (note.post) {
      populateFromPost(note.post, methods.setValue);
    } else {
      populateSharedDetails(note, methods.setValue);
      populateFundingDetails(note, methods.setValue);

      if (isRegisteredReport) {
        populateRegisteredReportPrefill(note, methods.getValues, methods.setValue);
      }

      storedData = loadPublishingFormFromStorage(note.id.toString());
      if (storedData) {
        restoreFromStorage(storedData, methods.setValue);
      }

      const articleType =
        storedData?.articleType ??
        (note.documentType ? mapDocumentTypeToArticleType(note.documentType) : null) ??
        resolveArticleType(searchParams);

      if (articleType) {
        methods.setValue('articleType', articleType);
      }
    }

    if (isRegisteredReport) {
      methods.setValue('articleType', 'registered_report');
    }

    applyGrantDefaults(methods.getValues, methods.setValue);
    autoAddCurrentUser(methods.getValues, methods.setValue, currentUser);

    const pending = getPendingGrant();
    if (pending) {
      methods.setValue('selectedGrant', pending);
      clearPendingGrant();
      // The choice was made on another page, so hydration is the only moment
      // that can make it durable.
      saveDetails({ selectedGrantId: pending.id });
    }

    // A saved choice can predate the current RFP, and the publisher rejects a
    // public proposal on a private one.
    if (methods.getValues('selectedGrant')?.applicationVisibility === 'PRIVATE') {
      methods.setValue('isPublic', false);
    }

    const persistLocalDraft = () =>
      savePublishingFormToStorage(
        note.id.toString(),
        methods.getValues() as Partial<PublishingFormData>
      );

    if (hasStoredServerDetails(storedData)) {
      // Migrate this browser's copy once, and only drop it once the server
      // has taken everything.
      const values = methods.getValues();
      saveDetails(buildMigrationDetails(values, fundingType));
      void saveNonprofitDetails(values.selectedNonprofit, fundingType, saveDetails)
        .then(flushDetails)
        .then((saved) => {
          if (saved) persistLocalDraft();
        });
    } else {
      persistLocalDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  useEffect(() => {
    if (!noteId) return;

    const subscription = methods.watch((data, { name }) => {
      savePublishingFormToStorage(noteId.toString(), data as Partial<PublishingFormData>);

      // A published note answers 409 to every Details field, so it keeps its
      // values in the publish request alone.
      if (isPublished || !name) return;

      const values = methods.getValues();
      if (name === 'selectedNonprofit') {
        void saveNonprofitDetails(values.selectedNonprofit, fundingType, saveDetails);
        return;
      }

      const details = buildChangedDetails(name, values, fundingType);
      if (details) saveDetails(details);
    });

    return () => subscription.unsubscribe();
  }, [noteId, methods, isPublished, saveDetails, fundingType]);

  const { watch, clearErrors } = methods;
  const articleType = watch('articleType');
  const workId = watch('workId');
  const selectedNonprofit = watch('selectedNonprofit');

  const [{ isLoading: isLoadingUpsert }, upsertPost] = useUpsertPost();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPublishInProgress, setIsPublishInProgress] = useState(false);
  const router = useRouter();

  const isDeclined = note?.post?.grant?.status === 'DECLINED';
  const isModerator = !!currentUser?.isModerator;
  const isChangelog = isChangelogNote(note);
  const isNewPreprint = articleType === 'discussion' && !workId && !isChangelog;
  const canPublishChangelog = !isChangelog || isModerator;
  const isPublishing =
    isPublishInProgress ||
    isLoadingUpsert ||
    isRedirecting ||
    isLinkingNonprofit ||
    isUploadingImage;
  const canPublishRegisteredReport = articleType !== 'registered_report' || isModerator;
  const isPublicValue = watch('isPublic');
  const selectedGrantValue = watch('selectedGrant');
  const isLockedPrivate = selectedGrantValue?.applicationVisibility === 'PRIVATE';
  const showPrivateWarning = !isLockedPrivate && isPublicValue === false && !selectedGrantValue;

  useEffect(() => {
    clearErrors();
  }, [articleType, clearErrors]);

  const handlePublishClick = async () => {
    if (readOnly) return;

    if (isNewPreprint) {
      toast.error('Preprints can no longer be created in the notebook.');
      return;
    }

    if (!canPublishRegisteredReport) {
      toast.error('Only moderators can publish Registered Reports.');
      return;
    }

    const result = await methods.trigger();

    if (!result) {
      const errors = methods.formState.errors;

      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, error]) => {
          const errorMessage = getFieldErrorMessage(error, `Invalid ${field}`);
          if (errorMessage) {
            toast.error(errorMessage, {
              style: { width: '300px' },
            });
          }
        });
      } else {
        toast.error('Unable to publish. Please check all fields and try again.', {
          style: { width: '300px' },
        });
      }
      return;
    }

    if (
      articleType !== 'preregistration' &&
      articleType !== 'discussion' &&
      articleType !== 'grant' &&
      articleType !== 'registered_report'
    ) {
      return;
    }

    if (selectedNonprofit) {
      setShowNonprofitConfirmModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleNonprofitConfirm = () => {
    setShowNonprofitConfirmModal(false);
    setShowConfirmModal(true);
  };

  const uploadCoverImage = async (formData: PublishingFormData): Promise<string | null | false> => {
    const needsImage =
      formData.articleType === 'preregistration' ||
      formData.articleType === 'grant' ||
      formData.articleType === 'registered_report';
    if (!needsImage) return null;

    // The cover normally uploaded when it was selected; only a selection still
    // in flight is left to send.
    const file = formData.coverImage?.file;
    if (!file) return formData.coverImage?.key ?? null;

    try {
      const result = await uploadAsset(file, 'post');
      return result.objectKey;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return false;
    }
  };

  const tryLinkNonprofit = async (
    formData: PublishingFormData,
    fundraiseId: string | number | undefined
  ): Promise<boolean> => {
    if (!formData.selectedNonprofit || !fundraiseId || formData.articleType !== 'preregistration') {
      return true;
    }

    try {
      await linkNonprofitToFundraise(
        {
          name: formData.selectedNonprofit.name,
          ein: formData.selectedNonprofit.ein,
          endaomentOrgId:
            formData.selectedNonprofit.endaomentOrgId || formData.selectedNonprofit.id,
          baseWalletAddress: formData.selectedNonprofit.baseWalletAddress,
        },
        fundraiseId,
        formData.departmentLabName || ''
      );
      return true;
    } catch (error: unknown) {
      console.error('Error linking nonprofit:', error);
      if (error instanceof Error && error.message.includes('Fundraise not found')) {
        toast.error('The fundraise was not found. Please try publishing again.');
        return false;
      }
      toast.error('Nonprofit organization was not linked successfully.');
      return true;
    }
  };

  const handleConfirmPublish = async (editedTitle: string) => {
    if (readOnly || !note || isPublishInProgress) return;

    if (isNewPreprint) {
      toast.error('Preprints can no longer be created in the notebook.');
      return;
    }

    if (!canPublishChangelog) {
      toast.error(CHANGELOG_PUBLISH_ERROR_MESSAGE);
      return;
    }

    setIsPublishInProgress(true);

    try {
      setDocumentTitle(editor, editedTitle);

      // Publish from confirmed server state. Content goes first because saving
      // it is what hands the renamed title to the Details saver.
      const contentSaved = await saveContentNow();
      const detailsSaved = await flushDetails();
      if (!contentSaved || !detailsSaved) {
        toast.error('Could not save your latest changes. Please try again.');
        return;
      }

      const text = editor?.getText();
      const json = editor?.getJSON() ?? { type: 'doc', content: [] };
      const html = editor?.getHTML();
      const formData = methods.getValues();

      if (formData.articleType === 'registered_report' && editedTitle.trim().length < 20) {
        toast.error('Registered Report titles must be at least 20 characters.');
        return;
      }

      if (formData.articleType === 'registered_report' && (text?.trim().length ?? 0) < 50) {
        toast.error('Registered Report content must be at least 50 characters.');
        return;
      }

      const imagePath = await uploadCoverImage(formData);
      if (imagePath === false) {
        setShowConfirmModal(false);
        return;
      }

      let budgetValue = '0';
      if (formData.articleType === 'preregistration' || formData.articleType === 'grant') {
        budgetValue = formData.budget || '0';
      }

      const isNewProposal = formData.articleType === 'preregistration' && !formData.workId;
      const grantId = isNewProposal ? (formData.selectedGrant?.id ?? null) : null;
      const proposalId = note.proposalId;

      if (formData.articleType === 'registered_report' && proposalId == null) {
        toast.error('This Registered Report draft is missing its proposal link.');
        return;
      }

      const fullJSON = JSON.stringify(
        formData.articleType === 'registered_report'
          ? mergeRegisteredReportPrefill(json, proposalId)
          : json
      );

      const response = await upsertPost(
        {
          budget: budgetValue,
          rewardFunders: formData.rewardFunders,
          nftSupply: formData.nftSupply || '1000',
          title: editedTitle,
          noteId: note.id.toString(),
          proposalId,
          renderableText: text || '',
          fullJSON,
          fullSrc: html || '',
          assignDOI: !formData.workId,
          topics: formData.topics.map((topic) => topic.value),
          authors: mapOptionsToIds(formData.authors),
          contacts: mapOptionsToIds(formData.contacts),
          articleType: ARTICLE_TYPE_API_MAP[formData.articleType] ?? 'DISCUSSION',
          image: imagePath,
          previewImg:
            formData.articleType === 'registered_report' && !formData.coverImage?.file
              ? (formData.coverImage?.url ?? note.previewImage ?? null)
              : undefined,
          editorType: formData.articleType === 'registered_report' ? 'CK_EDITOR' : undefined,
          organization: formData.organization,
          description: formData.shortDescription,
          applicationDeadline: (() => {
            if (formData.articleType === 'grant') return new Date('2029-12-31');
            if (isNewProposal) {
              const days = parseInt(formData.fundraiseEndDays ?? DEFAULT_FUNDRAISE_END_DAYS, 10);
              const date = new Date();
              date.setDate(date.getDate() + days);
              return date;
            }
            return formData.applicationDeadline;
          })(),
          grantId,
          applicationVisibility:
            formData.articleType === 'grant' ? formData.applicationVisibility : undefined,
          isPublic: isNewProposal ? formData.isPublic : undefined,
        },
        formData.workId
      );

      // The note now has a post, which rejects every shared field. Draining the
      // queue is not enough — a timer armed a moment ago would still carry them.
      markPublished();

      const fundraiseId = response.fundraiseId || note?.post?.fundraise?.id || undefined;
      const linked = await tryLinkNonprofit(formData, fundraiseId);
      if (!linked) {
        setIsRedirecting(false);
        setShowConfirmModal(false);
        return;
      }

      setIsRedirecting(true);
      const publishLabel = isChangelog
        ? 'ChangeLog'
        : (PUBLISH_LABEL[formData.articleType] ?? 'Post');
      const isNewGrant = formData.articleType === 'grant' && !formData.workId;
      const isNewGrantPending = isNewGrant && response.note?.post?.grant?.status !== 'OPEN';

      if (isNewGrantPending) {
        toast.success(
          'Your Request for Proposal has been submitted and is pending moderator review.',
          {
            duration: 5000,
          }
        );
      } else if (!isNewGrant && response.moderationStatus === 'PENDING') {
        toast.success(`Your ${publishLabel} has been submitted and is pending moderator review.`, {
          duration: 5000,
        });
      } else {
        toast.success(`${publishLabel} published successfully!`);
      }
      router.push(getRedirectPath(formData.articleType, String(response.id), response.slug));
    } catch (error: unknown) {
      const fallback = 'Error publishing. Please try again.';
      if (
        error instanceof ApiError &&
        articleType === 'registered_report' &&
        (error.status === 401 || error.status === 403)
      ) {
        toast.error('Only moderators can publish Registered Reports.');
      } else if (error instanceof ApiError) {
        const errorData = error.errors as Record<string, any> | undefined;
        toast.error(
          errorData?.msg || errorData?.message || extractApiErrorMessage(error, fallback)
        );
      } else {
        toast.error(fallback);
      }
      console.error('Error publishing:', error);
    } finally {
      setIsPublishInProgress(false);
      setShowConfirmModal(false);
    }
  };

  if (!note) {
    return <PublishingFormSkeleton />;
  }

  return (
    <FormProvider {...methods}>
      <div className="flex w-full flex-col bg-white relative h-full">
        {isPublishing && (
          <div className="absolute inset-0 bg-white/50 z-50 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-2" />
            {isLinkingNonprofit && (
              <p className="text-sm text-gray-600">Linking nonprofit organization...</p>
            )}
          </div>
        )}

        <div
          className={cn(
            'flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 relative',
            isRedirecting ? 'overflow-hidden' : 'overflow-y-auto',
            isDeclined && 'pointer-events-none opacity-60'
          )}
        >
          <fieldset
            disabled={readOnly}
            className={cn(
              'm-0 mx-auto w-full max-w-2xl min-w-0 border-0 p-0 pb-6',
              readOnly && 'pointer-events-none opacity-60'
            )}
          >
            {!articleType ? (
              <div className="px-4 py-5 lg:px-6">
                <h3 className="text-sm font-semibold text-gray-900">Select work type</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose how you want to publish this note.
                </p>
                <div className="mt-4 space-y-2">
                  {PUBLISHING_FORM_WORK_TYPES.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant="outlined"
                      onClick={() =>
                        methods.setValue('articleType', option.value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className="h-auto w-full justify-start border-gray-200 px-4 py-3 text-left hover:border-primary-300 hover:bg-primary-50 focus-visible:ring-primary-500"
                    >
                      <span>
                        <span className="block text-sm font-medium text-gray-900">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-xs font-normal text-gray-500">
                          {option.description}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {(articleType === 'preregistration' ||
                  articleType === 'grant' ||
                  articleType === 'registered_report') && <WorkImageSection />}
                {articleType === 'grant' && (
                  <>
                    <GrantDescriptionSection />
                    <GrantOrganizationSection />
                  </>
                )}
                {articleType === 'grant' ? <ContactsSection /> : <AuthorsSection />}
                <TopicsSection />
                {note.post?.doi && (
                  <div className="py-3 px-6 space-y-6">
                    <DOISection doi={note.post.doi} />
                  </div>
                )}
                {articleType === 'grant' && <GrantFundingAmountSection />}
                {articleType === 'grant' && <GrantApplicationVisibilitySection />}
                {articleType === 'preregistration' && (
                  <FundingSection note={note} flushDetails={flushDetails} />
                )}
                {articleType === 'preregistration' && !workId && (
                  <div className="py-3 px-6">
                    <EndDateSection />
                  </div>
                )}
                {articleType === 'preregistration' && !workId && <PreregistrationPrivacySection />}
                {FEATURE_FLAG_RESEARCH_COIN &&
                  articleType !== 'preregistration' &&
                  articleType !== 'grant' && (
                    <ResearchCoinSection
                      bountyAmount={bountyAmount ?? null}
                      onBountyClick={onBountyClick ?? (() => {})}
                    />
                  )}
              </>
            )}
          </fieldset>
        </div>

        <div className="border-t bg-white p-2 lg:p-6 sticky bottom-0">
          <div className="mx-auto w-full max-w-2xl space-y-3">
            {articleType === 'preregistration' && !workId && <PreregistrationPrivacyLockedAlert />}
            {articleType === 'registered_report' && !canPublishRegisteredReport && (
              <p className="text-sm text-red-600">
                Only moderators can publish Registered Reports.
              </p>
            )}
            {!canPublishChangelog && (
              <p className="text-sm text-red-600">{CHANGELOG_PUBLISH_ERROR_MESSAGE}</p>
            )}
            <Button
              variant="default"
              onClick={handlePublishClick}
              className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !articleType ||
                readOnly ||
                isNewPreprint ||
                !canPublishChangelog ||
                isPublishing ||
                isDeclined ||
                showPrivateWarning ||
                !canPublishRegisteredReport
              }
            >
              {readOnly
                ? 'Published'
                : getButtonText({
                    isLoadingUpsert: isLoadingUpsert || isUploadingImage,
                    isRedirecting,
                    isLinkingNonprofit,
                    hasWorkId: Boolean(workId),
                  })}
            </Button>
          </div>
        </div>
      </div>

      {showNonprofitConfirmModal && selectedNonprofit && (
        <NonprofitConfirmModal
          isOpen={showNonprofitConfirmModal}
          onClose={() => setShowNonprofitConfirmModal(false)}
          onConfirm={handleNonprofitConfirm}
          nonprofitName={selectedNonprofit.name}
          ein={selectedNonprofit.ein}
        />
      )}

      {showConfirmModal && (
        <ConfirmPublishModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmPublish}
          title={
            getDocumentTitleFromEditor(editor) ||
            (isChangelog ? 'Untitled ChangeLog' : 'Untitled Research')
          }
          isPublishing={isPublishing}
          isUpdate={Boolean(workId)}
          onTitleChange={(title) => setDocumentTitle(editor, title)}
          variant={articleType === 'grant' ? 'rfp' : 'default'}
          documentLabel={isChangelog ? 'ChangeLog entry' : undefined}
          zIndex={100}
        />
      )}
    </FormProvider>
  );
}
