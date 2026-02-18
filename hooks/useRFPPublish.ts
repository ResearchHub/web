'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@tiptap/core';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { useUpsertPost } from '@/hooks/useDocument';
import { useAssetUpload } from '@/hooks/useAssetUpload';
import { NoteService } from '@/services/note.service';
import { getDocumentTitleFromEditor } from '@/components/Editor/lib/utils/documentTitle';
import { ApiError } from '@/services/types';
import { getFieldErrorMessage } from '@/utils/form';
import type { PublishingFormData } from '@/app/notebook/components/PublishingForm/schema';
import type { ID } from '@/types/root';
import { RFP_DEADLINE, DEFAULT_RFP_TITLE } from '@/components/RFP/lib/constants';

interface UseRFPPublishParams {
  editor: Editor | null;
  noteId: number | null;
  methods: UseFormReturn<PublishingFormData>;
  /** When provided, the publish call becomes an update (re-publish). */
  postId?: ID;
}

export function useRFPPublish({ editor, noteId, methods, postId }: UseRFPPublishParams) {
  const router = useRouter();
  const [{ isLoading: isLoadingUpsert }, upsertPost] = useUpsertPost();
  const [{ loading: isUploadingImage }, uploadAsset] = useAssetUpload();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isUpdate = !!postId;
  const isPublishing = isLoadingUpsert || isUploadingImage;
  const isProcessing = isPublishing || isRedirecting;

  // Save editor content + title to the backend note
  const saveNoteContent = useCallback(async () => {
    if (!editor || !noteId) return;
    const title = getDocumentTitleFromEditor(editor) || DEFAULT_RFP_TITLE;
    await Promise.all([
      NoteService.updateNoteTitle({ noteId, title }),
      NoteService.updateNoteContent({
        note: noteId,
        full_src: editor.getHTML() || '',
        plain_text: editor.getText() || '',
        full_json: JSON.stringify(editor.getJSON()),
      }),
    ]);
  }, [editor, noteId]);

  // Validate form -> toast errors -> show confirm modal
  const handlePublishClick = async () => {
    const isValid = await methods.trigger();
    if (!isValid) {
      Object.entries(methods.formState.errors).forEach(([field, error]) => {
        if (field === 'articleType' || field === 'applicationDeadline') return;
        const message = getFieldErrorMessage(error);
        if (message) toast.error(message, { style: { width: '300px' } });
      });
      return;
    }
    setShowConfirmModal(true);
  };

  // Full publish flow: save note -> upload image -> upsert post -> redirect
  const handleConfirmPublish = async () => {
    if (!editor || !noteId) return;

    try {
      const title = getDocumentTitleFromEditor(editor);
      const formData = methods.getValues();

      await saveNoteContent();

      // Upload cover image if provided
      let imagePath: string | null = null;
      if (formData.coverImage?.file) {
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

      const response = await upsertPost(
        {
          budget: formData.budget || '0',
          rewardFunders: false,
          nftSupply: '1000',
          title,
          noteId: noteId.toString(),
          renderableText: editor.getText() || '',
          fullJSON: JSON.stringify(editor.getJSON()),
          fullSrc: editor.getHTML() || '',
          assignDOI: !isUpdate,
          topics: formData.topics.map((t) => t.value),
          authors: [],
          contacts: formData.contacts.map((c) => Number(c.value)).filter((id) => !isNaN(id)),
          articleType: 'GRANT',
          image: imagePath,
          organization: formData.organization,
          description: formData.shortDescription,
          applicationDeadline: RFP_DEADLINE,
        },
        postId
      );

      setIsRedirecting(true);
      toast.success(isUpdate ? 'RFP updated successfully!' : 'RFP published successfully!');
      router.push(`/grant/${response.id}/${response.slug}`);
    } catch (error) {
      const status = error instanceof ApiError ? ` (${error.status})` : '';
      toast.error(`Error ${isUpdate ? 'updating' : 'publishing'} RFP${status}. Please try again.`);
      console.error('Error publishing:', error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  return {
    saveNoteContent,
    handlePublishClick,
    handleConfirmPublish,
    isProcessing,
    isPublishing,
    isUpdate,
    showConfirmModal,
    setShowConfirmModal,
  };
}
