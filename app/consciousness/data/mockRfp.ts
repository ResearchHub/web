/**
 * MOCK RFP DATA: every RFP fact the consciousness landing page shows lives here.
 *
 * The real RFP does not exist on ResearchHub yet, so each value below is a
 * placeholder. When it does, replace this object with the live grant
 * (`work.note.post.grant` from `PostService.get(id)`, as
 * `app/rfp/[id]/[slug]/layout.tsx` loads it). Nothing else on the page
 * hard-codes an RFP fact.
 */

export type RfpStatus = 'OPEN' | 'CLOSED';

export interface MockProposal {
  id: number;
  title: string;
  authors: string[];
  /** The open question it answers (`QUESTIONS[].id`); its figure is the cover. */
  trackId: string;
  raisedUsd: number;
  goalUsd: number;
}

export interface MockBacker {
  name: string;
  amountUsd: number;
  /** Their ResearchHub avatar; null draws the app's generated one. */
  avatarUrl: string | null;
}

export interface OrchOrRfp {
  /** Shown on the page as a "Preview · placeholder figures" note while true. */
  isMock: boolean;
  /** The ResearchHub grant id. PLACEHOLDER: null until the RFP is created. */
  grantId: number | null;
  /**
   * The RFP's ResearchHub post id (the number in /rfp/{id}/{slug}). Once set,
   * the page loads that post as the RFP page does and shows its live
   * proposals, activity, and the Share / Save / More menu. Until then
   * `?rfp=<post id>` previews any RFP's data here. PLACEHOLDER: null.
   */
  postId: number | null;
  title: string;
  /**
   * The account that creates the RFP on ResearchHub. Not shown on the page:
   * the money comes from many donors, so the page names no single funder.
   */
  author: { name: string; profileUrl: string | null };
  pool: {
    currency: 'USD';
    /** Raised so far, from everyone who has added to the pool. */
    raisedUsd: number;
    /** Phase 1's target: what the pool is raising (Kobe, 2026-11-17: $1M). */
    goalUsd: number;
    /** Phase 1's end date, ISO (Kobe, 2026-11-17: 31 December 2026). */
    goalBy: string;
    /** Everyone who has added to the pool. */
    backerCount: number;
    /** The top backers by amount, largest first (production sends the top few). */
    backers: MockBacker[];
    /** Already allocated to funded proposals. */
    distributedUsd: number;
    /** PLACEHOLDER: unknown whether contributions are tax-deductible. */
    taxDeductibleNote: string;
  };
  status: RfpStatus;
  /** ISO date, or null for rolling review. PLACEHOLDER date. */
  deadline: string | null;
  /** PLACEHOLDER dates for the "How it works" timeline. */
  opensOn: string;
  decisionsBy: string;
  /** Typical award size. PLACEHOLDER. */
  awardRangeLabel: string;
  /** MOCK proposals, to show the list as it will look; launch day has none. */
  proposals: MockProposal[];
}

export const ORCH_OR_RFP: OrchOrRfp = {
  isMock: true,
  grantId: null,
  postId: null,
  title: 'How does consciousness arise? Testing the open questions, quantum and otherwise',
  author: { name: 'ResearchHub Foundation', profileUrl: null },
  pool: {
    currency: 'USD',
    // MOCK backers, to show the pool as it will look once people join in.
    raisedUsd: 68_450,
    goalUsd: 1_000_000,
    goalBy: '2026-12-31',
    backerCount: 23,
    backers: [
      { name: 'Maya Chen', amountUsd: 25_000, avatarUrl: null },
      { name: 'Jonas Albrecht', amountUsd: 15_000, avatarUrl: null },
      { name: 'Priya Raman', amountUsd: 10_000, avatarUrl: null },
      { name: 'Tom Okafor', amountUsd: 5_000, avatarUrl: null },
      { name: 'Lena Fischer', amountUsd: 2_500, avatarUrl: null },
    ],
    distributedUsd: 0,
    taxDeductibleNote: '[Placeholder] Whether contributions are tax-deductible is to be confirmed.',
  },
  status: 'OPEN',
  deadline: '2027-03-31',
  opensOn: '2026-12-01',
  decisionsBy: '2027-06-30',
  awardRangeLabel: '$50k – $250k',
  // MOCK proposals (invented titles and people), newest first.
  proposals: [
    {
      id: 1,
      title: 'Measuring tryptophan superradiance in living neurons',
      authors: ['Hiro Tanaka', 'Amara Nwosu', 'Felix Brandt', 'Noor Haddad'],
      trackId: 'quantum-states',
      raisedUsd: 88_000,
      goalUsd: 180_000,
    },
    {
      id: 2,
      title: 'Does a microtubule stabiliser delay anesthesia? A preregistered replication in rats',
      authors: ['Sara Lindqvist', 'Daniel Okoye'],
      trackId: 'anesthesia',
      raisedUsd: 42_300,
      goalUsd: 120_000,
    },
    {
      id: 3,
      title: 'A tighter underground bound on gravity-related collapse',
      authors: ['Elena Rossi'],
      trackId: 'objective-reduction',
      raisedUsd: 150_000,
      goalUsd: 250_000,
    },
    {
      id: 4,
      title: 'How long can a microtubule hold a quantum state at body temperature?',
      authors: ['Mateo García', 'Ingrid Holm'],
      trackId: 'decoherence',
      raisedUsd: 12_500,
      goalUsd: 90_000,
    },
    {
      id: 5,
      title: 'Do gamma-band bursts line up with predicted collapse times?',
      authors: ['Rachel Kim', 'Tomás Vidal', 'Yuki Mori'],
      trackId: 'microtubule-to-mind',
      raisedUsd: 31_000,
      goalUsd: 75_000,
    },
  ],
};

/** Share of the goal raised, 0–100. */
export function poolPercent(rfp: OrchOrRfp): number {
  return rfp.pool.goalUsd > 0 ? Math.min(100, (rfp.pool.raisedUsd / rfp.pool.goalUsd) * 100) : 0;
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

/** "Open · closes 31 March 2027", "Open · rolling review" or "Closed". */
export function deadlineLabel(rfp: OrchOrRfp): string {
  if (rfp.status === 'CLOSED') return 'Closed';
  return rfp.deadline ? `Open until ${formatDate(rfp.deadline)}` : 'Open · rolling review';
}

/** Where to talk to the team (Tyler's booking link, as on /give). */
export const TALK_TO_TEAM = {
  bookingUrl: 'https://cal.com/tyler-diorio/15min',
  email: 'hello@researchhub.com',
};

/** The deadline mid-sentence: "open until 31 March 2027". */
export function deadlinePhrase(rfp: OrchOrRfp): string {
  const label = deadlineLabel(rfp);
  return label.charAt(0).toLowerCase() + label.slice(1);
}
