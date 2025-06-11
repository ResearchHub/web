'use client';

import { EditorContent, useEditor } from '@tiptap/react';
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
import { useCallback, useEffect, useState } from 'react';
import { EditorToolbar } from '@/components/Comment/components/EditorToolbar';
import { EditorModals } from '@/components/Comment/components/EditorModals';

interface WorkAbstractEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

// Initialize lowlight with supported languages
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);

export function WorkAbstractEditor({
  initialContent = '',
  onContentChange,
}: WorkAbstractEditorProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkMenuPosition, setLinkMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedLink, setSelectedLink] = useState<{ url: string; text: string } | null>(null);

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
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
        languageClassPrefix: 'hljs language-',
        HTMLAttributes: {
          class: 'not-prose',
        },
      }),
      Placeholder.configure({
        placeholder: 'Enter the abstract for this paper...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
      handleClick: (view, pos, event) => {
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
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange?.(html);
    },
    immediatelyRender: false,
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  const handleLinkAdd = useCallback(() => {
    setIsLinkModalOpen(true);
  }, []);

  const handleLinkSave = useCallback(
    (url: string, text?: string) => {
      if (editor) {
        if (text) {
          editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run();
        } else {
          editor.chain().focus().setLink({ href: url }).run();
        }
      }
      setIsLinkModalOpen(false);
    },
    [editor]
  );

  const handleImageEmbed = useCallback(
    (url: string) => {
      if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
      setIsImageModalOpen(false);
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
      {/* Editor toolbar */}
      <EditorToolbar
        editor={editor}
        onLinkAdd={handleLinkAdd}
        onImageAdd={() => setIsImageModalOpen(true)}
        isReview={false}
        isReadOnly={false}
        compactToolbar={false}
        showMentions={false}
      />

      {/* Editor content */}
      <div className="relative comment-editor-content">
        <EditorContent editor={editor} />
      </div>

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
}
