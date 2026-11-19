/**
 * The page's words and figures: the audit's ledger, the evidence that errors
 * persist, the cost estimates, what the call funds, its ground rules, the
 * FAQ and the sources. Every figure is cited in `SOURCES` and was checked
 * against that source on 18 November 2026. RFP facts (pool, deadline) are
 * not here; they come from the live RFP (`rfp.ts`).
 *
 * The call's scope (`TRACKS`), its rules (`RULES`) and the FAQ are a DRAFT
 * until the call's terms are set.
 */

export interface Source {
  id: number;
  label: string;
  url: string;
}

export const SOURCES: Source[] = [
  {
    id: 1,
    label: 'Handmer, “A field of physics, audited by machine”, 2026',
    url: 'https://science.caseyhandmer.com/physics/',
  },
  {
    id: 2,
    label: 'Handmer, “Method and limits: how to audit a field by machine”, 2026',
    url: 'https://science.caseyhandmer.com/physics/method.html',
  },
  {
    id: 3,
    label: 'Handmer, “872 verified errors in 433 papers”, 2026 (the audit’s full list)',
    url: 'https://science.caseyhandmer.com/physics/errors.html',
  },
  {
    id: 4,
    label: 'Handmer, post announcing the audit, X, 17 November 2026',
    url: 'https://x.com/CJHandmer/status/2122609626588061816',
  },
  {
    id: 5,
    label: 'Handmer, post on the cost of auditing every field, X, 17 November 2026',
    url: 'https://x.com/CJHandmer/status/2122796358616891642',
  },
  {
    id: 6,
    label:
      'Rust, post estimating the cost of AI review of the open-access literature, X, 16 November 2026',
    url: 'https://x.com/rust_ruslan/status/2122444038091718701',
  },
  {
    id: 7,
    label:
      'National Center for Science and Engineering Statistics, NSF 26-314, 2026 (US R&D: $993 billion estimated for 2024)',
    url: 'https://ncses.nsf.gov/pubs/nsf26314',
  },
  {
    id: 8,
    label:
      'National Library of Medicine, PMC Open Access Subset (8,402,749 records on 18 November 2026)',
    url: 'https://pmc.ncbi.nlm.nih.gov/tools/openftlist/',
  },
  {
    id: 9,
    label:
      'National Science Board, “The State of U.S. Science and Engineering 2026” (3.5 million articles in 2024)',
    url: 'https://ncses.nsf.gov/pubs/nsbsep20261',
  },
  {
    id: 10,
    label:
      'Son et al., “When AI co-scientists fail: SPOT, a benchmark for automated verification of scientific research”, 2025',
    url: 'https://arxiv.org/abs/2505.11855',
  },
  {
    id: 11,
    label:
      'Bianchi et al., “To err is human: systematic quantification of errors in published AI papers via LLM analysis”, 2025',
    url: 'https://arxiv.org/abs/2512.05925',
  },
  {
    id: 12,
    label:
      'Zubeldia et al., “Auditing AI peer reviewers: a benchmark on real scientific papers”, 2026',
    url: 'https://arxiv.org/abs/2611.17052',
  },
  {
    id: 13,
    label:
      'The Black Spatula Project; and coverage of its verification bottleneck, heise online, 2025',
    url: 'https://www.heise.de/en/news/No-more-calculation-errors-AI-checks-papers-for-errors-Why-that-s-not-enough-10321469.html',
  },
];

/**
 * The post that prompted the call (source 4), quoted briefly. Its "nearly
 * 1000 major" rounds up: the audit's pages count 872 upheld errors, 92 of
 * them graded major, and the page says so beside the quote.
 */
export const QUOTE = {
  text: 'We found nearly 1000 major errors that got cited many times…',
  author: 'Casey Handmer',
  where: 'on X, 17 November 2026',
  url: 'https://x.com/CJHandmer/status/2122609626588061816',
};

/** The astrophysics audit, top to bottom, as a funnel. Figures from sources 1–3. */
export interface LedgerRow {
  value: string;
  label: string;
  detail: string;
  /** An error row: drawn in the red pencil. */
  flagged?: boolean;
}

