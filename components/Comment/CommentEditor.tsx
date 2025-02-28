'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Button } from '@/components/ui/Button';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageUploadModal } from './ImageUploadModal';
import { LinkMenu } from './lib/LinkMenu';
import { LinkEditModal } from './lib/LinkEditModal';
import { Extension } from '@tiptap/core';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/atom-one-dark.css';
import { MentionExtension } from './lib/MentionExtension';
import { CommentType } from '@/types/comment';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code2,
  Quote,
  List,
  ListOrdered,
  Link2,
  ImageIcon,
  AtSign,
  Save,
} from 'lucide-react';
import { ReviewExtension, ReviewStars } from './lib/ReviewExtension';
import { ReviewCategories, ReviewCategory } from './lib/ReviewCategories';
import { createRoot } from 'react-dom/client';
import { toast } from 'react-hot-toast';
import { useCommentDraft } from './lib/useCommentDraft';

const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);

const ExitLinkOnSpace = Extension.create({
  name: 'exitLinkOnSpace',
  addKeyboardShortcuts() {
    return {
      Space: ({ editor }) => {
        if (editor.isActive('link')) {
          editor
            .chain()
            .focus()
            .setTextSelection(editor.state.selection.to)
            .unsetMark('link')
            .insertContent(' ')
            .run();
          return true;
        }
        return false;
      },
    };
  },
});

