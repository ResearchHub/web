/**
 * Scripted "expert reviewer" peer reviews for a single demo proposal.
 *
 * Rather than rendering with a bespoke component, these are shaped as RAW API
 * comment objects (snake_case, TIPTAP `comment_content_json`, `review`, etc.) -
 * exactly like a real review returned from the comments endpoint. They are
 * injected into `CommentService.fetchComments` for the demo proposal so they
 * flow through `transformComment` -> `CommentFeed` -> `CommentItem` ->
 * `FeedItemComment` and render identically to reviews fetched from the API.
 * Nothing here touches the network.
 *
 * Gated behind `isDemoExpertReviewsProposalId` so only the one demo proposal
 * page is affected; every other document keeps the real, writable review feed.
 */

import type { PeerReview } from '@/types/work';

/** The only proposal this demo content is wired up for. */
export const DEMO_EXPERT_REVIEWS_PROPOSAL_ID = 30;

export function isDemoExpertReviewsProposalId(id: number | string): boolean {
  return Number(id) === DEMO_EXPERT_REVIEWS_PROPOSAL_ID;
}

type Decision = 'Yes' | 'No' | 'Partial';

interface ChecklistItemSpec {
  label: string;
  decision: Decision;
  justification: string;
}

interface CategorySpec {
  label: string;
  rationale: string;
  items: ChecklistItemSpec[];
}

interface ExpertReviewSpec {
  commentId: number;
  reviewId: number;
  threadId: number;
  userId: number;
  authorProfileId: number;
  firstName: string;
  lastName: string;
  title: string;
  profileImage: string;
  daysAgo: number;
  /** 1-5 overall review score. */
  score: number;
  overallSummary: string;
  overallRationale: string;
  categories: CategorySpec[];
}

// -- TipTap doc builder ---------------------------------------------------
// Standard editor node shapes (paragraphs, bold runs, horizontal rules and
// bullet lists) - the same content a real reviewer's editor produces - so the
// review body renders through the normal TipTap pipeline with no custom UI.

type TipTapNode = Record<string, any>;

function text(value: string, bold = false): TipTapNode {
  return bold ? { type: 'text', text: value, marks: [{ type: 'bold' }] } : { type: 'text', text: value };
}

function paragraph(...content: TipTapNode[]): TipTapNode {
  return { type: 'paragraph', content };
}

function checklistBulletList(items: ChecklistItemSpec[]): TipTapNode {
  return {
    type: 'bulletList',
    content: items.map((item) => ({
      type: 'listItem',
      content: [paragraph(text(`${item.label} (${item.decision}): `, true), text(item.justification))],
    })),
  };
}

function buildReviewDoc(spec: ExpertReviewSpec): TipTapNode {
  const content: TipTapNode[] = [
    paragraph(text(spec.overallSummary)),
    paragraph(text(spec.overallRationale)),
  ];

  spec.categories.forEach((category) => {
    content.push({ type: 'horizontalRule' });
    content.push(paragraph(text(category.label, true)));
    content.push(paragraph(text(category.rationale)));
    content.push(checklistBulletList(category.items));
  });

  // Reviewer sign-off, mirroring how real reviewers close their reviews.
  content.push({ type: 'horizontalRule' });
  content.push(paragraph(text(`${spec.firstName} ${spec.lastName}`, true)));
  content.push(paragraph(text(spec.title)));

  return { type: 'doc', content };
}

