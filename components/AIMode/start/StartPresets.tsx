'use client';

import { cn } from '@/utils/styles';
import { RFP_START_PRESETS } from '../copy';

interface StartPresetsProps {
  /** Sends the preset's message as the draft's first. */
  readonly onSelect: (message: string) => void;
  readonly disabled?: boolean;
}

/**
 * Things a funder might ask for, under the new-RFP composer: one click sends
 * the full message and starts the draft, so a visitor sees the assistant at
 * work without having to think of what to type.
 */
export function StartPresets({ onSelect, disabled = false }: StartPresetsProps) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Examples">
      {RFP_START_PRESETS.map(({ label, message }) => (
        <li key={label} className="min-w-0 max-w-full">
          <button
            type="button"
            onClick={() => onSelect(message)}
            disabled={disabled}
            title={message}
            className={cn(
              'max-w-full truncate rounded-md bg-gray-100 px-2.5 py-1 text-sm text-gray-700 transition-colors',
              'hover:bg-gray-200 hover:text-gray-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
              'disabled:cursor-not-allowed disabled:opacity-60'
            )}
          >
            {label}
          </button>
        </li>
      ))}
    </ul>
  );
}
