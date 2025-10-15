import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface AICompletionOptions {
  completion: string | null;
  onAccept?: () => void;
  onReject?: () => void;
}

export interface AICompletionStorage {
  completion: string | null;
  cursorPos: number | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiCompletion: {
      /**
       * Set the AI completion text
       */
      setAICompletion: (completion: string, pos: number) => ReturnType;
      /**
       * Clear the AI completion
       */
      clearAICompletion: () => ReturnType;
      /**
       * Accept the AI completion
       */
      acceptAICompletion: () => ReturnType;
    };
  }
}

export const AICompletionExtension = Extension.create<AICompletionOptions, AICompletionStorage>({
  name: 'aiCompletion',

  addOptions() {
    return {
      completion: null,
      onAccept: undefined,
      onReject: undefined,
    };
  },

  addStorage() {
    return {
      completion: null,
      cursorPos: null,
    };
  },

  addCommands() {
    return {
      setAICompletion:
        (completion: string, pos: number) =>
        ({ commands, tr }) => {
          this.storage.completion = completion;
          this.storage.cursorPos = pos;
          // Force update
          tr.setMeta('aiCompletion', { type: 'set', completion, pos });
          return true;
        },
      clearAICompletion:
        () =>
        ({ commands, tr }) => {
          this.storage.completion = null;
          this.storage.cursorPos = null;
          tr.setMeta('aiCompletion', { type: 'clear' });
          return true;
        },
      acceptAICompletion:
        () =>
        ({ commands, state, tr }) => {
          const { completion, cursorPos } = this.storage;
          if (!completion || cursorPos === null) return false;

          // Insert the completion at the cursor position
          tr.insertText(completion, cursorPos);

          // Clear the completion
          this.storage.completion = null;
          this.storage.cursorPos = null;

          // Call onAccept callback
          this.options.onAccept?.();

          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (this.storage.completion) {
          return editor.commands.acceptAICompletion();
        }
        return false;
      },
      Escape: ({ editor }) => {
        if (this.storage.completion) {
          editor.commands.clearAICompletion();
          this.options.onReject?.();
          return true;
        }
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('aiCompletion'),
        state: {
          init: () => {
            return DecorationSet.empty;
          },
          apply: (tr, set, oldState, newState) => {
            // Map decorations through the transaction
            set = set.map(tr.mapping, tr.doc);

            // Check for updates to the completion
            const meta = tr.getMeta('aiCompletion');
            if (meta?.type === 'set' && meta.completion && meta.pos !== undefined) {
              // Create decoration for ghost text
              const decoration = Decoration.widget(
                meta.pos,
                () => {
                  const span = document.createElement('span');
                  span.textContent = meta.completion;
                  span.style.color = '#9ca3af';
                  span.style.opacity = '0.6';
                  span.style.fontStyle = 'italic';
                  span.style.pointerEvents = 'none';
                  span.setAttribute('data-ai-completion', 'true');
                  return span;
                },
                { side: 1 }
              );
              set = DecorationSet.create(tr.doc, [decoration]);
            } else if (meta?.type === 'clear') {
              set = DecorationSet.empty;
            }

            return set;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
