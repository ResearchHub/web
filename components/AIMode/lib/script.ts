import { ACCEPTED_EXPERT_COUNT, INVITED_EXPERTS, PEER_REVIEWERS } from './experts';
import { GRANT } from './grantData';
import { ALL_PROPOSAL_POST_IDS, PROPOSALS, computeAllocations } from './proposals';
import type { AIModeTrack, GuardrailConfig, MessageBlock, QuickReply } from './types';

/**
 * Delegated by default. The funder in this run is being shown AI-managed
 * disbursement deliberately, so the guardrails step opens on it rather than
 * making the delegated path something he has to remember to click.
 */
export const DEFAULT_GUARDRAILS: GuardrailConfig = {
  mode: 'ai',
  minReviewScore: 3.5,
  maxPerProposalUsd: 300_000,
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

const COUNT_WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six'];
const countWord = (value: number) => COUNT_WORDS[value] ?? String(value);
const sentenceCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const lowerFirst = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

const text = (content: string): MessageBlock => ({ kind: 'text', content });

/** The claim nobody proposed against, and the reason budget is held back. */
const UNPROPOSED_CLAIM = 'VASO-C021';

export const TRACK_ENTRY_STAGE: Record<AIModeTrack, string> = {
  rfp: 'rfp:ask-vision',
  proposal: 'proposal:soon',
  updates: 'updates:experts',
};

/**
 * Where a free-typed or pasted opening message lands, skipping the two framing
 * turns: if the funder has already said what he wants funded, asking him again
 * is a question he just answered.
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
    // Two ways in, one requirement. Both pills need the same thing next — the
    // source material — so they land on the same turn rather than forking into
    // a branch the demo would then have to carry twice.
    id: 'rfp:ask-vision',
    title: 'New RFP',
    subtitle: 'Choosing a starting point',
    thinkingLabel: 'Thinking',
    thinkingMs: 700,
    build: () => [
      text(
        [
          'I can help you put money behind a question. Two ways to start, depending on how settled you are.',
          "If you already know what you want to fund, I'll go straight to drafting the RFP. If you don't, we can work backwards from what you've been reading until there's something worth funding in it.",
        ].join('\n\n')
      ),
    ],
    quickReplies: [
      { id: 'brainstorm', label: "I'd like to brainstorm some ideas" },
      { id: 'draft', label: "I'm ready to draft an RFP" },
    ],
    next: 'rfp:ask-material',
  },
  {
    id: 'rfp:ask-material',
    subtitle: 'Waiting on source material',
    thinkingLabel: 'Thinking',
    thinkingMs: 800,
    build: () => [
      text(
        [
          'Either way I need the same thing first: the material.',
          "Tell me what you want to fund, or just point me at the source — a case file, a paper, a preprint, a thread. I'd rather read the thing itself than a summary of it, because the parts that matter for an RFP are usually the parts a summary drops.",
        ].join('\n\n')
      ),
    ],
    next: 'rfp:ingest',
  },
  {
    // The turn that has to earn the rest of the demo. It reports the case file's
    // own structure back — including that its weakest rung is the cheapest to
    // fix — and asks for the one input that determines everything downstream.
    id: 'rfp:ingest',
    title: 'Muscle Knots as Vascular States RFP',
    subtitle: 'Reading the case file',
    thinkingLabel: 'Reading the case file, its claim ladder and its evidence ledger',
    thinkingMs: 3200,
    build: () => [
      text(
        [
          `Read it end to end, including the ledger and the change history. This is ${GRANT.caseId}, and it is unusually well set up for funding — correct me where I get it wrong.`,
          'The question is whether muscle knots are **maintained vascular states** — smooth muscle held in the latch-bridge state, throttling local flow — rather than damaged tissue. And, further up, whether vascular tension works as a memory element that participates in mental life.',
          'What makes it fundable is that your own assessment marks it **unresolved rather than promising**, and locates the weakness precisely. The case has an inverted ladder: the mechanism rung is textbook physiology, but the observation rung underneath it is proponent testimony, and the grade-D audit confirms nobody has ever imaged a single release event. Fourteen claims, and only four of them are unresolved. Those four are the only places where money changes anything.',
          "The part I'd underline: the cheapest study in your agenda is the one that decides the most. Elastography and Doppler over a palpated knot during breath-assisted release — existing clinical instruments, one lab, one year. Everything above the bottom rung is waiting on it.",
          'What is your budget?',
        ].join('\n\n')
      ),
    ],
    next: 'rfp:plan',
  },
  {
    // Judgment rather than generation. He already published seven study designs,
    // so the value here is deciding what is still live, not restating them.
    id: 'rfp:plan',
    subtitle: 'Structuring the program',
    thinkingLabel: 'Reconciling your research agenda against the evidence ledger',
    thinkingMs: 2400,
    build: () => [
      text(
        [
          `${formatUsd(GRANT.amountUsd)} covers your published agenda rather than a single study, so I'd write this as a program and organize it around the **four unresolved claims** — not around disciplines. A proposal that would strengthen an already well-supported rung shouldn't be eligible.`,
          '- **VASO-C004**, seconds-scale release. The keystone, and the observation rung the rest of the ladder stands on. Three of your designs sit here.\n- **VASO-C020**, knots as latched vascular states. One design, and it needs the paired-caliber version.\n- **VASO-C021**, vascular tension as a memory element. One design, the animal experiment.\n- **VASO-C022**, the contemplative maps. One design, desk cost.',
          'Two amendments before I draft, both from your own change history rather than my judgment. **VASO-R007 comes out** — you executed it as study VASO-S001 last week, and soliciting proposals for finished work is the exact error your editorial audit corrected on R004. And **R004 goes in as amended**: paired-caliber, pressurized, with the stimulus-withdrawal phase, because the audit found latch behaviour present in a parent artery and absent one branch order downstream.',
          'That leaves six fundable designs across four claims. Want me to draft it?',
        ].join('\n\n')
      ),
    ],
    quickReplies: [
      { id: 'draft-it', label: 'Yes, draft it' },
      { id: 'right-spine', label: "That's the right spine — go" },
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
          'Title and context are in. The context section leads with the inverted ladder rather than with the hypothesis, because a reviewer needs to know what is weak before they can judge whether a proposal fixes it. I also kept your circularity point — that there is little evidence partly because nobody has been paid to look — since that is the argument for this RFP existing at all.',
        ].join('\n\n')
      ),
    ],
    next: 'rfp:draft-claims',
    autoAdvanceMs: 700,
  },
  {
    id: 'rfp:draft-claims',
    subtitle: 'Drafting the RFP',
    thinkingLabel: 'Writing the claims section',
    thinkingMs: 1900,
    revealSections: ['claims', 'objective'],
    build: () => [
      text(
        [
          'The claims section is the spine of the document. Each of the four is quoted verbatim with its current status, what is in scope for it, and — for C020 — the specific reason the mechanism is strained, so nobody proposes a study that walks into the arteriole problem unaware.',
          'A proposal must name **exactly one** claim and state in advance what result would count against it. That single requirement does most of the filtering work, and it does it before review rather than during.',
          'The objective section makes null results an expected output and says the award is not contingent on the direction of the finding. Proposals designed only to confirm will read as weaker against that language.',
        ].join('\n\n')
      ),
    ],
    next: 'rfp:draft-gaps',
    autoAdvanceMs: 700,
  },
  {
    // The document is deliberately, visibly incomplete here: three sections are
    // still spinners. Rather than interrogate him for three fields, the
    // assistant proposes all three with reasoning and asks to be corrected.
    id: 'rfp:draft-gaps',
    subtitle: 'Needs issuer, budget and eligibility',
    thinkingLabel: 'Checking what I still need',
    thinkingMs: 1300,
    build: () => [
      text(
        [
          "Four sections down. Three left, and I can't write any of them without you — they're the ones that commit you to something. Rather than ask you three questions, here's what I'd put, so you only have to correct me.",
          `- **Issuer.** Aletheia, with the RFP citing ${GRANT.caseId} as the source. Your name is already on the case file, so an anonymous RFP would be the odd choice.\n- **Budget.** ${formatUsd(GRANT.amountUsd)}, awarded against each applicant's stated budget rather than a flat figure, with indicative ranges by study type. Your keystone experiment should not receive a quarter of a million dollars because the cap allowed it.\n- **Eligibility.** Open to faculty, postdocs, PhD students and independent researchers with instrument access — with one hard condition, which is that the application *is* a preregistration on ResearchHub.`,
          "That last one is the only place I'd push back if you wanted it looser. On a question where examiner reliability is itself disputed, criteria frozen at submission are what stop the next decade being another unresolvable argument. It is also the thing your own change history does — freezing the design before the data exists — so applicants would be held to the standard you already hold yourself to.",
          'Correct anything, or tell me to write it.',
        ].join('\n\n')
      ),
    ],
    quickReplies: [
      { id: 'use-those', label: 'Use those' },
      { id: 'prereg-yes', label: 'Keep the preregistration condition' },
    ],
    next: 'rfp:details',
  },
  {
    id: 'rfp:details',
    subtitle: 'RFP drafted, awaiting funding',
    thinkingLabel: 'Writing the back half',
    thinkingMs: 1700,
    revealSections: ['eligibility', 'budget', 'evaluation'],
    build: () => [
      text(
        [
          "That's the complete RFP. Three things worth knowing about how I wrote the back half:",
          `- **Eligibility** makes the application a preregistration, so you read the protocol before the work happens rather than after.\n- **Budget** commits ${formatUsd(GRANT.amountUsd)} and states explicitly that budget is held in reserve for claims that haven't attracted a credible proposal yet.\n- **Evaluation** sets a peer-review bar of 3.5 out of 5, *holds* anything below it rather than declining it, and commits to reporting reviewer disagreement rather than averaging it away.`,
          'The last clause matters more than it looks. If two reviewers split hard on the same proposal, publishing both and naming the split is the only version of this that survives contact with a contested question.',
          'Ready to fund it?',
        ].join('\n\n')
      ),
    ],
    quickReplies: [
      { id: 'fund', label: 'Fund it' },
      { id: 'keep-editing', label: 'Keep editing', goTo: 'rfp:draft-gaps' },
    ],
    next: 'rfp:fund',
  },
  {
    id: 'rfp:fund',
    subtitle: 'Funding the RFP',
    thinkingLabel: 'Preparing the payment',
    thinkingMs: 900,
    build: () => [
      text(`${formatUsd(GRANT.amountUsd)} for the program. Pick how you want it to move.`),
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
          `Payment confirmed. ${formatUsd(GRANT.amountUsd)} is committed to this program.`,
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
                `I'll fund up to **${formatUsd(guardrails.maxPerProposalUsd)} per proposal** — at what the applicant actually asked for, not the cap — for anything averaging **${guardrails.minReviewScore.toFixed(1)} or above** across its peer reviews, out of ${formatUsd(guardrails.totalBudgetUsd)}. Anything below that bar I hold for your review rather than declining it.${
                  guardrails.notifyBeforeDisbursing
                    ? " I'll notify you before each disbursement."
                    : " I won't interrupt you for each disbursement — you'll see them in the summary."
                }`,
                "One thing I'll do that isn't in the policy: I won't spend the budget down just because it's there. If a claim draws no credible proposal, I'd rather hold the money against it and tell you.",
                "Nothing else needed from you. I'll publish the RFP and start recruiting reviewers.",
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
                  : `Payment confirmed. ${formatUsd(GRANT.amountUsd)} is committed, and you keep the trigger on every dollar of it.`,
                `I'll review incoming proposals against a **${guardrails.minReviewScore.toFixed(1)}** bar and bring you a recommendation for each, but nothing moves until you release it. The ${formatUsd(guardrails.totalBudgetUsd)} stays where it is until you say so.`,
                "I'll publish the RFP and start recruiting reviewers.",
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
      { kind: 'rfp_live', title: GRANT.title },
      text(
        "Your case file has been circulating, and the keystone experiment is cheap enough that a lab with an elastography rig can say yes to it quickly. I'd expect proposals within days. I'll have them peer reviewed before I bring them to you."
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
    title: 'Muscle Knots as Vascular States RFP',
    subtitle: 'Reviewers recruited',
    thinkingLabel: 'Checking the RFP',
    thinkingMs: 1600,
    build: () => [
      text(
        [
          `Your RFP is live, and rather than wait for it to be found I went looking. I invited **${countWord(INVITED_EXPERTS.length)} experts to submit a proposal**, one cluster per claim, and **${countWord(ACCEPTED_EXPERT_COUNT)} have accepted**.`,
          'I selected on instrument access rather than on prestige. For the keystone claim that means labs that already have an ultrafast elastography rig and a Doppler probe on the same machine, because the study is only cheap for someone who does not have to buy anything. For the contemplative claim it means someone who reads classical Tibetan, which is a much smaller list than it sounds.',
        ].join('\n\n')
      ),
      { kind: 'experts', heading: 'Experts invited' },
      text(
        `One gap worth flagging: Ramanathan-Boaz, the person I wanted for ${UNPROPOSED_CLAIM} — the memory claim — has not accepted. That is the hardest seat to fill in the whole program, because the people equipped to run it work in neurovascular coupling and have no reason to care about muscle knots. I'll keep working on it.`
      ),
    ],
    quickReplies: [{ id: 'proposals', label: 'Any proposals yet?' }],
    next: 'updates:proposals',
  },
  {
    id: 'updates:proposals',
    subtitle: 'Four proposals in peer review',
    thinkingLabel: 'Checking for new submissions',
    thinkingMs: 1700,
    build: () => {
      const byClaim = new Map<string, number>();
      PROPOSALS.forEach((proposal) => {
        byClaim.set(proposal.claimId, (byClaim.get(proposal.claimId) ?? 0) + 1);
      });

      return [
        text(
          [
            `All ${countWord(ACCEPTED_EXPERT_COUNT)} experts who accepted have submitted, every proposal a preregistration, and between them they cover three of the four claims.`,
            `- **VASO-C004** drew two: the keystone imaging study and the census.\n- **VASO-C020** drew one: the paired-caliber latch test, and it took the amendment.\n- **VASO-C022** drew one: the contemplative coding study, at desk cost.\n- **${UNPROPOSED_CLAIM}** drew nothing.`,
            "That last line is the useful one. The memory claim is the most speculative thing in your case file and the hardest experiment to design, so it attracting nothing in the first round is information rather than a disappointment. I'm not going to reallocate its share to make the round look fully deployed.",
            "All four are now with reviewers — a separate group from the people I invited to write them, since nobody should be scoring a claim they're competing for. Nothing has been disbursed. Under your policy I hold until a proposal has enough review signal to judge, and both AI and human reviews count toward that.",
          ].join('\n\n')
        ),
        { kind: 'proposals', postIds: ALL_PROPOSAL_POST_IDS, heading: 'Submitted proposals' },
        text("I'll come back to you once the reviews land."),
      ];
    },
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
          `Peer review closed. ${sentenceCase(countWord(PEER_REVIEWERS.length))} reviewers, plus AI review on three of the four, and every proposal came back with a written assessment scoped to the claim it targets. Here they are in full, strongest first.`
        ),
        { kind: 'peer_reviews', postIds: ALL_PROPOSAL_POST_IDS, heading: 'Peer reviews' },
        text(
          [
            "Before the numbers: the census has a **real split** on it, and your RFP commits me to showing you rather than averaging it. The AI review scored it 5. Kirchmayr scored it 3, and her objection is not about quality — it's that a burden-versus-age atlas built on blinded palpation may be measuring examiner expectations rather than tissue, because inter-examiner reliability for tender points has never been established.",
            "I think she's right, and I think the fix she names is cheap: gate the main cohort behind a reliability substudy with a prespecified threshold below which the study reports a null on reliability and stops. That amendment makes the census informative either way, which it currently isn't.",
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
            ? "Done. Here's every dollar, the claim it was spent against, and the reason it moved."
            : "Here's what I'd do. Nothing has moved, since you kept the trigger."
        ),
        { kind: 'allocations' },
      ];

      const closing: string[] = [];

      if (heldOnScore) {
        const { lastName, holdNote } = heldOnScore.proposal;
        closing.push(
          `${lastName}'s is held rather than declined. ${holdNote ?? ''} His reviewer's objection — that pooling the three corpora could let the ashi points, which are *defined* by tenderness, manufacture the convergence for the tantric maps — is a design note, not a verdict. I've asked for a revision that codes them separately.`.trim()
        );
      }

      if (outcome.unallocatedUsd > 0) {
        closing.push(
          `And the ${formatUsd(outcome.unallocatedUsd)} I have not spent. Most of it is reserved against **${UNPROPOSED_CLAIM}**, which drew nothing this round and needs the animal experiment that separates vascular modulation from vascular memory. That study is the one that would either establish a genuinely new biological memory mechanism or collapse the strong version of your thesis into ordinary neurovascular physiology. I'd rather hold the money until someone credible wants to run it than spread it across the studies that happened to arrive first.`
        );
      }

      if (closing.length > 0) {
        blocks.push(text(closing.join('\n\n')));
      }

      return blocks;
    },
    quickReplies: [
      { id: 'hold', label: 'Hold the reserve' },
      { id: 'commission', label: 'Go find someone for C021' },
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
            `Noted. I'll approach labs with optical-access preparations directly rather than waiting for ${UNPROPOSED_CLAIM} to attract a proposal on its own, and bring you anyone credible before committing anything.`,
            `For the record: ${formatUsd(guardrails.totalBudgetUsd)} committed, ${formatUsd(outcome.totalAllocatedUsd)} allocated across ${countWord(outcome.funded.length)} ${outcome.funded.length === 1 ? 'proposal' : 'proposals'}, ${countWord(outcome.held.length)} held, ${formatUsd(outcome.unallocatedUsd)} reserved, all against the ${guardrails.minReviewScore.toFixed(1)} bar you set.`,
            'Every dollar traces back to a peer-review score you can read yourself, against a named claim in your own case file. If C004 comes back negative, you will have spent the cheapest money in the program to retire the hypothesis — which is the outcome your ledger is set up to record.',
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
