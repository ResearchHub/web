/**
 * The page's words and figures: the problem in biomedicine, the audit the
 * call funds, what it makes possible, the FAQ and the sources. Every figure
 * is cited in `SOURCES` and was checked against that source on 18–19
 * November 2026. RFP facts (pool, deadline) are not here; they come from
 * the live RFP (`rfp.ts`).
 *
 * The call's scope (`AUDIT_STEPS`) and the FAQ are a DRAFT until the call's
 * terms are set.
 */

export interface Source {
  key: string;
  label: string;
  url: string;
}

/** In the order they are numbered on the page. Cite one with `<Ref to="key" />`. */
export const SOURCES = [
  {
    key: 'rpcb',
    label:
      'Errington et al., “Investigating the replicability of preclinical cancer biology”, eLife, 2021',
    url: 'https://doi.org/10.7554/eLife.71601',
  },
  {
    key: 'reviewers',
    label:
      'Schroter et al., “What errors do peer reviewers detect, and does training improve their ability to detect them?”, J. R. Soc. Med., 2008',
    url: 'https://doi.org/10.1258/jrsm.2008.080062',
  },
  {
    key: 'freedman',
    label:
      'Freedman, Cockburn and Simcoe, “The economics of reproducibility in preclinical research”, PLoS Biology, 2015',
    url: 'https://doi.org/10.1371/journal.pbio.1002165',
  },
  {
    key: 'spot',
    label:
      'Son et al., “When AI co-scientists fail: SPOT, a benchmark for automated verification of scientific research”, 2025',
    url: 'https://arxiv.org/abs/2505.11855',
  },
  {
    key: 'bianchi',
    label:
      'Bianchi et al., “To err is human: systematic quantification of errors in published AI papers via LLM analysis”, 2025',
    url: 'https://arxiv.org/abs/2512.05925',
  },
  {
    key: 'method',
    label: 'Handmer, “Method and limits: how to audit a field by machine”, 2026',
    url: 'https://science.caseyhandmer.com/physics/method.html',
  },
  {
    key: 'audit',
    label: 'Handmer, “A field of physics, audited by machine”, 2026',
    url: 'https://science.caseyhandmer.com/physics/',
  },
  {
    key: 'errors',
    label: 'Handmer, “872 verified errors in 433 papers”, 2026 (the audit’s full list)',
    url: 'https://science.caseyhandmer.com/physics/errors.html',
  },
] as const satisfies readonly Source[];

export type SourceKey = (typeof SOURCES)[number]['key'];

/** The number a source carries on the page. */
export function sourceNumber(key: SourceKey): number {
  return SOURCES.findIndex((s) => s.key === key) + 1;
}

/**
 * The problem, three ways, each readable at a glance: a short statement, a
 * bar where there is a share to show, and the figure behind it in small
 * print.
 */
export interface Problem {
  title: string;
  /** The share that held up (0–1), drawn as a bar against the share that did not. */
  split?: { share: number; good: string; bad: string };
  note: string;
  source: SourceKey;
}

export const PROBLEMS: Problem[] = [
  {
    title: 'Fewer than half of results replicate.',
    split: { share: 0.46, good: 'Replicated', bad: 'Did not' },
    note: '46% in a major replication project in cancer biology.',
    source: 'rpcb',
  },
  {
    title: 'Peer reviewers miss most errors.',
    split: { share: 2.58 / 9, good: 'Caught', bad: 'Missed' },
    note: 'Reviewers caught 2.6 of 9 planted errors, on average.',
    source: 'reviewers',
  },
  {
    title: '$28 billion a year funds work that cannot be reproduced.',
    note: 'In the US alone, by one estimate with a wide range.',
    source: 'freedman',
  },
];

/** The audit the pool funds, step by step. DRAFT scope. */
export interface AuditStep {
  title: string;
  text: string;
}

export const AUDIT_STEPS: AuditStep[] = [
  { title: 'AI reads the papers', text: 'Every open paper in one field.' },
  { title: 'It flags possible errors', text: 'Statistics, arithmetic, figures, data.' },
  { title: 'Experts check each flag', text: 'Specialists confirm or reject it.' },
  { title: 'Errors get corrected', text: 'Authors are told. Results are public.' },
];

/** What the audit is for: four things it makes possible. */
export interface Benefit {
  title: string;
  text: string;
}

export const BENEFITS: Benefit[] = [
  { title: 'Science that holds up', text: 'Researchers build on results that have been checked.' },
  { title: 'Funding that goes further', text: 'Money goes to work that stands, not to dead ends.' },
  { title: 'Treatments, sooner', text: 'Fewer years lost chasing results that were never right.' },
  { title: 'Smarter AI', text: 'Models learn from a literature that has been corrected.' },
];

export interface Faq {
  q: string;
  a: string;
  sources?: SourceKey[];
}

export const FAQ: Faq[] = [
  {
    q: 'What makes a strong proposal?',
    a: 'It names its corpus and how it is drawn, says how an error will be confirmed before it counts, and commits in advance to reporting its false-positive rate. It includes people qualified to judge the field.',
  },
  {
    q: 'Does an audit show whether a result replicates?',
    a: 'No. An audit does not rerun the experiment. It checks what the paper already shows: whether the statistics, arithmetic, figures and data agree with each other and with the conclusions. Those errors are one reason results fail to hold up, and they are the part a machine can check at scale.',
  },
  {
    q: 'How accurate is AI at finding errors?',
    a: 'It varies a great deal. On one 2025 test of real, author-confirmed errors the best model found 21%. In another, human experts confirmed 83% of the mistakes a checker flagged. In the astrophysics audit a blind re-check by a third AI session agreed with 33 of 40 errors, and no person has checked them yet. That is why this call pays for expert checking as well as model time.',
    sources: ['spot', 'bianchi', 'method'],
  },
  {
    q: 'Will papers and authors be named?',
    a: 'Only for errors a qualified person has confirmed, and after the authors have been told and given the chance to reply.',
  },
  {
    q: 'Why biomedicine, and what about other fields?',
    a: 'It has an open literature large enough to check at scale, the best-documented record of results that fail to hold up, and errors that can end up reaching patients. Other fields may get calls of their own.',
  },
  {
    q: 'Who can apply?',
    a: 'Anyone with a rigorous plan: university labs, institutes, independent researchers and companies, in any country and at any career stage.',
  },
  {
    q: 'How are decisions made?',
    a: 'Proposals are published on ResearchHub and peer reviewed in the open. The ResearchHub Foundation picks which to fund, guided by those reviews.',
  },
  {
    q: 'Can we give model credits instead of cash?',
    a: 'Yes. Model time is a real cost of every audit. If you run an AI lab or a compute provider and would rather give credits, book a call with us.',
  },
  {
    q: 'What inspired this call?',
    a: 'Casey Handmer’s AI audit of theoretical astrophysics, published in November 2026. It read 50,269 papers in full and reported 872 errors in 433 of them, for about $2,720 in model cost. No person has checked its findings yet, and he is not involved in this call.',
    sources: ['audit', 'errors'],
  },
];