function buildRawComment(spec: ExpertReviewSpec): any {
  const now = Date.now();
  const createdDate = new Date(now - spec.daysAgo * 24 * 60 * 60 * 1000).toISOString();

  const authorProfile = {
    id: spec.authorProfileId,
    is_verified: true,
    first_name: spec.firstName,
    last_name: spec.lastName,
    profile_image: spec.profileImage,
    headline: spec.title,
  };

  return {
    id: spec.commentId,
    user_vote: null,
    awarded_bounty_amount: null,
    bounty_creator_id: null,
    created_by: {
      id: spec.userId,
      author_profile: authorProfile,
      editor_of: [],
      is_verified: true,
      first_name: spec.firstName,
      last_name: spec.lastName,
    },
    thread: {
      id: spec.threadId,
      content_type: { app_label: 'researchhub_document', model: 'researchhubpost' },
      privacy_type: 'PUBLIC',
      object_id: spec.commentId,
      thread_type: 'REVIEW',
      anchor: null,
    },
    children_count: 0,
    children: [],
    purchases: [],
    bounties: [],
    review: {
      id: spec.reviewId,
      score: spec.score,
      object_id: spec.commentId,
      is_assessed: true,
    },
    parent: null,
    created_date: createdDate,
    updated_date: createdDate,
    is_public: true,
    is_removed: false,
    is_removed_date: null,
    score: 0,
    context_title: null,
    comment_content_json: buildReviewDoc(spec),
    comment_content_type: 'TIPTAP',
    is_accepted_answer: null,
    comment_type: 'REVIEW',
    updated_by: spec.userId,
  };
}

