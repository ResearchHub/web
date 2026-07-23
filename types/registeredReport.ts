import { transformPost, type PeerReview, type Work } from './work';
import type { Topic } from './topic';

export type RegisteredReportStage = 'grant' | 'proposal' | 'registered_report';

export interface RegisteredReportTrackerStep {
  stage: RegisteredReportStage;
  label: 'Funding Opportunity' | 'Proposal' | 'Registered Report';
  exists: boolean;
  postId: number | null;
  title: string | null;
}

export interface RegisteredReportReviewer {
  id: number;
  fullName: string;
  profileImage: string | null;
  isVerified: boolean;
}

export interface RegisteredReportProposalReview {
  id: number;
  score: number;
  isAssessed: boolean;
  reviewer: RegisteredReportReviewer | null;
  createdDate: string | null;
}

export interface RegisteredReportProposalDetails {
  peerReviews: RegisteredReportProposalReview[];
  topics: Topic[];
}

export type RegisteredReportWork = Work & {
  fullJson?: unknown;
  formattedHtml?: string | null;
  fullSrc?: string | null;
  fullMarkdown?: string | null;
};

export interface RegisteredReportWorkResponse {
  id: number;
  work: RegisteredReportWork;
  proposal: RegisteredReportProposalDetails | null;
  tracker: RegisteredReportTrackerStep[];
}

export interface RegisteredReportTrackerPayload {
  reportId: number;
  tracker: RegisteredReportTrackerStep[];
}

type RawTrackerStep = {
  stage?: string;
  exists?: boolean;
  post_id?: number | null;
  title?: string | null;
};

type RawProposalUser = {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  profile_image?: string | null;
  is_verified?: boolean;
};

type RawProposalReview = {
  id?: number;
  score?: number | null;
  is_assessed?: boolean;
  created_by?: RawProposalUser | null;
  created_date?: string | null;
};

type RawProposalTopic = {
  id?: number;
  name?: string | null;
  slug?: string | null;
  namespace?: Topic['namespace'];
};

type RawProposal = {
  hubs?: RawProposalTopic[];
  peer_reviews?: RawProposalReview[];
};

type RawRegisteredReportWork = {
  type?: string;
  document_type?: string;
  full_json?: unknown;
  formatted_html?: string | null;
  full_src?: string | null;
  full_markdown?: string | null;
  renderable_text?: string | null;
  unified_document_id?: number;
  unified_document?: {
    id?: number;
    document_type?: string;
    is_public?: boolean;
  };
  [key: string]: unknown;
};

type RawRegisteredReportWorkResponse = {
  id: number;
  work: RawRegisteredReportWork;
  content_object?: {
    doi?: string | null;
    proposal?: RawProposal | null;
  };
  tracker?: RawTrackerStep[];
  metrics?: unknown;
};

const TRACKER_STEPS: RegisteredReportTrackerStep[] = [
  {
    stage: 'grant',
    label: 'Funding Opportunity',
    exists: false,
    postId: null,
    title: null,
  },
  {
    stage: 'proposal',
    label: 'Proposal',
    exists: false,
    postId: null,
    title: null,
  },
  {
    stage: 'registered_report',
    label: 'Registered Report',
    exists: false,
    postId: null,
    title: null,
  },
];

function transformTrackerStep(raw: RawTrackerStep): RegisteredReportTrackerStep | null {
  const defaultStep = TRACKER_STEPS.find((step) => step.stage === raw.stage);
  if (!defaultStep) return null;

  return {
    ...defaultStep,
    exists: Boolean(raw.exists),
    postId: raw.post_id ?? null,
    title: raw.title ?? null,
  };
}

function transformReviewer(user?: RawProposalUser | null): RegisteredReportReviewer | null {
  if (!user || typeof user.id !== 'number' || !Number.isInteger(user.id)) return null;

  const name = user.full_name ?? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  if (!name) return null;

  return {
    id: user.id,
    fullName: name,
    profileImage: user.profile_image ?? null,
    isVerified: Boolean(user.is_verified),
  };
}

