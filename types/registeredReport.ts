import { transformPost, type Work } from './work';

export type RegisteredReportStage = 'grant' | 'proposal' | 'registered_report';
type RegisteredReportTrackerLabel = 'Funding Opportunity' | 'Proposal' | 'Registered Report';

export interface RegisteredReportTrackerStep {
  stage: RegisteredReportStage;
  label: RegisteredReportTrackerLabel;
  exists: boolean;
  isCurrent: boolean;
  postId: number | null;
  title: string | null;
  documentType: 'GRANT' | 'PREREGISTRATION' | 'REGISTERED_REPORT' | null;
}

export interface RegisteredReportTrackerLink {
  postId: number | null;
  title: string | null;
}

export interface RegisteredReportProposalUser {
  id: number;
  fullName: string;
  isVerified: boolean;
}

export interface RegisteredReportProposalAuthor extends RegisteredReportProposalUser {
  profileImage: string | null;
}

export interface RegisteredReportProposalHub {
  id: number;
  name: string;
  slug: string;
}

export interface RegisteredReportProposalReview {
  id: number;
  score: number;
  isAssessed: boolean;
  createdBy: RegisteredReportProposalUser | null;
  createdDate: string;
  updatedDate: string;
}

export interface RegisteredReportProposalSidebarData {
  id: number;
  slug: string;
  title: string;
  doi: string | null;
  authors: RegisteredReportProposalAuthor[];
  createdBy: RegisteredReportProposalUser | null;
  createdDate: string;
  updatedDate: string;
  documentType: 'PREREGISTRATION';
  hubs: RegisteredReportProposalHub[];
  imageUrl: string | null;
  status: string;
  unifiedDocumentId: number;
  peerReviews: RegisteredReportProposalReview[];
}

export type RegisteredReportWork = Work & {
  fullJson?: unknown | null;
  formattedHtml?: string | null;
  fullSrc?: string | null;
  fullMarkdown?: string | null;
};

export interface RegisteredReportWorkResponse {
  id: number;
  work: RegisteredReportWork;
  proposal: RegisteredReportProposalSidebarData | null;
  tracker: RegisteredReportTrackerStep[];
  links: Record<RegisteredReportStage, RegisteredReportTrackerLink>;
}

type RawRegisteredReportTrackerStep = {
  stage?: string;
  label?: string;
  exists?: boolean;
  is_current?: boolean;
  post_id?: number | null;
  title?: string | null;
  document_type?: RegisteredReportTrackerStep['documentType'];
};

type RawRegisteredReportTrackerLink = {
  post_id?: number | null;
  title?: string | null;
};

type RawRegisteredReportProposalUser = {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  is_verified?: boolean;
};

type RawRegisteredReportProposalAuthor = RawRegisteredReportProposalUser & {
  profile_image?: string | null;
  user?: RawRegisteredReportProposalUser | null;
};

type RawRegisteredReportProposalHub = {
  id?: number;
  name?: string | null;
  slug?: string | null;
};

type RawRegisteredReportProposalReview = {
  id?: number;
  score?: number | null;
  is_assessed?: boolean;
  created_by?: RawRegisteredReportProposalUser | null;
  created_date?: string | null;
  updated_date?: string | null;
};

type RawRegisteredReportProposal = {
  id?: number;
  slug?: string | null;
  title?: string | null;
  doi?: string | null;
  authors?: RawRegisteredReportProposalAuthor[];
  created_by?: RawRegisteredReportProposalUser | null;
  created_date?: string | null;
  updated_date?: string | null;
  document_type?: 'PREREGISTRATION';
  hubs?: RawRegisteredReportProposalHub[];
  image_url?: string | null;
  status?: string | null;
  unified_document_id?: number;
  peer_reviews?: RawRegisteredReportProposalReview[];
};

type RawRegisteredReportWorkResponse = {
  id: number;
  work: Record<string, any>;
  content_object?: {
    proposal?: RawRegisteredReportProposal | null;
  };
  tracker?: RawRegisteredReportTrackerStep[];
  links?: Partial<Record<RegisteredReportStage, RawRegisteredReportTrackerLink>>;
  metrics?: any;
};

