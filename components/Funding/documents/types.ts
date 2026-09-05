/**
 * The three documents behind a funding program, in a form any surface can
 * render: the AI Mode side panel today, an org configuration page later. None
 * of these types reference AI Mode; the widgets that render them are pure.
 */

export type DocumentTab = 'rfp' | 'judgment' | 'org';

// ------------------------------------------------------------------- RFP

export interface RfpSection {
  id: string;
  heading: string;
  /** Markdown body, inline formatting and lists only. */
  body: string;
}

export type RfpStatus = 'drafting' | 'drafted' | 'published';

// -------------------------------------------------------------- Judgment

export type JudgmentMode = 'ai' | 'self';

/**
 * The rules the AI must follow to allocate funds. Numeric on purpose: every
 * clause of the generated policy prose traces back to one of these fields, so
 * the document and the controls can never disagree.
 */
export interface JudgmentPolicy {
  mode: JudgmentMode;
  /** Proposals must average at least this peer-review score to be funded. */
  minReviewScore: number;
  maxPerProposalUsd: number;
  totalBudgetUsd: number;
  notifyBeforeDisbursing: boolean;
}

/** Section ids a citation can point at inside the judgment document. */
export type JudgmentSectionId = 'policy' | 'mode' | 'limits' | 'notify';

// ----------------------------------------------------------- Org profile

export interface PastGrant {
  title: string;
  year: number;
  amountUsd: number;
  outcome: 'completed' | 'published' | 'in_progress';
  /** One line on what the money decided. */
  note: string;
  imageUrl?: string;
}

export interface OrgProfile {
  id: string;
  name: string;
  tagline: string;
  mission: string;
  website: string;
  focusAreas: string[];
  typicalGrantUsd: { min: number; max: number };
  grantsPerYear: number;
  totalDeployedUsd: number;
  /** How the org prefers to put money out, in its own words. */
  mechanisms: string[];
  /** Conditions the org attaches to every program. */
  reviewPreferences: string[];
  pastGrants: PastGrant[];
}

/** Section ids a citation can point at inside the org profile. */
export type OrgSectionId =
  | 'mission'
  | 'focus'
  | 'typicalGrant'
  | 'mechanisms'
  | 'review'
  | 'history';

// -------------------------------------------------------------- Timeline

export type TimelineStepId =
  | 'drafted'
  | 'published'
  | 'experts'
  | 'proposals'
  | 'review'
  | 'allocated';

export interface TimelineStep {
  id: TimelineStepId;
  label: string;
  /** What this step means once it is the current one. */
  description: string;
}

export const TIMELINE_STEPS: TimelineStep[] = [
  { id: 'drafted', label: 'Drafted', description: 'The RFP is written and funded.' },
  { id: 'published', label: 'Published', description: 'Live on ResearchHub, accepting proposals.' },
  { id: 'experts', label: 'Experts invited', description: 'Researchers approached to submit.' },
  {
    id: 'proposals',
    label: 'Proposals in',
    description: 'Preregistrations received and in review.',
  },
  { id: 'review', label: 'Peer review', description: 'Reviews filed against each claim.' },
  { id: 'allocated', label: 'Allocated', description: 'Funds moved under the judgment policy.' },
];

export const timelineStepIndex = (stepId: TimelineStepId) =>
  TIMELINE_STEPS.findIndex((step) => step.id === stepId);
