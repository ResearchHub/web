import { snakeCaseToTitleCase } from '@/utils/stringUtils';
import type { Insight, RiskScoreEvent, SourceDetail } from '@/types/user';

export type RiskScoreEventType =
  | 'WORK_APPROVED'
  | 'WORK_DECLINED'
  | 'CONTENT_CENSORED'
  | 'BOUNTY_AWARDED'
  | 'PEER_REVIEW_TIPPED'
  | 'PEER_REVIEW_ASSESSED'
  | 'EXPERT_FINDER_SIGNUP'
  | 'EDU_EMAIL'
  | 'GOOGLE_SIGNUP'
  | 'ACCOUNT_AGE_BONUS'
  | 'PERSONA_VERIFIED'
  | 'PERSONA_VERIFIED_WHITELISTED'
  | 'PERSONA_VERIFIED_NON_WHITELISTED'
  | 'WORKS_MODERATED';

export type InsightTone = 'good' | 'bad' | 'mixed';

interface RiskScoreEventMeta {
  label?: string;
  action?: string;
  tooltip?: string;
  mixedTooltip?: string;
  isPersonaVerification?: boolean;
}

const RISK_SCORE_EVENT_META: Record<RiskScoreEventType, RiskScoreEventMeta> = {
  WORK_APPROVED: {
    action: 'Approved',
    tooltip:
      'A paper, proposal, or funding opportunity the user authored was approved by a moderator',
  },
  WORK_DECLINED: {
    action: 'Declined',
    tooltip:
      'A paper, proposal, or funding opportunity the user authored was declined by a moderator',
  },
  CONTENT_CENSORED: {
    action: 'Censored',
    tooltip: 'A paper, post, or comment by the user was removed for policy violations',
    mixedTooltip: 'User has had content both censored and restored',
  },
  BOUNTY_AWARDED: {
    action: 'Bounty Awarded',
    tooltip: "The user's solution was selected as the winning answer to a bounty",
  },
  PEER_REVIEW_TIPPED: {
    action: 'Tipped',
    tooltip: "The community awarded ResearchCoin to the user's peer review",
  },
  PEER_REVIEW_ASSESSED: {
    action: 'Assessed',
    tooltip: "The user's peer review was endorsed by the community or moderation",
  },
  EXPERT_FINDER_SIGNUP: { tooltip: 'The user signed up via an Expert Finder invite' },
  EDU_EMAIL: { label: 'Verified Edu Email', tooltip: 'The user has a verified .edu email address' },
  GOOGLE_SIGNUP: { tooltip: 'The user signed up using Google authentication' },
  ACCOUNT_AGE_BONUS: { tooltip: 'The user passed the minimum account-age threshold' },
  PERSONA_VERIFIED: {
    tooltip: 'The user passed Persona ID verification',
    isPersonaVerification: true,
  },
  PERSONA_VERIFIED_WHITELISTED: {
    label: 'Persona Verified (Whitelisted)',
    tooltip: 'The user passed Persona ID verification from a whitelisted country',
    isPersonaVerification: true,
  },
  PERSONA_VERIFIED_NON_WHITELISTED: {
    label: 'Persona Verified (Non-Whitelisted)',
    tooltip: 'The user passed Persona ID verification from a non-whitelisted country',
    isPersonaVerification: true,
  },
  WORKS_MODERATED: {
    tooltip: "Total moderation activity on the user's papers, proposals, and grants",
    mixedTooltip: 'User has both approved and declined works, possibly worth reviewing',
  },
};

const FILTERABLE_EVENT_TYPES: RiskScoreEventType[] = [
  'WORK_APPROVED',
  'WORK_DECLINED',
  'CONTENT_CENSORED',
  'BOUNTY_AWARDED',
  'PEER_REVIEW_TIPPED',
  'PEER_REVIEW_ASSESSED',
  'EXPERT_FINDER_SIGNUP',
  'EDU_EMAIL',
  'GOOGLE_SIGNUP',
  'ACCOUNT_AGE_BONUS',
  'PERSONA_VERIFIED_WHITELISTED',
  'PERSONA_VERIFIED_NON_WHITELISTED',
];

const DOCUMENT_LABELS: Record<string, string> = {
  PAPER: 'Paper',
  DISCUSSION: 'Work',
  PREREGISTRATION: 'Proposal',
  GRANT: 'Funding Opportunity',
  QUESTION: 'Question',
  NOTE: 'Note',
  BOUNTY: 'Bounty',
  POSTS: 'Work',
};

const COMMENT_LABELS: Record<string, string> = {
  GENERIC_COMMENT: 'Comment',
  PEER_REVIEW: 'Peer Review',
  REVIEW: 'Community Review',
  ANSWER: 'Answer',
  SUMMARY: 'Summary',
  AUTHOR_UPDATE: 'Author Update',
  REPLICABILITY_COMMENT: 'Replicability Comment',
  INNER_CONTENT_COMMENT: 'Inline Comment',
};

const metaFor = (eventType: string): RiskScoreEventMeta | undefined =>
  RISK_SCORE_EVENT_META[eventType as RiskScoreEventType];

export function getEventLabel(eventType: string): string {
  return metaFor(eventType)?.label ?? snakeCaseToTitleCase(eventType);
}

export function isPersonaVerificationEvent(eventType: string): boolean {
  return metaFor(eventType)?.isPersonaVerification ?? false;
}

export const EVENT_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Events', value: '' },
  ...FILTERABLE_EVENT_TYPES.map((type) => ({ label: getEventLabel(type), value: type })),
];

function getSourceLabel(detail: SourceDetail): string {
  if (detail.commentType) return COMMENT_LABELS[detail.commentType] ?? 'Comment';
  if (detail.documentType) return DOCUMENT_LABELS[detail.documentType] ?? 'Document';
  return 'Item';
}

export function formatEventRowLabel(event: RiskScoreEvent): string {
  const action = metaFor(event.eventType)?.action;
  if (!event.sourceDetail || !action) return getEventLabel(event.eventType);
  return `${getSourceLabel(event.sourceDetail)} ${action}`;
}

export function formatInsightLabel(eventType: string, count: number): string {
  const label = getEventLabel(eventType);
  return count > 1 ? `${label} (x${count})` : label;
}

export function getInsightTone(insight: Insight): InsightTone {
  const addsRisk = insight.maxDelta > 0;
  const buildsTrust = insight.minDelta < 0;
  if (addsRisk && buildsTrust) return 'mixed';
  if (addsRisk) return 'bad';
  if (buildsTrust) return 'good';
  return 'mixed';
}

export function getInsightTooltip(insight: Insight): string {
  const meta = metaFor(insight.eventType);
  if (getInsightTone(insight) === 'mixed' && meta?.mixedTooltip) return meta.mixedTooltip;
  if (meta?.tooltip) return meta.tooltip;
  return `User has ${insight.count} event${insight.count === 1 ? '' : 's'} of this type`;
}
