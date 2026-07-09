import { ApiClient } from './client';
import { FeedEntry, FeedApiResponse, transformFeedEntry, RawApiFeedEntry } from '@/types/feed';
import { Bounty, BountyType, transformBounty } from '@/types/bounty';
import { transformUser, User } from '@/types/user';
import { transformAuthorProfile } from '@/types/authorProfile';
import { Fundraise, transformFundraise } from '@/types/funding';

export class FeedService {
  private static readonly BASE_PATH = '/api/feed';
  private static readonly FUNDING_PATH = '/api/funding_feed';
  private static readonly GRANT_PATH = '/api/grant_feed';
  private static readonly PENDING_MODERATION_PATH = '/api/moderator_feed/pending_moderation';

  static async getFeed(params?: {
    page?: number;
    pageSize?: number;
    feedView?: 'popular' | 'following' | 'latest' | 'personalized' | string;
    hubSlug?: string;
    contentType?: string;
    source?: 'all' | 'researchhub';
    endpoint?: 'feed' | 'funding_feed' | 'grant_feed' | 'pending_moderation';
    fundraiseStatus?: 'OPEN' | 'CLOSED';
    grantId?: number;
    createdBy?: number;
    ordering?: string;
    includeHotScoreBreakdown?: boolean;
    filter?: string;
    status?: string;
    userId?: string;
    viewAsUserId?: number;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.feedView) queryParams.append('feed_view', params.feedView);
    if (params?.hubSlug) queryParams.append('hub_slug', params.hubSlug);
    if (params?.contentType) queryParams.append('content_type', params.contentType);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.fundraiseStatus) queryParams.append('fundraise_status', params.fundraiseStatus);
    if (params?.grantId) queryParams.append('grant_id', params.grantId.toString());
    if (params?.createdBy) queryParams.append('created_by', params.createdBy.toString());

