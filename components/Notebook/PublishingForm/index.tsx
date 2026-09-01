import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publishingFormSchema } from './schema';
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
  type NoteDetailsUpdate,
  type NoteWithContent,
} from '@/types/note';
import type { NonprofitOrg } from '@/types/nonprofit';
import { NonprofitService } from '@/services/nonprofit.service';
import { useNoteDetailsSaver, type NoteDetailsSaver } from '@/hooks/useNoteDetailsSaver';
import { getAvailableNotebookWorkTypes } from '@/components/Notebook/NotebookPrimaryNavigation';

const FEATURE_FLAG_RESEARCH_COIN = false;
const DEFAULT_FUNDRAISE_END_DAYS = '60';
const CHANGELOG_PUBLISH_ERROR_MESSAGE = 'Cannot publish changelog';

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
  isPublic: true,
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

/** Both amount inputs accept digits only, so a saved `5000.00` reads back as `5000`. */
const dropZeroCents = (amount: string): string => amount.replace(/\.0+$/, '');

/** Loads the Details this draft has already saved on the server. */
const populateNoteDetails = (note: NoteWithContent, setValue: (name: any, value: any) => void) => {
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

/** Fills the gaps a Registered Report's proposal covers, which are ids without labels. */
const populateRegisteredReportPrefill = (
  note: NoteWithContent,
  getValues: (name: any) => any,
  setValue: (name: any, value: any) => void
) => {
  const { topicIds = [], authorIds = [] } = note.registeredReportPrefill ?? {};

  if (note.previewImage && !getValues('coverImage')) {
    setValue('coverImage', { file: null, url: note.previewImage });
  }

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

/** Maps one changed Details field to the update that saves it on the note. */
const buildDetailsUpdate = (
  field: string,
  values: PublishingFormData
): NoteDetailsUpdate | null => {
  const isGrant = values.articleType === 'grant';
  const isProposal = values.articleType === 'preregistration';

  switch (field) {
    case 'articleType':
      return { documentType: ARTICLE_TYPE_API_MAP[values.articleType] };
    case 'authors':
      return { authorIds: mapOptionsToIds(values.authors) };
    case 'topics':
      return { hubIds: mapOptionsToIds(values.topics) };
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
    case 'budget':
      // An empty box is a half-typed amount, not a decision to clear the saved one.
      if (!values.budget) return null;
      if (isGrant) return { grantSettings: { amount: values.budget, currency: 'USD' } };
      return isProposal
        ? { preregistrationSettings: { goalAmount: values.budget, goalCurrency: 'USD' } }
        : null;
    default:
      return null;
  }
};

/** Saves the nonprofit under the id the Note API stores, not its Endaoment one. */
const saveSelectedNonprofit = async (
  nonprofit: NonprofitOrg | null,
  saveDetailsSoon: NoteDetailsSaver['saveDetailsSoon']
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
    saveDetailsSoon({ preregistrationSettings: { nonprofitId: saved.id } });
  } catch (error) {
    console.error('Error saving selected nonprofit:', error);
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
  const { saveDetailsSoon, saveDetailsNow } = useNoteDetailsSaver(noteId);

  useEffect(() => {
    if (!note) return;

    methods.reset(FORM_DEFAULTS);
    const isRegisteredReport = isRegisteredReportNote(note);

    if (note.post) {
      populateFromPost(note.post, methods.setValue);
    } else {
      populateNoteDetails(note, methods.setValue);

      if (isRegisteredReport) {
        populateRegisteredReportPrefill(note, methods.getValues, methods.setValue);
      }

      const articleType =
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

    // A proposal answering a private Request for Proposal cannot be public.
    if (methods.getValues('selectedGrant')?.applicationVisibility === 'PRIVATE') {
      methods.setValue('isPublic', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  // Declared after the effect above so React unsubscribes before it hydrates,
  // which is what keeps loading a note from saving it straight back.
  useEffect(() => {
    if (!noteId || isPublished) return;

    const subscription = methods.watch((_values, { name }) => {
      if (!name) return;

      const values = methods.getValues();
      if (name === 'selectedNonprofit') {
        void saveSelectedNonprofit(values.selectedNonprofit, saveDetailsSoon);
        return;
      }

      const update = buildDetailsUpdate(name, values);
      if (update) saveDetailsSoon(update);
    });

    return () => subscription.unsubscribe();
  }, [noteId, isPublished, methods, saveDetailsSoon]);

  const { watch, clearErrors } = methods;
  const articleType = watch('articleType');
  const workId = watch('workId');
  const selectedNonprofit = watch('selectedNonprofit');

  const [{ isLoading: isLoadingUpsert }, upsertPost] = useUpsertPost();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const isDeclined = note?.post?.grant?.status === 'DECLINED';
  const isModerator = !!currentUser?.isModerator;
  const isChangelog = isChangelogNote(note);
  const isNewPreprint = articleType === 'discussion' && !workId && !isChangelog;
  const canPublishChangelog = !isChangelog || isModerator;
  const isPublishing = isLoadingUpsert || isRedirecting || isLinkingNonprofit || isUploadingImage;
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
    const file = needsImage ? formData.coverImage?.file : null;
    if (!file) return null;

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
    if (readOnly || !note) return;

    if (isNewPreprint) {
      toast.error('Preprints can no longer be created in the notebook.');
      return;
    }

    if (!canPublishChangelog) {
      toast.error(CHANGELOG_PUBLISH_ERROR_MESSAGE);
      return;
    }

    try {
      setDocumentTitle(editor, editedTitle);

      // Drain the queue now: publishing supersedes the draft, and the API
      // rejects Details on a published note.
      await saveDetailsNow();

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
                {articleType === 'preregistration' && <FundingSection note={note} />}
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
