import { ACCEPTED_EXPERT_COUNT, INVITED_EXPERTS } from './experts';
import { GRANT } from './grantData';
import { ALL_PROPOSAL_POST_IDS, computeAllocations } from './proposals';
import type { AIModeTrack, GuardrailConfig, MessageBlock, QuickReply } from './types';

/**
 * Supervised by default. The funder only ends up delegating if he actively picks
 * AI-managed in the guardrails step, and that step is hidden unless the demo
 * controls turn it on — so with it hidden, every dollar stays under his trigger.
 */
export const DEFAULT_GUARDRAILS: GuardrailConfig = {
  mode: 'self',
  minReviewScore: 3.5,
  maxPerProposalUsd: 75_000,
  totalBudgetUsd: GRANT.amountUsd,
  notifyBeforeDisbursing: true,
};

export interface ScriptContext {
  guardrails: GuardrailConfig;
  /** Demo control: when false, the delegation step is skipped entirely. */
  aiDelegationEnabled: boolean;
}

export interface ScriptStage {
  id: string;
  /** Copy shown during the indeterminate beat before text starts revealing. */
  thinkingLabel: string;
  thinkingMs: number;
  build: (context: ScriptContext) => MessageBlock[];
  quickReplies?: QuickReply[];
  /** Stage entered on the next user input. `null` ends the branch. */
  next: string | null;
  /**
   * Set to run `next` on a timer once this turn finishes, with no user input.
   * Multi-step work the funder already approved — drafting the RFP — should not
   * ask permission to continue between every section.
   */
  autoAdvanceMs?: number;
  /** Set when this turn should open the document panel. */
  openDocument?: boolean;
  /** RFP sections drafted by this turn. */
  revealSections?: string[];
  /** Conversation title applied on entering the stage. */
  title?: string;
  /** Sidebar subtitle describing where the conversation now sits. */
  subtitle: string;
  /**
   * Drops this stage out of the chain, handing its `next` on in its place. Lets
   * a beat be pulled from the demo without rewiring the stages around it.
   */
  skipWhen?: (context: ScriptContext) => boolean;
}

const formatUsd = (amount: number) => `$${amount.toLocaleString('en-US')}`;

const COUNT_WORDS = ['none', 'one', 'two', 'three', 'four'];
const countWord = (value: number) => COUNT_WORDS[value] ?? String(value);
const sentenceCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const lowerFirst = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

const text = (content: string): MessageBlock => ({ kind: 'text', content });

export const TRACK_ENTRY_STAGE: Record<AIModeTrack, string> = {
  rfp: 'rfp:ask-vision',
  proposal: 'proposal:soon',
  updates: 'updates:experts',
};

/**
 * Where a free-typed or pasted opening message lands. The funder has already
 * said what he wants funded, so the assistant reads the material instead of
 * asking a question he just answered.
 */
export const FREE_INPUT_ENTRY_STAGE = 'rfp:ingest';

export const TRACK_PROMPTS: Record<AIModeTrack, string> = {
  rfp: 'Open an RFP',
  proposal: 'Draft a new proposal',
  updates: 'Get updates',
};

