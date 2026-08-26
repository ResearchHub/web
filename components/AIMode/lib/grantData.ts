import type { RfpSection } from './types';

/**
 * The real Megalithic Geopolymer Studies grant on ResearchHub. The demo is built
 * entirely around this one grant, so its identifiers are constants rather than
 * parameters.
 */
export const GRANT = {
  postId: 13741,
  grantId: 32,
  slug: 'megalithic-geopolymer-studies',
  title: 'Megalithic Geopolymer Studies',
  /**
   * Absolute and pointed at production on purpose: the demo is usually driven
   * from localhost, and the payoff of "the RFP is live" lands only if the link
   * goes to the page anyone can visit.
   */
  href: 'https://www.researchhub.com/grant/13741/megalithic-geopolymer-studies',
  amountUsd: 200_000,
  organization: 'Pseudonymous',
} as const;

/**
 * The drafted RFP, condensed from the real grant body at
 * `GET /api/researchhubpost/13741/`. Sections are revealed one at a time as the
 * conversation progresses.
 */
export const RFP_SECTIONS: RfpSection[] = [
  {
    id: 'title',
    heading: 'Title',
    body: 'Megalithic Geopolymer Studies: independent replication and characterization of low-temperature alkali-silicate stone formation.',
  },
  {
    id: 'context',
    heading: 'Context',
    body: [
      'Beginning in the 1980s, Joseph Davidovits proposed that certain ancient megaliths — from the Egyptian pyramids to Tiwanaku and Pumapunku in South America — were cast from geopolymer concrete rather than quarried and transported as whole blocks. Davidovits identified geopolymeric signatures in existing megalithic stone, but never proposed a specific method by which ancient builders could have produced water glass, the alkali-silicate binder, from locally available materials using pre-industrial tools.',
      "That practical gap is what Marcell Fóti's 2025 protocol claims to close. The method runs in two stages: a eutectic mixture of sodium and potassium hydroxides (melting near 168 °C) is reacted with quartz sand or crushed granite over multiple days of open-atmosphere boiling, evaporation and re-dissolution to dissolve part of the stone into a binder; the binder is then mixed with crushed aggregate, cast on tilted surfaces to drain excess lye, and cured over days to weeks into hardened artificial stone.",
      'The protocol has been demonstrated publicly, at length, and in full. It has never been independently replicated under controlled laboratory conditions. That is the gap this RFP exists to close.',
    ].join('\n\n'),
  },
  {
    id: 'questions',
    heading: 'Key questions',
    body: [
      '**Replication.** Can the published protocol be followed under controlled laboratory conditions to consistently produce a hardened artificial stone? How do outcomes vary across input rock types, batch sizes and environmental conditions?',
      '**Materials analysis.** What forms at each stage of the reaction? Proposals should characterize binder formation, intermediary compounds and the final cured product, building a complete mechanical and compositional profile against natural stone. Blinded comparative testing against reliably sourced Andean megalith and quarry samples is welcome.',
      '**Historical feasibility.** Can every input — alkali sources, aggregate, fuel, vessels, tools — be substituted with materials available in the pre-colonial Andean highlands? Do results hold under pre-industrial conditions at archaeologically relevant scales?',
    ].join('\n\n'),
  },
  {
    id: 'objective',
    heading: 'Objective and scope',
    body: [
      "We are seeking independent experimental research that moves Fóti's protocol from a social-media demonstration to definitive, peer-reviewed laboratory results — either supporting or refuting the claims above.",
      'The core deliverable is a published paper, or series of papers, providing clear and reproducible evidence on each question addressed. The choice of analytical methods is left to the applicant; what matters is that each question is evaluated with evidence-based approaches. Proposals may address one objective or several, and should state the relevant expertise for each.',
    ].join('\n\n'),
  },
  {
    id: 'eligibility',
    heading: 'Eligibility and expected outputs',
    body: [
      'Faculty, postdocs and PhD students are eligible. Collaborative and interdisciplinary teams are strongly encouraged. Applicants should verify their identity on ResearchHub as evidence of credentials. Projects should be feasible within 12–24 months using available or obtainable infrastructure, and any work involving chemical synthesis or geological sampling must demonstrate appropriate safety oversight and permits.',
      'Applications take the form of a preregistration on ResearchHub, with the full study protocol — including blinding procedures where applicable — described in methodological detail. All raw data, analyses, results and code are to be shared in an open-access repository with permanent DOIs. Preprints are encouraged.',
    ].join('\n\n'),
  },
  {
    id: 'budget',
    heading: 'Budget and timeline',
    body: [
      '**$200,000 USD** is committed to this RFP and will be awarded to fully fund selected proposals. Eligible proposals may additionally receive community crowdfunding on ResearchHub.',
      'Funding is allocated on a rolling basis with no formal deadline. Funds are processed as an unrestricted gift to the recipient lab at their academic institution through our nonprofit partner, Endaoment. There are no restrictions on publication of results.',
    ].join('\n\n'),
  },
  {
    id: 'evaluation',
    heading: 'Evaluation criteria',
    body: [
      "Proposals are evaluated by open peer review on ResearchHub, scored on a five-point scale. Reviewers weigh methodological rigor, whether the design could genuinely refute the hypothesis as well as support it, the credibility of the characterization plan, and the applicant's demonstrated capacity to execute.",
      'Proposals averaging **3.5 or above** across their reviews are eligible for immediate award. Proposals below that bar, or with only a single review on file, are held pending further review rather than declined.',
    ].join('\n\n'),
  },
];