export interface CommentEditorProps {
  onSubmit: (content: any) => void;
  onCancel?: () => void;
  onReset?: () => void;
  onUpdate?: (content: any) => void;
  placeholder?: string;
  initialContent?: string | { type: 'doc'; content: any[] };
  isReadOnly?: boolean;
  commentType?: CommentType;
  initialRating?: number;
  storageKey?: string;
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
}: CommentEditorProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkMenuPosition, setLinkMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedLink, setSelectedLink] = useState<{ url: string; text: string } | null>(null);
  const [rating, setRating] = useState(initialRating);
  const [sectionRatings, setSectionRatings] = useState<Record<string, number>>({});
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<any>(null);
  const isFirstRender = useRef(true);

  const isReview = commentType === 'REVIEW';

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
          setIsLinkModalOpen(true);
        } else {
          setLinkMenuPosition(null);
          setSelectedLink(null);
        }
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
        editor.commands.setContent(loadedContent);
      } else if (initialContent) {
        // Set initial content if provided
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, initialContent, loadedContent, isReadOnly]);

  // Update draft when rating changes, but only if content exists
  useEffect(() => {
    if (editor && !isReadOnly && isReview && contentRef.current) {
      saveDraft(contentRef.current, rating, sectionRatings);
    }
  }, [rating, sectionRatings]); // Removed dependencies that could cause loops

  const handleSectionRatingChange = (rating: number, sectionId: string) => {
    setSectionRatings((prev) => {
      const newRatings = {
        ...prev,
        [sectionId]: rating,
      };

      // If we have content, save the draft with updated ratings
      if (editor && contentRef.current) {
        saveDraft(contentRef.current, rating, newRatings);
      }

      return newRatings;
    });
  };

  const handleSubmit = async () => {
    if (!editor || !editor.getText().trim()) return;
    if (isReview && rating === 0) return;

    const sectionRatings: Record<string, number> = {};
    let overallRating = rating;

    if (isReview) {
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'sectionHeader') {
          sectionRatings[node.attrs.sectionId] = node.attrs.rating;
          if (node.attrs.sectionId === 'overall') {
            overallRating = node.attrs.rating;
          }
        }
      });

      const hasUnratedSections = Object.values(sectionRatings).some((rating) => rating === 0);
      if (hasUnratedSections) {
        toast.error('Please rate all sections before submitting.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const json = editor.getJSON();
      await onSubmit({
        content: json,
        rating: isReview ? overallRating : undefined,
        sectionRatings:
          isReview && Object.keys(sectionRatings).length > 0 ? sectionRatings : undefined,
      });

      clearDraft();

      editor.commands.clearContent();
      if (isReview) {
        setRating(0);
        setSectionRatings({});
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkAdd = () => {
    const selectedText = editor?.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    );

    setSelectedLink({
      url: '',
      text: selectedText || '',
    });
    setIsLinkModalOpen(true);
  };

  const handleLinkSave = (url: string, text?: string) => {
    if (!editor) return;

    if (selectedLink && editor.isActive('link')) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .command(({ tr, state }) => {
          if (text && text !== selectedLink.text) {
            const { from, to } = state.selection;
            tr.insertText(text, from, to);
          }
          return true;
        })
        .run();
    } else if (text) {
      if (editor.state.selection.empty) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: text,
            marks: [
              {
                type: 'link',
                attrs: { href: url },
              },
            ],
          })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .setLink({ href: url })
          .command(({ tr, state }) => {
            if (
              text !== editor.state.doc.textBetween(state.selection.from, state.selection.to, ' ')
            ) {
              const { from, to } = state.selection;
              tr.insertText(text, from, to);
            }
            return true;
          })
          .run();
      }
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }

    setIsLinkModalOpen(false);
    setLinkMenuPosition(null);
    setSelectedLink(null);
  };

  const handleImageEmbed = (imageUrl: string) => {
    editor?.chain().focus().setImage({ src: imageUrl }).run();
    setIsImageModalOpen(false);
  };

  const handleAddReviewCategory = (category: ReviewCategory) => {
    if (!editor) return;

    if (editor.getText().length > 0) {
      editor.chain().focus().setHardBreak().run();
    }

    const content = {
      type: 'doc',
      content: [
        {
          type: 'sectionHeader',
          attrs: {
            sectionId: category.id,
            title: category.title,
            description: category.description,
            rating: 0,
          },
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: category.description,
              marks: [{ type: 'italic' }],
            },
          ],
        },
      ],
    };

    editor.chain().focus().insertContent(content).run();
  };

  if (!editor) return null;

  return (
    <div className="border rounded-lg bg-white" ref={editorRef}>
      <style jsx global>{`
        /* Editor list styles */
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .ProseMirror li {
          margin: 0.5rem 0;
        }

        .ProseMirror li > ul,
        .ProseMirror li > ol {
          margin: 0.5rem 0;
        }

        /* Mention styles */
        .mention {
          display: inline;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mention-user,
        .mention-author {
          color: rgb(35, 131, 226);
          background: transparent;
          border-radius: 0;
          padding: 0;
        }

        .mention-user:hover,
        .mention-author:hover {
          background: transparent;
          text-decoration: underline;
        }

        .mention-paper,
        .mention-post {
          color: rgb(35, 131, 226);
          text-decoration: none;
        }

        /* Mention icon styles */
        .mention-icon {
          display: inline-flex;
          align-items: center;
          margin-right: 4px;
          line-height: 1;
          color: rgb(37 99 235);
          position: relative;
          top: 2px;
        }

        .mention-icon svg {
          width: 14px;
          height: 14px;
          stroke-width: 2;
        }

        /* Tippy mention styles */
        .tippy-box[data-theme~='mention'] {
          @apply bg-white shadow-lg rounded-lg;
          border: 1px solid rgb(233, 233, 233);
          box-shadow:
            rgb(0 0 0 / 5%) 0px 2px 6px,
            rgb(0 0 0 / 10%) 0px 0px 1px;
        }

        .tippy-box[data-theme~='mention'] .tippy-content {
          @apply p-0;
        }

        .tippy-box[data-theme~='mention'] .tippy-arrow {
          @apply text-white;
          display: none;
        }

        .tippy-box[data-theme~='mention'] .tippy-arrow:before {
          @apply border-gray-200;
          top: -8px;
        }

        /* Mention placeholder style */
        .mention-placeholder {
          @apply px-3 py-1.5 text-sm text-gray-500;
          font-size: 14px;
          line-height: 20px;
          color: rgb(115, 115, 115);
          padding: 5px;
        }
      `}</style>
      {!isReadOnly && (
        <div className="border-b px-4 py-2">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => editor.chain().focus().toggleBold().run()}
              variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
              size="sm"
              tooltip="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
              size="sm"
              tooltip="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
              size="sm"
              tooltip="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
              size="sm"
              tooltip="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-gray-200" />

            <Button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
              size="sm"
              tooltip="Code Block"
            >
              <Code2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
              size="sm"
              tooltip="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-gray-200" />

            <Button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
              size="sm"
              tooltip="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
              size="sm"
              tooltip="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-gray-200" />

            <Button
              onClick={handleLinkAdd}
              variant={editor?.isActive('link') ? 'secondary' : 'ghost'}
              size="sm"
              tooltip="Add Link"
            >
              <Link2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setIsImageModalOpen(true)}
              variant="ghost"
              size="sm"
              tooltip="Add Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            <div className="w-px h-8 bg-gray-200" />

            <Button
              onClick={() => {
                editor.chain().focus().insertContent('@').run();
              }}
              variant="ghost"
              size="sm"
              tooltip="Mention"
            >
              <AtSign className="h-4 w-4" />
            </Button>

            {isReview && (
              <>
                <div className="w-px h-8 bg-gray-200" />
                <ReviewCategories
                  onSelectCategory={handleAddReviewCategory}
                  disabled={isReadOnly}
                />
              </>
            )}
          </div>
        </div>
      )}
      {!isReadOnly && isReview && (
        <div className="px-4 py-3 border-b">
          <ReviewStars
            rating={rating}
            onRatingChange={setRating}
            isRequired={true}
            isReadOnly={isReadOnly}
          />
        </div>
      )}
      <div className="relative">
        <EditorContent editor={editor} />
        {!isReadOnly && linkMenuPosition && editor && selectedLink && (
          <div
            style={{
              position: 'absolute',
              left: `${linkMenuPosition.x}px`,
              top: `${linkMenuPosition.y}px`,
            }}
          >
            <LinkMenu
              editor={editor}
              url={selectedLink.url}
              onEdit={() => setIsLinkModalOpen(true)}
              onClose={() => {
                setLinkMenuPosition(null);
                setSelectedLink(null);
              }}
            />
          </div>
        )}
      </div>
      {!isReadOnly && (
        <div className="border-t px-4 py-2 flex justify-between items-center">
          <div className="text-sm text-gray-500 flex items-center">
            {saveStatus === 'saving' && (
              <>
                <Save className="h-3 w-3 mr-1 animate-pulse" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && lastSaved && (
              <>
                <Save className="h-3 w-3 mr-1" />
                <span>Last saved: {formatLastSaved()}</span>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button onClick={onCancel} variant="ghost" size="sm">
                Cancel
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={!editor?.getText().trim() || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      )}

      {isLinkModalOpen && (
        <LinkEditModal
          initialUrl={selectedLink?.url || ''}
          initialText={selectedLink?.text}
          onSave={handleLinkSave}
          onClose={() => {
            setIsLinkModalOpen(false);
            setLinkMenuPosition(null);
            setSelectedLink(null);
          }}
        />
      )}

      {isImageModalOpen && (
        <ImageUploadModal
          onClose={() => setIsImageModalOpen(false)}
          onImageEmbed={handleImageEmbed}
        />
      )}
    </div>
  );
};
