import { getActivityWork } from '@/components/Activity/lib/activityWork.utils';
import { parseContent } from '@/components/Comment/lib/commentContentUtils';
import type { AuthorProfile } from '@/types/authorProfile';
import type {
  FeedCommentContent,
  FeedEntry,
  FeedGrantContent,
  FeedPostContent,
} from '@/types/feed';
import type { FunderOverview } from '@/types/funder';
import type { FundraiseStatus } from '@/types/funding';
import type { PublishedDocument } from '@/components/Funding/dashboard/hooks/useMyFundingDocuments';
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import { stripHtml } from '@/utils/stringUtils';
import { buildWorkUrl } from '@/utils/url';

/** An amount in both currencies, shown in whichever the user prefers. */
export interface Money {
  readonly usd: number;
  readonly rsc: number;
}

const ZERO: Money = { usd: 0, rsc: 0 };
const DAY_MS = 24 * 60 * 60 * 1000;

const addMoney = (a: Money, b: Money): Money => ({ usd: a.usd + b.usd, rsc: a.rsc + b.rsc });

/** Raising while the fundraise is open, funded once it completed, closed when it ended short. */
export type FundingStatus = 'raising' | 'funded' | 'closed';

const FUNDING_STATUS: Record<FundraiseStatus, FundingStatus> = {
  OPEN: 'raising',
  COMPLETED: 'funded',
  CLOSED: 'closed',
};

/** Whole days from now until a date; negative once it has passed. */
export function daysUntil(date: string | undefined, now: number): number | undefined {
  if (!date) return undefined;
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return undefined;
  return Math.ceil((time - now) / DAY_MS);
}

function percentOf(raised: Money, goal: Money): number | undefined {
  if (goal.usd > 0) return Math.min(100, Math.round((raised.usd / goal.usd) * 100));
  if (goal.rsc > 0) return Math.min(100, Math.round((raised.rsc / goal.rsc) * 100));
  return undefined;
}

/** The latest thing said about a proposal: its author's update or a peer's review. */
export interface ProposalNews {
  readonly kind: 'update' | 'review';
  readonly text: string;
  readonly timestamp: string;
  readonly author: AuthorProfile;
  readonly score?: number;
  readonly href?: string;
}

/** Plain text from a TipTap node, with a space between blocks. */
function tipTapText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const { text, content } = node as { text?: unknown; content?: unknown };
  if (typeof text === 'string') return text;
  if (!Array.isArray(content)) return '';
  return content.map(tipTapText).filter(Boolean).join(' ');
}

/**
 * A comment's words, for a one-line preview. Its content can come as a TipTap
 * document, Quill operations, HTML, or either of the first two still encoded
 * as a JSON string, so it is parsed the way the comment renderer parses it.
 */
