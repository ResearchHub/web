'use client';

import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import { leadingTitleNode } from './title';

export interface MastheadSlots {
  /** Above the document's title: the cover image. */
  readonly cover: HTMLElement;
  /** Right under the title, before the rest of the document: the details. */
  readonly details: HTMLElement;
}

const mastheadSlotsKey = new PluginKey('aiModeMastheadSlots');

/**
 * What an empty or missing title says, in the title's own place. The empty
 * heading's copy is CSS (`.ai-mode-document` in Editor/styles/index.css):
 * keep the two the same.
 */
export const TITLE_PLACEHOLDER = 'Add title';

/**
 * Stands where the title would be when the document has none, in the
 * title's own type: a click (or Enter) puts an empty title heading there,
 * with the caret in it. Inert while the editor is locked.
 */
function addTitlePrompt(view: EditorView): HTMLElement {
  const element = document.createElement('h1');
  element.className = 'masthead-add-title';
  element.contentEditable = 'false';
  element.textContent = TITLE_PLACEHOLDER;
  element.setAttribute('role', 'button');
  element.tabIndex = 0;
  const add = (event: Event) => {
    event.preventDefault();
    if (!view.editable) return;
    const heading = view.state.schema.nodes.heading?.create({ level: 1 });
    if (!heading) return;
    const tr = view.state.tr.insert(0, heading);
    view.dispatch(tr.setSelection(TextSelection.create(tr.doc, 1)).scrollIntoView());
    view.focus();
  };
  element.addEventListener('mousedown', add);
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') add(event);
  });
  return element;
}

/**
 * Two places inside the editor for the masthead to render into, so the
 * document reads title, details, body: the details sit between the title
 * heading and what follows it, and the cover above the title. A document
 * without a title heading gets both at its top, with a prompt to add one
 * between them.
 *
 * They are widgets, not content: never saved, never selectable, and their
 * own events (typing in a field, clicking a chip) stay theirs rather than
 * the editor's.
 */
export function useMastheadSlots(editor: Editor | null): MastheadSlots | null {
  const [slots, setSlots] = useState<MastheadSlots | null>(null);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return undefined;
    const slot = (className: string) => {
      const element = document.createElement('div');
      element.className = className;
      element.contentEditable = 'false';
      return element;
    };
    const created = { cover: slot('masthead-cover'), details: slot('masthead-details') };

    const widget = (
      pos: number,
      dom: HTMLElement | ((view: EditorView) => HTMLElement),
      key: string,
      side: number
    ) =>
      Decoration.widget(pos, dom, {
        key,
        side,
        ignoreSelection: true,
        stopEvent: () => true,
      });

    editor.registerPlugin(
      new Plugin({
        key: mastheadSlotsKey,
        props: {
          decorations: (state) => {
            const title = leadingTitleNode(state.doc);
            const afterTitle = title ? title.nodeSize : 0;
            return DecorationSet.create(state.doc, [
              widget(0, created.cover, 'masthead-cover', -3),
              ...(title ? [] : [widget(0, addTitlePrompt, 'masthead-add-title', -2)]),
              widget(afterTitle, created.details, 'masthead-details', title ? 1 : -1),
            ]);
          },
        },
      })
    );
    setSlots(created);

    return () => {
      setSlots(null);
      if (!editor.isDestroyed) editor.unregisterPlugin(mastheadSlotsKey);
    };
  }, [editor]);

  return slots;
}
