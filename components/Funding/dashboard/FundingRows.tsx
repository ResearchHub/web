'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DashboardEmptyState } from '@/components/Funding/dashboard/DashboardEmptyState';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { NoteStatusLine } from '@/components/Notebook/NoteStatus';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useOrganizationNotes } from '@/hooks/useOrganizationNotes';
import { NoteService } from '@/services/note.service';
import type { FeedEntry, FeedGrantContent, FeedPostContent } from '@/types/feed';
import { getNoteKind, isPublishedNote, type Note, type NoteKind } from '@/types/note';
import { formatCurrency } from '@/utils/currency';
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

/** An amount in both currencies, shown in whichever the user prefers. */
interface Money {
  readonly usd: number;
  readonly rsc: number;
}

/** One row, whichever side of publishing it is on. */
interface FundingRow {
  readonly key: string;
  readonly title: string;
  readonly published: boolean;
  /** Published and still taking proposals or contributions. */
  readonly active: boolean;
  /** After the status: when it was edited or published, and a closed item's state. */
  readonly detail: string;
  readonly image: string | null;
  /** The money on it: an RFP's funding, a proposal's raised amount and goal. */
  readonly money?: { readonly label: string; readonly amount: Money; readonly goal?: Money };
  /** A published item's page; a draft opens where the user drafts instead. */
  readonly href?: string;
  readonly note?: Note;
}

const STATE_LABEL: Record<string, string> = {
  CLOSED: 'Closed',
  COMPLETED: 'Completed',
  DECLINED: 'Declined',
  PENDING: 'Pending',
};

function publishedRow(entry: FeedEntry, kind: FundingKind): FundingRow {
  const content = entry.content as FeedPostContent | FeedGrantContent;
  const when = entry.timestamp ? formatTimeAgo(entry.timestamp) : '';
  const base = {
    key: `published-${entry.id}`,
    title: content.title?.trim() || 'Untitled',
    published: true,
    image: content.previewImage ?? null,
    href: buildWorkUrl({
      id: content.id,
      slug: content.slug,
      contentType: kind === 'rfp' ? 'funding_request' : 'preregistration',
    }),
  };

  if ('grant' in content) {
    const { grant } = content;
    const active = grant.status === 'OPEN';
    return {
      ...base,
      active,
      detail: [active ? null : STATE_LABEL[grant.status], when].filter(Boolean).join(' · '),
      money: { label: 'Funding', amount: grant.amount },
    };
  }

  const fundraise = content.fundraise;
  const active = fundraise?.status === 'OPEN';
  return {
    ...base,
    active,
    detail: [fundraise && !active ? STATE_LABEL[fundraise.status] : null, when]
      .filter(Boolean)
      .join(' · '),
    money: fundraise
      ? { label: 'Raised', amount: fundraise.amountRaised, goal: fundraise.goalAmount }
      : undefined,
  };
}

const draftRow = (note: Note): FundingRow => ({
  key: `draft-${note.id}`,
  title: note.title?.trim() || 'Untitled draft',
  published: false,
  active: false,
  detail: `Edited ${formatTimeAgo(note.updatedDate)}`,
  image: note.previewImage ?? note.image ?? null,
  note,
});

