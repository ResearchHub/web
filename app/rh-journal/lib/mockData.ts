import { FeedEntry, FeedPaperContent, Review } from '@/types/feed';
import { AuthorProfile } from '@/types/authorProfile';

/**
 * Demo data for the ResearchHub "Journal of Registered Reports".
 *
 * A registered report is a publication format where the study protocol
 * (hypotheses + methods + analysis plan) is peer reviewed BEFORE data is
 * collected. On ResearchHub the lifecycle is:
 *   Funding opportunity → Funded proposal → Registered Report (Stage 1, in-principle
 *   acceptance) → Results (Stage 2, version of record).
 *
 * Everything here is mocked so the feed + detail pages can be demoed without a
 * backend. Demo IDs live in the 900000+ range to avoid colliding with real works.
 */

export type ReportStage = 'funding' | 'proposal' | 'report' | 'results';

export interface RegisteredReportAuthor {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  image?: string;
  verified?: boolean;
}

export interface RegisteredReportSection {
  heading: string;
  /** Paragraphs of body copy for this section. */
  paragraphs: string[];
}

export interface RegisteredReportHypothesis {
  label: string;
  statement: string;
  prediction: string;
}

export interface RegisteredReport {
  id: number;
  slug: string;
  title: string;
  /** Short, plain-text abstract used on the feed card. */
  abstract: string;
  /** Longer abstract for the detail page. */
  fullAbstract: string;
  image: string;
  authors: RegisteredReportAuthor[];
  topics: { id: number; name: string; slug: string }[];
  reviewScore: number;
  reviewCount: number;
  reviews: Review[];
  /** Current position of the work in the ResearchHub lifecycle. */
  stage: ReportStage;
  /** ISO date the work reached its current stage. */
  stageDate: string;
  createdDate: string;
  doi: string;
  keywords: string[];
  funding: {
    funder: string;
    amountUsd: number;
    amountRsc: number;
    fundedDate: string;
    contributors: number;
  };
  inPrincipleAcceptanceDate: string;
  registrationDoi: string;
  hypotheses: RegisteredReportHypothesis[];
  sections: RegisteredReportSection[];
  design: { label: string; value: string }[];
}

const RH_JOURNAL = {
  id: 9001,
  name: 'ResearchHub Journal of Registered Reports',
  slug: 'researchhub-registered-reports',
};

function makeAuthorProfile(a: RegisteredReportAuthor): AuthorProfile {
  return {
    id: a.id,
    fullName: a.name,
    firstName: a.firstName,
    lastName: a.lastName,
    profileImage: a.image || '',
    profileUrl: `/author/${a.id}`,
    isClaimed: true,
    isVerified: !!a.verified,
    user: a.verified ? ({ id: a.id, isVerified: true } as AuthorProfile['user']) : undefined,
  };
}

function makeReviews(authors: RegisteredReportAuthor[], scores: number[]): Review[] {
  const reviewerNames = [
    { id: 78001, first: 'Elena', last: 'Vasquez' },
    { id: 78002, first: 'Marcus', last: 'Thornton' },
    { id: 78003, first: 'Priya', last: 'Raman' },
    { id: 78004, first: 'Johan', last: 'Berg' },
  ];

  return scores.map((score, i) => {
    const r = reviewerNames[i % reviewerNames.length];
    return {
      id: 76000 + i,
      score,
      isAssessed: true,
      author: makeAuthorProfile({
        id: r.id,
        name: `${r.first} ${r.last}`,
        firstName: r.first,
        lastName: r.last,
        verified: true,
      }),
    };
  });
}

