import { isTextSelection } from '@tiptap/core';
import { AllSelection } from '@tiptap/pm/state';
import { Editor } from '@tiptap/react';

export const isTextSelected = ({ editor }: { editor: Editor }) => {
  const {
    state: {
      doc,
      selection,
      selection: { empty, from, to },
    },
  } = editor;

  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size. A document with no text yet can
  // hold an AllSelection, which is never empty but has nothing to format.
  const isEmptyTextBlock =
    !doc.textBetween(from, to).length &&
    (isTextSelection(selection) || selection instanceof AllSelection);

  if (empty || isEmptyTextBlock || !editor.isEditable) {
    return false;
  }

  return true;
};

export default isTextSelected;