const REVIEW_SPECS: ExpertReviewSpec[] = [
  {
    commentId: 990201,
    reviewId: 990301,
    threadId: 990401,
    userId: 990501,
    authorProfileId: 990601,
    firstName: 'Qingyu',
    lastName: 'Luo, MD, PhD',
    title: 'Associate Editor',
    profileImage: 'https://www.researchhub.com/people/qingyu.jpeg',
    daysAgo: 2,
    score: 5,
    overallSummary:
      'This proposal presents a highly focused, data-driven approach to identify an extracellular matrix (ECM) receptor program that arrests oligodendrocyte maturation in Multiple Sclerosis. The PI will apply a sophisticated computational pipeline to three existing single-nucleus RNA-seq atlases, directly answering the RFP\u2019s call to target the lesion microenvironment as a barrier to repair. The study design is rigorous, featuring a leave-one-out cross-atlas validation with a strict AUROC threshold of 0.75 and an innovative in-silico perturbation step using CellOracle to rank therapeutic targets. The budget ($5,000) and timeline (6 months) are exceptionally well-justified for a secondary data analysis. The PI has a strong track record with the exact methods and datasets proposed. Overall, this is an outstanding, cost-effective pilot project that perfectly aligns with the funder\u2019s goals and open-science mandates.',
    overallRationale:
      'The proposal perfectly matches the RFP focus on the ECM barrier to remyelination. It leverages existing data and proven computational methods to deliver a ranked therapeutic target. The rigorous statistical bars and low budget make it an exceptionally high-yield investment.',
    categories: [
      {
        label: 'Overall Impact',
        rationale:
          'The work is poised to deliver a high-impact, validated receptor target for MS remyelination. By requiring the signature to transfer across independent atlases, the proposal ensures the findings represent a shared biological brake rather than a cohort artifact.',
        items: [
          {
            label: 'Novelty',
            decision: 'Yes',
            justification:
              'The cross-atlas transfer learning approach and the inclusion of a stroke atlas for cross-species validation provide a highly novel computational angle on a known biological problem.',
          },
          {
            label: 'Rigor',
            decision: 'Yes',
            justification:
              'The applicant pre-specifies a strict AUROC bar of 0.75 for cross-dataset transfer and utilizes empirical nulls and leave-one-out designs to ensure statistical rigor.',
          },
          {
            label: 'Reproducibility',
            decision: 'Yes',
            justification:
              'The proposal is deeply committed to reproducibility, promising open code, public datasets, preregistration on ResearchHub, and release of processed intermediate objects.',
          },
          {
            label: 'Field Impact',
            decision: 'Yes',
            justification:
              'Providing a ranked, annotated receptor that acts as an ECM brake will directly inform and accelerate preclinical therapeutic testing for MS repair.',
          },
        ],
      },
      {
        label: 'Importance, Significance & Innovation',
        rationale:
          'The proposal addresses the exact core priority of the RFP: understanding the fibrotic ECM as a barrier to MS repair. The hypothesis is grounded in strong literature, and the use of regulatory in-silico perturbation is highly innovative.',
        items: [
          {
            label: 'Hypothesis Strength',
            decision: 'Yes',
            justification:
              'The core hypothesis that stromal cells send fibrotic-ECM signals that arrest oligodendrocyte differentiation is biologically plausible and well-supported by prior in vivo studies cited by the applicant.',
          },
          {
            label: 'Work Novelty',
            decision: 'Yes',
            justification:
              'Using CellOracle to model the transition from arrested OPCs to myelinating cells and testing in-silico knockdowns is a highly innovative use of single-cell gene regulatory networks.',
          },
          {
            label: 'Question Importance',
            decision: 'Yes',
            justification:
              'Overcoming remyelination failure is the central challenge in MS neurobiology, and targeting the inhibitory lesion microenvironment is explicitly requested by the funding opportunity.',
          },
          {
            label: 'Advances Knowledge',
            decision: 'Yes',
            justification:
              'The project will decisively show whether a common transcriptional ECM-receptor signature exists across different human MS cohorts and even distinct white-matter injuries.',
          },
        ],
      },
      {
        label: 'Rigor & Feasibility',
        rationale:
          'The project is highly feasible. The PI has published the primary datasets and applied the identical toolset in recent papers. The 6-month timeline and compute budget are perfectly scaled for this secondary analysis.',
        items: [
          {
            label: 'Study Design',
            decision: 'Yes',
            justification:
              'Subclustering the lineage, building pseudotime trajectories, and evaluating signature reproducibility via leave-one-out cross-validation is an exceptionally well-structured study design.',
          },
          {
            label: 'Methodology',
            decision: 'Yes',
            justification:
              'The planned tools are industry standard. The applicant wisely includes a benchmark to ensure CellOracle recovers the pseudotime trajectory before ranking targets.',
          },
          {
            label: 'Timeline Feasibility',
            decision: 'Yes',
            justification:
              'A 6-month timeline to reprocess roughly 240,000 nuclei across three existing datasets is highly realistic, especially since the PI already controls and understands the stroke atlas.',
          },
          {
            label: 'Team Qualifications',
            decision: 'Yes',
            justification:
              'The PI is uniquely qualified, having generated the replication stroke dataset and published recent single-nucleus studies utilizing the exact cell-cell communication frameworks proposed.',
          },
          {
            label: 'Research Environment',
            decision: 'Yes',
            justification:
              'The allocation for high-memory cloud instances ensures the computational environment will be adequate for integrating large-scale single-nucleus datasets.',
          },
          {
            label: 'Budget Appropriateness',
            decision: 'Yes',
            justification:
              'The $5,000 budget is strictly limited to necessary cloud compute, storage, and publication fees, perfectly matching the RFP guidance for secondary analysis proposals.',
          },
        ],
      },
      {
        label: 'Additional Review Criteria',
        rationale:
          'The proposal excels in open science compliance, committing to preregistration and open data sharing. Human subjects and COI are adequately handled through the use of established public datasets.',
        items: [
          {
            label: 'Human/Animal Protections',
            decision: 'Yes',
            justification:
              'The proposal relies entirely on published, open-access, de-identified human and murine single-nucleus atlases, mitigating primary collection risks.',
          },
          {
            label: 'Resubmission Critiques Addressed',
            decision: 'Partial',
            justification:
              'Not applicable as this is a new submission, but evaluated as partial to reflect the lack of prior critiques to address.',
          },
          {
            label: 'Open Science Adherence',
            decision: 'Yes',
            justification:
              'The proposal explicitly commits to the RFP requirements: preregistration on ResearchHub, open code/data release, and preprint posting.',
          },
          {
            label: 'AI Use Disclosed',
            decision: 'Partial',
            justification:
              'The proposal does not explicitly discuss the use of generative AI in writing or coding, though standard machine learning packages are cited.',
          },
          {
            label: 'Conflicts of Interest Disclosed',
            decision: 'Partial',
            justification:
              'No explicit COI statement is provided, though the PI transparently notes their authorship of one of the utilized datasets.',
          },
        ],
      },
    ],
  },
  {
    commentId: 990202,
    reviewId: 990302,
    threadId: 990402,
    userId: 990502,
    authorProfileId: 990602,
    firstName: 'Attila',
    lastName: 'Karsi, PhD',
    title: 'Reviewer',
    profileImage: 'https://www.researchhub.com/people/attila.jpeg',
    daysAgo: 3,
    score: 4,
    overallSummary:
      "A single-investigator computational proposal that reanalyzes three open snRNA-seq atlases (two human MS lesion atlases plus the applicant's mouse stroke atlas) to test whether a fibrotic-ECM receptor-signaling module distinguishes arrested from myelinating oligodendrocyte-lineage nuclei, and whether that module transfers between independent human atlases at AUROC >= 0.75. It fits the RFP's explicit interest in the ECM/lesion microenvironment as a barrier to repair and in computational reanalysis of existing data. Main strengths are a falsifiable, preregistered design with pre-specified thresholds, permutation nulls, batch correction, and gating benchmarks, plus strong open-science practices and a budget matched to the seed award. Main risks are that the work is purely in-silico with experimental validation deferred, the key human-to-human transfer rests on only two atlases, and AI-use and conflict-of-interest disclosures are absent.",
    overallRationale:
      'The proposal is well-scoped, hypothesis-driven, and closely aligned with the RFP, with rigorous pre-specified criteria and exemplary reproducibility practices. It stays a promising pilot rather than a confirmatory advance because it is entirely computational, validation of the ranked receptor is out of scope, and the central reproducibility claim is tested across just two human datasets. Averaging the four category scores of 4 yields an overall of 4.',
    categories: [
      {
        label: 'Overall Impact',
        rationale:
          'Reframing known ECM inhibition of remyelination as a quantitative, transferable readout of lineage arrest is a useful analytic contribution, and the rigor and reproducibility plans are strong. Field impact is real but contingent: a computational readout still needs experimental validation, which the proposal defers.',
        items: [
          {
            label: 'Novelty',
            decision: 'Partial',
            justification:
              'Novelty is in the analytic framing - treating stromal-ECM receptor signaling as a classifier of arrest along a pseudotime trajectory that the source atlases did not perform - rather than new biology; it builds on established matrix-inhibition findings (Lau 2012, Keough 2016).',
          },
          {
            label: 'Rigor',
            decision: 'Yes',
            justification:
              'Pre-specified AUROC bar of 0.75, empirical nulls from label-permuted modules and matched-size random gene sets, Harmony batch correction, and gating benchmarks in Aims 2 and 3 indicate a disciplined, falsifiable design.',
          },
          {
            label: 'Reproducibility',
            decision: 'Yes',
            justification:
              'Uses open GEO datasets, commits to preregistration, open code, processed objects, a persistent-identifier archive, and a preprint, so the analysis is designed to be independently reproducible.',
          },
          {
            label: 'Field Impact',
            decision: 'Partial',
            justification:
              'A transferable arrest signature would be a valuable lesion-agnostic readout, but impact is conditional on a positive transfer and on downstream experimental validation that lies outside this budget.',
          },
        ],
      },
      {
        label: 'Importance, Significance & Innovation',
        rationale:
          'The central question - why oligodendrocyte precursors stall and fail to remyelinate in MS - is important and squarely on the RFP theme, and the hypothesis is sharply falsifiable. Novelty and knowledge gain are moderated by reliance on existing data and known biology and by the contingent nature of the result.',
        items: [
          {
            label: 'Hypothesis Strength',
            decision: 'Yes',
            justification:
              'The hypothesis is specific and falsifiable, with explicit refutation criteria: a module that fails human-to-human transfer above the preset bar refutes the shared-brake claim and indicates cohort-specific signal.',
          },
          {
            label: 'Work Novelty',
            decision: 'Partial',
            justification:
              'The receptor-signaling classifier applied to these atlases is new, but the work repurposes published datasets and established matrix-inhibition biology rather than generating new experimental observations.',
          },
          {
            label: 'Question Importance',
            decision: 'Yes',
            justification:
              'Remyelination failure and the ECM brake on OPC maturation are core to the field and named priorities in the RFP objective and suggested topics.',
          },
          {
            label: 'Advances Knowledge',
            decision: 'Partial',
            justification:
              'Either outcome is informative, but a purely computational, secondary-data result yields a candidate readout and ranked receptor rather than confirmed mechanism, so the knowledge gain is real but bounded.',
          },
        ],
      },
      {
        label: 'Rigor & Feasibility',
        rationale:
          'Study design and execution plan are strong: appropriate established tools, pre-specified thresholds, nulls, and self-gating benchmarks, on a realistic six-month timeline with a well-justified budget. The main limitations are the two-atlas basis for the key transfer test and a thinly described compute environment.',
        items: [
          {
            label: 'Study Design',
            decision: 'Yes',
            justification:
              'The leave-one-out cross-atlas transfer with permutation null, plus benchmark gates that must be met before CellOracle output is trusted, is a coherent and self-checking design.',
          },
          {
            label: 'Methodology',
            decision: 'Partial',
            justification:
              'Slingshot, RNA-velocity, CellChat, Harmony, and CellOracle are appropriate and standard, but the central reproducibility claim rests on only two human atlases, so leave-one-out effectively trains on one and tests on one, a weak basis for a generalizable brake.',
          },
          {
            label: 'Timeline Feasibility',
            decision: 'Yes',
            justification:
              'Six months to reprocess ~240,000 nuclei across three datasets and run subclustering, CellChat, transfer testing, and CellOracle is realistic for an experienced computational group with milestones tied to each aim.',
          },
          {
            label: 'Team Qualifications',
            decision: 'Yes',
            justification:
              'The applicant generated and controls the stroke atlas and has published the snRNA-seq, gene-set enrichment, and CellChat workflows the project extends, evidencing relevant methodological competence; Harmony integration and CellOracle are new but run against published references.',
          },
          {
            label: 'Research Environment',
            decision: 'Partial',
            justification:
              'Compute is described only as high-memory cloud instances with object storage; open datasets and ResearchHub are named, but institutional infrastructure and collaborator support for the deferred iPSC step are not detailed.',
          },
          {
            label: 'Budget Appropriateness',
            decision: 'Yes',
            justification:
              'The $5,000 request is itemized (about $4,200 compute and storage, $500 archive, $300 figures) and matched to a secondary-analysis scope the RFP explicitly anticipates funding at a few thousand dollars.',
          },
        ],
      },
      {
        label: 'Additional Review Criteria',
        rationale:
          'Open-science commitments are exemplary and human-subjects concerns are minimal because the work reuses published de-identified open data. The category is held back by the absence of explicit AI-use and conflict-of-interest disclosures, and there is no resubmission history to assess.',
        items: [
          {
            label: 'Human/Animal Protections',
            decision: 'Yes',
            justification:
              'The project reanalyzes already-published, openly available de-identified snRNA-seq data (GEO accessions and an open browser cited); no new human or animal experimentation occurs, and the iPSC test is flagged as an out-of-scope future step.',
          },
          {
            label: 'Resubmission Critiques Addressed',
            decision: 'Partial',
            justification:
              'There is no indication this is a resubmission, so no prior critiques are available to assess; the item cannot be affirmatively verified from the text.',
          },
          {
            label: 'Open Science Adherence',
            decision: 'Yes',
            justification:
              "The plan commits to ResearchHub preregistration, monthly public progress updates, an open-license code repository, shared processed objects, a persistent-identifier data archive, and a preprint, meeting the RFP's open-access requirements.",
          },
          {
            label: 'AI Use Disclosed',
            decision: 'Partial',
            justification:
              'The proposal describes computational and in-silico methods but contains no statement disclosing whether AI-assisted tools were used in the analysis or writing, so disclosure cannot be confirmed.',
          },
          {
            label: 'Conflicts of Interest Disclosed',
            decision: 'Partial',
            justification:
              'The applicant transparently notes they generated and control one of the datasets, but there is no formal conflict-of-interest statement addressing self-citation or use of self-produced data.',
          },
        ],
      },
    ],
  },
  {
    commentId: 990203,
    reviewId: 990303,
    threadId: 990403,
    userId: 990503,
    authorProfileId: 990603,
    firstName: 'Scott',
    lastName: 'Nelson, PhD',
    title: 'Reviewer',
    profileImage: 'https://www.researchhub.com/people/scott.jpeg',
    daysAgo: 4,
    score: 4,
    overallSummary:
      'This proposal tests whether fibrotic extracellular-matrix signaling defines oligodendrocyte differentiation arrest across human MS lesion atlases, with a secondary stroke-atlas check and receptor ranking. It fits the RFP very well because it targets ECM barriers, stalled myelin-producing cells, therapeutic target prioritization, and data-driven reanalysis. The strongest feature is a prespecified cross-atlas validation design; the main limitation is that all target prioritization is in silico and experimental testing is outside the budget.',
    overallRationale:
      'Scores reflect strong RFP fit, a falsifiable cross-atlas validation plan, feasible use of open datasets, and credible computational experience. The rating is limited by reliance on inferred cell-cell signaling and in-silico perturbation without experimental validation, plus incomplete compliance disclosures. Grounded in the supplied rubric, proposal, and RFP.',
    categories: [
      {
        label: 'Overall Impact',
        rationale:
          'The work is likely to generate useful pilot evidence for an ECM-linked arrest signature in MS lesions if the transfer test succeeds. Impact is moderated because the proposal produces a computational readout and ranked receptor rather than direct functional proof.',
        items: [
          {
            label: 'Novelty',
            decision: 'Yes',
            justification:
              'The proposal reframes published MS atlases around a transferable fibrotic-ECM receptor module rather than only describing lesion niches or inflammatory axes.',
          },
          {
            label: 'Rigor',
            decision: 'Partial',
            justification:
              'The AUROC bar, held-out atlas test, permutation null, and random gene-set controls are strong, but CellChat and CellOracle outputs remain inferential and sensitive to preprocessing assumptions.',
          },
          {
            label: 'Reproducibility',
            decision: 'Yes',
            justification:
              'The plan includes preregistration, predefined benchmarks, open code, processed objects, monthly updates, and a public archive with a persistent identifier.',
          },
          {
            label: 'Field Impact',
            decision: 'Partial',
            justification:
              'A transferable signature could inform biomarkers or target selection, but the proposal does not test remyelination rescue or receptor function experimentally within this project.',
          },
        ],
      },
      {
        label: 'Importance, Significance & Innovation',
        rationale:
          'The biological question is highly aligned with the RFP and addresses an important barrier to MS repair. Innovation is meaningful but mostly analytic, since the project reuses existing datasets and established computational tools.',
        items: [
          {
            label: 'Hypothesis Strength',
            decision: 'Yes',
            justification:
              'The hypothesis is specific and falsifiable: an ECM-receptor module should transfer across independent human MS lesion atlases above a preset AUROC bar.',
          },
          {
            label: 'Work Novelty',
            decision: 'Partial',
            justification:
              'The cross-atlas transfer framing is novel, but the datasets and major tools are published or established rather than newly developed.',
          },
          {
            label: 'Question Importance',
            decision: 'Yes',
            justification:
              'The proposal directly targets why OPCs persist but fail to mature in MS lesions, a central problem highlighted by the RFP.',
          },
          {
            label: 'Advances Knowledge',
            decision: 'Partial',
            justification:
              'A positive result would sharpen a candidate readout of remyelination competence, but negative or ambiguous transfer could leave mechanism and causality unresolved.',
          },
        ],
      },
      {
        label: 'Rigor & Feasibility',
        rationale:
          'The project is well scoped for a small computational award, with open datasets, explicit milestones, and prespecified failure gates. Main feasibility risks are technical: atlas harmonization, pseudotime validity, and in-silico perturbation reliability.',
        items: [
          {
            label: 'Study Design',
            decision: 'Yes',
            justification:
              'The three aims form a coherent design from lineage mapping to held-out validation to receptor ranking, with a stated rule that failed transfer refutes the shared-program claim.',
          },
          {
            label: 'Methodology',
            decision: 'Partial',
            justification:
              'Slingshot, RNA velocity, Harmony, CellChat, and CellOracle are appropriate for the question, but the proposal gives limited detail on sensitivity analyses, lesion-stage imbalance, and cell-count thresholds.',
          },
          {
            label: 'Timeline Feasibility',
            decision: 'Yes',
            justification:
              'A six-month plan is plausible because the work uses existing open snRNA-seq resources and has month-by-month milestones for reprocessing, transfer testing, receptor ranking, and release.',
          },
          {
            label: 'Team Qualifications',
            decision: 'Yes',
            justification:
              'The applicant describes prior generation of the stroke atlas and prior use of single-nucleus clustering, gene-set enrichment, and CellChat-like ligand-receptor analysis.',
          },
          {
            label: 'Research Environment',
            decision: 'Partial',
            justification:
              'The proposal supports access to relevant data and computational experience, but it provides little detail on institutional infrastructure, collaborators, or support for later experimental validation.',
          },
          {
            label: 'Budget Appropriateness',
            decision: 'Yes',
            justification:
              'The budget is detailed and proportionate: about $4,200 for compute and storage, $500 for archiving, and $300 for figures and documentation.',
          },
        ],
      },
      {
        label: 'Additional Review Criteria',
        rationale:
          'Open-science plans are strong and match the RFP. Compliance documentation is otherwise incomplete: the proposal does not explicitly address secondary-use protections, AI use, conflicts, or resubmission status.',
        items: [
          {
            label: 'Human/Animal Protections',
            decision: 'Partial',
            justification:
              'The project uses public human MS atlases and a murine stroke atlas, but it does not explicitly discuss human-subjects secondary-use status, consent, IRB exemption, or animal-study provenance.',
          },
          {
            label: 'Resubmission Critiques Addressed',
            decision: 'Partial',
            justification:
              'The text does not present the application as a resubmission, so there are no prior critiques to evaluate under this item.',
          },
          {
            label: 'Open Science Adherence',
            decision: 'Yes',
            justification:
              'The proposal commits to preregistration, monthly ResearchHub progress posts, open-license sharing of processed data and code, a public archive, and a preprint.',
          },
          {
            label: 'AI Use Disclosed',
            decision: 'No',
            justification:
              'The proposal does not state whether AI-assisted writing, analysis, or methods were used.',
          },
          {
            label: 'Conflicts of Interest Disclosed',
            decision: 'No',
            justification:
              'The proposal does not include a conflicts-of-interest disclosure or management statement.',
          },
        ],
      },
    ],
  },
];

