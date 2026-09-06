'use client';

import { ExternalLink, FileText, X } from 'lucide-react';
import { BlockEditorClientWrapper } from '@/components/Editor/components/BlockEditor/components/BlockEditorClientWrapper';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/utils/styles';
import type { AIModeDocument } from './useAIModeDocument';

interface DocumentPaneProps {
  readonly document: AIModeDocument;
  readonly onClose: () => void;
  readonly className?: string;
}

/**
 * The right pane: the note the assistant is composing. Settled content
 * renders read-only in the real editor; while a section is being written the
 * streaming prose is appended below it, and when a turn runs with no draft
 * an in-progress row says what the assistant is doing instead of leaving the
 * page frozen.
 */
export function DocumentPane({ document, onClose, className }: DocumentPaneProps) {
  const { note, content, loading, error, status, draftText, phaseLabel, sectionCount } = document;
  const title = content?.title?.trim() || note?.title?.trim() || 'Document';
  const writing = status === 'drafting' || status === 'working';

  return (
    <div className={cn('flex h-full min-h-0 flex-col bg-gray-50/60', className)}>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3">
        <FileText className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
        <h2 className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800" title={title}>
          {title}
        </h2>
        {sectionCount > 0 && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-px text-[11px] font-semibold',
              writing ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-600'
            )}
          >
            {writing && <Loader size="sm" className="!h-2.5 !w-2.5 text-primary-500" />}
            {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
          </span>
        )}
        {document.notebookHref && (
          <a
            href={document.notebookHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Open in notebook
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close document"
          className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 tablet:!p-5">
        {error && content == null ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-gray-600">{error}</p>
            <Button variant="outlined" size="sm" onClick={document.refetch}>
              Try again
            </Button>
          </div>
        ) : loading && content == null ? (
          <div className="flex justify-center py-16">
            <Loader size="md" className="text-primary-500" />
          </div>
        ) : (
          <article className="mx-auto max-w-[640px] rounded-xl border border-gray-200 bg-white px-6 py-7 shadow-sm tablet:!px-9 tablet:!py-9">
            {content?.contentJson && content.versionId > 0 ? (
              <BlockEditorClientWrapper
                key={content.versionId}
                contentJson={content.contentJson}
                editable={false}
              />
            ) : status === 'drafting' ? null : (
              <EmptyDocument label={phaseLabel} active={status === 'working'} />
            )}

            {status === 'drafting' && draftText && <DraftSection text={draftText} />}

            {status === 'working' && content != null && content.versionId > 0 && (
              <InProgressRow label={phaseLabel ?? 'Working'} />
            )}
          </article>
        )}
      </div>
    </div>
  );
}

/**
 * The note exists but has no version yet. Spins only while a turn is
 * running; a settled conversation that never wrote anything says so plainly.
 */
function EmptyDocument({
  label,
  active,
}: {
  readonly label: string | null;
  readonly active: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      {active ? (
        <>
          <Loader size="sm" className="text-primary-500" />
          <p className="text-sm font-medium text-gray-700">Starting the document…</p>
          {label && <p className="text-xs text-gray-500">{label}</p>}
        </>
      ) : (
        <p className="text-sm text-gray-500">Nothing has been written to this document yet.</p>
      )}
    </div>
  );
}

/** The section being written, appended below the settled content. */
function DraftSection({ text }: { readonly text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((paragraph) => paragraph.trim().length > 0);
  return (
    <section
      aria-live="polite"
      aria-label="Section being written"
      className="prose prose-sm prose-neutral mt-6 max-w-none border-t border-dashed border-primary-200 pt-5"
    >
      <p className="!mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary-600">
        <Loader size="sm" className="!h-2.5 !w-2.5" />
        Writing
      </p>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {paragraph}
          {index === paragraphs.length - 1 && (
            <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-primary-500" />
          )}
        </p>
      ))}
    </section>
  );
}

/** No draft is streaming, but a turn is running: say what it's doing. */
function InProgressRow({ label }: { readonly label: string }) {
  return (
    <div className="mt-6 flex items-center gap-2 border-t border-dashed border-gray-200 pt-4 text-sm text-gray-500">
      <Loader size="sm" className="!h-3.5 !w-3.5 text-primary-500" />
      <span>{label}…</span>
    </div>
  );
}
