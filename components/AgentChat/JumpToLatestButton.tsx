'use client';

import { ArrowDown } from 'lucide-react';
import { cn } from '@/utils/styles';

interface JumpToLatestButtonProps {
  readonly visible: boolean;
  readonly onClick: () => void;
  readonly className?: string;
}

/**
 * The floating "jump to latest" control for a transcript. Position it over
 * the scrolling area's bottom edge; it fades out while the reader is already
 * at the end.
 */
export function JumpToLatestButton({ visible, onClick, className }: JumpToLatestButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Jump to latest"
      title="Jump to latest"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all duration-150',
        'hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        visible ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        className
      )}
    >
      <ArrowDown className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
