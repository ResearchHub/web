import { Editor, EditorContent, useEditor } from '@tiptap/react';
import React, { useEffect } from 'react';
import { StarterKit } from '@tiptap/starter-kit';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import '@/components/Editor/styles/index.css';
import { useNotebookPublish } from '@/contexts/NotebookPublishContext';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin } from '@tiptap/pm/state';

// Modify the CustomDocument extension
const CustomDocument = Document.extend({
  content: 'heading block+',
  parseHTML() {
    return [
      {
        tag: 'div[class="editor-content"]',
      },
    ];
  },
});

// Create a custom Heading extension that enforces h1 at the start
const CustomHeading = Heading.extend({
  addProseMirrorPlugins() {
    const plugins = this.parent?.() || [];

    return [
      ...plugins,
      new Plugin({
        props: {
          decorations: (state) => {
            const { doc, selection } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (
                node.type.name === 'heading' &&
                node.attrs.level === 1 &&
                node.content.size === 0
              ) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: 'is-empty',
                    'data-placeholder': 'Enter your title here...',
                  })
                );
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      // Prevent deleting the title if it's empty
      Backspace: ({ editor }) => {
        const { empty, $anchor } = editor.state.selection;
        const isTitle = $anchor.node().type.name === 'heading' && $anchor.node().attrs.level === 1;

        if (empty && isTitle && $anchor.pos === 1) {
          return true;
        }
        return false;
      },
      'Mod-b': ({ editor }) => editor.commands.toggleBold(),
      'Mod-i': ({ editor }) => editor.commands.toggleItalic(),
      'Mod-u': ({ editor }) => editor.commands.toggleUnderline(),
    };
  },
});

export interface BlockEditorProps {
  content?: string;
  contentJson?: string;
  isLoading?: boolean;
  onUpdate?: (editor: Editor) => void;
  editable?: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  content,
  contentJson,
  onUpdate,
  isLoading = false,
  editable = true,
}) => {
  const { setEditor } = useNotebookPublish();

  const editor = useEditor({
    editable,
    immediatelyRender: false,
    extensions: [
      CustomDocument,
      StarterKit.configure({
        document: false,
        heading: false,
      }),
      CustomHeading.configure({
        levels: [1, 2, 3],
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        includeChildren: true,
        placeholder: ({ node }) => {
          if (node.type.name === 'heading' && node.attrs.level === 1) {
            return 'Enter your title here...';
          }
          return '';
        },
      }),
    ],
    content: contentJson
      ? JSON.parse(contentJson)
      : {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: '' }],
            },
          ],
        },
    editorProps: {
      attributes: {
        class:
          'min-h-full prose prose-sm max-w-none prose-neutral dark:prose-invert prose-headings:font-display',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor);
    },
  });

  useEffect(() => {
    if (editor && (content || contentJson)) {
      if (contentJson) {
        editor.commands.setContent(JSON.parse(contentJson));
      } else {
        editor.commands.setContent(content || '');
      }
    }
  }, [editor, content, contentJson]);

  useEffect(() => {
    setEditor(editor);
  }, [editor, setEditor]);

  if (isLoading) {
    return <NotebookSkeleton />;
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="h-full">
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 pr-1">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
};
