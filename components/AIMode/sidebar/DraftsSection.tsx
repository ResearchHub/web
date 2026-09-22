'use client';

import { useEffect, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { NoteStatusDot } from '@/components/Notebook/NoteStatus';
import { Button } from '@/components/ui/Button';
import { ConversationListSkeleton } from '@/components/skeletons/AIModeSkeleton';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useUser } from '@/contexts/UserContext';
import { useOrganizationNotes } from '@/hooks/useOrganizationNotes';
import { isChangelogNote, isPublishedNote, type Note } from '@/types/note';
import { SidebarGroupHeading } from './SidebarGroupHeading';
import { SidebarRow } from './SidebarRow';

interface DraftsSectionProps {
  readonly activeNoteId: number | null;
  /** A note the open conversation just created; the list fetches again to show it. */
  readonly recentNoteId: number | null;
  readonly onSelect: (noteId: number) => void;
}

/** A plain document, with a dot at its corner for whether it has gone out: blue published, amber draft. */
function DraftIcon({ note }: { readonly note: Note }) {
  return (
    <span className="relative flex h-[22px] w-[22px] shrink-0 items-center justify-center text-gray-500">
      <FileText className="h-4 w-4" aria-hidden="true" />
      <NoteStatusDot
        published={isPublishedNote(note)}
        className="absolute -bottom-px -right-px ring-2 ring-gray-100"
      />
    </span>
  );
}

/**
 * What the user has written, as the notebook lists it: every note they can
 * open, newest first, published or not. Opening one puts the document in
 * the main pane with a fresh chat beside it.
 */
export function DraftsSection({ activeNoteId, recentNoteId, onSelect }: DraftsSectionProps) {
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const { user } = useUser();
  const notes = useOrganizationNotes(selectedOrg?.slug, { waiting: isLoadingOrg });
  const isModerator = Boolean(user?.isModerator);

  const rows = useMemo(
    () =>
      notes.notes
        .filter(
          (note) =>
            (note.access === 'WORKSPACE' ||
              note.access === 'SHARED' ||
              note.access === 'PRIVATE') &&
            (isModerator || !isChangelogNote(note))
        )
        .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()),
    [notes.notes, isModerator]
  );

  // The assistant created a note this list does not have yet.
  const { refresh } = notes;
  const known = recentNoteId == null || notes.notes.some((note) => note.id === recentNoteId);
  useEffect(() => {
    if (!known && !notes.isLoading) void refresh();
    // Refetch once per new note, not on every list change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentNoteId, known]);

  return (
    <section aria-label="Drafts">
      <SidebarGroupHeading>Drafts</SidebarGroupHeading>

      {notes.isLoading && <ConversationListSkeleton count={4} />}

      {notes.error && !notes.isLoading && (
        <div className="flex flex-col items-start gap-2 px-3 py-2">
          <p className="text-xs leading-relaxed text-gray-600">Couldn’t load your drafts.</p>
          <Button variant="outlined" size="sm" onClick={() => void refresh()}>
            Try again
          </Button>
        </div>
      )}

      {!notes.isLoading && !notes.error && rows.length === 0 && (
        <p className="px-3 py-2 text-xs text-gray-400">No drafts yet.</p>
      )}

      {rows.map((note) => (
        <SidebarRow
          key={note.id}
          title={note.title?.trim() || 'Untitled'}
          leading={<DraftIcon note={note} />}
          isActive={note.id === activeNoteId}
          onSelect={() => onSelect(note.id)}
        />
      ))}

      {notes.hasMore && (
        <button
          type="button"
          onClick={notes.loadMore}
          disabled={notes.isLoadingMore}
          className="ml-1 mt-0.5 rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200/60 hover:text-gray-900 disabled:opacity-60"
        >
          {notes.isLoadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </section>
  );
}
