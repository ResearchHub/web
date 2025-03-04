import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import { useState, useEffect, useRef } from 'react';
import { ExitLinkOnSpace } from '../extensions/ExitLinkOnSpace';
import { MentionExtension } from '../MentionExtension';
import { ReviewExtension } from '../ReviewExtension';
import { parseContent } from '../commentContentUtils';
import { CommentType } from '@/types/comment';
import { useCommentDraft } from '../useCommentDraft';

// Initialize lowlight with supported languages
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);

export interface UseCommentEditorProps {
  onSubmit: (content: any) => Promise<boolean | void> | void;
  onUpdate?: (content: any) => void;
  placeholder?: string;
  initialContent?: string | { type: 'doc'; content: any[] } | any;
  isReadOnly?: boolean;
  commentType?: CommentType;
  initialRating?: number;
  storageKey?: string;
  debug?: boolean;
}

export const useCommentEditor = ({
  onUpdate,
  placeholder = 'Write a comment...',
  initialContent = '',
  isReadOnly = false,
  commentType = 'GENERIC_COMMENT',
  initialRating = 0,
  storageKey = 'comment-editor-draft',
  debug = false,
}: UseCommentEditorProps) => {
  const [rating, setRating] = useState(initialRating);
  const [sectionRatings, setSectionRatings] = useState<Record<string, number>>({});
  const [isFocused, setIsFocused] = useState(false);
  const contentRef = useRef<any>(null);
  const isFirstRender = useRef(true);

  const isReview = commentType === 'REVIEW';

  // Initialize the draft hook
  const { lastSaved, saveStatus, formatLastSaved, saveDraft, clearDraft, loadedContent } =
    useCommentDraft({
      storageKey,
      isReadOnly,
      initialContent,
      isReview,
      initialRating,
      onRatingLoaded: (loadedRating) => {
        setRating(loadedRating);
      },
      onSectionRatingsLoaded: (loadedSectionRatings) => {
        setSectionRatings(loadedSectionRatings);
      },
    });

  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-200 pl-4 my-4 italic text-gray-700',
          },
        },
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 cursor-pointer relative group',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      ExitLinkOnSpace,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
        languageClassPrefix: 'hljs language-',
        HTMLAttributes: {
          class: 'not-prose',
        },
      }),
      MentionExtension,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      ...(isReview
        ? [
            ReviewExtension.configure({
              rating,
              onRatingChange: setRating,
            }),
          ]
        : []),
    ],
    content: typeof initialContent === 'string' ? undefined : initialContent,
    editable: !isReadOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] px-4 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      if (!isReadOnly) {
        const json = editor.getJSON();
        contentRef.current = json;

        // Save draft using the hook
        saveDraft(json, rating, sectionRatings);

        // Call the original onUpdate if provided
        if (onUpdate) {
          onUpdate({
            content: json,
            rating: isReview ? rating : undefined,
          });
        }
      }
    },
    onFocus: () => {
      setIsFocused(true);
    },
    onBlur: () => {
      setIsFocused(false);
    },
    immediatelyRender: false,
  });

  // Set initial content if provided or load from localStorage
  useEffect(() => {
    if (!editor || isReadOnly) return;

    // Only run this effect once after editor is initialized
    if (isFirstRender.current) {
      isFirstRender.current = false;

      if (loadedContent && (!initialContent || initialContent === '')) {
        // Load content from localStorage
        if (debug) console.log('Loading content from localStorage:', loadedContent);
        editor.commands.setContent(loadedContent);
      } else if (initialContent) {
        // Parse the initial content to ensure it's in the correct format
        const parsedContent = parseContent(initialContent, 'TIPTAP', debug);
        if (debug)
          console.log('Setting initial content:', initialContent, 'Parsed:', parsedContent);

        // Set initial content if provided
        editor.commands.setContent(parsedContent);
      }
    }
  }, [editor, initialContent, loadedContent, isReadOnly, debug]);

  // Update draft when rating changes, but only if content exists
  useEffect(() => {
    if (editor && !isReadOnly && isReview && contentRef.current) {
      saveDraft(contentRef.current, rating, sectionRatings);
    }
  }, [rating, sectionRatings]); // Removed dependencies that could cause loops

  // Add a useEffect to ensure editor is properly initialized
  useEffect(() => {
    if (!editor) return;

    // Force editor to update after mounting to ensure styles are applied
    const timeoutId = setTimeout(() => {
      editor.commands.focus();
      editor.commands.blur();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [editor]);

  return {
    editor,
    rating,
    setRating,
    sectionRatings,
    setSectionRatings,
    isFocused,
    isReview,
    lastSaved,
    saveStatus,
    formatLastSaved,
    saveDraft,
    clearDraft,
    contentRef,
  };
};
