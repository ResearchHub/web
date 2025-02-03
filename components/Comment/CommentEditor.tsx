'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface CommentEditorProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  initialContent?: string;
  threadId?: number;
  parentId?: number;
}

export const CommentEditor = ({
  onSubmit,
  placeholder = 'Write a comment...',
  initialContent,
  threadId,
  parentId,
}: CommentEditorProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
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
          class: 'text-blue-600 hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] px-4 py-2',
      },
    },
  });

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
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleImageAdd = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
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
    <div className="border rounded-lg bg-white">
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
            variant={editor.isActive('link') ? 'secondary' : 'ghost'}
            size="sm"
          >
            Link
          </Button>
          <Button onClick={handleImageAdd} variant="ghost" size="sm">
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
      <EditorContent editor={editor} />
      <div className="border-t px-4 py-2 flex justify-end">
        <Button onClick={handleSubmit} disabled={!editor.getText().trim() || isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};
