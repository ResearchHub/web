import { useEditor, Content, JSONContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { CommentLink } from '../extensions/CommentLink';
import { Image } from '@tiptap/extension-image';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import { useState, useEffect, useRef } from 'react';
import { ExitLinkOnSpace } from '../extensions/ExitLinkOnSpace';
import { RichLinkExtension } from '../extensions/RichLinkExtension';
import { MentionExtension } from '../MentionExtension';
import { ReviewExtension } from '../ReviewExtension';
import { parseContent } from '../commentContentUtils';
import { normalizeRichLinks } from '../embedDoc';
import { CommentType } from '@/types/comment';
import { useCommentDraft } from '../useCommentDraft';
import { CommentContent } from '../types';

// Initialize lowlight with supported languages
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);

export interface UseCommentEditorProps {
  onUpdate?: (content: CommentContent) => void;
  onContentChange?: (plainText: string, html: string) => void;
  placeholder?: string;
  initialContent?: CommentContent;
  format?: 'json' | 'html';
  isReadOnly?: boolean;
  commentType?: CommentType;
  initialRating?: number;
  storageKey?: string;
  debug?: boolean;
  autoFocus?: boolean;
}

export const useCommentEditor = ({
  onUpdate,
  onContentChange,
  placeholder = 'Write a comment...',
  initialContent = '',
  format = 'json',
  isReadOnly = false,
  commentType = 'GENERIC_COMMENT',
  initialRating = 0,
  storageKey = 'comment-editor-draft',
  debug = false,
  autoFocus = false,
}: UseCommentEditorProps) => {
  const [rating, setRating] = useState(initialRating);
  const [sectionRatings, setSectionRatings] = useState<Record<string, number>>({});
  const [isFocused, setIsFocused] = useState(false);
  const contentRef = useRef<JSONContent | null>(null);
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

  // Convert initialContent to a format compatible with TipTap's Content type
  const getTipTapContent = (): Content | undefined => {
    // If format is HTML and initialContent is a string, return it directly
    // TipTap will parse the HTML automatically
    if (format === 'html' && typeof initialContent === 'string') {
      return initialContent as unknown as Content;
    }

    if (typeof initialContent === 'string') {
      return undefined;
    }

    // Handle different CommentContent types
    if ('type' in initialContent && initialContent.type === 'doc') {
      return initialContent as unknown as Content;
    }

    if ('content' in initialContent) {
      if ('type' in initialContent.content && initialContent.content.type === 'doc') {
        return initialContent.content as unknown as Content;
      }
      return { type: 'doc', content: initialContent.content } as unknown as Content;
    }

    return undefined;
  };

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
      // Listed before Link so its paste handler intercepts standalone URLs
      // and converts them to inline `richLink` nodes (with favicon + creator
      // + title rendering and hover preview) instead of letting Link's paste
      // rule wrap them as plain link marks.
      RichLinkExtension,
      CommentLink.configure({
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
    content: getTipTapContent(),
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
          // Use the JSON directly as CommentContent
          onUpdate(json as CommentContent);
        }

        if (onContentChange) {
          const plainText = editor.getText();
          const html = editor.getHTML();
          onContentChange(plainText, html);
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
        // Load content from localStorage. Normalize so any URLs typed into
        // a previous draft (before the rich-link extension existed) get
        // upgraded into richLink nodes when the draft is restored.
        if (debug) console.log('Loading content from localStorage:', loadedContent);
        editor.commands.setContent(normalizeRichLinks(loadedContent));
      } else if (initialContent) {
        // If format is HTML, set the content directly. TipTap's HTML parser
        // will route any `a[data-type="rich-link"]` tags through the
        // RichLinkExtension's parseHTML, so already-saved richLinks survive
        // the round-trip; raw `<a href>` links remain as link marks and get
        // visually upgraded by the read-only renderer's normalize pass.
        if (format === 'html' && typeof initialContent === 'string') {
          if (debug) console.log('Setting HTML content directly:', initialContent);
          editor.commands.setContent(initialContent);
        } else {
          // Parse the initial content to ensure it's in the correct format,
          // then upgrade URL-only text/links into richLink nodes so editing
          // an old comment shows the same inline preview as a fresh paste.
          const parsedContent = parseContent(initialContent, 'TIPTAP', debug);
          const normalized = normalizeRichLinks(parsedContent);
          if (debug)
            console.log('Setting initial content:', initialContent, 'Normalized:', normalized);

          editor.commands.setContent(normalized);
        }
      }
    }
  }, [editor, initialContent, loadedContent, isReadOnly, debug, format]);

  // Update draft when rating changes, but only if content exists
  useEffect(() => {
    if (editor && !isReadOnly && isReview && contentRef.current) {
      saveDraft(contentRef.current, rating, sectionRatings);
    }
  }, [rating, sectionRatings]); // Removed dependencies that could cause loops

  // Add a useEffect to focus editor only when explicitly requested
  useEffect(() => {
    if (!editor) return;

    // Only focus when explicitly requested via autoFocus prop
    if (autoFocus && !isReadOnly) {
      const timeoutId = setTimeout(() => {
        editor.commands.focus('end');
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [editor, autoFocus, isReadOnly]);

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
