'use client';

import { EditorContent } from '@tiptap/react';
import { useRef, useCallback, useState } from 'react';
import 'highlight.js/styles/atom-one-dark.css';
import { CommentType } from '@/types/comment';
import { useCommentEditor } from './lib/hooks/useCommentEditor';
import { useEditorHandlers } from './lib/hooks/useEditorHandlers';
import { useWordCount } from './lib/hooks/useWordCount';
import { EditorHeader } from './components/EditorHeader';
import { EditorToolbar } from './components/EditorToolbar';
import { EditorFooter } from './components/EditorFooter';
import { EditorModals } from './components/EditorModals';
import { CommentContent } from './lib/types';
import { useIsMac } from '@/hooks/useIsMac';
import { CommentEditorBanner } from './components/CommentEditorBanner';

const REVIEW_WORD_LIMIT = 2000;

export interface CommentEditorProps {
  onSubmit: (content: {
    content: CommentContent;
    rating?: number;
    sectionRatings?: Record<string, number>;
  }) => Promise<boolean | void> | void;
  onCancel?: () => void;
  onReset?: () => void;
  onUpdate?: (content: CommentContent) => void;
  onContentChange?: (plainText: string, html: string) => void;
  placeholder?: string;
  initialContent?: CommentContent;
  format?: 'json' | 'html'; // Format of initialContent
  isReadOnly?: boolean;
  commentType?: CommentType;
  initialRating?: number;
  storageKey?: string;
  compactToolbar?: boolean;
  debug?: boolean;
  autoFocus?: boolean;
  editing?: boolean;
  showFooter?: boolean;
  showHeader?: boolean;
  isBountyReply?: boolean;
  isAuthor?: boolean;
}

export const CommentEditor = ({
  onSubmit,
  onCancel,
  onReset,
  onUpdate,
  onContentChange,
  placeholder = 'Write a comment...',
  initialContent = '',
  format = 'json',
  isReadOnly = false,
  commentType = 'GENERIC_COMMENT',
  initialRating = 0,
  storageKey = 'comment-editor-draft',
  compactToolbar = false,
  debug = false,
  autoFocus = false,
  editing = false,
  showFooter = true,
  showHeader = true,
  isBountyReply = false,
  isAuthor = false,
}: CommentEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBountyReplyBannerDismissed, setIsBountyReplyBannerDismissed] = useState(false);
  const isMac = useIsMac();
  const isReview = commentType === 'REVIEW';

  // Ref to store startCooldown from render prop for use in handler
  const startCooldownRef = useRef<() => void>(() => {});

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
    onContentChange,
    placeholder,
    initialContent,
    format,
    isReadOnly,
    commentType,
    initialRating,
    storageKey,
    debug,
    autoFocus,
  });

  // Track word count for reviews
  const wordLimit = isReview ? REVIEW_WORD_LIMIT : undefined;
  const { wordCount, isOverLimit } = useWordCount({ editor, limit: wordLimit });

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
    onReviewSuccess: editing ? undefined : () => startCooldownRef.current(),
  });

  // Configure editor click handler for links and keyboard shortcuts
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
        handleKeyDown: (view, event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
            return true;
          }
          return false;
        },
      },
    });
  }

  if (!editor) return null;

  const renderEditor = (canReview: boolean, banner: React.ReactNode = null) => (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
      {/* User info header */}
      {showHeader && (
        <EditorHeader
          isReview={isReview}
          rating={rating}
          onRatingChange={setRating}
          isReadOnly={isReadOnly || editing}
          isAuthor={isAuthor}
        />
      )}

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
      <div ref={editorRef} className="relative comment-editor-content">
        {/* Review banners */}
        {banner}

        {/* Bounty reply banner */}
        {isBountyReply && !isBountyReplyBannerDismissed && (
          <div className="mb-3 flex flex-col sm:!flex-row items-start sm:!items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-2 sm:!p-3 text-xs sm:!text-sm">
            <p className="pr-0 sm:!pr-2 mb-1 sm:!mb-0">
              Use this section to ask for clarifying questions.{' '}
              <span className="font-semibold">Do not submit your bounty solution in here.</span>{' '}
              Instead, follow the instructions provided in the bounty to submit.
            </p>
            <button
              onClick={() => setIsBountyReplyBannerDismissed(true)}
              aria-label="Dismiss notice"
              className="mt-1 sm:!mt-0 inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-xs font-medium min-w-[60px]"
            >
              Got it
            </button>
          </div>
        )}

        <EditorContent editor={editor} />
      </div>

      {/* Editor footer */}
      {showFooter && (
        <EditorFooter
          saveStatus={saveStatus}
          lastSaved={lastSaved}
          formatLastSaved={formatLastSaved}
          onCancel={onCancel}
          onReset={onReset}
          onSubmit={handleSubmit}
          clearDraft={clearDraft}
          isSubmitting={isSubmitting}
          isMac={isMac}
          canSubmit={(editing || canReview) && !isOverLimit}
          wordCount={wordLimit ? wordCount : undefined}
          wordLimit={wordLimit}
        />
      )}

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

  // For reviews, wrap with CommentEditorBanner which handles loading, banners, and cooldown state
  if (isReview) {
    return (
      <CommentEditorBanner isEditing={editing}>
        {({ canReview, startCooldown, banner }) => {
          startCooldownRef.current = startCooldown;
          return renderEditor(canReview, banner);
        }}
      </CommentEditorBanner>
    );
  }

  // For non-reviews, render editor directly
  return renderEditor(true);
};
