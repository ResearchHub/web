import { AnyExtension } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Image } from '@tiptap/extension-image';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import { CommentLink } from './extensions/CommentLink';
import { ExitLinkOnSpace } from './extensions/ExitLinkOnSpace';
import { RichLinkExtension } from './extensions/RichLinkExtension';
import { MentionExtension } from './MentionExtension';
import { ReviewExtension } from './ReviewExtension';

// Initialize lowlight with supported languages
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);

export interface CommentEditorExtensionOptions {
  placeholder?: string;
  isReview?: boolean;
  rating?: number;
  onRatingChange?: (rating: number) => void;
}

/**
 * Single source of truth for the comment editor's extension set, shared by
 * `useCommentEditor` and `scripts/export-prosemirror-schema.ts` (which derives
 * the backend-facing ProseMirror schema from it). After adding, removing, or
 * reconfiguring an extension here, run `npm run schema:export` and ship the
 * regenerated schema to the backend.
 */
export const getCommentEditorExtensions = ({
  placeholder = 'Write a comment...',
  isReview = false,
  rating = 0,
  onRatingChange = () => {},
}: CommentEditorExtensionOptions = {}): AnyExtension[] => [
  StarterKit.configure({
    blockquote: {
      HTMLAttributes: {
        class: 'border-l-4 border-gray-200 pl-4 my-4 italic text-gray-700',
      },
    },
    codeBlock: false,
    // Bundled into StarterKit as of v3. Link/Underline are registered
    // separately below; trailingNode and listKeymap were not part of this
    // editor's v2 behavior.
    link: false,
    underline: false,
    trailingNode: false,
    listKeymap: false,
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
          onRatingChange,
        }),
      ]
    : []),
];
