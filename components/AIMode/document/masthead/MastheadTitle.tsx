'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/styles';

/** The note API's limit. */
export const MAX_TITLE_LENGTH = 255;

/** A title as it is saved: one line, single spaces, nothing at the ends. */
export const normalizeTitle = (draft: string): string => draft.replaceAll(/\s+/g, ' ').trim();

const TITLE_CLASS = 'text-[28px] font-bold leading-tight tracking-tight text-gray-900';

interface MastheadTitleProps {
  readonly title: string;
  /** Saves a new title; absent where the title cannot be changed. */
  readonly onRename?: (title: string) => void;
}

/**
 * The note's title, as the published page will head it, edited where it
 * stands: click, type, and Enter or a click away keeps it. Escape puts the
 * old one back.
 */
export function MastheadTitle({ title, onRename }: MastheadTitleProps) {
  const [draft, setDraft] = useState(title);
  const [focused, setFocused] = useState(false);
  const cancelledRef = useRef(false);
  useEffect(() => {
    if (!focused) setDraft(title);
  }, [title, focused]);

  if (!onRename) {
    return <h1 className={cn(TITLE_CLASS, 'mt-1 break-words')}>{title || 'Untitled'}</h1>;
  }

  const commit = () => {
    setFocused(false);
    if (cancelledRef.current) {
      cancelledRef.current = false;
      setDraft(title);
      return;
    }
    const next = normalizeTitle(draft);
    // A note is never left without a title.
    if (next && next !== title) onRename(next);
    else setDraft(title);
  };

  return (
    // The hidden copy gives the cell its height, so the field grows with its
    // text and with the pane's width without measuring anything.
    <h1 className={cn(TITLE_CLASS, 'mt-1 grid')}>
      <span
        aria-hidden="true"
        className="invisible col-start-1 row-start-1 whitespace-pre-wrap break-words"
      >
        {draft || 'Untitled'}{' '}
      </span>
      <textarea
        aria-label="Title"
        rows={1}
        value={draft}
        maxLength={MAX_TITLE_LENGTH}
        placeholder="Untitled"
        spellCheck={focused}
        onChange={(event) => setDraft(event.target.value.replaceAll('\n', ' '))}
        onFocus={() => setFocused(true)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            cancelledRef.current = true;
            event.currentTarget.blur();
          }
        }}
        className="col-start-1 row-start-1 -mx-1.5 w-[calc(100%+0.75rem)] resize-none overflow-hidden rounded-md border-0 bg-transparent px-1.5 py-0 font-[inherit] tracking-[inherit] text-inherit outline-none transition-colors placeholder:text-gray-400 hover:bg-gray-50 focus:bg-transparent focus:outline-none focus:ring-0"
      />
    </h1>
  );
}
