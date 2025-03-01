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
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
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
  compactToolbar?: boolean;
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
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Check if toolbar can scroll
  const checkToolbarScroll = useCallback(() => {
    if (toolbarRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = toolbarRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  }, []);

  // Scroll toolbar left or right
  const scrollToolbar = useCallback((direction: 'left' | 'right') => {
    if (toolbarRef.current) {
      const scrollAmount = 150; // Adjust as needed
      const currentScroll = toolbarRef.current.scrollLeft;
      toolbarRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  // Update scroll indicators when toolbar content changes
  useEffect(() => {
    checkToolbarScroll();

    // Add resize observer to check scroll when window resizes
    const resizeObserver = new ResizeObserver(() => {
      checkToolbarScroll();
    });

    if (toolbarRef.current) {
      resizeObserver.observe(toolbarRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkToolbarScroll]);

  // Add scroll event listener to toolbar
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (toolbar) {
      toolbar.addEventListener('scroll', checkToolbarScroll);
      return () => {
        toolbar.removeEventListener('scroll', checkToolbarScroll);
      };
    }
  }, [checkToolbarScroll]);

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
      ],
    };

    editor.chain().focus().insertContent(content).run();
  };

  // Group toolbar buttons for the dropdown menu
  const renderToolbarButtons = (inDropdown = false) => {
    const buttonClasses = inDropdown ? 'w-full justify-start px-3 py-2' : '';

    // Only render buttons if editor exists
    if (!editor) return null;

    return (
      <>
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="sm"
          tooltip="Bold"
          className={buttonClasses}
        >
          <Bold className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Bold</span>}
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="sm"
          tooltip="Italic"
          className={buttonClasses}
        >
          <Italic className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Italic</span>}
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
          size="sm"
          tooltip="Underline"
          className={buttonClasses}
        >
          <UnderlineIcon className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Underline</span>}
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
          size="sm"
          tooltip="Strikethrough"
          className={buttonClasses}
        >
          <Strikethrough className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Strikethrough</span>}
        </Button>

        {!inDropdown && <div className="w-px h-8 bg-gray-200 shrink-0" />}

        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
          size="sm"
          tooltip="Code Block"
          className={buttonClasses}
        >
          <Code2 className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Code Block</span>}
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
          size="sm"
          tooltip="Quote"
          className={buttonClasses}
        >
          <Quote className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Quote</span>}
        </Button>

        {!inDropdown && <div className="w-px h-8 bg-gray-200 shrink-0" />}

        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="sm"
          tooltip="Bullet List"
          className={buttonClasses}
        >
          <List className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Bullet List</span>}
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
          size="sm"
          tooltip="Numbered List"
          className={buttonClasses}
        >
          <ListOrdered className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Numbered List</span>}
        </Button>

        {!inDropdown && <div className="w-px h-8 bg-gray-200 shrink-0" />}

        <Button
          onClick={handleLinkAdd}
          variant={editor?.isActive('link') ? 'secondary' : 'ghost'}
          size="sm"
          tooltip="Add Link"
          className={buttonClasses}
        >
          <Link2 className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Add Link</span>}
        </Button>
        <Button
          onClick={() => setIsImageModalOpen(true)}
          variant="ghost"
          size="sm"
          tooltip="Add Image"
          className={buttonClasses}
        >
          <ImageIcon className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Add Image</span>}
        </Button>

        {!inDropdown && <div className="w-px h-8 bg-gray-200 shrink-0" />}

        <Button
          onClick={() => {
            editor.chain().focus().insertContent('@').run();
          }}
          variant="ghost"
          size="sm"
          tooltip="Mention"
          className={buttonClasses}
        >
          <AtSign className="h-4 w-4" />
          {inDropdown && <span className="ml-2">Mention</span>}
        </Button>

        {isReview && !inDropdown && (
          <>
            <div className="w-px h-8 bg-gray-200 shrink-0" />
            <ReviewCategories onSelectCategory={handleAddReviewCategory} disabled={isReadOnly} />
          </>
        )}
      </>
    );
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

        /* Force styles to be applied immediately */
        .editor-initialized .ProseMirror {
          opacity: 1 !important;
          visibility: visible !important;
        }

        /* Review category dropdown styles */
        [data-radix-popper-content-wrapper] {
          z-index: 100 !important;
        }

        /* Ensure line-clamp works */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
          <div className="flex items-center">
            {/* Scroll left button */}
            {compactToolbar && (
              <button
                type="button"
                onClick={() => scrollToolbar('left')}
                className={`flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 ${
                  !canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Scrollable toolbar */}
            <div
              ref={toolbarRef}
              className={`flex gap-2 ${
                compactToolbar ? 'overflow-x-auto scrollbar-hide' : 'flex-wrap'
              }`}
              onScroll={checkToolbarScroll}
            >
              {renderToolbarButtons()}
            </div>

            {/* Scroll right button */}
            {compactToolbar && (
              <button
                type="button"
                onClick={() => scrollToolbar('right')}
                className={`flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 ${
                  !canScrollRight ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!canScrollRight}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {/* More menu button for very small screens */}
            {compactToolbar && (
              <div className="relative ml-1" ref={moreMenuRef}>
                <Button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>

                {showMoreMenu && (
                  <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1 divide-y divide-gray-100">
                      {renderToolbarButtons(true)}
                    </div>
                  </div>
                )}
              </div>
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
      <div className={`relative editor-initialized ${compactToolbar ? 'compact-toolbar' : ''}`}>
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
