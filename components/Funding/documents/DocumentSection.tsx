'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/utils/styles';

/** How long the highlight ring stays on a section a citation pointed at. */
const HIGHLIGHT_MS = 1800;

interface DocumentSectionProps {
  readonly id: string;
  /** Changes whenever a citation targets this section, even the same one twice. */
  readonly highlightKey?: string | number | null;
  readonly highlighted: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * A citable region of a document. When a citation chip in the chat targets it,
 * the section scrolls into view and flashes a ring, then settles back so the
 * document reads as a document rather than a form with a focused field.
 */
export const DocumentSection = ({
  id,
  highlightKey,
  highlighted,
  className,
  children,
}: DocumentSectionProps) => {
  const ref = useRef<HTMLElement>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (!highlighted) return;

    const element = ref.current;
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setIsFlashing(true);

    const timer = setTimeout(() => setIsFlashing(false), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlighted, highlightKey]);

  return (
    <section
      ref={ref}
      data-section-id={id}
      className={cn(
        '-mx-3 rounded-lg px-3 transition-shadow duration-500',
        isFlashing && 'bg-primary-50/70 ring-2 ring-primary-400',
        className
      )}
    >
      {children}
    </section>
  );
};
