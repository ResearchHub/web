'use client';

import { EditorContent } from '@tiptap/react';
import { useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import 'highlight.js/styles/atom-one-dark.css';
import { CommentType } from '@/types/comment';
import { useCommentEditor } from './lib/hooks/useCommentEditor';
import { useEditorHandlers } from './lib/hooks/useEditorHandlers';
import { EditorHeader } from './components/EditorHeader';
import { EditorToolbar } from './components/EditorToolbar';
import { EditorFooter } from './components/EditorFooter';
import { EditorModals } from './components/EditorModals';
import { CommentContent } from './lib/types';

export interface CommentEditorProps {
  onSubmit: (content: {
    content: CommentContent;
    rating?: number;
    sectionRatings?: Record<string, number>;
  }) => Promise<boolean | void> | void;
  onCancel?: () => void;
  onReset?: () => void;
  onUpdate?: (content: CommentContent) => void;
  placeholder?: string;
  initialContent?: CommentContent;
  isReadOnly?: boolean;
  commentType?: CommentType;
  initialRating?: number;
  storageKey?: string;
  compactToolbar?: boolean;
  debug?: boolean;
  autoFocus?: boolean;
}

export const CommentEditor = ({
  onSubmit,
  onCancel,
  onReset,
  onUpdate,
  placeholder = 'Write a comment...',
  initialContent = '',
  isReadOnly = false,
  commentType = 'GENERIC_COMMENT',
  initialRating = 0,
  storageKey = 'comment-editor-draft',
  compactToolbar = false,
  debug = false,
  autoFocus = false,
}: CommentEditorProps) => {
  const { data: session, status } = useSession();
  const editorRef = useRef<HTMLDivElement>(null);

  // Debug session information
  useEffect(() => {
    console.log('CommentEditor - Session Status:', status);
    console.log('CommentEditor - Session Data:', session);
  }, [session, status]);

  // Adapt the onSubmit function to the format expected by useEditorHandlers
  const adaptedOnSubmit = useCallback(
    async ({
      content,
      rating,
      sectionRatings,
    }: {
      content: CommentContent;
      rating?: number;
      sectionRatings?: Record<string, number>;
    }) => {
      return onSubmit({
        content,
        rating,
        sectionRatings,
      });
    },
    [onSubmit]
  );

  // Initialize the editor with our custom hook
  const {
    editor,
    isReview,
    rating,
    sectionRatings,
    setRating,
    setSectionRatings,
    lastSaved,
    saveStatus,
    formatLastSaved,
    clearDraft,
    contentRef,
  } = useCommentEditor({
    onSubmit: adaptedOnSubmit,
    onUpdate,
    placeholder,
    initialContent,
    isReadOnly,
    commentType,
    initialRating,
    storageKey,
    debug,
    autoFocus,
  });

  // Initialize the editor handlers with our custom hook
  const {
    isSubmitting,
    isImageModalOpen,
    setIsImageModalOpen,
    isLinkModalOpen,
    setIsLinkModalOpen,
    linkMenuPosition,
    setLinkMenuPosition,
    selectedLink,
    setSelectedLink,
    handleSubmit,
    handleLinkAdd,
    handleLinkSave,
    handleImageEmbed,
    handleAddReviewCategory,
    handleLinkClick,
  } = useEditorHandlers({
    editor,
    onSubmit: adaptedOnSubmit,
    isReview,
    rating,
    sectionRatings,
    clearDraft,
    setRating,
    setSectionRatings,
  });

  // Configure editor click handler for links
  if (editor && !isReadOnly) {
    editor.setOptions({
      editorProps: {
        ...editor.options.editorProps,
        handleClick: (view, pos, event) => {
          if (isReadOnly) {
            const mention = (event.target as HTMLElement).closest('[data-type="mention"]');
            if (mention && mention instanceof HTMLAnchorElement) {
              event.preventDefault();
              window.location.href = mention.href;
              return true;
            }
            return false;
          }

          const link = (event.target as HTMLElement).closest('a');
          if (link) {
            event.preventDefault();
            const rect = link.getBoundingClientRect();
            setLinkMenuPosition({ x: rect.left, y: rect.bottom + window.scrollY });
            setSelectedLink({ url: link.href, text: link.textContent || '' });
            return true;
          } else {
            setLinkMenuPosition(null);
            setSelectedLink(null);
            return false;
          }
        },
      },
    });
  }

  if (!editor) return null;

  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
      {/* User info header */}
      <EditorHeader
        isReview={isReview}
        rating={rating}
        onRatingChange={setRating}
        isReadOnly={isReadOnly}
      />

      {/* Editor toolbar */}
      <EditorToolbar
        editor={editor}
        onLinkAdd={handleLinkAdd}
        onImageAdd={() => setIsImageModalOpen(true)}
        onAddReviewCategory={handleAddReviewCategory}
        isReview={isReview}
        isReadOnly={isReadOnly}
        compactToolbar={compactToolbar}
      />

      {/* Editor content */}
      <div ref={editorRef} className="relative">
        <EditorContent editor={editor} />
      </div>

      {/* Editor footer */}
      <EditorFooter
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        formatLastSaved={formatLastSaved}
        onCancel={onCancel}
        onReset={onReset}
        onSubmit={handleSubmit}
        clearDraft={clearDraft}
        isSubmitting={isSubmitting}
      />

      {/* Modals */}
      <EditorModals
        editor={editor}
        isImageModalOpen={isImageModalOpen}
        setIsImageModalOpen={setIsImageModalOpen}
        isLinkModalOpen={isLinkModalOpen}
        setIsLinkModalOpen={setIsLinkModalOpen}
        linkMenuPosition={linkMenuPosition}
        setLinkMenuPosition={setLinkMenuPosition}
        selectedLink={selectedLink}
        setSelectedLink={setSelectedLink}
        handleImageEmbed={handleImageEmbed}
        handleLinkSave={handleLinkSave}
      />
    </div>
  );
};