function transformProposalReview(raw: RawProposalReview): RegisteredReportProposalReview | null {
  if (typeof raw.id !== 'number' || !Number.isInteger(raw.id)) return null;
  if (typeof raw.score !== 'number' || !Number.isFinite(raw.score)) return null;

  return {
    id: raw.id,
    score: raw.score,
    isAssessed: Boolean(raw.is_assessed),
    reviewer: transformReviewer(raw.created_by),
    createdDate: raw.created_date ?? null,
  };
}

function transformProposalTopic(raw: RawProposalTopic): Topic | null {
  if (typeof raw.id !== 'number' || !Number.isInteger(raw.id) || !raw.slug) return null;

  return {
    id: raw.id,
    name: raw.name ?? raw.slug,
    slug: raw.slug,
    namespace: raw.namespace,
  };
}

function transformProposalDetails(
  raw?: RawProposal | null
): RegisteredReportProposalDetails | null {
  if (!raw) return null;

  return {
    peerReviews: (raw.peer_reviews ?? [])
      .map(transformProposalReview)
      .filter((review): review is RegisteredReportProposalReview => review !== null),
    topics: (raw.hubs ?? [])
      .map(transformProposalTopic)
      .filter((topic): topic is Topic => topic !== null),
  };
}

export function getAverageProposalPeerReviewScore(
  proposal: RegisteredReportProposalDetails | null
): number | undefined {
  const reviews = proposal?.peerReviews ?? [];
  if (reviews.length === 0) return undefined;

  return reviews.reduce((total, review) => total + review.score, 0) / reviews.length;
}

export function createRegisteredReportTrackerPayload(
  payload: RegisteredReportWorkResponse
): RegisteredReportTrackerPayload {
  return {
    reportId: payload.work.id,
    tracker: payload.tracker,
  };
}

function transformPeerReview(review: RegisteredReportProposalReview): PeerReview | null {
  if (!review.reviewer) return null;

  return {
    id: review.id,
    score: review.score,
    isAssessed: review.isAssessed,
    createdDate: review.createdDate ?? '',
    createdBy: {
      id: review.reviewer.id,
      authorProfile: {
        id: review.reviewer.id,
        fullName: review.reviewer.fullName,
        profileImage: review.reviewer.profileImage ?? '',
        isVerified: review.reviewer.isVerified,
      },
    },
  };
}

function transformRegisteredReportWork(
  raw: RawRegisteredReportWork,
  metrics?: unknown
): RegisteredReportWork {
  return {
    ...transformPost({
      ...raw,
      type: raw.type ?? raw.document_type ?? 'REGISTERED_REPORT',
      full_markdown:
        raw.full_markdown ?? raw.formatted_html ?? raw.full_src ?? raw.renderable_text ?? '',
      metrics,
      unified_document: {
        ...raw.unified_document,
        id: raw.unified_document?.id ?? raw.unified_document_id,
        document_type: raw.unified_document?.document_type ?? raw.document_type,
        is_public: raw.unified_document?.is_public ?? true,
      },
    }),
    fullJson: raw.full_json ?? null,
    formattedHtml: raw.formatted_html ?? null,
    fullSrc: raw.full_src ?? null,
    fullMarkdown: raw.full_markdown ?? null,
  };
}

export function transformRegisteredReportWorkResponse(
  raw: RawRegisteredReportWorkResponse
): RegisteredReportWorkResponse {
  const apiSteps = new Map(
    (raw.tracker ?? [])
      .map(transformTrackerStep)
      .filter((step): step is RegisteredReportTrackerStep => step !== null)
      .map((step) => [step.stage, step])
  );
  const proposal = transformProposalDetails(raw.content_object?.proposal);
  const reviewScore = getAverageProposalPeerReviewScore(proposal);
  const peerReviews = (proposal?.peerReviews ?? [])
    .map(transformPeerReview)
    .filter((review): review is PeerReview => review !== null);
  const work = transformRegisteredReportWork(raw.work, raw.metrics);
  const doi = work.doi ?? raw.content_object?.doi ?? undefined;

  return {
    id: raw.id,
    work: {
      ...work,
      doi,
      peerReviews,
      ...(reviewScore === undefined || !work.metrics
        ? {}
        : { metrics: { ...work.metrics, reviewScore } }),
    },
    proposal,
    tracker: TRACKER_STEPS.map((step) => apiSteps.get(step.stage) ?? step),
  };
}
