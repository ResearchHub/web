'use client';

import { useEffect, useMemo } from 'react';
import { File } from 'lucide-react';
import { FundingDirectionIcon } from '@/components/Funding/FundingDirectionIcon';
import { Button } from '@/components/ui/Button';
import { ConversationListSkeleton } from '@/components/skeletons/AIModeSkeleton';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useUser } from '@/contexts/UserContext';
import { useOrganizationNotes } from '@/hooks/useOrganizationNotes';
import { getNoteKind, isChangelogNote, type Note } from '@/types/note';
import { SidebarGroupHeading } from './SidebarGroupHeading';
import { SidebarRow } from './SidebarRow';

interface DocumentsSectionProps {
  readonly activeNoteId: number | null;
  /** A note the open conversation just created; the list fetches again to show it. */
  readonly recentNoteId: number | null;
  readonly onSelect: (noteId: number) => void;
}

/** The kind's mark: the money's direction for a proposal or an RFP, a plain file otherwise. */
function NoteKindIcon({ note }: { readonly note: Note }) {
  const kind = getNoteKind(note);
  if (kind === 'rfp')
    return <FundingDirectionIcon direction="giving" className="h-[22px] w-[22px]" />;
  if (kind === 'proposal') {
    return <FundingDirectionIcon direction="receiving" className="h-[22px] w-[22px]" />;
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600"
    >
      <File className="h-3 w-3" />
    </span>
  );
}

/**
 * The user's notebook, as the notebook itself lists it: every note they can
 * open, newest first, each marked by what it is. Opening one puts the
 * document in the main pane with a fresh chat beside it.
 */
export function DocumentsSection({ activeNoteId, recentNoteId, onSelect }: DocumentsSectionProps) {
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
    <section aria-label="Documents">
      <SidebarGroupHeading>Documents</SidebarGroupHeading>

      {notes.isLoading && <ConversationListSkeleton count={4} />}

      {notes.error && !notes.isLoading && (
        <div className="flex flex-col items-start gap-2 px-3 py-2">
          <p className="text-xs leading-relaxed text-gray-600">Couldn’t load your documents.</p>
          <Button variant="outlined" size="sm" onClick={() => void refresh()}>
            Try again
          </Button>
        </div>
      )}

      {!notes.isLoading && !notes.error && rows.length === 0 && (
        <p className="px-3 py-2 text-xs text-gray-400">No documents yet.</p>
      )}

      {rows.map((note) => (
        <SidebarRow
          key={note.id}
          title={note.title?.trim() || 'Untitled'}
          leading={<NoteKindIcon note={note} />}
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
