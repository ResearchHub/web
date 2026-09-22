'use client';

import { Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { cn } from '@/utils/styles';
import type { DetailBlockConfig } from './detailBlocks';

/** A block is this wide at the least; the strip folds blocks that would be narrower. */
export const DETAIL_BLOCK_MIN_WIDTH = 148;

interface DetailBlockProps {
  readonly config: DetailBlockConfig;
  readonly noteId: number;
  /** The value to show, or null while nothing is set. */
  readonly value: string | null;
  /** This block's editor is showing. */
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

/**
 * One publishing detail as a small card: what it is, whether it is set, and
 * the value. Clicking opens its editor — a popover with just that section of
 * the form, or a modal the block owns.
 */
export function DetailBlock({ config, noteId, value, open, onOpenChange }: DetailBlockProps) {
  const filled = value != null;
  const face = <DetailBlockFace config={config} value={value} filled={filled} open={open} />;

  if (config.editor.kind === 'modal') {
    const { Modal } = config.editor;
    return (
      <>
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-expanded={open}
          className={blockClass(filled, open)}
        >
          {face}
        </button>
        <Modal noteId={noteId} isOpen={open} onClose={() => onOpenChange(false)} />
      </>
    );
  }

  const { Section } = config.editor;
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button type="button" className={blockClass(filled, open)}>
          {face}
        </button>
      </PopoverTrigger>
      {/* No height cap or overflow here: the people pickers drop their list
          below the input inside the panel. */}
      <PopoverContent
        aria-label={config.label}
        className="w-[340px] max-w-[calc(100vw-1rem)] p-4 shadow-xl"
      >
        <Section className="p-0" />
      </PopoverContent>
    </Popover>
  );
}

const blockClass = (filled: boolean, open: boolean) =>
  cn(
    'flex min-w-0 flex-1 flex-col justify-center border-r h-full bg-white px-2.5 text-left transition-colors',
    // The outline sits inside the block, so it is the same on every side
    // whatever the neighbours' borders do.
    open
      ? 'relative z-10 border-primary-400 bg-primary-50 outline outline-2 -outline-offset-2 outline-primary-400'
      : filled
        ? 'border-gray-200 hover:bg-gray-50'
        : 'border-gray-300 hover:bg-gray-50'
  );

function DetailBlockFace({
  config,
  value,
  filled,
  open,
}: {
  readonly config: DetailBlockConfig;
  readonly value: string | null;
  readonly filled: boolean;
  readonly open: boolean;
}) {
  const Icon = config.icon;
  return (
    <>
      <span className="flex items-center justify-between gap-1.5 whitespace-nowrap">
        <span
          className={cn(
            'flex min-w-0 items-center gap-1.5 truncate text-[11px] font-medium',
            open ? 'text-primary-700' : 'text-gray-600'
          )}
        >
          <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
          {config.label}
        </span>
        <DetailBlockMark filled={filled} optional={Boolean(config.optional)} />
      </span>
      <span
        className={cn(
          'truncate text-[13px] font-semibold',
          filled ? 'text-gray-900' : 'text-primary-700'
        )}
      >
        {value ?? config.emptyLabel}
      </span>
    </>
  );
}

/** Done, still required, or optional — at a glance, at the block's corner. */
function DetailBlockMark({
  filled,
  optional,
}: {
  readonly filled: boolean;
  readonly optional: boolean;
}) {
  if (filled) {
    return (
      <span
        aria-label="Done"
        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
      >
        <Check className="h-2 w-2" strokeWidth={3.5} aria-hidden="true" />
      </span>
    );
  }
  if (optional) {
    return <span className="shrink-0 text-[10px] font-medium text-gray-500">Optional</span>;
  }
  return (
    <span aria-label="Required" className="h-[7px] w-[7px] shrink-0 rounded-full bg-amber-700" />
  );
}