const DEFAULT_TRACKER_STEPS: RegisteredReportTrackerStep[] = [
  {
    stage: 'grant',
    label: 'Funding Opportunity',
    exists: false,
    isCurrent: false,
    postId: null,
    title: null,
    documentType: null,
  },
  {
    stage: 'proposal',
    label: 'Proposal',
    exists: false,
    isCurrent: false,
    postId: null,
    title: null,
    documentType: null,
  },
  {
    stage: 'registered_report',
    label: 'Registered Report',
    exists: false,
    isCurrent: false,
    postId: null,
    title: null,
    documentType: null,
  },
];

function isRegisteredReportStage(stage: string | undefined): stage is RegisteredReportStage {
  return stage === 'grant' || stage === 'proposal' || stage === 'registered_report';
}

function getTrackerLabel(stage: RegisteredReportStage): RegisteredReportTrackerLabel {
  if (stage === 'grant') return 'Funding Opportunity';
  if (stage === 'proposal') return 'Proposal';
  return 'Registered Report';
}

function transformTrackerStep(
  raw: RawRegisteredReportTrackerStep
): RegisteredReportTrackerStep | null {
  if (!isRegisteredReportStage(raw.stage)) return null;

  return {
    stage: raw.stage,
    label: getTrackerLabel(raw.stage),
    exists: Boolean(raw.exists),
    isCurrent: Boolean(raw.is_current),
    postId: raw.post_id ?? null,
    title: raw.title ?? null,
    documentType: raw.document_type ?? null,
  };
}

function transformTrackerLink(
  raw: RawRegisteredReportTrackerLink | undefined
): RegisteredReportTrackerLink {
  return {
    postId: raw?.post_id ?? null,
    title: raw?.title ?? null,
  };
}

/** Converts a compact API user value into sidebar-ready display data. */
function transformProposalUser(
  raw: RawRegisteredReportProposalUser | null | undefined
): RegisteredReportProposalUser | null {
  if (!raw || typeof raw.id !== 'number' || !Number.isInteger(raw.id)) return null;

  return {
    id: raw.id,
    fullName: `${raw.first_name ?? ''} ${raw.last_name ?? ''}`.trim() || 'Unknown user',
    isVerified: Boolean(raw.is_verified),
  };
}

/** Converts a compact API author value into sidebar-ready display data. */
function transformProposalAuthor(
  raw: RawRegisteredReportProposalAuthor
): RegisteredReportProposalAuthor | null {
  if (typeof raw.id !== 'number' || !Number.isInteger(raw.id)) return null;

  const user = transformProposalUser(raw.user);
  return {
    id: raw.id,
    fullName:
      `${raw.first_name ?? ''} ${raw.last_name ?? ''}`.trim() || user?.fullName || 'Unknown author',
    isVerified: user?.isVerified ?? false,
    profileImage: raw.profile_image ?? null,
  };
}

/** Converts proposal review data into the shape rendered by the report sidebar. */
function transformProposalReview(
  raw: RawRegisteredReportProposalReview
): RegisteredReportProposalReview | null {
  if (typeof raw.id !== 'number' || !Number.isInteger(raw.id)) return null;

  return {
    id: raw.id,
    score: Number(raw.score) || 0,
    isAssessed: Boolean(raw.is_assessed),
    createdBy: transformProposalUser(raw.created_by),
    createdDate: raw.created_date ?? '',
    updatedDate: raw.updated_date ?? '',
  };
}

/** Converts proposal hub data into the topic shape used by the sidebar. */
function transformProposalHub(
  raw: RawRegisteredReportProposalHub
): RegisteredReportProposalHub | null {
  if (typeof raw.id !== 'number' || !Number.isInteger(raw.id) || !raw.slug) return null;

  return {
    id: raw.id,
    name: raw.name ?? raw.slug,
    slug: raw.slug,
  };
}

