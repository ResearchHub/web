import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publishingFormSchema } from './schema';
import type { PublishingFormData } from './schema';
import { useNotebookPublish } from '@/contexts/NotebookPublishContext';
import { WorkTypeSection } from './components/WorkTypeSection';
import { FundingSection } from './components/FundingSection';
import { AuthorsSection } from './components/AuthorsSection';
import { TopicsSection } from './components/TopicsSection';
import { JournalSection } from './components/JournalSection';
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

interface PublishingFormProps {
  bountyAmount: number | null;
  onBountyClick: () => void;
}

const getButtonText = ({
  isLoadingUpsert,
  articleType,
  isJournalEnabled,
  hasWorkId,
}: {
  isLoadingUpsert: boolean;
  articleType: string;
  isJournalEnabled: boolean;
  hasWorkId: boolean;
}) => {
  switch (true) {
    case isLoadingUpsert:
      return 'Publishing...';
    case hasWorkId:
      return 'Re-publish';
    case articleType === 'discussion' && isJournalEnabled:
      return 'Pay & Publish';
    default:
      return 'Publish';
  }
};

export function PublishingForm({ bountyAmount, onBountyClick }: PublishingFormProps) {
  const { noteId, editor, note } = useNotebookPublish();
  const searchParams = useSearchParams();

  const methods = useForm<PublishingFormData>({
    defaultValues: {
      authors: [],
      topics: [],
      rewardFunders: false,
      nftSupply: '1000',
      isJournalEnabled: false,
      budget: '',
    },
    resolver: zodResolver(publishingFormSchema),
    mode: 'onChange',
  });

  // Load data with priority:
  // 1. note.post data
  // 2. localStorage data
  // 3. URL search params
  useEffect(() => {
    if (!noteId) return;

    // Priority 1: Check for existing post data
    if (note?.post) {
      methods.setValue('workId', note.post.id.toString());
      methods.setValue(
        'articleType',
        note.post.contentType === 'preregistration' ? 'preregistration' : 'discussion'
      );
      methods.setValue('budget', note.post.fundraise?.goalAmount.usd.toString());
      // Set other relevant post data
      return;
    }

    // Priority 2: Check localStorage
    const storedData = loadPublishingFormFromStorage(noteId.toString());
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
  }, [noteId, note, methods, searchParams]);

  // Add effect to save form data when it changes
  useEffect(() => {
    if (!noteId) return;

    const subscription = methods.watch((data) => {
      savePublishingFormToStorage(noteId.toString(), data as Partial<PublishingFormData>);
    });

    return () => subscription.unsubscribe();
  }, [methods, noteId]);

  const { watch, clearErrors, setValue } = methods;
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
      Object.entries(errors).forEach(([_, error]) => {
        if (error?.message) {
          toast.error(error.message.toString(), {
            position: 'bottom-right',
            style: { width: '300px' },
          });
        }
      });
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
      const title = getDocumentTitleFromEditor(editor);
      const formData = methods.getValues();

      const response = await upsertPost(
        {
          budget: formData.budget || '0',
          rewardFunders: formData.rewardFunders,
          nftArt: formData.nftArt || null,
          nftSupply: formData.nftSupply || '1000',
          title,
          noteId: noteId,
          renderableText: text || '',
          fullJSON: JSON.stringify(json),
          fullSrc: html || '',
          assignDOI: formData.workId ? false : true,
        },
        formData.workId
      );

      router.push(`/fund/${response.id}/${response.slug}`);
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
      <div className="w-82 border-l flex flex-col h-screen sticky right-0 top-0 bg-white">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          <div className="pb-6">
            <WorkTypeSection />
            <AuthorsSection />
            <TopicsSection />

            {articleType === 'preregistration' && <FundingSection note={note} />}
            {articleType !== 'preregistration' && (
              <ResearchCoinSection bountyAmount={bountyAmount} onBountyClick={onBountyClick} />
            )}
            {articleType === 'discussion' && <JournalSection />}
          </div>
        </div>

        {/* Sticky bottom section */}
        <div className="border-t bg-white p-6 space-y-3 sticky bottom-0">
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
            disabled={isLoadingUpsert}
          >
            {getButtonText({
              isLoadingUpsert,
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
          isPublishing={isLoadingUpsert}
          isUpdate={Boolean(methods.watch('workId'))}
        />
      )}
    </FormProvider>
  );
}
