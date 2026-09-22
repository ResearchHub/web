'use client';

import { ListChecks } from 'lucide-react';
import { cn } from '@/utils/styles';

/** Fixed, so the strip can count how many other blocks fit beside it. Wide
 * enough for the label, the folded count and the tally on one line each. */
export const ALL_DETAILS_BLOCK_WIDTH = 140;

interface AllDetailsBlockProps {
  readonly done: number;
  readonly total: number;
  /** Blocks the strip had no room for; they are reachable here. */
  readonly hiddenCount: number;
  /** The full form is showing. */
  readonly active: boolean;
  readonly onClick: () => void;
}

/** The last block: the whole details form, and the way to any block that did not fit. */
export function AllDetailsBlock({
  done,
  total,
  hiddenCount,
  active,
  onClick,
}: AllDetailsBlockProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{ width: ALL_DETAILS_BLOCK_WIDTH }}
      className={cn(
        'flex h-[46px] shrink-0 flex-col justify-center gap-0.5 rounded-lg border px-2.5 text-left transition-colors',
        active
          ? 'border-primary-400 bg-primary-50 ring-[3px] ring-primary-100'
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
      )}
    >
      <span className="flex items-center justify-between gap-1.5 whitespace-nowrap">
        <span
          className={cn(
            'flex items-center gap-1.5 text-[11px] font-medium',
            active ? 'text-primary-700' : 'text-gray-600'
          )}
        >
          <ListChecks className="h-3 w-3 shrink-0" aria-hidden="true" />
          All details
        </span>
        {hiddenCount > 0 && (
          <span
            title={`${hiddenCount} more ${hiddenCount === 1 ? 'detail' : 'details'} inside`}
            className="shrink-0 rounded-full bg-gray-200 px-1.5 text-[10px] font-bold text-gray-700"
          >
            +{hiddenCount}
          </span>
        )}
      </span>
      <span className="truncate whitespace-nowrap text-[13px] font-semibold text-gray-900">
        {done} of {total} done
      </span>
    </button>
  );
}
