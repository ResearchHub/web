'use client';

import { type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';

export interface ListCardProps {
  /** Main content of the card. When `onClick` is set, wrapped in a flex row with optional trailing. */
  children: ReactNode;
  /** When provided, card renders as a button with hover/active styles and optional trailing chevron. */
  onClick?: () => void;
  /** Right-side content (e.g. chevron or actions). When `onClick` is set and this is omitted, a chevron is shown. Pass `null` to hide. */
  trailing?: ReactNode | null;
  className?: string;
}

const baseClass = 'w-full text-left bg-white border border-gray-200 rounded-lg p-4 shadow-sm';
const interactiveClass =
  'hover:shadow-md hover:border-gray-300 transition-all active:bg-gray-50 cursor-pointer';

/**
 * Reusable card for list/item views (e.g. mobile table alternatives).
 * Use with `onClick` for tappable rows (library, templates, outreach); use without for custom layout (e.g. editors with dropdown).
 */
export function ListCard({ children, onClick, trailing, className }: ListCardProps) {
  const isInteractive = onClick != null;
  const showTrailing = isInteractive && trailing !== null;
  const trailingContent =
    showTrailing && trailing === undefined ? (
      <ChevronRight className="h-5 w-5" aria-hidden />
    ) : (
      trailing
    );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(baseClass, interactiveClass, className)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">{children}</div>
          {trailingContent != null && (
            <div className="flex-shrink-0 text-gray-400">{trailingContent}</div>
          )}
        </div>
      </button>
    );
  }

  return <div className={cn(baseClass, className)}>{children}</div>;
}