export const registeredReports: RegisteredReport[] = [
  {
    id: 900101,
    slug: 'sirt6-microvascular-mural-cells-stroke-recovery',
    title:
      'Does Sirt6 loss in microvascular mural cells impair blood–brain barrier repair after ischemic stroke? A registered report',
    abstract:
      'We preregister a study testing whether conditional knockout of Sirt6 in pericytes and smooth muscle cells delays neurovascular unit repair following ischemic stroke in mice. Outcomes and analysis are locked prior to data collection.',
    fullAbstract:
      'The neurovascular unit relies on microvascular mural cells — pericytes and vascular smooth muscle cells — to restore blood–brain barrier (BBB) integrity after ischemic injury. Sirt6, an NAD+-dependent deacetylase, has been implicated in vascular aging, yet its cell-autonomous role in mural cells during stroke recovery is unknown. In this registered report we describe a fully powered, preregistered experiment using an inducible, mural-cell-specific Sirt6 knockout mouse subjected to transient middle cerebral artery occlusion. All primary and secondary outcomes, exclusion criteria, and the statistical analysis plan are specified in advance and were peer reviewed prior to any data collection (Stage 1 in-principle acceptance).',
    image:
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80',
    authors: [
      {
        id: 4945925,
        name: 'Ruslan Rust',
        firstName: 'Ruslan',
        lastName: 'Rust',
        verified: true,
      },
      { id: 51002, name: 'Amara Okafor', firstName: 'Amara', lastName: 'Okafor' },
      { id: 51003, name: 'Daniel Weiss', firstName: 'Daniel', lastName: 'Weiss', verified: true },
    ],
    topics: [
      { id: 301, name: 'Neuroscience', slug: 'neuroscience' },
      { id: 302, name: 'Vascular Biology', slug: 'vascular-biology' },
    ],
    reviewScore: 4.7,
    reviewCount: 3,
    reviews: [],
    stage: 'report',
    stageDate: '2026-06-18T00:00:00Z',
    createdDate: '2026-06-18T00:00:00Z',
    doi: '10.55555/rhjrr.900101',
    keywords: [
      'Sirt6',
      'pericytes',
      'blood–brain barrier',
      'ischemic stroke',
      'neurovascular unit',
    ],
    funding: {
      funder: 'ResearchHub Foundation — Open Neuroscience Fund',
      amountUsd: 62000,
      amountRsc: 124000,
      fundedDate: '2026-02-10T00:00:00Z',
      contributors: 214,
    },
    inPrincipleAcceptanceDate: '2026-06-18T00:00:00Z',
    registrationDoi: '10.55555/rhjrr.reg.900101',
    hypotheses: [
      {
        label: 'H1',
        statement:
          'Mural-cell-specific Sirt6 deletion impairs blood–brain barrier repair after ischemic stroke.',
        prediction:
          'Knockout mice will show ≥30% greater IgG extravasation at 7 days post-occlusion versus littermate controls.',
      },
      {
        label: 'H2',
        statement: 'Impaired repair is driven by reduced pericyte proliferation.',
        prediction:
          'Ki67+/PDGFRβ+ cell counts in the peri-infarct region will be lower in knockouts than controls.',
      },
    ],
    sections: [
      {
        heading: 'Background & rationale',
        paragraphs: [
          'After an ischemic stroke, the blood–brain barrier is transiently disrupted and its timely restoration is a strong predictor of functional recovery. Microvascular mural cells orchestrate this repair by re-establishing basement membrane contacts and stabilizing endothelial tight junctions.',
          'Sirt6 declines with age and its loss accelerates vascular senescence in peripheral tissues. Whether Sirt6 is required cell-autonomously in cerebral mural cells during the acute repair window has not been tested with an adequately powered, bias-controlled design — which motivates this registered report.',
        ],
      },
      {
        heading: 'Methods (Stage 1 protocol)',
        paragraphs: [
          'Animals: Pdgfrb-CreERT2; Sirt6^fl/fl mice and Cre-negative littermate controls, both sexes, aged 10–14 weeks. Tamoxifen induction two weeks prior to surgery. Target n = 24 per group based on an a priori power analysis (80% power, α = 0.05, expected effect size d = 0.85).',
          'Model: Transient (45 min) middle cerebral artery occlusion with laser-Doppler confirmation of ≥70% flow reduction. Pre-registered exclusion criteria: insufficient occlusion, intraoperative death, or hemorrhagic transformation on day-1 imaging.',
          'Outcomes: Primary — BBB permeability (IgG extravasation area) at 7 days. Secondary — pericyte coverage, tight-junction protein expression, and infarct volume. Blinding is maintained through automated image analysis with coded filenames.',
        ],
      },
      {
        heading: 'Analysis plan',
        paragraphs: [
          'Primary outcome analyzed by mixed-effects model with genotype and sex as fixed effects and surgical batch as a random effect. The confirmatory test is the genotype main effect on day-7 IgG extravasation. Sensitivity analyses and all exploratory comparisons are labeled as such and were fixed before unblinding.',
        ],
      },
    ],
    design: [
      { label: 'Study type', value: 'Confirmatory preclinical experiment' },
      { label: 'Model', value: 'Inducible mural-cell Sirt6 knockout mouse' },
      { label: 'Sample size', value: 'n = 24 per group (a priori power analysis)' },
      { label: 'Primary outcome', value: 'BBB permeability at 7 days' },
      { label: 'Blinding', value: 'Automated, coded image analysis' },
      { label: 'Data availability', value: 'Open — raw images + code on deposit' },
    ],
  },
  {
    id: 900102,
    slug: 'phage-cocktail-carbapenem-resistant-klebsiella',
    title:
      'A preregistered efficacy trial of a defined bacteriophage cocktail against carbapenem-resistant Klebsiella pneumoniae biofilms',
    abstract:
      'This registered report specifies a blinded in vitro and murine efficacy protocol for a three-phage cocktail targeting carbapenem-resistant K. pneumoniae, with resistance emergence and biofilm clearance as locked primary outcomes.',
    fullAbstract:
      'Carbapenem-resistant Klebsiella pneumoniae (CRKP) is a WHO critical-priority pathogen for which few therapeutic options remain. Bacteriophage therapy is promising but plagued by inconsistent, underpowered, and results-contingent reporting. Here we preregister a defined three-phage cocktail and a locked protocol evaluating biofilm clearance in vitro and survival in a murine pneumonia model. Primary outcomes, phage ratios, resistance-monitoring windows, and stopping rules are fixed prior to data collection and were granted in-principle acceptance at Stage 1.',
    image:
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80',
    authors: [
      {
        id: 984218,
        name: 'Attila Karsi',
        firstName: 'Attila',
        lastName: 'Karsi',
        verified: true,
      },
      { id: 52002, name: 'Lucia Moreno', firstName: 'Lucia', lastName: 'Moreno', verified: true },
    ],
    topics: [
      { id: 303, name: 'Microbiology', slug: 'microbiology' },
      { id: 304, name: 'Antimicrobial Resistance', slug: 'antimicrobial-resistance' },
    ],
    reviewScore: 4.4,
    reviewCount: 4,
    reviews: [],
    stage: 'report',
    stageDate: '2026-06-02T00:00:00Z',
    createdDate: '2026-06-02T00:00:00Z',
    doi: '10.55555/rhjrr.900102',
    keywords: ['bacteriophage', 'Klebsiella pneumoniae', 'antimicrobial resistance', 'biofilm'],
    funding: {
      funder: 'ResearchHub Foundation — AMR Response Fund',
      amountUsd: 48500,
      amountRsc: 97000,
      fundedDate: '2026-01-22T00:00:00Z',
      contributors: 168,
    },
    inPrincipleAcceptanceDate: '2026-06-02T00:00:00Z',
    registrationDoi: '10.55555/rhjrr.reg.900102',
    hypotheses: [
      {
        label: 'H1',
        statement: 'The three-phage cocktail reduces mature CRKP biofilm biomass in vitro.',
        prediction:
          'Cocktail-treated biofilms will show ≥2-log CFU reduction at 24h versus vehicle.',
      },
      {
        label: 'H2',
        statement: 'The cocktail suppresses resistance emergence relative to single-phage therapy.',
        prediction: 'Time-to-resistance will be longer for the cocktail than any monophage arm.',
      },
    ],
    sections: [
      {
        heading: 'Background & rationale',
        paragraphs: [
          'Phage therapy studies frequently report only successful cases, and cocktail composition is often optimized post hoc. A registered report format removes these degrees of freedom by fixing the phage set, ratios, and outcomes before any experiments are run.',
        ],
      },
      {
        heading: 'Methods (Stage 1 protocol)',
        paragraphs: [
          'In vitro: 96-well mature biofilms of five clinical CRKP isolates treated with cocktail, each monophage, or vehicle. Outcome — viable CFU at 24h, six biological replicates.',
          'In vivo: Murine pneumonia model, intranasal challenge followed by nebulized phage or vehicle. Primary outcome — 7-day survival with a preregistered humane endpoint. Randomization by coded cage cards; analysts blinded to arm.',
        ],
      },
    ],
    design: [
      { label: 'Study type', value: 'Confirmatory efficacy trial (in vitro + in vivo)' },
      { label: 'Pathogen', value: 'Carbapenem-resistant K. pneumoniae' },
      { label: 'Primary outcome', value: 'Biofilm CFU reduction; 7-day survival' },
      { label: 'Blinding', value: 'Coded arms, blinded analysts' },
      { label: 'Data availability', value: 'Open — sequencing + CFU data' },
    ],
  },
  {
    id: 900103,
    slug: 'kelp-forest-restoration-carbon-sequestration',
    title:
      'Can urchin-culling accelerate kelp forest recovery and carbon uptake? A preregistered field experiment',
    abstract:
      'A registered report describing a randomized, multi-site kelp restoration experiment along a temperate coastline, with kelp canopy recovery and sediment carbon flux as pre-specified primary outcomes.',
    fullAbstract:
      'Kelp forests are among the most productive coastal ecosystems and potentially significant blue-carbon sinks, but urchin barrens have expanded as predators decline. Restoration claims are often based on unreplicated, opportunistic sites. This registered report preregisters a randomized, controlled, multi-site field experiment testing whether targeted urchin removal accelerates kelp canopy recovery and increases sediment carbon flux over 18 months. Site allocation, monitoring cadence, and analysis are locked and received Stage 1 in-principle acceptance.',
    image:
      'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1200&q=80',
    authors: [
      { id: 6328170, name: 'Scott Nelson', firstName: 'Scott', lastName: 'Nelson', verified: true },
      { id: 53002, name: 'Mei Lin Chang', firstName: 'Mei Lin', lastName: 'Chang' },
      { id: 53003, name: 'Oskar Lund', firstName: 'Oskar', lastName: 'Lund' },
    ],
    topics: [
      { id: 305, name: 'Marine Ecology', slug: 'marine-ecology' },
      { id: 306, name: 'Climate Science', slug: 'climate-science' },
    ],
    reviewScore: 4.2,
    reviewCount: 3,
    reviews: [],
    stage: 'report',
    stageDate: '2026-05-20T00:00:00Z',
    createdDate: '2026-05-20T00:00:00Z',
    doi: '10.55555/rhjrr.900103',
    keywords: ['kelp forest', 'blue carbon', 'urchin barren', 'restoration ecology'],
    funding: {
      funder: 'ResearchHub Foundation — Climate & Oceans Fund',
      amountUsd: 74000,
      amountRsc: 148000,
      fundedDate: '2025-12-05T00:00:00Z',
      contributors: 292,
    },
    inPrincipleAcceptanceDate: '2026-05-20T00:00:00Z',
    registrationDoi: '10.55555/rhjrr.reg.900103',
    hypotheses: [
      {
        label: 'H1',
        statement: 'Urchin removal increases kelp canopy cover relative to untreated plots.',
        prediction:
          'Treated plots will exceed 40% canopy cover by month 12 versus <15% in controls.',
      },
      {
        label: 'H2',
        statement: 'Recovered kelp increases sediment organic carbon accumulation.',
        prediction:
          'Sediment carbon flux will be higher in treated than control plots at month 18.',
      },
    ],
    sections: [
      {
        heading: 'Background & rationale',
        paragraphs: [
          'Blue-carbon accounting for kelp is contested partly because restoration studies rarely use randomized controls or preregistered endpoints. Fixing the design in advance allows a fair test of both the ecological and carbon claims.',
        ],
      },
      {
        heading: 'Methods (Stage 1 protocol)',
        paragraphs: [
          'Twelve paired plots across four sites are randomly assigned to urchin removal or control. Divers quantify canopy cover monthly; sediment cores measure carbon flux quarterly. Analysts scoring imagery are blinded to treatment assignment.',
        ],
      },
    ],
    design: [
      { label: 'Study type', value: 'Randomized controlled field experiment' },
      { label: 'Sites', value: '4 sites × 3 paired plots' },
      { label: 'Duration', value: '18 months' },
      { label: 'Primary outcome', value: 'Canopy cover; sediment carbon flux' },
      { label: 'Data availability', value: 'Open — imagery + core data' },
    ],
  },
  {
    id: 900104,
    slug: 'psilocybin-cognitive-flexibility-replication',
    title:
      'A high-powered preregistered replication: does a single dose of psilocybin enhance cognitive flexibility?',
    abstract:
      'This registered report preregisters a double-blind, placebo-controlled replication of reported psilocybin effects on set-shifting, with sample size, exclusions, and analysis fixed in advance.',
    fullAbstract:
      'Early studies suggested that serotonergic psychedelics acutely enhance cognitive flexibility, but samples were small and analytic flexibility high. This registered report preregisters an adequately powered, double-blind, placebo-controlled replication measuring set-shifting performance after a single moderate dose of psilocybin. The sample size, blinding integrity checks, exclusion criteria, and confirmatory analyses are all locked, and the protocol received Stage 1 in-principle acceptance regardless of outcome.',
    image:
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1200&q=80',
    authors: [
      { id: 6487201, name: 'Qingyu Luo', firstName: 'Qingyu', lastName: 'Luo', verified: true },
      {
        id: 54002,
        name: 'Hannah Feldman',
        firstName: 'Hannah',
        lastName: 'Feldman',
        verified: true,
      },
    ],
    topics: [
      { id: 307, name: 'Psychology', slug: 'psychology' },
      { id: 308, name: 'Neuropharmacology', slug: 'neuropharmacology' },
    ],
    reviewScore: 4.8,
    reviewCount: 4,
    reviews: [],
    stage: 'report',
    stageDate: '2026-06-25T00:00:00Z',
    createdDate: '2026-06-25T00:00:00Z',
    doi: '10.55555/rhjrr.900104',
    keywords: ['psilocybin', 'cognitive flexibility', 'replication', 'preregistration'],
    funding: {
      funder: 'ResearchHub Foundation — Open Mind Fund',
      amountUsd: 55000,
      amountRsc: 110000,
      fundedDate: '2026-03-01T00:00:00Z',
      contributors: 341,
    },
    inPrincipleAcceptanceDate: '2026-06-25T00:00:00Z',
    registrationDoi: '10.55555/rhjrr.reg.900104',
    hypotheses: [
      {
        label: 'H1',
        statement: 'A single moderate dose of psilocybin improves set-shifting performance.',
        prediction:
          'Psilocybin group will show lower perseverative error rates than placebo at peak drug effect.',
      },
    ],
    sections: [
      {
        heading: 'Background & rationale',
        paragraphs: [
          'The original finding has been cited widely but never replicated at adequate power. A registered report is the ideal format to establish whether the effect is real, since publication does not depend on a positive result.',
        ],
      },
      {
        heading: 'Methods (Stage 1 protocol)',
        paragraphs: [
          'Design: Double-blind, placebo-controlled, between-subjects, n = 120 (a priori power for a medium effect). Primary task — probabilistic reversal learning. Blinding integrity assessed with a post-session guess questionnaire.',
        ],
      },
    ],
    design: [
      { label: 'Study type', value: 'Preregistered replication (RCT)' },
      { label: 'Sample size', value: 'n = 120' },
      { label: 'Design', value: 'Double-blind, placebo-controlled' },
      { label: 'Primary outcome', value: 'Perseverative error rate' },
      { label: 'Data availability', value: 'Open — de-identified task data' },
    ],
  },
  {
    id: 900105,
    slug: 'base-editing-pcsk9-primate-durability',
    title: 'Durability of in vivo base editing of PCSK9: a preregistered non-human primate study',
    abstract:
      'A registered report specifying a locked protocol to assess the 12-month durability and off-target profile of liver-directed PCSK9 base editing in non-human primates.',
    fullAbstract:
      'In vivo base editing to lower LDL cholesterol via PCSK9 knockdown has shown dramatic short-term effects, but durability and off-target safety over time remain under-characterized and selectively reported. This registered report preregisters a non-human primate study with locked primary endpoints — 12-month serum PCSK9/LDL reduction and genome-wide off-target editing frequency — with dosing, animal numbers, and analysis fixed before the study begins. Stage 1 in-principle acceptance has been granted.',
    image:
      'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1200&q=80',
    authors: [
      { id: 55001, name: 'Ines Duarte', firstName: 'Ines', lastName: 'Duarte', verified: true },
      { id: 55002, name: 'Robert Achebe', firstName: 'Robert', lastName: 'Achebe' },
      { id: 55003, name: 'Yuki Tanaka', firstName: 'Yuki', lastName: 'Tanaka', verified: true },
    ],
    topics: [
      { id: 309, name: 'Genome Editing', slug: 'genome-editing' },
      { id: 310, name: 'Cardiometabolic Disease', slug: 'cardiometabolic-disease' },
    ],
    reviewScore: 4.5,
    reviewCount: 3,
    reviews: [],
    stage: 'report',
    stageDate: '2026-06-10T00:00:00Z',
    createdDate: '2026-06-10T00:00:00Z',
    doi: '10.55555/rhjrr.900105',
    keywords: ['base editing', 'PCSK9', 'LDL cholesterol', 'off-target', 'non-human primate'],
    funding: {
      funder: 'ResearchHub Foundation — Translational Genomics Fund',
      amountUsd: 96000,
      amountRsc: 192000,
      fundedDate: '2026-02-18T00:00:00Z',
      contributors: 205,
    },
    inPrincipleAcceptanceDate: '2026-06-10T00:00:00Z',
    registrationDoi: '10.55555/rhjrr.reg.900105',
    hypotheses: [
      {
        label: 'H1',
        statement: 'A single dose of the PCSK9 base editor durably lowers LDL over 12 months.',
        prediction: 'Serum LDL will remain ≥50% below baseline at month 12.',
      },
      {
        label: 'H2',
        statement: 'Genome-wide off-target editing remains below the detection threshold.',
        prediction: 'No off-target site will exceed 0.1% editing by amplicon sequencing.',
      },
    ],
    sections: [
      {
        heading: 'Background & rationale',
        paragraphs: [
          'Durability and safety are the decisive questions for in vivo editing therapeutics, yet long-term primate data are rarely published in full. Preregistering endpoints and off-target analysis prevents selective reporting of favorable time points.',
        ],
      },
      {
        heading: 'Methods (Stage 1 protocol)',
        paragraphs: [
          'Adult cynomolgus macaques receive a single lipid-nanoparticle dose of the PCSK9 base editor or vehicle. Monthly serum sampling for 12 months; liver biopsy for genome-wide off-target profiling at months 1 and 12. Endpoints and dose are fixed; analysts are blinded to treatment.',
        ],
      },
    ],
    design: [
      { label: 'Study type', value: 'Confirmatory preclinical (NHP)' },
      { label: 'Intervention', value: 'LNP-delivered PCSK9 base editor' },
      { label: 'Duration', value: '12 months' },
      { label: 'Primary outcome', value: 'LDL reduction; off-target frequency' },
      { label: 'Data availability', value: 'Open — sequencing + lipid panels' },
    ],
  },
  {
    id: 900106,
    slug: 'remote-cbt-adolescent-depression-preregistered-trial',
    title:
      'Does app-delivered CBT reduce adolescent depression versus waitlist? A preregistered randomized trial',
    abstract:
      'This registered report preregisters a randomized controlled trial of a smartphone-delivered CBT program for adolescent depression, with primary outcome, blinding, and analysis locked prior to enrollment.',
    fullAbstract:
      'Digital mental-health interventions are proliferating faster than rigorous evidence. This registered report preregisters a randomized controlled trial comparing an 8-week app-delivered cognitive behavioral therapy program against a waitlist control for adolescents with moderate depression. The primary outcome (change in a validated depression scale at 8 weeks), enrollment targets, dropout handling, and confirmatory analysis are fixed in advance, and the protocol received Stage 1 in-principle acceptance.',
    image:
      'https://images.unsplash.com/photo-1573497491765-dccce02b29df?auto=format&fit=crop&w=1200&q=80',
    authors: [
      { id: 56001, name: 'Grace Osei', firstName: 'Grace', lastName: 'Osei', verified: true },
      { id: 56002, name: 'Tomás Herrera', firstName: 'Tomás', lastName: 'Herrera' },
    ],
    topics: [
      { id: 311, name: 'Clinical Psychology', slug: 'clinical-psychology' },
      { id: 312, name: 'Digital Health', slug: 'digital-health' },
    ],
    reviewScore: 4.1,
    reviewCount: 3,
    reviews: [],
    stage: 'report',
    stageDate: '2026-05-28T00:00:00Z',
    createdDate: '2026-05-28T00:00:00Z',
    doi: '10.55555/rhjrr.900106',
    keywords: ['CBT', 'adolescent depression', 'randomized trial', 'digital health'],
    funding: {
      funder: 'ResearchHub Foundation — Adolescent Health Fund',
      amountUsd: 51000,
      amountRsc: 102000,
      fundedDate: '2026-01-30T00:00:00Z',
      contributors: 187,
    },
    inPrincipleAcceptanceDate: '2026-05-28T00:00:00Z',
    registrationDoi: '10.55555/rhjrr.reg.900106',
    hypotheses: [
      {
        label: 'H1',
        statement: 'App-delivered CBT reduces depressive symptoms more than waitlist at 8 weeks.',
        prediction:
          'The CBT arm will show a greater reduction on the depression scale than waitlist (pre-specified MCID).',
      },
    ],
    sections: [
      {
        heading: 'Background & rationale',
        paragraphs: [
          'Many wellness apps claim clinical benefit without controlled evidence. A registered report guarantees the result is published whether or not the intervention works, which is essential for an honest evidence base.',
        ],
      },
      {
        heading: 'Methods (Stage 1 protocol)',
        paragraphs: [
          'Adolescents (13–17) with moderate depression are randomized 1:1 to the app or waitlist. Outcome assessors are blinded. Primary analysis is intention-to-treat with pre-specified multiple imputation for missing data.',
        ],
      },
    ],
    design: [
      { label: 'Study type', value: 'Preregistered RCT' },
      { label: 'Population', value: 'Adolescents 13–17, moderate depression' },
      { label: 'Arms', value: 'App CBT vs. waitlist' },
      { label: 'Primary outcome', value: 'Depression score change at 8 weeks' },
      { label: 'Data availability', value: 'Open — de-identified trial data' },
    ],
  },
];