/** Converts the source-proposal API payload into registered-report sidebar data. */
function transformProposalSidebarData(
  raw: RawRegisteredReportProposal | null | undefined
): RegisteredReportProposalSidebarData | null {
  if (!raw || typeof raw.id !== 'number' || !Number.isInteger(raw.id) || !raw.slug || !raw.title) {
    return null;
  }

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    doi: raw.doi ?? null,
    authors: (raw.authors ?? [])
      .map(transformProposalAuthor)
      .filter((author): author is RegisteredReportProposalAuthor => !!author),
    createdBy: transformProposalUser(raw.created_by),
    createdDate: raw.created_date ?? '',
    updatedDate: raw.updated_date ?? '',
    documentType: 'PREREGISTRATION',
    hubs: (raw.hubs ?? [])
      .map(transformProposalHub)
      .filter((hub): hub is RegisteredReportProposalHub => !!hub),
    imageUrl: raw.image_url ?? null,
    status: raw.status ?? '',
    unifiedDocumentId: raw.unified_document_id ?? 0,
    peerReviews: (raw.peer_reviews ?? [])
      .map(transformProposalReview)
      .filter((review): review is RegisteredReportProposalReview => !!review),
  };
}

/** Calculates the score shown for assessed source-proposal peer reviews. */
function getProposalReviewScore(proposal: RegisteredReportProposalSidebarData | null) {
  const assessedReviews = proposal?.peerReviews.filter((review) => review.isAssessed) ?? [];
  if (assessedReviews.length === 0) return undefined;

  return (
    assessedReviews.reduce((total, review) => total + review.score, 0) / assessedReviews.length
  );
}

function normalizeRegisteredReportWork(raw: any, metrics?: any): any {
  return {
    ...raw,
    type: raw.type ?? raw.document_type ?? 'REGISTERED_REPORT',
    full_markdown:
      raw.full_markdown ?? raw.formatted_html ?? raw.full_src ?? raw.renderable_text ?? '',
    metrics,
    unified_document: {
      ...(raw.unified_document ?? {}),
      id: raw.unified_document?.id ?? raw.unified_document_id,
      document_type: raw.unified_document?.document_type ?? raw.document_type,
      is_public: raw.unified_document?.is_public ?? true,
    },
  };
}

function transformRegisteredReportWork(raw: any, metrics?: any): RegisteredReportWork {
  return {
    ...transformPost(normalizeRegisteredReportWork(raw, metrics)),
    fullJson: raw.full_json ?? null,
    formattedHtml: raw.formatted_html ?? null,
    fullSrc: raw.full_src ?? null,
    fullMarkdown: raw.full_markdown ?? null,
  };
}

export function transformRegisteredReportWorkResponse(
  raw: RawRegisteredReportWorkResponse
): RegisteredReportWorkResponse {
  const apiTracker: RegisteredReportTrackerStep[] = Array.isArray(raw.tracker)
    ? raw.tracker
        .map(transformTrackerStep)
        .filter((step): step is RegisteredReportTrackerStep => !!step)
    : [];
  const tracker = DEFAULT_TRACKER_STEPS.map((defaultStep) => {
    const apiStep = apiTracker.find((step) => step.stage === defaultStep.stage);
    return apiStep ?? defaultStep;
  });
  const proposal = transformProposalSidebarData(raw.content_object?.proposal);
  const work = transformRegisteredReportWork(raw.work, raw.metrics);
  const proposalReviewScore = getProposalReviewScore(proposal);

  return {
    id: raw.id,
    work:
      proposalReviewScore === undefined || !work.metrics
        ? work
        : {
            ...work,
            metrics: {
              ...work.metrics,
              reviewScore: proposalReviewScore,
            },
          },
    proposal,
    tracker,
    links: {
      grant: transformTrackerLink(raw.links?.grant),
      proposal: transformTrackerLink(raw.links?.proposal),
      registered_report: transformTrackerLink(raw.links?.registered_report),
    },
  };
}
