import { getCommentPreview, getContribution } from './activityDisplay.utils';
import { getActivityWork, type ActivityWork } from './activityWork.utils';
import type { AuthorProfile } from '@/types/authorProfile';
import type { CurrencyAmount } from '@/utils/currency';
import type { FeedCommentContent, FeedEntry } from '@/types/feed';

/**
 * How far past an anchor we look for entries to fold into it. Kept small on purpose:
 * a group renders at its anchor's position, so absorbing a distant member pulls
 * content up across the gap it used to sit in.
 */
const DEFAULT_LOOKAHEAD = 3;

/** Entries further apart than this stay separate rows. */
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

/**
 * Several comments one author left on the same work, collapsed into a single row.
 * Nothing is summarized away: every comment keeps its own body, and only the work
 * card that each one used to repeat is dropped.
 */
export interface ActivityCommentGroupRow {
  kind: 'comment-group';
  key: string;
  /** Members in feed order. */
  entries: FeedEntry[];
  /** Newest member, used for the timestamp and the work card's vote/share actions. */
  latestEntry: FeedEntry;
  work: ActivityWork;
  /** The single author every member shares. */
  author: AuthorProfile;
}

export type ActivityRow = ActivityEntryRow | ActivityFundingGroupRow | ActivityCommentGroupRow;

export interface GroupActivityRowsOptions {
  lookahead?: number;
  maxSpanMs?: number;
}

/**
 * Which kind of repetition an entry can take part in. Members only ever join an
 * anchor of their own kind, and the kind picks the row that gets built.
 */
type ActivityGroupKind = 'funding' | 'comment';

interface GroupCandidate {
  kind: ActivityGroupKind;
  entry: FeedEntry;
  work: ActivityWork;
  workKey: string;
  actor: AuthorProfile;
  timestampMs: number;
  /** Funding only. */
  amount?: CurrencyAmount;
}

