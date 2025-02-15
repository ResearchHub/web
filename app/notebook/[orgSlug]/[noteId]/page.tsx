'use client';

import { useNote, useNoteContent } from '@/hooks/useNote';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useEffect, useState, useRef } from 'react';
import preregistrationTemplate from '@/components/Editor/lib/data/preregistrationTemplate';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';
import { useNotebookPublish } from '@/contexts/NotebookPublishContext';
import { debounce } from 'lodash';
import { Editor } from '@tiptap/core';
import { NoteService } from '@/services/note.service';

export default function NotePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const noteId = params?.noteId as string;
  const orgSlug = params?.orgSlug as string;
  const isNewFunding = searchParams?.get('newFunding') === 'true';
  const [showFundingModal, setShowFundingModal] = useState(false);

  const { selectedOrg } = useOrganizationContext();
  const { setArticleType, setNoteId } = useNotebookPublish();
  const [{ isLoading: isUpdating }, updateNoteContent] = useNoteContent();

  // Show funding modal and set article type when landing on a new funding note
  useEffect(() => {
    if (isNewFunding) {
      setShowFundingModal(true);
      setArticleType('preregistration');
    }
  }, [isNewFunding, setArticleType]);

  const { note, isLoading: isLoadingNote, error } = useNote(noteId);

  const titleRef = useRef<string>('');

  const debouncedRef = useRef(
    debounce((editor: Editor) => {
      const json = editor.getJSON();
      const html = editor.getHTML();

      // Extract title from the first h1 heading
      const firstHeading = json?.content?.find(
        (node) => node.type === 'heading' && node.attrs?.level === 1
      );
      const newTitle = firstHeading?.content?.[0]?.text || '';

      // Create an array of promises to execute
      const promises = [];

      // Only update title if it changed
      if (newTitle !== titleRef.current) {
        titleRef.current = newTitle;
        promises.push(
          NoteService.updateNoteTitle({
            noteId,
            title: newTitle,
          })
        );
      }

      // Always update content
      promises.push(
        updateNoteContent({
          note: noteId,
          fullSrc: html,
          plainText: editor.getText(),
          fullJson: JSON.stringify(json),
        })
      );

      // Execute all necessary updates
      Promise.all(promises).catch(console.error);
    }, 2000)
  );

  useEffect(() => {
    return () => {
      debouncedRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    setNoteId(noteId);
  }, [noteId, setNoteId]);

  // Handle organization mismatch or missing data
  if (orgSlug !== selectedOrg?.slug || !noteId) {
    return <NotebookSkeleton />;
  }

  // Handle loading states
  if (isLoadingNote) {
    return <NotebookSkeleton />;
  }

  // Handle missing note data
  if (!note) {
    // return <NotebookSkeleton />;
    throw new Error('Note not found');
  }

  // Let error boundary handle any errors
  if (error) {
    throw error;
  }

  // If the note exists but has no content, use the preregistration template
  let content = note.content;
  let contentJson = note.contentJson;

  if (!content && !contentJson) {
    const defaultTemplate = JSON.stringify(preregistrationTemplate);
    // content = defaultTemplate;
    contentJson = defaultTemplate;
  }

  return (
    <>
      <div className="h-full">
        <BlockEditor
          content={content || ''}
          contentJson={contentJson}
          isLoading={false}
          onUpdate={debouncedRef.current}
        />
      </div>

      <FundingTimelineModal isOpen={showFundingModal} onClose={() => setShowFundingModal(false)} />
    </>
  );
}
