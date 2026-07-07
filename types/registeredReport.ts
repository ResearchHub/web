import { Work, transformPost } from './work';
import { stripHtml } from '../utils/stringUtils';

export type RegisteredReportStage = 'grant' | 'proposal' | 'registered_report' | 'preprint';
type RegisteredReportTrackerLabel =
  | 'Funding Opportunity'
  | 'Proposal'
  | 'Registered Report'
  | 'Preprint';

export interface RegisteredReportTrackerStep {
  stage: RegisteredReportStage;
  label: RegisteredReportTrackerLabel;
  exists: boolean;
  isCurrent: boolean;
  postId: number | null;
  documentType: 'GRANT' | 'PREREGISTRATION' | 'REGISTERED_REPORT' | 'PAPER' | null;
  url: string | null;
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
  tracker: RegisteredReportTrackerStep[];
  links: Record<RegisteredReportStage, string | null>;
}

type RawRegisteredReportTrackerStep = {
  stage?: string;
  label?: string;
  exists?: boolean;
  is_current?: boolean;
  post_id?: number | null;
  document_type?: RegisteredReportTrackerStep['documentType'];
  url?: string | null;
};

type RawRegisteredReportWorkResponse = {
  id: number;
  work: Record<string, any>;
  tracker?: RawRegisteredReportTrackerStep[];
  links?: Partial<Record<RegisteredReportStage, string | null>>;
  metrics?: any;
};

const DEFAULT_TRACKER_STEPS: RegisteredReportTrackerStep[] = [
  {
    stage: 'grant',
    label: 'Funding Opportunity',
    exists: false,
    isCurrent: false,
    postId: null,
    documentType: null,
    url: null,
  },
  {
    stage: 'proposal',
    label: 'Proposal',
    exists: false,
    isCurrent: false,
    postId: null,
    documentType: null,
    url: null,
  },
  {
    stage: 'registered_report',
    label: 'Registered Report',
    exists: false,
    isCurrent: false,
    postId: null,
    documentType: null,
    url: null,
  },
  {
    stage: 'preprint',
    label: 'Preprint',
    exists: false,
    isCurrent: false,
    postId: null,
    documentType: null,
    url: null,
  },
];

function isRegisteredReportStage(stage: string | undefined): stage is RegisteredReportStage {
  return (
    stage === 'grant' ||
    stage === 'proposal' ||
    stage === 'registered_report' ||
    stage === 'preprint'
  );
}

function getTrackerLabel(stage: RegisteredReportStage): RegisteredReportTrackerLabel {
  if (stage === 'grant') return 'Funding Opportunity';
  if (stage === 'proposal') return 'Proposal';
  if (stage === 'registered_report') return 'Registered Report';
  return 'Preprint';
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
    documentType: raw.document_type ?? null,
    url: raw.url ?? null,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function removeLeadingTitle(text: string, title: string): string {
  const normalizedText = text.trim();
  const normalizedTitle = title.trim();

  if (!normalizedTitle || !normalizedText.startsWith(normalizedTitle)) {
    return normalizedText;
  }

  return normalizedText.slice(normalizedTitle.length).trim();
}

function plainTextToHtml(text: string, title: string): string {
  return removeLeadingTitle(text, title)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function getRegisteredReportStagePreview(raw: any): string {
  const richContent =
    raw.full_markdown || raw.formatted_html || raw.full_src || raw.note?.latest_version?.src;

  if (richContent && typeof richContent === 'string') {
    return richContent;
  }

  if (raw.renderable_text) {
    return plainTextToHtml(raw.renderable_text, stripHtml(raw.title || raw.paper_title || ''));
  }

  return '';
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

function normalizeRegisteredReportStageWork(raw: any): any {
  return {
    ...raw,
    full_markdown: getRegisteredReportStagePreview(raw),
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

export function transformRegisteredReportStageWork(raw: any): Work {
  return transformPost(normalizeRegisteredReportStageWork(raw));
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

  return {
    id: raw.id,
    work: transformRegisteredReportWork(raw.work, raw.metrics),
    tracker,
    links: {
      grant: raw.links?.grant ?? null,
      proposal: raw.links?.proposal ?? null,
      registered_report: raw.links?.registered_report ?? null,
      preprint: raw.links?.preprint ?? null,
    },
  };
}
