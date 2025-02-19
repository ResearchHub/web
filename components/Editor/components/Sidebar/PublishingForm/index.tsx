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
import { useCreatePost } from '@/hooks/useDocument';
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

export function PublishingForm({ bountyAmount, onBountyClick }: PublishingFormProps) {
  const { noteId, editor } = useNotebookPublish();

  const methods = useForm<PublishingFormData>({
    defaultValues: {
      articleType: 'research',
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

  // Load stored data after component mounts
  useEffect(() => {
    if (noteId) {
      const data = loadPublishingFormFromStorage(noteId.toString());
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          methods.setValue(
            key as keyof PublishingFormData,
            key === 'budget' ? parseFloat(value.toString()) || 0 : value
          );
        });
      }
    }
  }, [noteId, methods]);

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
  const [{ isLoading: isLoadingCreatePost }, createPreregistrationPost] = useCreatePost();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const isNewFunding = searchParams?.get('newFunding') === 'true';

  useEffect(() => {
    if (isNewFunding) {
      setValue('articleType', 'preregistration');
    }
  }, [isNewFunding, setValue]);

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

      const response = await createPreregistrationPost({
        budget: formData.budget.toString(),
        rewardFunders: formData.rewardFunders || false,
        nftArt: formData.nftArt || null,
        nftSupply: formData.nftSupply || '1000',
        title,
        noteId: noteId,
        renderableText: text || '',
        fullJSON: JSON.stringify(json),
        fullSrc: html || '',
      });

      router.push(`/fund/${response.id}/${response.slug}`);
    } catch (error) {
      toast.error('Error publishing. Please try again.');
      console.error('Error publishing:', error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  if (!noteId) {
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

            {articleType === 'preregistration' && <FundingSection />}
            {articleType !== 'preregistration' && (
              <ResearchCoinSection bountyAmount={bountyAmount} onBountyClick={onBountyClick} />
            )}
            {articleType === 'research' && <JournalSection />}
          </div>
        </div>

        {/* Sticky bottom section */}
        <div className="border-t bg-white p-6 space-y-3 sticky bottom-0">
          {articleType === 'research' && isJournalEnabled && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment due:</span>
              <span className="font-medium text-gray-900">$1,000 USD</span>
            </div>
          )}
          <Button variant="default" onClick={handlePublishClick} className="w-full">
            {isLoadingCreatePost
              ? 'Publishing...'
              : articleType === 'research' && isJournalEnabled
                ? 'Pay & Publish'
                : 'Publish'}
          </Button>
        </div>
      </div>

      <ConfirmPublishModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPublish}
        title={getDocumentTitleFromEditor(editor) || 'Untitled Research'}
        isPublishing={isLoadingCreatePost}
      />
    </FormProvider>
  );
}
