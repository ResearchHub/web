'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useFeed } from '@/hooks/useFeed';
import { useOrganizationNotes } from '@/hooks/useOrganizationNotes';
import { FUNDING_KIND_LABEL, type FundingKind } from '@/components/Funding/fundingKind';
import type { FeedEntry, FeedGrantContent, FeedPostContent } from '@/types/feed';
import { getNoteKind, isPublishedNote, type Note, type NoteKind } from '@/types/note';
import { formatTimeAgo } from '@/utils/date';
import { buildWorkUrl } from '@/utils/url';

export { FUNDING_KIND_LABEL };
export type { FundingKind };

/** An amount in both currencies, shown in whichever the user prefers. */
export interface Money {
  readonly usd: number;
  readonly rsc: number;
}

/** A published RFP or proposal: one row of the Published group. */
export interface PublishedDocument {
  readonly key: string;
  readonly kind: FundingKind;
  readonly title: string;
  readonly image: string | null;
  readonly href: string;
  /** Still taking proposals or contributions. */
  readonly active: boolean;
  /** After the status: a closed item's state, and when it was published. */
  readonly detail: string;
  /** When it was published, to order the rows. */
  readonly publishedAt: number;
  /** The money on it: an RFP's funding, a proposal's raised amount and goal. */
  readonly money?: { readonly label: string; readonly amount: Money; readonly goal?: Money };
  /** Who answered it: the proposals sent to an RFP, the funders of a proposal. */
  readonly count?: { readonly label: string; readonly value: number };
  /** When it stops taking proposals or contributions. */
  readonly endDate?: string;
}

/** An RFP or proposal still being written: one row of the Drafts group. */
export interface DraftDocument {
  readonly key: string;
  readonly kind: FundingKind;
  readonly title: string;
  readonly image: string | null;
  /** After the status: when it was last edited. */
  readonly detail: string;
  readonly note: Note;
}

const STATE_LABEL: Record<string, string> = {
  CLOSED: 'Closed',
  COMPLETED: 'Completed',
  DECLINED: 'Declined',
  PENDING: 'Pending',
};

function publishedDocument(entry: FeedEntry, kind: FundingKind): PublishedDocument {
  const content = entry.content as FeedPostContent | FeedGrantContent;
  const when = entry.timestamp ? formatTimeAgo(entry.timestamp) : '';
  const base = {
    // The two feeds number their entries separately, so the kind keeps keys apart.
    key: `${kind}-${entry.id}`,
    kind,
    title: content.title?.trim() || 'Untitled',
    image: content.previewImage ?? null,
    href: buildWorkUrl({
      id: content.id,
      slug: content.slug,
      contentType: kind === 'rfp' ? 'funding_request' : 'preregistration',
    }),
    publishedAt: entry.timestamp ? new Date(entry.timestamp).getTime() : 0,
  };

  if ('grant' in content) {
    const { grant } = content;
    const active = grant.status === 'OPEN';
    return {
      ...base,
      active,
      detail: [active ? null : STATE_LABEL[grant.status], when].filter(Boolean).join(' · '),
      money: { label: 'Funding', amount: grant.amount },
      count: { label: 'Proposals', value: grant.applicants?.length ?? 0 },
      endDate: grant.endDate || undefined,
    };
  }

  const { fundraise } = content;
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
    count: fundraise
      ? { label: 'Funders', value: fundraise.contributors?.numContributors ?? 0 }
      : undefined,
    endDate: fundraise?.endDate,
  };
}

const draftDocument = (note: Note, kind: FundingKind): DraftDocument => ({
  key: `draft-${note.id}`,
  kind,
  title: note.title?.trim() || 'Untitled draft',
  image: note.previewImage ?? note.image ?? null,
  detail: `Edited ${formatTimeAgo(note.updatedDate)}`,
  note,
});

const isFundingKind = (kind: NoteKind): kind is FundingKind =>
  kind === 'rfp' || kind === 'proposal';

interface UseMyFundingDocumentsOptions {
  /** Whose page this is: the user, or the funder a moderator is viewing. */
  readonly viewedUserId: number;
  /**
   * The user is looking at their own page, so their proposals and drafts
   * belong on it. A moderator's view of another funder shows that funder's
   * RFPs and nothing else.
   */
  readonly isOwnPage: boolean;
}

