import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publishingFormSchema } from './schema';
import type { PublishingFormData } from './schema';
import { WorkTypeSection } from './components/WorkTypeSection';
import { WorkImageSection } from './components/WorkImageSection';
import { FundingSection } from './components/FundingSection';
import { AuthorsSection } from './components/AuthorsSection';
import { ContactsSection } from './components/ContactsSection';
import { TopicsSection } from './components/TopicsSection';
import { JournalSection } from './components/JournalSection';
import { GrantDescriptionSection } from './components/GrantDescriptionSection';
import { GrantOrganizationSection } from './components/GrantOrganizationSection';
import { GrantFundingAmountSection } from './components/GrantFundingAmountSection';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUpsertPost } from '@/hooks/useDocument';
import { ConfirmPublishModal } from '@/components/modals/ConfirmPublishModal';
import {
  getDocumentTitleFromEditor,
  setDocumentTitle,
} from '@/components/Editor/lib/utils/documentTitle';
import { ResearchCoinSection } from './components/ResearchCoinSection';
import { toast } from 'react-hot-toast';
import {
  loadPublishingFormFromStorage,
  savePublishingFormToStorage,
} from '@/components/Editor/lib/utils/publishingFormStorage';
import { PublishingFormSkeleton } from '@/components/skeletons/PublishingFormSkeleton';
import { Loader2 } from 'lucide-react';
import { DOISection } from '@/components/work/components/DOISection';
import { getFieldErrorMessage } from '@/utils/form';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useAssetUpload } from '@/hooks/useAssetUpload';
import { useNonprofitLink } from '@/hooks/useNonprofitLink';
import { NonprofitConfirmModal } from '@/components/Nonprofit';
import { ApiError } from '@/services/types';
import { ARTICLE_TYPE_API_MAP } from '@/services/post.service';

const FEATURE_FLAG_RESEARCH_COIN = false;
const FEATURE_FLAG_JOURNAL = false;

const PUBLISH_LABEL: Record<string, string> = {
  preregistration: 'Proposal',
  grant: 'Grant',
};

interface PublishingFormProps {
  bountyAmount?: number | null;
  onBountyClick?: () => void;
  defaultArticleType?: string;
  isModal?: boolean;
}