/**
 * Raw API-shaped review comment objects for the demo proposal, ready to be
 * fed straight into `transformComment` alongside real API results.
 */
export function getDemoExpertReviewRawComments(): any[] {
  return REVIEW_SPECS.map(buildRawComment);
}

/**
 * The same demo reviews shaped as `PeerReview` objects for the proposal
 * sidebar's "Peer Reviews" summary section. `authorProfile.id` is intentionally
 * 0 so avatars render as plain images without hover-fetching an author profile.
 */
export function getDemoExpertPeerReviews(): PeerReview[] {
  const now = Date.now();

  return REVIEW_SPECS.map((spec) => ({
    id: spec.commentId,
    createdBy: {
      id: spec.userId,
      authorProfile: {
        id: 0,
        fullName: `${spec.firstName} ${spec.lastName}`,
        profileImage: spec.profileImage,
        isVerified: true,
      },
    },
    score: spec.score,
    createdDate: new Date(now - spec.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    isAssessed: true,
  }));
}

// -- Display overrides for the demo proposal --------------------------------
// The proposal already has one real, backend-generated review from the AI
// reviewer account (identified by `NEXT_PUBLIC_AI_REVIEW_USER_ID`, the same
// env var `FeedItemComment` uses to detect it). For this demo it's rebranded
// as "AI Review" with a dedicated avatar and a verified badge, and the whole
// review list is reordered so Attila's review leads, followed by the AI
// review, then the rest in their original order.

const AI_REVIEWER_USER_ID = process.env.NEXT_PUBLIC_AI_REVIEW_USER_ID;
const AI_REVIEWER_FIRST_NAME = 'AI';
const AI_REVIEWER_LAST_NAME = 'Review';
const AI_REVIEWER_AVATAR =
  'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a';

function isAiReviewerUserId(userId: unknown): boolean {
  return AI_REVIEWER_USER_ID != null && String(userId ?? '') === String(AI_REVIEWER_USER_ID);
}

/** Full names listed first, in this order; everything else keeps its relative order after them. */
const DEMO_REVIEW_PRIORITY_ORDER = ['Attila Karsi, PhD', `${AI_REVIEWER_FIRST_NAME} ${AI_REVIEWER_LAST_NAME}`];

function reorderByPriority<T>(items: T[], getName: (item: T) => string): T[] {
  const rest: T[] = [];
  const byName = new Map<string, T[]>();

  items.forEach((item) => {
    const name = getName(item);
    if (DEMO_REVIEW_PRIORITY_ORDER.includes(name)) {
      const bucket = byName.get(name) ?? [];
      bucket.push(item);
      byName.set(name, bucket);
    } else {
      rest.push(item);
    }
  });

  const ordered = DEMO_REVIEW_PRIORITY_ORDER.flatMap((name) => byName.get(name) ?? []);
  return [...ordered, ...rest];
}

/**
 * Rebrands the real AI-reviewer review (raw API comment shape) as "AI Review"
 * with a new avatar and verified badge, then reorders the list per
 * `DEMO_REVIEW_PRIORITY_ORDER`. No-op for any comment that isn't the AI review.
 */
export function applyDemoReviewOverrides(rawComments: any[]): any[] {
  const overridden = rawComments.map((raw) => {
    const createdBy = raw?.created_by;
    if (!isAiReviewerUserId(createdBy?.id)) return raw;

    const authorProfile = createdBy?.author_profile;
    return {
      ...raw,
      created_by: {
        ...createdBy,
        first_name: AI_REVIEWER_FIRST_NAME,
        last_name: AI_REVIEWER_LAST_NAME,
        is_verified: true,
        author_profile: authorProfile
          ? {
              ...authorProfile,
              first_name: AI_REVIEWER_FIRST_NAME,
              last_name: AI_REVIEWER_LAST_NAME,
              profile_image: AI_REVIEWER_AVATAR,
              is_verified: true,
            }
          : authorProfile,
      },
    };
  });

  return reorderByPriority(
    overridden,
    (raw) => `${raw?.created_by?.first_name ?? ''} ${raw?.created_by?.last_name ?? ''}`.trim()
  );
}

/**
 * Same rebrand + reorder as `applyDemoReviewOverrides`, for the already
 * transformed `PeerReview[]` list used by the proposal sidebar.
 */
export function applyDemoPeerReviewOverrides(peerReviews: PeerReview[]): PeerReview[] {
  const overridden = peerReviews.map((review) => {
    if (!isAiReviewerUserId(review.createdBy.id)) return review;

    return {
      ...review,
      createdBy: {
        ...review.createdBy,
        authorProfile: {
          ...review.createdBy.authorProfile,
          fullName: `${AI_REVIEWER_FIRST_NAME} ${AI_REVIEWER_LAST_NAME}`,
          profileImage: AI_REVIEWER_AVATAR,
          isVerified: true,
        },
      },
    };
  });

  return reorderByPriority(overridden, (review) => review.createdBy.authorProfile.fullName);
}
