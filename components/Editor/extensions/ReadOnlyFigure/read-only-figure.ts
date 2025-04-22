import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const ReadOnlyFigure = Node.create({
  name: 'figure',

  group: 'block',

  content: 'block*',

  parseHTML() {
    return [
      {
        tag: 'figure',
        preserveWhitespace: 'full',
        getAttrs: (element) => {
          const htmlElement = element as HTMLElement;
          return {
            originalContent: htmlElement.innerHTML,
            class: htmlElement.getAttribute('class') || '',
          };
        },
      },
    ];
  },

  addAttributes() {
    return {
      originalContent: {
        default: '',
        parseHTML: (element) => element.innerHTML,
        renderHTML: (attrs) => ({
          'data-original-content': attrs.originalContent,
        }),
      },
      class: {
        default: '',
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    // Create a temporary div to parse the HTML string into DOM elements
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = node.attrs.originalContent || '';

    return [
      'figure',
      mergeAttributes(HTMLAttributes, {
        class: node.attrs.class,
      }),
      // Spread the child nodes from the parsed content
      ...Array.from(tempDiv.childNodes),
    ];
  },

  addProseMirrorPlugins() {
    const plugin = new Plugin({
      key: new PluginKey('readOnlyFigure'),
      props: {
        handleClick: (view, pos) => {
          const node = view.state.doc.nodeAt(pos);
          if (node?.type.name === 'figure') {
            return true;
          }
          return false;
        },
        handleKeyDown: (view, event) => {
          const { selection } = view.state;
          const node = view.state.doc.nodeAt(selection.from);

          if (node?.type.name === 'figure') {
            if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Enter') {
              return true;
            }
          }
          return false;
        },
        decorations: (state) => {
          const { doc } = state;
          const decorations: Decoration[] = [];

          doc.descendants((node, pos) => {
            if (node.type.name === 'figure') {
              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: 'readonly-node',
                })
              );
            }
          });

          return DecorationSet.create(doc, decorations);
        },
      },
    });

    return [plugin];
  },
});
