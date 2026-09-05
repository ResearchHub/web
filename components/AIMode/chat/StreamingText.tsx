'use client';

import { useEffect, useRef, useState } from 'react';
import { stripPartialCitation, type Citation } from '../lib/citations';
import { AssistantMarkdown } from './AssistantMarkdown';

/** Roughly how long a turn should take to type out, regardless of length. */
const TARGET_DURATION_MS = 2400;
const TICK_MS = 24;

interface StreamingTextProps {
  readonly content: string;
  /** When false the text is already history and renders in full immediately. */
  readonly animate: boolean;
  readonly onDone: () => void;
  readonly onCite?: (citation: Citation) => void;
}

/**
 * Types markdown out progressively, then reports completion so the parent can
 * mount whatever block comes next. Markdown is re-parsed on each tick against
 * the partial string, which keeps emphasis and lists from flashing raw syntax.
 */
export const StreamingText = ({ content, animate, onDone, onCite }: StreamingTextProps) => {
  const [visibleChars, setVisibleChars] = useState(animate ? 0 : content.length);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const hasReportedRef = useRef(!animate);

  // A turn stopped early is marked complete from outside; the text has to
  // catch up with it rather than stay frozen mid-sentence.
  useEffect(() => {
    if (!animate) setVisibleChars(content.length);
  }, [animate, content.length]);

  useEffect(() => {
    if (!animate) return;

    const step = Math.max(3, Math.ceil(content.length / (TARGET_DURATION_MS / TICK_MS)));
    const interval = setInterval(() => {
      setVisibleChars((previous) => Math.min(previous + step, content.length));
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [animate, content]);

  // Reporting from an effect (rather than inside the state updater) keeps the
  // handoff to the next block idempotent under StrictMode double-invocation.
  useEffect(() => {
    if (hasReportedRef.current || visibleChars < content.length) return;
    hasReportedRef.current = true;
    onDoneRef.current();
  }, [visibleChars, content.length]);

  const isTyping = visibleChars < content.length;
  const visible = isTyping ? stripPartialCitation(content.slice(0, visibleChars)) : content;

  return (
    // Clicking finishes the turn immediately, so a live demo never has to wait
    // out an animation before answering.
    <div
      onClick={isTyping ? () => setVisibleChars(content.length) : undefined}
      className={isTyping ? 'cursor-pointer' : undefined}
    >
      <AssistantMarkdown content={visible} onCite={onCite} />
    </div>
  );
};
