import { getOverflowAncestors } from '@floating-ui/dom';
import { Editor } from '@tiptap/react';
import { useEffect } from 'react';

/**
 * BubbleMenu only listens to a single scroll target, but the notebook can
 * scroll inside nested containers. Repositioning on every ancestor's scroll
 * keeps a menu that is pinned to the visible part of a tall selection
 * following the viewport.
 */
export const useTextMenuScrollSync = (editor: Editor, pluginKey: string) => {
  useEffect(() => {
    const dom = editor.view?.dom;
    if (!dom) {
      return undefined;
    }

    let frame: number | null = null;
    const handleScroll = () => {
      if (frame !== null) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = null;
        if (editor.isDestroyed || editor.state.selection.empty) {
          return;
        }
        editor.view.dispatch(editor.state.tr.setMeta(pluginKey, 'updatePosition'));
      });
    };

    const ancestors = getOverflowAncestors(dom);
    ancestors.forEach((ancestor) =>
      ancestor.addEventListener('scroll', handleScroll, { passive: true })
    );

    return () => {
      ancestors.forEach((ancestor) => ancestor.removeEventListener('scroll', handleScroll));
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [editor, pluginKey]);
};