// Attach generated reviews to each report (kept out of the literal above for brevity).
registeredReports.forEach((report) => {
  const scores = Array.from({ length: report.reviewCount }, (_, i) => {
    // Spread scores around the average so the tooltip looks realistic.
    const jitter = [0.2, -0.3, 0.4, -0.1][i % 4];
    return Math.max(1, Math.min(5, Math.round((report.reviewScore + jitter) * 2) / 2));
  });
  report.reviews = makeReviews(report.authors, scores);
});

/** Build the feed base URL for a report's detail page. */
export function buildReportUrl(report: RegisteredReport): string {
  return `/rh-journal/${report.id}/${report.slug}`;
}

/** Look up a report by its id (string or number). */
export function getReportById(id: string | number): RegisteredReport | undefined {
  return registeredReports.find((r) => String(r.id) === String(id));
}

/** Convert a registered report into a FeedEntry consumable by FeedItemPaper. */
export function buildFeedEntry(report: RegisteredReport): FeedEntry {
  const authors = report.authors.map(makeAuthorProfile);

  const content: FeedPaperContent = {
    id: report.id,
    contentType: 'PAPER',
    createdDate: report.createdDate,
    createdBy: authors[0],
    textPreview: report.abstract,
    slug: report.slug,
    title: report.title,
    previewImage: report.image,
    previewThumbnail: report.image,
    authors,
    topics: report.topics,
    journal: RH_JOURNAL,
    reviews: report.reviews,
    workType: 'preprint',
  };

  return {
    id: String(report.id),
    recommendationId: null,
    timestamp: report.stageDate,
    action: 'publish',
    contentType: 'PAPER',
    content,
    metrics: {
      votes: Math.round(report.funding.contributors / 6),
      comments: report.reviewCount + 2,
      saves: 0,
      reviewScore: report.reviewScore,
    },
  };
}

export const RH_JOURNAL_META = RH_JOURNAL;
