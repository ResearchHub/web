/**
 * Types for the AI Mode demo surface. Everything here is client-only and
 * serializable: conversations round-trip through localStorage so the demo
 * survives a reload mid-run.
 */

export type AIModeTrack = 'rfp' | 'proposal' | 'updates';

/**
 * Blocks are the unit an assistant turn is built from. Keeping them typed (and
 * free of React nodes) is what lets rich interactive UI live inline in the
 * transcript while still persisting as plain JSON.
 */
export type MessageBlock =
  | { kind: 'text'; content: string }
  | { kind: 'proposals'; postIds: number[]; heading?: string }
  | { kind: 'experts'; heading?: string }
  | { kind: 'peer_reviews'; postIds: number[]; heading?: string }
  | { kind: 'payment'; amountUsd: number }
  | { kind: 'guardrails' }
  | { kind: 'allocations' }
  | { kind: 'rfp_live'; href: string; title: string };

export type MessageBlockKind = MessageBlock['kind'];

export interface QuickReply {
  id: string;
  label: string;
  /** Jumps to a specific stage instead of the current stage's default next. */
  goTo?: string;
}

/**
 * `revealedBlocks` drives the streaming simulation: blocks below the index are
 * mounted, the block at the index is currently animating in. -1 means the turn
 * is still on its "thinking" beat.
 */
export type MessageStatus = 'thinking' | 'streaming' | 'complete';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  blocks: MessageBlock[];
  quickReplies: QuickReply[];
  status: MessageStatus;
  thinkingLabel?: string;
  revealedBlocks: number;
  createdAt: number;
}

export type GuardrailMode = 'ai' | 'self';

export interface GuardrailConfig {
  mode: GuardrailMode;
  /** Proposals must average at least this peer-review score to be funded. */
  minReviewScore: number;
  maxPerProposalUsd: number;
  totalBudgetUsd: number;
  notifyBeforeDisbursing: boolean;
}

export interface AIConversation {
  id: string;
  title: string;
  /** One-line description of where the conversation left off. */
  subtitle: string;
  track: AIModeTrack | null;
  /** Current node in the script machine; `null` before a track is chosen. */
  stageId: string | null;
  messages: ChatMessage[];
  documentOpen: boolean;
  /** Ids of RFP sections that have been drafted so far, in order. */
  revealedSections: string[];
  guardrails: GuardrailConfig;
  guardrailsConfirmed: boolean;
  fundedAmountUsd: number | null;
  updatedAt: number;
}

export interface RfpSection {
  id: string;
  heading: string;
  /** Markdown body. */
  body: string;
}

/** A reviewer the assistant recruited, shown before any proposals arrive. */
export interface InvitedExpert {
  name: string;
  affiliation: string;
  /** Which of the RFP's three axes this reviewer was brought in to cover. */
  axis: string;
  /** Local asset path, so the roster never waits on a third-party image. */
  avatarUrl: string;
  accepted: boolean;
}

/**
 * One written review against a proposal, in the shape the feed renders them.
 * The reviewer's face and affiliation are resolved from the invited roster, so
 * the people who accepted in checkpoint one are the people who show up here.
 */
export interface PeerReview {
  /** Must match a name in `INVITED_EXPERTS`. */
  reviewerName: string;
  /** The score this reviewer filed, which is not the proposal's average. */
  score: number;
  /** Section heading the reviewer wrote under, as on the real review form. */
  heading: string;
  body: string;
}

export interface ProposalRecord {
  postId: number;
  /** Short title for use in prose, where the real one is far too long. */
  shortTitle: string;
  principalInvestigator: string;
  /** Used when the assistant refers to the PI mid-sentence. */
  lastName: string;
  /** Average peer-review score as displayed on the proposal card. */
  reviewScore: number;
  reviewCount: number;
  /**
   * Assistant's one-sentence, proposal-specific justification. Always present:
   * any proposal can end up funded once the review bar moves.
   */
  rationale: string;
  /** Extra detail worth surfacing when this proposal is the one being held. */
  holdNote?: string;
  /** The review the funder reads at the peer-review checkpoint. */
  peerReview: PeerReview;
}

export interface ProposalReviewer {
  name: string;
  avatarUrl: string | null;
}

/**
 * Artwork and faces lifted off the captured feed entry, so blocks that summarise
 * a proposal in one row can still show the same image and people as its card.
 */
export interface ProposalMedia {
  imageUrl: string | null;
  piAvatarUrl: string | null;
  reviewers: ProposalReviewer[];
}

/**
 * A proposal can miss out for two different reasons, and conflating them
 * produces copy that contradicts the policy the funder just set.
 */
export type HoldReason = 'score' | 'budget';

export interface Allocation {
  proposal: ProposalRecord;
  amountUsd: number;
  funded: boolean;
  heldReason: HoldReason | null;
}

export interface AllocationOutcome {
  allocations: Allocation[];
  funded: Allocation[];
  held: Allocation[];
  totalAllocatedUsd: number;
  unallocatedUsd: number;
}
