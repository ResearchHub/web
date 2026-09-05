import { transformFeedEntry, type FeedEntry, type RawApiFeedEntry } from '@/types/feed';
import proposalFeedFixture from './fixtures/proposalFeed.json';
import type {
  Allocation,
  AllocationOutcome,
  JudgmentPolicy,
  ProposalMedia,
  ProposalRecord,
  ProposalReviewer,
} from './types';

/**
 * The four proposals in the demo, one per unresolved claim except VASO-C004,
 * which draws two. Nothing arrives for VASO-C021 — the memory claim — and that
 * absence is load-bearing: it is what the assistant reserves the remaining
 * budget against instead of spending the round down to zero.
 *
 * Review scores are the averages the cards display (`metrics.review_metrics`),
 * so the assistant's prose and the cards can never disagree. Where a score is
 * an average over a split — Aristov, at 4.0 across an AI review of 5 and a
 * human review of 3 — the split is the point, not noise to be smoothed.
 */
export const PROPOSALS: ProposalRecord[] = [
  {
    postId: 41001,
    shortTitle: 'Time-locked imaging of breath-assisted release',
    principalInvestigator: 'Ines Halvorsen',
    lastName: 'Halvorsen',
    claimId: 'VASO-C004',
    studyId: 'VASO-R001',
    requestedUsd: 150_000,
    reviewScore: 4.7,
    reviewCount: 3,
    rationale:
      'The keystone. It is the only proposal that can settle the claim everything else in the case file is waiting on, it is the cheapest study in the round, and it is designed so that a null result is as publishable as a positive one.',
    peerReview: {
      reviewerName: 'Ilse Vandermeer, PhD',
      score: 5,
      heading: 'Adequacy of the controls against expectation',
      body: 'This is the study the field has been missing, and the applicant has not cut the corner that would have made it cheap and worthless. The factorial arms are right — pressure with normal breathing, slow breathing without pressure, sham sites, and crucially the failed attempts, which most designs discard. Blinded site localization by two examiners with the analysis volume predefined removes the obvious objection. What raises this from good to fundable is the preregistered latch-specific ordering: perfusion rises before stiffness falls. That is a prediction the conventional guarding account does not make, so the two hypotheses are separable on this data rather than merely compared. My one request is that the probe load-cell calibration be reported per session rather than once, since drift over a long imaging block would smear exactly the seconds-scale window the study is built to resolve.',
    },
  },
  {
    postId: 41002,
    shortTitle: 'Paired-caliber latch test with stimulus withdrawal',
    principalInvestigator: 'Rafael Otieno-Mbeki',
    lastName: 'Otieno-Mbeki',
    claimId: 'VASO-C020',
    studyId: 'VASO-R004',
    requestedUsd: 240_000,
    reviewScore: 4.0,
    reviewCount: 3,
    rationale:
      'Attacks the mechanism claim where it is actually weak. The paired-caliber design answers the branch-order problem directly, and the stimulus-withdrawal phase distinguishes a cheap hold from a state that persists after its input stops — which is the only version of the latch a knot could be made of.',
    peerReview: {
      reviewerName: 'Tomás Reñé Alcázar, MD, PhD',
      score: 4,
      heading: 'Vessel-class and caliber coverage',
      body: 'The design is correctly aimed. Taking a feeding artery and successive arteriole orders from the same bed, cannulated and pressurized rather than held isometric, is the right response to a literature where latch behaviour was present in a parent vessel and absent one branch order downstream. The stimulus-withdrawal phase is the part I would protect if the budget were cut: economical force maintenance under continuing activation is a different finding, and conflating the two is how this hypothesis has stayed alive without evidence. Where the proposal is thinner is energetics. It measures phosphorylation and diameter but no contemporaneous oxygen consumption or ATP turnover, and the cheap-hold argument has never been measured in any arteriole of any bed. This study could close that gap and chooses not to. I would fund it and ask for an energetic arm.',
    },
  },
  {
    postId: 41003,
    shortTitle: 'The knot census',
    principalInvestigator: 'Junko Aristov',
    lastName: 'Aristov',
    claimId: 'VASO-C004',
    studyId: 'VASO-R002',
    requestedUsd: 265_000,
    reviewScore: 4.0,
    reviewCount: 2,
    rationale:
      'Infrastructure rather than a verdict. It produces the two curves the field lacks and, more usefully for this program, the localization protocol every other study on this claim has to borrow.',
    peerReview: {
      reviewerName: 'Hedda Kirchmayr, PhD',
      score: 3,
      heading: 'Reliability of the observational base',
      body: 'I score this lower than the AI reviewer did, and the disagreement is substantive rather than a matter of taste. The census presupposes that trained examiners can agree on where a tender point is. Systematic reviews report that they cannot, and there is no validated reference standard for what one is — which means a burden-versus-age curve built on blinded palpation may be measuring examiner behaviour with age-related expectations rather than tissue. The proposal treats this as a training problem and allocates two weeks to calibration. It is not a training problem; it is the construct problem, and it is the reason the observational base of this whole case is contested. What would move me to a 4 is small: lock the inter-examiner reliability substudy as a gate before the main cohort opens, with a prespecified kappa below which the study reports a null on reliability and stops. That is a cheap amendment and it would make the census informative in either direction. As written it risks producing an atlas that nobody outside this program will accept.',
    },
  },
  {
    postId: 41004,
    shortTitle: 'Preregistered coding of the contemplative knot maps',
    principalInvestigator: 'Kalsang Norbu Rabten',
    lastName: 'Rabten',
    claimId: 'VASO-C022',
    studyId: 'VASO-R006',
    requestedUsd: 70_000,
    reviewScore: 3.0,
    reviewCount: 1,
    rationale:
      'Cheap, decisive for its own claim, and publishable either way — it either elevates the traditional maps to admissible documents or retires the convergence argument as pattern-matching.',
    holdNote:
      "One review on file, and the reviewer's objection is to the corpus design rather than to the applicant — thin evidence rather than bad evidence.",
    peerReview: {
      reviewerName: 'Kunga Dorje Tsering, PhD',
      score: 3,
      heading: 'Corpus selection and coding before inspection',
      body: 'The blinding order is correct and it is the whole ballgame: coding traditional locations into a common coordinate system before any modern map is inspected is what separates first-person cartography from post-hoc resemblance, and the applicant clearly understands this. My reservation is that the three corpora are being treated as one object. The rtsa mdud of Tibetan tantric physiology are positions in a system of channels and winds with soteriological function; the ashi points of seventh-century Chinese medicine are, by their own name, wherever the patient cries out. Those are different epistemic kinds, and pooling them into a single coordinate set before testing means a chance alignment driven by the ashi corpus — which is defined by tenderness and so is nearly guaranteed to sit where tender points are — would be reported as convergence for the tantric maps. Code and test them separately, with the pooled analysis as a secondary, and I would score this a 4.',
    },
  },
];