function commentText(comment: FeedCommentContent['comment']): string {
  const { content, contentFormat } = comment;
  if (!content) return '';
  // HTML or plain text, rather than a document encoded as JSON.
  if (typeof content === 'string' && !/^\s*[[{]/.test(content)) {
    return stripHtml(content).replace(/\s+/g, ' ').trim();
  }
  const parsed = parseContent(
    content,
    contentFormat === 'QUILL_EDITOR' ? 'QUILL_EDITOR' : 'TIPTAP'
  );
  if (!parsed || typeof parsed !== 'object') return '';
  // Quill: a list of insert operations.
  const ops = Array.isArray(parsed) ? parsed : parsed.ops;
  const text = Array.isArray(ops)
    ? ops
        .map((op: { insert?: unknown }) => (typeof op.insert === 'string' ? op.insert : ''))
        .join('')
    : tipTapText(parsed);
  return text.replace(/\s+/g, ' ').trim();
}

/** The post a comment entry was left on, when it was left on one. */
function commentPostId(entry: FeedEntry): number | undefined {
  if (entry.contentType !== 'COMMENT') return undefined;
  const work = entry.relatedWork;
  return work?.id ? Number(work.id) : undefined;
}

/**
 * The newest update and review on each proposal the activity has reached,
 * keyed by the proposal's post id. Entries come newest first, so the first one
 * seen for a proposal is the latest.
 */
export function latestNewsByPost(entries: readonly FeedEntry[]): Map<number, ProposalNews> {
  const news = new Map<number, ProposalNews>();
  for (const entry of entries) {
    const postId = commentPostId(entry);
    if (postId == null || news.has(postId)) continue;
    const content = entry.content as FeedCommentContent;
    const type = content.comment?.commentType as string | undefined;
    const kind =
      type === 'AUTHOR_UPDATE'
        ? 'update'
        : type === 'REVIEW' || type === 'PEER_REVIEW'
          ? 'review'
          : null;
    if (!kind) continue;
    const text = commentText(content.comment);
    if (!text) continue;
    news.set(postId, {
      kind,
      text,
      timestamp: entry.timestamp,
      author: content.createdBy,
      score: content.review?.score ?? content.comment.reviewScore,
      href: entry.relatedWork
        ? buildWorkUrl({
            id: entry.relatedWork.id,
            slug: entry.relatedWork.slug,
            contentType: entry.relatedWork.contentType,
            tab: kind === 'update' ? 'updates' : 'reviews',
          })
        : undefined,
    });
  }
  return news;
}

/** One proposal the user funded, as Research you funded lists it. */
export interface FundedRow {
  readonly key: string;
  readonly postId: number;
  readonly title: string;
  readonly href: string;
  readonly scientist: AuthorProfile;
  readonly youGave: Money;
  readonly news?: ProposalNews;
}

/**
 * Research you funded, from the funding overview alone (which proposals the
 * user gave to, how much, and who wrote them) with the latest news on each
 * from the activity. The ones with the newest news come first, then the ones
 * given the most.
 */
export function buildFundedRows(
  overview: FunderOverview | null,
  news: ReadonlyMap<number, ProposalNews>
): FundedRow[] {
  if (!overview) return [];
  const rows = overview.supportedProposals.map(
    (proposal): FundedRow => ({
      key: `funded-${proposal.id}`,
      postId: proposal.id,
      title: proposal.title.trim() || 'Untitled proposal',
      href: buildWorkUrl({ id: proposal.id, slug: proposal.slug, contentType: 'preregistration' }),
      scientist: proposal.createdBy.authorProfile,
      youGave: proposal.fundedAmount,
      news: news.get(proposal.id),
    })
  );

  const newsAt = (row: FundedRow) => (row.news ? new Date(row.news.timestamp).getTime() : 0);
  return rows.sort(
    (a, b) =>
      newsAt(b) - newsAt(a) || b.youGave.usd - a.youGave.usd || b.youGave.rsc - a.youGave.rsc
  );
}

/** A scientist the user supports, with what they gave across that scientist's proposals. */
export interface SupportedPerson {
  readonly profile: AuthorProfile;
  readonly youGave: Money;
  /** The proposal of theirs the user gave the most to. */
  readonly proposalTitle?: string;
}

export function buildSupportedPeople(rows: readonly FundedRow[]): SupportedPerson[] {
  const byScientist = new Map<number, { person: SupportedPerson; best: number }>();
  for (const row of rows) {
    const id = row.scientist.id;
    const current = byScientist.get(id);
    if (!current) {
      byScientist.set(id, {
        person: { profile: row.scientist, youGave: row.youGave, proposalTitle: row.title },
        best: row.youGave.usd,
      });
      continue;
    }
    const best = row.youGave.usd > current.best;
    byScientist.set(id, {
      person: {
        profile: current.person.profile,
        youGave: addMoney(current.person.youGave, row.youGave),
        proposalTitle: best ? row.title : current.person.proposalTitle,
      },
      best: Math.max(current.best, row.youGave.usd),
    });
  }
  return Array.from(byScientist.values())
    .map(({ person }) => person)
    .sort((a, b) => b.youGave.usd - a.youGave.usd || b.youGave.rsc - a.youGave.rsc);
}

/** One of the user's RFPs, as Your RFPs shows it. */
export interface RfpCardModel {
  readonly key: string;
  readonly postId: number;
  readonly title: string;
  readonly href: string;
  readonly image: string | null;
  readonly isOpen: boolean;
  readonly endDate?: string;
  readonly daysLeft?: number;
  readonly budget: Money;
  /** Every proposal sent to it, as its card counts them. */
  readonly proposalCount: number;
  /**
   * The approved proposals the feed lists, by post id: what "new since you
   * last looked" is counted from.
   */
  readonly proposalIds: number[];
  /** What the user has given to proposals sent to it. */
  readonly committed: Money;
  /** How many of those proposals the user has given to. */
  readonly proposalsFunded: number;
}

/**
 * Your RFPs, from the grant feed. What is committed of each budget is what the
 * user gave (`given`, by proposal post id, from the funding overview) to the
 * proposals sent to it.
 */
export function buildRfpCards(
  documents: readonly PublishedDocument[],
  given: ReadonlyMap<number, Money>,
  now: number
): RfpCardModel[] {
  return documents
    .filter(
      (document) => document.kind === 'rfp' && !!(document.entry.content as FeedGrantContent).grant
    )
    .map((document) => {
      const { entry } = document;
      const { grant } = entry.content as FeedGrantContent;
      const isOpen = grant.status === 'OPEN' && !grant.isExpired;
      let committed = ZERO;
      let proposalsFunded = 0;
      for (const application of grant.applicants ?? []) {
        const gift =
          application.preregistrationPostId != null
            ? given.get(application.preregistrationPostId)
            : undefined;
        if (!gift) continue;
        committed = addMoney(committed, gift);
        proposalsFunded += 1;
      }
      return {
        key: document.key,
        postId: document.postId,
        title: document.title,
        href: document.href,
        image: document.image,
        isOpen,
        endDate: grant.endDate || undefined,
        daysLeft: isOpen ? daysUntil(grant.endDate, now) : undefined,
        budget: { usd: grant.amount.usd, rsc: grant.amount.rsc },
        proposalCount:
          getActivityWork(entry)?.grant?.numApplicants ?? (grant.applicants ?? []).length,
        // Applications in the feed carry no id of their own; the proposal's post is stable.
        proposalIds: (grant.applicants ?? []).map(
          (application) => application.preregistrationPostId ?? application.profile.id
        ),
        committed,
        proposalsFunded,
      };
    });
}

/** One of the user's own proposals, as Your proposals shows it. */
export interface OwnProposalModel {
  readonly key: string;
  readonly postId: number;
  readonly title: string;
  readonly href: string;
  readonly updatesHref: string;
  readonly image: string | null;
  readonly status?: FundingStatus;
  readonly raised: Money;
  readonly goal: Money;
  readonly percent?: number;
  readonly daysLeft?: number;
  readonly funderCount: number;
  readonly funders: AuthorProfile[];
  /** Who gave most recently, and when. */
  readonly newestGift?: { readonly profile: AuthorProfile; readonly date: string };
  /** When the user last posted an update on it, if the activity reaches back that far. */
  readonly lastUpdateAt?: number;
}

export function buildOwnProposals(
  documents: readonly PublishedDocument[],
  ownUpdates: ReadonlyMap<number, number>,
  now: number
): OwnProposalModel[] {
  return documents
    .filter((document) => document.kind === 'proposal')
    .map((document) => {
      const content = document.entry.content as FeedPostContent;
      const fundraise = content.fundraise;
      const raised = fundraise?.amountRaised ?? ZERO;
      const goal = fundraise?.goalAmount ?? ZERO;
      const contributors = fundraise?.contributors.topContributors ?? [];
      let newestGift: OwnProposalModel['newestGift'];
      for (const contributor of contributors) {
        for (const contribution of contributor.contributions) {
          if (!newestGift || contribution.date > newestGift.date) {
            newestGift = { profile: contributor.authorProfile, date: contribution.date };
          }
        }
      }
      return {
        key: document.key,
        postId: document.postId,
        title: document.title,
        href: document.href,
        updatesHref: buildWorkUrl({
          id: document.postId,
          slug: content.slug,
          contentType: 'preregistration',
          tab: 'updates',
        }),
        image: document.image,
        status: fundraise ? FUNDING_STATUS[fundraise.status] : undefined,
        raised,
        goal,
        percent: percentOf(raised, goal),
        daysLeft: fundraise?.status === 'OPEN' ? daysUntil(fundraise.endDate, now) : undefined,
        funderCount: fundraise?.contributors.numContributors ?? 0,
        funders: contributors.map((contributor) => contributor.authorProfile),
        newestGift,
        lastUpdateAt: ownUpdates.get(document.postId),
      };
    });
}

/**
 * When the user last posted an update on each of their proposals, from their
 * own activity, keyed by post id.
 */
export function lastOwnUpdates(
  entries: readonly FeedEntry[],
  authorId: number | undefined
): Map<number, number> {
  const updates = new Map<number, number>();
  if (!authorId) return updates;
  for (const entry of entries) {
    const postId = commentPostId(entry);
    if (postId == null || updates.has(postId)) continue;
    const content = entry.content as FeedCommentContent;
    if (content.comment?.commentType !== 'AUTHOR_UPDATE') continue;
    if (content.createdBy?.id !== authorId) continue;
    updates.set(postId, new Date(entry.timestamp).getTime());
  }
  return updates;
}

/** The people backing the user's own proposals, with how many proposals each backed. */
export function buildOwnFunders(proposals: readonly OwnProposalModel[]): AuthorProfile[] {
  const seen = new Map<number, AuthorProfile>();
  for (const proposal of proposals) {
    for (const funder of proposal.funders) {
      if (!seen.has(funder.id)) seen.set(funder.id, funder);
    }
  }
  return Array.from(seen.values());
}

/** Something on the page that needs the user, at most two at a time. */
export interface UpNextItem {
  readonly key: string;
  readonly tone: 'blue' | 'amber' | 'green';
  readonly icon: 'inbox' | 'clock' | 'update' | 'rfp' | 'proposal';
  readonly title: string;
  readonly detail: string;
  readonly actionLabel: string;
  /** Where the action goes, unless it starts a draft. */
  readonly href?: string;
  /** Starts a new draft on this side of the money, after signing in if need be. */
  readonly draft?: FundingIntent;
  /** The RFP whose proposals the action shows, so they can be marked seen. */
  readonly rfp?: { readonly postId: number; readonly proposalIds: number[] };
}

/**
 * Up next for someone who has not signed in or not taken part yet: the two
 * things the Publish menu starts, an RFP to fund research and a proposal to
 * raise for it.
 */
export const STARTER_UP_NEXT: readonly UpNextItem[] = [
  {
    key: 'draft-rfp',
    tone: 'blue',
    icon: 'rfp',
    title: 'Draft an RFP',
    detail: 'Fund the research you care about: set a budget and scientists send you proposals.',
    actionLabel: 'Open an RFP',
    draft: 'fund',
  },
  {
    key: 'draft-proposal',
    tone: 'green',
    icon: 'proposal',
    title: 'Draft a proposal',
    detail: 'Describe your research and raise money for it from funders.',
    actionLabel: 'Open a proposal',
    draft: 'need_funding',
  },
];

const UP_NEXT_LIMIT = 2;
/** How close a deadline has to be before it needs the user. */
const SOON_DAYS = 14;
/** How long funders can go without an update before the user is reminded. */
const QUIET_DAYS = 30;

interface UpNextInput {
  readonly rfps: readonly RfpCardModel[];
  readonly newProposalCount: (rfpPostId: number, proposalIds: readonly number[]) => number;
  readonly ownProposals: readonly OwnProposalModel[];
  readonly format: (amount: Money) => string;
  readonly now: number;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/**
 * What needs the user, most pressing first: new proposals on their RFPs, their
 * own proposals near their deadline, funders waiting for an update, and RFPs
 * about to close.
 */
export function buildUpNext({
  rfps,
  newProposalCount,
  ownProposals,
  format,
  now,
}: UpNextInput): UpNextItem[] {
  const items: UpNextItem[] = [];

  for (const rfp of rfps) {
    if (!rfp.isOpen) continue;
    const fresh = newProposalCount(rfp.postId, rfp.proposalIds);
    if (fresh === 0) continue;
    const closes =
      rfp.daysLeft != null && rfp.daysLeft > 0 ? `, closes in ${plural(rfp.daysLeft, 'day')}` : '';
    items.push({
      key: `rfp-new-${rfp.postId}`,
      tone: 'blue',
      icon: 'inbox',
      title: `${plural(fresh, 'new proposal')} on your RFP`,
      detail: `${rfp.title} · ${plural(rfp.proposalCount, 'proposal')} in${closes}`,
      actionLabel: 'Review proposals',
      href: rfp.href,
      rfp: { postId: rfp.postId, proposalIds: rfp.proposalIds },
    });
  }

  for (const proposal of ownProposals) {
    if (proposal.status !== 'raising' || proposal.daysLeft == null) continue;
    if (proposal.daysLeft < 0 || proposal.daysLeft > SOON_DAYS) continue;
    const remaining = {
      usd: Math.max(0, proposal.goal.usd - proposal.raised.usd),
      rsc: Math.max(0, proposal.goal.rsc - proposal.raised.rsc),
    };
    items.push({
      key: `own-soon-${proposal.postId}`,
      tone: 'green',
      icon: 'clock',
      title: `${format(remaining)} to go in ${plural(proposal.daysLeft, 'day')}`,
      detail: `${proposal.title} · ${proposal.percent ?? 0}% raised by ${plural(proposal.funderCount, 'funder')}`,
      actionLabel: 'Open',
      href: proposal.href,
    });
  }

  for (const proposal of ownProposals) {
    if (proposal.status !== 'funded') continue;
    const quietDays =
      proposal.lastUpdateAt != null ? Math.floor((now - proposal.lastUpdateAt) / DAY_MS) : null;
    if (quietDays != null && quietDays < QUIET_DAYS) continue;
    items.push({
      key: `own-update-${proposal.postId}`,
      tone: 'amber',
      icon: 'update',
      title:
        quietDays != null
          ? `Your funders last heard from you ${plural(quietDays, 'day')} ago`
          : 'Your funders are waiting for an update',
      detail: `${proposal.title} · ${plural(proposal.funderCount, 'funder')}`,
      actionLabel: 'Post an update',
      href: proposal.updatesHref,
    });
  }

  for (const rfp of rfps) {
    if (!rfp.isOpen || rfp.daysLeft == null || rfp.daysLeft < 0 || rfp.daysLeft > 7) continue;
    if (items.some((item) => item.rfp?.postId === rfp.postId)) continue;
    items.push({
      key: `rfp-closing-${rfp.postId}`,
      tone: 'amber',
      icon: 'clock',
      title: `Your RFP closes in ${plural(rfp.daysLeft, 'day')}`,
      detail: `${rfp.title} · ${plural(rfp.proposalCount, 'proposal')} in`,
      actionLabel: 'Open',
      href: rfp.href,
    });
  }

  return items.slice(0, UP_NEXT_LIMIT);
}