export interface MyFundingDocuments {
  /** RFPs and proposals as one list: what is open first, then what has closed. */
  readonly published: PublishedDocument[];
  /** Unpublished RFPs and proposals, the latest edit first. */
  readonly drafts: DraftDocument[];
  /**
   * Both feeds and the notes have finished their first load. Each arrives at
   * its own pace, and showing one before the others would lay the page out
   * more than once. Later loads (a refresh after a delete) leave it true.
   */
  readonly isSettled: boolean;
  readonly error: Error | null;
  /** Either feed has another page. */
  readonly hasMore: boolean;
  readonly loadMore: () => void;
  /** Read the notes again, after a draft is deleted. */
  readonly refreshDrafts: () => Promise<void>;
}

/**
 * Everything a user has written on the funding side, whichever side of it
 * they are on: their RFPs and their proposals, published or still drafts.
 *
 * Each feed pages on its own, so "open first" holds across the rows loaded
 * so far; loading another page can move rows.
 */
export function useMyFundingDocuments({
  viewedUserId,
  isOwnPage,
}: UseMyFundingDocumentsOptions): MyFundingDocuments {
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();

  const rfpFeedOptions = useMemo(
    () => ({ endpoint: 'grant_feed' as const, contentType: 'GRANT', createdBy: viewedUserId }),
    [viewedUserId]
  );
  const proposalFeedOptions = useMemo(
    () => ({
      endpoint: 'funding_feed' as const,
      contentType: 'PREREGISTRATION',
      createdBy: viewedUserId,
      ordering: 'newest',
      enabled: isOwnPage,
    }),
    [viewedUserId, isOwnPage]
  );
  const rfpFeed = useFeed('all', rfpFeedOptions);
  const proposalFeed = useFeed('all', proposalFeedOptions);
  const notes = useOrganizationNotes(isOwnPage ? selectedOrg?.slug : null, {
    waiting: isOwnPage && isLoadingOrg,
  });

  // A feed that is switched off never leaves its loading state, so only the
  // sources this page reads are waited for.
  const loadingFirst =
    rfpFeed.isLoading || (isOwnPage && (proposalFeed.isLoading || notes.isLoading));
  const [isSettled, setIsSettled] = useState(false);
  useEffect(() => {
    if (!loadingFirst) setIsSettled(true);
  }, [loadingFirst]);

  const published = useMemo<PublishedDocument[]>(() => {
    const documents = [
      ...rfpFeed.entries.map((entry) => publishedDocument(entry, 'rfp')),
      ...(isOwnPage ? proposalFeed.entries : []).map((entry) =>
        publishedDocument(entry, 'proposal')
      ),
    ];
    return documents.sort(
      (a, b) => Number(b.active) - Number(a.active) || b.publishedAt - a.publishedAt
    );
  }, [rfpFeed.entries, proposalFeed.entries, isOwnPage]);

  const drafts = useMemo<DraftDocument[]>(() => {
    if (!isOwnPage) return [];
    return notes.notes
      .filter((note) => !note.isRemoved && !isPublishedNote(note))
      .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime())
      .flatMap((note) => {
        const kind = getNoteKind(note);
        return isFundingKind(kind) ? [draftDocument(note, kind)] : [];
      });
  }, [isOwnPage, notes.notes]);

  const proposalsHaveMore = isOwnPage && proposalFeed.hasMore;
  const error = rfpFeed.error ?? (isOwnPage ? (proposalFeed.error ?? notes.error) : null);
  useEffect(() => {
    if (notes.error) console.error('Failed to load My Funding drafts:', notes.error);
  }, [notes.error]);
  const loadMore = useCallback(() => {
    if (rfpFeed.hasMore) rfpFeed.loadMore();
    if (proposalsHaveMore) proposalFeed.loadMore();
  }, [rfpFeed, proposalFeed, proposalsHaveMore]);

  return {
    published,
    drafts,
    isSettled,
    error,
    hasMore: rfpFeed.hasMore || proposalsHaveMore,
    loadMore,
    refreshDrafts: notes.refresh,
  };
}
