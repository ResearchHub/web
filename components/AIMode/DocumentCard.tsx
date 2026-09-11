'use client';

import { FileText, Lock } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';
import type { DocumentStatus } from './useAIModeDocument';

interface DocumentCardProps {
  readonly title: string;
  readonly status: DocumentStatus;
  /** The document is showing beside the chat (desktop) or in the drawer (mobile). */
  readonly open: boolean;
  readonly onOpen: () => void;
}

/**
 * The document's card in the transcript, seated under the turn that created
 * it. The one place the reader is told the document exists and can reach it
 * from — the pane beside the chat on desktop, a drawer on mobile.
 */
export function DocumentCard({ title, status, open, onOpen }: DocumentCardProps) {
  const writing = status === 'drafting' || status === 'working';
  const subtitle = writing
    ? status === 'drafting'
      ? 'Writing…'
      : 'Working…'
    : status === 'empty'
      ? 'Nothing written yet'
      : 'Ready to edit';

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-pressed={open}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border bg-white p-3 text-left shadow-sm transition-colors',
        open
          ? 'border-primary-200 ring-1 ring-primary-100'
          : 'border-gray-200 hover:border-primary-200 hover:bg-primary-50/40'
      )}
    >
      <span
        className={cn(
          'flex h-12 w-10 shrink-0 items-center justify-center rounded-md border bg-gray-50',
          writing ? 'border-primary-200 text-primary-600' : 'border-gray-200 text-gray-500'
        )}
        aria-hidden="true"
      >
        {writing ? (
          <Loader size="sm" className="!h-4 !w-4 text-primary-500" />
        ) : (
          <FileText className="h-5 w-5" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900">{title}</span>
        <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
          <span>Document</span>
          <span aria-hidden="true">·</span>
          <Lock className="h-3 w-3" aria-hidden="true" />
          <span>Only you</span>
          <span aria-hidden="true">·</span>
          <span className={cn(writing && 'text-primary-600')}>{subtitle}</span>
        </span>
      </span>
      <span className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800">
        {open ? 'Showing' : 'Open'}
      </span>
    </button>
  );
}