/**
 * A My Funding section's list: the user's RFPs or proposals as one kind of
 * row — what is live first, then the drafts, then what has closed — each
 * with its image, its title, under it the status dot (amber draft, blue
 * published) and a date, and the money on it. A draft opens where the user
 * drafts and can be deleted from its row; a published row opens its page.
 * Four rows show before the list asks to be expanded.
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

  // Both sources arrive at their own pace; showing one before the other
  // would lay the list out twice. Nothing renders until the first load of
  // each is in, and later loads (a refresh after a delete) keep the rows.
  const loadingFirst = isLoading || (includeDrafts && notes.isLoading);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!loadingFirst) setSettled(true);
  }, [loadingFirst]);

  const rows = useMemo<FundingRow[]>(() => {
    const drafts = includeDrafts
      ? notes.notes
          .filter((note) => !note.isRemoved && !isPublishedNote(note) && getNoteKind(note) === kind)
          .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime())
          .map(draftRow)
      : [];
    const published = entries.map((entry) => publishedRow(entry, kind));
    return [
      ...published.filter((row) => row.active),
      ...drafts,
      ...published.filter((row) => !row.active),
    ];
  }, [includeDrafts, notes.notes, entries, kind]);

  // ---- deleting a draft, behind a confirmation ----
  const [deleting, setDeleting] = useState<FundingRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { refresh } = notes;
  const deleteDraft = useCallback(async () => {
    const note = deleting?.note;
    if (!note) return;
    setIsDeleting(true);
    try {
      await NoteService.deleteNote(note.id);
      setDeleting(null);
      await refresh();
    } catch {
      toast.error('Couldn’t delete the draft. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }, [deleting, refresh]);

  if (!settled) return <RowsSkeleton />;
  if (rows.length === 0) return <DashboardEmptyState>{emptyMessage}</DashboardEmptyState>;

  const shown = showAll ? rows : rows.slice(0, RECENT_COUNT);
  const hiddenCount = rows.length - shown.length;

  return (
    <>
      <ul className="space-y-3">
        {shown.map((row) => (
          <li key={row.key} className="group relative">
            {row.note ? (
              <>
                <button
                  type="button"
                  onClick={() => openDraft(row.note as Note)}
                  className={cn(rowClass(false), 'pr-12')}
                >
                  <RowFace row={row} />
                </button>
                {/* Beside the row, not inside it: a button cannot hold a button. */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <BaseMenu
                    align="end"
                    trigger={
                      <button
                        type="button"
                        aria-label={`Options for “${row.title}”`}
                        title="Options"
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </button>
                    }
                  >
                    <BaseMenuItem
                      onSelect={() => setDeleting(row)}
                      className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </BaseMenuItem>
                  </BaseMenu>
                </div>
              </>
            ) : (
              <Link href={row.href ?? '#'} className={rowClass(true)}>
                <RowFace row={row} />
              </Link>
            )}
          </li>
        ))}

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

      <BaseModal
        isOpen={deleting != null}
        onClose={() => (isDeleting ? undefined : setDeleting(null))}
        title="Delete draft?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setDeleting(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => void deleteDraft()}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          “{deleting?.title}” will be deleted, along with anything written in it. This cannot be
          undone.
        </p>
      </BaseModal>
    </>
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

function RowFace({ row }: { readonly row: FundingRow }) {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const format = useCallback(
    (money: Money) =>
      formatCurrency({
        amount: showUSD ? money.usd : money.rsc,
        showUSD,
        exchangeRate,
        shorten: true,
        skipConversion: true,
      }),
    [showUSD, exchangeRate]
  );

  return (
    <>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-600">
        {row.image ? (
          <Image src={row.image} alt="" fill className="object-cover" sizes="40px" />
        ) : (
          <FileText className="h-4 w-4" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-900">{row.title}</span>
        <NoteStatusLine published={row.published} detail={row.detail} className="mt-0.5" />
      </span>
      {row.money ? (
        <span className="shrink-0 text-right">
          {/* The same eyebrow treatment as the totals, so the label reads as a field name. */}
          <span className="block whitespace-nowrap text-[11px] font-semibold uppercase leading-none tracking-wider text-gray-500">
            {row.money.label}
          </span>
          <span className="mt-1.5 block whitespace-nowrap font-mono text-sm font-semibold leading-none text-gray-900">
            {format(row.money.amount)}
            {row.money.goal && (
              <span className="font-sans text-xs font-normal text-gray-500">
                {' '}
                of {format(row.money.goal)}
              </span>
            )}
          </span>
        </span>
      ) : (
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-500 transition-colors group-hover:text-gray-900">
          {row.published ? 'Open' : 'Continue'}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      )}
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