const STAGES: ScriptStage[] = [
  // ---------------------------------------------------------------- Track A
  {
    // Deliberately assumes nothing. The funder may have opened AI Mode for the
    // first time, so the assistant asks what he wants funded rather than
    // pretending to remember a conversation that never happened.
    id: 'rfp:ask-vision',
    title: 'New RFP',
    subtitle: 'Capturing the vision',
    thinkingLabel: 'Thinking',
    thinkingMs: 800,
    build: () => [
      text(
        [
          "Let's start with the outcome rather than the document. What do you want to be true a year from now that isn't true today?",
          "If there's something you've been reading or watching that started this, paste it — a paper, a video, a thread. I'd rather work from the source than from a summary of it.",
        ].join('\n\n')
      ),
    ],
    next: 'rfp:ingest',
  },
  {
    id: 'rfp:ingest',
    title: 'Megalithic Geopolymer Studies RFP',
    subtitle: 'Reviewing your material',
    thinkingLabel: 'Watching the video and reading your notes',
    thinkingMs: 2800,
    build: () => [
      text(
        [
          "Watched it end to end. Here's what I take the claim to be — correct me where I'm wrong.",
          'From the 1980s, Joseph Davidovits argued that certain ancient megaliths were **cast from geopolymer concrete** rather than quarried and carved. He found geopolymeric signatures in the stone, but never produced a route a pre-industrial builder could actually have followed to make water glass, the alkali-silicate binder the whole idea depends on.',
          "Fóti's protocol, the method demonstrated in the video, is an answer to exactly that gap: a sodium–potassium hydroxide eutectic melting near **168 °C**, reacted with quartz sand or crushed granite across days of open-atmosphere boiling and re-dissolution, then cast with aggregate and cured into hardened stone.",
          'It has been demonstrated publicly, at length, and in full. It has **never been independently replicated** under controlled laboratory conditions. That last sentence is the entire opportunity, and it makes this a replication question rather than a discovery question — which changes what we should ask for.',
          'What is your budget?',
        ].join('\n\n')
      ),
    ],
    next: 'rfp:brainstorm',
  },
  {
    id: 'rfp:brainstorm',
    subtitle: 'Brainstorming research axes',
    thinkingLabel: 'Reviewing the geopolymer literature',
    thinkingMs: 1800,
    build: () => [
      text(
        [
          `${formatUsd(GRANT.amountUsd)} is enough to run this as three independently fundable axes rather than one question. Together they cover the ways this could fail.`,
          '**Replication.** Can the published protocol be followed under controlled conditions to consistently produce hardened stone? Varying input rock, batch size and ambient conditions.',
          '**Materials analysis.** What actually forms at each stage — binder, intermediates, cured product? Blinded comparison against reliably sourced Andean megalith and quarry samples.',
          '**Historical feasibility.** Can every input be substituted with materials available in the pre-colonial Andean highlands, at archaeologically relevant scale?',
          "The third axis carries as much weight as the first. A protocol that works in a modern lab but can't be sourced with pre-colonial Andean materials answers a different question than the one you're asking.",
          'Want me to draft the RFP on those three axes?',
        ].join('\n\n')
      ),
    ],
    quickReplies: [
      { id: 'draft', label: 'Yes, draft it' },
      { id: 'right-three', label: 'Those are the right three — go' },
    ],
    next: 'rfp:draft-open',
  },
  {
    id: 'rfp:draft-open',
    subtitle: 'Drafting the RFP',
    thinkingLabel: 'Drafting the RFP',
    thinkingMs: 1500,
    openDocument: true,
    revealSections: ['title', 'context'],
    build: () => [
      text(
        [
          "Drafting now — it's building on the right. I'll narrate as I go.",
          "Title and context are in. I kept the context to the two things a reviewer actually needs: what Davidovits proposed, and precisely what Fóti's protocol adds on top of it. The 168 °C eutectic detail stays, because that is the part that makes the claim testable.",
        ].join('\n\n')
      ),
    ],
    next: 'rfp:draft-questions',
    autoAdvanceMs: 700,
  },
  {
    id: 'rfp:draft-questions',
    subtitle: 'Drafting the RFP',
    thinkingLabel: 'Writing the key questions',
    thinkingMs: 1400,
    revealSections: ['questions', 'objective'],
    build: () => [
      text(
        [
          'Key questions and objective added, one question per axis.',
          'I wrote the objective to accept a null result explicitly — *either supporting or refuting the claims above*. Proposals designed only to confirm the hypothesis will read as weaker against that language, which is what you want.',
        ].join('\n\n')
      ),
    ],
    next: 'rfp:draft-finish',
    autoAdvanceMs: 700,
  },
  {
    id: 'rfp:draft-finish',
    subtitle: 'RFP drafted, awaiting funding',
    thinkingLabel: 'Finishing the draft',
    thinkingMs: 1600,
    revealSections: ['eligibility', 'budget', 'evaluation'],
    build: () => [
      text(
        [
          "That's the complete RFP. Three things worth knowing about how I wrote the back half:",
          '- **Eligibility** requires the application to be a preregistration on ResearchHub, so you read the protocol before the work happens rather than after.\n- **Budget** commits your $200,000 and leaves proposals open to community crowdfunding on top of it.\n- **Evaluation** sets an explicit peer-review bar of 3.5 out of 5, and *holds* anything below it rather than declining it.',
          'Ready to fund it?',
        ].join('\n\n')
      ),
    ],
    quickReplies: [{ id: 'fund', label: 'Fund it' }],
    next: 'rfp:fund',
  },
  {
    id: 'rfp:fund',
    subtitle: 'Funding the RFP',
    thinkingLabel: 'Preparing the payment',
    thinkingMs: 900,
    build: () => [
      text(
        `${formatUsd(GRANT.amountUsd)}, matching what you've already committed to this grant. Pick how you want it to move.`
      ),
      { kind: 'payment', amountUsd: GRANT.amountUsd },
    ],
    next: 'rfp:guardrails',
  },
  {
    id: 'rfp:guardrails',
    subtitle: 'Setting spending guardrails',
    thinkingLabel: 'Confirming the payment',
    thinkingMs: 1200,
    skipWhen: ({ aiDelegationEnabled }) => !aiDelegationEnabled,
    build: () => [
      text(
        [
          `Payment confirmed. ${formatUsd(GRANT.amountUsd)} is committed to this RFP.`,
          'Now the part that actually saves you time: how do you want it spent?',
          'I can disburse on your behalf to proposals that clear a peer-review bar you set, or I can surface reviewed proposals with a recommendation and let you release every dollar yourself.',
        ].join('\n\n')
      ),
      { kind: 'guardrails' },
    ],
    next: 'rfp:policy',
  },
  {
    id: 'rfp:policy',
    subtitle: 'Policy set, ready to publish',
    thinkingLabel: 'Writing the policy back',
    thinkingMs: 1100,
    build: ({ guardrails, aiDelegationEnabled }) =>
      guardrails.mode === 'ai'
        ? [
            text(
              [
                'Locked in. To say it back plainly:',
                `I'll fund up to **${formatUsd(guardrails.maxPerProposalUsd)} per proposal** for anything averaging **${guardrails.minReviewScore.toFixed(1)} or above** across its peer reviews, out of a ${formatUsd(guardrails.totalBudgetUsd)} budget. Anything below that bar I hold for your review rather than declining it.${
                  guardrails.notifyBeforeDisbursing
                    ? " I'll notify you before each disbursement."
                    : " I won't interrupt you for each disbursement — you'll see them in the summary."
                }`,
                "You don't need to do anything else. I'll publish the RFP and start watching for proposals.",
              ].join('\n\n')
            ),
          ]
        : [
            text(
              [
                // With delegation hidden this is the turn straight after
                // payment, so it has to acknowledge the money itself.
                aiDelegationEnabled
                  ? 'Understood — you keep the trigger.'
                  : `Payment confirmed. ${formatUsd(GRANT.amountUsd)} is committed to this RFP, and you keep the trigger on every dollar of it.`,
                `I'll review incoming proposals against a **${guardrails.minReviewScore.toFixed(1)}** bar and bring you a recommendation for each, but nothing moves until you release it. The ${formatUsd(guardrails.totalBudgetUsd)} stays where it is until you say so.`,
                "I'll publish the RFP and start watching for proposals.",
              ].join('\n\n')
            ),
          ],
    quickReplies: [{ id: 'publish', label: 'Publish it' }],
    next: 'rfp:live',
  },
  {
    id: 'rfp:live',
    subtitle: 'RFP is live',
    thinkingLabel: 'Publishing the RFP',
    thinkingMs: 1400,
    build: () => [
      text('The RFP is live and accepting proposals.'),
      { kind: 'rfp_live', href: GRANT.href, title: GRANT.title },
      text(
        "Several researchers have been circling this problem publicly, so I'd expect proposals within days. I'll have them peer reviewed before I bring them to you."
      ),
    ],
    quickReplies: [{ id: 'any-proposals', label: 'Any proposals yet?' }],
    next: 'updates:experts',
  },

  // ---------------------------------------------------------------- Track B
  {
    id: 'proposal:soon',
    title: 'Draft a new proposal',
    subtitle: 'Not available yet',
    thinkingLabel: 'Checking what I can do',
    thinkingMs: 800,
    build: () => [
      text(
        [
          "I can't draft proposals yet — that track is the next thing I'm learning.",
          "If you're funding rather than applying, opening an RFP is the useful thing I can do today.",
        ].join('\n\n')
      ),
    ],
    quickReplies: [{ id: 'rfp-instead', label: 'Open an RFP instead', goTo: 'rfp:ask-vision' }],
    next: null,
  },

  // ------------------------------------------------------- Track C, in four
  // checkpoints: reviewers recruited, proposals in, reviews written, money
  // moved. Each one is work the funder did not have to do, and collapsing them
  // would hand him a finished allocation with no visible provenance.
  {
    id: 'updates:experts',
    title: 'Megalithic Geopolymer Studies RFP',
    subtitle: 'Reviewers recruited',
    thinkingLabel: 'Checking the RFP',
    thinkingMs: 1600,
    build: () => [
      text(
        [
          `Your RFP is live and no proposals have landed yet, so I spent the time recruiting the people who will judge them. I invited **${INVITED_EXPERTS.length} reviewers** across your three axes — replication, materials analysis and historical feasibility — and **${countWord(ACCEPTED_EXPERT_COUNT)} have accepted** so far.`,
          'I went for coverage rather than prestige. A reviewer working on historical feasibility will catch a sourcing problem that a materials chemist would sign off on, and the reverse is also true.',
        ].join('\n\n')
      ),
      { kind: 'experts', heading: 'Reviewers invited' },
      text("Nothing for you to do here. I'll come back when proposals start arriving."),
    ],
    quickReplies: [{ id: 'proposals', label: 'Any proposals yet?' }],
    next: 'updates:proposals',
  },
  {
    id: 'updates:proposals',
    subtitle: 'Four proposals in peer review',
    thinkingLabel: 'Checking for new submissions',
    thinkingMs: 1700,
    build: () => [
      text(
        [
          'Your RFP attracted **four proposals**, and between them they cover all three axes. Every one has gone out to the reviewers who accepted.',
          'Nothing has been disbursed. Under your policy I hold until a proposal has enough review signal to judge, and both AI and human reviewers count toward that.',
        ].join('\n\n')
      ),
      { kind: 'proposals', postIds: ALL_PROPOSAL_POST_IDS, heading: 'Submitted proposals' },
      text("I'll come back to you once the reviews land."),
    ],
    quickReplies: [{ id: 'reviews', label: 'Any reviews yet?' }],
    next: 'updates:reviews',
  },
  {
    id: 'updates:reviews',
    subtitle: 'Peer review complete',
    thinkingLabel: 'Reading the peer reviews',
    thinkingMs: 1900,
    build: ({ guardrails }) => {
      const outcome = computeAllocations(guardrails);
      const bar = guardrails.minReviewScore.toFixed(1);
      const total = outcome.allocations.length;
      const shortOfBar = outcome.allocations.filter(
        (allocation) => allocation.heldReason === 'score'
      );
      const clearing = total - shortOfBar.length;

      const verdict =
        shortOfBar.length === 0
          ? `All ${countWord(total)} clear your ${bar} bar.`
          : `${sentenceCase(countWord(clearing))} of the ${countWord(total)} clear your ${bar} bar.`;

      const exception =
        shortOfBar.length === 1
          ? ` ${shortOfBar[0].proposal.lastName}'s is the exception at ${shortOfBar[0].proposal.reviewScore.toFixed(1)}${
              shortOfBar[0].proposal.holdNote
                ? ` — ${lowerFirst(shortOfBar[0].proposal.holdNote)}`
                : '.'
            }`
          : shortOfBar.length > 1
            ? ` ${shortOfBar.map((allocation) => `${allocation.proposal.lastName}'s`).join(' and ')} fall below it.`
            : '';

      return [
        text(
          'Peer review closed. Every proposal came back with a written review against it, one from each reviewer who accepted. Here they are in full, strongest proposal first.'
        ),
        { kind: 'peer_reviews', postIds: ALL_PROPOSAL_POST_IDS, heading: 'Peer reviews' },
        text(
          [
            `${verdict}${exception}`,
            guardrails.mode === 'ai'
              ? `Want me to put the ${formatUsd(guardrails.totalBudgetUsd)} to work under your policy?`
              : `Want to see what I'd do with the ${formatUsd(guardrails.totalBudgetUsd)}? Nothing moves until you release it.`,
          ].join('\n\n')
        ),
      ];
    },
    quickReplies: [{ id: 'allocate', label: 'Walk me through the allocation' }],
    next: 'updates:funding',
  },
  {
    id: 'updates:funding',
    subtitle: 'Funds allocated',
    thinkingLabel: 'Allocating against your policy',
    thinkingMs: 2000,
    build: ({ guardrails }) => {
      const outcome = computeAllocations(guardrails);
      const heldOnScore = outcome.held.find((allocation) => allocation.heldReason === 'score');

      const blocks: MessageBlock[] = [
        text(
          guardrails.mode === 'ai'
            ? "Done. Here's every dollar and the reason it moved."
            : "Here's what I'd do. Nothing has moved, since you kept the trigger."
        ),
        { kind: 'allocations' },
      ];

      // The closing beat has to reconcile with whatever the sliders produced:
      // a fully-committed budget can't absorb a proposal that later clears.
      if (heldOnScore) {
        const { lastName } = heldOnScore.proposal;
        blocks.push(
          text(
            outcome.unallocatedUsd > 0
              ? `${lastName}'s is the one I'd flag. A second reviewer would very likely clear your bar, and I'm still holding ${formatUsd(outcome.unallocatedUsd)} uncommitted — so I can fund it without touching the others.`
              : `${lastName}'s is the one I'd flag. A second reviewer would very likely clear your bar, but the ${formatUsd(guardrails.totalBudgetUsd)} is fully committed, so funding it would mean topping up rather than reshuffling.`
          )
        );
      }

      return blocks;
    },
    quickReplies: [
      { id: 'hold', label: 'Hold it and tell me' },
      { id: 'top-up', label: 'Top up if it clears' },
    ],
    next: 'updates:done',
  },
  {
    id: 'updates:done',
    subtitle: 'Allocation complete',
    thinkingLabel: 'Updating the policy',
    thinkingMs: 900,
    build: ({ guardrails }) => {
      const outcome = computeAllocations(guardrails);

      return [
        text(
          [
            "Noted — I'll watch for the second review and come back to you rather than acting on my own.",
            `For the record: ${formatUsd(guardrails.totalBudgetUsd)} committed, ${formatUsd(outcome.totalAllocatedUsd)} allocated across ${outcome.funded.length} ${outcome.funded.length === 1 ? 'proposal' : 'proposals'}, ${outcome.held.length} held, all against the ${guardrails.minReviewScore.toFixed(1)} review bar you set. Every dollar traces back to a peer-review score you can read yourself.`,
          ].join('\n\n')
        ),
      ];
    },
    quickReplies: [{ id: 'new-rfp', label: 'Open another RFP', goTo: 'rfp:ask-vision' }],
    next: null,
  },

  // Fallback for a finished branch: keeps typing into a completed thread from
  // going unanswered, and always offers a way back into the primary track.
  {
    id: 'generic:idle',
    subtitle: 'Nothing new',
    thinkingLabel: 'Checking',
    thinkingMs: 900,
    build: () => [
      text(
        "Nothing new on that thread since we last spoke. If you want to put money to work, opening an RFP is where I'm most useful."
      ),
    ],
    quickReplies: [{ id: 'open-rfp', label: 'Open an RFP', goTo: 'rfp:ask-vision' }],
    next: 'generic:idle',
  },
];

const STAGES_BY_ID = new Map(STAGES.map((stage) => [stage.id, stage]));

export const getStage = (stageId: string | null): ScriptStage | undefined =>
  stageId ? STAGES_BY_ID.get(stageId) : undefined;

/**
 * The stage to actually play, following `next` past anything the current demo
 * settings skip. Bounded so a chain that skips end to end can't spin.
 */
export const resolveStage = (
  stageId: string | null,
  context: ScriptContext
): ScriptStage | undefined => {
  let stage = getStage(stageId);

  for (let hops = 0; stage?.skipWhen?.(context) && hops < STAGES.length; hops += 1) {
    stage = getStage(stage.next);
  }

  return stage?.skipWhen?.(context) ? undefined : stage;
};
