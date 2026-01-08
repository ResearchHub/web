'use client';

import { EditorContent } from '@tiptap/react';
import { useRef, useCallback, useEffect, useState } from 'react';
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
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { useIsMac } from '@/hooks/useIsMac';
import { useReviewCooldown } from '@/hooks/useReviewCooldown';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Info } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

const ReviewCooldownTooltipContent = (
  <div className="space-y-2.5 text-left">
    <div>
      <div className="font-semibold text-sm text-gray-900 leading-tight">Review Cooldown</div>
      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
        After submitting a review, users have a 4 day cooldown period before they can submit
        another.
      </div>
    </div>
  </div>
);

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
  const [isReviewBannerDismissed, setIsReviewBannerDismissed] = useState(false);
  const [isReviewCooldownBannerDismissed, setIsReviewCooldownBannerDismissed] = useState(false);
  const [isBountyReplyBannerDismissed, setIsBountyReplyBannerDismissed] = useState(false);
  const isMac = useIsMac();
  const isMobile = useIsMobile();
  const isReview = commentType === 'REVIEW';
  const {
    canReview,
    formattedTimeRemaining,
    isLoading: isLoadingCooldown,
    startCooldown,
  } = useReviewCooldown(isReview);

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
    onReviewSuccess: editing ? undefined : startCooldown,
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

  if (isReview && isLoadingCooldown) {
    return (
      <div className="border border-gray-200 rounded-lg bg-white p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-24 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
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
        {/* Cooldown banner - shown when user cannot review yet */}
        {isReview && !editing && !canReview && !isReviewCooldownBannerDismissed && (
          <div className="mb-3 flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-800 rounded-md p-2 sm:!p-3 text-xs sm:!text-sm">
            <div className="flex items-center gap-1.5">
              <span className="flex flex-col sm:!block">
                <span>You can write a Peer Review again in</span>
                <span className="font-semibold sm:!ml-1">{formattedTimeRemaining}</span>
              </span>
              {!isMobile && (
                <Tooltip content={ReviewCooldownTooltipContent} position="top" width="w-72">
                  <Info className="h-4 w-4 text-red-600 cursor-help flex-shrink-0" />
                </Tooltip>
              )}
            </div>
            <button
              onClick={() => setIsReviewCooldownBannerDismissed(true)}
              aria-label="Dismiss notice"
              className="flex-shrink-0 inline-flex items-center px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-medium"
            >
              Got it
            </button>
          </div>
        )}

        {/* Informative banner displayed inside editing area */}
        {isReview && canReview && !isReviewBannerDismissed && (
          <div className="mb-3 flex flex-col sm:!flex-row items-start sm:!items-center justify-between bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-2 sm:!p-3 text-xs sm:!text-sm">
            <p className="pr-0 sm:!pr-2 mb-1 sm:!mb-0">
              <span className="font-semibold">Add your review.</span> Be sure to view bounty
              description in the bounties tab before reviewing.
            </p>
            <button
              onClick={() => setIsReviewBannerDismissed(true)}
              aria-label="Dismiss notice"
              className="mt-1 sm:!mt-0 inline-flex items-center px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-xs font-medium"
            >
              Got it
            </button>
          </div>
        )}

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
          canSubmit={isReview && !editing ? canReview : true}
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
};
