'use client';

import type { KeyboardEvent } from 'react';
import { cn } from '@/utils/styles';

/** Pixels per arrow key press while the handle has focus. */
const KEY_STEP = 24;

interface ResizeHandleProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly isResizing: boolean;
  readonly onStart: () => void;
  /** Keyboard nudge in pointer space: ArrowRight is positive. */
  readonly onNudge: (deltaX: number) => void;
  /** Which edge of its pane the handle sits on. */
  readonly side: 'left' | 'right';
  readonly className?: string;
}

/**
 * A vertical drag handle on a pane's edge: a thin line that brightens on
 * hover and while dragging, with arrow-key resizing for keyboard users.
 * Position is absolute; the host pane must be `relative`.
 */
export function ResizeHandle({
  label,
  value,
  min,
  max,
  isResizing,
  onStart,
  onNudge,
  side,
  className,
}: ResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={(event) => {
        event.preventDefault();
        onStart();
      }}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        onNudge(event.key === 'ArrowLeft' ? -KEY_STEP : KEY_STEP);
      }}
      className={cn(
        'group absolute inset-y-0 z-10 w-2 cursor-col-resize focus:outline-none',
        side === 'left' ? '-left-1' : '-right-1',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto h-full w-0.5 transition-colors group-hover:bg-primary-300 group-focus:bg-primary-400',
          isResizing ? 'bg-primary-400' : 'bg-transparent'
        )}
      />
    </div>
  );
}