export const LEDGER: LedgerRow[] = [
  {
    value: '158,059',
    label: 'papers mapped',
    detail:
      'The papers of one Caltech research group, the papers they cite and the papers that cite them.',
  },
  {
    value: '50,269',
    label: 'papers read in full',
    detail: 'Every paper whose full text is openly available: 421 million words.',
  },
  {
    value: '659',
    label: 'papers recomputed',
    detail:
      'The most cited first. A model re-derived the equations and rebuilt the numbers, without seeing errata or later papers.',
  },
  {
    value: '872',
    label: 'errors reported',
    detail:
      'Spread across 433 papers. Each one was re-derived by a second, independent AI session before it counted. The audit grades 92 as major.',
    flagged: true,
  },
  {
    value: '159',
    label: 'errors repeated by later papers',
    detail: 'At least one later paper carried the error forward. In total, 367 later papers did.',
    flagged: true,
  },
  {
    value: '47',
    label: 'errors criticised by a later paper',
    detail:
      'Only 47 of the 872 errors were ever challenged in print. For 21 of them, the copying continued after the criticism.',
    flagged: true,
  },
];

/** How the audit's errors travelled into later papers (source 1). */
export const SPREAD = {
  copyingPapers: 367,
  objectingPapers: 68,
  challenged: 47,
  stillCopied: 21,
  laterCopies: 51,
};

/**
 * Estimated model cost of reviewing 3 million papers, US$ million, by model.
 * Redrawn from Rust's chart (source 6): batch pricing, November 2026.
 */
export const MODEL_COSTS: { model: string; usdMillion: number; note?: string }[] = [
  { model: 'GPT-6 Astra', usdMillion: 6.0 },
  { model: 'Claude Fable 5.2', usdMillion: 4.8 },
  { model: 'Claude Opus 5.5', usdMillion: 2.4 },
  { model: 'GPT-6.1 Sol', usdMillion: 1.2 },
  { model: 'Claude Sonnet 5.5', usdMillion: 1.2 },
  { model: 'Gemini 4 Carbon', usdMillion: 1.2, note: 'promotional rate' },
  { model: 'GPT-6.1 Terra', usdMillion: 0.6 },
];

export const US_RND_USD_BILLION = 993;

/** A stated fact: a figure and the one line that says what it is. */
export interface Fact {
  value: string;
  text: string;
  /** Omitted where the figure is this page's own arithmetic. */
  source?: number;
}

/** What auditing costs. The headline figure is Rust's estimate (source 6). */
export const COST_FACTS: Fact[] = [
  {
    value: '$0.20–$2',
    text: 'per paper, at those rates. Our arithmetic from the estimate above.',
  },
  {
    value: '$2,720',
    text: 'Model cost of the whole astrophysics audit at list price, or about $3 for each error found.',
    source: 1,
  },
  {
    value: '$100,000',
    text: 'Roughly what Handmer says the tokens would cost to sample every field of science.',
    source: 5,
  },
];

/** How large the literature is, beside the money already spent on research. */
export const SCALE_FACTS: Fact[] = [
  {
    value: '8.4 million',
    text: 'open-access papers in PubMed Central alone.',
    source: 8,
  },
  {
    value: '3.5 million',
    text: 'new science and engineering articles published in 2024.',
    source: 9,
  },
  {
    value: '< 0.001%',
    text: 'of one year of US research spending: what the upper estimate comes to.',
  },
];

/**
 * What finding the errors could change. Each is a possibility, stated with
 * the fact it rests on.
 */
export const OUTCOMES: { title: string; text: string; sources: number[] }[] = [
  {
    title: 'Errors are fixed before they spread.',
    text: 'Today more than five later papers repeat an error for each one that objects. An error flagged at its source can be corrected before the next paper cites it.',
    sources: [1],
  },
  {
    title: 'New work stands on results that hold.',
    text: 'The audit estimates 34,000 errors (25,000 to 48,000) still undetected in one field’s most cited papers, and it has recomputed only 4% of them. Each one found is a result nobody builds on by mistake.',
    sources: [1, 2],
  },
  {
    title: 'Open questions are answered sooner.',
    text: 'The audit listed 155 open questions in its field. A model judged 8 answerable now from existing data and code, and 119 that AI would speed up. Nobody has tried yet.',
    sources: [1],
  },
  {
    title: 'Every new paper is checked as it appears.',
    text: 'About 3.5 million articles are published a year. Rust proposes running the same review on every new preprint, so that checking keeps pace with publishing.',
    sources: [9, 6],
  },
];

/** What the pool pays for. DRAFT scope. */
export interface Track {
  id: string;
  name: string;
  lead: string;
  body: string;
  asks: string[];
}

