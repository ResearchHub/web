'use client';

import {
  Bold,
  Copy,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  List,
} from 'lucide-react';
import { Extension } from '@tiptap/core';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';

const TEMPLATE_PLACEHOLDER_GROUPS = [
  {
    label: 'User',
    tone: 'blue',
    tags: [
      '{{user.email}}',
      '{{user.full_name}}',
      '{{user.name}}',
      '{{user.first_name}}',
      '{{user.last_name}}',
      '{{user.headline}}',
      '{{user.organization}}',
    ],
  },
  {
    label: 'RFP',
    tone: 'amber',
    tags: ['{{rfp.title}}', '{{rfp.deadline}}', '{{rfp.blurb}}', '{{rfp.amount}}', '{{rfp.url}}'],
  },
  {
    label: 'Expert',
    tone: 'emerald',
    tags: [
      '{{expert.name}}',
      '{{expert.title}}',
      '{{expert.affiliation}}',
      '{{expert.email}}',
      '{{expert.expertise}}',
    ],
  },
] as const;

const PLACEHOLDER_CLASS_BY_TOKEN: Record<string, string> = Object.fromEntries(
  TEMPLATE_PLACEHOLDER_GROUPS.flatMap((group) =>
    group.tags.map((token) => [
      token,
      `template-placeholder-tag template-placeholder-tag--${group.tone}`,
    ])
  )
);

const PLACEHOLDER_REGEX = /\{\{[^{}]+\}\}/g;
const EMPTY_EDITOR_HTML = '<p></p>';

const PlaceholderHighlight = Extension.create({
  name: 'templatePlaceholderHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('templatePlaceholderHighlight'),
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];

            state.doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return;

              const regex = new RegExp(PLACEHOLDER_REGEX);
              let match: RegExpExecArray | null;

              while ((match = regex.exec(node.text)) !== null) {
                const token = match[0];
                const from = pos + match.index;
                const to = from + token.length;

                decorations.push(
                  Decoration.inline(from, to, {
                    class:
                      PLACEHOLDER_CLASS_BY_TOKEN[token] ??
                      'template-placeholder-tag template-placeholder-tag--generic',
                  })
                );
              }
            });

            return decorations.length > 0
              ? DecorationSet.create(state.doc, decorations)
              : DecorationSet.empty;
          },
        },
      }),
    ];
  },
});

/** True if the string looks like HTML (e.g. from backend or previous save). */
function looksLikeHtml(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.startsWith('<') && trimmed.includes('>');
}

function normalizeEditorValue(value: string, valueAsHtml: boolean): string {
  const trimmed = value.trim();
  if (!trimmed) return EMPTY_EDITOR_HTML;

  if (valueAsHtml && looksLikeHtml(value)) return value;

  return value
    .split('\n')
    .map((line) => (line === '' ? '<p><br /></p>' : `<p>${escapeHtml(line)}</p>`))
    .join('');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

interface TemplateVariableEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  singleLine?: boolean;
  minHeightClassName?: string;
  /** When true, value is HTML and we emit HTML (e.g. for email body). When false, use plain text (e.g. subject). */
  valueAsHtml?: boolean;
  /** When false, hide the "Show variables" panel and do not support inserting variable placeholders (e.g. on outreach detail page). */
  showVariablePanel?: boolean;
}

