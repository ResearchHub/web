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
import { PostService } from '@/services/post.service';
import { NoteService } from '@/services/note.service';
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

interface GrantPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: number;
  onSaved?: () => void;
}

export function GrantPublishModal({ isOpen, onClose, postId, onSaved }: GrantPublishModalProps) {
  const isEditMode = !!postId;
  const isMobile = useIsMobile();
  const { selectedOrg } = useOrganizationContext();

  const [editor, setEditor] = useState<Editor | null>(null);
  const [noteId, setNoteId] = useState<number | null>(null);
  const [contentJson, setContentJson] = useState<string | null>(null);
  const [contentHtml, setContentHtml] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [step, setStep] = useState<'editor' | 'form'>('editor');

  const methods = useForm<PublishingFormData>({
    defaultValues: GRANT_FORM_DEFAULTS,
    resolver: zodResolver(publishingFormSchema),
    mode: 'onChange',
  });

  const [, createNote] = useCreateNote();
  const [, updateNoteContent] = useNoteContent();

  // Create mode: create a blank note pre-filled with the grant template
  useEffect(() => {
    if (isEditMode || !isOpen || !selectedOrg?.slug || noteId) return;

    const init = async () => {
      setIsInitializing(true);
      setInitError(null);
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

          await updateNoteContent({
            note: newNote.id,
            fullJson: JSON.stringify(grantTemplate),
            plainText,
          });

          setNoteId(newNote.id);
        }
      } catch (err) {
        console.error('Failed to create note:', err);
        setInitError('Failed to initialize. Please try again.');
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [isEditMode, isOpen, selectedOrg?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Edit mode: fetch existing work + note content and prepopulate form
  useEffect(() => {
    if (!isEditMode || !isOpen || !postId) return;

    let cancelled = false;

    const load = async () => {
      setIsInitializing(true);
      setInitError(null);
      setContentJson(null);
      setContentHtml(null);
      setNoteId(null);
      setStep('editor');

      try {
        const work = await PostService.get(String(postId));
        if (cancelled) return;

        const workNoteId = work.note?.id;
        if (!workNoteId) {
          setInitError('This grant has no associated note.');
          return;
        }

        const note = await NoteService.getNote(String(workNoteId));
        if (cancelled) return;

        setNoteId(workNoteId);

        if (work.previewContent) {
          setContentHtml(work.previewContent);
        } else if (note.contentJson) {
          setContentJson(note.contentJson);
        } else if (note.content) {
          setContentHtml(note.content);
        }

        const grant = work.note?.post?.grant;
        if (grant) {
          methods.setValue('shortDescription', grant.description || '');
          methods.setValue('organization', grant.organization || '');
          methods.setValue('budget', grant.amount?.usd?.toString() || '');

          if (grant.contacts?.length) {
            methods.setValue(
              'contacts',
              grant.contacts.map((c) => ({
                value: c.id.toString(),
                label: c.authorProfile?.fullName || c.name,
              }))
            );
          }
        }

        if (work.topics?.length) {
          methods.setValue(
            'topics',
            work.topics.map((t) => ({ value: t.id.toString(), label: t.name }))
          );
        }

        if (work.image) {
          methods.setValue('coverImage', { url: work.image, file: null });
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load grant:', err);
          setInitError('Failed to load RFP. Please try again.');
        }
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, isOpen, postId]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    saveNoteContent,
    handlePublishClick,
    handleConfirmPublish,
    isProcessing,
    isPublishing,
    showConfirmModal,
    setShowConfirmModal,
  } = useGrantPublish({ editor, noteId, methods, postId, onSuccess: onSaved });

  const handleGoToForm = useCallback(() => {
    setStep('form');
    saveNoteContent().catch((err) => console.error('Auto-save failed:', err));
  }, [saveNoteContent]);

  const handleClose = useCallback(() => {
    if (isProcessing) return;
    editor?.destroy();
    onClose();
  }, [isProcessing, editor, onClose]);

  // Reset all state when modal closes
  useEffect(() => {
    if (isOpen) return;
    setEditor(null);
    setNoteId(null);
    setContentJson(null);
    setContentHtml(null);
    setIsInitializing(true);
    setInitError(null);
    setStep('editor');
    methods.reset(GRANT_FORM_DEFAULTS);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const headerTitle = isEditMode ? 'Edit RFP' : 'Create RFP';
  const actionLabel = isEditMode ? 'Update' : 'Publish';
  const formStepTitle = isEditMode ? 'Update Details' : 'Publish Details';
  const loadingMessage = isEditMode ? 'Loading RFP...' : 'Setting up your RFP...';

  const hasEditContent = !!(contentJson || contentHtml);
  const editorContentJson = isEditMode && !contentHtml ? (contentJson ?? undefined) : undefined;
  const editorContentHtml = isEditMode ? (contentHtml ?? undefined) : undefined;
  const templateJson = !isEditMode ? JSON.stringify(grantTemplate) : undefined;
  const isEditorReady = noteId && (isEditMode ? hasEditContent : true);

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
                onClick={handleClose}
                disabled={isProcessing}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-base font-semibold text-gray-900">{headerTitle}</h2>
              <Button
                variant="default"
                size="sm"
                onClick={handleGoToForm}
                disabled={isProcessing || isInitializing || !noteId}
              >
                <FileUp className="w-4 h-4 mr-1.5" />
                {actionLabel}
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
              <h2 className="text-base font-semibold text-gray-900">{formStepTitle}</h2>
              {isMobile ? (
                <div className="w-16" />
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePublishClick}
                  disabled={isProcessing}
                >
                  {actionLabel}
                </Button>
              )}
            </>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <FormProvider {...methods}>
            <div className={`h-full overflow-y-auto ${step === 'editor' ? 'block' : 'hidden'}`}>
              {isInitializing ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-sm text-gray-500">{loadingMessage}</p>
                </div>
              ) : initError ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
                  <p className="text-sm text-red-500">{initError}</p>
                  <Button variant="outlined" size="sm" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              ) : isEditorReady ? (
                <div className="max-w-4xl mx-auto pl-0 pr-4 py-2 sm:p-4 md:p-8">
                  <NotePaper
                    minHeight="600px"
                    className="pl-4 sm:pl-8 lg:pl-16 rounded-none sm:rounded-lg"
                  >
                    <BlockEditor
                      content={editorContentHtml}
                      contentJson={editorContentJson || templateJson}
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
              {actionLabel}
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
