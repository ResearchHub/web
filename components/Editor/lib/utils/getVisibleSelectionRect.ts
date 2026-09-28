import { getOverflowAncestors, type VirtualElement } from '@floating-ui/dom';
import { posToDOMRect } from '@tiptap/core';
import { Editor } from '@tiptap/react';

const getVisibleBounds = (element: Element): DOMRect => {
  let top = 0;
  let left = 0;
  let bottom = window.innerHeight;
  let right = window.innerWidth;

  getOverflowAncestors(element).forEach((ancestor) => {
    if (!(ancestor instanceof Element)) {
      return;
    }
    const rect = ancestor.getBoundingClientRect();
    top = Math.max(top, rect.top);
    left = Math.max(left, rect.left);
    bottom = Math.min(bottom, rect.bottom);
    right = Math.min(right, rect.right);
  });

  return new DOMRect(left, top, right - left, bottom - top);
};

/**
 * Returns the part of the current selection that is actually on screen, so a
 * floating menu anchored to it stays reachable when the selection is taller
 * than the viewport (e.g. select-all while scrolled to the bottom). Falls back
 * to the full selection rect when none of it is visible, letting Floating UI's
 * `hide` middleware hide the menu.
 */
export const getVisibleSelectionRect = (editor: Editor): VirtualElement | null => {
  const { view } = editor;
  if (!view?.dom?.isConnected) {
    return null;
  }

  const { from, to } = view.state.selection;
  const selectionRect = posToDOMRect(view, from, to);
  const bounds = getVisibleBounds(view.dom);

  const top = Math.max(selectionRect.top, bounds.top);
  const bottom = Math.min(selectionRect.bottom, bounds.bottom);
  const left = Math.max(selectionRect.left, bounds.left);
  const right = Math.min(selectionRect.right, bounds.right);

  const rect =
    top < bottom && left <= right
      ? new DOMRect(left, top, right - left, bottom - top)
      : selectionRect;

  return {
    getBoundingClientRect: () => rect,
    getClientRects: () => [rect],
  };
};

export default getVisibleSelectionRect;