interface PlannedGroup {
  groupMembers: GroupCandidate[];
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
 * The repetition an entry is eligible for, or null when it always stands alone.
 *
 * Tips and bounty payouts (`FUNDINGACTIVITY`) target a review rather than a
 * fundraise and credit the recipient rather than the actor, so they never group.
 *
 * Only plain comments group. `deriveActivityAction` reroutes bounty comments and
 * reviews tagged `PEER_REVIEW`, but reviews tagged `REVIEW` still arrive as
 * `comment_published`, so the comment type is checked against an allowlist rather
 * than the action alone. Reviews and author updates are substantial enough to earn
 * their own row even back to back.
 */
function toGroupKind(entry: FeedEntry): ActivityGroupKind | null {
  if (entry.activityAction === 'fundraise_contribution') return 'funding';
  if (entry.activityAction !== 'comment_published') return null;

  const { comment } = entry.content as FeedCommentContent;
  return comment?.commentType === 'GENERIC_COMMENT' ? 'comment' : null;
}

/**
 * Beyond its kind, a candidate needs only a resolvable work. In particular no
 * fundraise is required: contribution payloads carry one only when the API includes
 * it on `related_work`, and a group renders the same presentation an ungrouped card
 * would either way.
 */
function toCandidate(entry: FeedEntry): GroupCandidate | null {
  const kind = toGroupKind(entry);
  if (!kind) return null;

  const work = getActivityWork(entry);
  if (!work) return null;

  const timestampMs = Date.parse(entry.timestamp);
  if (Number.isNaN(timestampMs)) return null;

  // A comment group is nothing but its bodies, so one that cannot render a body
  // has nothing to contribute to it.
  if (kind === 'comment' && !getCommentPreview(entry)) return null;

  return {
    kind,
    entry,
    work,
    workKey: resolveWorkKey(work),
    actor: entry.content.createdBy,
    timestampMs,
    amount: kind === 'funding' ? getContribution(entry) : undefined,
  };
}

function findLatestMember(groupMembers: GroupCandidate[]): GroupCandidate {
  return groupMembers.reduce((newest, member) =>
    member.timestampMs > newest.timestampMs ? member : newest
  );
}

function toFundingGroupRow(groupMembers: GroupCandidate[]): ActivityFundingGroupRow {
  const funders: AuthorProfile[] = [];
  const seenFunderIds = new Set<number>();
  const totals: ActivityFundingTotals = { usd: 0, rsc: 0 };

  for (const member of groupMembers) {
    // Unresolved profiles share id 0, so they are never folded into each other.
    const funderId = member.actor.id;
    if (!funderId || !seenFunderIds.has(funderId)) {
      if (funderId) seenFunderIds.add(funderId);
      funders.push(member.actor);
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
  const latest = findLatestMember(groupMembers);

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

function toCommentGroupRow(groupMembers: GroupCandidate[]): ActivityCommentGroupRow {
  const [first] = groupMembers;
  const latest = findLatestMember(groupMembers);

  return {
    kind: 'comment-group',
    key: `comment-group:${first.workKey}:${first.entry.id}`,
    entries: groupMembers.map((member) => member.entry),
    latestEntry: latest.entry,
    work: latest.work,
    author: first.actor,
  };
}

function toGroupRow(
  groupMembers: GroupCandidate[]
): ActivityFundingGroupRow | ActivityCommentGroupRow {
  return groupMembers[0].kind === 'comment'
    ? toCommentGroupRow(groupMembers)
    : toFundingGroupRow(groupMembers);
}

/**
 * Funding groups deliberately span funders, since the facepile is the point.
 * Comment groups do not: several people talking is a conversation worth showing in
 * full, while one person posting repeatedly is the repetition being collapsed.
 */
function hasSameActor(groupAnchor: GroupCandidate, candidate: GroupCandidate): boolean {
  // Unresolved profiles share id 0, so they are never treated as the same person.
  return !!groupAnchor.actor.id && groupAnchor.actor.id === candidate.actor.id;
}

/**
 * Whether `candidate` can join the group led by `groupAnchor`: the same kind of
 * repetition on the same work, and close enough in time that presenting them as one
 * row stays honest.
 */
function canJoinGroup(
  groupAnchor: GroupCandidate,
  candidate: GroupCandidate,
  maxSpanMs: number
): boolean {
  if (candidate.kind !== groupAnchor.kind) return false;
  if (candidate.workKey !== groupAnchor.workKey) return false;
  if (groupAnchor.kind === 'comment' && !hasSameActor(groupAnchor, candidate)) return false;
  return Math.abs(candidate.timestampMs - groupAnchor.timestampMs) <= maxSpanMs;
}

/**
 * The group starting at `anchorIndex`, or null when none starts there: the entry is
 * not groupable, or nobody joined it.
 *
 * Plans without recording anything, so a group that never materializes leaves no
 * trace and its would-be members stay free to start groups of their own.
 */
function planGroupAt(
  candidates: (GroupCandidate | null)[],
  anchorIndex: number,
  options: {
    lookahead: number;
    maxSpanMs: number;
    groupedIndexes: ReadonlySet<number>;
  }
): PlannedGroup | null {
  const groupAnchor = candidates[anchorIndex];
  if (!groupAnchor) return null;

  const { lookahead, maxSpanMs, groupedIndexes } = options;
  const lookaheadEnd = Math.min(candidates.length, anchorIndex + 1 + lookahead);
  const groupMembers = [groupAnchor];
  const memberIndexes: number[] = [];

  for (let index = anchorIndex + 1; index < lookaheadEnd; index++) {
    if (groupedIndexes.has(index)) continue;

    // Skipping other kinds of activity rather than stopping at them is what lets a
    // group form across unrelated entries sitting between two of its members.
    const candidate = candidates[index];
    if (candidate && canJoinGroup(groupAnchor, candidate, maxSpanMs)) {
      groupMembers.push(candidate);
      memberIndexes.push(index);
    }
  }

  return groupMembers.length >= MIN_GROUP_SIZE ? { groupMembers, memberIndexes } : null;
}

/**
 * Collapse nearby repetitive activity into a single row: contributions to the same
 * fundraise, or plain comments one author left on the same work.
 *
 * Each group is led by an anchor: the first entry of a burst. The anchor's position
 * becomes the row's position, and the anchor decides what may join it.
 *
 * Groups form as soon as two members are loaded rather than waiting for a full
 * lookahead window, because holding one back means rendering its members as the
 * separate cards this exists to collapse. Appending a page is safe: an anchor whose
 * window was already complete keeps exactly its members, so only trailing groups
 * change, and they can only gain members. Their key is derived from the anchor entry,
 * so a growing group stays the same element rather than remounting.
 */
export function groupActivityRows(
  entries: FeedEntry[],
  options?: GroupActivityRowsOptions
): ActivityRow[] {
  const lookahead = options?.lookahead ?? DEFAULT_LOOKAHEAD;
  const maxSpanMs = options?.maxSpanMs ?? DEFAULT_MAX_SPAN_MS;

  // One slot per entry, keeping positions aligned with `entries` for the lookahead.
  const candidates = entries.map(toCandidate);

  const rows: ActivityRow[] = [];
  const groupedIndexes = new Set<number>();

  for (let i = 0; i < entries.length; i++) {
    if (groupedIndexes.has(i)) continue;

    const group = planGroupAt(candidates, i, { lookahead, maxSpanMs, groupedIndexes });

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
