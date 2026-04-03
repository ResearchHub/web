export type ReviewDecision = 'yes' | 'partial' | 'no';
export type ReviewLevel = 'low' | 'medium' | 'high';

export interface AIReviewer {
  id: number;
  fullName: string;
  profileImage: string;
  headline: string;
}

export interface HumanValidation {
  reviewerId: number;
  decision: ReviewDecision;
  note?: string;
}

export interface AIReviewChecklistItem {
  id: string;
  label: string;
  decision: ReviewDecision;
  validations: HumanValidation[];
}

export interface AIReviewSubcategory {
  id: string;
  title: string;
  summary: string;
  checklist: AIReviewChecklistItem[];
}

export interface AIReviewCategory {
  id: string;
  title: string;
  subcategories: AIReviewSubcategory[];
}

export interface ProposalAIReviewData {
  generatedAt: string;
  modelLabel: string;
  reviewers: Record<number, AIReviewer>;
  categories: AIReviewCategory[];
}

const reviewers: Record<number, AIReviewer> = {
  101: {
    id: 101,
    fullName: 'Maya Chen',
    profileImage: '',
    headline: 'Translational neuroscientist',
  },
  102: {
    id: 102,
    fullName: 'Rafael Torres',
    profileImage: '',
    headline: 'Grant program reviewer',
  },
  103: {
    id: 103,
    fullName: 'Amina Patel',
    profileImage: '',
    headline: 'Biostatistician',
  },
  104: {
    id: 104,
    fullName: 'Liam Osei',
    profileImage: '',
    headline: 'Clinical innovation lead',
  },
};

