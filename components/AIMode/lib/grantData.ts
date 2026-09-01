import type { RfpSection } from './types';

/**
 * The RFP the assistant drafts in the demo, built from Aletheia's published case
 * file VASO-001 (`ejhong.github.io/aletheia/cases/vasocomputation/`).
 *
 * Representative rather than real: unlike the geopolymer run this replaced,
 * there is no live grant behind these identifiers, so nothing in the overlay
 * navigates. See `NonNavigating`.
 */
export const GRANT = {
  slug: 'muscle-knots-vascular-states',
  title: 'Muscle Knots as Vascular States: deciding four unresolved claims',
  amountUsd: 1_000_000,
  organization: 'Aletheia',
  /** The case file the assistant reads to draft all of this. */
  caseHref: 'https://ejhong.github.io/aletheia/cases/vasocomputation/',
  caseId: 'VASO-001',
} as const;

/**
 * The four claims the case file marks unresolved, in the order the RFP funds
 * them. This is the RFP's spine: every proposal names one, every peer review is
 * scoped to one, and the allocation is argued claim by claim rather than
 * proposal by proposal.
 *
 * `VASO-R007` is deliberately absent from the studies below. The case file
 * executed it as study VASO-S001 on 2026-09-01, and its own editorial audit
 * corrected VASO-R004 for still describing that audit as pending work.
 */
export const UNRESOLVED_CLAIMS = [
  {
    id: 'VASO-C004',
    rung: 'Observation',
    label: 'Seconds-scale release',
    studies: ['VASO-R001', 'VASO-R002', 'VASO-R003'],
  },
  {
    id: 'VASO-C020',
    rung: 'Attribution',
    label: 'Knots as latched vascular states',
    studies: ['VASO-R004'],
  },
  {
    id: 'VASO-C021',
    rung: 'Attribution',
    label: 'Vascular tension as a memory element',
    studies: ['VASO-R005'],
  },
  {
    id: 'VASO-C022',
    rung: 'Attribution',
    label: 'Contemplative maps as empirical documents',
    studies: ['VASO-R006'],
  },
] as const;

/**
 * The drafted RFP. Sections are revealed one at a time as the conversation
 * progresses, and `DocumentPanel` renders the bodies as markdown restricted to
 * inline formatting and lists — there are no headings available below a section
 * heading, so sub-structure is carried by bold lead-ins.
 */
