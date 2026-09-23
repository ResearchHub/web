'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { NoteStatusLine } from '@/components/Notebook/NoteStatus';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useOrganizationNotes } from '@/hooks/useOrganizationNotes';
import { getNoteKind, isPublishedNote, type NoteKind } from '@/types/note';
import { formatTimeAgo } from '@/utils/date';
import { cn } from '@/utils/styles';

interface NoteDraftsProps {
  /** Which drafts: the user's RFPs, or their proposals. */
  readonly kind: Extract<NoteKind, 'rfp' | 'proposal'>;
  readonly className?: string;
}

/** The most recent drafts shown before the list asks to be expanded, so the published work stays in reach. */
const RECENT_COUNT = 4;

/**
 * The user's unpublished RFPs or proposals, listed ahead of the published
 * ones in a My Funding section: each a row carrying its title and, under
 * it, the draft's amber dot and when it was last edited. A row opens the
 * draft where the user drafts. Renders nothing while there are none.
 */
export function NoteDrafts({ kind, className }: NoteDraftsProps) {
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const notes = useOrganizationNotes(selectedOrg?.slug, { waiting: isLoadingOrg });
  const { openDraft } = useFundingDrafting();
  const [showAll, setShowAll] = useState(false);

  const drafts = useMemo(
    () =>
      notes.notes
        .filter((note) => !note.isRemoved && !isPublishedNote(note) && getNoteKind(note) === kind)
        .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()),
    [notes.notes, kind]
  );
  const shown = showAll ? drafts : drafts.slice(0, RECENT_COUNT);
  const hiddenCount = drafts.length - shown.length;

  if (drafts.length === 0) return null;

  return (
    <ul className={cn('space-y-3', className)}>
      {shown.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            onClick={() => openDraft(note)}
            className="group flex w-full items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <FileText className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-gray-900">
                {note.title?.trim() || 'Untitled draft'}
              </span>
              <NoteStatusLine
                published={false}
                detail={`Edited ${formatTimeAgo(note.updatedDate)}`}
                className="mt-0.5"
              />
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-500 transition-colors group-hover:text-gray-900">
              Continue
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </button>
        </li>
      ))}
      {hiddenCount > 0 && (
        <li className="!mt-2">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Show {hiddenCount} more {hiddenCount === 1 ? 'draft' : 'drafts'}
          </button>
        </li>
      )}
    </ul>
  );
}
