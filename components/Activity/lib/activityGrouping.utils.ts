import { getContribution } from './activityDisplay.utils';
import { getActivityWork, type ActivityWork } from './activityWork.utils';
import type { AuthorProfile } from '@/types/authorProfile';
import type { CurrencyAmount } from '@/utils/currency';
import type { FeedEntry } from '@/types/feed';

/**
 * How far past an anchor we look for contributions to the same fundraise. Kept
 * small on purpose: it doubles as the depth of the deferred tail below, and feed
 * rows are tall enough that a deep tail reaches above the fold.
 */
const DEFAULT_LOOKAHEAD = 3;

/** Contributions further apart than this stay separate rows. */
const DEFAULT_MAX_SPAN_MS = 24 * 60 * 60 * 1000;

const MIN_GROUP_SIZE = 2;

export interface ActivityFundingTotals {
  usd: number;
  rsc: number;
}

export interface ActivityEntryRow {
  kind: 'entry';
  key: string;
  entry: FeedEntry;
}

/**
 * Several contributions to one fundraise, collapsed into a single row so the feed
 * shows one work card instead of repeating the same artwork once per funder.
 */
export interface ActivityFundingGroupRow {
  kind: 'funding-group';
  key: string;
  /** Members in feed order. */
  entries: FeedEntry[];
  /** Newest member, used for the timestamp and the work card's vote/share actions. */
  latestEntry: FeedEntry;
  /** Taken from the newest member so the fundraise progress snapshot is current. */
  work: ActivityWork;
  /** Distinct funders, in the order they appear in the feed. */
  funders: AuthorProfile[];
  /** Exceeds `funders.length` when someone contributed more than once. */
  contributionCount: number;
  totals: ActivityFundingTotals;
}

export type ActivityRow = ActivityEntryRow | ActivityFundingGroupRow;

export interface GroupActivityRowsOptions {
  lookahead?: number;
  maxSpanMs?: number;
  /** Whether more pages are pending; when true the tail is left ungrouped. */
  hasMore?: boolean;
}

interface FundingCandidate {
  entry: FeedEntry;
  work: ActivityWork;
  workKey: string;
  funder: AuthorProfile;
  amount?: CurrencyAmount;
  timestampMs: number;
}

interface PlannedGroup {
  groupMembers: FundingCandidate[];
  /** Positions of the members behind the anchor, which the caller must record. */
  memberIndexes: number[];
}

function toEntryRow(entry: FeedEntry): ActivityEntryRow {
  return { kind: 'entry', key: entry.id, entry };
}

function resolveWorkKey(work: ActivityWork): string {
  // The same document reaches us via `related_work` or the content object, which
  // use different id spaces, so prefer the unified id whenever it is present.
  return work.unifiedDocumentId != null
    ? `unified:${work.unifiedDocumentId}`
    : `${work.documentType}:${work.id}`;
}

/**
 * Funding contributions only. Tips and bounty payouts (`FUNDINGACTIVITY`) target a
 * review rather than a fundraise and credit the recipient rather than the actor,
 * so they never join a group.
 *
 * Requires a resolvable work and nothing more: contribution payloads carry the
 * fundraise only when the API includes it on `related_work`, and a group renders
 * the same presentation an ungrouped card would either way.
 */
function toFundingCandidate(entry: FeedEntry): FundingCandidate | null {
  if (entry.activityAction !== 'fundraise_contribution') return null;

  const work = getActivityWork(entry);
  if (!work) return null;

  const timestampMs = Date.parse(entry.timestamp);
  if (Number.isNaN(timestampMs)) return null;

  return {
    entry,
    work,
    workKey: resolveWorkKey(work),
    funder: entry.content.createdBy,
    amount: getContribution(entry),
    timestampMs,
  };
}

function toGroupRow(groupMembers: FundingCandidate[]): ActivityFundingGroupRow {
  const funders: AuthorProfile[] = [];
  const seenFunderIds = new Set<number>();
  const totals: ActivityFundingTotals = { usd: 0, rsc: 0 };

  for (const member of groupMembers) {
    // Unresolved profiles share id 0, so they are never folded into each other.
    const funderId = member.funder.id;
    if (!funderId || !seenFunderIds.has(funderId)) {
      if (funderId) seenFunderIds.add(funderId);
      funders.push(member.funder);
    }

    if (member.amount) {
      if (member.amount.currency === 'USD') {
        totals.usd += member.amount.amount;
      } else {
        totals.rsc += member.amount.amount;
      }
    }
  }

  const [first] = groupMembers;
  const latest = groupMembers.reduce((newest, member) =>
    member.timestampMs > newest.timestampMs ? member : newest
  );

  return {
    kind: 'funding-group',
    key: `funding-group:${first.workKey}:${first.entry.id}`,
    entries: groupMembers.map((member) => member.entry),
    latestEntry: latest.entry,
    work: latest.work,
    funders,
    contributionCount: groupMembers.length,
    totals,
  };
}

