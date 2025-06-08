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
import { GrantApplicationDeadlineSection } from './components/GrantApplicationDeadlineSection';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUpsertPost } from '@/hooks/useDocument';
import { ConfirmPublishModal } from '@/components/modals/ConfirmPublishModal';
import { getDocumentTitleFromEditor } from '@/components/Editor/lib/utils/documentTitle';
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

// Feature flags for conditionally showing sections
const FEATURE_FLAG_RESEARCH_COIN = false;
const FEATURE_FLAG_JOURNAL = false;

interface PublishingFormProps {
  bountyAmount: number | null;
  onBountyClick: () => void;
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

export function PublishingForm({ bountyAmount, onBountyClick }: PublishingFormProps) {
  const { currentNote: note, editor } = useNotebookContext();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [{ loading: isUploadingImage }, uploadAsset] = useAssetUpload();
  const { linkNonprofitToFundraise, isLoading: isLinkingNonprofit } = useNonprofitLink();
  const [showNonprofitConfirmModal, setShowNonprofitConfirmModal] = useState(false);

  const methods = useForm<PublishingFormData>({
    defaultValues: {
      authors: [],
      topics: [],
      rewardFunders: false,
      nftSupply: '1000',
      isJournalEnabled: false,
      budget: '',
      selectedNonprofit: null,
      departmentLabName: '',
      shortDescription: '',
      organization: '',
      applicationDeadline: null,
    },
    resolver: zodResolver(publishingFormSchema),
    mode: 'onChange',
  });

  // Reset form when switching between notes
  useEffect(() => {
    if (note?.id) {
      // Reset form to default values when switching notes
      methods.reset({
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
      });
    }
  }, [note?.id, methods]);

  // Load data with priority:
  // 1. note.post data
  // 2. localStorage data
  // 3. URL search params
  useEffect(() => {
    if (!note) return;

    // Priority 1: Check for existing post data
    if (note?.post) {
      methods.setValue('workId', note.post.id.toString());
      methods.setValue(
        'articleType',
        note.post.contentType === 'preregistration'
          ? 'preregistration'
          : note.post.contentType === 'funding_request'
            ? 'grant'
            : 'discussion'
      );

      // Set budget fields based on article type
      if (note.post.contentType === 'preregistration') {
        methods.setValue('budget', note.post.fundraise?.goalAmount.usd.toString());
      }

      // Set application deadline for grants
      if (note.post.contentType === 'funding_request' && note.post.grant?.endDate) {
        const deadline = new Date(note.post.grant.endDate);
        methods.setValue('applicationDeadline', deadline);
      }

      if (note.post.contentType === 'funding_request' && note.post.grant?.description) {
        methods.setValue('shortDescription', note.post.grant.description);
      }

      if (note.post.contentType === 'funding_request' && note.post.grant?.organization) {
        methods.setValue('organization', note.post.grant.organization);
      }

      if (note.post.contentType === 'funding_request' && note.post.grant?.amount) {
        methods.setValue('budget', note.post.grant.amount.usd.toString());
      }

      if (
        note.post.contentType === 'funding_request' &&
        note.post.grant?.contacts &&
        note.post.grant.contacts.length > 0
      ) {
        const contactOptions = note.post.grant.contacts.map((contact) => ({
          value: contact.id.toString(),
          label: contact.authorProfile?.fullName || contact.name,
        }));
        methods.setValue('contacts', contactOptions);
      }

      if (note.post.image) {
        methods.setValue('coverImage', {
          file: null,
          url: note.post.image,
        });
      }

      if (note.post.topics && note.post.topics.length > 0) {
        const topicOptions = note.post.topics.map((topic) => ({
          value: topic.id.toString(),
          label: topic.name,
        }));
        methods.setValue('topics', topicOptions);
      }

      if (note.post.authors && note.post.authors.length > 0) {
        const authorOptions = note.post.authors.map((author) => ({
          value: author.authorId.toString(),
          label: author.name,
        }));
        methods.setValue('authors', authorOptions);
      }

      // Set other relevant post data
      return;
    }

    // Priority 2: Check localStorage
    const storedData = loadPublishingFormFromStorage(note?.id.toString() || '');
    if (storedData) {
      Object.entries(storedData).forEach(([key, value]) => {
        if (key === 'applicationDeadline') {
          methods.setValue(key as keyof PublishingFormData, new Date(value));
        } else {
          methods.setValue(key as keyof PublishingFormData, value);
        }
      });
    }

    // Priority 3: Check URL params
    const isNewFunding = searchParams?.get('newFunding') === 'true';
    const isNewResearch = searchParams?.get('newResearch') === 'true';
    const template = searchParams?.get('template');

    if (!note?.post && !storedData) {
      if (isNewFunding) {
        methods.setValue('articleType', 'preregistration');
      } else if (isNewResearch) {
        methods.setValue('articleType', 'discussion');
      } else if (template) {
        const articleType =
          template === 'preregistration'
            ? 'preregistration'
            : template === 'grant'
              ? 'grant'
              : 'discussion';
        methods.setValue('articleType', articleType);
      }
    }
  }, [note, methods, searchParams]);

  // Add effect to save form data when it changes
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

  // Reset form errors when article type changes
  useEffect(() => {
    clearErrors();
  }, [articleType, clearErrors]);

  const handlePublishClick = async () => {
    console.log('handlePublishClick');
    console.log(methods.getValues());
    const result = await methods.trigger();

    if (!result) {
      const errors = methods.formState.errors;

      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, error]) => {
          // Cast the error to any to bypass the type checking issue
          const errorMessage = getFieldErrorMessage(error, `Invalid ${field}`);
          if (errorMessage) {
            toast.error(errorMessage, {
              style: { width: '300px' },
            });
          }
        });