export function TemplateVariableEditor({
  value,
  onChange,
  placeholder = 'Hello {{expert.name}}, I am {{user.full_name}} from {{user.organization}}',
  disabled = false,
  singleLine = false,
  minHeightClassName = 'min-h-[180px]',
  valueAsHtml = false,
  showVariablePanel = true,
}: TemplateVariableEditorProps) {
  const [showVariables, setShowVariables] = useState(false);
  const showToolbar = valueAsHtml && !disabled;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        bold: valueAsHtml ? {} : false,
        bulletList: valueAsHtml ? {} : false,
        code: false,
        codeBlock: false,
        dropcursor: valueAsHtml ? {} : false,
        gapcursor: false,
        heading: false,
        horizontalRule: false,
        italic: valueAsHtml ? {} : false,
        listItem: valueAsHtml ? {} : false,
        orderedList: false,
        strike: valueAsHtml ? {} : false,
      }),
      ...(valueAsHtml
        ? [
            Underline,
            Link.configure({
              openOnClick: false,
              HTMLAttributes: { class: 'text-primary-600 underline hover:text-primary-700' },
            }),
          ]
        : []),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      PlaceholderHighlight,
    ],
    content: normalizeEditorValue(value, valueAsHtml),
    editable: !disabled,
    editorProps: {
      attributes: {
        class: `${minHeightClassName} px-3 py-2 text-sm leading-5 text-gray-900 whitespace-pre-wrap focus:outline-none [&>p]:my-0`,
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData('text/plain');
        if (text == null) return false;

        view.dispatch(
          view.state.tr.insertText(text, view.state.selection.from, view.state.selection.to)
        );
        return true;
      },
      handleKeyDown(view, event) {
        if (!singleLine || event.key !== 'Enter') return false;

        event.preventDefault();
        return true;
      },
    },
    onUpdate: ({ editor: nextEditor }) => {
      if (valueAsHtml) {
        onChange(nextEditor.isEmpty ? '' : nextEditor.getHTML());
      } else {
        onChange(nextEditor.isEmpty ? '' : nextEditor.getText({ blockSeparator: '\n' }));
      }
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;

    const currentValue = valueAsHtml
      ? editor.isEmpty
        ? ''
        : editor.getHTML()
      : editor.isEmpty
        ? ''
        : editor.getText({ blockSeparator: '\n' });

    if (currentValue !== value) {
      editor.commands.setContent(normalizeEditorValue(value, valueAsHtml), false);
    }
  }, [editor, value, valueAsHtml]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    const { href } = editor.getAttributes('link');
    if (href) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = window.prompt('URL:', 'https://');
      if (url != null && url.trim()) {
        editor.chain().focus().setLink({ href: url.trim() }).run();
      }
    }
  }, [editor]);

  const handleCopy = useCallback(async () => {
    if (!editor) return;
    const plainText = editor.getText({ blockSeparator: '\n' });
    try {
      if (valueAsHtml) {
        const html = editor.getHTML();
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([plainText], { type: 'text/plain' }),
            'text/html': new Blob([html], { type: 'text/html' }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  }, [editor, valueAsHtml]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'rounded-lg border border-gray-200 bg-white transition-all focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
          disabled && 'bg-gray-50 opacity-70',
          '[&_.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_.is-editor-empty:first-child::before]:float-left',
          '[&_.is-editor-empty:first-child::before]:h-0',
          '[&_.is-editor-empty:first-child::before]:text-gray-400',
          '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.template-placeholder-tag]:rounded-sm',
          '[&_.template-placeholder-tag]:border',
          '[&_.template-placeholder-tag]:px-1',
          '[&_.template-placeholder-tag]:py-px',
          '[&_.template-placeholder-tag]:font-mono',
          '[&_.template-placeholder-tag]:text-[0.9em]',
          '[&_.template-placeholder-tag--blue]:border-blue-200',
          '[&_.template-placeholder-tag--blue]:bg-blue-50',
          '[&_.template-placeholder-tag--blue]:text-blue-700',
          '[&_.template-placeholder-tag--emerald]:border-emerald-200',
          '[&_.template-placeholder-tag--emerald]:bg-emerald-50',
          '[&_.template-placeholder-tag--emerald]:text-emerald-700',
          '[&_.template-placeholder-tag--amber]:border-amber-200',
          '[&_.template-placeholder-tag--amber]:bg-amber-50',
          '[&_.template-placeholder-tag--amber]:text-amber-700',
          '[&_.template-placeholder-tag--generic]:border-gray-200',
          '[&_.template-placeholder-tag--generic]:bg-gray-100',
          '[&_.template-placeholder-tag--generic]:text-gray-700',
          valueAsHtml && '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_li]:my-0.5'
        )}
      >
        {showToolbar && (
          <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1">
            <div className="flex flex-wrap items-center gap-0.5">
              <button
                type="button"
                title="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  'rounded p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900',
                  editor.isActive('bold') && 'bg-gray-200 text-gray-900'
                )}
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  'rounded p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900',
                  editor.isActive('italic') && 'bg-gray-200 text-gray-900'
                )}
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Underline"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(
                  'rounded p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900',
                  editor.isActive('underline') && 'bg-gray-200 text-gray-900'
                )}
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Strikethrough"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                  'rounded p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900',
                  editor.isActive('strike') && 'bg-gray-200 text-gray-900'
                )}
              >
                <Strikethrough className="h-4 w-4" />
              </button>
              <span className="mx-0.5 h-4 w-px bg-gray-300" aria-hidden />
              <button
                type="button"
                title="Link"
                onClick={handleLink}
                className={cn(
                  'rounded p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900',
                  editor.isActive('link') && 'bg-gray-200 text-gray-900'
                )}
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Bullet list"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                  'rounded p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900',
                  editor.isActive('bulletList') && 'bg-gray-200 text-gray-900'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <div className="ml-auto flex items-center">
              <button
                type="button"
                title="Copy"
                onClick={handleCopy}
                className="rounded p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      {showVariablePanel && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => setShowVariables((prev) => !prev)}
          >
            <span>{showVariables ? 'Hide variables' : 'Show variables'}</span>
          </Button>

          {showVariables && (
            <div className="space-y-2">
              {TEMPLATE_PLACEHOLDER_GROUPS.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {group.label}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {group.tags.map((token) => (
                      <Button
                        key={token}
                        type="button"
                        variant="outlined"
                        size="sm"
                        disabled={disabled}
                        className={cn(
                          'h-5 px-1.5 text-[10px] font-mono',
                          group.tone === 'blue' &&
                            'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
                          group.tone === 'amber' &&
                            'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
                          group.tone === 'emerald' &&
                            'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        )}
                        onClick={() => editor.chain().focus().insertContent(token).run()}
                      >
                        {token}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