export const proposalAIReviewData: ProposalAIReviewData = {
  generatedAt: '2026-04-03T14:00:00.000Z',
  modelLabel: 'GPT-5.4 review pipeline',
  reviewers,
  categories: [
    {
      id: 'fundability',
      title: 'Fundability',
      subcategories: [
        {
          id: 'scope-alignment',
          title: 'Scope Alignment',
          summary:
            'The proposal is tightly framed around an RFP for scalable early-detection programs, with defined patient inclusion criteria and milestones that stay within the requested implementation window.',
          checklist: [
            {
              id: 'fundability-scope-rfp',
              label: 'Aligns with RFP goals',
              decision: 'yes',
              validations: [
                {
                  reviewerId: 102,
                  decision: 'yes',
                  note: 'The deliverables match the stated translational pilot objective.',
                },
              ],
            },
            {
              id: 'fundability-scope-aims',
              label: 'Aims stay within scope',
              decision: 'yes',
              validations: [
                {
                  reviewerId: 101,
                  decision: 'yes',
                  note: 'The milestones are ambitious but still fit the pilot phase.',
                },
              ],
            },
            {
              id: 'fundability-scope-population',
              label: 'Target population is defined',
              decision: 'partial',
              validations: [
                {
                  reviewerId: 104,
                  decision: 'partial',
                  note: 'Age bands are clear, but exclusion criteria could be sharper.',
                },
              ],
            },
          ],
        },
        {
          id: 'budget-adequacy',
          title: 'Budget Adequacy',
          summary:
            'The staffing and equipment assumptions broadly fit the work plan, though the compute reserve and contingency line feel compressed for a multi-site data harmonization effort.',
          checklist: [
            {
              id: 'fundability-budget-total',
              label: 'Total budget matches scope',
              decision: 'yes',
              validations: [],
            },
            {
              id: 'fundability-budget-line-items',
              label: 'Line items are justified',
              decision: 'yes',
              validations: [
                {
                  reviewerId: 102,
                  decision: 'yes',
                  note: 'The budget narrative is unusually specific for vendor costs.',
                },
              ],
            },
            {
              id: 'fundability-budget-personnel',
              label: 'Personnel effort is proportional',
              decision: 'yes',
              validations: [],
            },
            {
              id: 'fundability-budget-compute',
              label: 'Compute costs are realistic',
              decision: 'partial',
              validations: [
                {
                  reviewerId: 103,
                  decision: 'no',
                  note: 'Cloud storage growth is likely understated if enrollment succeeds.',
                },
              ],
            },
            {
              id: 'fundability-budget-contingency',
              label: 'Contingency is adequate',
              decision: 'partial',
              validations: [],
            },
            {
              id: 'fundability-budget-allocation',
              label: 'No over/under allocation',
              decision: 'yes',
              validations: [],
            },
          ],
        },
      ],
    },
    {
      id: 'feasibility',
      title: 'Feasibility',
      subcategories: [
        {
          id: 'investigator-expertise',
          title: 'Investigator Expertise',
          summary:
            'The PI and co-investigators have credible prior work in digital phenotyping, MRI analytics, and multicenter coordination, which supports execution risk being manageable.',
          checklist: [
            {
              id: 'feasibility-investigator-publications',
              label: 'Publication record is strong',
              decision: 'yes',
              validations: [
                {
                  reviewerId: 101,
                  decision: 'yes',
                  note: 'The CVs show recent field-specific publications rather than generic output.',
                },
              ],
            },
            {
              id: 'feasibility-investigator-methods',
              label: 'Methods expertise is demonstrated',
              decision: 'yes',
              validations: [],
            },
            {
              id: 'feasibility-investigator-projects',
              label: 'Comparable projects completed',
              decision: 'partial',
              validations: [
                {
                  reviewerId: 102,
                  decision: 'partial',
                  note: 'They have run adjacent studies, but not at the same enrollment scale.',
                },
              ],
            },
            {
              id: 'feasibility-investigator-activity',
              label: 'Recent research activity',
              decision: 'yes',
              validations: [],
            },
            {
              id: 'feasibility-investigator-team',
              label: 'Team composition appropriate',
              decision: 'yes',
              validations: [
                {
                  reviewerId: 104,
                  decision: 'yes',
                  note: 'Clinical, imaging, and data engineering roles are represented.',
                },
              ],
            },
          ],
        },
        {
          id: 'institutional-capacity',
          title: 'Institutional Capacity',
          summary:
            'Partner sites appear to have the needed imaging and recruitment infrastructure, although formal letters of support are summarized more than reproduced in detail.',
          checklist: [
            {
              id: 'feasibility-institution-facilities',
              label: 'Core facilities are available',
              decision: 'yes',
              validations: [],
            },
            {
              id: 'feasibility-institution-resources',
              label: 'Specialized resources are accessible',
              decision: 'yes',
              validations: [],
            },
            {
              id: 'feasibility-institution-support',
              label: 'Institutional support is confirmed',
              decision: 'partial',
              validations: [
                {
                  reviewerId: 102,
                  decision: 'partial',
                  note: 'Support is credible, but appendices should include signed letters.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'novelty',
      title: 'Novelty',
      subcategories: [
        {
          id: 'conceptual-novelty',
          title: 'Conceptual Novelty',
          summary:
            'The proposal does not invent a new disease area, but it reframes early detection by combining passive wearable signals with site-specific imaging into a decision-support workflow.',
          checklist: [
            {
              id: 'novelty-concept-hypothesis',
              label: 'Novel hypothesis is proposed',
              decision: 'yes',
              validations: [
                {
                  reviewerId: 101,
                  decision: 'yes',
                  note: 'The hypothesis is specific and differs from standard biomarker stacking.',
                },
              ],
            },
            {
              id: 'novelty-concept-models',
              label: 'Challenges existing models',
              decision: 'partial',
              validations: [],
            },
            {
              id: 'novelty-concept-framing',
              label: 'Distinct framing vs prior work',
              decision: 'yes',
              validations: [
                {
                  reviewerId: 104,
                  decision: 'yes',
                  note: 'The care-path framing is different from most academic screening studies.',
                },
              ],
            },
          ],
        },
        {
          id: 'methodological-novelty',
          title: 'Methodological Novelty',
          summary:
            'The technical approach is more combinatorial than radically new, but the proposal does assemble sensing, imaging, and harmonization methods in a way that feels product-oriented.',
          checklist: [
            {
              id: 'novelty-methods-new',
              label: 'New methods are introduced',
              decision: 'partial',
              validations: [
                {
                  reviewerId: 103,
                  decision: 'partial',
                  note: 'Most methods exist already; the novelty is mostly in integration.',
                },
              ],
            },
            {
              id: 'novelty-methods-combined',
              label: 'Methods are creatively combined',
              decision: 'yes',
              validations: [],
            },
            {
              id: 'novelty-methods-tools',
              label: 'New tools/datasets are used',
              decision: 'yes',
              validations: [],
            },
          ],
        },
      ],
    },
    {
      id: 'impact',
      title: 'Impact',
      subcategories: [
        {
          id: 'scientific-impact',
          title: 'Scientific Impact',
          summary:
            'If the signal integration works as proposed, the project could provide a reusable template for multi-modal early-detection studies beyond the immediate disease focus.',
          checklist: [
            {
              id: 'impact-scientific-understanding',
              label: 'Advances fundamental understanding',
              decision: 'yes',
              validations: [],
            },
            {
              id: 'impact-scientific-generalizable',
              label: 'Findings are generalizable',
              decision: 'partial',
              validations: [
                {
                  reviewerId: 101,
                  decision: 'partial',
                  note: 'Generalizability depends on whether site effects are controlled well.',
                },
              ],
            },
            {
              id: 'impact-scientific-directions',
              label: 'Opens new research directions',
              decision: 'yes',
              validations: [],
            },
          ],
        },
        {
          id: 'clinical-translational-impact',
          title: 'Clinical Translational Impact',
          summary:
            'The proposal has a credible translational arc, including pilot clinic deployment milestones, but reimbursement and workflow adoption risks remain underdeveloped.',
          checklist: [
            {
              id: 'impact-clinical-pathway',
              label: 'Clear clinical pathway',
              decision: 'yes',
              validations: [
                {
                  reviewerId: 104,
                  decision: 'yes',
                  note: 'The step from recruitment to specialty referral is clearly drawn.',
                },
              ],
            },
            {
              id: 'impact-clinical-need',
              label: 'Addresses an unmet clinical need',
              decision: 'yes',
              validations: [],
            },
            {
              id: 'impact-clinical-milestones',
              label: 'Translational milestones are defined',
              decision: 'partial',
              validations: [
                {
                  reviewerId: 102,
                  decision: 'partial',
                  note: 'The deployment milestones are present, but success gates are soft.',
                },
              ],
            },
          ],
        },
        {
          id: 'societal-broader-impact',
          title: 'Societal & Broader Impact',
          summary:
            'The proposal is strong on patient relevance and future commercialization, but the public communication plan is still thin for a project that emphasizes community screening.',
          checklist: [
            {
              id: 'impact-societal-challenge',
              label: 'Addresses a societal challenge',
              decision: 'yes',
              validations: [],
            },
            {
              id: 'impact-societal-communication',
              label: 'Public communication is planned',
              decision: 'partial',
              validations: [
                {
                  reviewerId: 104,
                  decision: 'partial',
                  note: 'There is an outreach paragraph, but no named dissemination partner.',
                },
              ],
            },
            {
              id: 'impact-societal-commercial',
              label: 'Commercial application potential is noted',
              decision: 'yes',
              validations: [],
            },
          ],
        },
      ],
    },
    {
      id: 'reproducibility',
      title: 'Reproducibility',
      subcategories: [
        {
          id: 'methods-rigor',
          title: 'Methods Rigor',
          summary:
            'The operational flow is understandable, but several analytical parameters and control definitions are still deferred to future protocol finalization.',
          checklist: [
            {
              id: 'reproducibility-methods-detailed',
              label: 'Methods are sufficiently detailed',
              decision: 'partial',
              validations: [],
            },
            {
              id: 'reproducibility-methods-parameters',
              label: 'Parameters are fully specified',
              decision: 'no',
              validations: [
                {
                  reviewerId: 103,
                  decision: 'no',
                  note: 'Thresholding and feature selection settings are not yet locked.',
                },
              ],
            },
            {
              id: 'reproducibility-methods-controls',
              label: 'Controls are clearly defined',
              decision: 'partial',
              validations: [],
            },
            {
              id: 'reproducibility-methods-model-choice',
              label: 'Model/system choice is justified',
              decision: 'yes',
              validations: [
                {
                  reviewerId: 101,
                  decision: 'yes',
                  note: 'The model family choice is defensible even if tuning details are pending.',
                },
              ],
            },
          ],
        },
        {
          id: 'statistical-analysis-plan',
          title: 'Statistical Analysis Plan',
          summary:
            'A statistical section exists, but it is the weakest part of the proposal: power assumptions are high-level and multiplicity control is only mentioned, not operationalized.',
          checklist: [
            {
              id: 'reproducibility-stats-plan',
              label: 'Plan is present',
              decision: 'yes',
              validations: [],
            },
            {
              id: 'reproducibility-stats-power',
              label: 'Power analysis is included',
              decision: 'partial',
              validations: [
                {
                  reviewerId: 103,
                  decision: 'partial',
                  note: 'The power analysis is directionally useful but not fully parameterized.',
                },
              ],
            },
            {
              id: 'reproducibility-stats-comparisons',
              label: 'Multiple comparisons are addressed',
              decision: 'no',
              validations: [
                {
                  reviewerId: 103,
                  decision: 'no',
                  note: 'This needs a concrete correction strategy before funding.',
                },
              ],
            },
            {
              id: 'reproducibility-stats-metrics',
              label: 'Evaluation metrics are defined',
              decision: 'yes',
              validations: [],
            },
          ],
        },
      ],
    },
  ],
};

export const decisionWeight: Record<ReviewDecision, number> = {
  yes: 1,
  partial: 0.55,
  no: 0,
};

export const levelWeight: Record<ReviewLevel, number> = {
  high: 1,
  medium: 0.55,
  low: 0.15,
};

export function getReviewLevelFromScore(score: number): ReviewLevel {
  if (score >= 0.74) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

export function getChecklistAverage(items: AIReviewChecklistItem[]): number {
  if (items.length === 0) return 0;
  return items.reduce((sum, item) => sum + decisionWeight[item.decision], 0) / items.length;
}

export function getSubcategoryLevel(subcategory: AIReviewSubcategory): ReviewLevel {
  return getReviewLevelFromScore(getChecklistAverage(subcategory.checklist));
}

export function getCategoryAverage(category: AIReviewCategory): number {
  if (category.subcategories.length === 0) return 0;
  return (
    category.subcategories.reduce(
      (sum, subcategory) => sum + levelWeight[getSubcategoryLevel(subcategory)],
      0
    ) / category.subcategories.length
  );
}

export function getCategoryLevel(category: AIReviewCategory): ReviewLevel {
  return getReviewLevelFromScore(getCategoryAverage(category));
}

export function getOverallReviewScore(categories: AIReviewCategory[]): number {
  if (categories.length === 0) return 0;
  return Math.round(
    (categories.reduce((sum, category) => sum + levelWeight[getCategoryLevel(category)], 0) /
      categories.length) *
      100
  );
}

export function getOverallReviewLabel(score: number): 'Poor' | 'Fair' | 'Good' | 'Excellent' {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

export function getUniqueReviewerIds(items: HumanValidation[]): number[] {
  return Array.from(new Set(items.map((item) => item.reviewerId)));
}
