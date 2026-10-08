'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { FileText, MoveRight, Plus } from 'lucide-react';
import { useOptionalAIMode } from '@/components/AIMode/AIModeContext';
import { AssistantActivityDot } from '@/components/AgentChat/AssistantActivityDot';
import { FundingDraftMenuItems } from '@/components/Funding/fundingDraftOptions';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { BaseMenu } from '@/components/ui/form/BaseMenu';
import { useFundingDocuments } from '@/contexts/FundingDocumentsContext';
import type { Note } from '@/types/note';
import { cn } from '@/utils/styles';
import { SidebarRow } from './SidebarRow';

/** Rows shown per section; everything else is a click away in My Funding. */
const DRAFTS_SHOWN = 8;
const PUBLISHED_SHOWN = 5;

interface SidebarDocumentsProps {
  /** Runs after any choice that should put a drawer or an overlay away. */
  readonly onNavigate?: () => void;
  readonly className?: string;
}

/**
 * The user's RFPs and proposals under the app's nav, on every page: what is
 * still a draft, with a "+" to start another, and what has been published.
 * Each opens in the workspace; the one open there is highlighted.
 */
export function SidebarDocuments({ onNavigate, className }: SidebarDocumentsProps) {
  const { drafts, published, status, refresh } = useFundingDocuments();
  const { startNew, openDraft } = useFundingDrafting();
  const aiMode = useOptionalAIMode();
  const target = aiMode?.target;
  const workingNoteId = aiMode?.workingNoteId ?? null;
  const activeNoteId = target?.kind === 'document' ? target.noteId : null;

  if (status === 'off') return null;

  const open = (note: Note) => {
    // The open document stays on the chat it is on.
    if (note.id !== activeNoteId) openDraft(note);
    onNavigate?.();
  };
  const rows = (notes: readonly Note[], shown: number) =>
    notes
      // The open document keeps its row, even when it is older than the rest.
      .filter((note, index) => index < shown || note.id === activeNoteId)
      .map((note) => (
        <SidebarRow
          key={note.id}
          title={note.title?.trim() || 'Untitled'}
          leading={<FileText className="h-[15px] w-[15px] shrink-0 text-gray-500" aria-hidden />}
          trailing={
            note.id === workingNoteId ? (
              <AssistantActivityDot state="working" className="shrink-0" />
            ) : undefined
          }
          isActive={note.id === activeNoteId}
          onSelect={() => open(note)}
        />
      ));

  const ready = status === 'ready';
  const hasPublished = ready && published.length > 0;

  return (
    <div className={cn('px-3 pb-3', className)}>
      <div aria-hidden="true" className="mx-2 mb-3 mt-3.5 h-px bg-gray-200" />

      <section aria-label="Drafts">
        <SectionHeading
          action={
            <BaseMenu
              align="start"
              sideOffset={4}
              className="w-[320px] max-w-[calc(100vw-1rem)] rounded-xl p-1"
              trigger={
                <button
                  type="button"
                  aria-label="New draft"
                  title="New draft"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              }
            >
              <FundingDraftMenuItems
                onSelect={(option) => {
                  startNew(option.intent);
                  onNavigate?.();
                }}
              />
            </BaseMenu>
          }
        >
          Drafts
        </SectionHeading>

        {status === 'loading' ? (
          <RowsSkeleton />
        ) : status === 'error' ? (
          <div className="flex flex-col items-start gap-1 px-2.5 py-1.5">
            <p className="text-xs text-gray-500">Couldn’t load your documents.</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Try again
            </button>
          </div>
        ) : drafts.length === 0 ? (
          <p className="px-2.5 py-1.5 text-xs text-gray-500">No drafts yet.</p>
        ) : (
          rows(drafts, DRAFTS_SHOWN)
        )}
      </section>

      {hasPublished && (
        <section aria-label="Published" className="mt-2">
          <SectionHeading>Published</SectionHeading>
          {rows(published, PUBLISHED_SHOWN)}
        </section>
      )}

      {ready && (drafts.length > 0 || hasPublished) && (
        <Link
          href="/my-funding"
          onClick={onNavigate}
          className="ml-2.5 mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          See all
          <MoveRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function SectionHeading({
  children,
  action,
}: {
  readonly children: ReactNode;
  readonly action?: ReactNode;
}) {
  return (
    <div className="flex h-8 items-center justify-between pl-2.5">
      <h2 className="text-xs font-medium text-gray-500">{children}</h2>
      {action}
    </div>
  );
}

/** Two rows' worth of placeholder: the first load only. */
function RowsSkeleton() {
  return (
    <div aria-hidden="true">
      {['w-[70%]', 'w-[55%]'].map((width) => (
        <div key={width} className="flex items-center gap-2.5 px-2.5 py-2">
          <div className="h-[15px] w-[15px] shrink-0 animate-pulse rounded bg-gray-100" />
          <div className={cn('h-3 animate-pulse rounded bg-gray-100', width)} />
        </div>
      ))}
    </div>
  );
}
