import { Extension } from '@tiptap/core';

/**
 * Extension that allows exiting a link when pressing space
 * This improves the UX by making it easier to continue typing after a link
 */
export const ExitLinkOnSpace = Extension.create({
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
