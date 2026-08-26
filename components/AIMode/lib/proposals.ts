import { transformFeedEntry, type FeedEntry, type RawApiFeedEntry } from '@/types/feed';
import proposalFeedFixture from './fixtures/proposalFeed.json';
import type {
  Allocation,
  AllocationOutcome,
  GuardrailConfig,
  ProposalMedia,
  ProposalRecord,
  ProposalReviewer,
} from './types';

/**
 * The four real proposals submitted to grant 32. Review scores are the averages
 * shown on the proposal cards (`metrics.review_metrics`), so the assistant's
 * prose and the cards in the transcript can never disagree.
 */
export const PROPOSALS: ProposalRecord[] = [
  {
    postId: 32055,
    shortTitle: 'Experimental replication, characterization and feasibility',
    principalInvestigator: 'Narayanan Neithalath',
    lastName: 'Neithalath',
    reviewScore: 4.0,
    reviewCount: 3,
    rationale:
      'The only proposal that commits to running the full protocol end to end across multiple input rock types, which is what turns a single successful batch into a reproducibility claim.',
    peerReview: {
      reviewerName: 'Suramya Asthana, PhD',
      score: 4,
      heading: 'Methodological rigor and reproducibility',
      body: 'This is the most complete replication design of the submissions I have read. The applicant commits to the full two-stage protocol across four input lithologies with batch sizes varied by an order of magnitude, and — importantly — pre-registers a failure criterion, so a negative result is publishable rather than discarded. My one reservation is the curing environment: humidity is held constant where the original demonstration ran open to atmosphere, and that difference could plausibly account for a null. I would fund this and ask for an ambient-condition arm.',
    },
  },
  {
    postId: 32220,
    shortTitle: "Validation of Fóti's protocol and historical feasibility",
    principalInvestigator: 'Ange Therese Akono',
    lastName: 'Akono',
    reviewScore: 4.0,
    reviewCount: 2,
    rationale:
      'Pairs mechanical characterization with the pre-industrial feasibility question, which no other proposal treats as an experiment rather than an argument.',
    peerReview: {
      reviewerName: 'Scott Nelson, PhD',
      score: 4,
      heading: 'Treatment of the historical feasibility question',
      body: 'This is the only proposal that treats historical feasibility as an experiment rather than an argument. Sourcing the alkali from locally available plant ash and mineral deposits, then attempting the synthesis with pre-industrial vessels and fuel, is exactly the test the hypothesis has never been subjected to. The mechanical characterization plan is strong and the comparison samples are properly documented. My one condition is that sampling permits be confirmed before funds are released, since the timeline assumes access that has not been granted yet.',
    },
  },
  {
    postId: 32125,
    shortTitle: 'Controlled study of low-temperature alkali silicate synthesis',
    principalInvestigator: 'Michel Barsoum',
    lastName: 'Barsoum',
    reviewScore: 3.5,
    reviewCount: 2,
    rationale:
      'Comes from the group with the longest published record on geopolymer signatures in ancient stone, and proposes the tightest controls on the binder chemistry itself.',
    peerReview: {
      reviewerName: 'Xavier Pereira-Hernández, PhD',
      score: 4,
      heading: 'Analytical approach and controls',
      body: 'The binder chemistry work here is the tightest of the four. Tracking the eutectic through the dissolution stage with in-situ spectroscopy, rather than characterizing only the cured product, is the right call and will tell us what actually forms. Where the proposal is thinner is scope: it stops at the binder and does not carry through to mechanical properties of the cast stone, so on its own it cannot settle whether the product resembles the megalithic material. Strong and worth funding, but it needs a companion study.',
    },
  },
  {
    postId: 32249,
    shortTitle: 'Is it really a geopolymer?',
    principalInvestigator: 'Waltraud M. Kriven',
    lastName: 'Kriven',
    reviewScore: 3.0,
    reviewCount: 1,
    rationale:
      'Attacks the framing question directly — whether the product is a geopolymer at all — with the strongest analytical toolkit of the four.',
    holdNote: 'Only one review on file, so this is thin evidence rather than bad evidence.',
    peerReview: {
      reviewerName: 'Dominikus Brian',
      score: 3,
      heading: 'Framing and feasibility of the proposed work',
      body: 'The central question — whether the product is a geopolymer at all, or a lime-silicate with a different setting mechanism — is the right one to ask, and the analytical toolkit proposed is the strongest of the submissions. My hesitation is entirely about execution: the timeline allocates six weeks to sample preparation that I would expect to take twice that, and no contingency is described. I score this cautiously rather than negatively. A revised timeline would move my assessment up.',
    },
  },
];

const PROPOSALS_BY_ID = new Map(PROPOSALS.map((proposal) => [proposal.postId, proposal]));

export const getProposal = (postId: number) => PROPOSALS_BY_ID.get(postId);

const RAW_ENTRIES = proposalFeedFixture.results as unknown as RawApiFeedEntry[];

/**
 * Three of the captured proposals finished crowdfunding months ago, but in the
 * demo the RFP has only just gone live: a green "Funded" badge on a proposal the
 * assistant is describing as unfunded and mid-review reads as a bug. Reopening
 * the fundraise with nothing raised puts the cards back in the state the
 * transcript claims they're in.
 */