const PROPOSALS_BY_ID = new Map(PROPOSALS.map((proposal) => [proposal.postId, proposal]));

export const getProposal = (postId: number) => PROPOSALS_BY_ID.get(postId);

const RAW_ENTRIES = proposalFeedFixture.results as unknown as RawApiFeedEntry[];

/**
 * Feed entries for the fixture, built through the same transformer the real feed
 * uses so the production proposal card consumes them unmodified. Failures are
 * swallowed per entry, matching `FeedService.getFeed`, so a shape change
 * degrades to fewer cards instead of taking down the overlay.
 */
const FEED_ENTRIES: FeedEntry[] = RAW_ENTRIES.map((raw) => {
  try {
    return transformFeedEntry(raw);
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
 * Reviewer faces come off the fixture's review list, truncated to the count the
 * card displays so the avatars and the stated number agree. The AI reviewer
 * floats to the front deliberately: mixed AI and human review, labeled as such,
 * is the part of the pipeline the demo is about.
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
 * are funded strongest-first at what they asked for, capped by the per-proposal
 * limit, and only if the whole award still fits in the remaining budget — a
 * part-funded protocol is not a smaller version of the same experiment.
 */
export const computeAllocations = (policy: JudgmentPolicy): AllocationOutcome => {
  const ranked = rankProposals(PROPOSALS);

  let remaining = policy.totalBudgetUsd;

  const allocations: Allocation[] = ranked.map((proposal) => {
    const clearsBar = proposal.reviewScore >= policy.minReviewScore;
    const award = Math.min(proposal.requestedUsd, policy.maxPerProposalUsd);
    const fits = award <= remaining;
    const amountUsd = clearsBar && fits ? award : 0;

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
    unallocatedUsd: policy.totalBudgetUsd - totalAllocatedUsd,
  };
};
