import type { Editor } from '@tiptap/core';
import { SUGGESTED_EDITS, SUGGESTION_COLOR } from './mockData';

/**
 * Types a colored replacement into the editor one word at a time, starting at
 * `startPos`, each word carrying the suggesting-mode color mark. Resolves once
 * the whole string has been typed.
 */
function streamInsertion(editor: Editor, startPos: number, text: string): Promise<void> {
  const words = text.split(' ');
  let insertPos = startPos;
  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      // Leading space keeps the insertion detached from the struck phrase.
      const chunk = ` ${words[i]}`;
      editor.commands.insertContentAt(insertPos, {
        type: 'text',
        text: chunk,
        marks: [{ type: 'textStyle', attrs: { color: SUGGESTION_COLOR } }],
      });
      insertPos += chunk.length;
      i += 1;
      if (i < words.length) {
        window.setTimeout(tick, 75);
      } else {
        resolve();
      }
    };
    tick();
  });
}

/**
 * Google-Docs-suggesting-mode rewrite of an explicit selection range: strikes
 * through the selected text (colored strikethrough) and types the replacement
 * in after it (colored). Used by the demo's selection toolbar "Rewrite" flow.
 */
export function applyRewrite(
  editor: Editor,
  from: number,
  to: number,
  replacement: string
): Promise<void> {
  editor
    .chain()
    .setTextSelection({ from, to })
    .setMark('strike')
    .setColor(SUGGESTION_COLOR)
    .setTextSelection(to)
    .scrollIntoView()
    .run();

  return streamInsertion(editor, to, replacement);
}

interface ParagraphRef {
  pos: number;
  text: string;
}

// Body paragraphs substantial enough to plausibly receive an AI revision —
// short paragraphs (captions, single-line notes) are skipped.
function findBodyParagraphs(editor: Editor): ParagraphRef[] {
  const paragraphs: ParagraphRef[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'paragraph' && node.textContent.trim().length >= 120) {
      paragraphs.push({ pos, text: node.textContent });
      return false;
    }
    return true;
  });
  return paragraphs;
}

/**
 * Fake a Google-Docs-suggesting-mode edit: strike through a phrase in the
 * target paragraph (colored strikethrough) and "type" the replacement in word
 * by word after it (colored text). Returns a promise that resolves when the
 * typing animation finishes, or null when there's nothing (left) to edit.
 *
 * `editIndex` selects both the paragraph (1st send edits the 1st body
 * paragraph, 2nd send the 2nd, …) and the scripted replacement text.
 */
export function applySuggestedEdit(editor: Editor, editIndex: number): Promise<void> | null {
  if (editIndex >= SUGGESTED_EDITS.length) return null;
  const spec = SUGGESTED_EDITS[editIndex];

  const paragraph = findBodyParagraphs(editor)[editIndex];
  if (!paragraph) return null;

  // Map the word-based delete range onto character offsets, clamped so short
  // paragraphs still produce a sensible strike range.
  const words = [...paragraph.text.matchAll(/\S+/g)];
  if (words.length < 4) return null;
  const startIdx = Math.min(spec.deleteWordStart, words.length - 3);
  const endIdx = Math.min(startIdx + spec.deleteWordCount - 1, words.length - 2);
  const startWord = words[startIdx];
  const endWord = words[endIdx];

  // +1 to step from the paragraph position to its first text character. This
  // assumes plain text content (true for the demo fixture); inline nodes would
  // shift the mapping.
  const from = paragraph.pos + 1 + (startWord.index ?? 0);
  const to = paragraph.pos + 1 + (endWord.index ?? 0) + endWord[0].length;

  return applyRewrite(editor, from, to, spec.insertText);
}

export interface PendingEdit {
  /** Start of the colored (suggested) run — the struck deletion. */
  from: number;
  /** End of the colored run — the end of the inserted replacement. */
  to: number;
}

const isSuggestionColor = (color?: string | null) =>
  (color || '').toLowerCase() === SUGGESTION_COLOR.toLowerCase();

/**
 * Scans the document for pending suggested edits: maximal contiguous runs of
 * text carrying the suggesting-mode color. Each run is a struck deletion
 * immediately followed by a colored insertion.
 */
export function findPendingEdits(editor: Editor): PendingEdit[] {
  const edits: PendingEdit[] = [];
  let current: PendingEdit | null = null;

  editor.state.doc.descendants((node, pos) => {
    if (node.isText) {
      const colored = node.marks.some(
        (m) => m.type.name === 'textStyle' && isSuggestionColor(m.attrs.color)
      );
      if (colored) {
        const from = pos;
        const to = pos + node.nodeSize;
        if (current && current.to === from) {
          current.to = to;
        } else {
          if (current) edits.push(current);
          current = { from, to };
        }
        return true;
      }
    }
    // Any non-colored text or block boundary ends the current run.
    if (current) {
      edits.push(current);
      current = null;
    }
    return true;
  });

  if (current) edits.push(current);
  return edits;
}

// Splits a colored region into its struck (deleted) and inserted text.
function splitRegion(editor: Editor, from: number, to: number) {
  let struck = '';
  let inserted = '';
  editor.state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isText && node.text) {
      const segStart = Math.max(pos, from);
      const segEnd = Math.min(pos + node.nodeSize, to);
      const text = node.text.slice(segStart - pos, segEnd - pos);
      if (node.marks.some((m) => m.type.name === 'strike')) {
        struck += text;
      } else {
        inserted += text;
      }
    }
    return true;
  });
  return { struck, inserted };
}

// Replaces a region with plain (black, unmarked) text, or deletes it when the
// replacement is empty.
function replaceWithPlainText(editor: Editor, from: number, to: number, text: string) {
  if (!text) {
    editor.chain().focus().deleteRange({ from, to }).run();
    return;
  }
  editor
    .chain()
    .focus()
    .insertContentAt({ from, to }, { type: 'text', text })
    // Guard against mark inheritance so accepted text renders as normal body copy.
    .setTextSelection({ from, to: from + text.length })
    .unsetColor()
    .unsetMark('strike')
    .setTextSelection(from + text.length)
    .run();
}

/**
 * Accept a suggested edit: drop the struck deletion and keep the inserted
 * replacement as normal black text.
 */
export function acceptEdit(editor: Editor, from: number, to: number) {
  const { inserted } = splitRegion(editor, from, to);
  replaceWithPlainText(editor, from, to, inserted.trimStart());
}

/**
 * Reject a suggested edit: restore the original struck text and discard the
 * inserted replacement.
 */
export function rejectEdit(editor: Editor, from: number, to: number) {
  const { struck } = splitRegion(editor, from, to);
  replaceWithPlainText(editor, from, to, struck);
}
