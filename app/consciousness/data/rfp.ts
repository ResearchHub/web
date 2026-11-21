import type { Work } from '@/types/work';
import { isGrantActive, type Grant } from '@/types/grant';
import config from './rfp.config.json';

/**
 * The consciousness RFP: which ResearchHub post it is, and the figures the
 * page shows, read from that post's grant.
 *
 * Post ids differ between environments, so the id is picked per environment:
 * - production deploys use `productionPostId` in `rfp.config.json`, which
 *   `next.config.js` also reads to send /rfp/<id>/<slug> here;
 * - anywhere else, `CONSCIOUSNESS_RFP_POST_ID` names one (e.g. a generic RFP
 *   on staging or through a local proxy), and `?rfp=<post id>` previews any.
 * With none, the page shows an empty pool and its buttons only explain.
 */
export function rfpPostId(preview?: string | string[]): number | null {
  const isProductionDeploy = process.env.VERCEL_ENV === 'production';
  if (!isProductionDeploy && typeof preview === 'string' && /^\d+$/.test(preview)) {
    return Number(preview);
  }
  const fromEnv = Number(process.env.CONSCIOUSNESS_RFP_POST_ID);
  if (Number.isInteger(fromEnv) && fromEnv > 0) return fromEnv;
  return isProductionDeploy ? config.productionPostId : null;
}

/**
 * Whether the page is showing the campaign's own RFP, and not another one
 * opened with `?rfp=`. Terms that hold only for this RFP depend on it.
 */
export function isCampaignRfp(preview?: string | string[]): boolean {
  const campaignPostId = rfpPostId();
  return campaignPostId != null && rfpPostId(preview) === campaignPostId;
}

/**
 * The campaign's own terms, which the grant does not hold: Phase 1's target
 * and end date (Kobe, 2026-11-17), the typical award, and the tax wording:
 * the short line for the hero and funding panel, the full note under the
 * funding total. Both say "qualifying": only money that reaches the fund at
 * Endaoment is deductible, not a ResearchHub balance (call, 2026-11-20).
 */
export const CAMPAIGN = {
  goalUsd: 1_000_000,
  goalBy: '2026-12-31',
  awardRangeLabel: '$50k – $250k',
  taxDeductibleLine: 'Tax deductible on qualifying contributions',
  taxDeductibleNote:
    'Qualifying contributions go to the ResearchHub Foundation’s fund at Endaoment, a 501(c)(3), and are generally tax-deductible in the US.',
} as const;

export interface Backer {
  id: number;
  name: string;
  amountUsd: number;
  /** Their ResearchHub avatar; null draws the app's generated one. */
  avatarUrl: string | null;
  /** Their author profile, for the avatar's tooltip and link. */
  authorId?: number;
}

export type RfpStatus = 'OPEN' | 'PENDING' | 'CLOSED';

/** Everything the page shows about the RFP and its pool. */
export interface RfpView {
  /** Null when no RFP is configured or it failed to load. */
  grantId: number | null;
  /** The RFP's own page, kept reachable with `?view=rfp`. */
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
  taxDeductibleNote: string;
}

/** The page's figures from the RFP post (`PostService.get`), or an empty pool. */
export function rfpView(work: Work | null): RfpView {
  const grant: Grant | undefined = work?.note?.post?.grant;
  const pool = grant?.fundingPool ?? null;
  const top = pool?.contributors.top ?? [];
  return {
    grantId: grant?.id != null ? Number(grant.id) : null,
    rfpHref: work && grant ? `/rfp/${work.id}/${work.slug}?view=rfp` : null,
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
    // No RFP loaded reads as opening soon, as the page's buttons then say.
    status: !grant
      ? 'PENDING'
      : grant.status === 'PENDING'
        ? 'PENDING'
        : isGrantActive(grant)
          ? 'OPEN'
          : 'CLOSED',
    deadline: grant?.endDate ? grant.endDate.slice(0, 10) : null,
    awardRangeLabel: CAMPAIGN.awardRangeLabel,
    taxDeductibleNote: CAMPAIGN.taxDeductibleNote,
  };
}

/** Share of the goal raised, 0–100. */
export function poolPercent(rfp: RfpView): number {
  return rfp.goalUsd > 0 ? Math.min(100, (rfp.raisedUsd / rfp.goalUsd) * 100) : 0;
}

/** "$1,000,000" */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "$1M", for tight spots such as the phone dock. */
export function formatUsdShort(amount: number): string {
  // Hand-rolled: Intl's compact notation differs between Node and browsers,
  // which breaks hydration.
  const short = (n: number) => String(Math.round(n * 10) / 10);
  if (amount >= 1_000_000) return `$${short(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `$${short(amount / 1_000)}k`;
  return `$${Math.round(amount)}`;
}

/** "31 March 2027", in UTC so server and client agree. */
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

/** Where to talk to the team (Tyler's booking link, as on /give). */
export const TALK_TO_TEAM = {
  bookingUrl: 'https://cal.com/tyler-diorio/15min',
};

/** The deadline mid-sentence: "open until 31 March 2027". */
export function deadlinePhrase(rfp: RfpView): string {
  const label = deadlineLabel(rfp);
  return label.charAt(0).toLowerCase() + label.slice(1);
}
