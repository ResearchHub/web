'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { DashboardEmptyState } from '@/components/Funding/dashboard/DashboardEmptyState';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { NoteStatusLine } from '@/components/Notebook/NoteStatus';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useOrganizationNotes } from '@/hooks/useOrganizationNotes';
import type { FeedEntry, FeedGrantContent, FeedPostContent } from '@/types/feed';
import { getNoteKind, isPublishedNote, type Note, type NoteKind } from '@/types/note';
import { formatTimeAgo } from '@/utils/date';
import { buildWorkUrl } from '@/utils/url';
import { cn } from '@/utils/styles';

type FundingKind = Extract<NoteKind, 'rfp' | 'proposal'>;

interface FundingRowsProps {
  /** Which work: the user's RFPs, or their proposals. */
  readonly kind: FundingKind;
  /** The published ones, from the feed. */
  readonly entries: FeedEntry[];
  readonly isLoading: boolean;
  readonly hasMore: boolean;
  readonly loadMore: () => void;
  /** Drafts belong on the user's own page only, never on a moderator's view of another funder. */
  readonly includeDrafts: boolean;
  /** Shown when there is nothing at all, drafts included. */
  readonly emptyMessage: string;
}

/** The rows shown before the list asks to be expanded. */
const RECENT_COUNT = 4;

/** One row, whichever side of publishing it is on. */
interface FundingRow {
  readonly key: string;
  readonly title: string;
  readonly published: boolean;
  /** After the status: when it was edited or published. */
  readonly detail: string;
  /** A published item's page; a draft opens where the user drafts instead. */
  readonly href?: string;
  readonly note?: Note;
}

const publishedRow = (entry: FeedEntry, kind: FundingKind): FundingRow => {
  const content = entry.content as FeedPostContent | FeedGrantContent;
  return {
    key: `published-${entry.id}`,
    title: content.title?.trim() || 'Untitled',
    published: true,
    detail: entry.timestamp ? formatTimeAgo(entry.timestamp) : '',
    href: buildWorkUrl({
      id: content.id,
      slug: content.slug,
      contentType: kind === 'rfp' ? 'funding_request' : 'preregistration',
    }),
  };
};

const draftRow = (note: Note): FundingRow => ({
  key: `draft-${note.id}`,
  title: note.title?.trim() || 'Untitled draft',
  published: false,
  detail: `Edited ${formatTimeAgo(note.updatedDate)}`,
  note,
});

/**
 * A My Funding section's list: the user's RFPs or proposals as one kind of
 * row, drafts first and then the published ones, each with its title and
 * under it the status dot — amber draft, blue published — and a date. A
 * draft opens where the user drafts; a published row opens its page. Four
 * rows show before the list asks to be expanded.
 */
export function FundingRows({
  kind,
  entries,
  isLoading,
  hasMore,
  loadMore,
  includeDrafts,
  emptyMessage,
}: FundingRowsProps) {
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const notes = useOrganizationNotes(includeDrafts ? selectedOrg?.slug : null, {
    waiting: includeDrafts && isLoadingOrg,
  });
  const { openDraft } = useFundingDrafting();
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo<FundingRow[]>(() => {
    const drafts = includeDrafts
      ? notes.notes
          .filter((note) => !note.isRemoved && !isPublishedNote(note) && getNoteKind(note) === kind)
          .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime())
          .map(draftRow)
      : [];
    return [...drafts, ...entries.map((entry) => publishedRow(entry, kind))];
  }, [includeDrafts, notes.notes, entries, kind]);

  // Either source still on its first load, with nothing to show for it yet.
  const pending =
    (isLoading && entries.length === 0) ||
    (includeDrafts && notes.isLoading && notes.notes.length === 0);

  if (rows.length === 0) {
    if (pending) return <RowsSkeleton />;
    return <DashboardEmptyState>{emptyMessage}</DashboardEmptyState>;
  }

  const shown = showAll ? rows : rows.slice(0, RECENT_COUNT);
  const hiddenCount = rows.length - shown.length;

  return (
    <ul className="space-y-3">
      {shown.map((row) => (
        <li key={row.key}>
          {row.note ? (
            <button
              type="button"
              onClick={() => openDraft(row.note as Note)}
              className={rowClass(false)}
            >
              <RowFace row={row} action="Continue" />
            </button>
          ) : (
            <Link href={row.href ?? '#'} className={rowClass(true)}>
              <RowFace row={row} action="Open" />
            </Link>
          )}
        </li>
      ))}

      {pending && <li className="h-16 animate-pulse rounded-xl bg-gray-100" aria-hidden="true" />}

      {hiddenCount > 0 && (
        <li className="!mt-2">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Show {hiddenCount} more
          </button>
        </li>
      )}

      {showAll && hasMore && (
        <li className="!mt-2">
          <button
            type="button"
            onClick={loadMore}
            className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Load more
          </button>
        </li>
      )}
    </ul>
  );
}

/** A draft's row is dashed, still being drawn; a published one is solid. */
const rowClass = (published: boolean) =>
  cn(
    'group flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-colors',
    published
      ? 'border-gray-200 shadow-sm hover:border-gray-300 hover:bg-gray-50'
      : 'border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50'
  );

function RowFace({ row, action }: { readonly row: FundingRow; readonly action: string }) {
  return (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        <FileText className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-900">{row.title}</span>
        <NoteStatusLine published={row.published} detail={row.detail} className="mt-0.5" />
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-500 transition-colors group-hover:text-gray-900">
        {action}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </>
  );
}

function RowsSkeleton() {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <li key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </ul>
  );
}
