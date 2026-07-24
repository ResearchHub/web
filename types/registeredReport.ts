import {
  transformPeerReview as transformWorkPeerReview,
  transformPost,
  type PeerReview,
  type Work,
} from './work';
import { transformTopic, type Topic } from './topic';
import { normalizeRegisteredReportId } from '@/utils/registeredReportPrefill';

export type RegisteredReportStage = 'grant' | 'proposal' | 'registered_report';

export interface RegisteredReportTrackerStep {
  stage: RegisteredReportStage;
  label: 'Funding Opportunity' | 'Proposal' | 'Registered Report';
  exists: boolean;
  postId: number | null;
  title: string | null;
}

export interface RegisteredReportProposalDetails {
  peerReviews: PeerReview[];
  topics: Topic[];
}

export type RegisteredReportWork = Work & {
  fullJson?: unknown;
  formattedHtml?: string | null;
  fullSrc?: string | null;
  fullMarkdown?: string | null;
};

export interface RegisteredReportWorkResponse {
  work: RegisteredReportWork;
  proposal: RegisteredReportProposalDetails | null;
  tracker: RegisteredReportTrackerStep[];
}

export type RegisteredReportTrackerPayload = Pick<RegisteredReportWorkResponse, 'tracker'> & {
  reportId: number;
};

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
  author_profile?: RawProposalUser | null;
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
  namespace: Topic['namespace'];
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

export type RawRegisteredReportWorkResponse = {
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
  const postId = normalizeRegisteredReportId(raw.post_id);
  const exists = raw.exists === true && postId !== null;

  return {
    ...defaultStep,
    exists,
    postId: exists ? postId : null,
    title: exists && typeof raw.title === 'string' ? raw.title : null,
  };
}

function transformProposalReview(raw: RawProposalReview): PeerReview | null {
  const reviewId = normalizeRegisteredReportId(raw.id);
  if (
    raw.is_assessed !== true ||
    typeof raw.score !== 'number' ||
    !Number.isFinite(raw.score) ||
    !raw.created_date ||
    Number.isNaN(Date.parse(raw.created_date))
  ) {
    return null;
  }

  const reviewer = raw.created_by;
  const profile: RawProposalUser = reviewer?.author_profile ?? reviewer ?? {};
  const profileId = normalizeRegisteredReportId(profile.id) ?? 0;
  const reviewerId = normalizeRegisteredReportId(reviewer?.id) ?? profileId;
  if (!reviewId) return null;

  const displayName =
    profile.full_name?.trim() ||
    `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() ||
    'Anonymous reviewer';
  const [firstName = 'Anonymous reviewer', ...lastName] = displayName.split(/\s+/);
  return transformWorkPeerReview({
    ...raw,
    id: reviewId,
    created_by: {
      id: reviewerId,
      author_profile: {
        ...profile,
        id: profileId,
        first_name: firstName,
        last_name: lastName.join(' '),
      },
    },
  });
}

function transformProposalTopic(raw: RawProposalTopic): Topic | null {
  const id = normalizeRegisteredReportId(raw.id);
  if (!id || !raw.slug) return null;

  return transformTopic({ ...raw, id, name: raw.name || raw.slug });
}

function transformProposalDetails(
  raw?: RawProposal | null
): RegisteredReportProposalDetails | null {
  if (!raw) return null;

  return {
    peerReviews: (raw.peer_reviews ?? [])
      .map(transformProposalReview)
      .filter((review): review is PeerReview => review !== null),
    topics: (raw.hubs ?? [])
      .map(transformProposalTopic)
      .filter((topic): topic is Topic => topic !== null),
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
  const work = transformRegisteredReportWork(raw.work, raw.metrics);
  const doi = work.doi ?? raw.content_object?.doi ?? undefined;

  return {
    work: {
      ...work,
      doi,
      peerReviews: proposal?.peerReviews ?? [],
    },
    proposal,
    tracker: TRACKER_STEPS.map((step) => apiSteps.get(step.stage) ?? step),
  };
}