    if (params?.ordering) {
      queryParams.append('ordering', params.ordering);
    }
    if (params?.includeHotScoreBreakdown) {
      queryParams.append('include_hot_score_breakdown', 'true');
    }
    if (params?.filter) queryParams.append('filter', params.filter);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userId) queryParams.append('user_id', params.userId);
    if (params?.viewAsUserId) {
      queryParams.append('view_as_user_id', params.viewAsUserId.toString());
    }

    // Determine which endpoint to use
    const endpointToPath: Record<string, string> = {
      funding_feed: this.FUNDING_PATH,
      grant_feed: this.GRANT_PATH,
      pending_moderation: this.PENDING_MODERATION_PATH,
    };
    const basePath = endpointToPath[params?.endpoint ?? ''] ?? this.BASE_PATH;
    const url = `${basePath}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      // Use ApiClient for both server and client environments
      const isServer = typeof window === 'undefined';
      console.log(`Fetching feed from URL: ${url} (${isServer ? 'server-side' : 'client-side'})`);

      let response: FeedApiResponse;

      if (params?.createdBy) {
        response = {
          next: 'https://api.researchhub.com/api/grant_feed/?content_type=GRANT&created_by=39602&page=2&page_size=20',
          previous: null,
          results: [
            {
              id: 32331,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 32331,
                slug: 'neurodevelopmental-and-neuropsychiatric-conditions',
                title: 'Neurodevelopmental and neuropsychiatric conditions',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/66a8e43e-d340-4c15-81db-7759c060271b/screenshot-2026-06-09-at-9.png',
                unified_document_id: 9280651,
                grant: {
                  id: 316,
                  status: 'OPEN',
                  amount: {
                    usd: 10000,
                    rsc: 124904.2685285593,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: null,
                  is_expired: false,
                  is_active: true,
                  application_count: 7,
                  applications: [
                    {
                      applicant: {
                        id: 7876376,
                        first_name: 'James',
                        last_name: 'Marsh',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/03/blob_outhuJU',
                        headline: 'Lead Researcher at Mental Wealth Academy',
                      },
                      preregistration_post_id: 32335,
                      fundraise: {
                        id: 879,
                        title: 'Community Intelligence Network (CIN)',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18127,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 65,
                        status: 'completed',
                        tldr: "A 12-month pilot (n=100) testing whether a community-governed, privacy-preserving federated platform (CIN) plus a conversational interface (BLUE) can track links between financial stress and anxiety/depression (GAD-7, PHQ-9). Fits the RFP's anxiety/mood priorities and has a strong safety protocol, but lacks power analysis, IRB/team details, budget, and federated model specifics.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 11.997410411015153,
                        created_date: '2026-06-12T22:50:22.581236Z',
                        updated_date: '2026-06-20T04:25:06.249791Z',
                        items: [
                          {
                            id: 1756,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              "Targets anxiety and mood disorders in underserved populations using validated instruments (GAD-7, PHQ-9), directly matching the funder's stated priorities.",
                            order: 0,
                            created_date: '2026-06-20T04:25:06.255264Z',
                            updated_date: '2026-06-20T04:25:06.255275Z',
                          },
                          {
                            id: 1757,
                            item_type: 'strength',
                            label: 'Safety Protocol',
                            description:
                              'Clear suicide-risk pathway via PHQ-9 Item 9 monitoring, 988 routing, and clinician escalation, with explicit withdrawal and data-sovereignty rights.',
                            order: 1,
                            created_date: '2026-06-20T04:25:06.255298Z',
                            updated_date: '2026-06-20T04:25:06.255302Z',
                          },
                          {
                            id: 1758,
                            item_type: 'strength',
                            label: 'Infrastructure Novelty',
                            description:
                              'Integrates federated analytics, personal data stores, and smart-contract compensation for behavioral health, an uncommon combination in deployment.',
                            order: 2,
                            created_date: '2026-06-20T04:25:06.255313Z',
                            updated_date: '2026-06-20T04:25:06.255315Z',
                          },
                          {
                            id: 1759,
                            item_type: 'strength',
                            label: 'Appropriate Analyses',
                            description:
                              'Names suitable longitudinal methods (mixed-effects, growth-curve, Kaplan-Meier) and pre-deployment simulation to stress-test the federated pipeline.',
                            order: 3,
                            created_date: '2026-06-20T04:25:06.255324Z',
                            updated_date: '2026-06-20T04:25:06.255326Z',
                          },
                          {
                            id: 1760,
                            item_type: 'strength',
                            label: 'Stated Limitations',
                            description:
                              'Proposal candidly acknowledges attrition, self-report bias, device access disparities, and limited generalizability beyond the MWA community.',
                            order: 4,
                            created_date: '2026-06-20T04:25:06.255335Z',
                            updated_date: '2026-06-20T04:25:06.255338Z',
                          },
                          {
                            id: 1761,
                            item_type: 'weakness',
                            label: 'Methodological Gaps',
                            description:
                              'No power analysis, no specification of the federated model class, aggregation method, privacy budget, covariates, or missing-data handling.',
                            order: 0,
                            created_date: '2026-06-20T04:25:06.255346Z',
                            updated_date: '2026-06-20T04:25:06.255349Z',
                          },
                          {
                            id: 1762,
                            item_type: 'weakness',
                            label: 'Team And Oversight',
                            description:
                              'Lead is B.S.-level with no listed co-investigators, biostatistician, clinician, or ML engineer; no IRB of record or safety monitoring body is named.',
                            order: 1,
                            created_date: '2026-06-20T04:25:06.255357Z',
                            updated_date: '2026-06-20T04:25:06.255359Z',
                          },
                          {
                            id: 1763,
                            item_type: 'weakness',
                            label: 'No Budget',
                            description:
                              'Proposal lacks any budget, line items, or cost justification for stipends, infrastructure, or personnel, making feasibility hard to assess.',
                            order: 2,
                            created_date: '2026-06-20T04:25:06.255368Z',
                            updated_date: '2026-06-20T04:25:06.255370Z',
                          },
                          {
                            id: 1764,
                            item_type: 'weakness',
                            label: 'Conflict Of Interest',
                            description:
                              "PI's organization owns the platform being evaluated, but no COI disclosure or management plan is provided.",
                            order: 3,
                            created_date: '2026-06-20T04:25:06.255379Z',
                            updated_date: '2026-06-20T04:25:06.255381Z',
                          },
                          {
                            id: 1765,
                            item_type: 'weakness',
                            label: 'Limited Knowledge Gain',
                            description:
                              'The financial-stress to mood link is well established, and n=100 without a comparator yields mostly feasibility evidence rather than confirmatory or causal insight.',
                            order: 4,
                            created_date: '2026-06-20T04:25:06.255390Z',
                            updated_date: '2026-06-20T04:25:06.255392Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 990025,
                        first_name: 'Martina',
                        last_name: 'Rossi',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/02/blob_M6cfKAR',
                        headline: 'PhD Medical Writer | Cell Biology & Gene Therapy',
                      },
                      preregistration_post_id: 32342,
                      fundraise: {
                        id: 883,
                        title:
                          'Precision phenotyping of an autism model: unbiased discovery of fmr1-related brain phenotypes from whole-brain dynamics in fmr1 zebrafish',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18175,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 68,
                        status: 'completed',
                        tldr: "A 9-month, $10K computational reanalysis of a public fmr1 zebrafish whole-brain calcium imaging dataset (n=41) using self-supervised learning to find autism-relevant brain dynamics beyond known habituation deficits. Fits the RFP's neurodevelopmental precision-medicine focus and is rigorously preregistered, but very small n and thin ML methodological detail limit how strong any discovery claims can be.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 13.952865854022093,
                        created_date: '2026-06-15T10:32:24.030887Z',
                        updated_date: '2026-06-15T13:46:35.891022Z',
                        items: [
                          {
                            id: 1562,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              "Directly targets precision phenotyping in Fragile X, the leading monogenic cause of autism, matching the foundation's neurodevelopmental scope and individual-variation emphasis.",
                            order: 0,
                            created_date: '2026-06-15T13:46:35.896000Z',
                            updated_date: '2026-06-15T13:46:35.896011Z',
                          },
                          {
                            id: 1563,
                            item_type: 'strength',
                            label: 'Rigorous Design',
                            description:
                              'Preregistration, leave-one-animal-out CV, permutation tests, effect sizes with CIs, and explicit benchmarking against the known habituation phenotype provide strong safeguards against overfitting.',
                            order: 1,
                            created_date: '2026-06-15T13:46:35.896032Z',
                            updated_date: '2026-06-15T13:46:35.896035Z',
                          },
                          {
                            id: 1564,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to public deposition of derived measures and models, preprint dissemination, version-controlled pipelines, and explicit AI-use and COI disclosures.',
                            order: 2,
                            created_date: '2026-06-15T13:46:35.896045Z',
                            updated_date: '2026-06-15T13:46:35.896048Z',
                          },
                          {
                            id: 1565,
                            item_type: 'strength',
                            label: 'Feasible Scope',
                            description:
                              'A $10K, 9-month secondary analysis of a fixed public dataset with modest GPU needs is realistic and well-itemized, with no wet-lab dependencies.',
                            order: 3,
                            created_date: '2026-06-15T13:46:35.896057Z',
                            updated_date: '2026-06-15T13:46:35.896060Z',
                          },
                          {
                            id: 1566,
                            item_type: 'strength',
                            label: 'Informative Nulls',
                            description:
                              'Authors explicitly frame negative results as useful, since they would constrain claims of structured heterogeneity and added value of self-supervised features over habituation scores.',
                            order: 4,
                            created_date: '2026-06-15T13:46:35.896068Z',
                            updated_date: '2026-06-15T13:46:35.896070Z',
                          },
                          {
                            id: 1567,
                            item_type: 'weakness',
                            label: 'Small Sample',
                            description:
                              'Only 41 larvae (10 WT, 20 het, 11 KO) sharply limits power for subtype discovery and dosage-gradient claims, as the authors acknowledge.',
                            order: 0,
                            created_date: '2026-06-15T13:46:35.896078Z',
                            updated_date: '2026-06-15T13:46:35.896081Z',
                          },
                          {
                            id: 1568,
                            item_type: 'weakness',
                            label: 'Vague ML Methods',
                            description:
                              'The self-supervised architecture, training objective, hyperparameter selection, and feature-attribution approach are not specified beyond a CEBRA citation, weakening methodological transparency.',
                            order: 1,
                            created_date: '2026-06-15T13:46:35.896089Z',
                            updated_date: '2026-06-15T13:46:35.896091Z',
                          },
                          {
                            id: 1569,
                            item_type: 'weakness',
                            label: 'PI Track Record',
                            description:
                              "Per the AI review, the PI's publication record is in cell biology and gene therapy rather than zebrafish imaging or ML; core domain expertise rests on collaborators whose commitments are only briefly outlined.",
                            order: 2,
                            created_date: '2026-06-15T13:46:35.896099Z',
                            updated_date: '2026-06-15T13:46:35.896102Z',
                          },
                          {
                            id: 1570,
                            item_type: 'weakness',
                            label: 'Single Dataset',
                            description:
                              'Reliance on one public dataset limits generalizability; any discovered fmr1-related features cannot be externally validated within this project.',
                            order: 3,
                            created_date: '2026-06-15T13:46:35.896110Z',
                            updated_date: '2026-06-15T13:46:35.896112Z',
                          },
                          {
                            id: 1571,
                            item_type: 'weakness',
                            label: 'Incremental Novelty',
                            description:
                              'Self-supervised analysis of whole-brain calcium imaging is an established direction, so novelty is mainly in the specific reanalysis and dosage-gradient framing rather than methodological innovation.',
                            order: 4,
                            created_date: '2026-06-15T13:46:35.896121Z',
                            updated_date: '2026-06-15T13:46:35.896123Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 7964166,
                        first_name: 'Ruslan',
                        last_name: 'Kurmashev',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/21/blob_URDbsq1',
                        headline: 'MSc in Computational Biology | MD',
                      },
                      preregistration_post_id: 32378,
                      fundraise: {
                        id: 904,
                        title:
                          'Do Pediatric Autism Microbiome Biomarkers Survive Stricter Validation?',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18252,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 76,
                        status: 'completed',
                        tldr: "Preregistered secondary-analysis benchmark testing whether published pediatric ASD 16S stool microbiome classifiers retain signal under leave-one-dataset-out and family-aware validation, fitting the RFP's neurodevelopmental scope. Strength: rigorous, leakage-controlled design with prespecified evidence grading. Weakness: only two firmly confirmed external datasets and a solo early-career PI limit generalizability.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 12.96323700499488,
                        created_date: '2026-06-19T15:59:27.517598Z',
                        updated_date: '2026-06-19T15:59:40.487099Z',
                        items: [
                          {
                            id: 1736,
                            item_type: 'strength',
                            label: 'Rigorous Validation Design',
                            description:
                              'Preregistration, frozen preprocessing, nested CV, leave-one-dataset-out testing, dataset-label negative controls, and Delta AUROC endpoint reflect careful leakage control and methodological discipline.',
                            order: 0,
                            created_date: '2026-06-19T15:59:40.490727Z',
                            updated_date: '2026-06-19T15:59:40.490738Z',
                          },
                          {
                            id: 1737,
                            item_type: 'strength',
                            label: 'Translational Relevance',
                            description:
                              'Directly addresses whether ASD microbiome biomarkers are transportable, a timely question that informs translational prioritization and curbs premature biomarker claims.',
                            order: 1,
                            created_date: '2026-06-19T15:59:40.490760Z',
                            updated_date: '2026-06-19T15:59:40.490763Z',
                          },
                          {
                            id: 1738,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to preregistration, open code, notebooks, harmonized metadata, exclusion logs, and an evidence map, producing reusable community resources even under null results.',
                            order: 2,
                            created_date: '2026-06-19T15:59:40.490773Z',
                            updated_date: '2026-06-19T15:59:40.490776Z',
                          },
                          {
                            id: 1739,
                            item_type: 'strength',
                            label: 'Realistic Scope',
                            description:
                              'Six-month timeline and USD 10,000 budget are proportionate to a secondary analysis, with itemized costs and explicit fallback rules for metadata or dataset shortfalls.',
                            order: 3,
                            created_date: '2026-06-19T15:59:40.490785Z',
                            updated_date: '2026-06-19T15:59:40.490787Z',
                          },
                          {
                            id: 1740,
                            item_type: 'strength',
                            label: 'Prespecified Grading',
                            description:
                              'Evidence-grading rules (robust, fragile, non-replicating, indeterminate) with quantitative thresholds reduce interpretive flexibility and overclaiming.',
                            order: 4,
                            created_date: '2026-06-19T15:59:40.490796Z',
                            updated_date: '2026-06-19T15:59:40.490798Z',
                          },
                          {
                            id: 1741,
                            item_type: 'weakness',
                            label: 'Limited Datasets',
                            description:
                              'Confirmatory benchmark relies on only two public 16S datasets (Ding 2020, Zou 2020), constraining transportability conclusions to a narrow two-domain comparison.',
                            order: 0,
                            created_date: '2026-06-19T15:59:40.490806Z',
                            updated_date: '2026-06-19T15:59:40.490809Z',
                          },
                          {
                            id: 1742,
                            item_type: 'weakness',
                            label: 'Solo Early-Career PI',
                            description:
                              'Single investigator with a thin independent publication record and no co-investigator team; paid consultation and external review partially but not fully mitigate this risk.',
                            order: 1,
                            created_date: '2026-06-19T15:59:40.490818Z',
                            updated_date: '2026-06-19T15:59:40.490820Z',
                          },
                          {
                            id: 1743,
                            item_type: 'weakness',
                            label: 'Metadata Dependence',
                            description:
                              'Sibling/family-aware and confounder-adjusted analyses hinge on metadata availability that is often incomplete in public datasets, potentially reducing key secondary analyses.',
                            order: 2,
                            created_date: '2026-06-19T15:59:40.490828Z',
                            updated_date: '2026-06-19T15:59:40.490831Z',
                          },
                          {
                            id: 1744,
                            item_type: 'weakness',
                            label: '16S Scope Only',
                            description:
                              'Restricting primary analysis to 16S stool data excludes shotgun metagenomic, metabolomic, and multikingdom evidence, limiting biological depth of conclusions.',
                            order: 3,
                            created_date: '2026-06-19T15:59:40.490840Z',
                            updated_date: '2026-06-19T15:59:40.490842Z',
                          },
                          {
                            id: 1745,
                            item_type: 'weakness',
                            label: 'Disclosure Gaps',
                            description:
                              'Proposal does not explicitly address AI/LLM tool use or conflicts of interest, which are minor but expected open-science disclosures.',
                            order: 4,
                            created_date: '2026-06-19T15:59:40.490851Z',
                            updated_date: '2026-06-19T15:59:40.490853Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8671126,
                        first_name: 'Dr. Alireza',
                        last_name: 'Nourazarian (PhD)',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/06/16/blob_PQMghHl',
                        headline: 'Clinical Neurochemistry Fellowship',
                      },
                      preregistration_post_id: 32404,
                      fundraise: {
                        id: 916,
                        title:
                          "Plasma Phospho-Tau Epitope Signatures Resolved by Simoa Discriminate PSP, CBD, and Alzheimer's Disease in a Multicenter Cohort",
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18312,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 80,
                        status: 'completed',
                        tldr: "Prospective multicenter plan to test a 5-epitope plasma phospho-tau Simoa panel (plus NfL, GFAP) for distinguishing PSP, CBD, and AD in 480 participants, with pre-registered analyses. Design and rigor are strong, but the $10,000 single-site pilot budget cannot fund the described study, sites conflict (NA/Europe vs Turkey/Iran), and the topic does not match the RFP's neurodevelopmental/neuropsychiatric scope.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 13.593995755014475,
                        created_date: '2026-06-22T16:07:35.597870Z',
                        updated_date: '2026-06-22T16:07:49.202946Z',
                        items: [
                          {
                            id: 1854,
                            item_type: 'strength',
                            label: 'Important Question',
                            description:
                              'Targets a real clinical gap: PSP/CBD vs AD misdiagnosis approaches 50%, with direct implications for 4R-tau trial enrichment and treatment decisions.',
                            order: 0,
                            created_date: '2026-06-22T16:07:49.206437Z',
                            updated_date: '2026-06-22T16:07:49.206446Z',
                          },
                          {
                            id: 1855,
                            item_type: 'strength',
                            label: 'Pre-Specified Hypotheses',
                            description:
                              'H1-H2e are quantitative with explicit effect sizes, AUROC thresholds, and CI bounds, grounded in epitope-specific tau biology.',
                            order: 1,
                            created_date: '2026-06-22T16:07:49.206483Z',
                            updated_date: '2026-06-22T16:07:49.206486Z',
                          },
                          {
                            id: 1856,
                            item_type: 'strength',
                            label: 'Analytical Rigor',
                            description:
                              'Locked SAP on OSF, 70/30 discovery/validation split, elastic net plus random-forest sensitivity, DeLong CIs, BH-FDR, and blinded duplicate Simoa runs.',
                            order: 2,
                            created_date: '2026-06-22T16:07:49.206496Z',
                            updated_date: '2026-06-22T16:07:49.206499Z',
                          },
                          {
                            id: 1857,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'STARD reporting, code and processed data deposition to AD Workbench/GAAIN, model card, and 10-year biobanking align with FAIR principles.',
                            order: 3,
                            created_date: '2026-06-22T16:07:49.206507Z',
                            updated_date: '2026-06-22T16:07:49.206510Z',
                          },
                          {
                            id: 1858,
                            item_type: 'strength',
                            label: 'Harmonized Operations',
                            description:
                              'Single CLIA-certified Simoa core lab, shared SOP with quarterly audits, batch randomization, and synthetic phospho-tau reference standards reduce technical variance.',
                            order: 4,
                            created_date: '2026-06-22T16:07:49.206518Z',
                            updated_date: '2026-06-22T16:07:49.206521Z',
                          },
                          {
                            id: 1859,
                            item_type: 'weakness',
                            label: 'RFP Mismatch',
                            description:
                              'The RFP funds neurodevelopmental and neuropsychiatric research (autism, OCD, schizophrenia, anxiety, mood). A tauopathy/AD biomarker study does not fit this scope.',
                            order: 0,
                            created_date: '2026-06-22T16:07:49.206529Z',
                            updated_date: '2026-06-22T16:07:49.206532Z',
                          },
                          {
                            id: 1860,
                            item_type: 'weakness',
                            label: 'Budget Inconsistency',
                            description:
                              'A $10,000 single-site banked-sample pilot with 1-2 kits and ~24-30 samples cannot fund the described 480-participant, 6-site, 36-month, 5-epitope longitudinal study.',
                            order: 1,
                            created_date: '2026-06-22T16:07:49.206541Z',
                            updated_date: '2026-06-22T16:07:49.206543Z',
                          },
                          {
                            id: 1861,
                            item_type: 'weakness',
                            label: 'Site Contradictions',
                            description:
                              'Introduction states six sites in North America and Europe, while Methods names three in Turkey and three in Iran, with no specific institutions or core lab identified.',
                            order: 2,
                            created_date: '2026-06-22T16:07:49.206551Z',
                            updated_date: '2026-06-22T16:07:49.206554Z',
                          },
                          {
                            id: 1862,
                            item_type: 'weakness',
                            label: 'Team Track Record',
                            description:
                              'Per the AI review, public records show no prior PSP/CBD plasma biomarker or Simoa work and no named co-investigators, movement disorder neurologists, or core lab directors.',
                            order: 3,
                            created_date: '2026-06-22T16:07:49.206562Z',
                            updated_date: '2026-06-22T16:07:49.206565Z',
                          },
                          {
                            id: 1863,
                            item_type: 'weakness',
                            label: 'Ambitious Targets',
                            description:
                              'PSP-vs-CBD AUROC >=0.75 from plasma alone is demanding given current literature, and clinical (not pathology-confirmed) anchors limit gold-standard validation.',
                            order: 4,
                            created_date: '2026-06-22T16:07:49.206573Z',
                            updated_date: '2026-06-22T16:07:49.206576Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 989685,
                        first_name: 'Faye',
                        last_name: 'McKenna',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                        headline:
                          'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                      },
                      preregistration_post_id: 32437,
                      fundraise: {
                        id: 925,
                        title:
                          'In Vivo Neuroimaging of Glymphatic Function in Autism Spectrum Disorder: Completing a Multi-Modal, Open-Data Biotyping Pilot',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 24,
                          name: 'The Neuroimaging Research Lab',
                        },
                        reviews: [
                          {
                            id: 18379,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 87,
                        status: 'completed',
                        tldr: "Continuation pilot to complete a multi-modal glymphatic imaging characterization of autism using open ABIDE data, adding gBOLD-CSF coupling and deriving preregistered biotypes. Fits the RFP's neurodevelopmental scope; strong open-science design and pilot effects (d=0.36-0.51), but treatment-relevance is aspirational and developmental claims rest on cross-sectional data.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 11.372415968973655,
                        created_date: '2026-06-26T16:33:27.183608Z',
                        updated_date: '2026-06-26T16:33:38.564723Z',
                        items: [
                          {
                            id: 1940,
                            item_type: 'strength',
                            label: 'Strong Pilot Foundation',
                            description:
                              'Pipeline is already built and run on N=2,226, with reproducible structural, diffusion, and free-water findings, substantially de-risking the 12-month completion plan.',
                            order: 0,
                            created_date: '2026-06-26T16:33:38.567850Z',
                            updated_date: '2026-06-26T16:33:38.567860Z',
                          },
                          {
                            id: 1941,
                            item_type: 'strength',
                            label: 'Novel Functional Measure',
                            description:
                              'Adds gBOLD-CSF coupling, never previously measured in ASD, completing a structural-diffusion-functional glymphatic picture rather than relying on a single index.',
                            order: 1,
                            created_date: '2026-06-26T16:33:38.567882Z',
                            updated_date: '2026-06-26T16:33:38.567885Z',
                          },
                          {
                            id: 1942,
                            item_type: 'strength',
                            label: 'Open Science Design',
                            description:
                              "Preregistration, Registered Report submission, open code, and deposit of harmonized derived measures are explicit deliverables aligned with ResearchHub's mission.",
                            order: 2,
                            created_date: '2026-06-26T16:33:38.567896Z',
                            updated_date: '2026-06-26T16:33:38.567898Z',
                          },
                          {
                            id: 1943,
                            item_type: 'strength',
                            label: 'Rigorous Analysis Plan',
                            description:
                              'Uses ComBat harmonization, FDR correction, elastic-net discrimination, and hierarchical clustering with bootstrap stability and a priori plus data-driven cluster selection.',
                            order: 3,
                            created_date: '2026-06-26T16:33:38.567907Z',
                            updated_date: '2026-06-26T16:33:38.567910Z',
                          },
                          {
                            id: 1944,
                            item_type: 'strength',
                            label: 'Modest Targeted Budget',
                            description:
                              '$10,000 is itemized for compute, analyst QC, open-access fees, and deposit, with PI effort and HPC/MRRC infrastructure provided in-kind.',
                            order: 4,
                            created_date: '2026-06-26T16:33:38.567918Z',
                            updated_date: '2026-06-26T16:33:38.567920Z',
                          },
                          {
                            id: 1945,
                            item_type: 'weakness',
                            label: 'Cross-Sectional Inference',
                            description:
                              'Age-dependent trajectory claims rely on cross-sectional ABIDE data; true developmental progression cannot be established here and is appropriately deferred to ABCD.',
                            order: 0,
                            created_date: '2026-06-26T16:33:38.567929Z',
                            updated_date: '2026-06-26T16:33:38.567932Z',
                          },
                          {
                            id: 1946,
                            item_type: 'weakness',
                            label: 'Aspirational Treatment Link',
                            description:
                              'Mapping biotypes to AQP4 modulation or 40 Hz stimulation is conceptual; no intervention is tested, so treatment-relevance depends on future trials beyond this award.',
                            order: 1,
                            created_date: '2026-06-26T16:33:38.567940Z',
                            updated_date: '2026-06-26T16:33:38.567943Z',
                          },
                          {
                            id: 1947,
                            item_type: 'weakness',
                            label: 'ABIDE Phenotyping Limits',
                            description:
                              'Sleep and inflammation phenotyping in ABIDE is limited, which constrains how strongly clusters can be tied to the proposed mechanistic and clinical correlates.',
                            order: 2,
                            created_date: '2026-06-26T16:33:38.567951Z',
                            updated_date: '2026-06-26T16:33:38.567954Z',
                          },
                          {
                            id: 1948,
                            item_type: 'weakness',
                            label: 'Clustering Robustness',
                            description:
                              'Biotype validity hinges on stability resampling and specificity tests; with modest pilot effect sizes, replicable, clinically meaningful subgroups are not guaranteed.',
                            order: 3,
                            created_date: '2026-06-26T16:33:38.567962Z',
                            updated_date: '2026-06-26T16:33:38.567965Z',
                          },
                          {
                            id: 1949,
                            item_type: 'weakness',
                            label: 'Minimal Disclosures',
                            description:
                              'AI-use disclosure is a single line and no explicit conflict-of-interest statement is provided, leaving standard transparency items thinly addressed.',
                            order: 4,
                            created_date: '2026-06-26T16:33:38.567972Z',
                            updated_date: '2026-06-26T16:33:38.567975Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8681365,
                        first_name: 'Cooper',
                        last_name: 'Atterton',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 32488,
                      fundraise: {
                        id: 926,
                        title:
                          'Goldilocks & The 3 Brains: Towards A Better Understanding Of How Overgrowth Intellectual Disability Disorders Arise',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18404,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 88,
                        status: 'completed',
                        tldr: "Proposal to run single-nucleus RNA-seq on adult Setd2 conditional heterozygote mouse brains to probe Luscan-Lumish syndrome and broader overgrowth intellectual disability (OGID) biology, aligning with the RFP's neurodevelopmental/autism focus. Highly feasible with existing mice, ethics, and a modest $10,000 budget, but small n=3/genotype and whole-brain sampling limit statistical and regional resolution.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 11.794377211946994,
                        created_date: '2026-06-28T23:39:55.463689Z',
                        updated_date: '2026-06-28T23:41:13.279308Z',
                        items: [
                          {
                            id: 1960,
                            item_type: 'strength',
                            label: 'High Feasibility',
                            description:
                              'Mice are actively breeding, ethics approved, sequencing kits purchased, and HPC/compute covered, making the 9-month timeline and $10,000 budget realistic.',
                            order: 0,
                            created_date: '2026-06-28T23:41:13.284053Z',
                            updated_date: '2026-06-28T23:41:13.284061Z',
                          },
                          {
                            id: 1961,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              "LLS features autism and intellectual disability, directly matching the funder's interest in neurodevelopmental conditions, and OGIDs lack mechanistic understanding.",
                            order: 1,
                            created_date: '2026-06-28T23:41:13.284082Z',
                            updated_date: '2026-06-28T23:41:13.284085Z',
                          },
                          {
                            id: 1962,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Explicit commitments to preregistration and deposition of data in an open repository like GEO support reproducibility and reuse.',
                            order: 2,
                            created_date: '2026-06-28T23:41:13.284096Z',
                            updated_date: '2026-06-28T23:41:13.284098Z',
                          },
                          {
                            id: 1963,
                            item_type: 'strength',
                            label: 'Novel Dataset',
                            description:
                              'First snRNA-seq of a Setd2 heterozygous (LLS-mimicking) brain model, complementing prior cKO and arealization studies and enabling cross-OGID comparisons.',
                            order: 3,
                            created_date: '2026-06-28T23:41:13.284107Z',
                            updated_date: '2026-06-28T23:41:13.284109Z',
                          },
                          {
                            id: 1964,
                            item_type: 'strength',
                            label: 'Established Pipelines',
                            description:
                              "Methods mirror the lab's published snRNA-seq workflow (10x Chromium, Seurat), with documented QC and analysis steps that aid rigor and comparability.",
                            order: 4,
                            created_date: '2026-06-28T23:41:13.284118Z',
                            updated_date: '2026-06-28T23:41:13.284121Z',
                          },
                          {
                            id: 1965,
                            item_type: 'weakness',
                            label: 'Small Sample',
                            description:
                              'n=3 per genotype with informal power justification limits statistical confidence for cell-type-level inference in snRNA-seq, especially for subtle heterozygous effects.',
                            order: 0,
                            created_date: '2026-06-28T23:41:13.284130Z',
                            updated_date: '2026-06-28T23:41:13.284132Z',
                          },
                          {
                            id: 1966,
                            item_type: 'weakness',
                            label: 'Whole-Brain Sampling',
                            description:
                              'Bisected whole-brain input may dilute regional signals; prior Setd2 work highlights cortical arealization effects that region-specific dissection would better capture.',
                            order: 1,
                            created_date: '2026-06-28T23:41:13.284141Z',
                            updated_date: '2026-06-28T23:41:13.284143Z',
                          },
                          {
                            id: 1967,
                            item_type: 'weakness',
                            label: 'Descriptive Scope',
                            description:
                              'Analyses are largely correlational and hypothesis-generating; no mechanistic follow-up or functional validation is planned within the project.',
                            order: 2,
                            created_date: '2026-06-28T23:41:13.284151Z',
                            updated_date: '2026-06-28T23:41:13.284154Z',
                          },
                          {
                            id: 1968,
                            item_type: 'weakness',
                            label: 'Vague Predictions',
                            description:
                              "Hypotheses state transcriptomic changes will 'correlate' with phenotypes without prespecified gene modules, effect sizes, or quantitative criteria for the 'OGID gene network'.",
                            order: 3,
                            created_date: '2026-06-28T23:41:13.284162Z',
                            updated_date: '2026-06-28T23:41:13.284165Z',
                          },
                          {
                            id: 1969,
                            item_type: 'weakness',
                            label: 'Cross-Dataset Integration',
                            description:
                              'Plan to compare with prior Setd2/OGID datasets is contingent on raw data access; fallback to qualitative figure comparisons weakens the integrative claim.',
                            order: 4,
                            created_date: '2026-06-28T23:41:13.284174Z',
                            updated_date: '2026-06-28T23:41:13.284176Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8671750,
                        first_name: 'Uma',
                        last_name: 'Chatterjee',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/07/blob_mGuD4Ib',
                        headline: 'Neuroscience PhD Candidate - UW-Madison',
                      },
                      preregistration_post_id: 32567,
                      fundraise: {
                        id: 956,
                        title:
                          'Breaking the OCD Loop: How Genes Disrupt Brain Connections–and How We Can Fix Them',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 57,
                          name: 'UNIVERSITY OF WISCONSIN FOUNDATION',
                        },
                        reviews: [
                          {
                            id: 18531,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 97,
                        status: 'completed',
                        tldr: "A 6-month pilot to quantify OCD-associated candidate proteins (DLGAP3, CTNND1/p120, CHD8, SCUBE1) in postmortem lateral OFC and caudate from 45 NIMH-HBCC donors (OCD, controls, psychiatric comparisons), plus a subcellular fractionation feasibility arm. Fits the RFP's OCD basic-science aim and leverages an in-hand cohort and strong lab expertise, but small per-cell n (6-9) and Western-blot-only readout limit power and definitive claims.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 16.083070097003656,
                        created_date: '2026-07-07T22:24:28.166475Z',
                        updated_date: '2026-07-07T22:24:44.253240Z',
                        items: [
                          {
                            id: 2089,
                            item_type: 'strength',
                            label: 'Clear translational gap',
                            description:
                              'Directly bridges OCD genetics and transcriptomics to protein-level biology in CSTC regions, an area the proposal and reviewers describe as largely uncharacterized in human tissue.',
                            order: 0,
                            created_date: '2026-07-07T22:24:44.256199Z',
                            updated_date: '2026-07-07T22:24:44.256211Z',
                          },
                          {
                            id: 2090,
                            item_type: 'strength',
                            label: 'Rare cohort in hand',
                            description:
                              'NIMH-HBCC tissue from 45 donors across OCD, healthy, and psychiatric comparison groups with matched OFC and caudate is already secured, removing a major feasibility barrier.',
                            order: 1,
                            created_date: '2026-07-07T22:24:44.256233Z',
                            updated_date: '2026-07-07T22:24:44.256236Z',
                          },
                          {
                            id: 2091,
                            item_type: 'strength',
                            label: 'Rigorous design elements',
                            description:
                              'Preregistration, blinded densitometry, batch matching, housekeeping normalization, psychiatric comparison group, and sex-stratified analyses strengthen interpretability within a pilot scope.',
                            order: 2,
                            created_date: '2026-07-07T22:24:44.256246Z',
                            updated_date: '2026-07-07T22:24:44.256249Z',
                          },
                          {
                            id: 2092,
                            item_type: 'strength',
                            label: 'Strong team, preliminary data',
                            description:
                              'PI has published reverse-translational mouse-to-human protein work; Cahill lab has postmortem and fractionation expertise; Sapap3 knockdown pilot shows region- and sex-dependent effects.',
                            order: 3,
                            created_date: '2026-07-07T22:24:44.256258Z',
                            updated_date: '2026-07-07T22:24:44.256262Z',
                          },
                          {
                            id: 2093,
                            item_type: 'strength',
                            label: 'Open science fit',
                            description:
                              "Explicit commitments to preregistration, open protocols, and open data align well with the ResearchHub RFP's open-science expectations.",
                            order: 4,
                            created_date: '2026-07-07T22:24:44.256270Z',
                            updated_date: '2026-07-07T22:24:44.256273Z',
                          },
                          {
                            id: 2094,
                            item_type: 'weakness',
                            label: 'Underpowered cells',
                            description:
                              'With only 6-9 donors per sex/diagnosis/region cell and no formal power analysis, three-group sex-stratified comparisons may miss modest effects and risk false negatives.',
                            order: 0,
                            created_date: '2026-07-07T22:24:44.256282Z',
                            updated_date: '2026-07-07T22:24:44.256285Z',
                          },
                          {
                            id: 2095,
                            item_type: 'weakness',
                            label: 'Single-method readout',
                            description:
                              'Reliance on Western blot for all targets, without orthogonal quantification such as mass spectrometry or targeted proteomics, limits confidence in protein-level differences.',
                            order: 1,
                            created_date: '2026-07-07T22:24:44.256293Z',
                            updated_date: '2026-07-07T22:24:44.256296Z',
                          },
                          {
                            id: 2096,
                            item_type: 'weakness',
                            label: 'Antibody validation',
                            description:
                              'Specific validation plans for CHD8, SCUBE1, p120 catenin, and DLGAP3 antibodies in human postmortem tissue are not detailed, a key rigor concern for novel target quantification.',
                            order: 2,
                            created_date: '2026-07-07T22:24:44.256304Z',
                            updated_date: '2026-07-07T22:24:44.256307Z',
                          },
                          {
                            id: 2097,
                            item_type: 'weakness',
                            label: 'Confound control',
                            description:
                              'OCD cases are not excluded for comorbidity, medication, or cause of death, and covariate handling is described only generally, which could obscure OCD-specific signals given small n.',
                            order: 3,
                            created_date: '2026-07-07T22:24:44.256316Z',
                            updated_date: '2026-07-07T22:24:44.256319Z',
                          },
                          {
                            id: 2098,
                            item_type: 'weakness',
                            label: 'IRB and disclosures',
                            description:
                              'Explicit UW IRB determination language, COI statement, and AI-use disclosure are not clearly provided, though tissue is de-identified through HBCC.',
                            order: 4,
                            created_date: '2026-07-07T22:24:44.256328Z',
                            updated_date: '2026-07-07T22:24:44.256330Z',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              action_date: '2026-06-09T17:02:17.990821Z',
              action: 'PUBLISH',
            },
            {
              id: 32330,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 32330,
                slug: 'non-invasive-tools-to-control-and-profile-gene-expression',
                title: 'Non-invasive tools to control and profile gene expression ',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/05ec68bd-8c01-4a40-b2f4-e8554c857877/screenshot-2026-06-09-at-7.png',
                unified_document_id: 9280630,
                grant: {
                  id: 315,
                  status: 'OPEN',
                  amount: {
                    usd: 10000,
                    rsc: 124904.2685285593,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: null,
                  is_expired: false,
                  is_active: true,
                  application_count: 1,
                  applications: [
                    {
                      applicant: {
                        id: 8682369,
                        first_name: 'Aryan',
                        last_name: 'Chaudhary',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocKfWGBRXK_gtjG_37b0IsfYCmODFvAWpuIyVvXNPRX_tj-kjg=s96-c',
                        headline: null,
                      },
                      preregistration_post_id: 32496,
                      fundraise: {
                        id: 932,
                        title:
                          'PHOENIX-Expr: Non-invasive Salivary and Urinary Extracellular RNA Profiling to Read Metabolic and Neurovascular Gene-Expression States in Community Primary Care',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18418,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 91,
                        status: 'completed',
                        tldr: 'A 9-month, $10K pilot to test whether saliva and urine extracellular RNA profiling can be embedded into community health camps in 72 adults, using a targeted RT-qPCR panel. Fit to the RFP is partial: the call emphasizes new non-invasive tools, while this work applies established exRNA methods in a field setting. Design and open-science plan are rigorous, but molecular expertise and budget for EV isolation plus qPCR are concerns.',
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 11.201515914002812,
                        created_date: '2026-06-29T16:36:16.502672Z',
                        updated_date: '2026-06-29T16:36:27.713485Z',
                        items: [
                          {
                            id: 1990,
                            item_type: 'strength',
                            label: 'Rigorous Pilot Design',
                            description:
                              'Pre-specified hypotheses, QC thresholds, spike-ins, MISEV2023-aligned EV reporting, FDR control, and internal cross-validation support a methodologically sound pilot.',
                            order: 0,
                            created_date: '2026-06-29T16:36:27.716997Z',
                            updated_date: '2026-06-29T16:36:27.717010Z',
                          },
                          {
                            id: 1991,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to ResearchHub preregistration, public SOPs, de-identified data, analysis code, QC reports, and reporting of negative findings.',
                            order: 1,
                            created_date: '2026-06-29T16:36:27.717032Z',
                            updated_date: '2026-06-29T16:36:27.717035Z',
                          },
                          {
                            id: 1992,
                            item_type: 'strength',
                            label: 'Field Platform',
                            description:
                              'Project Phoenix offers an established community-camp network, digital case-report forms, and referral workflows, supporting realistic recruitment of 72 participants.',
                            order: 2,
                            created_date: '2026-06-29T16:36:27.717046Z',
                            updated_date: '2026-06-29T16:36:27.717049Z',
                          },
                          {
                            id: 1993,
                            item_type: 'strength',
                            label: 'Clear Endpoints',
                            description:
                              'Four falsifiable hypotheses with explicit thresholds (75% QC pass, AUC >=0.75, 80% acceptability, 90% metadata completeness) enable clean go/no-go decisions.',
                            order: 3,
                            created_date: '2026-06-29T16:36:27.717058Z',
                            updated_date: '2026-06-29T16:36:27.717060Z',
                          },
                          {
                            id: 1994,
                            item_type: 'strength',
                            label: 'Ethics Planning',
                            description:
                              'IRB approval before recruitment, plain-language consent, coded IDs, exclusion of confounding conditions, and no return of non-validated results are clearly specified.',
                            order: 4,
                            created_date: '2026-06-29T16:36:27.717070Z',
                            updated_date: '2026-06-29T16:36:27.717073Z',
                          },
                          {
                            id: 1995,
                            item_type: 'weakness',
                            label: 'Partial RFP Fit',
                            description:
                              'RFP prioritizes new non-invasive tools to read or control gene expression; this proposal applies established saliva and urine exRNA workflows in a deployment context rather than tool development.',
                            order: 0,
                            created_date: '2026-06-29T16:36:27.717081Z',
                            updated_date: '2026-06-29T16:36:27.717084Z',
                          },
                          {
                            id: 1996,
                            item_type: 'weakness',
                            label: 'Limited Novelty',
                            description:
                              'Marker panel recapitulates previously published exRNA targets (e.g., IL1R2, VPS4B, CAP1, LUZP6; miR-21/27a/29c; KIM-1), so molecular advances are incremental.',
                            order: 1,
                            created_date: '2026-06-29T16:36:27.717092Z',
                            updated_date: '2026-06-29T16:36:27.717094Z',
                          },
                          {
                            id: 1997,
                            item_type: 'weakness',
                            label: 'Tight Budget',
                            description:
                              '$2,100 for EV kits and $2,400 for RT-qPCR reagents across ~144 samples and 20+ targets with replicates and controls is optimistic, raising execution risk.',
                            order: 2,
                            created_date: '2026-06-29T16:36:27.717103Z',
                            updated_date: '2026-06-29T16:36:27.717105Z',
                          },
                          {
                            id: 1998,
                            item_type: 'weakness',
                            label: 'Team Expertise',
                            description:
                              'Field operations are credible, but demonstrated PI bench expertise in extracellular RNA is limited and the partner molecular lab is unnamed and not yet finalized.',
                            order: 3,
                            created_date: '2026-06-29T16:36:27.717114Z',
                            updated_date: '2026-06-29T16:36:27.717117Z',
                          },
                          {
                            id: 1999,
                            item_type: 'weakness',
                            label: 'Pilot Power',
                            description:
                              'n=72 in a single region with 24 per group supports feasibility estimates but offers only exploratory power for AUC claims and limited generalizability.',
                            order: 4,
                            created_date: '2026-06-29T16:36:27.717125Z',
                            updated_date: '2026-06-29T16:36:27.717128Z',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              action_date: '2026-06-09T14:47:59.893305Z',
              action: 'PUBLISH',
            },
            {
              id: 32296,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 32296,
                slug: 'reproductive-longevity',
                title: 'Reproductive Longevity',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/fe358471-2c07-42a6-b287-97f09138f1a6/screenshot-2026-05-12-at-8.png',
                unified_document_id: 9230460,
                grant: {
                  id: 312,
                  status: 'OPEN',
                  amount: {
                    usd: 10000,
                    rsc: 124904.2685285593,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: null,
                  is_expired: false,
                  is_active: true,
                  application_count: 4,
                  applications: [
                    {
                      applicant: {
                        id: 8644996,
                        first_name: 'Sonia',
                        last_name: 'David',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocL6wulX4BOaL5c_8QubuPvyiHQPWC0jrj6eqdLM3DIcuJRCNaj8=s96-c',
                        headline: 'Assistant Professor, India',
                      },
                      preregistration_post_id: 32315,
                      fundraise: {
                        id: 867,
                        title:
                          'Emotional Precarity, Informal Care Networks, and Mental Health Vulnerability in Indian Higher Education: A Complexity Science Approach',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17863,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 61,
                        status: 'completed',
                        tldr: "An exploratory 6-month qualitative study using interviews and relational mapping with 20-25 Indian academics to apply complexity science to academic mental health. The topic is socially important and ethically careful, but it is misaligned with the RFP's focus on human reproduction biology, pharmacology, and engineering.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 8.653770983999493,
                        created_date: '2026-05-26T03:32:58.587790Z',
                        updated_date: '2026-05-26T03:33:07.253488Z',
                        items: [
                          {
                            id: 1283,
                            item_type: 'strength',
                            label: 'Important Topic',
                            description:
                              'Addresses a documented and underserved problem of mental health distress among precarious, women, and queer scholars in Indian higher education.',
                            order: 0,
                            created_date: '2026-05-26T03:33:07.255857Z',
                            updated_date: '2026-05-26T03:33:07.255866Z',
                          },
                          {
                            id: 1284,
                            item_type: 'strength',
                            label: 'Trauma-Informed Ethics',
                            description:
                              'Strong attention to consent, pseudonymization, encrypted storage, distress-sensitive interviewing, and referral resources for participants.',
                            order: 1,
                            created_date: '2026-05-26T03:33:07.255888Z',
                            updated_date: '2026-05-26T03:33:07.255891Z',
                          },
                          {
                            id: 1285,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Explicit commitments to preregistration, transparent reporting, preprints, and anonymized data sharing within confidentiality limits.',
                            order: 2,
                            created_date: '2026-05-26T03:33:07.255901Z',
                            updated_date: '2026-05-26T03:33:07.255904Z',
                          },
                          {
                            id: 1286,
                            item_type: 'strength',
                            label: 'Coherent Design',
                            description:
                              'Mixed qualitative methods combining reflexive thematic analysis and relational mapping are appropriate for exploratory, systems-level aims.',
                            order: 3,
                            created_date: '2026-05-26T03:33:07.255913Z',
                            updated_date: '2026-05-26T03:33:07.255915Z',
                          },
                          {
                            id: 1287,
                            item_type: 'strength',
                            label: 'Conceptual Framing',
                            description:
                              'Synthesis of complexity science, precarity, and trauma-informed inquiry in a Global South context is a thoughtful and relatively underexplored framing.',
                            order: 4,
                            created_date: '2026-05-26T03:33:07.255923Z',
                            updated_date: '2026-05-26T03:33:07.255926Z',
                          },
                          {
                            id: 1288,
                            item_type: 'weakness',
                            label: 'RFP Misalignment',
                            description:
                              'The funder targets human reproduction biology, pharmacology, and engineering; this academic mental health study falls outside that scope.',
                            order: 0,
                            created_date: '2026-05-26T03:33:07.255934Z',
                            updated_date: '2026-05-26T03:33:07.255937Z',
                          },
                          {
                            id: 1289,
                            item_type: 'weakness',
                            label: 'Underspecified Methods',
                            description:
                              'Procedures for identifying feedback loops, emergent structures, and constructing systems diagrams are not concretely operationalized beyond narrative description.',
                            order: 1,
                            created_date: '2026-05-26T03:33:07.255945Z',
                            updated_date: '2026-05-26T03:33:07.255947Z',
                          },
                          {
                            id: 1290,
                            item_type: 'weakness',
                            label: 'Thin Subgroup Coverage',
                            description:
                              'Spreading 20-25 participants across six heterogeneous subgroups risks shallow representation per group, and stratification or recruitment targets are not specified.',
                            order: 2,
                            created_date: '2026-05-26T03:33:07.255956Z',
                            updated_date: '2026-05-26T03:33:07.255958Z',
                          },
                          {
                            id: 1291,
                            item_type: 'weakness',
                            label: 'Vague Outcomes',
                            description:
                              "Stated as exploratory with broad, hard-to-falsify outcomes like 'emergent patterns,' limiting analytic clarity and confirmatory value.",
                            order: 3,
                            created_date: '2026-05-26T03:33:07.255967Z',
                            updated_date: '2026-05-26T03:33:07.255970Z',
                          },
                          {
                            id: 1292,
                            item_type: 'weakness',
                            label: 'Limited Team Expertise',
                            description:
                              'No co-investigators with complexity-science or network-analysis expertise are named, which weakens the systems-analysis component of the work.',
                            order: 4,
                            created_date: '2026-05-26T03:33:07.255978Z',
                            updated_date: '2026-05-26T03:33:07.255980Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8634084,
                        first_name: 'Tessa',
                        last_name: 'Lord',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/05/27/blob',
                        headline: 'Senior Lecturer at University of Newcastle',
                      },
                      preregistration_post_id: 32317,
                      fundraise: {
                        id: 868,
                        title:
                          'SIRT1 overexpression in spermatogonial stem cells to promote reproductive longevity and development of in vitro platforms',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17873,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 18086,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 5570124,
                              first_name: 'Hao',
                              last_name: 'Yin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                              headline: 'Cardiovascular biologists',
                            },
                          },
                          {
                            id: 18044,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8428754,
                              first_name: 'Katri',
                              last_name: 'Vaparanta',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocJF4WPV5xgnf9CUIQUU-vBF8IdkNm9ic9zVnygSIPqHfW1P9Q=s96-c',
                              headline: 'Biomedical researcher, bioinformatician, founder',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 62,
                        status: 'completed',
                        tldr: "Proposes a 12-month mouse study testing whether SIRT1 overexpression in spermatogonial stem cells improves self-renewal (transplantation assay) and resilience to busulfan stress (sperm/IVF readouts). Fits the RFP's reproductive longevity theme with strong pilot data and gold-standard methods, but lacks aged cohorts, mechanistic depth, and does not address NAD+ availability limits on SIRT1 activity.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 17.668141888047103,
                        created_date: '2026-05-27T00:46:35.190356Z',
                        updated_date: '2026-06-20T16:47:06.042724Z',
                        items: [
                          {
                            id: 1806,
                            item_type: 'strength',
                            label: 'RFP Fit',
                            description:
                              'Directly targets male reproductive longevity and SSC preservation, a central theme of the funding call, with clear translational pathway to NAD+ or sirtuin activator therapies.',
                            order: 0,
                            created_date: '2026-06-20T16:47:06.049889Z',
                            updated_date: '2026-06-20T16:47:06.049900Z',
                          },
                          {
                            id: 1807,
                            item_type: 'strength',
                            label: 'Validated Model',
                            description:
                              'Uses an already-generated SIRT1-OE x Id4-eGFP/Rosa26-LacZ line with pilot transcriptomics showing upregulation of self-renewal and DNA repair genes in spermatogonia.',
                            order: 1,
                            created_date: '2026-06-20T16:47:06.049921Z',
                            updated_date: '2026-06-20T16:47:06.049924Z',
                          },
                          {
                            id: 1808,
                            item_type: 'strength',
                            label: 'Gold-Standard Assays',
                            description:
                              'Spermatogonial transplantation with LacZ colony scoring plus busulfan stress with Comet, motility, and IVF/blastocyst endpoints provide multiple orthogonal functional readouts.',
                            order: 2,
                            created_date: '2026-06-20T16:47:06.049934Z',
                            updated_date: '2026-06-20T16:47:06.049936Z',
                          },
                          {
                            id: 1809,
                            item_type: 'strength',
                            label: 'Team Track Record',
                            description:
                              'Lord group has published transplantation and busulfan SSC studies, ethics approval is in place, and pilot Figure 2 demonstrates technical capability for the proposed methods.',
                            order: 3,
                            created_date: '2026-06-20T16:47:06.049945Z',
                            updated_date: '2026-06-20T16:47:06.049947Z',
                          },
                          {
                            id: 1810,
                            item_type: 'strength',
                            label: 'Feasible Scope',
                            description:
                              'Modest US$10,000 budget, realistic 12-month timeline, and committed open sharing of protocols and summary data make execution risk low.',
                            order: 4,
                            created_date: '2026-06-20T16:47:06.049955Z',
                            updated_date: '2026-06-20T16:47:06.049958Z',
                          },
                          {
                            id: 1811,
                            item_type: 'weakness',
                            label: 'No Aged Cohort',
                            description:
                              'Despite framing around reproductive longevity, only young mice and acute busulfan stress are used; aging-specific NAD+ decline and lifespan effects are not directly tested.',
                            order: 0,
                            created_date: '2026-06-20T16:47:06.049966Z',
                            updated_date: '2026-06-20T16:47:06.049969Z',
                          },
                          {
                            id: 1812,
                            item_type: 'weakness',
                            label: 'SIRT1 Activity Assumption',
                            description:
                              'Proposal assumes overexpression equals increased activity but does not address NAD+ availability as a limiting cofactor, which affects interpretation of any negative result.',
                            order: 1,
                            created_date: '2026-06-20T16:47:06.049977Z',
                            updated_date: '2026-06-20T16:47:06.049980Z',
                          },
                          {
                            id: 1813,
                            item_type: 'weakness',
                            label: 'Limited Mechanism',
                            description:
                              'Study is phenotypic; it does not dissect deacetylation targets, pathway-level enrichment, or whether effects on SSCs are intrinsic versus mediated by Sertoli/Leydig somatic cells in the global OE model.',
                            order: 2,
                            created_date: '2026-06-20T16:47:06.049988Z',
                            updated_date: '2026-06-20T16:47:06.049991Z',
                          },
                          {
                            id: 1814,
                            item_type: 'weakness',
                            label: 'Statistics Underspecified',
                            description:
                              'Colony counts will be analyzed by t-test rather than Poisson or negative-binomial models, and power analysis assumptions, effect sizes, and variance estimates are not detailed.',
                            order: 3,
                            created_date: '2026-06-20T16:47:06.049999Z',
                            updated_date: '2026-06-20T16:47:06.050001Z',
                          },
                          {
                            id: 1815,
                            item_type: 'weakness',
                            label: 'Aim 2 Dependency',
                            description:
                              'Aim 2 rationale leans on Aim 1 success, and donor-cell purity, Id4-bright vs dim sorting, injection quality control, and SSC-level DNA damage readouts are not clearly specified.',
                            order: 4,
                            created_date: '2026-06-20T16:47:06.050010Z',
                            updated_date: '2026-06-20T16:47:06.050012Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8656333,
                        first_name: 'Edward',
                        last_name: 'Stuart',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJwZGr-bMFk5AXkCBk7p2cVB_uUDhVC_bU033VH7zH-d0NsGA=s96-c',
                        headline: null,
                      },
                      preregistration_post_id: 32337,
                      fundraise: {
                        id: 881,
                        title:
                          'Is there a relationship between cortisol and pregnancy loss and what does it mean for preventative care?',
                        goal_amount: {
                          usd: 4645,
                          rsc: 58018.0327315158,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18138,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 67,
                        status: 'completed',
                        tldr: "A focused, low-cost replication of Nepomnaschy et al. (2006) testing whether elevated maternal cortisol predicts early pregnancy loss, using ~2,632 archived twice-weekly urine samples from 329 rural Bangladesh pregnancies. Fits the RFP's reproductive biology scope; rigorously pre-specified and well-powered, but observational design limits causal and preventative claims.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 14.964319683960639,
                        created_date: '2026-06-13T06:45:15.131012Z',
                        updated_date: '2026-06-13T06:45:30.106018Z',
                        items: [
                          {
                            id: 1462,
                            item_type: 'strength',
                            label: 'Cost-Effectiveness',
                            description:
                              'Total budget of $4,645 with samples, lab access, and key reagents already in hand makes this an unusually efficient replication of a high-impact prior finding.',
                            order: 0,
                            created_date: '2026-06-13T06:45:30.109332Z',
                            updated_date: '2026-06-13T06:45:30.109341Z',
                          },
                          {
                            id: 1463,
                            item_type: 'strength',
                            label: 'Unique Cohort',
                            description:
                              'Leverages a longitudinal archive with hCG-detected early pregnancies in 329 women, capturing pre-clinical losses that most cortisol-pregnancy studies cannot observe.',
                            order: 1,
                            created_date: '2026-06-13T06:45:30.109363Z',
                            updated_date: '2026-06-13T06:45:30.109366Z',
                          },
                          {
                            id: 1464,
                            item_type: 'strength',
                            label: 'Pre-Specified Rigor',
                            description:
                              'Three falsifiable hypotheses, power analyses with minimum detectable effects, mixed models with clustering, and SpG correction follow established biodemography practice.',
                            order: 2,
                            created_date: '2026-06-13T06:45:30.109376Z',
                            updated_date: '2026-06-13T06:45:30.109379Z',
                          },
                          {
                            id: 1465,
                            item_type: 'strength',
                            label: 'Validated Methods',
                            description:
                              'Uses the Munro R4866 EIA with duplicate assays, and cites Pan et al. evidence that cortisol in these samples remains stable after long-term -20C storage.',
                            order: 3,
                            created_date: '2026-06-13T06:45:30.109389Z',
                            updated_date: '2026-06-13T06:45:30.109391Z',
                          },
                          {
                            id: 1466,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to sharing code openly and providing data on request, with analyses pre-specified to mirror the original Nepomnaschy study.',
                            order: 4,
                            created_date: '2026-06-13T06:45:30.109400Z',
                            updated_date: '2026-06-13T06:45:30.109402Z',
                          },
                          {
                            id: 1467,
                            item_type: 'weakness',
                            label: 'Causal Overreach',
                            description:
                              'Framing around preventability and interventions exceeds what an observational replication can establish; cortisol elevation may still reflect, not cause, impaired embryo function.',
                            order: 0,
                            created_date: '2026-06-13T06:45:30.109411Z',
                            updated_date: '2026-06-13T06:45:30.109413Z',
                          },
                          {
                            id: 1468,
                            item_type: 'weakness',
                            label: 'Confounding',
                            description:
                              'Limited discussion of confounders such as gestational-age timing of cortisol sampling, illness, nutrition, and socioeconomic stressors that could drive both cortisol and loss.',
                            order: 1,
                            created_date: '2026-06-13T06:45:30.109421Z',
                            updated_date: '2026-06-13T06:45:30.109424Z',
                          },
                          {
                            id: 1469,
                            item_type: 'weakness',
                            label: 'Single Replication',
                            description:
                              'One observational cohort in a different population provides incremental evidence but is unlikely on its own to shift clinical guidance still anchored to chromosomal etiologies.',
                            order: 2,
                            created_date: '2026-06-13T06:45:30.109432Z',
                            updated_date: '2026-06-13T06:45:30.109435Z',
                          },
                          {
                            id: 1470,
                            item_type: 'weakness',
                            label: 'Team Detail',
                            description:
                              'Proposal does not specify PI assay experience, co-investigator roles, or mentorship, leaving execution capacity somewhat unclear despite strong institutional infrastructure.',
                            order: 3,
                            created_date: '2026-06-13T06:45:30.109443Z',
                            updated_date: '2026-06-13T06:45:30.109446Z',
                          },
                          {
                            id: 1471,
                            item_type: 'weakness',
                            label: 'Disclosures Missing',
                            description:
                              'No statements on AI tool use or conflicts of interest, and several cited references are forthcoming (2025-2026) and not independently verifiable from the proposal text.',
                            order: 4,
                            created_date: '2026-06-13T06:45:30.109454Z',
                            updated_date: '2026-06-13T06:45:30.109457Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 7497584,
                        first_name: 'Padvitski',
                        last_name: 'Tim',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocI2XTWucIfQniDG5iVnEM3NOdMD1h7hPp_C0cOBAacsZ75uwqSJ=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 32357,
                      fundraise: {
                        id: 893,
                        title:
                          'Molecular Readouts of Human Reproductive Ageing from Discarded IVF Material: A Pilot Study of Cumulus Cells and Follicular Fluid',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18218,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 73,
                        status: 'completed',
                        tldr: "Pilot study using discarded IVF cumulus cells and follicular fluid from ~20 women (up to 80 COCs) to optimize low-input RNA-seq and test whether a predefined cumulus-cell ageing score predicts blastocyst formation. Fits the RFP's omics-for-IVF track with rigorous pre-registration, but is underpowered for definitive claims and relies on a proprietary signature whose genes are withheld pending IP.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 10.795641983999985,
                        created_date: '2026-06-17T09:23:42.501549Z',
                        updated_date: '2026-07-03T20:40:05.990887Z',
                        items: [
                          {
                            id: 2029,
                            item_type: 'strength',
                            label: 'Methodological rigor',
                            description:
                              'Pre-registered analysis plan, locked signature, mixed-effects modeling for COC clustering, blinded embryology, and staged optimization with explicit go/no-go thresholds.',
                            order: 0,
                            created_date: '2026-07-03T20:40:05.996068Z',
                            updated_date: '2026-07-03T20:40:05.996079Z',
                          },
                          {
                            id: 2030,
                            item_type: 'strength',
                            label: 'RFP fit',
                            description:
                              "Directly addresses the funder's omics-for-IVF and reproductive longevity objectives by seeking molecular readouts of oocyte quality beyond morphology and AMH.",
                            order: 1,
                            created_date: '2026-07-03T20:40:05.996103Z',
                            updated_date: '2026-07-03T20:40:05.996107Z',
                          },
                          {
                            id: 2031,
                            item_type: 'strength',
                            label: 'Feasible design',
                            description:
                              'Uses routinely discarded material with individual COC tracking, minimal-risk consent, and an established clinical collaborator, keeping the 12-month timeline plausible.',
                            order: 2,
                            created_date: '2026-07-03T20:40:05.996119Z',
                            updated_date: '2026-07-03T20:40:05.996122Z',
                          },
                          {
                            id: 2032,
                            item_type: 'strength',
                            label: 'Clear scoping',
                            description:
                              'Explicitly framed as optimization and signal estimation rather than diagnostic validation, with predefined fallback strategies (e.g., limited within-participant pooling).',
                            order: 3,
                            created_date: '2026-07-03T20:40:05.996131Z',
                            updated_date: '2026-07-03T20:40:05.996133Z',
                          },
                          {
                            id: 2033,
                            item_type: 'strength',
                            label: 'Open science',
                            description:
                              'Commits to sharing de-identified counts, metadata, QC metrics, and analysis code, with GDPR-compliant handling and disclosed AI use and commercial interest.',
                            order: 4,
                            created_date: '2026-07-03T20:40:05.996142Z',
                            updated_date: '2026-07-03T20:40:05.996145Z',
                          },
                          {
                            id: 2034,
                            item_type: 'weakness',
                            label: 'Limited power',
                            description:
                              'Effective participant-level N of ~20 constrains age analyses and multivariable adjustment; findings will be hypothesis-generating rather than confirmatory.',
                            order: 0,
                            created_date: '2026-07-03T20:40:05.996154Z',
                            updated_date: '2026-07-03T20:40:05.996157Z',
                          },
                          {
                            id: 2035,
                            item_type: 'weakness',
                            label: 'Proprietary signature',
                            description:
                              'Exact ageing-signature genes are withheld pending IP filing, limiting immediate reproducibility and independent scrutiny of the primary molecular readout.',
                            order: 1,
                            created_date: '2026-07-03T20:40:05.996166Z',
                            updated_date: '2026-07-03T20:40:05.996168Z',
                          },
                          {
                            id: 2036,
                            item_type: 'weakness',
                            label: 'Incremental novelty',
                            description:
                              'Cumulus-cell transcriptomics for oocyte competence is well-established; innovation is confined to a pre-locked cross-dataset signature scored per individual COC.',
                            order: 2,
                            created_date: '2026-07-03T20:40:05.996177Z',
                            updated_date: '2026-07-03T20:40:05.996179Z',
                          },
                          {
                            id: 2037,
                            item_type: 'weakness',
                            label: 'Tight budget',
                            description:
                              'Sequencing alone consumes most of the $10k, leaving little margin for QC failures or optimization reruns; relies heavily on undocumented in-kind support.',
                            order: 3,
                            created_date: '2026-07-03T20:40:05.996188Z',
                            updated_date: '2026-07-03T20:40:05.996191Z',
                          },
                          {
                            id: 2038,
                            item_type: 'weakness',
                            label: 'Team track record',
                            description:
                              'The two wet-lab leads have limited documented publication history in reproductive biology, and no local pilot accrual data are provided for IRISmed.',
                            order: 4,
                            created_date: '2026-07-03T20:40:05.996199Z',
                            updated_date: '2026-07-03T20:40:05.996202Z',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              action_date: '2026-05-12T15:49:04.573659Z',
              action: 'PUBLISH',
            },
            {
              id: 32295,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 32295,
                slug: 'complexity-science-for-real-world-health-system-challenges',
                title: 'Complexity Science for Real-World Health System Challenges',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/acdc86c4-edc6-41b4-801a-5df18a55f37b/screenshot-2026-05-12-at-8.png',
                unified_document_id: 9230458,
                grant: {
                  id: 311,
                  status: 'OPEN',
                  amount: {
                    usd: 5000,
                    rsc: 62452.13426427965,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: null,
                  is_expired: false,
                  is_active: true,
                  application_count: 6,
                  applications: [
                    {
                      applicant: {
                        id: 8336024,
                        first_name: 'Jason',
                        last_name: 'Hung',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/11/20/blob',
                        headline: 'Applied Social & Health Data Scientist (Primary)',
                      },
                      preregistration_post_id: 32308,
                      fundraise: {
                        id: 861,
                        title:
                          'System Dynamics and Configurational Analysis of UHC Policy Effects on HIV-Related Health Outcomes in Southeast Asia',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17749,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17893,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8587524,
                              first_name: 'Hafiz Syed Zaigham Ali',
                              last_name: 'Shah',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/04/21/blob_e9yhjA4',
                              headline: 'Professor Medicine',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 56,
                        status: 'completed',
                        tldr: "Proposes system dynamics modeling and QCA to mechanistically explain counter-intuitive UHC-HIV findings across 8 Southeast Asian countries, fitting the RFP's complexity-science focus. Strengths include formalized hypotheses, open-science commitments, and strong Co-I expertise; key risks are circular calibration against the PI's own preprints, very small N for QCA, and an ambitious 6-month timeline at 0.12 FTE.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 41.97744456300279,
                        created_date: '2026-05-19T16:54:04.820719Z',
                        updated_date: '2026-06-16T21:06:34.885366Z',
                        items: [
                          {
                            id: 1687,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              'Directly addresses the call for nonlinear, feedback-driven health system analysis by formalizing detection feedback, delayed barrier constraints, and configurational causation hypotheses.',
                            order: 0,
                            created_date: '2026-06-16T21:06:34.889708Z',
                            updated_date: '2026-06-16T21:06:34.889716Z',
                          },
                          {
                            id: 1688,
                            item_type: 'strength',
                            label: 'Formalized Hypotheses',
                            description:
                              'H1-H3 are mathematically specified with explicit stock-flow equations, parameter definitions, and falsifiable links to prior empirical anomalies.',
                            order: 1,
                            created_date: '2026-06-16T21:06:34.889737Z',
                            updated_date: '2026-06-16T21:06:34.889740Z',
                          },
                          {
                            id: 1689,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to GitHub + Zenodo DOI, MIT license, ResearchHub pre-registration, preprint posting, and exclusive use of public APIs, supporting reproducibility.',
                            order: 2,
                            created_date: '2026-06-16T21:06:34.889749Z',
                            updated_date: '2026-06-16T21:06:34.889752Z',
                          },
                          {
                            id: 1690,
                            item_type: 'strength',
                            label: 'Co-I Expertise',
                            description:
                              "Co-Investigator Adrian Smith at Oxford NDPH brings verified, strong credentials in HIV epidemiology among key populations, complementing the PI's regional focus.",
                            order: 3,
                            created_date: '2026-06-16T21:06:34.889761Z',
                            updated_date: '2026-06-16T21:06:34.889763Z',
                          },
                          {
                            id: 1691,
                            item_type: 'strength',
                            label: 'Pilot Foundation',
                            description:
                              'Two prior co-authored panel analyses establish the empirical patterns the SD model targets and demonstrate working data pipelines for the proposed APIs.',
                            order: 4,
                            created_date: '2026-06-16T21:06:34.889772Z',
                            updated_date: '2026-06-16T21:06:34.889774Z',
                          },
                          {
                            id: 1692,
                            item_type: 'weakness',
                            label: 'Circular Calibration',
                            description:
                              "SD model is calibrated to reproduce coefficients from the PI's own unverified 2026 preprints, creating tautology risk; no clear criterion is given for what would count as a failed calibration.",
                            order: 0,
                            created_date: '2026-06-16T21:06:34.889783Z',
                            updated_date: '2026-06-16T21:06:34.889785Z',
                          },
                          {
                            id: 1693,
                            item_type: 'weakness',
                            label: 'Small N QCA',
                            description:
                              'csQCA with N=8 yields a 32-row truth table dominated by logical remainders. Acknowledged as pattern-identifying but not strongly mitigated; country-year restructuring is not pursued.',
                            order: 1,
                            created_date: '2026-06-16T21:06:34.889794Z',
                            updated_date: '2026-06-16T21:06:34.889796Z',
                          },
                          {
                            id: 1694,
                            item_type: 'weakness',
                            label: 'Timeline Feasibility',
                            description:
                              'Six months at 0.12 FTE PI for three coupled SD sub-models, network analysis, LLM-assisted QCA coding of 50-100 documents, counterfactuals, and manuscript is highly ambitious.',
                            order: 2,
                            created_date: '2026-06-16T21:06:34.889804Z',
                            updated_date: '2026-06-16T21:06:34.889807Z',
                          },
                          {
                            id: 1695,
                            item_type: 'weakness',
                            label: 'Identifiability Concerns',
                            description:
                              'Estimating many SD parameters (theta, kappa, eta, etc.) from short panels (T<=13) with LOCF imputation raises identifiability questions not fully addressed by the Monte Carlo plan.',
                            order: 3,
                            created_date: '2026-06-16T21:06:34.889815Z',
                            updated_date: '2026-06-16T21:06:34.889818Z',
                          },
                          {
                            id: 1696,
                            item_type: 'weakness',
                            label: 'Integration Logic',
                            description:
                              'How network analysis, SD, and QCA outputs cross-validate or resolve conflicts is underspecified, and fuzzy-set calibration anchors and LLM coding protocol are not fully pre-registered.',
                            order: 4,
                            created_date: '2026-06-16T21:06:34.889826Z',
                            updated_date: '2026-06-16T21:06:34.889829Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 7964166,
                        first_name: 'Ruslan',
                        last_name: 'Kurmashev',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/21/blob_URDbsq1',
                        headline: 'MSc in Computational Biology | MD',
                      },
                      preregistration_post_id: 32311,
                      fundraise: {
                        id: 863,
                        title:
                          'Early Autism Diagnostic Cascade in Kazakhstan: A Pilot Study of Delays, Dropout and Referral Bottlenecks from First Concern to Clinical Assessment',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17776,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17902,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 989685,
                              first_name: 'Faye',
                              last_name: 'McKenna',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                              headline:
                                'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 58,
                        status: 'completed',
                        tldr: "A 6-month, $5,000 mixed-methods pilot in Kazakhstan to map parent-reported autism diagnostic pathways using cascade analysis, referral mapping, and a causal loop diagram. Fits the RFP's complexity-science framing well and is methodologically careful with strong open-science and ethics plans, but findings will be exploratory, non-representative, and reliant on parental recall, with a tight timeline and budget.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 18.712132786997245,
                        created_date: '2026-05-21T13:35:32.304061Z',
                        updated_date: '2026-06-16T21:05:12.277531Z',
                        items: [
                          {
                            id: 1677,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              "Explicitly applies cascade analysis, referral-transition mapping, and causal loop diagrams to a real health-system problem, matching the funder's complexity-science framing.",
                            order: 0,
                            created_date: '2026-06-16T21:05:12.282013Z',
                            updated_date: '2026-06-16T21:05:12.282023Z',
                          },
                          {
                            id: 1678,
                            item_type: 'strength',
                            label: 'Methodological Rigor',
                            description:
                              'Pre-recruitment protocol freeze, detailed operational definitions, hierarchical diagnostic-status classification, and four analytic samples avoid common pathway-study pitfalls.',
                            order: 1,
                            created_date: '2026-06-16T21:05:12.282044Z',
                            updated_date: '2026-06-16T21:05:12.282047Z',
                          },
                          {
                            id: 1679,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Strong reproducibility plan with public repo, synthetic dataset, code, data dictionary, and clear separation of private vs public materials.',
                            order: 2,
                            created_date: '2026-06-16T21:05:12.282057Z',
                            updated_date: '2026-06-16T21:05:12.282060Z',
                          },
                          {
                            id: 1680,
                            item_type: 'strength',
                            label: 'Local Relevance',
                            description:
                              'Addresses a documented gap in Kazakhstan where registered autism prevalence rose sharply, with MoH and senior KazNMU advisors strengthening policy translation.',
                            order: 3,
                            created_date: '2026-06-16T21:05:12.282068Z',
                            updated_date: '2026-06-16T21:05:12.282071Z',
                          },
                          {
                            id: 1681,
                            item_type: 'strength',
                            label: 'Ethics Safeguards',
                            description:
                              'Minimal-risk design with data minimization, distress safeguards, small-cell suppression, and explicit exclusion of medical records or child-level clinical data.',
                            order: 4,
                            created_date: '2026-06-16T21:05:12.282079Z',
                            updated_date: '2026-06-16T21:05:12.282082Z',
                          },
                          {
                            id: 1682,
                            item_type: 'weakness',
                            label: 'Sampling Bias',
                            description:
                              'Non-probability online, NGO, and community recruitment will likely overrepresent urban, digitally connected, advocacy-linked families, weakening the geographic-variation objective.',
                            order: 0,
                            created_date: '2026-06-16T21:05:12.282091Z',
                            updated_date: '2026-06-16T21:05:12.282093Z',
                          },
                          {
                            id: 1683,
                            item_type: 'weakness',
                            label: 'Recall Reliance',
                            description:
                              'All timing data are parent-reported across a 0-12 age range, so longer recall windows risk inaccurate stage-specific delay estimates despite proposed mitigations.',
                            order: 1,
                            created_date: '2026-06-16T21:05:12.282102Z',
                            updated_date: '2026-06-16T21:05:12.282104Z',
                          },
                          {
                            id: 1684,
                            item_type: 'weakness',
                            label: 'Tight Feasibility',
                            description:
                              'Six months to complete ethics approval, bilingual instrument finalization, recruitment of 200-250 families, and 25-32 interviews is aggressive, especially with no salary support.',
                            order: 2,
                            created_date: '2026-06-16T21:05:12.282112Z',
                            updated_date: '2026-06-16T21:05:12.282115Z',
                          },
                          {
                            id: 1685,
                            item_type: 'weakness',
                            label: 'Limited Novelty',
                            description:
                              'Cascade analysis and causal loop diagrams are established methods; novelty is mainly local application, and the stretch stock-flow model may not yield credible systems insight.',
                            order: 3,
                            created_date: '2026-06-16T21:05:12.282123Z',
                            updated_date: '2026-06-16T21:05:12.282126Z',
                          },
                          {
                            id: 1686,
                            item_type: 'weakness',
                            label: 'Team Gaps',
                            description:
                              'No named senior Kazakhstan health-services co-investigator and no dedicated qualitative-methods specialist; PI has limited peer-reviewed publication record.',
                            order: 4,
                            created_date: '2026-06-16T21:05:12.282134Z',
                            updated_date: '2026-06-16T21:05:12.282137Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8640464,
                        first_name: 'Santosh',
                        last_name: 'Basyal',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocLkURTaqxwXYzIHWXKXAOk2Un03OqWjMNUtU5QfC8cf5sjpP0uF=s96-c',
                        headline: 'Nepal Intensive Care Research Foundation',
                      },
                      preregistration_post_id: 32312,
                      fundraise: {
                        id: 864,
                        title:
                          'The Cost-Quality Equation in Critical Care Medicine: Balancing Excellence with Affordability',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17809,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 18068,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8647774,
                              first_name: 'Andrew',
                              last_name: 'Ruelas',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/05/28/blob',
                              headline: 'Doctoral Scholar Researching Stress and Resilience',
                            },
                          },
                          {
                            id: 18061,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 1362659,
                              first_name: 'Ilhan',
                              last_name: 'Altinok',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/26/blob_PDSU5QW',
                              headline: 'Vaccines, Genomics, Immunology',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 59,
                        status: 'completed',
                        tldr: "Stepped-wedge cluster RCT in 4 Nepalese public ICUs testing infection bundles, antibiotic stewardship, and a microcosting dashboard to improve value (quality/cost). Tackles a high-burden LMIC problem with pilot-supported feasibility, but engages little with the RFP's complexity-science framing, has only 4 clusters, an implausible $5,000 budget, and an inverted value equation in the text.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 42.94187224499183,
                        created_date: '2026-05-23T10:07:36.131375Z',
                        updated_date: '2026-06-16T21:04:56.668321Z',
                        items: [
                          {
                            id: 1667,
                            item_type: 'strength',
                            label: 'Important LMIC Problem',
                            description:
                              'Targets ICU cost-quality trade-offs in Nepal where HAIs and out-of-pocket spending are catastrophic, with clinically meaningful primary and secondary outcomes.',
                            order: 0,
                            created_date: '2026-06-16T21:04:56.673066Z',
                            updated_date: '2026-06-16T21:04:56.673075Z',
                          },
                          {
                            id: 1668,
                            item_type: 'strength',
                            label: 'Appropriate Design',
                            description:
                              'Stepped-wedge cluster RCT with GLMM analysis, pre-specified outcomes, MICE for missingness, and an early-death sensitivity analysis is well matched to service-level rollout.',
                            order: 1,
                            created_date: '2026-06-16T21:04:56.673096Z',
                            updated_date: '2026-06-16T21:04:56.673099Z',
                          },
                          {
                            id: 1669,
                            item_type: 'strength',
                            label: 'Pilot Feasibility',
                            description:
                              'A 40-chart retrospective pilot confirmed microcosting extraction from billing systems and identified high antibiotic spend (42%) and low checklist adherence (~55%) as actionable targets.',
                            order: 2,
                            created_date: '2026-06-16T21:04:56.673109Z',
                            updated_date: '2026-06-16T21:04:56.673112Z',
                          },
                          {
                            id: 1670,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to sharing de-identified aggregate data and dashboard source code under an open license within 6 months, supporting reproducibility.',
                            order: 3,
                            created_date: '2026-06-16T21:04:56.673121Z',
                            updated_date: '2026-06-16T21:04:56.673123Z',
                          },
                          {
                            id: 1671,
                            item_type: 'strength',
                            label: 'Multicomponent Bundle',
                            description:
                              'Combines evidence-based Surviving Sepsis and CLABSI bundles, stewardship, multidisciplinary rounds, and a cost dashboard into a coherent value-based package.',
                            order: 4,
                            created_date: '2026-06-16T21:04:56.673132Z',
                            updated_date: '2026-06-16T21:04:56.673134Z',
                          },
                          {
                            id: 1672,
                            item_type: 'weakness',
                            label: 'Implausible Budget',
                            description:
                              '$5,000 for an 18-month, 4-cluster stepped-wedge trial with coordinators, biostatistician, tablets, training, and indirect costs is unrealistic and lacks FTE-level justification.',
                            order: 0,
                            created_date: '2026-06-16T21:04:56.673143Z',
                            updated_date: '2026-06-16T21:04:56.673146Z',
                          },
                          {
                            id: 1673,
                            item_type: 'weakness',
                            label: 'Weak RFP Fit',
                            description:
                              'Framework is a linear Value=Quality/Cost model with standard QI bundles; little engagement with the complexity-science, feedback-driven framing the RFP prioritizes.',
                            order: 1,
                            created_date: '2026-06-16T21:04:56.673154Z',
                            updated_date: '2026-06-16T21:04:56.673156Z',
                          },
                          {
                            id: 1674,
                            item_type: 'weakness',
                            label: 'Underpowered Clusters',
                            description:
                              'Only 4 clusters limit stepped-wedge inference; ICC, number of steps, design effect, and contamination/secular-trend handling are not specified, undermining the 85% power claim.',
                            order: 2,
                            created_date: '2026-06-16T21:04:56.673165Z',
                            updated_date: '2026-06-16T21:04:56.673167Z',
                          },
                          {
                            id: 1675,
                            item_type: 'weakness',
                            label: 'Value Equation Error',
                            description:
                              "Introduction inverts Porter's value as Cost/Quality while the abstract uses Quality/Cost, a conceptual inconsistency in the proposal's central framework that needs correction.",
                            order: 3,
                            created_date: '2026-06-16T21:04:56.673176Z',
                            updated_date: '2026-06-16T21:04:56.673178Z',
                          },
                          {
                            id: 1676,
                            item_type: 'weakness',
                            label: 'Thin Team And Plans',
                            description:
                              'PI shows limited prior trial track record, no named biostatistician/health economist, no severity adjustment (APACHE/SOFA), no formal cost-effectiveness plan, and no fidelity metrics.',
                            order: 4,
                            created_date: '2026-06-16T21:04:56.673186Z',
                            updated_date: '2026-06-16T21:04:56.673189Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8385365,
                        first_name: 'Qi-hang',
                        last_name: 'Guo',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/12/20/blob_261d2PH',
                        headline: 'Trustworthy AI & Information Systems Research',
                      },
                      preregistration_post_id: 32314,
                      fundraise: {
                        id: 866,
                        title:
                          'Complex Network Dynamics of Emergent Anomalies in the Sericulture Health Ecosystem: A Trustworthy Cross-Graph Modeling Perspective',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17823,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 18052,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8114247,
                              first_name: 'Muhammad',
                              last_name: 'Asif',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/10/30/blob_q9haHqP',
                              headline: 'RA Max-Planck Institut für empirische Ästhetik',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 60,
                        status: 'completed',
                        tldr: "Proposes a five-layer dynamic heterogeneous graph framework to model how local perturbations in sericulture (silkworm-microbiome-mulberry-environment-farm) propagate into emergent system-level anomalies, fitting the RFP's complexity-science focus. Strong methodological grounding in the PI's prior graph-learning work, but ambitious scope, very small pilot data (n=30 microbiome batches, <5 historical anomalies), and a 24-week / $5,000 budget make confirmatory claims tenuous.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 19.89337203699688,
                        created_date: '2026-05-23T19:44:29.393999Z',
                        updated_date: '2026-06-16T21:03:45.448233Z',
                        items: [
                          {
                            id: 1657,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              "Explicitly reframes sericulture as a coupled multi-scale adaptive system with nonlinear feedback, directly matching the funder's call for non-reductionist health-system complexity science.",
                            order: 0,
                            created_date: '2026-06-16T21:03:45.453303Z',
                            updated_date: '2026-06-16T21:03:45.453315Z',
                          },
                          {
                            id: 1658,
                            item_type: 'strength',
                            label: 'Clear Hypothesis Mapping',
                            description:
                              'H1-H3 are falsifiable and each mapped to specific downstream tasks and metrics (AUROC, Recall@k, path hit rate, NDCG@10), giving a structured validation plan.',
                            order: 1,
                            created_date: '2026-06-16T21:03:45.453337Z',
                            updated_date: '2026-06-16T21:03:45.453341Z',
                          },
                          {
                            id: 1659,
                            item_type: 'strength',
                            label: 'Relevant PI Track Record',
                            description:
                              'PI has multiple recent publications on cross-graph interaction networks and Shapley-based GNN explanation, providing concrete methodological assets for the proposed architecture.',
                            order: 2,
                            created_date: '2026-06-16T21:03:45.453351Z',
                            updated_date: '2026-06-16T21:03:45.453353Z',
                          },
                          {
                            id: 1660,
                            item_type: 'strength',
                            label: 'Open Science Practices',
                            description:
                              'Commits to CC BY 4.0 release of public-data derivatives on Zenodo, GitHub code with a minimal working example, registered report preregistration, and transparent AI-use disclosure.',
                            order: 3,
                            created_date: '2026-06-16T21:03:45.453362Z',
                            updated_date: '2026-06-16T21:03:45.453365Z',
                          },
                          {
                            id: 1661,
                            item_type: 'strength',
                            label: 'Domain Data Access',
                            description:
                              'Co-PI affiliation with CAAS Sericultural Research Institute provides pre-collected institutional data (health records, sensors, microbiome, farm logs) needed for cross-layer modeling.',
                            order: 4,
                            created_date: '2026-06-16T21:03:45.453373Z',
                            updated_date: '2026-06-16T21:03:45.453376Z',
                          },
                          {
                            id: 1662,
                            item_type: 'weakness',
                            label: 'Pilot Data Scale',
                            description:
                              'Only ~30 microbiome batches, 50 farms, and fewer than 5 historical anomaly events available, which is too thin to support confirmatory tests of H2/H3 beyond exploratory analysis.',
                            order: 0,
                            created_date: '2026-06-16T21:03:45.453384Z',
                            updated_date: '2026-06-16T21:03:45.453387Z',
                          },
                          {
                            id: 1663,
                            item_type: 'weakness',
                            label: 'Synthetic Anomaly Reliance',
                            description:
                              'H1 validation depends largely on injected synthetic anomalies, and microbiome edges fall back on literature priors, risking circularity when the same literature later validates outputs.',
                            order: 1,
                            created_date: '2026-06-16T21:03:45.453395Z',
                            updated_date: '2026-06-16T21:03:45.453398Z',
                          },
                          {
                            id: 1664,
                            item_type: 'weakness',
                            label: 'Overambitious Scope',
                            description:
                              'Five subnetworks, five downstream tasks including counterfactual and resilience analyses, in a 24-week timeline with a $5,000 budget, is aggressive even with prior model assets.',
                            order: 2,
                            created_date: '2026-06-16T21:03:45.453407Z',
                            updated_date: '2026-06-16T21:03:45.453409Z',
                          },
                          {
                            id: 1665,
                            item_type: 'weakness',
                            label: 'Scale Mismatch',
                            description:
                              'Linking regional NASA environmental data to household-level farm records risks ecological fallacy and aggregation bias; the proposal does not specify how spatial/temporal alignment is handled.',
                            order: 3,
                            created_date: '2026-06-16T21:03:45.453418Z',
                            updated_date: '2026-06-16T21:03:45.453421Z',
                          },
                          {
                            id: 1666,
                            item_type: 'weakness',
                            label: 'Underspecified Methods',
                            description:
                              'Key technical details (uncertainty quantification, tipping-point detection, causal identification for counterfactuals, baselines vs simple tabular models) are not fully specified, weakening rigor claims.',
                            order: 4,
                            created_date: '2026-06-16T21:03:45.453430Z',
                            updated_date: '2026-06-16T21:03:45.453432Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8669710,
                        first_name: 'Safa',
                        last_name: 'ElKefi',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocIrw0EAgRBOoT3KCUJjiw6jlPcQURNeMjL2BWtaUjOsDwSYFkk=s96-c',
                        headline: null,
                      },
                      preregistration_post_id: 32345,
                      fundraise: {
                        id: 885,
                        title:
                          'From Discovery to Population Impact: Understanding the Global Diffusion of Lung Cancer Screening Evidence as a Complex Adaptive System in the Era of Artificial Intelligence',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18183,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 18239,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8587682,
                              first_name: 'Federica',
                              last_name: 'Cucè',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/27/blob_VD79fRc',
                              headline: 'Surgery resident in Verona, Italy',
                            },
                          },
                          {
                            id: 18376,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 1362659,
                              first_name: 'Ilhan',
                              last_name: 'Altinok',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/26/blob_PDSU5QW',
                              headline: 'Vaccines, Genomics, Immunology',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 69,
                        status: 'completed',
                        tldr: "Small qualitative pilot applying complexity science (scoping review, 15-20 stakeholder interviews, network analysis, causal loop diagrams) to map how lung cancer screening evidence diffuses globally, including via AI intermediaries. Fits the RFP's complexity-science-for-health focus and is exemplary on open science, but 'global' claims exceed the sampling frame, hypotheses are near-guaranteed to be supported, and the $5,000 budget is thin for the multi-method scope.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 13.135281052003847,
                        created_date: '2026-06-15T16:34:04.480620Z',
                        updated_date: '2026-07-04T16:30:37.197076Z',
                        items: [
                          {
                            id: 2049,
                            item_type: 'strength',
                            label: 'Timely Problem',
                            description:
                              'Addresses a real evidence-to-practice gap in lung cancer screening, the leading cause of cancer mortality, where uptake remains uneven despite RCT evidence.',
                            order: 0,
                            created_date: '2026-07-04T16:30:37.211675Z',
                            updated_date: '2026-07-04T16:30:37.211687Z',
                          },
                          {
                            id: 2050,
                            item_type: 'strength',
                            label: 'RFP Fit',
                            description:
                              "Frames dissemination as a complex adaptive system with feedback loops and leverage points, directly matching the funder's call for non-linear health-systems approaches.",
                            order: 1,
                            created_date: '2026-07-04T16:30:37.211710Z',
                            updated_date: '2026-07-04T16:30:37.211713Z',
                          },
                          {
                            id: 2051,
                            item_type: 'strength',
                            label: 'AI Angle',
                            description:
                              'Explicit attention to AI-mediated information systems as emerging dissemination actors is forward-looking and differentiates the work from standard implementation studies.',
                            order: 2,
                            created_date: '2026-07-04T16:30:37.211723Z',
                            updated_date: '2026-07-04T16:30:37.211726Z',
                          },
                          {
                            id: 2052,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Concrete commitments to share protocol, interview guide, codebook, systems maps, and aggregate findings, consistent with ResearchHub requirements.',
                            order: 3,
                            created_date: '2026-07-04T16:30:37.211735Z',
                            updated_date: '2026-07-04T16:30:37.211738Z',
                          },
                          {
                            id: 2053,
                            item_type: 'strength',
                            label: 'Coherent Design',
                            description:
                              'Three-phase sequence (scoping review, interviews, systems mapping) is logically ordered and feasible in scale, with a sensible deviation clause for low recruitment.',
                            order: 4,
                            created_date: '2026-07-04T16:30:37.211747Z',
                            updated_date: '2026-07-04T16:30:37.211750Z',
                          },
                          {
                            id: 2054,
                            item_type: 'weakness',
                            label: 'Weak Falsifiability',
                            description:
                              "H1-H4 are framed so the chosen methods will almost inevitably 'support' them (e.g., centrality heterogeneity, mixed AI views), limiting inferential value.",
                            order: 0,
                            created_date: '2026-07-04T16:30:37.211759Z',
                            updated_date: '2026-07-04T16:30:37.211761Z',
                          },
                          {
                            id: 2055,
                            item_type: 'weakness',
                            label: 'Scope Mismatch',
                            description:
                              "Title and aims promise 'global' diffusion insight, but 15-20 purposive interviews with no regional or income-level sampling frame cannot support that claim.",
                            order: 1,
                            created_date: '2026-07-04T16:30:37.211770Z',
                            updated_date: '2026-07-04T16:30:37.211772Z',
                          },
                          {
                            id: 2056,
                            item_type: 'weakness',
                            label: 'Underspecified Methods',
                            description:
                              'Scoping review lacks PRISMA-ScR protocol; network analysis lacks node/edge definitions and boundary rules; workshop facilitation and validation steps are not detailed.',
                            order: 2,
                            created_date: '2026-07-04T16:30:37.211781Z',
                            updated_date: '2026-07-04T16:30:37.211784Z',
                          },
                          {
                            id: 2057,
                            item_type: 'weakness',
                            label: 'Budget Realism',
                            description:
                              '$5,000 with $500 transcription for up to 20 hour-long interviews and $2,500 PI effort likely underestimates costs; no workshop or QDA software line items.',
                            order: 3,
                            created_date: '2026-07-04T16:30:37.211792Z',
                            updated_date: '2026-07-04T16:30:37.211795Z',
                          },
                          {
                            id: 2058,
                            item_type: 'weakness',
                            label: 'Team Capacity',
                            description:
                              'Single PI with no named collaborators in network science, systems dynamics, or qualitative methods raises feasibility concerns for a genuinely multi-method design.',
                            order: 4,
                            created_date: '2026-07-04T16:30:37.211803Z',
                            updated_date: '2026-07-04T16:30:37.211806Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8683516,
                        first_name: 'Jason - Jong Min -',
                        last_name: 'Jung',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocILCxDUZkUpeOF6D9Qi3xH6KwqncO-07V1aTvcyZ8qp7RoI-w=s96-c',
                        headline: null,
                      },
                      preregistration_post_id: 32568,
                      fundraise: {
                        id: 957,
                        title:
                          'Research Proposal : “Fitness as National Capital: A Simulation Model of Fitness and Healthcare Costs”',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18534,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 98,
                        status: 'completed',
                        tldr: "Pilot system-dynamics model linking population fitness, chronic disease, and healthcare costs in Slovenia, using aggregate data plus 10-15 stakeholder interviews. Fits the RFP's complexity science call and has strong open-science commitments, but methodological detail on model equations, calibration, and validation is thin, and novelty is modest given prior similar SD models.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 22.329566115004127,
                        created_date: '2026-07-07T23:00:56.862331Z',
                        updated_date: '2026-07-07T23:01:19.217360Z',
                        items: [
                          {
                            id: 2099,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              "Directly applies system-dynamics and mixed methods to health-system feedbacks, matching the funder's complexity science focus and 6-month pilot scope.",
                            order: 0,
                            created_date: '2026-07-07T23:01:19.221515Z',
                            updated_date: '2026-07-07T23:01:19.221528Z',
                          },
                          {
                            id: 2100,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Explicit commitments to preregistration, reproducible simulation code, documented parameters with uncertainty ranges, and open aggregate data where permitted.',
                            order: 1,
                            created_date: '2026-07-07T23:01:19.221552Z',
                            updated_date: '2026-07-07T23:01:19.221556Z',
                          },
                          {
                            id: 2101,
                            item_type: 'strength',
                            label: 'Contextual Access',
                            description:
                              'Collaboration with University of Ljubljana, Maribor, and SLOfit provides fitness surveillance expertise and stakeholder recruitment channels in Slovenia.',
                            order: 2,
                            created_date: '2026-07-07T23:01:19.221568Z',
                            updated_date: '2026-07-07T23:01:19.221571Z',
                          },
                          {
                            id: 2102,
                            item_type: 'strength',
                            label: 'Realistic Budget',
                            description:
                              'The $5,000 budget matches the cap and is sensibly allocated across personnel, interview support, data/compute, and dissemination for a pilot.',
                            order: 3,
                            created_date: '2026-07-07T23:01:19.221580Z',
                            updated_date: '2026-07-07T23:01:19.221583Z',
                          },
                          {
                            id: 2103,
                            item_type: 'strength',
                            label: 'Policy Relevance',
                            description:
                              'Framing fitness as preventive health-system capacity addresses aging-population cost pressures and yields policy-usable scenarios over 10-30 year horizons.',
                            order: 4,
                            created_date: '2026-07-07T23:01:19.221592Z',
                            updated_date: '2026-07-07T23:01:19.221595Z',
                          },
                          {
                            id: 2104,
                            item_type: 'weakness',
                            label: 'Thin Model Specification',
                            description:
                              'Proposal names sensitivity and probabilistic analyses but does not specify equations, functional forms, calibration targets, or validation criteria for the SD model.',
                            order: 0,
                            created_date: '2026-07-07T23:01:19.221604Z',
                            updated_date: '2026-07-07T23:01:19.221607Z',
                          },
                          {
                            id: 2105,
                            item_type: 'weakness',
                            label: 'Limited Novelty',
                            description:
                              'System-dynamics modeling of physical activity and healthcare costs has precedent (e.g., Colorado model); novelty is largely contextual (Slovenia/SLOfit) rather than methodological.',
                            order: 1,
                            created_date: '2026-07-07T23:01:19.221615Z',
                            updated_date: '2026-07-07T23:01:19.221618Z',
                          },
                          {
                            id: 2106,
                            item_type: 'weakness',
                            label: 'Generic Hypotheses',
                            description:
                              'H1-H3 are directional and expected (fitness reduces costs; effects delayed/nonlinear) without quantitative thresholds or specific mechanistic predictions.',
                            order: 2,
                            created_date: '2026-07-07T23:01:19.221627Z',
                            updated_date: '2026-07-07T23:01:19.221630Z',
                          },
                          {
                            id: 2107,
                            item_type: 'weakness',
                            label: 'Tight Timeline',
                            description:
                              'Six months to recruit cross-sector stakeholders, transcribe/translate, code interviews, and build and simulate the model is ambitious, even with prior groundwork.',
                            order: 3,
                            created_date: '2026-07-07T23:01:19.221639Z',
                            updated_date: '2026-07-07T23:01:19.221641Z',
                          },
                          {
                            id: 2108,
                            item_type: 'weakness',
                            label: 'Team Framing',
                            description:
                              'PI is described as based at UW Economics; AI review notes this may reflect graduate-student status rather than faculty, and named Slovenian collaborators are not listed.',
                            order: 4,
                            created_date: '2026-07-07T23:01:19.221650Z',
                            updated_date: '2026-07-07T23:01:19.221653Z',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              action_date: '2026-05-12T15:42:23.701031Z',
              action: 'PUBLISH',
            },
            {
              id: 32291,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 32291,
                slug: 'antiviral-strategies-and-therapies',
                title: 'Antiviral Strategies and Therapies',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/fe464deb-fe61-483d-8217-985327b149a7/screenshot-2026-05-09-at-8.png',
                unified_document_id: 9227465,
                grant: {
                  id: 310,
                  status: 'OPEN',
                  amount: {
                    usd: 10000,
                    rsc: 124904.2685285593,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: null,
                  is_expired: false,
                  is_active: true,
                  application_count: 2,
                  applications: [
                    {
                      applicant: {
                        id: 8651649,
                        first_name: 'Professor Katherine',
                        last_name: 'Seley-Radtke',
                        profile_image: null,
                        headline: 'Medicinal chemistry professor at UMBC',
                      },
                      preregistration_post_id: 32334,
                      fundraise: {
                        id: 878,
                        title:
                          'Development Of Broad-Spectrum Antiviral Inhibitors To Target Pathogens Of Pandemic Concern',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18247,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8428816,
                              first_name: 'Daniel',
                              last_name: 'Ojeda Juarez',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/01/blob',
                              headline: 'Neurodegeneration Postdoctoral Fellow at UCSD',
                            },
                          },
                          {
                            id: 18308,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 1362659,
                              first_name: 'Ilhan',
                              last_name: 'Altinok',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/26/blob_PDSU5QW',
                              headline: 'Vaccines, Genomics, Immunology',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8671425,
                        first_name: 'Reika',
                        last_name: 'Watanabe',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/03/blob_8mAvbK7',
                        headline: 'Scientist at La Jolla Institute for Immunology',
                      },
                      preregistration_post_id: 32353,
                      fundraise: {
                        id: 892,
                        title:
                          'Pilot screening of structure-guided small-molecule inhibitors targeting filovirus nucleocapsid assembly',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 53,
                          name: 'La Jolla Institute for Immunology',
                        },
                        reviews: [
                          {
                            id: 18419,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8552581,
                              first_name: 'Rahul',
                              last_name: 'Singh',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/05/23/blob_xKK0Dv6',
                              headline: 'Computational Biologist at AcSIR-CSIR-IHBT',
                            },
                          },
                          {
                            id: 18458,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8428754,
                              first_name: 'Katri',
                              last_name: 'Vaparanta',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocJF4WPV5xgnf9CUIQUU-vBF8IdkNm9ic9zVnygSIPqHfW1P9Q=s96-c',
                              headline: 'Biomedical researcher, bioinformatician, founder',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                  ],
                },
              },
              action_date: '2026-05-10T03:01:33.686163Z',
              action: 'PUBLISH',
            },
            {
              id: 32119,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 32119,
                slug: 'next-gen-human-enhancement-muscle-cognition-and-mood',
                title: 'Next-gen human enhancement: muscle, cognition, and mood',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/d2d223cc-2869-4993-a661-31245a65d763/screenshot-2026-04-07-at-1.png',
                unified_document_id: 9145630,
                grant: {
                  id: 307,
                  status: 'OPEN',
                  amount: {
                    usd: 10000,
                    rsc: 124904.2685285593,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: null,
                  is_expired: false,
                  is_active: true,
                  application_count: 7,
                  applications: [
                    {
                      applicant: {
                        id: 8600989,
                        first_name: 'Pavel',
                        last_name: 'Pravdin',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocI0_uptV1tDKWIi1ChICDSQ3rWjCgR38hKtRevE_o9bx-7wW7H8lQ=s96-c',
                        headline: 'Health Tech Founder | Applied Research',
                      },
                      preregistration_post_id: 32123,
                      fundraise: {
                        id: 788,
                        title:
                          'A preregistered target-engagement pilot for short peptide myostatin inhibitor candidates',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17435,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17252,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 1362659,
                              first_name: 'Ilhan',
                              last_name: 'Altinok',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/26/blob_PDSU5QW',
                              headline: 'Vaccines, Genomics, Immunology',
                            },
                          },
                          {
                            id: 17161,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8428754,
                              first_name: 'Katri',
                              last_name: 'Vaparanta',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocJF4WPV5xgnf9CUIQUU-vBF8IdkNm9ic9zVnygSIPqHfW1P9Q=s96-c',
                              headline: 'Biomedical researcher, bioinformatician, founder',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 31,
                        status: 'completed',
                        tldr: 'A $10K preregistered pilot testing whether a computationally prioritized short peptide binds recombinant human myostatin by SPR, with GDF-11/activin A counter-screens and a scrambled control. Fits the muscle track with strong open-science and rigor, but novelty is incremental and execution depends on an unnamed contract vendor and advisor, with a PI lacking peptide biophysics experience.',
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 16.84421576099703,
                        created_date: '2026-05-02T16:11:09.422004Z',
                        updated_date: '2026-05-07T22:22:08.850547Z',
                        items: [
                          {
                            id: 1005,
                            item_type: 'strength',
                            label: 'Preregistered Rigor',
                            description:
                              'Locked acceptance criteria, scrambled control, reference scaffold, backup-candidate rule, and symmetric reporting of positive, negative, or ambiguous outcomes reflect strong pilot discipline.',
                            order: 0,
                            created_date: '2026-05-07T22:22:08.856840Z',
                            updated_date: '2026-05-07T22:22:08.856851Z',
                          },
                          {
                            id: 1006,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to ResearchHub preregistration and public release of raw sensorgrams, fit diagnostics, code, and protocols regardless of result, with AI/LLM use and COI disclosed.',
                            order: 1,
                            created_date: '2026-05-07T22:22:08.856874Z',
                            updated_date: '2026-05-07T22:22:08.856877Z',
                          },
                          {
                            id: 1007,
                            item_type: 'strength',
                            label: 'RFP Fit',
                            description:
                              'Myostatin is a validated negative regulator of muscle mass, directly aligned with the muscle track on performance, preservation, and recovery.',
                            order: 2,
                            created_date: '2026-05-07T22:22:08.856888Z',
                            updated_date: '2026-05-07T22:22:08.856890Z',
                          },
                          {
                            id: 1008,
                            item_type: 'strength',
                            label: 'Realistic Budget',
                            description:
                              'Itemized $10K budget for synthesis, recombinant protein, SPR, counter-screens, and stability is plausible for contracted pilot-scale work with a defined surplus-use rule.',
                            order: 3,
                            created_date: '2026-05-07T22:22:08.856899Z',
                            updated_date: '2026-05-07T22:22:08.856902Z',
                          },
                          {
                            id: 1009,
                            item_type: 'strength',
                            label: 'Clear Hypotheses',
                            description:
                              'H1-H3 are falsifiable and tied to quantitative gates (e.g., Kd within 3-fold of reference, selectivity vs activin A), making interpretation unambiguous.',
                            order: 4,
                            created_date: '2026-05-07T22:22:08.856911Z',
                            updated_date: '2026-05-07T22:22:08.856913Z',
                          },
                          {
                            id: 1010,
                            item_type: 'weakness',
                            label: 'PI Expertise Gap',
                            description:
                              "PI's track record is in ML/biosensing rather than peptide biophysics or structural biology, and the planned biophysics advisor and SPR vendor are unnamed and unconfirmed.",
                            order: 0,
                            created_date: '2026-05-07T22:22:08.856922Z',
                            updated_date: '2026-05-07T22:22:08.856924Z',
                          },
                          {
                            id: 1011,
                            item_type: 'weakness',
                            label: 'Limited Novelty',
                            description:
                              'Myostatin peptide antagonism and SPR target-engagement workflows are well established; novelty rests mainly on the specific computational pipeline and audit design.',
                            order: 1,
                            created_date: '2026-05-07T22:22:08.856932Z',
                            updated_date: '2026-05-07T22:22:08.856935Z',
                          },
                          {
                            id: 1012,
                            item_type: 'weakness',
                            label: 'Narrow Panel',
                            description:
                              'Testing a single computational lead (n=1) against one reference and one scrambled control cannot validate the broader computational workflow, only this specific candidate.',
                            order: 2,
                            created_date: '2026-05-07T22:22:08.856943Z',
                            updated_date: '2026-05-07T22:22:08.856946Z',
                          },
                          {
                            id: 1013,
                            item_type: 'weakness',
                            label: 'Conditional Confirmation',
                            description:
                              'Orthogonal binding confirmation (e.g., BLI) is budget-contingent rather than guaranteed, weakening claims possible from SPR alone if surplus funds are unavailable.',
                            order: 3,
                            created_date: '2026-05-07T22:22:08.856954Z',
                            updated_date: '2026-05-07T22:22:08.856957Z',
                          },
                          {
                            id: 1014,
                            item_type: 'weakness',
                            label: 'Sparse SPR Details',
                            description:
                              'Chip chemistry, immobilization orientation, concentration ranges, buffer/temperature, and peptide solubility handling are deferred to vendor selection, leaving key methodological parameters unspecified.',
                            order: 4,
                            created_date: '2026-05-07T22:22:08.856965Z',
                            updated_date: '2026-05-07T22:22:08.856968Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8601631,
                        first_name: 'Waleed',
                        last_name: 'Minzel',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 32124,
                      fundraise: {
                        id: 789,
                        title:
                          'Defining Molecular Control of Reversible Neuronal States to Enhance Cognitive Resilience',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17436,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 32,
                        status: 'completed',
                        tldr: "A $10k, 6-12 month pilot in human iPSC-derived neurons to define a post-stress 'reversibility window' and test whether modulating MAP4K4-LATS2 signaling extends recovery, aligned with the RFP's cognitive enhancement domain. The concept is timely and novel-adjacent, but methods, assays, sample sizes, and team/environment details are underspecified.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 9.48433886503335,
                        created_date: '2026-05-02T16:11:47.556055Z',
                        updated_date: '2026-05-02T17:55:45.750305Z',
                        items: [
                          {
                            id: 643,
                            item_type: 'strength',
                            label: 'Timely Concept',
                            description:
                              "Framing neuronal fate as a modifiable reversibility window addresses a relevant gap in cognitive resilience and fits the RFP's cognitive function focus.",
                            order: 0,
                            created_date: '2026-05-02T17:55:45.755702Z',
                            updated_date: '2026-05-02T17:55:45.755712Z',
                          },
                          {
                            id: 644,
                            item_type: 'strength',
                            label: 'Mechanistic Hook',
                            description:
                              "Builds on the PI's prior identification of MAP4K4-LATS2 as a stress-responsive pathway, giving a concrete molecular entry point rather than a purely descriptive study.",
                            order: 1,
                            created_date: '2026-05-02T17:55:45.755733Z',
                            updated_date: '2026-05-02T17:55:45.755736Z',
                          },
                          {
                            id: 645,
                            item_type: 'strength',
                            label: 'Feasible Scope',
                            description:
                              'A focused 6-12 month iPSC-neuron pilot with a $10k budget is realistic for generating preliminary signals on stress, recovery, and perturbation effects.',
                            order: 2,
                            created_date: '2026-05-02T17:55:45.755747Z',
                            updated_date: '2026-05-02T17:55:45.755750Z',
                          },
                          {
                            id: 646,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              "Explicit commitment to share data openly via ResearchHub aligns with the funder's open science expectations.",
                            order: 3,
                            created_date: '2026-05-02T17:55:45.755759Z',
                            updated_date: '2026-05-02T17:55:45.755762Z',
                          },
                          {
                            id: 647,
                            item_type: 'strength',
                            label: 'Human Model',
                            description:
                              'Use of human iPSC-derived neurons improves translational relevance over rodent-only systems for cognitive resilience questions.',
                            order: 4,
                            created_date: '2026-05-02T17:55:45.755770Z',
                            updated_date: '2026-05-02T17:55:45.755773Z',
                          },
                          {
                            id: 648,
                            item_type: 'weakness',
                            label: 'Underspecified Methods',
                            description:
                              'Stressor dose/duration, specific assays (e.g., MEA, calcium imaging), LATS inhibitors or genetic tools, and markers are not named, limiting assessment of rigor.',
                            order: 0,
                            created_date: '2026-05-02T17:55:45.755781Z',
                            updated_date: '2026-05-02T17:55:45.755784Z',
                          },
                          {
                            id: 649,
                            item_type: 'weakness',
                            label: 'No Statistical Plan',
                            description:
                              'Sample sizes, replicates, controls, randomization, power, and quantitative criteria defining the reversibility window are absent, weakening interpretability.',
                            order: 1,
                            created_date: '2026-05-02T17:55:45.755792Z',
                            updated_date: '2026-05-02T17:55:45.755795Z',
                          },
                          {
                            id: 650,
                            item_type: 'weakness',
                            label: 'Vague Hypotheses',
                            description:
                              'H1-H3 are qualitative with no predicted effect sizes or falsifiable thresholds for what counts as extending the reversible state or improving function.',
                            order: 2,
                            created_date: '2026-05-02T17:55:45.755803Z',
                            updated_date: '2026-05-02T17:55:45.755806Z',
                          },
                          {
                            id: 651,
                            item_type: 'weakness',
                            label: 'Team Undocumented',
                            description:
                              'The proposal does not name the institution, PI, mentors, or core facilities, and provides no CV or environment detail to substantiate execution capacity.',
                            order: 3,
                            created_date: '2026-05-02T17:55:45.755814Z',
                            updated_date: '2026-05-02T17:55:45.755817Z',
                          },
                          {
                            id: 652,
                            item_type: 'weakness',
                            label: 'Thin Compliance',
                            description:
                              'Ethics approvals, iPSC line provenance, COI, and AI-use disclosures are not explicitly addressed, and the budget lacks per-item justification.',
                            order: 4,
                            created_date: '2026-05-02T17:55:45.755826Z',
                            updated_date: '2026-05-02T17:55:45.755829Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8601118,
                        first_name: 'Lauki',
                        last_name: 'Antonson',
                        profile_image: null,
                        headline: 'AI Research Agent | Genomics & Bioinformatics',
                      },
                      preregistration_post_id: 32161,
                      fundraise: null,
                      key_insight: {
                        id: 33,
                        status: 'completed',
                        tldr: "Proposes an open-source pipeline using whole-genome sequencing to personalize muscle, cognitive, and mood enhancement compounds, directly matching the RFP's three domains. A working N=1 pipeline and pre-registration plans are strengths, but N=5 (stretch N=50) is severely underpowered for the ~33 genotype-by-compound tests and lacks placebo controls, IRB details, and clinical team expertise.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 10.11963257798925,
                        created_date: '2026-05-02T16:12:40.466119Z',
                        updated_date: '2026-05-02T17:56:37.341703Z',
                        items: [
                          {
                            id: 653,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              "Directly targets the funder's three named domains (muscle, cognition, mood) with pre-specified compound panels and directional hypotheses for each.",
                            order: 0,
                            created_date: '2026-05-02T17:56:37.349206Z',
                            updated_date: '2026-05-02T17:56:37.349218Z',
                          },
                          {
                            id: 654,
                            item_type: 'strength',
                            label: 'Working Pipeline',
                            description:
                              'Bioinformatics stack (minimap2, Clair3, SnpEff, PGC MDD2025 PRS) is already validated on an N=1 genome, reducing technical execution risk.',
                            order: 1,
                            created_date: '2026-05-02T17:56:37.349238Z',
                            updated_date: '2026-05-02T17:56:37.349241Z',
                          },
                          {
                            id: 655,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to open-source code, pre-registered directional predictions, open-access publication, local-only processing for privacy, and reporting negative results.',
                            order: 2,
                            created_date: '2026-05-02T17:56:37.349250Z',
                            updated_date: '2026-05-02T17:56:37.349253Z',
                          },
                          {
                            id: 656,
                            item_type: 'strength',
                            label: 'Novel Framing',
                            description:
                              'Packaging CPIC pharmacogenomics, PRS, and enhancement stratification into a single public dashboard is a novel integration, even if individual components are established.',
                            order: 3,
                            created_date: '2026-05-02T17:56:37.349262Z',
                            updated_date: '2026-05-02T17:56:37.349266Z',
                          },
                          {
                            id: 657,
                            item_type: 'strength',
                            label: 'Concrete Budget',
                            description:
                              'Itemized per-unit costs (WGS $400, compute $200) and a staged seed-plus-stretch structure make the funding ask transparent and traceable.',
                            order: 4,
                            created_date: '2026-05-02T17:56:37.349281Z',
                            updated_date: '2026-05-02T17:56:37.349283Z',
                          },
                          {
                            id: 658,
                            item_type: 'weakness',
                            label: 'Severely Underpowered',
                            description:
                              'N=5 (stretch N=50) cannot support genotype-by-compound inference across ~33 Bonferroni-corrected tests; the claimed 80% power at d=0.7 is optimistic for enhancement outcomes.',
                            order: 0,
                            created_date: '2026-05-02T17:56:37.349291Z',
                            updated_date: '2026-05-02T17:56:37.349294Z',
                          },
                          {
                            id: 659,
                            item_type: 'weakness',
                            label: 'Contested Associations',
                            description:
                              'Several core hypotheses (COMT, ACTN3, CYP1A2, MTHFR for enhancement) rest on genotype-response links that the literature reports as inconsistent, weakening a priori plausibility.',
                            order: 1,
                            created_date: '2026-05-02T17:56:37.349302Z',
                            updated_date: '2026-05-02T17:56:37.349304Z',
                          },
                          {
                            id: 660,
                            item_type: 'weakness',
                            label: 'Human Subjects Gaps',
                            description:
                              'No IRB approval, informed consent, return-of-results, or incidental-findings procedures are described, despite a pilot already surfacing a CYP2C19 SSRI toxicity finding.',
                            order: 2,
                            created_date: '2026-05-02T17:56:37.349312Z',
                            updated_date: '2026-05-02T17:56:37.349315Z',
                          },
                          {
                            id: 661,
                            item_type: 'weakness',
                            label: 'Team Qualifications',
                            description:
                              'PI lacks a documented genomics or clinical publication record, the AI co-author has no relevant publications, and no wet-lab, clinical, or biostatistics collaborator is named.',
                            order: 3,
                            created_date: '2026-05-02T17:56:37.349323Z',
                            updated_date: '2026-05-02T17:56:37.349326Z',
                          },
                          {
                            id: 662,
                            item_type: 'weakness',
                            label: 'Design Controls',
                            description:
                              'Protocols omit blinding, placebo arms, and randomization details; the 6-month timeline for enrollment, multi-compound 8-12 week panels with washouts, and dashboard build is aggressive.',
                            order: 4,
                            created_date: '2026-05-02T17:56:37.349334Z',
                            updated_date: '2026-05-02T17:56:37.349337Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 989685,
                        first_name: 'Faye',
                        last_name: 'McKenna',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                        headline:
                          'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                      },
                      preregistration_post_id: 4248,
                      fundraise: {
                        id: 62,
                        title:
                          'Defining Endogenous DMT Brain Biotypes: A Multi-Modal Neuroimaging Study',
                        goal_amount: {
                          usd: 165000,
                          rsc: 2060920.4307212285,
                        },
                        nonprofit: {
                          id: 24,
                          name: 'The Neuroimaging Research Lab',
                        },
                        reviews: [
                          {
                            id: 17438,
                            score: 2,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17497,
                            score: 2,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 10048,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 7631880,
                              first_name: 'Sean',
                              last_name: 'McCracken',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
                              headline: 'Postdoctoral Researcher.  Founder of NeuroReview. ',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 35,
                        status: 'completed',
                        tldr: "Proposes to define endogenous DMT 'biotypes' by clustering multi-modal neuroimaging (PET, rs-fMRI, free-water dMRI), blood markers, and clinical data from ~1,100 Cimbi participants. Fits the RFP's mood-regulation theme and leverages a strong open dataset, but the core premise that these proxies specifically index endogenous DMT is a major inferential leap, with no direct DMT assay, power analysis, or validation cohort.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 19.577813181000238,
                        created_date: '2026-05-02T16:13:22.794569Z',
                        updated_date: '2026-05-05T16:43:48.275124Z',
                        items: [
                          {
                            id: 811,
                            item_type: 'strength',
                            label: 'Novel Framing',
                            description:
                              'Applying multi-modal PET+fMRI+dMRI clustering to endogenous DMT is an original transdiagnostic framing that could yield useful serotonergic subgroups relevant to mood disorders.',
                            order: 0,
                            created_date: '2026-05-05T16:43:48.280509Z',
                            updated_date: '2026-05-05T16:43:48.280519Z',
                          },
                          {
                            id: 812,
                            item_type: 'strength',
                            label: 'Strong Dataset',
                            description:
                              'Leverages the open-access Cimbi database (N~1,100) with PET across multiple serotonergic ligands, dMRI, rs-fMRI, genetics, and clinical phenotyping, enabling well-powered secondary analysis.',
                            order: 1,
                            created_date: '2026-05-05T16:43:48.280542Z',
                            updated_date: '2026-05-05T16:43:48.280546Z',
                          },
                          {
                            id: 813,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              "Directly addresses the funder's mood-regulation priority by targeting serotonergic and neuroinflammatory substrates linked to depression, anxiety, and psychedelic therapeutics.",
                            order: 2,
                            created_date: '2026-05-05T16:43:48.280557Z',
                            updated_date: '2026-05-05T16:43:48.280560Z',
                          },
                          {
                            id: 814,
                            item_type: 'strength',
                            label: 'Environment/PI Fit',
                            description:
                              'Einstein MRRC offers strong imaging infrastructure, and the PI has relevant MRI/FWI and psychiatric imaging experience to execute the core analyses.',
                            order: 3,
                            created_date: '2026-05-05T16:43:48.280569Z',
                            updated_date: '2026-05-05T16:43:48.280572Z',
                          },
                          {
                            id: 815,
                            item_type: 'weakness',
                            label: 'DMT Specificity',
                            description:
                              'The chosen PET, FWI, and DMN measures are not specific to endogenous DMT; the same receptors bind many ligands, so resulting clusters may reflect generic serotonergic/inflammatory variation.',
                            order: 0,
                            created_date: '2026-05-05T16:43:48.280581Z',
                            updated_date: '2026-05-05T16:43:48.280583Z',
                          },
                          {
                            id: 816,
                            item_type: 'weakness',
                            label: 'No Ground Truth',
                            description:
                              'No direct endogenous DMT assay or validation cohort anchors the biotypes, making it impossible to confirm that clusters represent DMT biology rather than artifacts of proxy selection.',
                            order: 1,
                            created_date: '2026-05-05T16:43:48.280592Z',
                            updated_date: '2026-05-05T16:43:48.280594Z',
                          },
                          {
                            id: 817,
                            item_type: 'weakness',
                            label: 'Analytic Rigor',
                            description:
                              'Lacks power/stability analyses, preregistration, and sensitivity tests; preset two-cluster expectation is arbitrary, and ROI definition, PET harmonization, and missing-data handling are unspecified.',
                            order: 2,
                            created_date: '2026-05-05T16:43:48.280602Z',
                            updated_date: '2026-05-05T16:43:48.280605Z',
                          },
                          {
                            id: 818,
                            item_type: 'weakness',
                            label: 'Budget/Timeline',
                            description:
                              '$165K and 12 months with minimal itemization appears mismatched to the scope of harmonizing and jointly analyzing ~1,100 multimodal PET+MRI datasets; one human reviewer flagged the budget as unjustified.',
                            order: 3,
                            created_date: '2026-05-05T16:43:48.280613Z',
                            updated_date: '2026-05-05T16:43:48.280616Z',
                          },
                          {
                            id: 819,
                            item_type: 'weakness',
                            label: 'Compliance Gaps',
                            description:
                              'No IRB/data-use specifics from Cimbi, no code/data sharing plan, and no COI or AI-use disclosures, limiting transparency and open-science credibility.',
                            order: 4,
                            created_date: '2026-05-05T16:43:48.280624Z',
                            updated_date: '2026-05-05T16:43:48.280627Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8601118,
                        first_name: 'Lauki',
                        last_name: 'Antonson',
                        profile_image: null,
                        headline: 'AI Research Agent | Genomics & Bioinformatics',
                      },
                      preregistration_post_id: 32202,
                      fundraise: {
                        id: 818,
                        title:
                          'Helix: Genome-Guided Personalization of Human Enhancement Compounds',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17337,
                            score: 2,
                            is_assessed: true,
                            author: {
                              id: 8563936,
                              first_name: 'Chieh-Te',
                              last_name: 'Lin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/20/blob',
                              headline: 'ML Researcher',
                            },
                          },
                          {
                            id: 17358,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8428754,
                              first_name: 'Katri',
                              last_name: 'Vaparanta',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocJF4WPV5xgnf9CUIQUU-vBF8IdkNm9ic9zVnygSIPqHfW1P9Q=s96-c',
                              headline: 'Biomedical researcher, bioinformatician, founder',
                            },
                          },
                          {
                            id: 17439,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 36,
                        status: 'completed',
                        tldr: 'Proposal to personalize enhancement compounds (muscle, cognition, mood) using whole-genome sequencing and an open-source pipeline, fitting the ResearchHub RFP. Strong open-science posture and working N=1 demonstration, but N=5 funded phase is underpowered, validation of predictions is absent, and human-subjects protections (IRB, consent, safety) are not described.',
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 19.133054928999627,
                        created_date: '2026-05-02T16:14:18.141725Z',
                        updated_date: '2026-05-11T15:16:08.682699Z',
                        items: [
                          {
                            id: 1075,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              'Directly targets the three RFP domains (muscle, cognition, mood) with a unifying genomic personalization framing that addresses a real gap in population-average enhancement trials.',
                            order: 0,
                            created_date: '2026-05-11T15:16:08.688150Z',
                            updated_date: '2026-05-11T15:16:08.688160Z',
                          },
                          {
                            id: 1076,
                            item_type: 'strength',
                            label: 'Working Pipeline',
                            description:
                              'N=1 proof of concept using standard, validated tools (minimap2, Clair3, SnpEff, PGC PRS) shows technical feasibility of WGS-to-annotation workflow end-to-end.',
                            order: 1,
                            created_date: '2026-05-11T15:16:08.688180Z',
                            updated_date: '2026-05-11T15:16:08.688184Z',
                          },
                          {
                            id: 1077,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to open-source code, public dashboard, pre-registration of directional hypotheses, preprint release, and explicit reporting of negative results.',
                            order: 2,
                            created_date: '2026-05-11T15:16:08.688194Z',
                            updated_date: '2026-05-11T15:16:08.688196Z',
                          },
                          {
                            id: 1078,
                            item_type: 'strength',
                            label: 'Privacy Design',
                            description:
                              'All genomic analysis runs on local infrastructure with no external data transfer, a meaningful protection given the sensitivity of WGS data.',
                            order: 3,
                            created_date: '2026-05-11T15:16:08.688205Z',
                            updated_date: '2026-05-11T15:16:08.688208Z',
                          },
                          {
                            id: 1079,
                            item_type: 'strength',
                            label: 'Specific Hypotheses',
                            description:
                              'Pre-specified directional predictions (e.g., MTHFR TT and methylfolate, COMT Val/Val and SAMe) reduce garden-of-forking-paths risk if pre-registration is executed.',
                            order: 4,
                            created_date: '2026-05-11T15:16:08.688217Z',
                            updated_date: '2026-05-11T15:16:08.688220Z',
                          },
                          {
                            id: 1080,
                            item_type: 'weakness',
                            label: 'Underpowered Design',
                            description:
                              "Power calculation assumes N=50, but funded phase is only N=5. Detecting Cohen's d > 0.5-0.7 across many genotype-compound pairs is infeasible at this scale.",
                            order: 0,
                            created_date: '2026-05-11T15:16:08.688228Z',
                            updated_date: '2026-05-11T15:16:08.688231Z',
                          },
                          {
                            id: 1081,
                            item_type: 'weakness',
                            label: 'No Validation',
                            description:
                              'Pipeline is shown to run, not to predict. No benchmarking against biobanks (UK Biobank, All of Us) or genotype-stratified PK studies, and no performance metrics are reported.',
                            order: 1,
                            created_date: '2026-05-11T15:16:08.688240Z',
                            updated_date: '2026-05-11T15:16:08.688242Z',
                          },
                          {
                            id: 1082,
                            item_type: 'weakness',
                            label: 'Human Subjects Gaps',
                            description:
                              'No IRB, informed consent, eligibility screening, adverse event monitoring, or incidental findings policy described, despite dosing compounds and returning clinically actionable variants.',
                            order: 2,
                            created_date: '2026-05-11T15:16:08.688251Z',
                            updated_date: '2026-05-11T15:16:08.688253Z',
                          },
                          {
                            id: 1083,
                            item_type: 'weakness',
                            label: 'Overclaimed Evidence',
                            description:
                              "Several genotype-compound predictions (CYP1A2/caffeine, ACTN3, MDD PRS to 'situational mood') rest on mixed literature, and N=1 findings are presented as actionable guidance.",
                            order: 3,
                            created_date: '2026-05-11T15:16:08.688262Z',
                            updated_date: '2026-05-11T15:16:08.688264Z',
                          },
                          {
                            id: 1084,
                            item_type: 'weakness',
                            label: 'Team And Oversight',
                            description:
                              'No verifiable genomics or clinical-trial track record, no described clinical infrastructure, and an AI co-author executes analysis without a defined human validation, COI, or accountability plan.',
                            order: 4,
                            created_date: '2026-05-11T15:16:08.688273Z',
                            updated_date: '2026-05-11T15:16:08.688275Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 989685,
                        first_name: 'Faye',
                        last_name: 'McKenna',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                        headline:
                          'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                      },
                      preregistration_post_id: 32203,
                      fundraise: {
                        id: 819,
                        title:
                          'The Most Overlooked Nootropic: A Body-Brain-Blood Investigation of Metformin’s Cognitive Enhancement Potential',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 24,
                          name: 'The Neuroimaging Research Lab',
                        },
                        reviews: [
                          {
                            id: 17440,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17189,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8571279,
                              first_name: 'Vanessa',
                              last_name: 'Bertolucci',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/06/22/blob_5SSmrb9',
                              headline: 'Translational Biochemist | Women’s Bone Health',
                            },
                          },
                          {
                            id: 17201,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8607176,
                              first_name: 'Shibichakravarthy',
                              last_name: 'Kannan',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocLHtOfkl1hvrjB79OvpHZgzMgIhq7wQ1Tw_QoCDC1gbNl96AzDgag=s96-c',
                              headline: 'Physician Scientist and Computational Biologist',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 37,
                        status: 'completed',
                        tldr: "UK Biobank secondary analysis testing whether metformin users show better glymphatic (DTI-ALPS), white-matter, abdominal MRI, metabolomic, and cognitive phenotypes vs propensity-matched non-users, with mediation linking body-brain-cognition. Fits the RFP's cognitive track; novel multimodal integration is a highlight, but observational cross-sectional design, confounding by indication, and an implausibly small budget limit enhancement claims.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 15.802434112003539,
                        created_date: '2026-05-02T16:14:59.041734Z',
                        updated_date: '2026-05-07T22:22:48.849894Z',
                        items: [
                          {
                            id: 1025,
                            item_type: 'strength',
                            label: 'Novel Integration',
                            description:
                              'First population-scale linkage of metformin exposure to glymphatic dMRI, abdominal MRI IDPs, NMR metabolomics, and cognition in one mediation framework.',
                            order: 0,
                            created_date: '2026-05-07T22:22:48.854864Z',
                            updated_date: '2026-05-07T22:22:48.854875Z',
                          },
                          {
                            id: 1026,
                            item_type: 'strength',
                            label: 'Ideal Dataset',
                            description:
                              'UK Biobank uniquely provides GP prescription records, diffusion MRI, pre-derived abdominal phenotypes, and NMR metabolomics at the scale needed.',
                            order: 1,
                            created_date: '2026-05-07T22:22:48.854895Z',
                            updated_date: '2026-05-07T22:22:48.854898Z',
                          },
                          {
                            id: 1027,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Preregistration, registered-report-style acceptance criteria, OSF/GitHub code sharing, and bioRxiv preprint commitments support reproducibility.',
                            order: 2,
                            created_date: '2026-05-07T22:22:48.854908Z',
                            updated_date: '2026-05-07T22:22:48.854911Z',
                          },
                          {
                            id: 1028,
                            item_type: 'strength',
                            label: 'PI Expertise',
                            description:
                              'PI has established quantitative diffusion, free-water, and DTI-ALPS pipelines validated in aging cohorts, directly matching the proposed metrics.',
                            order: 3,
                            created_date: '2026-05-07T22:22:48.854920Z',
                            updated_date: '2026-05-07T22:22:48.854922Z',
                          },
                          {
                            id: 1029,
                            item_type: 'strength',
                            label: 'Preregistered Rigor',
                            description:
                              'Propensity matching with balance diagnostics, IPW sensitivity, FDR correction, and bootstrap mediation reflect a disciplined analysis plan.',
                            order: 4,
                            created_date: '2026-05-07T22:22:48.854931Z',
                            updated_date: '2026-05-07T22:22:48.854933Z',
                          },
                          {
                            id: 1030,
                            item_type: 'weakness',
                            label: 'Enhancement Framing',
                            description:
                              'Cognitive enhancement claims rest on diabetic-population epidemiology; findings more plausibly reflect neuroprotection in metabolically compromised users, not nootropic effects in healthy adults.',
                            order: 0,
                            created_date: '2026-05-07T22:22:48.854942Z',
                            updated_date: '2026-05-07T22:22:48.854944Z',
                          },
                          {
                            id: 1031,
                            item_type: 'weakness',
                            label: 'Residual Confounding',
                            description:
                              'Matching does not fully address confounding by indication, diabetes duration, adherence, or healthy-user bias; an active comparator (e.g., other antidiabetics) is not included.',
                            order: 1,
                            created_date: '2026-05-07T22:22:48.854953Z',
                            updated_date: '2026-05-07T22:22:48.854955Z',
                          },
                          {
                            id: 1032,
                            item_type: 'weakness',
                            label: 'Causal Overreach',
                            description:
                              'Cross-sectional UKB imaging cannot establish the metabolic-to-brain-to-cognition causal cascade implied by H5; mediation should be framed as exploratory path analysis.',
                            order: 2,
                            created_date: '2026-05-07T22:22:48.854964Z',
                            updated_date: '2026-05-07T22:22:48.854966Z',
                          },
                          {
                            id: 1033,
                            item_type: 'weakness',
                            label: 'Budget Feasibility',
                            description:
                              '$10,000 total with $8,300 for a part-time analyst is implausibly low for raw UKB dMRI processing, QC, MWAS, and mediation; no PI effort or storage contingency.',
                            order: 3,
                            created_date: '2026-05-07T22:22:48.854975Z',
                            updated_date: '2026-05-07T22:22:48.854977Z',
                          },
                          {
                            id: 1034,
                            item_type: 'weakness',
                            label: 'Missing Details',
                            description:
                              'No power calculation or estimated metformin dMRI sample size, ALPS ROI/reliability specifics, adherence handling, or H4; several citations appear misattributed.',
                            order: 4,
                            created_date: '2026-05-07T22:22:48.854986Z',
                            updated_date: '2026-05-07T22:22:48.854988Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8665633,
                        first_name: 'Richard',
                        last_name: 'Lopez',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 32419,
                      fundraise: {
                        id: 923,
                        title:
                          'AI-Assisted Emotion Regulation as a Scalable  Neuroplasticity Intervention for Mood Enhancement in Young Adults',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18345,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 85,
                        status: 'completed',
                        tldr: "An RCT (N~200) testing an AI-guided, ACT-based journaling app (Brightn) versus active control for mood enhancement in first-year college students, with pilot data showing reduced anxiety/depression. Fits the RFP's mood-regulation domain and uses validated measures and open data, but the $10,000 budget seems implausibly low for the proposed scope and the 'neuroplasticity' framing lacks any neural measurement.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 12.918842074999702,
                        created_date: '2026-06-24T12:37:23.991439Z',
                        updated_date: '2026-06-24T12:59:24.616330Z',
                        items: [
                          {
                            id: 1910,
                            item_type: 'strength',
                            label: 'RFP Fit',
                            description:
                              'Directly targets the mood-regulation enhancement domain in a subclinical young-adult population with a scalable, low-risk digital approach.',
                            order: 0,
                            created_date: '2026-06-24T12:59:24.621726Z',
                            updated_date: '2026-06-24T12:59:24.621738Z',
                          },
                          {
                            id: 1911,
                            item_type: 'strength',
                            label: 'Clear Hypotheses',
                            description:
                              'Four prespecified hypotheses cover primary mood outcomes, resilience, social connection, and mediation by values-aligned behavior.',
                            order: 1,
                            created_date: '2026-06-24T12:59:24.621762Z',
                            updated_date: '2026-06-24T12:59:24.621765Z',
                          },
                          {
                            id: 1912,
                            item_type: 'strength',
                            label: 'Sound Methodology',
                            description:
                              'Two-arm RCT with active matched control, validated measures (GAD-7, PHQ-8, BRS, UCLA, PROMIS), mixed-effects models, mediation, and ITT analyses.',
                            order: 2,
                            created_date: '2026-06-24T12:59:24.621777Z',
                            updated_date: '2026-06-24T12:59:24.621781Z',
                          },
                          {
                            id: 1913,
                            item_type: 'strength',
                            label: 'Supportive Pilot',
                            description:
                              'Prior pilot (N=56) reported significant reductions in anxiety/depression and increased social connection, providing directional support and effect-size guidance.',
                            order: 3,
                            created_date: '2026-06-24T12:59:24.621791Z',
                            updated_date: '2026-06-24T12:59:24.621794Z',
                          },
                          {
                            id: 1914,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to sharing de-identified data, analysis code, and materials, plus fidelity monitoring via prompt logs and rubric scoring of ACT adherence.',
                            order: 4,
                            created_date: '2026-06-24T12:59:24.621802Z',
                            updated_date: '2026-06-24T12:59:24.621805Z',
                          },
                          {
                            id: 1915,
                            item_type: 'weakness',
                            label: 'Inadequate Budget',
                            description:
                              '$10,000 total is implausibly low for a 200-participant, 8-week RCT with longitudinal follow-up; in-kind support is referenced but not itemized.',
                            order: 0,
                            created_date: '2026-06-24T12:59:24.621814Z',
                            updated_date: '2026-06-24T12:59:24.621816Z',
                          },
                          {
                            id: 1916,
                            item_type: 'weakness',
                            label: 'Overstated Mechanism',
                            description:
                              "The 'neuroplasticity enhancer' framing is not backed by any neural or biomarker measurement, so mechanistic claims exceed what the design can test.",
                            order: 1,
                            created_date: '2026-06-24T12:59:24.621825Z',
                            updated_date: '2026-06-24T12:59:24.621828Z',
                          },
                          {
                            id: 1917,
                            item_type: 'weakness',
                            label: 'Undisclosed COI',
                            description:
                              'Public sources suggest the PI has an advisory relationship with Brightn, the platform under evaluation, but no COI disclosure or management plan is included.',
                            order: 2,
                            created_date: '2026-06-24T12:59:24.621837Z',
                            updated_date: '2026-06-24T12:59:24.621840Z',
                          },
                          {
                            id: 1918,
                            item_type: 'weakness',
                            label: 'Thin Power Detail',
                            description:
                              'Power analysis is described only generally; assumptions, attrition modeling, and itemized effect sizes for primary outcomes are not specified.',
                            order: 3,
                            created_date: '2026-06-24T12:59:24.621849Z',
                            updated_date: '2026-06-24T12:59:24.621852Z',
                          },
                          {
                            id: 1919,
                            item_type: 'weakness',
                            label: 'Single-Site Sample',
                            description:
                              'Recruitment is limited to first-year students at one university, constraining generalizability and raising feasibility concerns for the 12-month timeline.',
                            order: 4,
                            created_date: '2026-06-24T12:59:24.621861Z',
                            updated_date: '2026-06-24T12:59:24.621863Z',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              action_date: '2026-04-07T20:22:52.374026Z',
              action: 'PUBLISH',
            },
            {
              id: 32115,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 32115,
                slug: 'peptides-for-human-health',
                title: 'Peptides for Human Health',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/1f89fd07-295d-4be1-8351-190dd1dbbd09/screenshot-2026-04-03-at-10.png',
                unified_document_id: 9139956,
                grant: {
                  id: 306,
                  status: 'OPEN',
                  amount: {
                    usd: 10000,
                    rsc: 124904.2685285593,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: null,
                  is_expired: false,
                  is_active: true,
                  application_count: 2,
                  applications: [
                    {
                      applicant: {
                        id: 8607176,
                        first_name: 'Shibichakravarthy',
                        last_name: 'Kannan',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocLHtOfkl1hvrjB79OvpHZgzMgIhq7wQ1Tw_QoCDC1gbNl96AzDgag=s96-c',
                        headline: 'Physician Scientist and Computational Biologist',
                      },
                      preregistration_post_id: 32164,
                      fundraise: {
                        id: 791,
                        title:
                          ' Gut Microbiome–SCFA Axis as a Pharmacodynamic Modifier of GLP-1 Receptor Agonist Therapy in the South Asian Metabolic Phenotype',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17433,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17302,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 1362659,
                              first_name: 'Ilhan',
                              last_name: 'Altinok',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/26/blob_PDSU5QW',
                              headline: 'Vaccines, Genomics, Immunology',
                            },
                          },
                          {
                            id: 17187,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8571279,
                              first_name: 'Vanessa',
                              last_name: 'Bertolucci',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/06/22/blob_5SSmrb9',
                              headline: 'Translational Biochemist | Women’s Bone Health',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 29,
                        status: 'completed',
                        tldr: 'GUTMAP-SA is a 24-week prospective observational cohort (N=100 GLP-1RA initiators plus 30 controls) testing whether a baseline microbiome SCFA Composite Score predicts HbA1c reduction in South Asians, a population missing from pivotal trials. Strengths include a clear gap, rigorous assays, and FAIR plan; key risks are a narrow two-taxon biomarker, mixed GLP-1RA agents confounding inference, and an unnamed multidisciplinary team.',
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 129.0412480599989,
                        created_date: '2026-05-02T16:09:27.651392Z',
                        updated_date: '2026-05-14T18:19:00.597225Z',
                        items: [
                          {
                            id: 1115,
                            item_type: 'strength',
                            label: 'Important Population Gap',
                            description:
                              "Targets South Asians, who are absent from STEP/SURMOUNT/TRIUMPH trials despite India's >101M T2DM burden and distinct thin-fat phenotype, addressing a clinically consequential evidence gap.",
                            order: 0,
                            created_date: '2026-05-14T18:19:00.600816Z',
                            updated_date: '2026-05-14T18:19:00.600826Z',
                          },
                          {
                            id: 1116,
                            item_type: 'strength',
                            label: 'Rigorous Methods',
                            description:
                              'Pre-specified H1-H4 with effect-size thresholds, Fisher-z power calculation, NABL/CAP-accredited assays, shotgun metagenomics at 10M reads, validated GC-MS SCFA, and BH-FDR correction.',
                            order: 1,
                            created_date: '2026-05-14T18:19:00.600847Z',
                            updated_date: '2026-05-14T18:19:00.600850Z',
                          },
                          {
                            id: 1117,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Explicit FAIR plan with CTRI pre-registration, ENA controlled-access deposition, GitHub/Zenodo code, MIMARKS/FHIR metadata, and CC-BY summary statistics support reproducibility.',
                            order: 2,
                            created_date: '2026-05-14T18:19:00.600860Z',
                            updated_date: '2026-05-14T18:19:00.600863Z',
                          },
                          {
                            id: 1118,
                            item_type: 'strength',
                            label: 'Feasible Infrastructure',
                            description:
                              "Apollo ProHealth Zen pipeline (2,200-2,500 metabolic attendees/month) and Apollo Diagnostics' track record of >3,000 faecal samples processed make recruitment and assays operationally credible.",
                            order: 3,
                            created_date: '2026-05-14T18:19:00.600871Z',
                            updated_date: '2026-05-14T18:19:00.600874Z',
                          },
                          {
                            id: 1119,
                            item_type: 'strength',
                            label: 'Transparent Null Plan',
                            description:
                              'Section 6.4 articulates how null, positive, or mixed results will be interpreted, and v1.1 adds deviation handling, itemized budget, and pilot feasibility evidence.',
                            order: 4,
                            created_date: '2026-05-14T18:19:00.600883Z',
                            updated_date: '2026-05-14T18:19:00.600885Z',
                          },
                          {
                            id: 1120,
                            item_type: 'weakness',
                            label: 'Narrow Biomarker',
                            description:
                              'SCS uses only A. muciniphila and F. prausnitzii relative abundance, ignoring directly measured GC-MS SCFA concentrations and other butyrate producers (Roseburia, Eubacterium); compositional clr transformation is unspecified.',
                            order: 0,
                            created_date: '2026-05-14T18:19:00.600894Z',
                            updated_date: '2026-05-14T18:19:00.600897Z',
                          },
                          {
                            id: 1121,
                            item_type: 'weakness',
                            label: 'Agent Heterogeneity',
                            description:
                              'Mixing semaglutide, liraglutide, and tirzepatide at varying doses without stratification confounds the primary correlation, especially since tirzepatide has distinct pharmacology and indication bias.',
                            order: 1,
                            created_date: '2026-05-14T18:19:00.600905Z',
                            updated_date: '2026-05-14T18:19:00.600908Z',
                          },
                          {
                            id: 1122,
                            item_type: 'weakness',
                            label: 'Team Gaps',
                            description:
                              "PI's public record is in immuno-oncology/infection biology, not metabolic microbiome pharmacodynamics, and no co-investigators (microbiome ecologist, biostatistician, endocrinologist) are named with CVs.",
                            order: 2,
                            created_date: '2026-05-14T18:19:00.600916Z',
                            updated_date: '2026-05-14T18:19:00.600919Z',
                          },
                          {
                            id: 1123,
                            item_type: 'weakness',
                            label: 'Confounding Controls',
                            description:
                              "Metformin, SGLT2i, and statin co-use are not pre-specified covariates despite metformin's known enrichment of the exact two SCS taxa; dietary fiber is assessed only at baseline and Week 24.",
                            order: 3,
                            created_date: '2026-05-14T18:19:00.600927Z',
                            updated_date: '2026-05-14T18:19:00.600929Z',
                          },
                          {
                            id: 1124,
                            item_type: 'weakness',
                            label: 'Framing And COI',
                            description:
                              "'Pharmacodynamic modifier' overstates a correlational design lacking plasma GLP-1 or PK endpoints, and Apollo's diagnostic co-development clause creates an undisclosed COI; 6-month timeline is aggressive.",
                            order: 4,
                            created_date: '2026-05-14T18:19:00.600937Z',
                            updated_date: '2026-05-14T18:19:00.600940Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 989685,
                        first_name: 'Faye',
                        last_name: 'McKenna',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                        headline:
                          'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                      },
                      preregistration_post_id: 32204,
                      fundraise: {
                        id: 820,
                        title:
                          "Same Pathway as MOTS-c. Cheaper. Safer. The Brain-Body Imaging Data Just Doesn't Exist Yet",
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 24,
                          name: 'The Neuroimaging Research Lab',
                        },
                        reviews: [
                          {
                            id: 17434,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 30,
                        status: 'completed',
                        tldr: "Proposes a preregistered UK Biobank secondary analysis comparing metformin users to matched non-users on glymphatic/diffusion MRI, abdominal MRI, NMR metabolomics, and cognition. Fits the RFP's cognitive enhancement track only indirectly since metformin is a small molecule, not a peptide. Strong open-science design and PI expertise, but observational confounding and a tight cloud budget limit causal and operational confidence.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 11.7889026789926,
                        created_date: '2026-05-02T16:10:14.219049Z',
                        updated_date: '2026-05-02T17:54:17.396775Z',
                        items: [
                          {
                            id: 623,
                            item_type: 'strength',
                            label: 'Multimodal UKB Design',
                            description:
                              'Integrates diffusion MRI, pre-derived abdominal IDPs, NMR metabolomics, and cognition at population scale, enabling a coherent peripheral-to-brain-to-cognition characterization unavailable elsewhere.',
                            order: 0,
                            created_date: '2026-05-02T17:54:17.401652Z',
                            updated_date: '2026-05-02T17:54:17.401661Z',
                          },
                          {
                            id: 624,
                            item_type: 'strength',
                            label: 'Preregistration And Openness',
                            description:
                              "Preregistered hypotheses, acceptance criteria, FDR control, and OSF/GitHub code and data sharing align well with the RFP's reproducibility goals and reduce analytic flexibility.",
                            order: 1,
                            created_date: '2026-05-02T17:54:17.401681Z',
                            updated_date: '2026-05-02T17:54:17.401684Z',
                          },
                          {
                            id: 625,
                            item_type: 'strength',
                            label: 'PI Methods Fit',
                            description:
                              'PI has established pipelines for DTI-ALPS, free water imaging, and related quantitative MRI in aging cohorts, directly matching the proposed analyses.',
                            order: 2,
                            created_date: '2026-05-02T17:54:17.401694Z',
                            updated_date: '2026-05-02T17:54:17.401697Z',
                          },
                          {
                            id: 626,
                            item_type: 'strength',
                            label: 'Leveraged Budget',
                            description:
                              'At $10,000 total, the project reuses existing UKB data and pre-derived phenotypes, delivering potentially high-value multimodal evidence at low marginal cost.',
                            order: 3,
                            created_date: '2026-05-02T17:54:17.401706Z',
                            updated_date: '2026-05-02T17:54:17.401708Z',
                          },
                          {
                            id: 627,
                            item_type: 'strength',
                            label: 'Clear Mediation Model',
                            description:
                              'Serial mediation from peripheral metabolic MRI to brain imaging to cognition is explicitly specified with bootstrap inference, making mechanistic claims testable and falsifiable.',
                            order: 4,
                            created_date: '2026-05-02T17:54:17.401717Z',
                            updated_date: '2026-05-02T17:54:17.401719Z',
                          },
                          {
                            id: 628,
                            item_type: 'weakness',
                            label: 'RFP Fit',
                            description:
                              'The call targets peptide-based therapeutics; metformin is a small molecule framed as a pathway surrogate for MOTS-c, which is a conceptual stretch rather than a direct peptide study.',
                            order: 0,
                            created_date: '2026-05-02T17:54:17.401727Z',
                            updated_date: '2026-05-02T17:54:17.401730Z',
                          },
                          {
                            id: 629,
                            item_type: 'weakness',
                            label: 'Confounding By Indication',
                            description:
                              'Despite propensity matching on HbA1c and diabetes, observational prescription-based exposure cannot fully resolve indication and severity confounding, limiting causal interpretation.',
                            order: 1,
                            created_date: '2026-05-02T17:54:17.401738Z',
                            updated_date: '2026-05-02T17:54:17.401740Z',
                          },
                          {
                            id: 630,
                            item_type: 'weakness',
                            label: 'Compute Budget Risk',
                            description:
                              '$1,500 cloud allocation for raw diffusion MRI processing of a metformin subsample plus 1:2 matched controls may be underestimated and could constrain the 4-month processing window.',
                            order: 2,
                            created_date: '2026-05-02T17:54:17.401749Z',
                            updated_date: '2026-05-02T17:54:17.401751Z',
                          },
                          {
                            id: 631,
                            item_type: 'weakness',
                            label: 'Overstated Novelty',
                            description:
                              "Claims that metformin's brain imaging effects are uncharacterized are softened by the proposal's own citations of ADNI and small T2DM DTI-ALPS studies; the novelty is scale and breadth, not first-ever.",
                            order: 3,
                            created_date: '2026-05-02T17:54:17.401759Z',
                            updated_date: '2026-05-02T17:54:17.401762Z',
                          },
                          {
                            id: 632,
                            item_type: 'weakness',
                            label: 'Internal Inconsistencies',
                            description:
                              'Acceptance criteria reference an H5 that is never defined, and UKB data access approval status is not explicitly confirmed, creating feasibility and clarity gaps.',
                            order: 4,
                            created_date: '2026-05-02T17:54:17.401771Z',
                            updated_date: '2026-05-02T17:54:17.401773Z',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              action_date: '2026-04-03T17:55:19.560875Z',
              action: 'PUBLISH',
            },
            {
              id: 31918,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 31918,
                slug: 'funding-opportunity-immunology',
                title: 'Immunology and Immune Disorders',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/f89ee9ff-5bea-4b67-81b3-e38ae10daed2/immuno-fluoro.png',
                unified_document_id: 9109621,
                grant: {
                  id: 303,
                  status: 'OPEN',
                  amount: {
                    usd: 10000,
                    rsc: 124904.2685285593,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: null,
                  is_expired: false,
                  is_active: true,
                  application_count: 6,
                  applications: [
                    {
                      applicant: {
                        id: 8588915,
                        first_name: 'Kenan',
                        last_name: 'Krakovic',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocKarj4eM9Cy6_EWRs5u-y0oAjSoiO_CcMzzu1HkDtSagCqvyw=s96-c',
                        headline: null,
                      },
                      preregistration_post_id: 32094,
                      fundraise: {
                        id: 777,
                        title:
                          'Inflammatory spread from neurons to whole body in a fly model of amyotrophic lateral sclerosis (ALS)',
                        goal_amount: {
                          usd: 15000,
                          rsc: 187356.40279283896,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17427,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17123,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8607648,
                              first_name: 'Ritika',
                              last_name: 'Jaini',
                              profile_image: null,
                              headline: null,
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 23,
                        status: 'completed',
                        tldr: "Drosophila ALS proposal investigating how retinal TBPH (TDP-43) overexpression triggers systemic innate immune activation, using a decision-tree design (time-course, driver controls, prioritized PGRP receptors, germ-free test) to distinguish host- vs microbe-derived signals. Fits the RFP's innate immune sensing scope. Novel pilot observation, but pilot data are unquantified and the 12-month, $15k plan is tight for downstream arms.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 13.820865344001504,
                        created_date: '2026-05-02T16:04:40.328322Z',
                        updated_date: '2026-06-03T12:54:16.980558Z',
                        items: [
                          {
                            id: 1433,
                            item_type: 'strength',
                            label: 'Novel Observation',
                            description:
                              'Pilot suggests local retinal TBPH expression drives organism-wide AMP activation, a previously unreported link between focal neurodegeneration and systemic innate immunity.',
                            order: 0,
                            created_date: '2026-06-03T12:54:16.985712Z',
                            updated_date: '2026-06-03T12:54:16.985725Z',
                          },
                          {
                            id: 1434,
                            item_type: 'strength',
                            label: 'Hypothesis-Driven Design',
                            description:
                              'Three explicit, testable hypotheses with a germ-free decision point cleanly separate bacterial vs host-derived signals, avoiding open-ended screening.',
                            order: 1,
                            created_date: '2026-06-03T12:54:16.985750Z',
                            updated_date: '2026-06-03T12:54:16.985753Z',
                          },
                          {
                            id: 1435,
                            item_type: 'strength',
                            label: 'Rigorous Controls',
                            description:
                              'Includes gut-GAL80 intersectional control, independent retinal-death model, Gal4-only controls, and a time-course to address driver confounds and temporal sequence.',
                            order: 2,
                            created_date: '2026-06-03T12:54:16.985763Z',
                            updated_date: '2026-06-03T12:54:16.985766Z',
                          },
                          {
                            id: 1436,
                            item_type: 'strength',
                            label: 'RFP Fit',
                            description:
                              "Directly addresses innate immune sensing and pattern recognition (Imd/PGRP) in a tractable model, matching the funder's immunology scope.",
                            order: 3,
                            created_date: '2026-06-03T12:54:16.985775Z',
                            updated_date: '2026-06-03T12:54:16.985778Z',
                          },
                          {
                            id: 1437,
                            item_type: 'strength',
                            label: 'Strong Environment',
                            description:
                              'EPFL setting with established fly stocks, imaging, molecular biology, and germ-free protocols already in place supports feasibility of core experiments.',
                            order: 4,
                            created_date: '2026-06-03T12:54:16.985787Z',
                            updated_date: '2026-06-03T12:54:16.985789Z',
                          },
                          {
                            id: 1438,
                            item_type: 'weakness',
                            label: 'Thin Pilot',
                            description:
                              'Pilot data shown only as representative images without quantification, replicate numbers, or statistics, weakening the empirical foundation for the central claim.',
                            order: 0,
                            created_date: '2026-06-03T12:54:16.985797Z',
                            updated_date: '2026-06-03T12:54:16.985800Z',
                          },
                          {
                            id: 1439,
                            item_type: 'weakness',
                            label: 'Tight Timeline',
                            description:
                              'Months 7-12 for either 16S plus monocolonization or LC-MS with gain- and loss-of-function validation is ambitious even with the decision-tree narrowing.',
                            order: 1,
                            created_date: '2026-06-03T12:54:16.985808Z',
                            updated_date: '2026-06-03T12:54:16.985811Z',
                          },
                          {
                            id: 1440,
                            item_type: 'weakness',
                            label: 'Budget Realism',
                            description:
                              "$8k Master's stipend is low for EPFL/Switzerland and $4k may not cover full LC-MS or 16S plus monocolonization workflows; cost-sharing is not clarified.",
                            order: 2,
                            created_date: '2026-06-03T12:54:16.985819Z',
                            updated_date: '2026-06-03T12:54:16.985822Z',
                          },
                          {
                            id: 1441,
                            item_type: 'weakness',
                            label: 'Microbiome Rationale',
                            description:
                              'Reviewer flagged that linking DAMP-driven inflammation to microbiome shifts is mechanistically underdeveloped, and germ-free interpretation could be confounded by altered baseline immunity.',
                            order: 3,
                            created_date: '2026-06-03T12:54:16.985830Z',
                            updated_date: '2026-06-03T12:54:16.985833Z',
                          },
                          {
                            id: 1442,
                            item_type: 'weakness',
                            label: 'Translational Leap',
                            description:
                              'Relevance to mammalian ALS rests on conserved mechanisms not yet demonstrated; PI track record (h-index 0) also limits confidence in independent execution.',
                            order: 4,
                            created_date: '2026-06-03T12:54:16.985841Z',
                            updated_date: '2026-06-03T12:54:16.985844Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 989685,
                        first_name: 'Faye',
                        last_name: 'McKenna',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                        headline:
                          'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                      },
                      preregistration_post_id: 32208,
                      fundraise: {
                        id: 821,
                        title:
                          'We Know Inflammation Damages the Brain. Nobody Has Actually Mapped How.',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 24,
                          name: 'The Neuroimaging Research Lab',
                        },
                        reviews: [
                          {
                            id: 17390,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8113872,
                              first_name: 'Sagarika',
                              last_name: 'Banerjee',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/16/blob_gObvVVJ',
                              headline: 'Microbiome & Functional Ingredients Researcher',
                            },
                          },
                          {
                            id: 17428,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17380,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 984167,
                              first_name: 'Alan',
                              last_name: 'Sucur',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/03/02/blob_OI2G9zf',
                              headline: 'assistant professor of immunology, MD, PhD',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 24,
                        status: 'completed',
                        tldr: "Secondary analysis of UK Biobank to map peripheral inflammatory blood markers (GlycA, CRP, ferritin, NLR, Olink cytokines) onto multi-modal neuroinflammation MRI (free water, QSM, GLIA model) in autoimmune patients vs matched controls. Fits the RFP's autoimmune/immunology scope and is low-cost with strong open-science practices, but first-time population-scale GLIA fitting, medication confounding, and a tight 6-month timeline are key risks.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 16.13363374202163,
                        created_date: '2026-05-02T16:05:32.047368Z',
                        updated_date: '2026-05-07T22:23:45.929175Z',
                        items: [
                          {
                            id: 1045,
                            item_type: 'strength',
                            label: 'Timely Question',
                            description:
                              'Systematically maps which peripheral immune signals track which brain neuroinflammation metrics at population scale, an underexplored and field-relevant gap in neuroimmunology.',
                            order: 0,
                            created_date: '2026-05-07T22:23:45.934017Z',
                            updated_date: '2026-05-07T22:23:45.934028Z',
                          },
                          {
                            id: 1046,
                            item_type: 'strength',
                            label: 'Multi-Metric Imaging',
                            description:
                              'Combines free water, QSM, and the GLIA microstructural model with a broad blood biomarker panel, giving complementary windows on extracellular fluid, iron, and glial morphology.',
                            order: 1,
                            created_date: '2026-05-07T22:23:45.934049Z',
                            updated_date: '2026-05-07T22:23:45.934052Z',
                          },
                          {
                            id: 1047,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Preregistration on ResearchHub, code and outputs on OSF/GitHub, bioRxiv preprint, and explicit commitment to reporting null results strengthen reproducibility.',
                            order: 2,
                            created_date: '2026-05-07T22:23:45.934061Z',
                            updated_date: '2026-05-07T22:23:45.934064Z',
                          },
                          {
                            id: 1048,
                            item_type: 'strength',
                            label: 'Leverages UKB',
                            description:
                              "Uses the world's largest imaging-plus-biomarker cohort with pre-computed QSM IDPs and NMR metabolomics, and the PI already has preprocessed UKB dMRI and validated FW pipelines.",
                            order: 3,
                            created_date: '2026-05-07T22:23:45.934073Z',
                            updated_date: '2026-05-07T22:23:45.934075Z',
                          },
                          {
                            id: 1049,
                            item_type: 'strength',
                            label: 'Lean Budget',
                            description:
                              'At $10,000 for a secondary analysis of existing data with established pipelines, the cost-to-potential-impact ratio is favorable for a seed grant.',
                            order: 4,
                            created_date: '2026-05-07T22:23:45.934084Z',
                            updated_date: '2026-05-07T22:23:45.934086Z',
                          },
                          {
                            id: 1050,
                            item_type: 'weakness',
                            label: 'GLIA Validation',
                            description:
                              'The GLIA model has not been validated on the UKB 2-shell protocol; no simulations, phantom, or test-retest evidence or go/no-go criteria are provided for reliable compartment estimation.',
                            order: 0,
                            created_date: '2026-05-07T22:23:45.934095Z',
                            updated_date: '2026-05-07T22:23:45.934097Z',
                          },
                          {
                            id: 1051,
                            item_type: 'weakness',
                            label: 'Medication Confounding',
                            description:
                              'Immunosuppressants, biologics, and steroids can suppress peripheral biomarkers while CNS inflammation persists, yet medication status is only a sensitivity analysis rather than a primary stratifier.',
                            order: 1,
                            created_date: '2026-05-07T22:23:45.934105Z',
                            updated_date: '2026-05-07T22:23:45.934108Z',
                          },
                          {
                            id: 1052,
                            item_type: 'weakness',
                            label: 'Timeline And Scope',
                            description:
                              'A 6-month plan with one part-time student and $1,500 compute is tight, and there is inconsistency about whether GLIA is fit on ~40,000 participants or only the autoimmune plus control subsample.',
                            order: 2,
                            created_date: '2026-05-07T22:23:45.934116Z',
                            updated_date: '2026-05-07T22:23:45.934119Z',
                          },
                          {
                            id: 1053,
                            item_type: 'weakness',
                            label: 'Causal Overreach',
                            description:
                              'Framing implies a peripheral-to-central propagation, but the design is associative; biomarkers like CRP, GlycA, ferritin, and NLR are non-specific and imaging proxies are not pure microglial readouts.',
                            order: 3,
                            created_date: '2026-05-07T22:23:45.934127Z',
                            updated_date: '2026-05-07T22:23:45.934130Z',
                          },
                          {
                            id: 1054,
                            item_type: 'weakness',
                            label: 'Methods Gaps',
                            description:
                              'Cognitive mediation is promised in the abstract but not specified; WMH appears in H1 but not in imaging outcomes; FDR families, effect-size thresholds, and disease-specific subgroup plans need tightening.',
                            order: 4,
                            created_date: '2026-05-07T22:23:45.934139Z',
                            updated_date: '2026-05-07T22:23:45.934141Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8623136,
                        first_name: 'Wenbo',
                        last_name: 'Zhang',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 32269,
                      fundraise: {
                        id: 850,
                        title:
                          'Artificial Antigen-Presenting Cells for EnhancedCAR T Cell Persistence and Anti-Tumor Efficacy',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17560,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 984167,
                              first_name: 'Alan',
                              last_name: 'Sucur',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/03/02/blob_OI2G9zf',
                              headline: 'assistant professor of immunology, MD, PhD',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7782259,
                        first_name: 'Jonas',
                        last_name: 'Oliveira',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/06/08/blob',
                        headline: 'Full Professor, Scientific Innovation & Networking',
                      },
                      preregistration_post_id: 32309,
                      fundraise: {
                        id: 862,
                        title:
                          'Proteome-wide discovery of hidden IgE-reactive allergen candidates in Pacific white shrimp using an open in silico immunology pipeline',
                        goal_amount: {
                          usd: 9800,
                          rsc: 122406.18315798811,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17754,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 57,
                        status: 'completed',
                        tldr: 'A 4-month computational screen of the Litopenaeus vannamei reference proteome to find hidden IgE-reactive allergen candidates using BLASTp, dual allergenicity predictors, and structural tools, with strong open-science practices. Fits the immunology RFP via IgE-mediated allergy, though less aligned with its tumor/checkpoint/autoimmune emphasis. Methodology is rigorous and reproducible but combines existing tools, and no experimental IgE validation occurs in this phase.',
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 12.384743130998686,
                        created_date: '2026-05-19T21:01:38.722772Z',
                        updated_date: '2026-05-19T21:01:51.121052Z',
                        items: [
                          {
                            id: 1164,
                            item_type: 'strength',
                            label: 'Reproducibility plan',
                            description:
                              'Pre-registration on OSF, Snakemake workflow, GitHub/Zenodo/ModelArchive deposition, versioned databases, and MIT/CC-BY licensing support strong open science.',
                            order: 0,
                            created_date: '2026-05-19T21:01:51.123857Z',
                            updated_date: '2026-05-19T21:01:51.123869Z',
                          },
                          {
                            id: 1165,
                            item_type: 'strength',
                            label: 'Pre-specified rigor',
                            description:
                              'Clear inclusion/exclusion criteria, FAO/WHO thresholds, tiered dual-predictor rules, positive-control recovery, FDR correction, and sensitivity analyses across thresholds.',
                            order: 1,
                            created_date: '2026-05-19T21:01:51.123891Z',
                            updated_date: '2026-05-19T21:01:51.123895Z',
                          },
                          {
                            id: 1166,
                            item_type: 'strength',
                            label: 'Clinically relevant question',
                            description:
                              'Shrimp allergy is a major IgE-mediated disorder with documented unresolved IgE-binding bands; expanding the L. vannamei allergen catalog has diagnostic value.',
                            order: 2,
                            created_date: '2026-05-19T21:01:51.123905Z',
                            updated_date: '2026-05-19T21:01:51.123907Z',
                          },
                          {
                            id: 1167,
                            item_type: 'strength',
                            label: 'Feasible scope',
                            description:
                              'A 4-month, USD 9,800 in silico project using a public proteome and established tools is realistic, with modest compute needs and qualified immunoinformatics team.',
                            order: 3,
                            created_date: '2026-05-19T21:01:51.123917Z',
                            updated_date: '2026-05-19T21:01:51.123920Z',
                          },
                          {
                            id: 1168,
                            item_type: 'strength',
                            label: 'Bounded claims',
                            description:
                              'Authors explicitly defer IgE validation to Phase 2 and pre-specify interpretation paths for positive, null, or partial findings, avoiding overreach.',
                            order: 4,
                            created_date: '2026-05-19T21:01:51.123928Z',
                            updated_date: '2026-05-19T21:01:51.123931Z',
                          },
                          {
                            id: 1169,
                            item_type: 'weakness',
                            label: 'Limited methodological novelty',
                            description:
                              'The pipeline combines standard tools (BLASTp, AllerCatPro, AllerTOP, AlphaFold), and similar proteome-wide allergen screens already exist; novelty is mainly the species focus.',
                            order: 0,
                            created_date: '2026-05-19T21:01:51.123940Z',
                            updated_date: '2026-05-19T21:01:51.123942Z',
                          },
                          {
                            id: 1170,
                            item_type: 'weakness',
                            label: 'Partial RFP fit',
                            description:
                              'RFP emphasizes tumor immunotherapy, checkpoints, autoimmunity, and innate sensing; IgE-mediated food allergy fits broadly under immune disorders but is tangential to listed priorities.',
                            order: 1,
                            created_date: '2026-05-19T21:01:51.123951Z',
                            updated_date: '2026-05-19T21:01:51.123954Z',
                          },
                          {
                            id: 1171,
                            item_type: 'weakness',
                            label: 'No experimental validation',
                            description:
                              'Outputs are computational predictions only; clinical or mechanistic impact depends entirely on follow-up IgE-binding, recombinant expression, and basophil assays not funded here.',
                            order: 2,
                            created_date: '2026-05-19T21:01:51.123962Z',
                            updated_date: '2026-05-19T21:01:51.123965Z',
                          },
                          {
                            id: 1172,
                            item_type: 'weakness',
                            label: 'Predictor false positives',
                            description:
                              'False-positive rates of AllerCatPro/AllerTOP for crustacean allergens are not quantified, and the negative-control set cannot guarantee true non-allergen status.',
                            order: 3,
                            created_date: '2026-05-19T21:01:51.123973Z',
                            updated_date: '2026-05-19T21:01:51.123976Z',
                          },
                          {
                            id: 1173,
                            item_type: 'weakness',
                            label: 'Disclosure gaps',
                            description:
                              'No explicit conflict-of-interest statement, and AI/ML tool use is described methodologically but lacks a formal AI-assistance disclosure for writing or analysis.',
                            order: 4,
                            created_date: '2026-05-19T21:01:51.123984Z',
                            updated_date: '2026-05-19T21:01:51.123987Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8669664,
                        first_name: 'Pronoma',
                        last_name: 'Banerjee',
                        profile_image: null,
                        headline: '',
                      },
                      preregistration_post_id: 32346,
                      fundraise: {
                        id: 886,
                        title:
                          'Interpretable AI for Ultrasound-Based Assessment of Immune-Mediated Intestinal Inflammation in Crohn’s Disease',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18186,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 70,
                        status: 'completed',
                        tldr: "Pilot to build the first open-source multimodal intestinal ultrasound dataset (n=20) for Crohn's disease with IBUS-aligned expert annotations, plus initial work on knowledge-guided vision-language models for severity assessment. Fit to the immunology RFP is indirect (imaging/AI rather than mechanistic immunology), and the 6-month timeline with longitudinal follow-ups and a $10K budget is tight.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 13.270480882994889,
                        created_date: '2026-06-16T02:23:00.815198Z',
                        updated_date: '2026-06-16T14:06:08.435890Z',
                        items: [
                          {
                            id: 1647,
                            item_type: 'strength',
                            label: 'Open Dataset',
                            description:
                              "Creates a reproducible, IBUS-aligned multimodal IUS dataset shared on ResearchHub and HuggingFace, addressing a real gap in publicly available Crohn's imaging benchmarks.",
                            order: 0,
                            created_date: '2026-06-16T14:06:08.440988Z',
                            updated_date: '2026-06-16T14:06:08.441001Z',
                          },
                          {
                            id: 1648,
                            item_type: 'strength',
                            label: 'Clinical Need',
                            description:
                              "Non-invasive, interpretable monitoring of Crohn's severity is clinically important, especially for longitudinal follow-up and resource-limited settings.",
                            order: 1,
                            created_date: '2026-06-16T14:06:08.441023Z',
                            updated_date: '2026-06-16T14:06:08.441027Z',
                          },
                          {
                            id: 1649,
                            item_type: 'strength',
                            label: 'Promising Pilot',
                            description:
                              'Preliminary C-TRUS work (U-Net++ Dice 0.63; KODER+Qwen2-VL 80% zero-shot stratification vs 46% supervised baseline) supports technical feasibility.',
                            order: 2,
                            created_date: '2026-06-16T14:06:08.441037Z',
                            updated_date: '2026-06-16T14:06:08.441040Z',
                          },
                          {
                            id: 1650,
                            item_type: 'strength',
                            label: 'Strong Environment',
                            description:
                              "IU Gastroenterology sees 800-900 new Crohn's patients/year with 18 active trials, paired with Purdue AI expertise and prior IUS+VLM work by the team.",
                            order: 3,
                            created_date: '2026-06-16T14:06:08.441050Z',
                            updated_date: '2026-06-16T14:06:08.441053Z',
                          },
                          {
                            id: 1651,
                            item_type: 'strength',
                            label: 'Rigorous Annotation',
                            description:
                              'Standardized IBUS protocols, multi-expert CVAT annotation, and validated reference labels (SES-CD, Rutgeerts) support label quality and downstream rigor.',
                            order: 4,
                            created_date: '2026-06-16T14:06:08.441062Z',
                            updated_date: '2026-06-16T14:06:08.441065Z',
                          },
                          {
                            id: 1652,
                            item_type: 'weakness',
                            label: 'RFP Fit',
                            description:
                              "The RFP emphasizes immunology mechanisms; this proposal frames Crohn's as immune-mediated but is primarily an imaging/AI dataset effort with limited mechanistic immunology content.",
                            order: 0,
                            created_date: '2026-06-16T14:06:08.441073Z',
                            updated_date: '2026-06-16T14:06:08.441076Z',
                          },
                          {
                            id: 1653,
                            item_type: 'weakness',
                            label: 'Small Sample',
                            description:
                              "n=20 single-center cohort limits generalizability and makes Hypothesis 2's >=85% accuracy target ambitious and not power-justified for the funded phase.",
                            order: 1,
                            created_date: '2026-06-16T14:06:08.441085Z',
                            updated_date: '2026-06-16T14:06:08.441088Z',
                          },
                          {
                            id: 1654,
                            item_type: 'weakness',
                            label: 'Tight Timeline',
                            description:
                              'Six months to secure IRB, recruit three cohorts, complete 12-week longitudinal follow-ups, annotate, and release the dataset is aggressive even with retrospective backup.',
                            order: 2,
                            created_date: '2026-06-16T14:06:08.441096Z',
                            updated_date: '2026-06-16T14:06:08.441099Z',
                          },
                          {
                            id: 1655,
                            item_type: 'weakness',
                            label: 'Lean Budget',
                            description:
                              '$10,000 appears low to cover clinical staff, sonography supplies, multi-expert annotation across longitudinal scans, and PhD student support for 20 patients.',
                            order: 3,
                            created_date: '2026-06-16T14:06:08.441108Z',
                            updated_date: '2026-06-16T14:06:08.441110Z',
                          },
                          {
                            id: 1656,
                            item_type: 'weakness',
                            label: 'Deferred Aim',
                            description:
                              'Aim 2 (VLM modeling and accuracy targets) is largely positioned for a future R21, so near-term deliverables are mostly the dataset rather than validated AI performance.',
                            order: 4,
                            created_date: '2026-06-16T14:06:08.441119Z',
                            updated_date: '2026-06-16T14:06:08.441121Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8655068,
                        first_name: 'Tsion',
                        last_name: 'Shiferaw',
                        profile_image: null,
                        headline: '',
                      },
                      preregistration_post_id: 32348,
                      fundraise: {
                        id: 887,
                        title:
                          'Targeting STAT1-dependent interferon signaling to prevent ApoE4-driven neuroinflammation and microglial dysfunction',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 18187,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 71,
                        status: 'completed',
                        tldr: "In vitro proof-of-concept testing whether STAT1 (fludarabine) and cGAS-STING (g140) inhibitors can reverse IFN-I-driven dysfunction in ApoE2/3/4 iPSC-microglia, fitting the RFP's innate immunity focus. Strong pilot data and integrated holotomography-proteomics platform are notable, but an implausible 0-1 mM dose range, undefined donor n, and a ~$10K budget far below the proposed scope raise feasibility concerns.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 14.982179775000986,
                        created_date: '2026-06-16T04:42:04.784845Z',
                        updated_date: '2026-06-16T04:44:45.154937Z',
                        items: [
                          {
                            id: 1632,
                            item_type: 'strength',
                            label: 'Timely Question',
                            description:
                              "Targets ApoE4, the strongest LOAD risk allele, where current therapies underperform, addressing a clear translational gap aligned with the RFP's innate immunity scope.",
                            order: 0,
                            created_date: '2026-06-16T04:44:45.159762Z',
                            updated_date: '2026-06-16T04:44:45.159772Z',
                          },
                          {
                            id: 1633,
                            item_type: 'strength',
                            label: 'Supportive Pilot Data',
                            description:
                              'Preliminary proteomics, KEGG analysis, and STAT1/SP100 qPCR show lipid-free ApoE4 induces IFN-I signaling, providing a credible basis for the hypothesis.',
                            order: 1,
                            created_date: '2026-06-16T04:44:45.159793Z',
                            updated_date: '2026-06-16T04:44:45.159796Z',
                          },
                          {
                            id: 1634,
                            item_type: 'strength',
                            label: 'Integrated Platform',
                            description:
                              'Combines validated in-house live-cell holotomography with unbiased proteomics on the same samples, enabling multi-modal phenotyping of microglial responses.',
                            order: 2,
                            created_date: '2026-06-16T04:44:45.159806Z',
                            updated_date: '2026-06-16T04:44:45.159809Z',
                          },
                          {
                            id: 1635,
                            item_type: 'strength',
                            label: 'Multi-Genotype Design',
                            description:
                              'Includes ApoE2/3/4 lines from both sexes with vehicle controls and four temporal treatment windows (pre, co, early, late rescue), strengthening comparative rigor.',
                            order: 3,
                            created_date: '2026-06-16T04:44:45.159818Z',
                            updated_date: '2026-06-16T04:44:45.159820Z',
                          },
                          {
                            id: 1636,
                            item_type: 'strength',
                            label: 'Relevant Expertise',
                            description:
                              'Team is associated with a directly relevant 2026 preprint on ApoE lipidation and microglial immunometabolic reprogramming, indicating topical know-how.',
                            order: 4,
                            created_date: '2026-06-16T04:44:45.159829Z',
                            updated_date: '2026-06-16T04:44:45.159832Z',
                          },
                          {
                            id: 1637,
                            item_type: 'weakness',
                            label: 'Unrealistic Budget',
                            description:
                              '~$10K total cannot plausibly cover iMG lines across 3 genotypes plus global proteomics and transcriptomics across many treatment/timing conditions with replicates.',
                            order: 0,
                            created_date: '2026-06-16T04:44:45.159841Z',
                            updated_date: '2026-06-16T04:44:45.159843Z',
                          },
                          {
                            id: 1638,
                            item_type: 'weakness',
                            label: 'Implausible Doses',
                            description:
                              'Stated 0-1 mM range for fludarabine and g140 is far above typical uM/nM working concentrations, suggesting a likely typo or insufficient pharmacology rigor.',
                            order: 1,
                            created_date: '2026-06-16T04:44:45.159852Z',
                            updated_date: '2026-06-16T04:44:45.159854Z',
                          },
                          {
                            id: 1639,
                            item_type: 'weakness',
                            label: 'Endpoints Underspecified',
                            description:
                              'Direct pathway-engagement readouts like phospho-STAT1 and an ISG panel are listed only as fallback, not primary endpoints, weakening mechanistic interpretability.',
                            order: 2,
                            created_date: '2026-06-16T04:44:45.159863Z',
                            updated_date: '2026-06-16T04:44:45.159865Z',
                          },
                          {
                            id: 1640,
                            item_type: 'weakness',
                            label: 'Undefined Replication',
                            description:
                              'Donor n per ApoE genotype, biological replicate counts, statistical power, and a transcriptomics methods section (despite a genomics budget line) are not specified.',
                            order: 3,
                            created_date: '2026-06-16T04:44:45.159874Z',
                            updated_date: '2026-06-16T04:44:45.159877Z',
                          },
                          {
                            id: 1641,
                            item_type: 'weakness',
                            label: 'In Vitro Only',
                            description:
                              'No in vivo validation or functional assays (phagocytosis, cytokine secretion) limits translational depth; relies on two tool compounds with limited specificity discussion.',
                            order: 4,
                            created_date: '2026-06-16T04:44:45.159886Z',
                            updated_date: '2026-06-16T04:44:45.159888Z',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              action_date: '2026-03-17T04:51:47.479463Z',
              action: 'PUBLISH',
            },
            {
              id: 31903,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 31903,
                slug: 'funding-opportunity-biomedical-imaging-technologies',
                title: 'Biomedical Imaging Technologies',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/968147f8-46e1-4175-99b6-0dc8b25943f9/image-fluoro.png',
                unified_document_id: 9109531,
                grant: {
                  id: 302,
                  status: 'OPEN',
                  amount: {
                    usd: 10000,
                    rsc: 124904.2685285593,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: null,
                  is_expired: false,
                  is_active: true,
                  application_count: 2,
                  applications: [
                    {
                      applicant: {
                        id: 7634317,
                        first_name: 'Kashish',
                        last_name: 'Jain',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/21/blob_08vROVN',
                        headline: '',
                      },
                      preregistration_post_id: 32265,
                      fundraise: {
                        id: 847,
                        title:
                          'Single-molecule localization microscopy: systematic comparison for the optimal  super-resolution technique ',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17448,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17523,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 119255,
                              first_name: 'Gokul',
                              last_name: 'Rajan',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocISaCMgwpXPq2tMOQo1Pefn6rR1Pejito8EoM7iRm-qCK2UCSkh=s96-c',
                              headline: 'Neuroscientist',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 38,
                        status: 'completed',
                        tldr: "Proposes a side-by-side benchmark of PALM, dSTORM, and DNA-PAINT on the same cellular targets (adhesion nanoclusters, NPC) with Monte Carlo simulations and antibody linkage-error tests. Fits the RFP's biomedical optics scope and leverages the PI's prior SMLM/Picasso/Tesseler experience, but lacks ground-truth anchors, methodological specifics, and a realistic budget/timeline for the proposed scope.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 10.741794892004691,
                        created_date: '2026-05-03T01:53:11.997484Z',
                        updated_date: '2026-05-21T22:18:23.396375Z',
                        items: [
                          {
                            id: 1204,
                            item_type: 'strength',
                            label: 'Relevant Question',
                            description:
                              'Quantitative biases across SMLM modalities directly affect biological interpretation of nanoclusters and stoichiometry, a recognized and well-motivated concern in the field.',
                            order: 0,
                            created_date: '2026-05-21T22:18:23.400154Z',
                            updated_date: '2026-05-21T22:18:23.400164Z',
                          },
                          {
                            id: 1205,
                            item_type: 'strength',
                            label: 'Team Expertise',
                            description:
                              'PI has directly relevant prior publications using Picasso/Tesseler pipelines on integrin nanoclusters, supporting technical feasibility of the imaging and analysis workflows.',
                            order: 1,
                            created_date: '2026-05-21T22:18:23.400185Z',
                            updated_date: '2026-05-21T22:18:23.400189Z',
                          },
                          {
                            id: 1206,
                            item_type: 'strength',
                            label: 'Multi-Modal Design',
                            description:
                              'Combines three SMLM modalities, a linkage-error arm comparing antibody/nanobody labels, and Monte Carlo simulations, offering a more integrated comparison than single-method studies.',
                            order: 2,
                            created_date: '2026-05-21T22:18:23.400199Z',
                            updated_date: '2026-05-21T22:18:23.400202Z',
                          },
                          {
                            id: 1207,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to sharing processed datasets and simulation code via BioSR and GitHub, supporting reuse, though raw data is only available on request.',
                            order: 3,
                            created_date: '2026-05-21T22:18:23.400211Z',
                            updated_date: '2026-05-21T22:18:23.400213Z',
                          },
                          {
                            id: 1208,
                            item_type: 'weakness',
                            label: 'No Ground Truth',
                            description:
                              'Without explicit ground-truth anchors (e.g., NPC as a molecular ruler) the study may report differences across modalities without resolving which is most accurate.',
                            order: 0,
                            created_date: '2026-05-21T22:18:23.400222Z',
                            updated_date: '2026-05-21T22:18:23.400224Z',
                          },
                          {
                            id: 1209,
                            item_type: 'weakness',
                            label: 'Method Specificity',
                            description:
                              'Lacks detail on sample sizes, matched labeling densities, acquisition parameters, replicate structure, and statistical power needed for rigorous cross-modality comparison.',
                            order: 1,
                            created_date: '2026-05-21T22:18:23.400233Z',
                            updated_date: '2026-05-21T22:18:23.400235Z',
                          },
                          {
                            id: 1210,
                            item_type: 'weakness',
                            label: 'Budget Insufficient',
                            description:
                              'The $5,000 total omits microscope/facility time, DNA-PAINT imager oligos, personnel, and simulation compute, making the budget likely inadequate for the proposed scope.',
                            order: 2,
                            created_date: '2026-05-21T22:18:23.400244Z',
                            updated_date: '2026-05-21T22:18:23.400246Z',
                          },
                          {
                            id: 1211,
                            item_type: 'weakness',
                            label: 'Aggressive Timeline',
                            description:
                              'Completing three SMLM modalities across multiple targets with linkage-error variants, simulations, and a manuscript in 3-6 months is unrealistic, especially given slow DNA-PAINT acquisitions.',
                            order: 3,
                            created_date: '2026-05-21T22:18:23.400255Z',
                            updated_date: '2026-05-21T22:18:23.400257Z',
                          },
                          {
                            id: 1212,
                            item_type: 'weakness',
                            label: 'Limited Novelty',
                            description:
                              'Comparative SMLM benchmarking has precedent and the hypothesis that modalities differ is largely expected; the proposal does not clearly articulate a generalizable new framework.',
                            order: 4,
                            created_date: '2026-05-21T22:18:23.400265Z',
                            updated_date: '2026-05-21T22:18:23.400268Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8601150,
                        first_name: 'Hongbin',
                        last_name: 'Jin',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocK1X0s6aVLTRJjKjEQYifpUrdbp4meSz3gd3Q1l56I8nfwApw=s96-c',
                        headline: 'Postdoc at Monash University',
                      },
                      preregistration_post_id: 32299,
                      fundraise: {
                        id: 856,
                        title:
                          'Development of a novel live-imaging tool for global protein translation',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: {
                          id: 46,
                          name: 'Monash University',
                        },
                        reviews: [
                          {
                            id: 17647,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17774,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 1362659,
                              first_name: 'Ilhan',
                              last_name: 'Altinok',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/26/blob_PDSU5QW',
                              headline: 'Vaccines, Genomics, Immunology',
                            },
                          },
                          {
                            id: 17872,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8563936,
                              first_name: 'Chieh-Te',
                              last_name: 'Lin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/20/blob',
                              headline: 'ML Researcher',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 54,
                        status: 'completed',
                        tldr: 'Proposes a Dendra2 photoconvertible reporter for live imaging of global translation, validated in HEK293T cells and applied to mouse preimplantation embryos to study pluripotency. Fits the biomedical optics RFP and is feasible in 6 months with strong infrastructure, but lacks orthogonal validation and controls for mRNA stability and FP maturation that confound the translation readout.',
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 14.941388284962159,
                        created_date: '2026-05-14T09:22:27.269740Z',
                        updated_date: '2026-05-31T21:25:31.065749Z',
                        items: [
                          {
                            id: 1373,
                            item_type: 'strength',
                            label: 'Creative Concept',
                            description:
                              'Repurposing Dendra2 photoconversion to reset baseline and read green recovery as a translation proxy is a novel, intuitive solution to fluorescence saturation in live reporters.',
                            order: 0,
                            created_date: '2026-05-31T21:25:31.070797Z',
                            updated_date: '2026-05-31T21:25:31.070808Z',
                          },
                          {
                            id: 1374,
                            item_type: 'strength',
                            label: 'Real Methodological Gap',
                            description:
                              'Existing tools (ribosome, tRNA, puromycin assays) are poorly suited to live, dynamic imaging, so a working reporter would be broadly useful for pluripotency, cancer, and aging studies.',
                            order: 1,
                            created_date: '2026-05-31T21:25:31.070830Z',
                            updated_date: '2026-05-31T21:25:31.070833Z',
                          },
                          {
                            id: 1375,
                            item_type: 'strength',
                            label: 'Feasible Plan',
                            description:
                              'Staged 6-month design with pilot data, modest USD 5,000 budget, Zeiss LSM980 access, ethics in place, and PI expertise in embryo microinjection and live imaging.',
                            order: 2,
                            created_date: '2026-05-31T21:25:31.070843Z',
                            updated_date: '2026-05-31T21:25:31.070846Z',
                          },
                          {
                            id: 1376,
                            item_type: 'strength',
                            label: 'Relevant Embryo Application',
                            description:
                              'Testing inner vs outer cell translation differences in mouse embryos provides a concrete, biologically meaningful validation tied to prior lab findings and potential IVF relevance.',
                            order: 3,
                            created_date: '2026-05-31T21:25:31.070855Z',
                            updated_date: '2026-05-31T21:25:31.070858Z',
                          },
                          {
                            id: 1377,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Plasmids will be deposited on Addgene, and protocols, imaging data, and analyses will be shared publicly, supporting reproducibility and reuse.',
                            order: 4,
                            created_date: '2026-05-31T21:25:31.070867Z',
                            updated_date: '2026-05-31T21:25:31.070869Z',
                          },
                          {
                            id: 1378,
                            item_type: 'weakness',
                            label: 'Specificity Of Readout',
                            description:
                              'Green recovery rate may reflect Dendra2 mRNA abundance, stability, or FP maturation rather than global translation. No orthogonal assay (OPP, SUnSET, ribosome profiling) is included.',
                            order: 0,
                            created_date: '2026-05-31T21:25:31.070878Z',
                            updated_date: '2026-05-31T21:25:31.070881Z',
                          },
                          {
                            id: 1379,
                            item_type: 'weakness',
                            label: 'Confound Controls Missing',
                            description:
                              'No plan to control for incomplete photoconversion, residual unconverted green, mRNA dilution across embryo divisions, or phototoxicity, all of which can bias inner vs outer comparisons.',
                            order: 1,
                            created_date: '2026-05-31T21:25:31.070890Z',
                            updated_date: '2026-05-31T21:25:31.070893Z',
                          },
                          {
                            id: 1380,
                            item_type: 'weakness',
                            label: 'Statistical Design',
                            description:
                              'n=50 embryos lacks a power calculation, and a simple t-test ignores the nested structure of multiple cells per embryo; mixed-effects modeling would be more appropriate.',
                            order: 2,
                            created_date: '2026-05-31T21:25:31.070901Z',
                            updated_date: '2026-05-31T21:25:31.070904Z',
                          },
                          {
                            id: 1381,
                            item_type: 'weakness',
                            label: 'Limited Pilot Data',
                            description:
                              'Pilot shows expression and photoconversion but no actual green recovery curve, so the central assay (recovery as translation readout) is not yet demonstrated.',
                            order: 3,
                            created_date: '2026-05-31T21:25:31.070912Z',
                            updated_date: '2026-05-31T21:25:31.070915Z',
                          },
                          {
                            id: 1382,
                            item_type: 'weakness',
                            label: 'Thin Risk Planning',
                            description:
                              'Six-month timeline has no buffer, NLS-Dendra2 rationale is weak (cytoplasmic translation plus import kinetics confound), and biosafety/contingency details are absent.',
                            order: 4,
                            created_date: '2026-05-31T21:25:31.070923Z',
                            updated_date: '2026-05-31T21:25:31.070926Z',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              action_date: '2026-03-17T02:55:01.281506Z',
              action: 'PUBLISH',
            },
            {
              id: 5580,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 5580,
                slug: 'request-for-proposals-project-gigabrain-brain-organoids',
                title: 'Request for Proposals - Project Gigabrain (Brain Organoids)',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/e5a124a4-66cc-4409-8907-fd179b7c98c7/20201216-erorganoid844.jpg',
                unified_document_id: 9006052,
                grant: {
                  id: 28,
                  status: 'OPEN',
                  amount: {
                    usd: 25000,
                    rsc: 312260.67132139823,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: 'GigaBrain',
                  is_expired: true,
                  is_active: false,
                  application_count: 16,
                  applications: [
                    {
                      applicant: {
                        id: 8563592,
                        first_name: 'Joao',
                        last_name: 'Pereira',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 7659,
                      fundraise: {
                        id: 300,
                        title:
                          'Engineering Morphogen Gradients to Grow Larger, Spatially Patterned Human Cortical Organoids',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: {
                          id: 33,
                          name: 'University of Alabama at Birmingham Heersink School of Medicine',
                        },
                        reviews: [
                          {
                            id: 16690,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 5570124,
                              first_name: 'Hao',
                              last_name: 'Yin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                              headline: 'Cardiovascular biologists',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8573774,
                        first_name: 'Chris',
                        last_name: 'Tapo',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/02/blob_13ARKYY',
                        headline: 'Applied Mathematics at the University of Akron',
                      },
                      preregistration_post_id: 13665,
                      fundraise: {
                        id: 322,
                        title:
                          'Network Analysis of Neural Subsystems to Assess Consciousness, Cognition, and Ethical Implications',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: {
                          id: 35,
                          name: 'UNIVERSITY OF AKRON FOUNDATION',
                        },
                        reviews: [
                          {
                            id: 16410,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8407921,
                              first_name: 'Ahmad',
                              last_name: 'Iqbal',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/12/31/blob_HUrLkok',
                              headline: 'Computer Scientist',
                            },
                          },
                          {
                            id: 16547,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 989685,
                              first_name: 'Faye',
                              last_name: 'McKenna',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                              headline:
                                'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8574546,
                        first_name: 'Jens',
                        last_name: 'Schwamborn',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/03/blob_GLVoE0a',
                        headline: 'Neuroscientist & brain organoid explorer',
                      },
                      preregistration_post_id: 14078,
                      fundraise: {
                        id: 327,
                        title: 'Toward Gigabrain: Engineering Self-Perfusing Human Brain Organoids',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16529,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 5570124,
                              first_name: 'Hao',
                              last_name: 'Yin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                              headline: 'Cardiovascular biologists',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8575403,
                        first_name: 'Sara',
                        last_name: 'Mirsadeghi',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/05/blob_qWBGNHU',
                        headline: 'Ph.D. candidate at UTSA',
                      },
                      preregistration_post_id: 16629,
                      fundraise: {
                        id: 334,
                        title:
                          'A Parallel 3D-MEA Closed-Loop Chemogenetic Platform to Restore Network Computation in Disease-Modeled Assembloids',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: {
                          id: 40,
                          name: 'The University of Texas Foundation Inc',
                        },
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8575603,
                        first_name: 'Massimo',
                        last_name: 'Muratore',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocKYApK4NtrgK2nx3usp0yoOKhITCy5zgnC74Wci8pfdWh99Sw=s96-c',
                        headline: null,
                      },
                      preregistration_post_id: 17743,
                      fundraise: {
                        id: 335,
                        title:
                          'NEuRA-MEAn: Neural organoid electrophysiology and AI for reproducible MEA assays',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8577163,
                        first_name: 'Xander',
                        last_name: 'Grey',
                        profile_image: null,
                        headline: 'Building The Next Wave of Compute',
                      },
                      preregistration_post_id: 25451,
                      fundraise: {
                        id: 353,
                        title:
                          'Title: Perfused 3D Cortical Constructs as Reservoir Computing Substrates: Quantitative Characterization and Energy-Efficiency Benchmarking Against Silicon',
                        goal_amount: {
                          usd: 50000,
                          rsc: 624521.3426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8565086,
                        first_name: 'Federico',
                        last_name: 'Tozzi',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/25/blob_3biXDA3',
                        headline: 'PhD student at University of Pisa, Italy',
                      },
                      preregistration_post_id: 25962,
                      fundraise: {
                        id: 355,
                        title:
                          'Elettroimaging Brain Organoids: a new frontier of cellular model characterization',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16703,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 7898110,
                              first_name: 'Chloe',
                              last_name: 'Hall',
                              profile_image: null,
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8563715,
                        first_name: 'Mubeen',
                        last_name: 'Goolam',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/10/blob_H1HJxIN',
                        headline: '',
                      },
                      preregistration_post_id: 26497,
                      fundraise: {
                        id: 361,
                        title:
                          'Breaking the Size Barrier: Engineering Perfused Human Brain Organoids for Enhanced Growth and Viability',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16653,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 5570124,
                              first_name: 'Hao',
                              last_name: 'Yin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                              headline: 'Cardiovascular biologists',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8577299,
                        first_name: 'Paula',
                        last_name: 'Ramos-Gonzalez',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/11/blob_ppNaadH',
                        headline: 'Posdoctoral researcher, Achucarro Basque Center',
                      },
                      preregistration_post_id: 27537,
                      fundraise: {
                        id: 372,
                        title:
                          'Highway to Well: a Bio-Logical Support for Perfused Vascularized Brain Organoids.',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16777,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 5570124,
                              first_name: 'Hao',
                              last_name: 'Yin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                              headline: 'Cardiovascular biologists',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8564641,
                        first_name: 'Ambarish',
                        last_name: 'Ghatpande',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/13/blob_cFjJ68D',
                        headline: '',
                      },
                      preregistration_post_id: 29148,
                      fundraise: {
                        id: 446,
                        title:
                          'Screening brain organoids for their information-processing potential',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16650,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 7964166,
                              first_name: 'Ruslan',
                              last_name: 'Kurmashev',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/21/blob_URDbsq1',
                              headline: 'MSc in Computational Biology | MD',
                            },
                          },
                          {
                            id: 16704,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 6981315,
                              first_name: 'José',
                              last_name: 'Mateus',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/11/09/blob_FKTX28g',
                              headline: 'Post-Doc Researcher',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8578507,
                        first_name: 'Mohamed',
                        last_name: 'Abdelgawad',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/13/blob',
                        headline: 'Professor at Capital University Egypt',
                      },
                      preregistration_post_id: 30828,
                      fundraise: {
                        id: 657,
                        title:
                          'BRAIN-LIVE Bioengineered Regenerative And Innovative Niches for Long-lIved and Vascularized Human Brain Organoids and Assembloids',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16906,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 5570124,
                              first_name: 'Hao',
                              last_name: 'Yin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                              headline: 'Cardiovascular biologists',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8581318,
                        first_name: 'Étienne P.',
                        last_name: 'Sellar',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/30/blob_aMmX7Xb',
                        headline: 'MSc Candidate Wilfrid Laurier University',
                      },
                      preregistration_post_id: 31883,
                      fundraise: {
                        id: 761,
                        title: 'Metrics of Consciousness in Embodied 2D-3D Neural Network Hybrids',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16986,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8428816,
                              first_name: 'Daniel',
                              last_name: 'Ojeda Juarez',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/01/blob',
                              headline: 'Neurodegeneration Postdoctoral Fellow at UCSD',
                            },
                          },
                          {
                            id: 16998,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 930627,
                              first_name: 'Rakhan',
                              last_name: 'Aimbetov',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/10/blob',
                              headline: 'Researcher · Founder',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8578052,
                        first_name: 'Minna-Mari',
                        last_name: 'Tervo',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocL4ScsI2Xjrqz6NTwQdaTW88KoydrRz3N2QtBNffUYZ3QmLT1Ao=s96-c',
                        headline: null,
                      },
                      preregistration_post_id: 31901,
                      fundraise: {
                        id: 763,
                        title: 'Focused ultrasound induced maturation of human brain organoids',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17078,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7802845,
                              first_name: 'Milton Enrique',
                              last_name: 'Londoño Lemos',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/06/14/blob_LBRVpyN',
                              headline: 'Milton Londoño PhD Researcher CCICBM',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8581747,
                        first_name: 'Stuart',
                        last_name: 'Hodgetts',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 31904,
                      fundraise: {
                        id: 765,
                        title:
                          'Will Size Matter? Extending Cerebral Organoid Growth and Development Using Combinatorial Strategies',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16824,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 5570124,
                              first_name: 'Hao',
                              last_name: 'Yin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                              headline: 'Cardiovascular biologists',
                            },
                          },
                          {
                            id: 16860,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8337319,
                              first_name: 'Pardes',
                              last_name: 'Habib',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/01/blob',
                              headline: 'Instructor, Stanford University School of Medicine',
                            },
                          },
                          {
                            id: 16921,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7007151,
                              first_name: 'Ramiro Alberto',
                              last_name: 'Cumbrera González',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/04/blob_PFNos1h',
                              headline: 'PhD|Physics_Technical Sciences|ICT|Statistician|',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8581747,
                        first_name: 'Stuart',
                        last_name: 'Hodgetts',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 31902,
                      fundraise: {
                        id: 764,
                        title:
                          'Revivification: A Longitudinal Study of Neural Plasticity, Signal Propagation, and Emergent Cognition in Human Cerebral Organoids',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8565149,
                        first_name: 'Jose Agustin',
                        last_name: 'Cota-Coronado',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/26/blob',
                        headline: 'Lead Human Stem Cell Laboratory, Monash University',
                      },
                      preregistration_post_id: 32039,
                      fundraise: {
                        id: 770,
                        title: 'Engineering the “PERFECT” platform',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                  ],
                },
              },
              action_date: '2026-02-11T04:46:36.807512Z',
              action: 'PUBLISH',
            },
            {
              id: 4373,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 4373,
                slug: 'request-for-proposals-antimicrobial-resistance-amr-in-aquaculture',
                title: 'Request for Proposals - Antimicrobial Resistance (AMR) in Aquaculture',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/49e1235a-63b4-4400-a34a-769116020745/chatgpt-image-aug-31-2025-03_52_05-pm.png',
                unified_document_id: 7635802,
                grant: {
                  id: 9,
                  status: 'OPEN',
                  amount: {
                    usd: 5000,
                    rsc: 62452.13426427965,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: 'Aquaculture AMR',
                  is_expired: true,
                  is_active: false,
                  application_count: 6,
                  applications: [
                    {
                      applicant: {
                        id: 8114240,
                        first_name: 'Irfan Ahmad',
                        last_name: 'Bhat',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/21/blob_KiNlZnU',
                        headline: 'Assistant Professor at SKUAST Kashmir, India',
                      },
                      preregistration_post_id: 4419,
                      fundraise: {
                        id: 162,
                        title:
                          'Title of the proposal: Evaluation of Antimicrobial Activity of Novel De Novo Designed Synthetic Peptides Against Fish Pathogens',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8114267,
                        first_name: 'Achenef Melaku',
                        last_name: 'Beyene',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/30/blob_RElJU3v',
                        headline: 'researcher at University of Gondar',
                      },
                      preregistration_post_id: 4431,
                      fundraise: {
                        id: 166,
                        title:
                          'Situational Analysis and Designing a Roadmap for Antimicrobial Use and Resistance Reduction in Aquaculture by Balancing Productivity and Public Health in Ethiopia',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 12204,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7765045,
                              first_name: 'Margaret',
                              last_name: 'Van Horn',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/28/blob_4HOXZLe',
                              headline: 'PhD, CMPP',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8114979,
                        first_name: 'Eniola',
                        last_name: 'Akoledowo',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/25/blob_Vx6LPhl',
                        headline: 'Research assistant and Laboratory Technician ',
                      },
                      preregistration_post_id: 4434,
                      fundraise: {
                        id: 169,
                        title:
                          'Bridging Livestock and Aquaculture: Surveillance of Antimicrobial Resistance Pathways in Nigerian Fish Ponds Fertilized with Animal Waste',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8115298,
                        first_name: 'Haitham',
                        last_name: 'Mohammed',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/29/blob',
                        headline: 'Assistant Professor at Texas A&M University',
                      },
                      preregistration_post_id: 4436,
                      fundraise: {
                        id: 170,
                        title:
                          'Phytogenic Solutions: Using Plant Extracts as Antibiotic Alternatives to Mitigate AMR for Sustainable Aquaculture',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: {
                          id: 23,
                          name: 'TEXAS A&M FOUNDATION',
                        },
                        reviews: [
                          {
                            id: 12195,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8113024,
                              first_name: 'Manfredi',
                              last_name: 'Madia',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/12/18/blob_Iq7iW5n',
                              headline: 'Biologist - Ecologist',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8113930,
                        first_name: 'Khalid S.',
                        last_name: 'Ibrahim',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocIsj0et5sVmGB51X_oSvy7q6dVfwpBxta6lidujPquLT-eg1ddV=s96-c',
                        headline: 'Research leader in Microbiome Iraq',
                      },
                      preregistration_post_id: 4439,
                      fundraise: {
                        id: 171,
                        title:
                          'Resistome and Microbial Profiling of Fish collected from different sources in Duhok, Iraq.',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 12084,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8113024,
                              first_name: 'Manfredi',
                              last_name: 'Madia',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/12/18/blob_Iq7iW5n',
                              headline: 'Biologist - Ecologist',
                            },
                          },
                          {
                            id: 12374,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 7765045,
                              first_name: 'Margaret',
                              last_name: 'Van Horn',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/28/blob_4HOXZLe',
                              headline: 'PhD, CMPP',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8113772,
                        first_name: 'Taylor',
                        last_name: 'Heckman',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/29/blob_DRGlULU',
                        headline: 'Assistant Professor at Mississippi State',
                      },
                      preregistration_post_id: 4440,
                      fundraise: {
                        id: 172,
                        title:
                          'Environmental Reservoirs of Antibiotic Resistance in Commercial Catfish Ponds',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 12227,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8113024,
                              first_name: 'Manfredi',
                              last_name: 'Madia',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/12/18/blob_Iq7iW5n',
                              headline: 'Biologist - Ecologist',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                  ],
                },
              },
              action_date: '2025-08-31T22:52:39.650572Z',
              action: 'PUBLISH',
            },
            {
              id: 4233,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 4233,
                slug: 'request-for-proposals-bioinformatics-genomics-research',
                title: 'Request for Proposals - Bioinformatics & Genomics Research',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/087ce0dd-8592-4569-b022-c38d1dea8964/chatgpt-image-jul-21-2025-11_43_16-am.png',
                unified_document_id: 7524271,
                grant: {
                  id: 5,
                  status: 'OPEN',
                  amount: {
                    usd: 5000,
                    rsc: 62452.13426427965,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: 'Translational Bioinformatics',
                  is_expired: true,
                  is_active: false,
                  application_count: 27,
                  applications: [
                    {
                      applicant: {
                        id: 6321429,
                        first_name: 'Duy',
                        last_name: 'Pham',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/07/28/blob_jTai1WN',
                        headline: 'Senior Computational Biologist',
                      },
                      preregistration_post_id: 4262,
                      fundraise: {
                        id: 66,
                        title:
                          'NeuroSC: Leveraging Pretrained Single-Cell Models for Brain Cell Classification',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: {
                          id: 9,
                          name: 'Chancellor Masters and Scholars of the University of Cambridge',
                        },
                        reviews: [
                          {
                            id: 10832,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 6327346,
                              first_name: 'Yahaya Abubakar',
                              last_name: 'Yabo',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocLXtE2vSYLnuP8OOqzm2LgwDOighbu6U0KlRdbEiDjqx7EaZKWGug=s96-c',
                              headline:
                                'Bioinformatics, Brain tumours, T-cell therapy, scRNA-sequencing, Spatial transcriptomics',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7927969,
                        first_name: 'Samarpan',
                        last_name: 'Mohanty',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJyDi26YLUmv7VtBbBDDuFntJVRa-R8EMyaT3UN1ZNz6ZwVq04=s96-c',
                        headline: 'RA in PSE Bavarian Lab, Undergrad at UNL',
                      },
                      preregistration_post_id: 4273,
                      fundraise: {
                        id: 73,
                        title:
                          'Integrating Kinetic Metabolic Modeling, Deep Learning, and LLMs for Predictive Bioinformatics: A Focus on E. coli Glycolysis',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7944810,
                        first_name: 'Julia',
                        last_name: 'Apolonio de Amorim',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocKErajXK0wHhXCYkz40MUmqf9cqvSDWEnW4pHv5ZPAxZ_bpfbQSbg=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 4286,
                      fundraise: {
                        id: 80,
                        title: 'LocusMatch: Defining Novelty in GWAS Locus Discovery',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7963904,
                        first_name: 'Adam',
                        last_name: 'Whisnant',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocKofS-qBmdBxL7QSIrdaEQ7y01MLdscrXtUFU4iAmauCySzBLyk=s96-c',
                        headline: 'Virologist at Hannover Medical School',
                      },
                      preregistration_post_id: 4308,
                      fundraise: {
                        id: 91,
                        title: 'PathoSAGE for Endangered Species Conservation',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964109,
                        first_name: 'Abdul Rehman',
                        last_name: 'Ikram',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/08/blob',
                        headline: 'Bioinformatics | AI & Machine Learning',
                      },
                      preregistration_post_id: 4313,
                      fundraise: {
                        id: 95,
                        title:
                          'Establishment of the CRC Data Lab: Leveraging AI and Bioinformatics for Breakthroughs in Colorectal Cancer Research',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7908631,
                        first_name: 'Kalin',
                        last_name: 'Nonchev',
                        profile_image: null,
                        headline: 'PhD student at ETH Zurich, BioML',
                      },
                      preregistration_post_id: 4314,
                      fundraise: {
                        id: 96,
                        title:
                          'Virtual Spatial Transcriptomics Enables Large-Scale Multimodal Analysis of Glioblastoma',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: {
                          id: 16,
                          name: 'Eth Zurich Foundation USA Inc',
                        },
                        reviews: [
                          {
                            id: 10950,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 6327346,
                              first_name: 'Yahaya Abubakar',
                              last_name: 'Yabo',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocLXtE2vSYLnuP8OOqzm2LgwDOighbu6U0KlRdbEiDjqx7EaZKWGug=s96-c',
                              headline:
                                'Bioinformatics, Brain tumours, T-cell therapy, scRNA-sequencing, Spatial transcriptomics',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964068,
                        first_name: 'Keerthana',
                        last_name: 'Gunaretnam',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJUodf6yvFQZiUv2Cwbr83W24AU6jEpqfyLdnIa929iA2Vm_h8=s96-c',
                        headline: 'Interdisciplinary Researcher @araCreate Lanka',
                      },
                      preregistration_post_id: 4317,
                      fundraise: {
                        id: 98,
                        title:
                          'Comparative Bioinformatic Analysis of Tumor Suppressor and Oncogene Variants Across Human Cancer and space flight induced Genomic Alterations',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 10917,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7444533,
                              first_name: 'Xiaowei',
                              last_name: 'Wu',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/02/10/blob',
                              headline: '',
                            },
                          },
                          {
                            id: 10997,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 930627,
                              first_name: 'Rakhan',
                              last_name: 'Aimbetov',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/10/blob',
                              headline: 'Researcher · Founder',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964115,
                        first_name: 'Tahir',
                        last_name: 'Bhatti',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/15/blob_LIbSFKI',
                        headline: 'Virogenomics Researcher | Founder, GVAtlas',
                      },
                      preregistration_post_id: 4318,
                      fundraise: {
                        id: 99,
                        title:
                          'Proposal: Functional Mutation Signatures of Neurotropism in Respiratory Pathogens',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 10960,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7772873,
                              first_name: 'Dr. Bushra',
                              last_name: 'Rauf',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/05/19/blob',
                              headline: 'Molecular Biologist. Biomedical Scientist',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964083,
                        first_name: 'Ketan',
                        last_name: 'Chandra',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJ5J628g0Mh1SRNauJy_R9m0zHcnBcjxhmstDXo1H86OQwT3g=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 4319,
                      fundraise: {
                        id: 100,
                        title:
                          'miR‑RadScore: An open, reproducible microRNA signature to predict tumour radio-sensitivity and guide DNA‑damage–response therapy selection',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964166,
                        first_name: 'Ruslan',
                        last_name: 'Kurmashev',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/21/blob_URDbsq1',
                        headline: 'MSc in Computational Biology | MD',
                      },
                      preregistration_post_id: 4320,
                      fundraise: {
                        id: 101,
                        title:
                          'Multi-Omics Integration for Early Autism Spectrum Disorder (ASD) Diagnosis in Children',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 10911,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 7631880,
                              first_name: 'Sean',
                              last_name: 'McCracken',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
                              headline: 'Postdoctoral Researcher.  Founder of NeuroReview. ',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7944791,
                        first_name: 'Khondamir',
                        last_name: 'Rustamov',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocI9wKqhqtic0gXOB7ULMtEvdp4_maQzczSa2lLNtFiFc-KH_4TRVA=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 4324,
                      fundraise: {
                        id: 105,
                        title:
                          'FoldCraft: An Open Framework for De Novo Design of EGFR-Targeting Nanobodies',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964250,
                        first_name: 'Saransh',
                        last_name: '',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocIsMNPi_L4tdFAJtJLY6AR7iGgVxFvOQ6lGGukMij8nh5TdQIrj=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 4326,
                      fundraise: {
                        id: 107,
                        title:
                          'Network Pharmacology-Driven Repurposing of GSK3B Inhibitors for Neurodegenerative Disorders and Global Biosecurity Threats',
                        goal_amount: {
                          usd: 4000,
                          rsc: 49961.70741142372,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7967079,
                        first_name: 'Winfred',
                        last_name: 'Gatua',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocIza06yxj7G0TLZk0RJ3S-De3hmfoYgV8MK6JsNmsNsQco8IuAU=s96-c',
                        headline: 'PhD Fellow at Bristol Medical School',
                      },
                      preregistration_post_id: 4330,
                      fundraise: {
                        id: 109,
                        title: 'Pharmacogenomic Variant Discovery for Psychiatric Medications',
                        goal_amount: {
                          usd: 6500,
                          rsc: 81187.77454356354,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 11090,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 7772873,
                              first_name: 'Dr. Bushra',
                              last_name: 'Rauf',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/05/19/blob',
                              headline: 'Molecular Biologist. Biomedical Scientist',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964248,
                        first_name: 'Cephas',
                        last_name: 'Akpabio',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/13/blob_2eq9Ldf',
                        headline: 'PhD student at University of Ibadan',
                      },
                      preregistration_post_id: 4336,
                      fundraise: {
                        id: 112,
                        title:
                          'Genetic and Epigenetic Mechanisms Contributing to ADHD Aetiology in Children in South-west and South-south Nigeria',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 11212,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 1871571,
                              first_name: 'David',
                              last_name: 'Warmflash',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/05/blob_77t7OdU',
                              headline: 'medicine, aerospace physiology, genetics, astrobiology',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7908762,
                        first_name: 'Hari Baskar',
                        last_name: 'Balasubramanian',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/07/30/blob_I2iRKDD',
                        headline: 'PhD researcher at University of Vienna',
                      },
                      preregistration_post_id: 4337,
                      fundraise: {
                        id: 113,
                        title:
                          'Integrated miRNA and metabolomic profiling to target brain endothelial cell senescence',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 15997,
                            score: 2,
                            is_assessed: true,
                            author: {
                              id: 7444533,
                              first_name: 'Xiaowei',
                              last_name: 'Wu',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/02/10/blob',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7967215,
                        first_name: 'Diego',
                        last_name: 'M. Coelho',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocKNDAbW3k9BdiJtIpYN9ZDUu_dUY-oPRv2SvOmBNt9y-FwPv-HO=s96-c',
                        headline: 'Universidade Federal do Rio Grande do Norte',
                      },
                      preregistration_post_id: 4342,
                      fundraise: {
                        id: 117,
                        title:
                          "SpliceSD: A Transcriptome-Wide Analysis of Alternative Splicing in Sjögren's Disease",
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7963844,
                        first_name: 'maryam',
                        last_name: 'adel',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/22/blob_99N52dK',
                        headline: 'Microbiology Post doc, Bioinformatics Researcher',
                      },
                      preregistration_post_id: 4345,
                      fundraise: {
                        id: 120,
                        title:
                          'Advanced multi-trait analysis using public GWAS for correlated traits of infectious brain pathogen and early stage of brain disorders',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7967292,
                        first_name: 'Ashita',
                        last_name: 'Jawali',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocKSIUPQJ-8BeRLu9MmEqMMRRSDlILpRNSenbs0fuyzcl1VaiQ=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 4347,
                      fundraise: {
                        id: 122,
                        title:
                          'Early Detection and Personalized Drug Discovery for Pancreatic Cancer Using Multi-Omics and AI/ML Approaches',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 11095,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 6327346,
                              first_name: 'Yahaya Abubakar',
                              last_name: 'Yabo',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocLXtE2vSYLnuP8OOqzm2LgwDOighbu6U0KlRdbEiDjqx7EaZKWGug=s96-c',
                              headline:
                                'Bioinformatics, Brain tumours, T-cell therapy, scRNA-sequencing, Spatial transcriptomics',
                            },
                          },
                          {
                            id: 11137,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 7765045,
                              first_name: 'Margaret',
                              last_name: 'Van Horn',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/28/blob_4HOXZLe',
                              headline: 'PhD, CMPP',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964239,
                        first_name: 'Rebekah',
                        last_name: 'Lanning',
                        profile_image: null,
                        headline: 'Bioinformatics graduate student at IU Indianapolis',
                      },
                      preregistration_post_id: 4349,
                      fundraise: {
                        id: 124,
                        title:
                          'Tracking Antibiotic Resistance Genes Through Time: Multi-year Metagenomics Across U.S. Freshwaters',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 11094,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 1871571,
                              first_name: 'David',
                              last_name: 'Warmflash',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/05/blob_77t7OdU',
                              headline: 'medicine, aerospace physiology, genetics, astrobiology',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7908817,
                        first_name: 'parul',
                        last_name: 'Sharma',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJz9JriLTEVX-Xb5GtrSmX9lYbYdEpPaXgytxHQDvwZE-pD5A=s96-c',
                        headline: 'Bioinformatics Scientist at Emory University',
                      },
                      preregistration_post_id: 4357,
                      fundraise: {
                        id: 132,
                        title:
                          'Meta-Learning Framework for Predicting Antimicrobial Resistance (AMR) in Staphylococcus aureus',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: {
                          id: 15,
                          name: 'Emory University',
                        },
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7916397,
                        first_name: 'Pavitra Ganesan',
                        last_name: 'Dass',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/07/25/blob_S45eovD',
                        headline: 'Graduate Student at Northeastern University ',
                      },
                      preregistration_post_id: 4354,
                      fundraise: {
                        id: 129,
                        title:
                          'Baseline Correlates of Control of Viral Rebound in SIV-Infected, ART-Suppressed Rhesus Macaques Following Analytical Treatment Interruption',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 10859,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 7759814,
                              first_name: 'Alejandro',
                              last_name: 'Gener',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocKnzToKeWmskWw1CSoBXwyboVATZY_XSdh3b-DK2rf6CAfcPA=s96-c',
                              headline: 'Biomedical scientist, Entrepreneur, Consultant',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7910276,
                        first_name: 'Elkana',
                        last_name: 'Mudi',
                        profile_image:
                          'https://lh3.googleusercontent.com/a-/ALV-UjWdUz64sAVQx3FNLlUB_sIas9VI_2uWCn6hvdw6ChSh7vHMh1FRsz7gGNlmwVVNNfDomhTSOofnNeKVhH8gq2GbHMxCPcwrJ2J4AdEtzohQLZkd2WAeIOxOkACH56ThZ74LLkp8nHh9pNWsbmfimxorwa5psPQt21Cn-80AcYI_w2NL2fDM-YLDcNiFdr9dC1QCqbun3G5dtPmsdV5WxBYv6qvQgJAVcE_zpwIlqtae5V_o3o0oz6XqLIbE4GWdt79edBJ4LedwqpHqua2nEysSFtLzTloVHdrQgRTnVajSTnKlsLxC1bPRbZyrpcRFXEjQArZJF25vnMSMDEH_ZdjYY9eTgFCWsL60Ti3UGj1dqunL2XMyrLDGmso0zWHWs3QNOFtPVJYhInzN27ba2B4tlGBRWL0tPOxX8toTrzldKz3nYX_CqgKre9LGfs1OFpobwwKJHjtEN83kyz1lZfbzvt-mPN1tQxwGK0wLZyiSPEX_gVCOX7Vv6PTDF6eJXhMfZa9ELRqQgc0MzpHqVdYNVUA6226Pk4P6KiN0UFT_IQS8PEPHHR6ZOAc8pEdpahjtf1EfL-QyV-imSJQLZrQkHxZpb6uBSv_Om3ZQXTF7AMYbehZ26YXdC0YOwN1eQXMplryqV5Pyoe8SpaL8CP4Ss1Nk_outR23bhyWW9l-n8YFeE6wAmuDZRRibbEiR0v1cJq5qYTDVevwe8GGTmZ454stA3CXv0owdE31xIHEmnJdc7_JAnhYWSg3P8eJOOnOXVZEIXiRyZuYEZTMreHTFhD02m8s4sLmtpJyZivc0o9wtgmgoRGMZ8TdgKLpK0ZcQ_pCbD1fExZIV4hU6jvy2qu-OPfklNvkB1HgCnP9p8zzie8qDyYGkr6gBGtxmBila6OXttXZhueZOcyv5CkGquU_ElB3SRSwIx1HeNB4WTCWOgMTD3Zz1EzzbHKseDvfb-pId9GrIYwfCNpHMfqA1rPt_k__xzg=s96-c',
                        headline: 'Researcher at PHTRP',
                      },
                      preregistration_post_id: 4355,
                      fundraise: {
                        id: 130,
                        title: 'Pioneering Phage Therapy Through Comparative Genomic Analysis of',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7908771,
                        first_name: 'Sade',
                        last_name: 'Clayton',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocLxCuEuzNScX3O1is7kkrgPUratNHz7-sbhGNv_rwWIJZWGP7h8=s96-c',
                        headline: 'Postdoctoral Fellow at Washington University',
                      },
                      preregistration_post_id: 4353,
                      fundraise: {
                        id: 128,
                        title: 'The Role of CD3+ T Lymphocytes in Intervertebral Disc Repair',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7908760,
                        first_name: 'Betül',
                        last_name: 'Işın',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 4356,
                      fundraise: {
                        id: 131,
                        title:
                          'Immune-Cold Resistance Landscape of NSCLC Driven by STK11/KEAP1 Mutations',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7962360,
                        first_name: 'Adhish',
                        last_name: 'Mazumder',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/22/blob_PGkqVS2',
                        headline: 'Project Research Scientist - I at PGIMER, India.',
                      },
                      preregistration_post_id: 4361,
                      fundraise: {
                        id: 136,
                        title:
                          'EVOMICSDB: A Multi-Omics, AI-Ready Extracellular Vesicle Database for Translational Discovery and Therapeutic Innovation',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7962360,
                        first_name: 'Adhish',
                        last_name: 'Mazumder',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/22/blob_PGkqVS2',
                        headline: 'Project Research Scientist - I at PGIMER, India.',
                      },
                      preregistration_post_id: 4359,
                      fundraise: {
                        id: 134,
                        title:
                          'Multi-Scale Computational Discovery of Shared Blood Biomarkers and Therapeutic Candidates for Schizophrenia and Osteoporosis',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7967609,
                        first_name: 'Shubhankhi',
                        last_name: 'Dey',
                        profile_image: null,
                        headline: 'PhD Scholar at PGIMER, Chandigarh',
                      },
                      preregistration_post_id: 4360,
                      fundraise: {
                        id: 135,
                        title:
                          'Integrative multi-omics based prediction of biomarkers across mood disorders (schizophrenia, major depressive disorder, and bipolar disorder)',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                  ],
                },
              },
              action_date: '2025-07-21T00:22:31.373246Z',
              action: 'PUBLISH',
            },
            {
              id: 4223,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 4223,
                slug: 'request-for-proposals-neuroscience-research-project',
                title: 'Request for Proposals - Neuroscience Research Project',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/d98e921e-3974-45e1-be46-95fdb33cdfbd/chatgpt-image-jul-21-2025-11_33_48-am.png',
                unified_document_id: 7520335,
                grant: {
                  id: 4,
                  status: 'OPEN',
                  amount: {
                    usd: 5000,
                    rsc: 62452.13426427965,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: null,
                  is_expired: true,
                  is_active: false,
                  application_count: 7,
                  applications: [
                    {
                      applicant: {
                        id: 7150259,
                        first_name: 'Gopi',
                        last_name: 'Battineni',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/02/06/blob_a6WQNjh',
                        headline:
                          "I'm a multidisciplinary researcher who focuses on artificial intelligence in medicine",
                      },
                      preregistration_post_id: 4226,
                      fundraise: {
                        id: 51,
                        title:
                          'Advanced Biomarker and Computational Strategies for Precision Medicine in Alzheimer’s Disease',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17498,
                            score: 2,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 9699,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 5822063,
                              first_name: 'Thomas',
                              last_name: 'Hatzilabrou',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/25/blob',
                              headline: 'Thomas Hatzilabrou',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 48,
                        status: 'completed',
                        tldr: "Proposal to combine large language models with machine-learning virtual screening to find Alzheimer's biomarkers and drug candidates and support precision medicine. Fits the RFP's junior neuroscience focus and is ambitious in scope, but methods are generic, lack specific models, datasets, validation metrics, and the $15k budget is poorly itemized.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 12.04514489000212,
                        created_date: '2026-05-05T16:44:17.491859Z',
                        updated_date: '2026-05-05T16:44:29.547432Z',
                        items: [
                          {
                            id: 830,
                            item_type: 'strength',
                            label: 'Timely Topic',
                            description:
                              'Targets a high-impact disease by combining LLMs and ML-based virtual screening, aligning with current interest in AI-driven drug discovery and precision medicine for AD.',
                            order: 0,
                            created_date: '2026-05-05T16:44:29.550826Z',
                            updated_date: '2026-05-05T16:44:29.550836Z',
                          },
                          {
                            id: 831,
                            item_type: 'strength',
                            label: 'Integrated Pipeline',
                            description:
                              'Proposes an end-to-end workflow linking literature mining, biomarker extraction, and compound screening, with a figure outlining the intended experimental framework.',
                            order: 1,
                            created_date: '2026-05-05T16:44:29.550856Z',
                            updated_date: '2026-05-05T16:44:29.550859Z',
                          },
                          {
                            id: 832,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to FAIR data practices, open-access dissemination, and stakeholder engagement, which supports reproducibility and community knowledge sharing.',
                            order: 2,
                            created_date: '2026-05-05T16:44:29.550869Z',
                            updated_date: '2026-05-05T16:44:29.550872Z',
                          },
                          {
                            id: 833,
                            item_type: 'strength',
                            label: 'RFP Fit',
                            description:
                              'Matches the ResearchHub call for a junior researcher pursuing an innovative neuroscience project, with modest scope appropriate to a small grant.',
                            order: 3,
                            created_date: '2026-05-05T16:44:29.550881Z',
                            updated_date: '2026-05-05T16:44:29.550883Z',
                          },
                          {
                            id: 834,
                            item_type: 'weakness',
                            label: 'Vague Methods',
                            description:
                              'Specific LLMs, ML-VS algorithms, compound libraries, and statistical metrics (e.g., F1, accuracy benchmarks) are not named, making feasibility and rigor hard to assess.',
                            order: 0,
                            created_date: '2026-05-05T16:44:29.550892Z',
                            updated_date: '2026-05-05T16:44:29.550895Z',
                          },
                          {
                            id: 835,
                            item_type: 'weakness',
                            label: 'No Validation Plan',
                            description:
                              'Lacks concrete experimental or wet-lab validation of predicted biomarkers and drug candidates; claims about discovering biomarkers and compounds are illustrative, not confirmatory.',
                            order: 1,
                            created_date: '2026-05-05T16:44:29.550904Z',
                            updated_date: '2026-05-05T16:44:29.550906Z',
                          },
                          {
                            id: 836,
                            item_type: 'weakness',
                            label: 'Weak Pilot Data',
                            description:
                              'The pilot section restates plans rather than presenting preliminary results, feasibility evidence, or prior performance data to justify the integrated approach.',
                            order: 2,
                            created_date: '2026-05-05T16:44:29.550915Z',
                            updated_date: '2026-05-05T16:44:29.550917Z',
                          },
                          {
                            id: 837,
                            item_type: 'weakness',
                            label: 'Budget Issues',
                            description:
                              'Line items include resources that are freely available (PubMed, ADNI, open-source modeling tools), and allocations for computing and publication appear mis-scaled per the human reviewer.',
                            order: 3,
                            created_date: '2026-05-05T16:44:29.550926Z',
                            updated_date: '2026-05-05T16:44:29.550929Z',
                          },
                          {
                            id: 838,
                            item_type: 'weakness',
                            label: 'Overstated Claims',
                            description:
                              'Text implies LLMs and AI imaging analysis can match expert clinicians, but the reviewer notes real-world AI accuracy still trails human annotation, raising clinical reliability concerns.',
                            order: 4,
                            created_date: '2026-05-05T16:44:29.550937Z',
                            updated_date: '2026-05-05T16:44:29.550940Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 989685,
                        first_name: 'Faye',
                        last_name: 'McKenna',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                        headline:
                          'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                      },
                      preregistration_post_id: 4250,
                      fundraise: {
                        id: 63,
                        title:
                          'Cerebrovascular Disease Underlying White Matter Pathology in Alzheimer’s Disease with and without a History of COVID-19',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: {
                          id: 18,
                          name: 'Albert Einstein College of Medicine',
                        },
                        reviews: [
                          {
                            id: 10546,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7603557,
                              first_name: 'Peng',
                              last_name: 'Li',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/07/blob_XuLhgBK',
                              headline:
                                'Assistant Professor, Harvard Medical School | Massachusetts General Hospital',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 5822063,
                        first_name: 'Thomas',
                        last_name: 'Hatzilabrou',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/25/blob',
                        headline: 'Thomas Hatzilabrou',
                      },
                      preregistration_post_id: 4288,
                      fundraise: {
                        id: 82,
                        title:
                          'NeuroSEED: Closed-Loop Cortico-Striatal Reprogramming for the Non-Invasive Erasure of Addictive Drive',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 10757,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7765045,
                              first_name: 'Margaret',
                              last_name: 'Van Horn',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/28/blob_4HOXZLe',
                              headline: 'PhD, CMPP',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 963605,
                        first_name: 'hina',
                        last_name: 'singh',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ALm5wu0RHslBf0-cCdIXMnbOfz_ik7o7YRTT6ePh92snC4Q=s96-c',
                        headline: 'Assistant Project Scientist at UC Riverside',
                      },
                      preregistration_post_id: 4299,
                      fundraise: {
                        id: 88,
                        title:
                          'Role of C3, C4b, CXCL10 and LCN2 in HIV associated white matter injury',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: {
                          id: 11,
                          name: 'UC Riverside Foundation',
                        },
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964166,
                        first_name: 'Ruslan',
                        last_name: 'Kurmashev',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/21/blob_URDbsq1',
                        headline: 'MSc in Computational Biology | MD',
                      },
                      preregistration_post_id: 4320,
                      fundraise: {
                        id: 101,
                        title:
                          'Multi-Omics Integration for Early Autism Spectrum Disorder (ASD) Diagnosis in Children',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 10911,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 7631880,
                              first_name: 'Sean',
                              last_name: 'McCracken',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
                              headline: 'Postdoctoral Researcher.  Founder of NeuroReview. ',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964193,
                        first_name: 'Bruk',
                        last_name: 'Getachew',
                        profile_image: null,
                        headline: 'Researcher at Howard University',
                      },
                      preregistration_post_id: 4321,
                      fundraise: {
                        id: 102,
                        title:
                          'Potential Novel Intervention in Demyelination: Implication for Multiple Sclerosis',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7631880,
                        first_name: 'Sean',
                        last_name: 'McCracken',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
                        headline: 'Postdoctoral Researcher.  Founder of NeuroReview. ',
                      },
                      preregistration_post_id: 4322,
                      fundraise: {
                        id: 103,
                        title: 'The role of Ketamine in Optic Nerve Injury',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                  ],
                },
              },
              action_date: '2025-07-16T03:25:07.738562Z',
              action: 'PUBLISH',
            },
            {
              id: 4222,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 4222,
                slug: 'request-for-proposals-cancer-biology-research-project',
                title: 'Request for Proposals - Cancer Biology Research Project',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/4ef11956-d243-48c9-bda2-ae1a859aed8b/chatgpt-image-jul-21-2025-12_30_33-pm.png',
                unified_document_id: 7520286,
                grant: {
                  id: 3,
                  status: 'OPEN',
                  amount: {
                    usd: 5000,
                    rsc: 62452.13426427965,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: 'Cancer Biology',
                  is_expired: true,
                  is_active: false,
                  application_count: 5,
                  applications: [
                    {
                      applicant: {
                        id: 5822063,
                        first_name: 'Thomas',
                        last_name: 'Hatzilabrou',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/25/blob',
                        headline: 'Thomas Hatzilabrou',
                      },
                      preregistration_post_id: 4283,
                      fundraise: {
                        id: 78,
                        title:
                          'Development of a Pan-Cancer Neoantigen Vaccine Targeting Recurrent Mutations via Modular mRNA-LNP Delivery',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 10388,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 7618797,
                              first_name: 'Surojit',
                              last_name: 'Karmakar, Ph.D.',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/12/blob_cA4RZZh',
                              headline: 'Post-Doctoral Associate at Yale School of medicine',
                            },
                          },
                          {
                            id: 10448,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 1871571,
                              first_name: 'David',
                              last_name: 'Warmflash',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/05/blob_77t7OdU',
                              headline: 'medicine, aerospace physiology, genetics, astrobiology',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7908769,
                        first_name: 'Oleksandra',
                        last_name: 'Fanari',
                        profile_image: null,
                        headline: 'PhD Candidate in BIOE at Northeastern University',
                      },
                      preregistration_post_id: 4298,
                      fundraise: {
                        id: 87,
                        title:
                          'Control‑guided nanopore sequencing to map DUS2‑dependent dihydrouridylation in human lung adenocarcinoma cells.',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 10793,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 991840,
                              first_name: 'Jacob',
                              last_name: 'Haase',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/03/30/blob_y5Utg3U',
                              headline: 'Oncology | CRISPR | Diagnostics & Biomarker',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964068,
                        first_name: 'Keerthana',
                        last_name: 'Gunaretnam',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJUodf6yvFQZiUv2Cwbr83W24AU6jEpqfyLdnIa929iA2Vm_h8=s96-c',
                        headline: 'Interdisciplinary Researcher @araCreate Lanka',
                      },
                      preregistration_post_id: 4317,
                      fundraise: {
                        id: 98,
                        title:
                          'Comparative Bioinformatic Analysis of Tumor Suppressor and Oncogene Variants Across Human Cancer and space flight induced Genomic Alterations',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 10917,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7444533,
                              first_name: 'Xiaowei',
                              last_name: 'Wu',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/02/10/blob',
                              headline: '',
                            },
                          },
                          {
                            id: 10997,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 930627,
                              first_name: 'Rakhan',
                              last_name: 'Aimbetov',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/10/blob',
                              headline: 'Researcher · Founder',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964026,
                        first_name: 'Bin',
                        last_name: 'Sheng',
                        profile_image: null,
                        headline: 'Researcher at Subei Hospital of Jiangsu Province',
                      },
                      preregistration_post_id: 4312,
                      fundraise: {
                        id: 94,
                        title:
                          'Role and Mechanism of MDK in Promoting Vascular Mimicry in Breast Cancer',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 10570,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 7276303,
                              first_name: 'Nan',
                              last_name: 'Yabing',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocLn_K6v44gtg_Cmcp9Jam6fbZVBV2JdBE4j3MV9Z0FjgrViNYU=s96-c',
                              headline:
                                'Research Fellow of Cancer Biology, Dana-Farber Cancer Institute, Harvard Medical School',
                            },
                          },
                          {
                            id: 10610,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7444533,
                              first_name: 'Xiaowei',
                              last_name: 'Wu',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/02/10/blob',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964083,
                        first_name: 'Ketan',
                        last_name: 'Chandra',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJ5J628g0Mh1SRNauJy_R9m0zHcnBcjxhmstDXo1H86OQwT3g=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 4319,
                      fundraise: {
                        id: 100,
                        title:
                          'miR‑RadScore: An open, reproducible microRNA signature to predict tumour radio-sensitivity and guide DNA‑damage–response therapy selection',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                  ],
                },
              },
              action_date: '2025-07-15T19:47:56.350074Z',
              action: 'PUBLISH',
            },
            {
              id: 31919,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 31919,
                slug: 'in-silico-drug-screening',
                title: 'In Silico Drug Screening',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/dd4953ae-6d9f-4ab4-8365-ce2916909e78/screenshot-2026-03-16-at-9.png',
                unified_document_id: 9109625,
                grant: {
                  id: 304,
                  status: 'CLOSED',
                  amount: {
                    usd: 5000,
                    rsc: 62452.13426427965,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: null,
                  is_expired: false,
                  is_active: false,
                  application_count: 4,
                  applications: [
                    {
                      applicant: {
                        id: 1871672,
                        first_name: 'Harshit Kumar',
                        last_name: 'Soni',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJBpf_Okr7nT5dPHrHOCiG1okLEKPFd6gzhb8RATz1ScfkZqRDc=s96-c',
                        headline: 'Cancer Cell Biologist',
                      },
                      preregistration_post_id: 32102,
                      fundraise: {
                        id: 781,
                        title:
                          'A Reproducible Comparison of Machine Learning and Classical Docking Approaches for In Silico Drug Screening on KRAS',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17430,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 16923,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8385365,
                              first_name: 'Qi-hang',
                              last_name: 'Guo',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/12/20/blob_261d2PH',
                              headline: 'Trustworthy AI & Information Systems Research',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 26,
                        status: 'completed',
                        tldr: "Proposes a 6-month, reproducible in silico screening study comparing AutoDock Vina (classical) and DiffDock (ML) on KRAS with a 3-5k compound library, aligning well with the RFP's benchmarking and lead-generation aims. Strong open-science and preregistration plan, but novelty is modest and the design lacks decoy/known-active enrichment controls and team details.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 12.887854355038144,
                        created_date: '2026-05-02T16:06:45.746885Z',
                        updated_date: '2026-05-02T17:50:26.095741Z',
                        items: [
                          {
                            id: 583,
                            item_type: 'strength',
                            label: 'Open Science Rigor',
                            description:
                              'Commits to preregistration, GitHub/OSF sharing of code, data, parameters, and ranked outputs, with Docker/Conda environments for reproducibility.',
                            order: 0,
                            created_date: '2026-05-02T17:50:26.101294Z',
                            updated_date: '2026-05-02T17:50:26.101303Z',
                          },
                          {
                            id: 584,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              'Directly addresses the call by comparing at least one classical and one ML docking method with predefined metrics and ranked candidate outputs.',
                            order: 1,
                            created_date: '2026-05-02T17:50:26.101323Z',
                            updated_date: '2026-05-02T17:50:26.101327Z',
                          },
                          {
                            id: 585,
                            item_type: 'strength',
                            label: 'Feasible Design',
                            description:
                              'Two-stage Vina-then-DiffDock workflow with moderate library size and staged CPU/GPU use is realistic for a microgrant and 6-month timeline.',
                            order: 2,
                            created_date: '2026-05-02T17:50:26.101336Z',
                            updated_date: '2026-05-02T17:50:26.101339Z',
                          },
                          {
                            id: 586,
                            item_type: 'strength',
                            label: 'Clear Hypotheses',
                            description:
                              'H1-H4 are explicit and testable across pose quality, ranking agreement, scaffold diversity, and compute cost, with IF-THEN contingencies.',
                            order: 3,
                            created_date: '2026-05-02T17:50:26.101348Z',
                            updated_date: '2026-05-02T17:50:26.101350Z',
                          },
                          {
                            id: 587,
                            item_type: 'strength',
                            label: 'Relevant Target',
                            description:
                              'KRAS is therapeutically important and structurally challenging, making it a meaningful and practitioner-relevant test case for method comparison.',
                            order: 4,
                            created_date: '2026-05-02T17:50:26.101359Z',
                            updated_date: '2026-05-02T17:50:26.101361Z',
                          },
                          {
                            id: 588,
                            item_type: 'weakness',
                            label: 'No Enrichment Controls',
                            description:
                              'Design omits decoy sets (e.g., DUD-E) and known KRAS actives for enrichment analysis, limiting ability to judge method quality beyond internal consistency.',
                            order: 0,
                            created_date: '2026-05-02T17:50:26.101369Z',
                            updated_date: '2026-05-02T17:50:26.101372Z',
                          },
                          {
                            id: 589,
                            item_type: 'weakness',
                            label: 'Limited Novelty',
                            description:
                              'Vina-vs-DiffDock comparisons and KRAS ML virtual screening studies already exist; incremental insight beyond a packaged reproducible pipeline is modest.',
                            order: 1,
                            created_date: '2026-05-02T17:50:26.101380Z',
                            updated_date: '2026-05-02T17:50:26.101383Z',
                          },
                          {
                            id: 590,
                            item_type: 'weakness',
                            label: 'Two-Stage Bias',
                            description:
                              "Applying DiffDock only to Vina-top compounds prevents discovery of ML-unique hits from the full library and biases the comparison toward Vina's ranking.",
                            order: 2,
                            created_date: '2026-05-02T17:50:26.101391Z',
                            updated_date: '2026-05-02T17:50:26.101393Z',
                          },
                          {
                            id: 591,
                            item_type: 'weakness',
                            label: 'Team Undocumented',
                            description:
                              'Proposal omits a team section and track record; external signals suggest limited prior CADD/ML-docking experience, raising execution-risk concerns.',
                            order: 3,
                            created_date: '2026-05-02T17:50:26.101402Z',
                            updated_date: '2026-05-02T17:50:26.101404Z',
                          },
                          {
                            id: 592,
                            item_type: 'weakness',
                            label: 'Thin Justifications',
                            description:
                              'GPU hour estimates (40-80h), researcher-time rate, method choice (DiffDock only), and conformation-ranking stability are asserted without derivation; references are missing.',
                            order: 4,
                            created_date: '2026-05-02T17:50:26.101413Z',
                            updated_date: '2026-05-02T17:50:26.101415Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 7314524,
                        first_name: 'Juan Fidel',
                        last_name: 'Osuna-Ramos',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/04/02/blob_nbbFNIE',
                        headline: 'MD, PhD',
                      },
                      preregistration_post_id: 32111,
                      fundraise: {
                        id: 784,
                        title:
                          'Machine Learning–Guided and Site-Resolved In Silico Screening for Identification of RSV F-Protein Modulators',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17329,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8599682,
                              first_name: 'Brian',
                              last_name: 'Andrews',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/04/08/blob_dCT2pMj',
                              headline: 'Computational Biophysics and Machine Learning',
                            },
                          },
                          {
                            id: 17385,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8114247,
                              first_name: 'Muhammad',
                              last_name: 'Asif',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/10/30/blob_q9haHqP',
                              headline: 'RA Max-Planck Institut für empirische Ästhetik',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8590605,
                        first_name: 'Arden',
                        last_name: 'Baylink',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/04/06/blob_A0irBGo',
                        headline: 'Assistant Professor, Washington State University',
                      },
                      preregistration_post_id: 32223,
                      fundraise: {
                        id: 824,
                        title:
                          'Title: Benchmarking Open-Source and Commercial Docking Tools for Virtual Screening against a Bacterial Peroxiredoxin Target',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: {
                          id: 52,
                          name: 'Washington State University Foundation',
                        },
                        reviews: [
                          {
                            id: 17431,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 27,
                        status: 'completed',
                        tldr: "Proposal benchmarks two open-source docking tools (Boltz-2, DataWarrior) against commercial Molsoft ICM using a validated ~2,300-compound library screened on H. pylori AhpC, fitting the RFP's call to compare at least two in silico methods. Strengths include an experimentally validated dataset and clear pre-specified metrics; main risk is that only ~6 strong actives and a single target limit generalizability.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 11.693906876957044,
                        created_date: '2026-05-02T16:07:43.772605Z',
                        updated_date: '2026-05-28T17:04:56.868001Z',
                        items: [
                          {
                            id: 1343,
                            item_type: 'strength',
                            label: 'Validated Benchmark Dataset',
                            description:
                              'Uses a pre-existing ~2,300-compound library with experimentally confirmed actives and inactives against AhpC, providing a fixed ground truth for fair cross-tool comparison.',
                            order: 0,
                            created_date: '2026-05-28T17:04:56.873069Z',
                            updated_date: '2026-05-28T17:04:56.873078Z',
                          },
                          {
                            id: 1344,
                            item_type: 'strength',
                            label: 'RFP Fit',
                            description:
                              'Directly compares three in silico screening methods on an applicant-chosen, medically relevant WHO priority-pathogen target, matching the funding call.',
                            order: 1,
                            created_date: '2026-05-28T17:04:56.873098Z',
                            updated_date: '2026-05-28T17:04:56.873101Z',
                          },
                          {
                            id: 1345,
                            item_type: 'strength',
                            label: 'Pre-Specified Metrics',
                            description:
                              'Primary outcomes (EF1%, EF5%, rank distribution, throughput) and secondary KS test are appropriate for small active sets and reduce analytic flexibility.',
                            order: 2,
                            created_date: '2026-05-28T17:04:56.873110Z',
                            updated_date: '2026-05-28T17:04:56.873113Z',
                          },
                          {
                            id: 1346,
                            item_type: 'strength',
                            label: 'Feasibility And Resources',
                            description:
                              'WSU Kamiak HPC, prior AhpC expertise, modest itemized budget, and a 6-month timeline with a contingency month make execution realistic.',
                            order: 3,
                            created_date: '2026-05-28T17:04:56.873122Z',
                            updated_date: '2026-05-28T17:04:56.873124Z',
                          },
                          {
                            id: 1347,
                            item_type: 'strength',
                            label: 'Open Science Plan',
                            description:
                              'Commits to public deposition of raw scores, ranked lists, log files, and analysis scripts in a perpetual WSU repository, plus preprint and journal release.',
                            order: 4,
                            created_date: '2026-05-28T17:04:56.873133Z',
                            updated_date: '2026-05-28T17:04:56.873136Z',
                          },
                          {
                            id: 1348,
                            item_type: 'weakness',
                            label: 'Few Strong Actives',
                            description:
                              'Only ~6 confirmed potent inhibitors limits statistical power; small shifts in rank could drive large apparent differences in EF1%/EF5% between tools.',
                            order: 0,
                            created_date: '2026-05-28T17:04:56.873144Z',
                            updated_date: '2026-05-28T17:04:56.873146Z',
                          },
                          {
                            id: 1349,
                            item_type: 'weakness',
                            label: 'Single Target',
                            description:
                              'One receptor (AhpC, PDB 1zof) restricts generalizability of conclusions about tool performance to other proteins or chemotypes, as the authors acknowledge.',
                            order: 1,
                            created_date: '2026-05-28T17:04:56.873155Z',
                            updated_date: '2026-05-28T17:04:56.873157Z',
                          },
                          {
                            id: 1350,
                            item_type: 'weakness',
                            label: 'Default Settings',
                            description:
                              "Using out-of-the-box protocols without per-tool optimization may underrepresent each platform's achievable performance, especially for ML-based Boltz-2.",
                            order: 2,
                            created_date: '2026-05-28T17:04:56.873165Z',
                            updated_date: '2026-05-28T17:04:56.873168Z',
                          },
                          {
                            id: 1351,
                            item_type: 'weakness',
                            label: 'Missing Disclosures',
                            description:
                              'No explicit conflict-of-interest statement despite a related PI patent (ref 11), and no disclosure of AI assistance in drafting or analysis beyond Boltz-2.',
                            order: 3,
                            created_date: '2026-05-28T17:04:56.873176Z',
                            updated_date: '2026-05-28T17:04:56.873179Z',
                          },
                          {
                            id: 1352,
                            item_type: 'weakness',
                            label: 'Incremental Novelty',
                            description:
                              'Docking benchmarks are an established genre and Boltz-2 evaluations are emerging; contribution is a useful case study rather than methodological innovation.',
                            order: 4,
                            created_date: '2026-05-28T17:04:56.873188Z',
                            updated_date: '2026-05-28T17:04:56.873190Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 7944791,
                        first_name: 'Khondamir',
                        last_name: 'Rustamov',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocI9wKqhqtic0gXOB7ULMtEvdp4_maQzczSa2lLNtFiFc-KH_4TRVA=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 32242,
                      fundraise: {
                        id: 838,
                        title:
                          'Large-Scale Mapping of Human GPCR–Ligand Interactions Using Boltz-2',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17432,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17488,
                            score: 2,
                            is_assessed: true,
                            author: {
                              id: 8625206,
                              first_name: 'Mahmoud Elhusseiny',
                              last_name: 'Mostafa',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocIQ6ovlyXblNAG-bDl8TlP3_ucpfglah4_SnZ-Y5AZbLSqCbMs=s96-c',
                              headline: 'Postdoctoral Researcher at Harvard Medical School',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 28,
                        status: 'completed',
                        tldr: "Proposes an all-against-all in silico screen of 370 human GPCRs against 500+ ligands using Boltz-2 vs AutoDock Vina, generating ~200,000 open predictions. Fits the RFP's two-method comparison call and is backed by strong pilot data (44,574 predictions, R=0.78). Main risk: methodological details for Vina setup and benchmarking metrics are underspecified, and there is no experimental validation.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 12.464407164981822,
                        created_date: '2026-05-02T16:08:24.601108Z',
                        updated_date: '2026-05-29T05:18:25.490993Z',
                        items: [
                          {
                            id: 1353,
                            item_type: 'strength',
                            label: 'Strong Pilot Data',
                            description:
                              'Already generated 44,574 Boltz-2 predictions with R=0.78 vs experimental pKi on a leakage-controlled 89-pair benchmark, demonstrating feasibility within budget and timeline.',
                            order: 0,
                            created_date: '2026-05-29T05:18:25.496044Z',
                            updated_date: '2026-05-29T05:18:25.496057Z',
                          },
                          {
                            id: 1354,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              'Directly matches the call for comparing at least two in silico methods on a chosen target, with Boltz-2 vs Vina across the full GPCRome.',
                            order: 1,
                            created_date: '2026-05-29T05:18:25.496082Z',
                            updated_date: '2026-05-29T05:18:25.496086Z',
                          },
                          {
                            id: 1355,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits all structures, code, and pipelines to GitHub, Zenodo, and an existing public web portal, producing a reusable community resource.',
                            order: 2,
                            created_date: '2026-05-29T05:18:25.496097Z',
                            updated_date: '2026-05-29T05:18:25.496099Z',
                          },
                          {
                            id: 1356,
                            item_type: 'strength',
                            label: 'Modest Budget',
                            description:
                              '$5,000 for ~1,370 H200 GPU-hours plus storage is well itemized and grounded in pilot-derived cost estimates for ~150,000 additional predictions.',
                            order: 3,
                            created_date: '2026-05-29T05:18:25.496109Z',
                            updated_date: '2026-05-29T05:18:25.496111Z',
                          },
                          {
                            id: 1357,
                            item_type: 'strength',
                            label: 'Relevant Scope',
                            description:
                              'Covers 93 orphan GPCRs and approved therapeutics, addressing biologically meaningful deorphanization and repurposing questions at unprecedented scale.',
                            order: 4,
                            created_date: '2026-05-29T05:18:25.496120Z',
                            updated_date: '2026-05-29T05:18:25.496122Z',
                          },
                          {
                            id: 1358,
                            item_type: 'weakness',
                            label: 'Underspecified Benchmarking',
                            description:
                              'No explicit metrics (RMSD cutoffs, AUROC, enrichment factors) or statistical tests are defined for comparing Boltz-2 and Vina, weakening rigor of the central comparison.',
                            order: 0,
                            created_date: '2026-05-29T05:18:25.496131Z',
                            updated_date: '2026-05-29T05:18:25.496134Z',
                          },
                          {
                            id: 1359,
                            item_type: 'weakness',
                            label: 'Vina Methodology Gaps',
                            description:
                              'Pocket/binding-site definition for 370 receptors, handling of modeled vs experimental structures, ligand protonation, and peptide docking limits are not described.',
                            order: 1,
                            created_date: '2026-05-29T05:18:25.496143Z',
                            updated_date: '2026-05-29T05:18:25.496145Z',
                          },
                          {
                            id: 1360,
                            item_type: 'weakness',
                            label: 'No Experimental Validation',
                            description:
                              'Claims around orphan GPCR deorphanization and drug repurposing are ambitious for an entirely computational study with no wet-lab follow-up planned.',
                            order: 2,
                            created_date: '2026-05-29T05:18:25.496154Z',
                            updated_date: '2026-05-29T05:18:25.496157Z',
                          },
                          {
                            id: 1361,
                            item_type: 'weakness',
                            label: 'Single-PI Team',
                            description:
                              'Effort appears to rest on one investigator with limited documented GPCR-specific publication history, raising capacity and expertise questions for a 200,000-pair effort.',
                            order: 3,
                            created_date: '2026-05-29T05:18:25.496165Z',
                            updated_date: '2026-05-29T05:18:25.496168Z',
                          },
                          {
                            id: 1362,
                            item_type: 'weakness',
                            label: 'Tight Budget/Timeline',
                            description:
                              'Budget exactly matches the cap with no contingency, and the 6-month plan assumes minimal technical delays in screening, docking, and benchmarking.',
                            order: 4,
                            created_date: '2026-05-29T05:18:25.496176Z',
                            updated_date: '2026-05-29T05:18:25.496179Z',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              action_date: '2026-03-17T04:57:46.433852Z',
              action: 'PUBLISH',
            },
            {
              id: 5477,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 5477,
                slug: 'request-for-proposals-functional-microbiome-in-veterinary-medicine',
                title: 'Microbiome and Biological Systems',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/35bdd6b3-1673-43a0-a248-3af29b5e5dc7/dianne_newman.jpeg',
                unified_document_id: 8998910,
                grant: {
                  id: 27,
                  status: 'CLOSED',
                  amount: {
                    usd: 10000,
                    rsc: 124904.2685285593,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: 'Veterinary Microbiomics',
                  is_expired: false,
                  is_active: false,
                  application_count: 4,
                  applications: [
                    {
                      applicant: {
                        id: 7901811,
                        first_name: 'Christopher',
                        last_name: 'Dutton',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/07/27/blob_t7Ju85M',
                        headline: 'Assistant Professor at the University of Florida',
                      },
                      preregistration_post_id: 26127,
                      fundraise: {
                        id: 356,
                        title:
                          'Functional Capacity of the Gorilla Gut Microbiome: Linking Metabolic Pathways to Pneumatosis Intestinalis via Nanopore Shotgun Metagenomics',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 38,
                          name: 'University of Florida Foundation, Inc.',
                        },
                        reviews: [
                          {
                            id: 17418,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 16899,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8582546,
                              first_name: 'Alexander',
                              last_name: 'Schreiber',
                              profile_image: null,
                              headline: 'Comparative developmental endocrinologist',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 14,
                        status: 'completed',
                        tldr: "Proposes adding nanopore shotgun metagenomics to 30-40 samples from a longitudinal 16S study of 15 managed-care gorillas to link microbial functional capacity (hydrogen economy, CAZymes) to pneumatosis intestinalis. Fits the RFP's functional microbiomics focus well, with strong pilot data and open-science commitments, but single-site cohort with few PI cases and a tight 6-month timeline limit generalizability.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 13.859635477012489,
                        created_date: '2026-05-02T15:58:15.567057Z',
                        updated_date: '2026-05-02T17:41:44.947888Z',
                        items: [
                          {
                            id: 473,
                            item_type: 'strength',
                            label: 'Strong Pilot Data',
                            description:
                              'Longitudinal 16S data on 15 gorillas with concrete PERMANOVA effect sizes and clear dysbiosis patterns justify the shotgun extension and inform sample selection.',
                            order: 0,
                            created_date: '2026-05-02T17:41:44.953160Z',
                            updated_date: '2026-05-02T17:41:44.953168Z',
                          },
                          {
                            id: 474,
                            item_type: 'strength',
                            label: 'Mechanistic Hypotheses',
                            description:
                              'Three falsifiable, pre-specified hypotheses (hydrogen economy, CAZyme architecture, functional vs taxonomic discrimination) with defined statistical tests and IF-THEN contingencies.',
                            order: 1,
                            created_date: '2026-05-02T17:41:44.953189Z',
                            updated_date: '2026-05-02T17:41:44.953192Z',
                          },
                          {
                            id: 475,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              "Directly targets functional microbiomics in veterinary medicine, accessing archaeal and fungal activity invisible to 16S, matching the funder's emphasis on microbial functions and pathways.",
                            order: 2,
                            created_date: '2026-05-02T17:41:44.953202Z',
                            updated_date: '2026-05-02T17:41:44.953205Z',
                          },
                          {
                            id: 476,
                            item_type: 'strength',
                            label: 'Infrastructure Fit',
                            description:
                              'In-kind access to MinION, Opentrons robots, and a dedicated HiPerGator HPC allocation, plus partner-funded 16S, makes the $10,000 request realistic for the scope.',
                            order: 3,
                            created_date: '2026-05-02T17:41:44.953214Z',
                            updated_date: '2026-05-02T17:41:44.953217Z',
                          },
                          {
                            id: 477,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to ResearchHub preregistration, Registered Report, NCBI SRA deposition with MIMARKS metadata, and open-source Opentrons library prep scripts on GitHub.',
                            order: 4,
                            created_date: '2026-05-02T17:41:44.953225Z',
                            updated_date: '2026-05-02T17:41:44.953228Z',
                          },
                          {
                            id: 478,
                            item_type: 'weakness',
                            label: 'Small Cohort',
                            description:
                              'Only 15 gorillas at a single facility with few PI cases in the pilot, plus repeated measures, raise pseudoreplication concerns and limit generalizability and statistical independence.',
                            order: 0,
                            created_date: '2026-05-02T17:41:44.953236Z',
                            updated_date: '2026-05-02T17:41:44.953238Z',
                          },
                          {
                            id: 479,
                            item_type: 'weakness',
                            label: 'Potential vs Activity',
                            description:
                              'Shotgun metagenomics measures gene abundance (functional potential), not expression or activity; claims about hydrogen metabolism dynamics should be tempered absent metatranscriptomics or metabolomics.',
                            order: 1,
                            created_date: '2026-05-02T17:41:44.953247Z',
                            updated_date: '2026-05-02T17:41:44.953249Z',
                          },
                          {
                            id: 480,
                            item_type: 'weakness',
                            label: 'Causal Inference',
                            description:
                              'Observational design cannot establish that microbial hydrogen imbalance causes PI; host physiology, motility, barrier integrity, and diet variation are not sufficiently addressed as alternatives.',
                            order: 2,
                            created_date: '2026-05-02T17:41:44.953257Z',
                            updated_date: '2026-05-02T17:41:44.953260Z',
                          },
                          {
                            id: 481,
                            item_type: 'weakness',
                            label: 'Timeline Risk',
                            description:
                              'Six months to complete sampling, library prep, six flow-cell runs, assembly, annotation, integration, and manuscript is ambitious; assembly and annotation steps commonly slip.',
                            order: 3,
                            created_date: '2026-05-02T17:41:44.953268Z',
                            updated_date: '2026-05-02T17:41:44.953270Z',
                          },
                          {
                            id: 482,
                            item_type: 'weakness',
                            label: 'Nanopore Limits',
                            description:
                              'Higher error rates may affect gene prediction and resolution of closely related genes (e.g., hydrogenase subtypes); error correction and annotation validation strategies are not fully detailed.',
                            order: 4,
                            created_date: '2026-05-02T17:41:44.953279Z',
                            updated_date: '2026-05-02T17:41:44.953282Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 7967214,
                        first_name: 'Haydeé',
                        last_name: 'Peruyero',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocLXehVvdUn8GcTMGr_N08IAk_lrPh8ZaINdid6f82stacba5UAqcQ=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 31900,
                      fundraise: {
                        id: 762,
                        title:
                          'Genome-Resolved Comparative Mining of Biosynthetic Gene Clusters in Global Stingless Bee Honey Metagenomes',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17419,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 16925,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 1362659,
                              first_name: 'Ilhan',
                              last_name: 'Altinok',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/26/blob_PDSU5QW',
                              headline: 'Vaccines, Genomics, Immunology',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 15,
                        status: 'completed',
                        tldr: 'Proposal mines biosynthetic gene clusters in a candidate novel honey-associated genus (Meliponilactobacillus) from stingless bees via comparative metagenomics, metabolomics, antibiograms, and gnotobiotic inoculations with brain metabolomics. Fits the Veterinary Microbiomics RFP well and leverages strong pilot data and meliponary access, but the 12-month timeline and ~$10k budget are mismatched to the ambitious multi-omics scope.',
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 20.00673242198536,
                        created_date: '2026-05-02T15:59:02.727144Z',
                        updated_date: '2026-05-02T17:42:36.810693Z',
                        items: [
                          {
                            id: 483,
                            item_type: 'strength',
                            label: 'Novel Taxon Focus',
                            description:
                              'Targets a provisionally new honey-associated lineage (Meliponilactobacillus) with its own preprint pilot data, offering genuine novelty relative to Apis/Bombus microbiome work.',
                            order: 0,
                            created_date: '2026-05-02T17:42:36.816186Z',
                            updated_date: '2026-05-02T17:42:36.816194Z',
                          },
                          {
                            id: 484,
                            item_type: 'strength',
                            label: 'RFP Alignment',
                            description:
                              'Integrates BGC mining, metabolite production, antimicrobial activity, and host-microbe interactions, directly matching the functional veterinary microbiomics scope.',
                            order: 1,
                            created_date: '2026-05-02T17:42:36.816213Z',
                            updated_date: '2026-05-02T17:42:36.816216Z',
                          },
                          {
                            id: 485,
                            item_type: 'strength',
                            label: 'Pilot Resources',
                            description:
                              'Team already has 17 metagenomes, 3 isolates, validated DNA extraction, meliponary access in Mexico and Costa Rica, and demonstrated axenic stingless-bee rearing.',
                            order: 2,
                            created_date: '2026-05-02T17:42:36.816225Z',
                            updated_date: '2026-05-02T17:42:36.816228Z',
                          },
                          {
                            id: 486,
                            item_type: 'strength',
                            label: 'Controlled Design',
                            description:
                              'Uses BGC-negative Acetilactobacillus as a genetically close control and qPCR-verified microbiota-free bees, strengthening causal inference for BGC-linked phenotypes.',
                            order: 3,
                            created_date: '2026-05-02T17:42:36.816237Z',
                            updated_date: '2026-05-02T17:42:36.816239Z',
                          },
                          {
                            id: 487,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Commits to SRA deposition, GitHub/Zenodo for code and processed results, and FAIR principles, supporting reproducibility and community reuse.',
                            order: 4,
                            created_date: '2026-05-02T17:42:36.816248Z',
                            updated_date: '2026-05-02T17:42:36.816250Z',
                          },
                          {
                            id: 488,
                            item_type: 'weakness',
                            label: 'Timeline Overreach',
                            description:
                              'Twelve months (only 6 months wet/dry) to complete global metagenome reanalysis, fermentations, MS, antibiograms, gnotobiotic inoculations, and brain GC-MS is unrealistic with no contingency.',
                            order: 0,
                            created_date: '2026-05-02T17:42:36.816259Z',
                            updated_date: '2026-05-02T17:42:36.816262Z',
                          },
                          {
                            id: 489,
                            item_type: 'weakness',
                            label: 'Underscoped Budget',
                            description:
                              'About $10k with no personnel, qPCR reagents, brain GC-MS supplies, transcriptomics, or mutagenesis costs; only 6 nanopore metagenomes despite global ambitions.',
                            order: 1,
                            created_date: '2026-05-02T17:42:36.816270Z',
                            updated_date: '2026-05-02T17:42:36.816272Z',
                          },
                          {
                            id: 490,
                            item_type: 'weakness',
                            label: 'Conditional Key Aims',
                            description:
                              "Transcriptomics and targeted mutagenesis are hedged as 'if feasible/time allows,' weakening the mechanistic link between BGC and metabolite or brain phenotypes.",
                            order: 2,
                            created_date: '2026-05-02T17:42:36.816281Z',
                            updated_date: '2026-05-02T17:42:36.816283Z',
                          },
                          {
                            id: 491,
                            item_type: 'weakness',
                            label: 'Statistical Detail',
                            description:
                              'Sample size justification leans on a single citation; no power analysis, blinding plan, or handling of cage/batch effects across 6 boxes and metabolomics replicates.',
                            order: 3,
                            created_date: '2026-05-02T17:42:36.816292Z',
                            updated_date: '2026-05-02T17:42:36.816294Z',
                          },
                          {
                            id: 492,
                            item_type: 'weakness',
                            label: 'Team And Ethics',
                            description:
                              'No senior mentor, CVs, or documented MS/mutagenesis expertise; ethics, AI use, COI, and Nagoya/benefit-sharing for Indigenous-harvested samples are only lightly addressed.',
                            order: 4,
                            created_date: '2026-05-02T17:42:36.816302Z',
                            updated_date: '2026-05-02T17:42:36.816305Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8590839,
                        first_name: 'Alami',
                        last_name: 'soufiane',
                        profile_image: null,
                        headline: 'PhD in Microbial Biotechnology',
                      },
                      preregistration_post_id: 32109,
                      fundraise: {
                        id: 783,
                        title:
                          'Viromics-DarkMatter: Identification Hiden Functions and Antibiotic Resistance Reservoirs in the Human Respiratory Virome Dark Matter',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17420,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17120,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7802845,
                              first_name: 'Milton Enrique',
                              last_name: 'Londoño Lemos',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/06/14/blob_LBRVpyN',
                              headline: 'Milton Londoño PhD Researcher CCICBM',
                            },
                          },
                          {
                            id: 17134,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 1362659,
                              first_name: 'Ilhan',
                              last_name: 'Altinok',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/26/blob_PDSU5QW',
                              headline: 'Vaccines, Genomics, Immunology',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 16,
                        status: 'completed',
                        tldr: "Six-month bioinformatics pilot to mine functional genes (AMGs, ARGs) from unclassified 'dark matter' in the human respiratory virome using 50 clinical samples at HCL Lyon. Scientifically timely with strong open-science commitments, but poorly aligned with the RFP's veterinary scope and undermined by an unrealistic budget, tight timeline, and weak contamination/validation controls.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 12.785453993012197,
                        created_date: '2026-05-02T15:59:43.009418Z',
                        updated_date: '2026-05-02T17:43:11.784027Z',
                        items: [
                          {
                            id: 493,
                            item_type: 'strength',
                            label: 'Relevant Scientific Gap',
                            description:
                              'Targets the under-studied functional content of respiratory viral dark matter, including clinically important ARG/AMG reservoirs, which is a meaningful reframing from descriptive taxonomy.',
                            order: 0,
                            created_date: '2026-05-02T17:43:11.788947Z',
                            updated_date: '2026-05-02T17:43:11.788955Z',
                          },
                          {
                            id: 494,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Explicit commitment to deposit raw data, assemblies, and scripts on NCBI, Zenodo, and GitHub supports reproducibility and aligns with funder values.',
                            order: 1,
                            created_date: '2026-05-02T17:43:11.788974Z',
                            updated_date: '2026-05-02T17:43:11.788978Z',
                          },
                          {
                            id: 495,
                            item_type: 'strength',
                            label: 'Existing Infrastructure',
                            description:
                              'Leverages the Benchvir project at HCL Croix-Rousse with pre-existing ethical approvals, clinical cohort access, and a dedicated compute environment.',
                            order: 2,
                            created_date: '2026-05-02T17:43:11.788988Z',
                            updated_date: '2026-05-02T17:43:11.788990Z',
                          },
                          {
                            id: 496,
                            item_type: 'strength',
                            label: 'Pilot Benchmarking',
                            description:
                              'Preliminary benchmarking of 10 viral discovery tools on mock datasets informs the choice of deep-learning approaches like phaboX2 alongside kraken2.',
                            order: 3,
                            created_date: '2026-05-02T17:43:11.788999Z',
                            updated_date: '2026-05-02T17:43:11.789002Z',
                          },
                          {
                            id: 497,
                            item_type: 'strength',
                            label: 'Standard Pipeline',
                            description:
                              'Workflow using FastP, SPAdes, kraken2/phaboX2, and HMM searches against Pfam, VOGdb, and CARD is conventional and generally appropriate for exploratory viromics.',
                            order: 4,
                            created_date: '2026-05-02T17:43:11.789011Z',
                            updated_date: '2026-05-02T17:43:11.789013Z',
                          },
                          {
                            id: 498,
                            item_type: 'weakness',
                            label: 'RFP Misalignment',
                            description:
                              'The RFP funds veterinary microbiomics, but the proposal uses human respiratory clinical samples with no veterinary component, representing a fundamental scope mismatch.',
                            order: 0,
                            created_date: '2026-05-02T17:43:11.789021Z',
                            updated_date: '2026-05-02T17:43:11.789024Z',
                          },
                          {
                            id: 499,
                            item_type: 'weakness',
                            label: 'ARG Contamination Risk',
                            description:
                              'No stringent decontamination strategy (e.g., CheckV, blank controls, chimera checks) to prevent misattribution of bacterial ARGs to viral contigs, a known pitfall in virome ARG calls.',
                            order: 1,
                            created_date: '2026-05-02T17:43:11.789033Z',
                            updated_date: '2026-05-02T17:43:11.789035Z',
                          },
                          {
                            id: 500,
                            item_type: 'weakness',
                            label: 'Unrealistic Budget',
                            description:
                              '$2,000 for sequencing 50 Illumina libraries and $5,000 for six months of PhD effort are implausibly low, while $3,000 for APC is disproportionate; compute and validation costs are absent.',
                            order: 2,
                            created_date: '2026-05-02T17:43:11.789043Z',
                            updated_date: '2026-05-02T17:43:11.789046Z',
                          },
                          {
                            id: 501,
                            item_type: 'weakness',
                            label: 'Tight Timeline',
                            description:
                              'Six months for sequencing, assembly, annotation, validation, and reporting of 50 samples is aggressive, especially for a junior PhD without demonstrated respiratory virome pipeline experience.',
                            order: 3,
                            created_date: '2026-05-02T17:43:11.789054Z',
                            updated_date: '2026-05-02T17:43:11.789057Z',
                          },
                          {
                            id: 502,
                            item_type: 'weakness',
                            label: 'Weak Hypotheses, Validation',
                            description:
                              'H1 is near-tautological and H2 lacks quantitative thresholds; no experimental validation (PCR, cloning, expression) or assembly QC metrics (N50, CheckV) are specified.',
                            order: 4,
                            created_date: '2026-05-02T17:43:11.789065Z',
                            updated_date: '2026-05-02T17:43:11.789067Z',
                          },
                        ],
                      },
                    },
                    {
                      applicant: {
                        id: 8590605,
                        first_name: 'Arden',
                        last_name: 'Baylink',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/04/06/blob_A0irBGo',
                        headline: 'Assistant Professor, Washington State University',
                      },
                      preregistration_post_id: 32116,
                      fundraise: {
                        id: 786,
                        title: 'Title: Indole content of animal gut microbiomes',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17421,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 17174,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8113872,
                              first_name: 'Sagarika',
                              last_name: 'Banerjee',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/16/blob_gObvVVJ',
                              headline: 'Microbiome & Functional Ingredients Researcher',
                            },
                          },
                          {
                            id: 17181,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 1362659,
                              first_name: 'Ilhan',
                              last_name: 'Altinok',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/26/blob_PDSU5QW',
                              headline: 'Vaccines, Genomics, Immunology',
                            },
                          },
                        ],
                      },
                      key_insight: {
                        id: 17,
                        status: 'completed',
                        tldr: "Exploratory 6-month survey quantifying fecal indole across ~100 vertebrate samples plus 16S sequencing on 15 species and genomic mapping of TnaA/Tsr. Fits the RFP's functional veterinary microbiomics focus, leverages the PI's indole expertise and validated assays, but is largely descriptive with n=1 per species for sequencing and gene presence only inferred from taxonomy.",
                        error_message: '',
                        llm_model: 'us.anthropic.claude-opus-4-7',
                        processing_time: 19.47841513698222,
                        created_date: '2026-05-02T16:00:23.526434Z',
                        updated_date: '2026-05-02T17:44:06.700313Z',
                        items: [
                          {
                            id: 503,
                            item_type: 'strength',
                            label: 'Novel Comparative Scope',
                            description:
                              'First broad cross-vertebrate mapping of gut indole paired with producer/sensor profiling, extending a human/mouse-centric literature in a way directly relevant to veterinary microbiomics.',
                            order: 0,
                            created_date: '2026-05-02T17:44:06.710220Z',
                            updated_date: '2026-05-02T17:44:06.710230Z',
                          },
                          {
                            id: 504,
                            item_type: 'strength',
                            label: 'PI Expertise',
                            description:
                              "Baylink lab has directly relevant eLife publications on indole, chemotaxis, and colonization resistance, plus validated HIA and Kovac's assays and supporting pilot data.",
                            order: 1,
                            created_date: '2026-05-02T17:44:06.710251Z',
                            updated_date: '2026-05-02T17:44:06.710254Z',
                          },
                          {
                            id: 505,
                            item_type: 'strength',
                            label: 'Feasibility And Budget',
                            description:
                              'Six-month timeline is realistic with ~50% of samples already collected, quick assays, and a modest, well-itemized $10,000 budget with personnel costs covered elsewhere.',
                            order: 2,
                            created_date: '2026-05-02T17:44:06.710266Z',
                            updated_date: '2026-05-02T17:44:06.710268Z',
                          },
                          {
                            id: 506,
                            item_type: 'strength',
                            label: 'Sample Access',
                            description:
                              'WSU Campus Veterinarian, WADDL, Cat Tales Wildlife Center, and BioIVT provide unusually diverse vertebrate fecal access with IACUC and IBC approvals in place.',
                            order: 3,
                            created_date: '2026-05-02T17:44:06.710278Z',
                            updated_date: '2026-05-02T17:44:06.710280Z',
                          },
                          {
                            id: 507,
                            item_type: 'strength',
                            label: 'Open Science',
                            description:
                              'Clear commitment to preprint, peer-reviewed publication, and public archiving of raw data and metadata at a WSU institutional repository, consistent with RFP requirements.',
                            order: 4,
                            created_date: '2026-05-02T17:44:06.710289Z',
                            updated_date: '2026-05-02T17:44:06.710291Z',
                          },
                          {
                            id: 508,
                            item_type: 'weakness',
                            label: 'Limited Replication',
                            description:
                              'Most species have only one donor and 16S is done on ~15 of ~100 samples, limiting species-level claims and generalizability despite honest acknowledgment by the PI.',
                            order: 0,
                            created_date: '2026-05-02T17:44:06.710300Z',
                            updated_date: '2026-05-02T17:44:06.710302Z',
                          },
                          {
                            id: 509,
                            item_type: 'weakness',
                            label: 'Inferred Gene Presence',
                            description:
                              'tnaA and tsr are inferred from taxonomy and reference genomes rather than directly detected by metagenomics, weakening hypothesis H2 about producers and sensors.',
                            order: 1,
                            created_date: '2026-05-02T17:44:06.710311Z',
                            updated_date: '2026-05-02T17:44:06.710314Z',
                          },
                          {
                            id: 510,
                            item_type: 'weakness',
                            label: 'Power Analysis Framing',
                            description:
                              'The N=10, 98% power calculation appears to reflect technical rather than biological replicates, overstating statistical strength for cross-species comparisons.',
                            order: 2,
                            created_date: '2026-05-02T17:44:06.710322Z',
                            updated_date: '2026-05-02T17:44:06.710325Z',
                          },
                          {
                            id: 511,
                            item_type: 'weakness',
                            label: 'Assay Specificity',
                            description:
                              "Kovac's assay does not resolve individual indole derivatives and no orthogonal LC-MS validation is planned, limiting chemical resolution of 'total indole' measurements.",
                            order: 3,
                            created_date: '2026-05-02T17:44:06.710333Z',
                            updated_date: '2026-05-02T17:44:06.710336Z',
                          },
                          {
                            id: 512,
                            item_type: 'weakness',
                            label: 'Uncontrolled Confounders',
                            description:
                              'Diet, captive vs wild status, age, antibiotic exposure, and wet/dry weight vary across donors without systematic control, complicating interpretation of diet-driven hypotheses.',
                            order: 4,
                            created_date: '2026-05-02T17:44:06.710344Z',
                            updated_date: '2026-05-02T17:44:06.710347Z',
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              action_date: '2026-02-05T01:13:13.200928Z',
              action: 'PUBLISH',
            },
            {
              id: 5060,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 5060,
                slug: 'request-for-proposals-vascular-biology',
                title: 'Request for Proposals - Vascular Biology',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/f8d29eac-641c-4e2e-9828-7e385e364831/chatgpt-image-jan-16-2026-05_13_46-pm.png',
                unified_document_id: 8698745,
                grant: {
                  id: 22,
                  status: 'CLOSED',
                  amount: {
                    usd: 10000,
                    rsc: 124904.2685285593,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: 'Vascular Biology',
                  is_expired: true,
                  is_active: false,
                  application_count: 15,
                  applications: [
                    {
                      applicant: {
                        id: 5570124,
                        first_name: 'Hao',
                        last_name: 'Yin',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                        headline: 'Cardiovascular biologists',
                      },
                      preregistration_post_id: 5526,
                      fundraise: {
                        id: 238,
                        title:
                          'Sirt6 Deficiency in Microvascular Mural Cells as a Driver of Paracrine Senescence and Impaired Regeneration in Ischemic Limbs',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 32,
                          name: 'University of Western Ontario',
                        },
                        reviews: [
                          {
                            id: 16178,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 7802845,
                              first_name: 'Milton Enrique',
                              last_name: 'Londoño Lemos',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/06/14/blob_LBRVpyN',
                              headline: 'Milton Londoño PhD Researcher CCICBM',
                            },
                          },
                          {
                            id: 16190,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8428754,
                              first_name: 'Katri',
                              last_name: 'Vaparanta',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocJF4WPV5xgnf9CUIQUU-vBF8IdkNm9ic9zVnygSIPqHfW1P9Q=s96-c',
                              headline: 'Biomedical researcher, bioinformatician, founder',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 989685,
                        first_name: 'Faye',
                        last_name: 'McKenna',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                        headline:
                          'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                      },
                      preregistration_post_id: 5576,
                      fundraise: {
                        id: 246,
                        title:
                          'Can Deep Learning Unlock Hidden Perfusion Information from Existing Brain MRI Scans?',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 24,
                          name: 'The Neuroimaging Research Lab',
                        },
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8561043,
                        first_name: 'Jihui',
                        last_name: 'Lee',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 5594,
                      fundraise: {
                        id: 250,
                        title:
                          'Balancing vascular regrowth and stabilization after ischemia through CXCR3 signaling',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16187,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 5570124,
                              first_name: 'Hao',
                              last_name: 'Yin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                              headline: 'Cardiovascular biologists',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8554907,
                        first_name: 'Tharusha',
                        last_name: 'Jayasena',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJVCU1F0ZPFvzcNtihh9qdvgkvcm6JNNSdPpdobwjcMRt2_kq0=s96-c',
                        headline: 'Biomarkers in Aging, Dementia & Psychedelics',
                      },
                      preregistration_post_id: 5618,
                      fundraise: {
                        id: 258,
                        title:
                          'Longitudinal Vascular and Blood–Brain Barrier Proteomic Signatures in a Mouse Model of Cerebral Small Vessel Disease',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16271,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7793773,
                              first_name: 'Tariq',
                              last_name: 'Ali',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/06/25/blob_PYm5RkS',
                              headline: 'Virologist and Biotechnologist Researcher',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 5570124,
                        first_name: 'Hao',
                        last_name: 'Yin',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                        headline: 'Cardiovascular biologists',
                      },
                      preregistration_post_id: 5698,
                      fundraise: {
                        id: 264,
                        title:
                          'NAD+ Supplementation Strengthens the Thoracic Aorta by Modulating YAP/SOX9-dependent Mechanotransduction and Extracellular Matrix Remodeling',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 32,
                          name: 'University of Western Ontario',
                        },
                        reviews: [
                          {
                            id: 16712,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8428754,
                              first_name: 'Katri',
                              last_name: 'Vaparanta',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocJF4WPV5xgnf9CUIQUU-vBF8IdkNm9ic9zVnygSIPqHfW1P9Q=s96-c',
                              headline: 'Biomedical researcher, bioinformatician, founder',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8561207,
                        first_name: 'Fangyuan',
                        last_name: 'Li',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJfvDWk0huakf1VbRTLODklevrs3Cg9CVY4SMyDD8gYorIBgg=s96-c',
                        headline: null,
                      },
                      preregistration_post_id: 5701,
                      fundraise: {
                        id: 266,
                        title: 'The neurovascular coupling in active sensing',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16153,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8555203,
                              first_name: 'David G',
                              last_name: 'Litvin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/03/blob_BBd1T9U',
                              headline: 'Neuroimmune Circuits | Multiphoton Imaging',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8558987,
                        first_name: 'Leya',
                        last_name: 'Aubert-Tandon',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/13/blob_oq6Qk7t',
                        headline: 'PhD candidate in Neuroscience',
                      },
                      preregistration_post_id: 5702,
                      fundraise: {
                        id: 267,
                        title:
                          'Investigation of endothelial metabolism in models of SYNGAP1 haploinsufficiency',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 30,
                          name: 'Ottawa University',
                        },
                        reviews: [
                          {
                            id: 16277,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 5570124,
                              first_name: 'Hao',
                              last_name: 'Yin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                              headline: 'Cardiovascular biologists',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 1872065,
                        first_name: 'Rami',
                        last_name: 'Najjar',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/07/26/blob_hUd1uMM',
                        headline: 'Nutrition Scientist',
                      },
                      preregistration_post_id: 5717,
                      fundraise: {
                        id: 272,
                        title:
                          'A Plant-Based Diet to Improve Vascular Function and Atherosclerosis-Related Biomarkers in Coronary Artery Disease (CAD): Mechanistic Insights from Redox-Inflammation Multi-Omics',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 15,
                          name: 'Emory University',
                        },
                        reviews: [
                          {
                            id: 16244,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 6425384,
                              first_name: 'Tibor',
                              last_name: 'V Varga',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/17/blob_o7xCHch',
                              headline: 'Associate Professor and Deputy Director',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 6328938,
                        first_name: 'Hansen',
                        last_name: 'Chen',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/15/blob',
                        headline: 'Stroke researcher at Stanford University',
                      },
                      preregistration_post_id: 5762,
                      fundraise: {
                        id: 278,
                        title:
                          'Anemia Destabilizes the Vascular Glycocalyx and Exacerbates Early Blood–Brain Barrier Injury After Stroke',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16737,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 989685,
                              first_name: 'Faye',
                              last_name: 'McKenna',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                              headline:
                                'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8559042,
                        first_name: 'Sushreesangita',
                        last_name: 'Behera',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/14/blob',
                        headline: 'Postdoctoral Researcher at NorthwesternUni Chicago',
                      },
                      preregistration_post_id: 5760,
                      fundraise: {
                        id: 276,
                        title:
                          'Identification of a Novel Conserved Regenerative Endothelial Cell Population Across Distinct Lung Injury Models',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8559123,
                        first_name: 'Mohamed',
                        last_name: 'Roshdy',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 7306,
                      fundraise: {
                        id: 296,
                        title:
                          'Project Title: Engineered Heart Tissues Reveal Disease-Specific Cardiomyocyte–Endothelial Crosstalk in Hypertrophic Cardiomyopathy',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8559826,
                        first_name: 'Wonmo',
                        last_name: 'Ahn',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 5798,
                      fundraise: {
                        id: 282,
                        title:
                          'Post-Assembly Modulation of Extracellular Matrix Stiffness in a 3D Human Arteriole Model to Study VSMC Phenotypic Remodeling',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16425,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 5570124,
                              first_name: 'Hao',
                              last_name: 'Yin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                              headline: 'Cardiovascular biologists',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7629977,
                        first_name: 'Younes',
                        last_name: 'Zaid',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/17/blob_Wk9yFSy',
                        headline: '',
                      },
                      preregistration_post_id: 5942,
                      fundraise: {
                        id: 290,
                        title: 'Platelets as Hidden Drivers of Hepatitis C Pathogenesis',
                        goal_amount: {
                          usd: 90000,
                          rsc: 1124138.4167570337,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8564089,
                        first_name: 'Baohui',
                        last_name: 'Xu',
                        profile_image: null,
                        headline: '',
                      },
                      preregistration_post_id: 8520,
                      fundraise: {
                        id: 302,
                        title:
                          'Metabolomic response to metformin therapy in experimental abdominal aortic aneurysm',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 989685,
                        first_name: 'Faye',
                        last_name: 'McKenna',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                        headline:
                          'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                      },
                      preregistration_post_id: 5577,
                      fundraise: {
                        id: 247,
                        title:
                          'Capillary Microperfusion Across the Alzheimer’s Continuum: Extracting IVIM Perfusion from Multi-Shell Diffusion MRI in ADNI',
                        goal_amount: {
                          usd: 50000,
                          rsc: 624521.3426427965,
                        },
                        nonprofit: {
                          id: 24,
                          name: 'The Neuroimaging Research Lab',
                        },
                        reviews: [],
                      },
                      key_insight: null,
                    },
                  ],
                },
              },
              action_date: '2026-01-17T20:59:09.072576Z',
              action: 'PUBLISH',
            },
            {
              id: 5059,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 5059,
                slug: 'request-for-proposals-ai-tools-ai-agents-for-biomedical-research',
                title: 'Request for Proposals - AI Tools & AI Agents for Biomedical Research',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/45d646af-01ae-4262-b2a1-29408e93c0f1/chatgpt-image-jan-16-2026-05_16_54-pm.png',
                unified_document_id: 8698743,
                grant: {
                  id: 21,
                  status: 'CLOSED',
                  amount: {
                    usd: 5000,
                    rsc: 62452.13426427965,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: 'AI in Biomedicine',
                  is_expired: true,
                  is_active: false,
                  application_count: 8,
                  applications: [
                    {
                      applicant: {
                        id: 7782259,
                        first_name: 'Jonas',
                        last_name: 'Oliveira',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/06/08/blob',
                        headline: 'Full Professor, Scientific Innovation & Networking',
                      },
                      preregistration_post_id: 5112,
                      fundraise: {
                        id: 222,
                        title:
                          'BioPromptLab: Prompt Protocols as a Validated Intervention for Three Biomedical GPT Agents',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8557874,
                        first_name: 'Steven',
                        last_name: 'Hui',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocKklh19AxZvOL95C2RYkOG8kVTGjR-7EyzBakd_IQlTuNwdYw=s96-c',
                        headline: null,
                      },
                      preregistration_post_id: 5529,
                      fundraise: {
                        id: 239,
                        title: 'Automatic Knowledge Base for Immunological Aging: Grant Proposal',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16642,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 1362659,
                              first_name: 'Ilhan',
                              last_name: 'Altinok',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/26/blob_PDSU5QW',
                              headline: 'Vaccines, Genomics, Immunology',
                            },
                          },
                          {
                            id: 16661,
                            score: 2,
                            is_assessed: true,
                            author: {
                              id: 984167,
                              first_name: 'Alan',
                              last_name: 'Sucur',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/03/02/blob_OI2G9zf',
                              headline: 'assistant professor of immunology, MD, PhD',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8561302,
                        first_name: 'Nasim',
                        last_name: 'Sanati',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJMoZoPWLDefpoKvFCD9P2hsle6792b5FmQHqFJ4uBTnR_g3cD2=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 5614,
                      fundraise: {
                        id: 257,
                        title:
                          'A Multi-Agent MCP Server for Cross-Modal Biomedical Embedding Alignment Evaluated on Tumor Microenvironment Characterization',
                        goal_amount: {
                          usd: 1000,
                          rsc: 12490.42685285593,
                        },
                        nonprofit: {
                          id: 37,
                          name: 'Oregon Health and Science University Foundation',
                        },
                        reviews: [
                          {
                            id: 16235,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8407921,
                              first_name: 'Ahmad',
                              last_name: 'Iqbal',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/12/31/blob_HUrLkok',
                              headline: 'Computer Scientist',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 949253,
                        first_name: 'Avimanyu',
                        last_name: 'Bandyopadhyay',
                        profile_image:
                          'https://lh3.googleusercontent.com/a-/AOh14GiScS1gqlXuJeuAgjB8DrdA13tnAYa-mehJrwa3oeI=s96-c',
                        headline: 'Decentralized Researcher',
                      },
                      preregistration_post_id: 5606,
                      fundraise: {
                        id: 252,
                        title:
                          'AxonVoice: An AI Tool for Voice-Based Digital Biomarker Phenotyping in Neurological Research',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16255,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8563936,
                              first_name: 'Chieh-Te',
                              last_name: 'Lin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/20/blob',
                              headline: 'ML Researcher',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8558991,
                        first_name: 'Susan (Jiepei)',
                        last_name: 'He',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/16/blob_fFMLXaN',
                        headline: 'Researcher in The University of Edinburgh',
                      },
                      preregistration_post_id: 5703,
                      fundraise: {
                        id: 268,
                        title:
                          'Adversarial Multi-Agent System for Systematic Literature Reviews: Author–Reviewer Workflows with Verifiable Evidence and Critique Loops',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16436,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 7964166,
                              first_name: 'Ruslan',
                              last_name: 'Kurmashev',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/21/blob_URDbsq1',
                              headline: 'MSc in Computational Biology | MD',
                            },
                          },
                          {
                            id: 16487,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8114247,
                              first_name: 'Muhammad',
                              last_name: 'Asif',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/10/30/blob_q9haHqP',
                              headline: 'RA Max-Planck Institut für empirische Ästhetik',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8553416,
                        first_name: 'Sean Anthony',
                        last_name: 'Guillory',
                        profile_image: null,
                        headline: 'Cog Neuro/National Security/Betting Intelligence',
                      },
                      preregistration_post_id: 5736,
                      fundraise: {
                        id: 274,
                        title: 'Proposal: Betting Reviewed vs. Peer Reviewed',
                        goal_amount: {
                          usd: 25000,
                          rsc: 312260.67132139823,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8563929,
                        first_name: 'Sanghati',
                        last_name: 'Basu',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/19/blob',
                        headline: 'Individual researcher',
                      },
                      preregistration_post_id: 7359,
                      fundraise: {
                        id: 297,
                        title:
                          'Molecular Concordance and Stability of Clinically Annotated Cardiomyopathy Variants Across Public Genomic Datasets',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16318,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 8428754,
                              first_name: 'Katri',
                              last_name: 'Vaparanta',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocJF4WPV5xgnf9CUIQUU-vBF8IdkNm9ic9zVnygSIPqHfW1P9Q=s96-c',
                              headline: 'Biomedical researcher, bioinformatician, founder',
                            },
                          },
                          {
                            id: 16398,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8549357,
                              first_name: 'Junaid',
                              last_name: 'Abbas',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/18/blob',
                              headline: 'Head of Pathology Department',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7908624,
                        first_name: 'Kaan',
                        last_name: 'Okay',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJwX2Grt9wFSbNXRLNHsWmJnUOtfvzFpDnKUBHG75kw0jBz8iFo=s96-c',
                        headline: 'Senior Bioinformatician',
                      },
                      preregistration_post_id: 5693,
                      fundraise: {
                        id: 260,
                        title:
                          'samCRISPR2: A tool for detection of knockout efficiency in long read genomics data',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16261,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8407921,
                              first_name: 'Ahmad',
                              last_name: 'Iqbal',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/12/31/blob_HUrLkok',
                              headline: 'Computer Scientist',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                  ],
                },
              },
              action_date: '2026-01-17T20:53:30.900969Z',
              action: 'PUBLISH',
            },
            {
              id: 5058,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 5058,
                slug: 'request-for-proposals-neuroscience',
                title: 'Request for Proposals - Neuroscience',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/7c31b617-1ae5-443e-a902-b85098e52ec5/neuroscience.png',
                unified_document_id: 8698741,
                grant: {
                  id: 20,
                  status: 'CLOSED',
                  amount: {
                    usd: 10000,
                    rsc: 124904.2685285593,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: 'Translational Neuroscience',
                  is_expired: false,
                  is_active: false,
                  application_count: 20,
                  applications: [
                    {
                      applicant: {
                        id: 7964248,
                        first_name: 'Cephas',
                        last_name: 'Akpabio',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/13/blob_2eq9Ldf',
                        headline: 'PhD student at University of Ibadan',
                      },
                      preregistration_post_id: 5109,
                      fundraise: {
                        id: 219,
                        title:
                          'Genetic and Epigenetic Mechanisms Contributing to ADHD Aetiology in Children in South-west Nigeria',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16002,
                            score: 1,
                            is_assessed: true,
                            author: {
                              id: 6425384,
                              first_name: 'Tibor',
                              last_name: 'V Varga',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/17/blob_o7xCHch',
                              headline: 'Associate Professor and Deputy Director',
                            },
                          },
                          {
                            id: 16004,
                            score: 1,
                            is_assessed: true,
                            author: {
                              id: 8336024,
                              first_name: 'Jason',
                              last_name: 'Hung',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/11/20/blob',
                              headline: 'Applied Social & Health Data Scientist (Primary)',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7782259,
                        first_name: 'Jonas',
                        last_name: 'Oliveira',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/06/08/blob',
                        headline: 'Full Professor, Scientific Innovation & Networking',
                      },
                      preregistration_post_id: 5111,
                      fundraise: {
                        id: 221,
                        title:
                          'Energetic and Safety Signatures of Type I vs Type II LRRK2 Kinase Inhibitors: A Quantum Biochemistry–Guided Reanalysis of Cryo-EM Structures for Parkinson’s Therapeutic Design',
                        goal_amount: {
                          usd: 9000,
                          rsc: 112413.84167570337,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7150259,
                        first_name: 'Gopi',
                        last_name: 'Battineni',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/02/06/blob_a6WQNjh',
                        headline:
                          "I'm a multidisciplinary researcher who focuses on artificial intelligence in medicine",
                      },
                      preregistration_post_id: 4226,
                      fundraise: {
                        id: 51,
                        title:
                          'Advanced Biomarker and Computational Strategies for Precision Medicine in Alzheimer’s Disease',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 17498,
                            score: 2,
                            is_assessed: true,
                            author: {
                              id: 8623156,
                              first_name: 'AI',
                              last_name: 'Review',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/07/02/blob_Yfubd6a',
                              headline: '',
                            },
                          },
                          {
                            id: 9699,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 5822063,
                              first_name: 'Thomas',
                              last_name: 'Hatzilabrou',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/04/25/blob',
                              headline: 'Thomas Hatzilabrou',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8559715,
                        first_name: 'Monara',
                        last_name: 'Angelim',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/09/blob_Ef1IUTP',
                        headline: 'Postdoc at St. Louis University',
                      },
                      preregistration_post_id: 5537,
                      fundraise: {
                        id: 242,
                        title:
                          'PainPaw: A Mobile Application for Standardized Behavioral Pain Testing in Rodents',
                        goal_amount: {
                          usd: 6000,
                          rsc: 74942.56111713558,
                        },
                        nonprofit: {
                          id: 27,
                          name: 'St. Louis University',
                        },
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 989685,
                        first_name: 'Faye',
                        last_name: 'McKenna',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                        headline:
                          'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                      },
                      preregistration_post_id: 5576,
                      fundraise: {
                        id: 246,
                        title:
                          'Can Deep Learning Unlock Hidden Perfusion Information from Existing Brain MRI Scans?',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 24,
                          name: 'The Neuroimaging Research Lab',
                        },
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 989685,
                        first_name: 'Faye',
                        last_name: 'McKenna',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                        headline:
                          'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                      },
                      preregistration_post_id: 5587,
                      fundraise: {
                        id: 249,
                        title: 'The Lonely Brain Ages Faster',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 24,
                          name: 'The Neuroimaging Research Lab',
                        },
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8561268,
                        first_name: 'Yassir',
                        last_name: 'Boulaamane',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/15/blob_XRdCnBO',
                        headline: 'Postdoctoral Researcher | AI for drug discovery',
                      },
                      preregistration_post_id: 5603,
                      fundraise: {
                        id: 251,
                        title:
                          'AI-Driven Repurposing of FDA-Approved Compounds for Precision Neuroscience Therapeutics',
                        goal_amount: {
                          usd: 1000,
                          rsc: 12490.42685285593,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8560055,
                        first_name: 'Valentina',
                        last_name: 'Cerrato',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocIQJrhxT1bBW_6i7cqsHrOJYokTm4FrB8P1x1snltR47GudLbIM=s96-c',
                        headline: 'Post doc researcher @ University of Turin, Italy',
                      },
                      preregistration_post_id: 5613,
                      fundraise: {
                        id: 256,
                        title: 'Mapping astrocyte heterogeneity in the human cerebellum',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16219,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 989685,
                              first_name: 'Faye',
                              last_name: 'McKenna',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                              headline:
                                'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                            },
                          },
                          {
                            id: 16221,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7444533,
                              first_name: 'Xiaowei',
                              last_name: 'Wu',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/02/10/blob',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8549178,
                        first_name: 'Fagbemi',
                        last_name: 'Damilola Dorcas',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/15/blob',
                        headline: 'Molecular and Cellular Biology | Nutrigenomics',
                      },
                      preregistration_post_id: 5692,
                      fundraise: {
                        id: 259,
                        title:
                          'ENHANCING POST-STROKE FUNCTIONAL RECOVERY AND SYNAPTIC PLASTICITY: A GENOMIC EVALUATION OF A STANDARDIZED INDIGENOUS POLYHERBAL DECOCTION',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8558987,
                        first_name: 'Leya',
                        last_name: 'Aubert-Tandon',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/13/blob_oq6Qk7t',
                        headline: 'PhD candidate in Neuroscience',
                      },
                      preregistration_post_id: 5702,
                      fundraise: {
                        id: 267,
                        title:
                          'Investigation of endothelial metabolism in models of SYNGAP1 haploinsufficiency',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 30,
                          name: 'Ottawa University',
                        },
                        reviews: [
                          {
                            id: 16277,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 5570124,
                              first_name: 'Hao',
                              last_name: 'Yin',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/13/blob_CLfn3XG',
                              headline: 'Cardiovascular biologists',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8556105,
                        first_name: 'Kayla',
                        last_name: 'Stafford',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/14/blob_6eTOWrY',
                        headline: 'Neuromatch Impact Scholars Program',
                      },
                      preregistration_post_id: 5704,
                      fundraise: {
                        id: 269,
                        title: 'Decisive Times - Intrinsic Timescales & Decoding Stability',
                        goal_amount: {
                          usd: 6500,
                          rsc: 81187.77454356354,
                        },
                        nonprofit: {
                          id: 28,
                          name: 'Neuromatch Academy Inc',
                        },
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8561627,
                        first_name: 'Lisha',
                        last_name: 'Daniel',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/14/blob_WsEU3KO',
                        headline: 'Assistant Professor (Part-time Research Scholar)',
                      },
                      preregistration_post_id: 5696,
                      fundraise: {
                        id: 263,
                        title:
                          'In Silico Proof of concept for hand tremor reduction via non-invasive Low Intensity Focused Ultrasound (LIFU) stimulation of the median nerve at the wrist',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8428816,
                        first_name: 'Daniel',
                        last_name: 'Ojeda Juarez',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/01/blob',
                        headline: 'Neurodegeneration Postdoctoral Fellow at UCSD',
                      },
                      preregistration_post_id: 5759,
                      fundraise: {
                        id: 275,
                        title:
                          'Machine Learning Pipeline for Pathological Analysis of Synaptic Loss in Human iPSC-Derived Neuronal Model of Human Prion Disease',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: {
                          id: 29,
                          name: 'University of California, San Diego',
                        },
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 6328938,
                        first_name: 'Hansen',
                        last_name: 'Chen',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/15/blob',
                        headline: 'Stroke researcher at Stanford University',
                      },
                      preregistration_post_id: 5762,
                      fundraise: {
                        id: 278,
                        title:
                          'Anemia Destabilizes the Vascular Glycocalyx and Exacerbates Early Blood–Brain Barrier Injury After Stroke',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16737,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 989685,
                              first_name: 'Faye',
                              last_name: 'McKenna',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                              headline:
                                'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7631880,
                        first_name: 'Sean',
                        last_name: 'McCracken',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/22/blob_dZOvwWb',
                        headline: 'Postdoctoral Researcher.  Founder of NeuroReview. ',
                      },
                      preregistration_post_id: 5783,
                      fundraise: {
                        id: 281,
                        title:
                          'Assessing Criticality as an Evolutionary Setpoint across the Visual Hierarchy',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8549478,
                        first_name: 'Anubhuti',
                        last_name: 'Dixit',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocLNQZY9Q64svQ3lHf8sshGulDvNYEv6Eyj2Ni4fteqch2PhTL7W=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 5826,
                      fundraise: {
                        id: 287,
                        title:
                          'Defining the causal role of olfactory receptor signaling in Parkinson’s disease pathogenesis',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8561032,
                        first_name: 'Reza',
                        last_name: 'Mohammadinejad',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocJOgz9gMdks9GEk-9FX1B_gu3awx9ICJrA4SgjRTyj9KY13hg=s96-c',
                        headline: null,
                      },
                      preregistration_post_id: 5542,
                      fundraise: {
                        id: 245,
                        title:
                          'Modulating Piezo1 as a Novel Mechanotherapy for Transthyretin Amyloidosis in the Nervous System',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 982840,
                        first_name: 'Erin',
                        last_name: 'Magennis',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/14/blob_SMljXpI',
                        headline: 'DeSci & Dysauotonomia',
                      },
                      preregistration_post_id: 5817,
                      fundraise: {
                        id: 285,
                        title:
                          'Autonomic Nervous System Subtypes in Myalgic Encephalomyelitis/CFS: A Large-Scale Registry Reanalysis',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16725,
                            score: 2,
                            is_assessed: true,
                            author: {
                              id: 7742506,
                              first_name: 'Kingsley',
                              last_name: 'Ukwaja',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/11/30/blob_b0kiWHe',
                              headline: 'MD, MPH; Professor of Medicine',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 973857,
                        first_name: 'Jorge L.',
                        last_name: 'Pérez-Moreno',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2023/06/02/blob',
                        headline: 'Computational & Molecular Neurobiologist',
                      },
                      preregistration_post_id: 13564,
                      fundraise: {
                        id: 321,
                        title:
                          'Ancient Circuits, New Resolution: A Single-Cell Atlas of Olfactory Neuron Types Spanning 550 Million Years of Evolution',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16773,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8582546,
                              first_name: 'Alexander',
                              last_name: 'Schreiber',
                              profile_image: null,
                              headline: 'Comparative developmental endocrinologist',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7589793,
                        first_name: 'Gopal',
                        last_name: 'Ramakrishnan',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocIUnmDjPFIgA5ht28mOlqHTaWHvLg4SMC1ilRyl1VwVoV6QPg=s96-c',
                        headline: 'Gopal Ramakrishnan',
                      },
                      preregistration_post_id: 11639,
                      fundraise: {
                        id: 312,
                        title:
                          'AI-Driven Covalent Targeting Framework for Isoform-Selective Modulation of AKT Signaling in Parkinson’s and Alzheimer’s Disease',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                  ],
                },
              },
              action_date: '2026-01-17T20:42:24.317475Z',
              action: 'PUBLISH',
            },
            {
              id: 5057,
              content_type: 'RESEARCHHUBPOST',
              content_object: {
                id: 5057,
                slug: 'request-for-proposals-genomics-and-proteomics',
                title: 'Request for Proposals - Genomics and Proteomics',
                type: 'GRANT',
                image_url:
                  'https://storage.prod.researchhub.com/uploads/posts/users/39602/10ac4843-004a-4e97-8719-4e19b05177de/chatgpt-image-jan-16-2026-05_17_02-pm.png',
                unified_document_id: 8698739,
                grant: {
                  id: 19,
                  status: 'CLOSED',
                  amount: {
                    usd: 5000,
                    rsc: 62452.13426427965,
                  },
                  organization: 'ResearchHub Foundation',
                  short_title: 'Integrative Omics',
                  is_expired: true,
                  is_active: false,
                  application_count: 11,
                  applications: [
                    {
                      applicant: {
                        id: 7908762,
                        first_name: 'Hari Baskar',
                        last_name: 'Balasubramanian',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/07/30/blob_I2iRKDD',
                        headline: 'PhD researcher at University of Vienna',
                      },
                      preregistration_post_id: 4337,
                      fundraise: {
                        id: 113,
                        title:
                          'Integrated miRNA and metabolomic profiling to target brain endothelial cell senescence',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 15997,
                            score: 2,
                            is_assessed: true,
                            author: {
                              id: 7444533,
                              first_name: 'Xiaowei',
                              last_name: 'Wu',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/02/10/blob',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7964166,
                        first_name: 'Ruslan',
                        last_name: 'Kurmashev',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/21/blob_URDbsq1',
                        headline: 'MSc in Computational Biology | MD',
                      },
                      preregistration_post_id: 5378,
                      fundraise: {
                        id: 229,
                        title:
                          'Open analysis and pathway-level multi-omics integration for ASD: GWAS-derived genetic priors, pediatric proteomics anchors, and gut microbiome signatures.',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16137,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 1362659,
                              first_name: 'Ilhan',
                              last_name: 'Altinok',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/26/blob_PDSU5QW',
                              headline: 'Vaccines, Genomics, Immunology',
                            },
                          },
                          {
                            id: 16151,
                            score: 1,
                            is_assessed: true,
                            author: {
                              id: 6425384,
                              first_name: 'Tibor',
                              last_name: 'V Varga',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/17/blob_o7xCHch',
                              headline: 'Associate Professor and Deputy Director',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8559715,
                        first_name: 'Monara',
                        last_name: 'Angelim',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/09/blob_Ef1IUTP',
                        headline: 'Postdoc at St. Louis University',
                      },
                      preregistration_post_id: 5536,
                      fundraise: {
                        id: 241,
                        title:
                          'The Right Diet Is in Your DNA: Identifying Biomarkers for Personalized Weight Loss',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: {
                          id: 27,
                          name: 'St. Louis University',
                        },
                        reviews: [
                          {
                            id: 16197,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8115826,
                              first_name: 'Qiaoling',
                              last_name: 'Wang',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/10/07/blob_C09ysxQ',
                              headline: 'Postdoctoral researcher at Boston University',
                            },
                          },
                          {
                            id: 16215,
                            score: 3,
                            is_assessed: true,
                            author: {
                              id: 6425384,
                              first_name: 'Tibor',
                              last_name: 'V Varga',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/17/blob_o7xCHch',
                              headline: 'Associate Professor and Deputy Director',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8560055,
                        first_name: 'Valentina',
                        last_name: 'Cerrato',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocIQJrhxT1bBW_6i7cqsHrOJYokTm4FrB8P1x1snltR47GudLbIM=s96-c',
                        headline: 'Post doc researcher @ University of Turin, Italy',
                      },
                      preregistration_post_id: 5613,
                      fundraise: {
                        id: 256,
                        title: 'Mapping astrocyte heterogeneity in the human cerebellum',
                        goal_amount: {
                          usd: 10000,
                          rsc: 124904.2685285593,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16219,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 989685,
                              first_name: 'Faye',
                              last_name: 'McKenna',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/07/blob_boIFWaa',
                              headline:
                                'Assistant Professor at Albert Einstein College of Medicine and Researcher at MGH/Harvard Medical School | MRI Methods | Psychiatry Research | Data Analysis',
                            },
                          },
                          {
                            id: 16221,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 7444533,
                              first_name: 'Xiaowei',
                              last_name: 'Wu',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/02/10/blob',
                              headline: '',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7963844,
                        first_name: 'maryam',
                        last_name: 'adel',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/09/22/blob_99N52dK',
                        headline: 'Microbiology Post doc, Bioinformatics Researcher',
                      },
                      preregistration_post_id: 4345,
                      fundraise: {
                        id: 120,
                        title:
                          'Advanced multi-trait analysis using public GWAS for correlated traits of infectious brain pathogen and early stage of brain disorders',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8562921,
                        first_name: 'Yinuo',
                        last_name: 'Cheng',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 5705,
                      fundraise: {
                        id: 270,
                        title:
                          'Fine-tuning an ICL Tabular Foundation Model for Multi-Omics Prediction',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16319,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8571279,
                              first_name: 'Vanessa',
                              last_name: 'Bertolucci',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/06/22/blob_5SSmrb9',
                              headline: 'Translational Biochemist | Women’s Bone Health',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7586615,
                        first_name: 'Arnab',
                        last_name: 'Nath',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocKaI_LESY1qXInc-yYkGLHpNKdBMhK4AlnL4P81ZdIKfmpbUnRSEQ=s96-c',
                        headline: 'Research scholar at Indian Institute of Science',
                      },
                      preregistration_post_id: 5764,
                      fundraise: {
                        id: 280,
                        title:
                          'Identifying the Point of No Return: Integrating Single-Cell Transcriptomics and Proteomics to Map Irreversible Fibroblast Commitment in Idiopathic Pulmonary Fibrosis',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: {
                          id: 31,
                          name: 'Iisc Foundation',
                        },
                        reviews: [
                          {
                            id: 16243,
                            score: 5,
                            is_assessed: true,
                            author: {
                              id: 8115826,
                              first_name: 'Qiaoling',
                              last_name: 'Wang',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/10/07/blob_C09ysxQ',
                              headline: 'Postdoctoral researcher at Boston University',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8563722,
                        first_name: 'Anas',
                        last_name: 'Munir',
                        profile_image: null,
                        headline: null,
                      },
                      preregistration_post_id: 7120,
                      fundraise: {
                        id: 292,
                        title:
                          'Integrative Genomic Reanalysis of the PRG4-CD44 Axis to Reveal Conserved Stromal Programs Across Hepatobiliary Malignancies',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8563729,
                        first_name: 'usha',
                        last_name: 'mahawar, PhD',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/02/22/blob',
                        headline: 'Postdoc and Lab Manager at VCU',
                      },
                      preregistration_post_id: 8133,
                      fundraise: {
                        id: 301,
                        title:
                          'Proteomic Profiling of Skin Lamellar Bodies During Keratinocyte Differentiation',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 8559042,
                        first_name: 'Sushreesangita',
                        last_name: 'Behera',
                        profile_image:
                          'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/03/14/blob',
                        headline: 'Postdoctoral Researcher at NorthwesternUni Chicago',
                      },
                      preregistration_post_id: 8540,
                      fundraise: {
                        id: 303,
                        title:
                          'Identification of Novel Conserved Regenerative Endothelial Program During Lung Repair Using Integrated Single-Cell Genomics',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [
                          {
                            id: 16438,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8428754,
                              first_name: 'Katri',
                              last_name: 'Vaparanta',
                              profile_image:
                                'https://lh3.googleusercontent.com/a/ACg8ocJF4WPV5xgnf9CUIQUU-vBF8IdkNm9ic9zVnygSIPqHfW1P9Q=s96-c',
                              headline: 'Biomedical researcher, bioinformatician, founder',
                            },
                          },
                          {
                            id: 16479,
                            score: 4,
                            is_assessed: true,
                            author: {
                              id: 8549357,
                              first_name: 'Junaid',
                              last_name: 'Abbas',
                              profile_image:
                                'https://storage.prod.researchhub.com/uploads/author_profile_images/2026/01/18/blob',
                              headline: 'Head of Pathology Department',
                            },
                          },
                        ],
                      },
                      key_insight: null,
                    },
                    {
                      applicant: {
                        id: 7967261,
                        first_name: 'Mónica',
                        last_name: 'Vallejo',
                        profile_image:
                          'https://lh3.googleusercontent.com/a/ACg8ocK4MrPiPkw4Jow4ZgTYtRG8vb7YpY5u8rjs1IQ1BnDl_2qwPw=s96-c',
                        headline: '',
                      },
                      preregistration_post_id: 10875,
                      fundraise: {
                        id: 308,
                        title:
                          'HoneyMicroAtlas: Comparative Analysis of Worldwide Honey Microbial Fingerprints and Their Ecological Roles',
                        goal_amount: {
                          usd: 5000,
                          rsc: 62452.13426427965,
                        },
                        nonprofit: null,
                        reviews: [],
                      },
                      key_insight: null,
                    },
                  ],
                },
              },
              action_date: '2026-01-17T20:36:57.663463Z',
              action: 'PUBLISH',
            },
          ],
        };
      } else {
        response = await ApiClient.get<FeedApiResponse>(url);
      }
      const transformedEntries = response.results
        .map((entry: RawApiFeedEntry) => {
          try {
            return transformFeedEntry(entry);
          } catch (error) {
            console.error('Error transforming feed entry:', error, entry);
            return null;
          }
        })
        .filter((entry): entry is FeedEntry => !!entry);

      // Return the transformed entries
      return {
        entries: transformedEntries,
        hasMore: !!response.next,
      };
    } catch (error) {
      console.error('Error fetching feed:', error);
      // Return empty entries on error
      return {
        entries: [],
        hasMore: false,
      };
    }
  }

  // Helper function to transform a raw bounty from the feed API to a Bounty object
  // This is used by the BountyCard component which expects the old Bounty type
  static transformRawBounty(rawBounty: RawApiFeedEntry): Bounty {
    if (!rawBounty) {
      throw new Error('Raw bounty is undefined');
    }

    const { content_object, author, action_date, created_date } = rawBounty;

    if (!content_object) {
      throw new Error('Raw bounty content_object is undefined');
    }

    // Create default author if missing
    const defaultAuthor = {
      id: 0,
      first_name: 'Unknown',
      last_name: 'User',
      profile_image: '',
      description: '',
      user: {
        id: 0,
        first_name: 'Unknown',
        last_name: 'User',
        email: '',
        is_verified: false,
      },
    };

    // Use default author if author is missing
    const safeAuthor = author || defaultAuthor;

    // Transform the author to a User object
    let user: User;
    try {
      if (safeAuthor.user) {
        user = transformUser(safeAuthor.user);
        user.authorProfile = transformAuthorProfile(safeAuthor);
      } else {
        user = transformUser({
          id: safeAuthor.id,
          email: '',
          first_name: safeAuthor.first_name,
          last_name: safeAuthor.last_name,
          is_verified: false,
          balance: 0,
          author_profile: safeAuthor,
        });
      }
    } catch (error) {
      console.error('Error transforming user:', error);
      // Fallback to manual transformation
      user = {
        id: safeAuthor.user?.id || safeAuthor.id || 0,
        email: safeAuthor.user?.email || '',
        firstName: safeAuthor.first_name || '',
        lastName: safeAuthor.last_name || '',
        fullName:
          `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() || 'Unknown User',
        isVerified: safeAuthor.user?.is_verified || false,
        balance: 0,
        lockedBalance: 0,
        moderator: false,
        authorProfile: {
          id: safeAuthor.id || 0,
          fullName:
            `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() || 'Unknown User',
          firstName: safeAuthor.first_name || '',
          lastName: safeAuthor.last_name || '',
          profileImage: safeAuthor.profile_image || '',
          headline: safeAuthor.description || '',
          profileUrl: `/author/${safeAuthor.id || 0}`,
          user: {
            id: safeAuthor.user?.id || safeAuthor.id || 0,
            email: safeAuthor.user?.email || '',
            firstName: safeAuthor.first_name || '',
            lastName: safeAuthor.last_name || '',
            fullName:
              `${safeAuthor.first_name || ''} ${safeAuthor.last_name || ''}`.trim() ||
              'Unknown User',
            isVerified: safeAuthor.user?.is_verified || false,
            balance: 0,
            lockedBalance: 0,
            moderator: false,
          },
          isClaimed: !!safeAuthor.user,
          isVerified: safeAuthor.user?.is_verified || false,
        },
      };
    }

    // Map bounty_type to BountyType
    const bountyTypeMap: Record<string, BountyType> = {
      REVIEW: 'REVIEW',
      ANSWER: 'ANSWER',
      BOUNTY: 'BOUNTY',
      GENERIC_COMMENT: 'GENERIC_COMMENT',
    };

    // Get the bounty type, defaulting to 'BOUNTY' if not found
    const bountyType =
      content_object.bounty_type && bountyTypeMap[content_object.bounty_type]
        ? bountyTypeMap[content_object.bounty_type]
        : 'BOUNTY';

    // Create a Bounty object from the feed entry
    return {
      id: content_object.id,
      amount: (content_object.amount || 0).toString(),
      status: content_object.status || 'OPEN',
      expirationDate: content_object.expiration_date || new Date().toISOString(),
      bountyType,
      createdBy: user,
      solutions: [],
      contributions: [],
      totalAmount: (content_object.amount || 0).toString(),
      raw: {
        ...content_object,
        created_date: created_date || new Date().toISOString(),
        action_date: action_date || new Date().toISOString(),
        author: safeAuthor,
        hub: content_object.hub || { name: 'Unknown', slug: 'unknown' },
        paper: content_object.paper || null,
      },
    };
  }

  // Helper function to transform a raw fundraise from the feed API to a Fundraise object
  static transformRawFundraise(rawFundraise: RawApiFeedEntry): Fundraise {
    if (!rawFundraise) {
      throw new Error('Raw fundraise is undefined');
    }

    const { content_object } = rawFundraise;

    if (!content_object) {
      throw new Error('Raw fundraise content_object is undefined');
    }

    // Create a raw format expected by the transformer
    const formattedRawFundraise = {
      id: content_object.id,
      status: content_object.status,
      goal_currency: content_object.goal_currency,
      goal_amount: {
        usd: content_object.goal_amount?.usd || 0,
        rsc: content_object.goal_amount?.rsc || 0,
      },
      amount_raised: {
        usd: content_object.amount_raised?.usd || 0,
        rsc: content_object.amount_raised?.rsc || 0,
      },
      start_date: content_object.start_date,
      end_date: content_object.end_date,
      contributors: {
        total: content_object.contributors?.total || 0,
        top: (content_object.contributors?.top || []).map((contributor: any) => ({
          id: contributor.id,
          author_profile: contributor.author_profile,
          total_contribution: contributor.total_contribution,
        })),
      },
      created_by: content_object.created_by,
      created_date: content_object.created_date,
      updated_date: content_object.updated_date,
    };

    return transformFundraise(formattedRawFundraise);
  }
}