const getButtonText = ({
  isLoadingUpsert,
  isRedirecting,
  isLinkingNonprofit,
  articleType,
  isJournalEnabled,
  hasWorkId,
}: {
  isLoadingUpsert: boolean;
  isRedirecting: boolean;
  isLinkingNonprofit: boolean;
  articleType: string;
  isJournalEnabled: boolean;
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
    case Boolean(FEATURE_FLAG_JOURNAL && articleType === 'discussion' && isJournalEnabled):
      return 'Pay & Publish';
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
  isJournalEnabled: false,
  budget: '',
  coverImage: null,
  selectedNonprofit: null,
  departmentLabName: '',
  shortDescription: '',
  organization: '',
  applicationDeadline: null,
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
};

const populateFromPost = (post: any, setValue: (name: any, value: any) => void) => {
  setValue('workId', post.id.toString());
  setValue('articleType', mapContentTypeToArticleType(post.contentType));

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

const restoreFromStorage = (
  data: Record<string, any>,
  setValue: (name: any, value: any) => void
) => {
  for (const [key, value] of Object.entries(data)) {
    setValue(key, key === 'applicationDeadline' ? new Date(value) : value);
  }
};

interface ArticleTypeResult {
  type: PublishingFormData['articleType'];
  source: 'searchParam' | 'template' | 'default';
}

const resolveArticleType = (
  params: { get(key: string): string | null } | null,
  defaultArticleType?: string
): ArticleTypeResult | null => {
  if (params?.get('newFunding') === 'true')
    return { type: 'preregistration', source: 'searchParam' };
  if (params?.get('newResearch') === 'true') return { type: 'discussion', source: 'searchParam' };
  if (params?.get('newGrant') === 'true') return { type: 'grant', source: 'searchParam' };

  const template = params?.get('template');
  if (template === 'preregistration') return { type: 'preregistration', source: 'template' };
  if (template === 'grant') return { type: 'grant', source: 'template' };
  if (template) return { type: 'discussion', source: 'template' };

  if (defaultArticleType) {
    return { type: defaultArticleType as PublishingFormData['articleType'], source: 'default' };
  }
  return null;
};

const getRedirectPath = (articleType: string, responseId: string, slug: string): string => {
  if (articleType === 'preregistration') return `/fund/${responseId}/${slug}?new=true`;
  if (articleType === 'grant') return `/grant/${responseId}/${slug}`;
  return `/post/${responseId}/${slug}`;
};

export function PublishingForm({
  bountyAmount,
  onBountyClick,
  defaultArticleType,
  isModal,
}: Readonly<PublishingFormProps>) {
  const { currentNote: note, editor } = useNotebookContext();
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

  useEffect(() => {
    if (note?.id) {
      const initialType = note.documentType
        ? mapDocumentTypeToArticleType(note.documentType)
        : undefined;
      methods.reset({
        ...FORM_DEFAULTS,
        ...(initialType ? { articleType: initialType } : {}),
      });
    }
  }, [note?.id, methods]);

  useEffect(() => {
    if (!note) return;

    if (note.post) {
      populateFromPost(note.post, methods.setValue);
      return;
    }

    if (note.documentType) {
      const mapped = mapDocumentTypeToArticleType(note.documentType);
      if (mapped) {
        methods.setValue('articleType', mapped);
      }
    }

    const storedData = loadPublishingFormFromStorage(note.id.toString());
    if (storedData) {
      const { articleType: _storedType, ...otherStoredData } = storedData;
      if (note.documentType) {
        restoreFromStorage(otherStoredData, methods.setValue);
      } else {
        restoreFromStorage(storedData, methods.setValue);
      }
    } else {
      const resolved = resolveArticleType(searchParams, defaultArticleType);
      if (resolved) {
        methods.setValue('articleType', resolved.type);
      }
    }
  }, [note, methods, searchParams, defaultArticleType]);

  useEffect(() => {
    if (!note) return;

    const subscription = methods.watch((data) => {
      savePublishingFormToStorage(note.id.toString(), data as Partial<PublishingFormData>);
    });

    return () => subscription.unsubscribe();
  }, [methods, note]);

  const { watch, clearErrors } = methods;
  const articleType = watch('articleType');
  const isJournalEnabled = watch('isJournalEnabled');
  const selectedNonprofit = watch('selectedNonprofit');

  const [{ isLoading: isLoadingUpsert }, upsertPost] = useUpsertPost();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const isPublishing = isLoadingUpsert || isRedirecting || isLinkingNonprofit || isUploadingImage;

  useEffect(() => {
    clearErrors();
  }, [articleType, clearErrors]);

  const handlePublishClick = async () => {
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
      articleType !== 'grant'
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
      formData.articleType === 'preregistration' || formData.articleType === 'grant';
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
    try {
      setDocumentTitle(editor, editedTitle);

      const text = editor?.getText();
      const json = editor?.getJSON();
      const html = editor?.getHTML();
      const formData = methods.getValues();

      const imagePath = await uploadCoverImage(formData);
      if (imagePath === false) {
        setShowConfirmModal(false);
        return;
      }

      let budgetValue = '0';
      if (formData.articleType === 'preregistration' || formData.articleType === 'grant') {
        budgetValue = formData.budget || '0';
      }

      const response = await upsertPost(
        {
          budget: budgetValue,
          rewardFunders: formData.rewardFunders,
          nftSupply: formData.nftSupply || '1000',
          title: editedTitle,
          noteId: note?.id.toString(),
          renderableText: text || '',
          fullJSON: JSON.stringify(json),
          fullSrc: html || '',
          assignDOI: !formData.workId,
          topics: formData.topics.map((topic) => topic.value),
          authors: formData.authors
            .map((author) => author.value)
            .map(Number)
            .filter((id) => !Number.isNaN(id)),
          contacts: formData.contacts
            .map((contact) => contact.value)
            .map(Number)
            .filter((id) => !Number.isNaN(id)),
          articleType: ARTICLE_TYPE_API_MAP[formData.articleType] ?? 'DISCUSSION',
          image: imagePath,
          organization: formData.organization,
          description: formData.shortDescription,
          applicationDeadline:
            formData.articleType === 'grant'
              ? new Date('2029-12-31')
              : formData.applicationDeadline,
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
      toast.success(`${PUBLISH_LABEL[formData.articleType] ?? 'Post'} published successfully!`);
      router.push(getRedirectPath(formData.articleType, String(response.id), response.slug));
    } catch (error: unknown) {
      const fallback = 'Error publishing. Please try again.';
      if (error instanceof ApiError) {
        const errorData = error.errors as Record<string, any> | undefined;
        toast.error(errorData?.msg || errorData?.message || fallback);
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
      <div className="w-82 flex flex-col sticky right-0 top-0 bg-white relative h-full">
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
            isRedirecting ? 'overflow-hidden' : 'overflow-y-auto'
          )}
        >
          <div className="pb-6">
            {!isModal && <WorkTypeSection />}
            {(articleType === 'preregistration' || articleType === 'grant') && <WorkImageSection />}
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
            {articleType === 'preregistration' && <FundingSection note={note} />}
            {FEATURE_FLAG_RESEARCH_COIN &&
              articleType !== 'preregistration' &&
              articleType !== 'grant' && (
                <ResearchCoinSection
                  bountyAmount={bountyAmount ?? null}
                  onBountyClick={onBountyClick ?? (() => {})}
                />
              )}
            {FEATURE_FLAG_JOURNAL && articleType === 'discussion' && <JournalSection />}
          </div>
        </div>

        <div className="border-t bg-white p-2 lg:p-6 space-y-3 sticky bottom-0">
          {FEATURE_FLAG_JOURNAL && articleType === 'discussion' && isJournalEnabled && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment due:</span>
              <span className="font-medium text-gray-900">$1,000 USD</span>
            </div>
          )}
          <Button
            variant="default"
            onClick={handlePublishClick}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPublishing}
          >
            {getButtonText({
              isLoadingUpsert: isLoadingUpsert || isUploadingImage,
              isRedirecting,
              isLinkingNonprofit,
              articleType,
              isJournalEnabled: isJournalEnabled ?? false,
              hasWorkId: Boolean(methods.watch('workId')),
            })}
          </Button>
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
          title={getDocumentTitleFromEditor(editor) || 'Untitled Research'}
          isPublishing={isPublishing}
          isUpdate={Boolean(methods.watch('workId'))}
          onTitleChange={(title) => setDocumentTitle(editor, title)}
          variant={articleType === 'grant' ? 'rfp' : 'default'}
          zIndex={isModal ? 10000 : 100}
        />
      )}
    </FormProvider>
  );
}
