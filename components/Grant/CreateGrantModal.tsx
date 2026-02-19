'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Editor } from '@tiptap/core';
import { X, ArrowLeft, FileUp, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotePaper } from '@/app/notebook/components/NotePaperWrapper';
import { ConfirmPublishModal } from '@/components/modals/ConfirmPublishModal';

import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useCreateNote, useNoteContent } from '@/hooks/useNote';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGrantPublish } from '@/hooks/useGrantPublish';
import {
  getDocumentTitle,
  getDocumentTitleFromEditor,
} from '@/components/Editor/lib/utils/documentTitle';
import grantTemplate from '@/components/Editor/lib/data/grantTemplate';
import {
  publishingFormSchema,
  type PublishingFormData,
} from '@/app/notebook/components/PublishingForm/schema';

import { GrantFormSections } from './GrantFormSections';
import { DEFAULT_GRANT_TITLE, GRANT_FORM_DEFAULTS } from './lib/constants';

interface CreateGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGrantModal({ isOpen, onClose }: CreateGrantModalProps) {
  const { selectedOrg } = useOrganizationContext();
  const isMobile = useIsMobile();

  const [editor, setEditor] = useState<Editor | null>(null);
  const [noteId, setNoteId] = useState<number | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [, createNote] = useCreateNote();
  const [, updateContent] = useNoteContent();

  useEffect(() => {
    if (!isOpen || !selectedOrg?.slug || noteId) return;

    const init = async () => {
      setIsCreatingNote(true);
      setNoteError(null);
      try {
        const title = getDocumentTitle(grantTemplate) || DEFAULT_GRANT_TITLE;
        const newNote = await createNote({
          organizationSlug: selectedOrg.slug,
          title,
          grouping: 'WORKSPACE',
        });

        if (newNote) {
          const plainText =
            grantTemplate.content
              ?.map((block) => block.content?.map((c) => c.text).join(' '))
              .filter(Boolean)
              .join('\n') || '';

          await updateContent({
            note: newNote.id,
            fullJson: JSON.stringify(grantTemplate),
            plainText,
          });

          setNoteId(newNote.id);
        }
      } catch (err) {
        console.error('Failed to create note:', err);
        setNoteError('Failed to initialize. Please try again.');
      } finally {
        setIsCreatingNote(false);
      }
    };

    init();
  }, [isOpen, selectedOrg?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const [step, setStep] = useState<'editor' | 'form'>('editor');

  const methods = useForm<PublishingFormData>({
    defaultValues: GRANT_FORM_DEFAULTS,
    resolver: zodResolver(publishingFormSchema),
    mode: 'onChange',
  });

  const {
    saveNoteContent,
    handlePublishClick,
    handleConfirmPublish,
    isProcessing,
    isPublishing,
    showConfirmModal,
    setShowConfirmModal,
  } = useGrantPublish({ editor, noteId, methods });

  const handleGoToForm = useCallback(() => {
    setStep('form');
    saveNoteContent().catch((err) => console.error('Auto-save failed:', err));
  }, [saveNoteContent]);

  const handleClose = isProcessing ? () => {} : onClose;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton={false}
      padding="p-0"
      className="!max-h-screen md:!max-h-[calc(100vh-2rem)] md:!rounded-2xl"
    >
      <div className="h-full flex flex-col relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          {step === 'editor' ? (
            <>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-base font-semibold text-gray-900">Create RFP</h2>
              <Button
                variant="default"
                size="sm"
                onClick={handleGoToForm}
                disabled={isProcessing || isCreatingNote || !noteId}
              >
                <FileUp className="w-4 h-4 mr-1.5" />
                Publish
              </Button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('editor')}
                disabled={isProcessing}
                className="flex items-center gap-1 p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </button>
              <h2 className="text-base font-semibold text-gray-900">Publish Details</h2>
              {isMobile ? (
                <div className="w-16" />
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePublishClick}
                  disabled={isProcessing}
                >
                  Publish
                </Button>
              )}
            </>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <FormProvider {...methods}>
            <div className={`h-full overflow-y-auto ${step === 'editor' ? 'block' : 'hidden'}`}>
              {isCreatingNote ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-sm text-gray-500">Setting up your RFP...</p>
                </div>
              ) : noteError ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
                  <p className="text-sm text-red-500">{noteError}</p>
                  <Button variant="outlined" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              ) : noteId ? (
                <div className="max-w-4xl mx-auto pl-0 pr-4 py-2 sm:p-4 md:p-8">
                  <NotePaper
                    minHeight="600px"
                    className="pl-4 sm:pl-8 lg:pl-16 rounded-none sm:rounded-lg"
                  >
                    <BlockEditor
                      contentJson={JSON.stringify(grantTemplate)}
                      isLoading={false}
                      editable={true}
                      setEditor={setEditor}
                    />
                  </NotePaper>
                </div>
              ) : null}
            </div>

            <div className={`h-full overflow-y-auto ${step === 'form' ? 'block' : 'hidden'}`}>
              <div className="max-w-lg mx-auto pb-6">
                <GrantFormSections />
              </div>
            </div>
          </FormProvider>
        </div>

        {step === 'form' && isMobile && (
          <div className="border-t bg-white p-2 flex-shrink-0">
            <Button
              variant="default"
              onClick={handlePublishClick}
              className="w-full"
              disabled={isProcessing}
            >
              Publish
            </Button>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <ConfirmPublishModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmPublish}
          title={editor ? getDocumentTitleFromEditor(editor) : DEFAULT_GRANT_TITLE}
          isPublishing={isPublishing}
          editor={editor}
          variant="rfp"
          zIndex={10000}
        />
      )}
    </BaseModal>
  );
}