const asStillFundraising = (raw: RawApiFeedEntry): RawApiFeedEntry => {
  const fundraise = raw.content_object?.fundraise;
  if (!fundraise) return raw;

  return {
    ...raw,
    content_object: {
      ...raw.content_object,
      fundraise: {
        ...fundraise,
        status: 'OPEN',
        amount_raised: { usd: 0, rsc: 0 },
        contributors: { total: 0, top: [] },
      },
    },
  };
};

/**
 * Feed entries for the fixture, built through the same transformer the real feed
 * uses so the production proposal card consumes them unmodified. Failures are
 * swallowed per entry, matching `FeedService.getFeed`, so a shape change
 * degrades to fewer cards instead of taking down the overlay.
 */
const FEED_ENTRIES: FeedEntry[] = RAW_ENTRIES.map((raw) => {
  try {
    return transformFeedEntry(asStillFundraising(raw));
  } catch (error) {
    console.error('AI Mode: failed to transform proposal fixture entry', error);
    return null;
  }
}).filter((entry): entry is FeedEntry => !!entry);

const ENTRIES_BY_POST_ID = new Map(
  FEED_ENTRIES.map((entry) => [Number(entry.content.id), entry] as const)
);

export const getFeedEntries = (postIds: number[]): FeedEntry[] =>
  postIds
    .map((postId) => ENTRIES_BY_POST_ID.get(postId))
    .filter((entry): entry is FeedEntry => !!entry);

interface RawAuthor {
  first_name?: string;
  last_name?: string;
  profile_image?: string | null;
}

const AI_REVIEWER_NAME = 'AI Review';

const toReviewer = (author: RawAuthor | undefined): ProposalReviewer => ({
  name: [author?.first_name, author?.last_name].filter(Boolean).join(' ') || 'Reviewer',
  avatarUrl: author?.profile_image ?? null,
});

/**
 * Reviewer faces come off the captured reviews, but the count the card displays
 * is `review_metrics.count`, which is smaller — it excludes reviews that never
 * scored. Truncating to that count keeps the avatars and the stated number in
 * agreement, and floating the AI reviewer to the front keeps it visible, since
 * mixed AI and human review is the part of the pipeline the demo is about.
 */
const buildReviewers = (raw: RawApiFeedEntry, limit: number): ProposalReviewer[] => {
  const reviews: { author?: RawAuthor }[] = raw.content_object?.reviews ?? [];
  const reviewers = reviews.map((review) => toReviewer(review.author));

  return [
    ...reviewers.filter((reviewer) => reviewer.name === AI_REVIEWER_NAME),
    ...reviewers.filter((reviewer) => reviewer.name !== AI_REVIEWER_NAME),
  ].slice(0, Math.max(limit, 1));
};

const MEDIA_BY_POST_ID = new Map<number, ProposalMedia>(
  RAW_ENTRIES.map((raw) => {
    const postId = Number(raw.content_object?.id);
    const authors: RawAuthor[] = raw.content_object?.authors ?? [];

    return [
      postId,
      {
        imageUrl: raw.content_object?.image_url ?? null,
        piAvatarUrl: authors[0]?.profile_image ?? null,
        reviewers: buildReviewers(raw, PROPOSALS_BY_ID.get(postId)?.reviewCount ?? 1),
      },
    ] as const;
  })
);

export const getProposalMedia = (postId: number): ProposalMedia | undefined =>
  MEDIA_BY_POST_ID.get(postId);

export const ALL_PROPOSAL_POST_IDS = PROPOSALS.map((proposal) => proposal.postId);

/**
 * Strongest first. Both the review summary and the allocation summary list
 * proposals in this order, so the funder reads the same sequence twice.
 */
export const rankProposals = (records: ProposalRecord[]): ProposalRecord[] =>
  [...records].sort((a, b) => b.reviewScore - a.reviewScore || b.reviewCount - a.reviewCount);

/**
 * Turns the guardrail policy into the actual disbursement. Eligible proposals
 * are funded strongest-first, each taking the smaller of the per-proposal cap
 * and whatever budget remains — so every control in the guardrails step moves a
 * real number in the allocation summary.
 */
export const computeAllocations = (guardrails: GuardrailConfig): AllocationOutcome => {
  const ranked = rankProposals(PROPOSALS);

  let remaining = guardrails.totalBudgetUsd;

  const allocations: Allocation[] = ranked.map((proposal) => {
    const clearsBar = proposal.reviewScore >= guardrails.minReviewScore;
    const amountUsd = clearsBar ? Math.min(guardrails.maxPerProposalUsd, remaining) : 0;

    if (amountUsd > 0) {
      remaining -= amountUsd;
    }

    return {
      proposal,
      amountUsd,
      funded: amountUsd > 0,
      heldReason: amountUsd > 0 ? null : clearsBar ? 'budget' : 'score',
    };
  });

  const funded = allocations.filter((allocation) => allocation.funded);
  const held = allocations.filter((allocation) => !allocation.funded);
  const totalAllocatedUsd = funded.reduce((sum, allocation) => sum + allocation.amountUsd, 0);

  return {
    allocations,
    funded,
    held,
    totalAllocatedUsd,
    unallocatedUsd: guardrails.totalBudgetUsd - totalAllocatedUsd,
  };
};
