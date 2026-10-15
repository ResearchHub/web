'use client';

import { FileText } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';

interface DocumentCardProps {
  readonly title: string;
  /** Out on the site, rather than still a draft. */
  readonly published: boolean;
  /** What the assistant is doing to it under this turn, if it is still at it. */
  readonly writing: 'drafting' | 'working' | null;
  readonly onOpen: () => void;
}

/**
 * The document's card in the transcript, under the newest turn that wrote
 * to it. Shown while the document itself is out of sight (a phone's Chat
 * view, or Chat alone on a wide screen): the sign that the assistant's work
 * landed somewhere, and the way to it.
 */
export function DocumentCard({ title, published, writing, onOpen }: DocumentCardProps) {
  const status =
    writing === 'drafting' ? 'Writing…' : writing === 'working' ? 'Working…' : 'Updated';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-primary-200 hover:bg-primary-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
          <span>{published ? 'Published' : 'Draft'}</span>
          <span aria-hidden="true">·</span>
          <span className={cn(writing && 'text-primary-600')}>{status}</span>
        </span>
      </span>
      <span className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800">
        Open
      </span>
    </button>
  );
}
