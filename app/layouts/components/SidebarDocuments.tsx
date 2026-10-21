'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { FileText, MoveRight, Plus } from 'lucide-react';
import { useOptionalAIMode } from '@/components/AIMode/AIModeContext';
import { AssistantActivityDot } from '@/components/AgentChat/AssistantActivityDot';
import { DraftMenu } from '@/components/Funding/DraftMenu';
import { NewDraftMenu } from '@/components/Funding/NewDraftMenu';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useFundingNotes } from '@/contexts/FundingNotesContext';
import { useUser } from '@/contexts/UserContext';
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
 * Each opens in the workspace; the one open there is highlighted. With no
 * drafts, and for a visitor who is signed out, Drafts is still there with a
 * "New draft" row in place of the list.
 */
export function SidebarDocuments({ onNavigate, className }: SidebarDocumentsProps) {
  const { drafts, published, status, refresh } = useFundingNotes();
  const { isLoading: userLoading } = useUser();
  const { startNew, openDraft } = useFundingDrafting();
  const aiMode = useOptionalAIMode();
  const target = aiMode?.target;
  const workingNoteId = aiMode?.workingNoteId ?? null;
  const activeNoteId = target?.kind === 'document' ? target.noteId : null;

  const open = (note: Note) => {
    // The open document stays on the chat it is on.
    if (note.id !== activeNoteId) openDraft(note);
    onNavigate?.();
  };
  const rows = (notes: readonly Note[], shown: number, withMenu = false) =>
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
          menu={
            withMenu ? (
              <DraftMenu
                noteId={note.id}
                title={note.title?.trim() || 'Untitled'}
                isOpen={note.id === activeNoteId}
                triggerClassName="h-6 w-6"
              />
            ) : undefined
          }
          isActive={note.id === activeNoteId}
          onSelect={() => open(note)}
        />
      ));

  const ready = status === 'ready';
  const hasPublished = ready && published.length > 0;
  // Signed out, or signed in with nothing drafted: the way to start one is
  // the list's only row, so the heading needs no "+" of its own.
  const showsNewDraftRow = status === 'off' ? !userLoading : ready && drafts.length === 0;
  const startDraft = (intent: FundingIntent) => {
    startNew(intent);
    onNavigate?.();
  };

  return (
    <div className={cn('px-3 pb-3', className)}>
      <div aria-hidden="true" className="mx-2 mb-3 mt-3.5 h-px bg-gray-200" />

      <section aria-label="Drafts">
        <SectionHeading
          action={
            showsNewDraftRow ? undefined : (
              <NewDraftMenu
                onSelect={startDraft}
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
              />
            )
          }
        >
          Drafts
        </SectionHeading>

        {showsNewDraftRow ? (
          <NewDraftMenu
            onSelect={startDraft}
            trigger={
              <button
                type="button"
                // A document row's shape, in the gray of something not there yet.
                className="mb-0.5 flex w-full items-center gap-2.5 rounded-lg py-2 pl-2.5 pr-3 text-left text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 data-[state=open]:bg-gray-50"
              >
                <Plus className="h-[15px] w-[15px] shrink-0 text-gray-500" aria-hidden="true" />
                New draft
              </button>
            }
          />
        ) : status === 'loading' || status === 'off' ? (
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
        ) : (
          rows(drafts, DRAFTS_SHOWN, true)
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
