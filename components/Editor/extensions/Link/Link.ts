import { mergeAttributes } from '@tiptap/core';
import TiptapLink from '@tiptap/extension-link';
import { Plugin } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';

export const Link = TiptapLink.extend({
  inclusive: false,

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'link',
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
      },
      validate: (url: string) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      autolink: true,
      protocols: ['http', 'https', 'mailto', 'tel'],
      addProtocol: true,
    };
  },

  parseHTML() {
    return [{ tag: 'a[href]:not([data-type="button"]):not([href *= "javascript:" i])' }];
  },

  renderHTML({ HTMLAttributes }) {
    const href = HTMLAttributes.href || '';
    const safeHref = href.startsWith('javascript:') ? '' : href;

    return [
      'a',
      mergeAttributes(
        this.options.HTMLAttributes,
        { ...HTMLAttributes, href: safeHref },
        {
          class: `link inline-flex items-center hover:underline transition-colors duration-200`,
        }
      ),
      0,
    ];
  },

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      ...(this.parent?.() || []),
      new Plugin({
        props: {
          handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
            const { selection } = editor.state;

            if (event.key === 'Escape' && selection.empty !== true) {
              editor.commands.focus(selection.to, { scrollIntoView: false });
            }

            if (event.key === 'Space' && editor.isActive('link')) {
              const { to } = selection;
              const node = view.state.doc.nodeAt(to);
              if (!node || to === selection.$to.end()) {
                editor
                  .chain()
                  .focus()
                  .setTextSelection(to)
                  .unsetMark('link')
                  .insertContent(' ')
                  .run();
                return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});

export default Link;
