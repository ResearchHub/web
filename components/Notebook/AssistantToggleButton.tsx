'use client';

import type { CSSProperties } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';

interface AssistantToggleButtonProps {
  readonly onClick: () => void;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/**
 * The assistant's switch: a sparkle on a primary gradient disc, floating at
 * the bottom-right of the document with a shimmer on hover and a light blue
 * outline so the feature reads as one even at rest. Shown only while the
 * panel is closed; the panel's own close control is the way back.
 */
export function AssistantToggleButton({ onClick, className, style }: AssistantToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Show assistant"
      style={style}
      className={cn(
        'group fixed z-40 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full',
        'bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 text-white',
        'shadow-lg shadow-primary-500/30 transition-shadow hover:shadow-xl hover:shadow-primary-500/45',
        'ring-2 ring-primary-200 ring-offset-2 ring-offset-white',
        'focus:outline-none focus-visible:ring-primary-500',
        className
      )}
    >
      {/* Highlight band that sweeps across on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent motion-safe:group-hover:animate-shimmer"
      />
      <Sparkles className="relative h-5 w-5" aria-hidden="true" />
      <span className="sr-only">Show assistant</span>
    </button>
  );
}
