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
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  initialContent?: string;
}

export const CommentEditor = ({
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  initialContent = '',
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
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-md bg-gray-100 p-4',
          },
        },
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
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] px-4 py-2',
      },
      handleClick: (view, pos, event) => {
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
      const html = editor.getHTML();
      await onSubmit(html);
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

  const handleVideoEmbed = () => {
    const url = window.prompt('Enter video URL (YouTube, Vimeo, etc.):');
    if (url) {
      // Here you would typically parse the URL and create an appropriate embed
      const embedHtml = `<div class="video-embed"><iframe src="${url}" frameborder="0" allowfullscreen></iframe></div>`;
      editor?.chain().focus().setContent(embedHtml).run();
    }
  };

  const handleTweetEmbed = () => {
    const tweetUrl = window.prompt('Enter Tweet URL:');
    if (tweetUrl) {
      // Here you would typically use the Twitter embed API
      const embedHtml = `<blockquote class="twitter-tweet"><a href="${tweetUrl}"></a></blockquote>`;
      editor?.chain().focus().setContent(embedHtml).run();
    }
  };

  if (!editor) return null;

  return (
    <div className="border rounded-lg bg-white" ref={editorRef}>
      <style jsx global>{`
        .peer-review-rating {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 12px;
          margin: 8px 0;
        }
        .peer-review-rating .rating-category {
          text-transform: capitalize;
          font-weight: 500;
          color: #4b5563;
          margin-bottom: 4px;
        }
        .peer-review-rating .rating-value {
          color: #f59e0b;
          letter-spacing: 2px;
        }

        /* TipTap Editor Styles */
        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #4b5563;
        }

        .ProseMirror blockquote p {
          margin: 0;
        }

        /* Nested blockquotes */
        .ProseMirror blockquote blockquote {
          border-left-color: #d1d5db;
          margin-left: 0.5rem;
        }

        /* Link hover styles */
        .ProseMirror a {
          position: relative;
        }

        .ProseMirror a:hover::after {
          content: '✎';
          position: absolute;
          right: -1.5em;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.9em;
          color: #6b7280;
          opacity: 0.8;
        }

        .ProseMirror a:hover {
          background-color: rgba(59, 130, 246, 0.1);
          border-radius: 2px;
          transition: background-color 0.2s ease;
        }
      `}</style>
      <div className="border-b px-4 py-2">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
            size="sm"
          >
            Bold
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
            size="sm"
          >
            Italic
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
            size="sm"
          >
            Underline
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
            size="sm"
          >
            Strike
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
            size="sm"
          >
            Code
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
            size="sm"
          >
            Quote
          </Button>
          <Button
            onClick={handleLinkAdd}
            variant={editor?.isActive('link') ? 'secondary' : 'ghost'}
            size="sm"
          >
            Link
          </Button>
          <Button onClick={() => setIsImageModalOpen(true)} variant="ghost" size="sm">
            Image
          </Button>
          <Button onClick={handleVideoEmbed} variant="ghost" size="sm">
            Video
          </Button>
          <Button onClick={handleTweetEmbed} variant="ghost" size="sm">
            Tweet
          </Button>
        </div>
      </div>
      <div className="relative">
        <EditorContent editor={editor} />
        {linkMenuPosition && editor && selectedLink && (
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
