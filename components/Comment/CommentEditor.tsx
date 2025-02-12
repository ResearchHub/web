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
} from 'lucide-react';

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

interface CommentEditorProps {
  onSubmit: (content: any) => void;
  onCancel?: () => void;
  placeholder?: string;
  initialContent?: string | { type: 'doc'; content: any[] };
  isReadOnly?: boolean;
}

export const CommentEditor = ({
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  initialContent = '',
  isReadOnly = false,
}: CommentEditorProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkMenuPosition, setLinkMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedLink, setSelectedLink] = useState<{ url: string; text: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

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
    ],
    content: initialContent,
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
      // Optional: Add any update handlers here
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  const handleSubmit = async () => {
    if (!editor || !editor.getText().trim()) return;

    setIsSubmitting(true);
    try {
      const json = editor.getJSON();
      await onSubmit(json);
      editor.commands.clearContent();
    } catch (error) {
      console.error('Failed to create comment:', error);
      // TODO: Add error handling UI
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
      // We're editing an existing link
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
      // Creating a new link with text (either provided or selected)
      if (editor.state.selection.empty) {
        // No text selected, insert new
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
        // Text is selected, convert to link
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
      // Just updating the URL of selected text
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

        .mention-paper:hover,
        .mention-post:hover {
          text-decoration: underline;
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
        }

        .tippy-box[data-theme~='mention'] .tippy-arrow:before {
          @apply border-gray-200;
          top: -8px;
        }

        /* Empty state tooltip */
        .tippy-box[data-theme~='mention'] .tippy-content div {
          @apply p-2 text-sm text-gray-600;
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
          </div>
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
        <div className="border-t px-4 py-2 flex justify-end gap-2">
          {onCancel && (
            <Button onClick={onCancel} variant="ghost" size="sm">
              Cancel
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={!editor.getText().trim() || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
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
