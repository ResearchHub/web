import type { Work } from '@/types/work';
import { isGrantActive, type Grant } from '@/types/grant';
import config from './rfp.config.json';

/**
 * The literature-audit RFP: which ResearchHub post it is, and the figures the
 * page shows, read from that post's grant. It follows /consciousness
 * (`app/consciousness/data/rfp.ts`), with its own post and terms.
 *
 * Post ids differ between environments, so the id is picked per environment:
 * - production deploys use `productionPostId` in `rfp.config.json` (null
 *   until the RFP is posted);
 * - anywhere else, `AUDIT_RFP_POST_ID` names one, and `?rfp=<post id>`
 *   previews any.
 * With none, the page shows an empty pool and its buttons only explain.
 */
export function rfpPostId(preview?: string | string[]): number | null {
  const isProductionDeploy = process.env.VERCEL_ENV === 'production';
  if (!isProductionDeploy && typeof preview === 'string' && /^\d+$/.test(preview)) {
    return Number(preview);
  }
  const fromEnv = Number(process.env.AUDIT_RFP_POST_ID);
  if (Number.isInteger(fromEnv) && fromEnv > 0) return fromEnv;
  const fromConfig: number | null = config.productionPostId;
  return isProductionDeploy ? fromConfig : null;
}

/**
 * The campaign's own terms, which the grant does not hold.
 *
 * DRAFT: every value here is a placeholder until the call's terms are set.
 * `taxDeductibleLine` stays null unless gifts to this pool are confirmed to
 * be deductible; the page then shows no tax wording at all.
 */
export const CAMPAIGN: {
  goalUsd: number;
  goalBy: string;
  awardRangeLabel: string;
  taxDeductibleLine: string | null;
  taxDeductibleNote: string | null;
} = {
  goalUsd: 250_000,
  goalBy: '2027-01-31',
  awardRangeLabel: '$5k – $100k',
  taxDeductibleLine: null,
  taxDeductibleNote: null,
};

export interface Backer {
  id: number;
  name: string;
  amountUsd: number;
  /** Their ResearchHub avatar; null draws the app's generated one. */
  avatarUrl: string | null;
  /** Their author profile, for the avatar's link. */
  authorId?: number;
}

export type RfpStatus = 'OPEN' | 'PENDING' | 'CLOSED';

/** Everything the page shows about the RFP and its pool. */
export interface RfpView {
  /** Null when no RFP is configured or it failed to load. */
  grantId: number | null;
  /** The RFP's own page: its full proposal list and details. */
  rfpHref: string | null;
  raisedUsd: number;
  goalUsd: number;
  /** Phase 1's end date, ISO. */
  goalBy: string;
  /** Everyone who has added to the pool. */
  backerCount: number;
  /** The top backers by amount, largest first (the API sends the top few). */
  backers: Backer[];
  /** Already paid out to funded proposals. */
  distributedUsd: number;
  /** Proposals submitted to the RFP (its grant's applications). */
  proposalCount: number;
  status: RfpStatus;
  /** The proposal deadline as an ISO date, or null for rolling review. */
  deadline: string | null;
  awardRangeLabel: string;
}

/** The page's figures from the RFP post (`PostService.get`), or an empty pool. */
export function rfpView(work: Work | null): RfpView {
  const grant: Grant | undefined = work?.note?.post?.grant;
  const pool = grant?.fundingPool ?? null;
  const top = pool?.contributors.top ?? [];
  let status: RfpStatus = 'PENDING';
  if (grant && grant.status !== 'PENDING') status = isGrantActive(grant) ? 'OPEN' : 'CLOSED';
  return {
    grantId: grant?.id != null ? Number(grant.id) : null,
    rfpHref: work && grant ? `/rfp/${work.id}/${work.slug}` : null,
    raisedUsd: pool?.amountRaised.usd ?? 0,
    goalUsd: CAMPAIGN.goalUsd,
    goalBy: CAMPAIGN.goalBy,
    backerCount: pool?.contributors.total ?? 0,
    backers: top.map((c) => ({
      id: c.id,
      name: c.fullName,
      amountUsd: c.totalContribution.usd,
      avatarUrl: c.profileImage || null,
      authorId: c.authorProfileId,
    })),
    distributedUsd: pool?.amountDistributed.usd ?? 0,
    proposalCount: grant?.applications?.length ?? 0,
    status,
    deadline: grant?.endDate ? grant.endDate.slice(0, 10) : null,
    awardRangeLabel: CAMPAIGN.awardRangeLabel,
  };
}

/** Share of the goal raised, 0–100. */
export function poolPercent(rfp: RfpView): number {
  return rfp.goalUsd > 0 ? Math.min(100, (rfp.raisedUsd / rfp.goalUsd) * 100) : 0;
}

/** "$250,000" */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "$250k", for tight spots such as the phone dock. */
export function formatUsdShort(amount: number): string {
  // Hand-rolled: Intl's compact notation differs between Node and browsers,
  // which breaks hydration.
  const short = (n: number) => String(Math.round(n * 10) / 10);
  if (amount >= 1_000_000) return `$${short(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `$${short(amount / 1_000)}k`;
  return `$${Math.round(amount)}`;
}

/** "31 January 2027", in UTC so server and client agree. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** "Open until 31 March 2027", "Open · rolling review", "Opening soon" or "Closed". */
export function deadlineLabel(rfp: RfpView): string {
  if (rfp.status === 'CLOSED') return 'Closed';
  if (rfp.status === 'PENDING') return 'Opening soon';
  return rfp.deadline ? `Open until ${formatDate(rfp.deadline)}` : 'Open · rolling review';
}

/** Whole days from now to the end of `iso` (UTC), never below zero. */
export function daysLeft(iso: string): number {
  const end = Date.parse(`${iso}T23:59:59Z`);
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

/** Where to talk to the team (Tyler's booking link, as on /give and /consciousness). */
export const TALK_TO_TEAM = {
  bookingUrl: 'https://cal.com/tyler-diorio/15min',
};
