'use client';

import { Logo } from '@/components/ui/Logo';
import { ChatPresets } from './ChatPresets';

interface ChatEmptyStateProps {
  readonly noteIsEmpty: boolean;
  readonly noteIsRfp: boolean;
  readonly onSelectPreset: (message: string) => void;
  readonly presetsDisabled: boolean;
  /** What the help line calls the thing being written: the notebook's "note", the workspace's "document". */
  readonly noun?: string;
}

/**
 * A chat on a document before its first message: who the assistant is, what
 * it can do, and a few ways to start, chosen by what the document is and
 * whether anything is written in it yet.
 */
export function ChatEmptyState({
  noteIsEmpty,
  noteIsRfp,
  onSelectPreset,
  presetsDisabled,
  noun = 'note',
}: ChatEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50">
          <Logo size={32} noText />
        </div>
        <div>
          <p className="flex items-center justify-center gap-1.5 font-serif text-lg tracking-tight text-gray-800">
            Research assistant
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
            Ask questions about this {noun}, search the web and scholarly literature, or have the
            assistant edit the draft for you.
          </p>
        </div>
      </div>
      <ChatPresets
        noteIsEmpty={noteIsEmpty}
        isRfp={noteIsRfp}
        onSelect={onSelectPreset}
        disabled={presetsDisabled}
      />
    </div>
  );
}