/**
 * Whether `candidate` can join the group led by `groupAnchor`: the same proposal,
 * and close enough in time that presenting them as one row stays honest.
 */
function canJoinGroup(
  groupAnchor: FundingCandidate,
  candidate: FundingCandidate,
  maxSpanMs: number
): boolean {
  if (candidate.workKey !== groupAnchor.workKey) return false;
  return Math.abs(candidate.timestampMs - groupAnchor.timestampMs) <= maxSpanMs;
}

/**
 * The group starting at `anchorIndex`, or null when none starts there: the entry is
 * not a contribution, it sits in the deferred tail, or nobody joined it.
 *
 * Plans without recording anything, so a group that never materializes leaves no
 * trace and its would-be members stay free to start groups of their own.
 */
function planGroupAt(
  candidates: (FundingCandidate | null)[],
  anchorIndex: number,
  options: {
    lookahead: number;
    maxSpanMs: number;
    groupedIndexes: ReadonlySet<number>;
    firstDeferredIndex: number;
  }
): PlannedGroup | null {
  const groupAnchor = candidates[anchorIndex];
  if (!groupAnchor) return null;
  if (anchorIndex >= options.firstDeferredIndex) return null;

  const { lookahead, maxSpanMs, groupedIndexes } = options;
  const lookaheadEnd = Math.min(candidates.length, anchorIndex + 1 + lookahead);
  const groupMembers = [groupAnchor];
  const memberIndexes: number[] = [];

  for (let index = anchorIndex + 1; index < lookaheadEnd; index++) {
    if (groupedIndexes.has(index)) continue;

    // Skipping other kinds of activity rather than stopping at them is what lets a
    // group form across unrelated entries sitting between two contributions.
    const candidate = candidates[index];
    if (candidate && canJoinGroup(groupAnchor, candidate, maxSpanMs)) {
      groupMembers.push(candidate);
      memberIndexes.push(index);
    }
  }

  return groupMembers.length >= MIN_GROUP_SIZE ? { groupMembers, memberIndexes } : null;
}

/**
 * Collapse nearby contributions to the same fundraise into a single row.
 *
 * Each group is led by an anchor: the first contribution of a burst. The anchor's
 * position becomes the row's position, and its proposal decides what may join.
 *
 * Pure and deterministic by design: the feed persists raw entries for scroll
 * restoration, so the same entries must always produce the same layout.
 */
export function groupActivityRows(
  entries: FeedEntry[],
  options?: GroupActivityRowsOptions
): ActivityRow[] {
  const lookahead = options?.lookahead ?? DEFAULT_LOOKAHEAD;
  const maxSpanMs = options?.maxSpanMs ?? DEFAULT_MAX_SPAN_MS;

  // One slot per entry, keeping positions aligned with `entries` for the lookahead.
  const candidates = entries.map(toFundingCandidate);

  // An anchor cannot be trusted until its whole lookahead window is loaded, since
  // the next page could still add members to it, and growing a row the reader has
  // already scrolled past shifts the feed under them. While more pages are pending
  // the last `lookahead` entries are therefore deferred: they render on their own,
  // and become eligible to anchor a group once the window behind them fills in.
  const firstDeferredIndex = options?.hasMore ? entries.length - lookahead : entries.length;

  const rows: ActivityRow[] = [];
  const groupedIndexes = new Set<number>();

  for (let i = 0; i < entries.length; i++) {
    if (groupedIndexes.has(i)) continue;

    const group = planGroupAt(candidates, i, {
      lookahead,
      maxSpanMs,
      groupedIndexes,
      firstDeferredIndex,
    });

    if (group) {
      for (const index of group.memberIndexes) {
        groupedIndexes.add(index);
      }
      rows.push(toGroupRow(group.groupMembers));
    } else {
      rows.push(toEntryRow(entries[i]));
    }
  }

  return rows;
}
