import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publishingFormSchema } from './schema';
import type { PublishingFormData } from './schema';
import { WorkTypeSection } from './components/WorkTypeSection';
import { FundingSection } from './components/FundingSection';
import { AuthorsSection } from './components/AuthorsSection';
import { TopicsSection } from './components/TopicsSection';
import { JournalSection } from './components/JournalSection';
import { Button } from '@/components/ui/Button';
import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUpsertPost, UpsertPostResult } from '@/hooks/useDocument';
import { ConfirmPublishModal } from '@/components/modals/ConfirmPublishModal';
import {
  getDocumentTitleFromEditor,
  removeTitleFromHTML,
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
import { NonprofitSearchSection } from './components/NonprofitSearchSection';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { useNonprofitLink } from '@/hooks/useNonprofitLink';
import { useNonprofitByFundraiseId } from '@/hooks/useNonprofitByFundraiseId';
import { NonprofitOrg, NonprofitDeployment, NonprofitAddress } from '@/types/nonprofit';
import { Work } from '@/types/work';
import { ID } from '@/types/root';

interface PublishingFormProps {
  bountyAmount: number | null;
  onBountyClick: () => void;
}

const getButtonText = ({
  isLoadingUpsert,
  isRedirecting,
  articleType,
  isJournalEnabled,
  hasWorkId,
}: {
  isLoadingUpsert: boolean;
  isRedirecting: boolean;
  articleType: string;
  isJournalEnabled: boolean;
  hasWorkId: boolean;
}) => {
  switch (true) {
    case isLoadingUpsert:
      return 'Publishing...';
    case isRedirecting:
      return 'Redirecting...';
    case hasWorkId:
      return 'Re-publish';
    case articleType === 'discussion' && isJournalEnabled:
      return 'Pay & Publish';
    default:
      return 'Publish';
  }
};

// Add interfaces for the nonprofit API response
interface NonprofitDetails {
  id: string | number;
  name: string;
  ein: string;
  endaoment_org_id: string;
  base_wallet_address?: string;
  created_date?: string;
  updated_date?: string;
}

interface NonprofitLink {
  id: string | number;
  nonprofit: string | number;
  nonprofit_details: NonprofitDetails;
  fundraise: string | number;
  note: string;
  created_date: string;
  updated_date: string;
}

export function PublishingForm({ bountyAmount, onBountyClick }: PublishingFormProps) {
  const { currentNote: note, editor } = useNotebookContext();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    nonprofit,
    departmentLabName,
    isLoading: isLoadingNonprofitData,
    fetchNonprofitData,
  } = useNonprofitByFundraiseId(
    note?.post?.contentType === 'preregistration' ? note?.post?.fundraise?.id : undefined
  );
  const { isLoading: isLoadingNonprofitLink, linkNonprofitToFundraise } = useNonprofitLink();

  const methods = useForm<PublishingFormData>({
    defaultValues: {
      authors: [],
      topics: [],
      rewardFunders: false,
      nftSupply: '1000',
      isJournalEnabled: false,
      budget: '',
      departmentLabName: '',
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
        topics: [],
        rewardFunders: false,
        nftSupply: '1000',
        isJournalEnabled: false,
        budget: '',
        departmentLabName: '',
      });
    }
  }, [note?.id, methods]);

  // Fetch nonprofit data if this is a published preregistration
  useEffect(() => {
    if (
      !note?.post?.id ||
      note.post.contentType !== 'preregistration' ||
      !note.post.fundraise?.id
    ) {
      return;
    }

    fetchNonprofitData(note.post.fundraise.id);
  }, [note?.post?.id, note?.post?.contentType, note?.post?.fundraise?.id, fetchNonprofitData]);

  // Set nonprofit data in form when it's loaded
  useEffect(() => {
    if (nonprofit) {
      methods.setValue('selectedNonprofit', nonprofit);
      methods.setValue('departmentLabName', departmentLabName);
    }
  }, [nonprofit, departmentLabName, methods]);

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
        note.post.contentType === 'preregistration' ? 'preregistration' : 'discussion'
      );
      methods.setValue('budget', note.post.fundraise?.goalAmount.usd.toString());
      if (note.post.topics && note.post.topics.length > 0) {
        const topicOptions = note.post.topics.map((topic) => ({
          value: topic.id.toString(),
          label: topic.name,
        }));
        methods.setValue('topics', topicOptions);
      }

      // Set other relevant post data
      return;
    }

    // Priority 2: Check localStorage
    const storedData = loadPublishingFormFromStorage(note?.id.toString() || '');
    if (storedData) {
      Object.entries(storedData).forEach(([key, value]) => {
        methods.setValue(key as keyof PublishingFormData, value);
      });
    }

    // Priority 3: Check URL params
    const isNewFunding = searchParams?.get('newFunding') === 'true';
    const template = searchParams?.get('template');

    if (!note?.post && !storedData) {
      if (isNewFunding) {
        methods.setValue('articleType', 'preregistration');
      } else if (template) {
        const articleType = template === 'preregistration' ? 'preregistration' : 'discussion';
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
  const [{ isLoading: isLoadingUpsert }, upsertPost] = useUpsertPost();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  // Reset form errors when article type changes
  useEffect(() => {
    clearErrors();
  }, [articleType, clearErrors]);

  const handlePublishClick = async () => {
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

    if (articleType !== 'preregistration') {
      console.log('Publishing clicked for type:', articleType);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmPublish = async () => {
    try {
      const text = editor?.getText();
      const json = editor?.getJSON();
      const html = editor?.getHTML();
      const previewContent = removeTitleFromHTML(html || '');
      const title = getDocumentTitleFromEditor(editor);
      const formData = methods.getValues();

      // Store the existing fundraiseId for use in case the API response doesn't include it
      const existingFundraiseId = note?.post?.fundraise?.id;

      // Get the correct endaoment_org_id from the nonprofit data
      const endaomentOrgId = (formData.selectedNonprofit as any)?.endaoment_org_id;

      const response = await upsertPost(
        {
          budget: formData.budget || '0',
          rewardFunders: formData.rewardFunders,
          nftSupply: formData.nftSupply || '1000',
          title,
          noteId: note?.id.toString(),
          renderableText: text || '',
          fullJSON: JSON.stringify(json),
          fullSrc: previewContent || '',
          assignDOI: formData.workId ? false : true,
          topics: formData.topics.map((topic) => topic.value),
        },
        formData.workId
      );

      // Use the fundraiseId from the response, or fallback to the existing one if undefined
      const fundraiseId = response.fundraiseId || existingFundraiseId;

      // If there's a selected nonprofit and a fundraiseId is available (from response or existing)
      if (formData.selectedNonprofit && fundraiseId) {
        try {
          // Always use the endaoment_org_id if available to ensure we're linking to the correct nonprofit
          const linkPayload = {
            name: formData.selectedNonprofit.name,
            endaoment_org_id: endaomentOrgId || formData.selectedNonprofit.id,
            ein: formData.selectedNonprofit.ein,
            base_wallet_address: formData.selectedNonprofit.baseWalletAddress,
          };

          await linkNonprofitToFundraise(
            linkPayload,
            fundraiseId,
            formData.departmentLabName || `Linked from preregistration ${response.id}`
          );
        } catch (error) {
          console.error('Error linking nonprofit:', error);
          // Continue with redirect even if nonprofit linking fails
        }
      }

      setIsRedirecting(true);
      router.push(`/fund/${response.id}/${response.slug}`);
    } catch (error) {
      console.error('Error in publish process:', error);
      toast.error('Error publishing. Please try again.');
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
        {(isLoadingUpsert || isRedirecting || isLoadingNonprofitData) && (
          <div className="absolute inset-0 bg-white/50 z-50 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-2" />
          </div>
        )}

        {/* Scrollable content - conditionally disable scrolling */}
        <div
          className={`flex-1 ${isRedirecting ? 'overflow-hidden' : 'overflow-y-auto'} scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 relative`}
        >
          <div className="pb-6">
            <WorkTypeSection />

            {articleType === 'preregistration' && (
              <>
                <FundingSection note={note} />
                <NonprofitSearchSection />
              </>
            )}

            <AuthorsSection />
            <TopicsSection />

            {note.post?.doi && (
              <div className="py-3 px-6 space-y-6">
                <DOISection doi={note.post.doi} />
              </div>
            )}

            {articleType !== 'preregistration' && (
              <ResearchCoinSection bountyAmount={bountyAmount} onBountyClick={onBountyClick} />
            )}

            {articleType === 'discussion' && <JournalSection />}
          </div>
        </div>

        {/* Sticky bottom section */}
        <div className="border-t bg-white p-2 lg:p-6 space-y-3 sticky bottom-0">
          {articleType === 'discussion' && isJournalEnabled && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment due:</span>
              <span className="font-medium text-gray-900">$1,000 USD</span>
            </div>
          )}
          <Button
            variant="default"
            onClick={handlePublishClick}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoadingUpsert || isRedirecting || isLoadingNonprofitData}
          >
            {getButtonText({
              isLoadingUpsert,
              isRedirecting,
              articleType,
              isJournalEnabled: isJournalEnabled ?? false,
              hasWorkId: Boolean(methods.watch('workId')),
            })}
          </Button>
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmPublishModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmPublish}
          title={getDocumentTitleFromEditor(editor) || 'Untitled Research'}
          isPublishing={isLoadingUpsert || isRedirecting}
          isUpdate={Boolean(methods.watch('workId'))}
        />
      )}
    </FormProvider>
  );
}