export const TRACKS: Track[] = [
  {
    id: 'field',
    name: 'Audit a field',
    lead: 'Take one field and read all of it.',
    body: 'Map a field’s literature, screen what is open, and recompute its most relied-upon papers. Astrophysics is one field, mostly theory, around one group. Nobody knows yet what the same audit finds in cell biology, economics or clinical trials.',
    asks: [
      'A defined corpus and how it is drawn',
      'Every error re-derived independently before it counts',
      'The full list published, with each derivation',
    ],
  },
  {
    id: 'verify',
    name: 'Check the checker',
    lead: 'Put people on the flags.',
    body: 'No field-scale audit has had its findings adjudicated by experts. Fund the reading that turns a model’s claim into a result: specialists confirm or reject a sample of flags, and the precision is published, whatever it is.',
    asks: [
      'Named domain experts and a blind protocol',
      'A sample large enough to give a real error bar',
      'The rejected flags published beside the upheld ones',
    ],
  },
  {
    id: 'correct',
    name: 'Carry the correction',
    lead: 'Follow each error to where it went.',
    body: 'An error matters most in the papers that built on it. Trace confirmed errors through their citations, tell the authors first, and take corrections to journals and preprint servers so that the record changes, not only a list.',
    asks: [
      'Authors contacted before anything is public',
      'A right of reply, published with the finding',
      'Corrections filed and their outcomes tracked',
    ],
  },
  {
    id: 'method',
    name: 'Build it in the open',
    lead: 'Make the next audit cheaper and better.',
    body: 'Pipelines, prompts and benchmarks anyone can rerun: tests on real, author-confirmed errors; false-positive rates on clean papers; and standing audits that read new preprints as they are posted.',
    asks: [
      'Open code, prompts and data under an open licence',
      'Measured recall and false-positive rates',
      'A method that works on a field its authors did not build it for',
    ],
  },
];

/** Conditions on funded work. DRAFT. */
export const RULES: { title: string; text: string }[] = [
  {
    title: 'Two derivations, not one',
    text: 'An error counts only when a second, independent pass reaches it without seeing the first.',
  },
  {
    title: 'People before publication',
    text: 'A named paper is called wrong only after a qualified person has checked the claim and its authors have had the chance to answer.',
  },
  {
    title: 'Publish the misses',
    text: 'Every audit reports its false positives and what it could not read, alongside what it found.',
  },
  {
    title: 'Errors, not accusations',
    text: 'The subject is mistakes in honest work. The astrophysics screen looked for paper-mill language and chatbot residue and found none.',
  },
  {
    title: 'Open by default',
    text: 'Findings, data, prompts and code are published on ResearchHub under an open licence.',
  },
];

/** What is known about how well models find real errors. */
export const LIMITS: { value: string; text: string; source: number }[] = [
  {
    value: '21%',
    text: 'The best model’s recall on 91 real, author-confirmed errors in 2025. Its precision was 6%.',
    source: 10,
  },
  {
    value: '83%',
    text: 'Of 316 mistakes a checker flagged in published AI papers, the share human experts confirmed.',
    source: 11,
  },
  {
    value: '12–71%',
    text: 'Detection of errors injected into astrophysics preprints across twelve AI reviewers, with false alarms on under 9% of clean copies.',
    source: 12,
  },
  {
    value: '33 of 40',
    text: 'Errors from the astrophysics audit upheld when a third session re-checked them blind. No person has checked any yet.',
    source: 2,
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQ: Faq[] = [
  {
    q: 'What makes a strong proposal?',
    a: 'It names its corpus and how it is drawn, says how an error will be confirmed before it counts, and commits in advance to reporting its false-positive rate. It includes people qualified to judge the field, and it publishes everything, including the flags that did not hold up.',
  },
  {
    q: 'Which fields are in scope?',
    a: 'Any field where a claim can be checked against the paper itself: derivations, statistics, units, tables, code and data. Quantitative fields are the obvious start, but a well-argued proposal in any discipline is welcome.',
  },
  {
    q: 'Does an audit need people, or only models?',
    a: 'Both. Models make reading a whole field affordable; they also flag things that are not errors. Proposals that include expert adjudication, or that are only expert adjudication of an existing audit, are in scope.',
  },
  {
    q: 'Will papers and authors be named?',
    a: 'Only for errors a qualified person has confirmed, and after the authors have been told and given the chance to reply. The call funds work on honest mistakes, not allegations of misconduct.',
  },
  {
    q: 'What about papers behind paywalls?',
    a: 'Audits work from text they are licensed to read: open-access articles and preprints. The astrophysics audit could not read about a quarter of the papers on its map, and said so. Proposals should report their own coverage the same way.',
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
    q: 'Where does money added to the pool go?',
    a: 'Only to proposals funded under this call. The pool is the call’s whole budget, built by everyone who adds to it.',
  },
  {
    q: 'Is this call run with Casey Handmer or Ruslan Rust?',
    a: 'No. Their public posts prompted it and are cited as sources. Neither is affiliated with this call or has endorsed it.',
  },
];