export const RFP_SECTIONS: RfpSection[] = [
  {
    id: 'title',
    heading: 'Title',
    body: 'Muscle Knots as Vascular States: a research program to decide four unresolved claims about tender points, vascular tension, and held bodily state.',
  },
  {
    id: 'context',
    heading: 'Context',
    body: [
      'Anyone with a foam roller can locate dozens of discrete, exquisitely tender points in their own body. The research literature cannot agree on what they are, and in part disputes whether the trigger-point construct is reliably identifiable at all. Aletheia case file VASO-001 documents why that argument has run so long: no specialty owns muscle tone, so there are no billing codes, no imaging protocols and no funding lines. The skeptical position that there is no evidence is quietly circular — there is little evidence because nobody has been paid to look.',
      'The case file assembles a chain running from trigger-point electrophysiology through smooth-muscle latch-bridge physiology and the hemo-neural hypothesis to the proposal that vascular tension functions as a memory element participating in mental life. It also grades that chain honestly, and the grading is what makes this fundable. The case has an **inverted ladder**: the mechanism rung is far stronger than the observation rung beneath it or the attribution rung above it. Latch-bridge physiology is textbook. Whether a latch is engaged at a tender point has never been measured in either direction, and the audit of both linchpin propositions returned grade D — no direct evidence located.',
      'This RFP funds the measurements that would move the ladder. It is organized around the four claims the case file marks unresolved, because those are the only places where new work changes the verdict. Proposals that would strengthen an already well-supported rung are out of scope.',
    ].join('\n\n'),
  },
  {
    id: 'claims',
    heading: 'The four unresolved claims',
    body: [
      'Each claim below is quoted from the case file with its current status. A proposal must name exactly one claim as its target and state, in advance, what result would count against it.',
      '**VASO-C004 · Observation rung.** *Sustained pressure on a tender point combined with slow exhalation can produce a felt release of the point within seconds.* Currently unresolved and resting on proponent testimony; the grade-D audit confirms nobody has ever imaged one. This is the keystone. It is also the cheapest thing on this list, and everything above it is waiting on it. In scope: the time-locked imaging experiment (elastography and Doppler through one probe, calibrated pressure, blinded site localization, factorial controls, preregistered prediction); the natural-history census that would supply the localization protocol every other study needs; and the factorial intervention trial separating pressure from breath.',
      '**VASO-C020 · Attribution rung.** *Muscle knots are maintained vascular-autonomic states — microvascular smooth muscle held in the latch-bridge state — rather than damaged or scarred tissue.* Unresolved, and the mechanism is positively strained where the thesis needs it. Published measurements in pressurized skeletal-muscle arterioles show maintained or rising myosin light-chain phosphorylation — sustained activation, not the economical dephosphorylated hold a latch requires — and latch behaviour vanished one branch order downstream in the only paired vessel comparison. Arteriolar energetic cost has never been measured at all. In scope: a paired-caliber, pressurized design across successive arteriole orders from one skeletal-muscle bed, with an explicit stimulus-withdrawal phase, since economical maintenance under continuing activation is a different finding from a state that holds after its input stops.',
      '**VASO-C021 · Attribution rung.** *Vascular smooth-muscle tension functions as a memory element that participates in mental life.* Unresolved, and the framing currently fails the write–store–read test. In scope: the experiment that separates vascular modulation from vascular memory — repeatedly evoke a neural pattern while inducing a candidate vascular state, stop the input, and test whether the maintained state biases later neural responses back toward the trained pattern under identical stimulation, with oxygenation and metabolic variables clamped so nonspecific ischemic suppression cannot masquerade as memory.',
      '**VASO-C022 · Attribution rung.** *Contemplative anatomies of knots and channels are first-person empirical maps of the same vascular-autonomic tension system.* Unresolved and vulnerable to post-hoc matching, because nobody has coded the traditional locations under blinded rules and tested the alignment against chance. In scope: preregistered anatomical coding of the rtsa mdud, granthi and ashi-point corpora into a common coordinate system **before** modern maps are inspected, by scholars fluent in both the traditions and modern anatomy.',
    ].join('\n\n'),
  },
  {
    id: 'objective',
    heading: 'Objective and scope',
    body: [
      'This program funds tests in either direction. A study designed only to confirm its claim is a weaker submission than one designed to kill it, and will be scored as such. The case file does not end in a verdict and neither does this RFP: a clean negative on VASO-C004 would retire the featured hypothesis and is worth exactly as much to us as a positive.',
      "The core deliverable is a published paper reporting the preregistered analysis, whichever way it comes out. Null results are expected outputs, not failures, and the award is not contingent on the direction of the finding. Proposals should state which claim they target, which of the case file's study designs they answer or amend, and what they would accept as disconfirmation.",
    ].join('\n\n'),
  },
  {
    id: 'eligibility',
    heading: 'Eligibility and expected outputs',
    body: [
      'Faculty, postdocs and PhD students are eligible, as are independent researchers with demonstrated instrument access. Collaborative teams spanning imaging, vascular physiology and — for VASO-C022 — philology are strongly encouraged. Applicants should verify their identity on ResearchHub as evidence of credentials.',
      '**Applications take the form of a preregistration on ResearchHub.** The full protocol, the analysis plan, the blinding procedures and the preregistered prediction are described in methodological detail before any data exists, and the criteria are frozen at submission. This is a condition rather than a preference: on a contested question where examiner reliability is itself disputed, criteria tuned after the answer is known would produce another decade of unresolvable argument. All raw data, analyses, results and code are shared in an open-access repository with permanent DOIs. Preprints are encouraged.',
      'Work involving human subjects, animal preparations or tissue sampling must demonstrate appropriate ethical oversight and permits before funds are released.',
    ].join('\n\n'),
  },
  {
    id: 'budget',
    heading: 'Budget and timeline',
    body: [
      "**$1,000,000 USD** is committed to this program, sized to cover the case file's published agenda rather than a single study. Awards are made against the applicant's stated budget, not a flat figure.",
      '- **Lab and field studies** — indicative range $150,000 to $265,000. The keystone imaging experiment is the cheapest decisive study in the program and is expected near the bottom of that range.\n- **Desk studies and scholarly coding** — indicative range $50,000 to $80,000.',
      'Funding is allocated on a rolling basis with no formal deadline, and the program deliberately holds budget in reserve for claims that have not yet attracted a credible proposal. Funds are processed as an unrestricted gift to the recipient institution through our nonprofit partner, Endaoment. There are no restrictions on publication of results.',
    ].join('\n\n'),
  },
  {
    id: 'evaluation',
    heading: 'Evaluation criteria',
    body: [
      "Proposals are evaluated by open peer review on ResearchHub, scored on a five-point scale by reviewers recruited for the specific claim the proposal targets. Reviewers weigh methodological rigor, whether the design could genuinely refute the claim as well as support it, the adequacy of the controls against expectation and generalized relaxation, and the applicant's demonstrated access to the instruments the protocol requires.",
      'Proposals averaging **3.5 or above** are eligible for award. Proposals below that bar, or with only a single review on file, are **held pending further review rather than declined** — thin evidence is not the same as bad evidence.',
      'Reviewer disagreement is reported, not averaged away. Where reviewers split materially on the same proposal, both assessments are published and the split is stated in the funding decision. Reviews are contributed by both human reviewers and AI, and each is labeled as such on the proposal.',
    ].join('\n\n'),
  },
];