        // Log errors to console for debugging
        console.error('Form validation errors:', errors);
      } else {
        // Should never happen but wondering if we should log this somewhere for visibility
        console.error('Unable to publish.');
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
      console.log('Publishing clicked for type:', articleType);
      return;
    }

    // If nonprofit is selected, show the nonprofit confirmation first
    if (selectedNonprofit) {
      setShowNonprofitConfirmModal(true);
    } else {
      // Otherwise show the regular publish confirmation
      setShowConfirmModal(true);
    }
  };

  const handleNonprofitConfirm = () => {
    setShowNonprofitConfirmModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmPublish = async () => {
    try {
      const text = editor?.getText();
      const json = editor?.getJSON();
      const html = editor?.getHTML();
      const previewContent = html;
      const title = getDocumentTitleFromEditor(editor);
      const formData = methods.getValues();

      // Initialize imageUrl variable
      let imagePath = null;

      // Upload the image for preregistration and grant posts
      if (
        (formData.articleType === 'preregistration' || formData.articleType === 'grant') &&
        formData.coverImage?.file
      ) {
        try {
          const uploadResult = await uploadAsset(formData.coverImage.file, 'post');
          imagePath = uploadResult.objectKey;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error('Failed to upload image. Please try again.');
          setShowConfirmModal(false);
          return;
        }
      }
      // Get the fundraiseId from the existing post if it exists (for updates)
      const existingFundraiseId = note?.post?.fundraise?.id;

      // Determine the budget value based on article type
      let budgetValue = '0';
      if (formData.articleType === 'preregistration' || formData.articleType === 'grant') {
        budgetValue = formData.budget || '0';
      }

      const response = await upsertPost(
        {
          budget: budgetValue,
          rewardFunders: formData.rewardFunders,
          nftSupply: formData.nftSupply || '1000',
          title,
          noteId: note?.id.toString(),
          renderableText: text || '',
          fullJSON: JSON.stringify(json),
          fullSrc: previewContent || '',
          assignDOI: formData.workId ? false : true,
          topics: formData.topics.map((topic) => topic.value),
          authors: formData.authors
            .map((author) => author.value)
            .map(Number)
            .filter((id) => !isNaN(id)),
          contacts: formData.contacts
            .map((contact) => contact.value)
            .map(Number)
            .filter((id) => !isNaN(id)),
          articleType: (() => {
            switch (formData.articleType) {
              case 'preregistration':
                return 'PREREGISTRATION';
              case 'grant':
                return 'GRANT';
              default:
                return 'DISCUSSION';
            }
          })(),
          image: imagePath,
          organization: formData.organization,
          description: formData.shortDescription,
          applicationDeadline: formData.applicationDeadline,
        },
        formData.workId
      );

      // If a nonprofit is selected, link it to the fundraise (only for preregistration)
      const fundraiseId = response.fundraiseId || existingFundraiseId;

      if (formData.selectedNonprofit && fundraiseId && formData.articleType === 'preregistration') {
        try {
          // Create the nonprofit and link it to the fundraise using consistent camelCase naming
          const nonprofitData = {
            name: formData.selectedNonprofit.name,
            ein: formData.selectedNonprofit.ein,
            endaomentOrgId:
              formData.selectedNonprofit.endaomentOrgId || formData.selectedNonprofit.id,
            baseWalletAddress: formData.selectedNonprofit.baseWalletAddress,
          };

          await linkNonprofitToFundraise(
            nonprofitData,
            fundraiseId,
            formData.departmentLabName || ''
          );
        } catch (error: unknown) {
          console.error('Error linking nonprofit:', error);

          // Handle specific error for "Fundraise not found"
          if (error instanceof Error && error.message.includes('Fundraise not found')) {
            toast.error('The fundraise was not found. Please try publishing again.');
            setIsRedirecting(false);
            setShowConfirmModal(false);
            return; // Don't proceed with redirect
          }

          // Don't block the redirect if the nonprofit linking fails
          toast.error('Nonprofit organization was not linked successfully.');
        }
      }

      setIsRedirecting(true);

      if (formData.articleType === 'preregistration') {
        router.push(`/fund/${response.id}/${response.slug}`);
      } else if (formData.articleType === 'grant') {
        router.push(`/grant/${response.id}/${response.slug}`);
      } else {
        router.push(`/post/${response.id}/${response.slug}`);
      }
    } catch (error) {
      toast.error('Error publishing. Please try again.');
      console.error('Error publishing:', error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  // Show skeleton while note is loading
  if (!note) {
    return <PublishingFormSkeleton />;
  }

  return (
    <FormProvider {...methods}>
      <div className="w-82 flex flex-col sticky right-0 top-0 bg-white relative h-[calc(100vh-64px)] lg:h-screen">
        {/* Processing overlay */}
        {(isLoadingUpsert || isRedirecting || isLinkingNonprofit || isUploadingImage) && (
          <div className="absolute inset-0 bg-white/50 z-50 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-2" />
            {isLinkingNonprofit && (
              <p className="text-sm text-gray-600">Linking nonprofit organization...</p>
            )}
          </div>
        )}

        {/* Scrollable content - conditionally disable scrolling */}
        <div
          className={`flex-1 ${isRedirecting ? 'overflow-hidden' : 'overflow-y-auto'} scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 relative`}
        >
          <div className="pb-6">
            <WorkTypeSection />
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
            {articleType === 'grant' && <GrantApplicationDeadlineSection />}
            {articleType === 'preregistration' && <FundingSection note={note} />}
            {FEATURE_FLAG_RESEARCH_COIN &&
              articleType !== 'preregistration' &&
              articleType !== 'grant' && (
                <ResearchCoinSection bountyAmount={bountyAmount} onBountyClick={onBountyClick} />
              )}
            {FEATURE_FLAG_JOURNAL && articleType === 'discussion' && <JournalSection />}
          </div>
        </div>

        {/* Sticky bottom section */}
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
            disabled={isLoadingUpsert || isRedirecting || isLinkingNonprofit || isUploadingImage}
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
          isPublishing={isLoadingUpsert || isRedirecting || isUploadingImage}
          isUpdate={Boolean(methods.watch('workId'))}
        />
      )}
    </FormProvider>
  );
}
