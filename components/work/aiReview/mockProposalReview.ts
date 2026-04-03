import type { AIProposalReviewMock, ChecklistItemDefinition } from './types';

const R = {
  elena: 'elena-v',
  marcus: 'marcus-k',
  sam: 'sam-r',
  priya: 'priya-m',
} as const;

const item = (
  id: string,
  label: string,
  aiValue: ChecklistItemDefinition['aiValue'],
  humanReviews: ChecklistItemDefinition['humanReviews'] = []
): ChecklistItemDefinition => ({ id, label, aiValue, humanReviews });

export const MOCK_PROPOSAL_AI_REVIEW: AIProposalReviewMock = {
  reviewers: {
    [R.elena]: {
      id: R.elena,
      fullName: 'Elena Vasquez',
      profileImage: 'https://i.pravatar.cc/128?u=elena-rh-review',
      authorProfileId: 91001,
    },
    [R.marcus]: {
      id: R.marcus,
      fullName: 'Marcus Kim',
      profileImage: 'https://i.pravatar.cc/128?u=marcus-rh-review',
      authorProfileId: 91002,
    },
    [R.sam]: {
      id: R.sam,
      fullName: 'Samira Rahman',
      profileImage: 'https://i.pravatar.cc/128?u=sam-rh-review',
      authorProfileId: 91003,
    },
    [R.priya]: {
      id: R.priya,
      fullName: 'Priya Menon',
      profileImage: 'https://i.pravatar.cc/128?u=priya-rh-review',
      authorProfileId: 91004,
    },
  },
  categories: [
    {
      id: 'fundability',
      title: 'Fundability',
      subcategories: [
        {
          id: 'scope-alignment',
          title: 'Scope Alignment',
          summary:
            'The proposal explicitly aims to replicate and parametrize Foti’s “stone softening” protocol, characterize products, run a blind comparison to natural stones, and test pre-industrial feasibility (Abstract; Objectives, pp. 1–2; Tasks 1–3, pp. 2–8).',
          checklist: [
            item('fund-scope-rfp', 'Aligns with RFP goals', 'YES', [
              {
                reviewerId: R.elena,
                agreesWithAi: true,
                note: 'Objectives map cleanly to the program’s materials-engineering thrust.',
              },
            ]),
            item('fund-scope-aims', 'Aims stay within scope', 'YES', [
              {
                reviewerId: R.marcus,
                agreesWithAi: true,
                note: 'No mission creep detected in the work plan.',
              },
            ]),
            item('fund-scope-pop', 'Target population is defined', 'PARTIAL', [
              {
                reviewerId: R.sam,
                agreesWithAi: false,
                note: 'Bench-scale is clear; field pilot cohort is only loosely specified.',
              },
              {
                reviewerId: R.priya,
                agreesWithAi: true,
                note: 'Acceptable for phase-I; could tighten in revision.',
              },
            ]),
          ],
        },
        {
          id: 'budget-adequacy',
          title: 'Budget Adequacy',
          summary:
            'Personnel and materials align with three work packages; compute is modest. Contingency is 8%—on the low side if pilot travel is required. Line items generally match narrative effort (Budget Justification, pp. 12–14).',
          checklist: [
            item('fund-budget-scope', 'Total budget matches scope', 'YES'),
            item('fund-budget-lines', 'Line items are justified', 'PARTIAL', [
              {
                reviewerId: R.elena,
                agreesWithAi: false,
                note: 'Equipment depreciation could use one more sentence of rationale.',
              },
            ]),
            item('fund-budget-personnel', 'Personnel effort is proportional', 'YES', [
              {
                reviewerId: R.marcus,
                agreesWithAi: true,
                note: 'PI effort consistent with coordination role.',
              },
            ]),
            item('fund-budget-compute', 'Compute costs are realistic', 'YES'),
            item('fund-budget-contingency', 'Contingency is adequate', 'PARTIAL'),
            item('fund-budget-allocation', 'No over/under allocation', 'YES'),
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
            'PI and co-I combine rheology, archaeological materials, and pilot-scale testing. Recent publications include comparable characterization pipelines; team balance supports both lab and translation tasks (Biosketches, pp. 15–18).',
          checklist: [
            item('feas-exp-pub', 'Publication record is strong', 'YES', [
              {
                reviewerId: R.priya,
                agreesWithAi: true,
                note: 'Strong recent output in relevant venues.',
              },
            ]),
            item('feas-exp-methods', 'Methods expertise is demonstrated', 'YES'),
            item('feas-exp-projects', 'Comparable projects completed', 'PARTIAL', [
              {
                reviewerId: R.sam,
                agreesWithAi: false,
                note: 'Prior work is adjacent but not identical scale.',
              },
            ]),
            item('feas-exp-recent', 'Recent research activity', 'YES'),
            item('feas-exp-team', 'Team composition appropriate', 'YES'),
          ],
        },
        {
          id: 'institutional-capacity',
          title: 'Institutional Capacity',
          summary:
            'Letters confirm access to shared SEM/XRD core and kilns; industrial partner letter supports blinded sample prep. No major red flags on space or EH&S (Facilities & Resources, pp. 19–20).',
          checklist: [
            item('feas-inst-core', 'Core facilities are available', 'YES'),
            item('feas-inst-spec', 'Specialized resources are accessible', 'PARTIAL'),
            item('feas-inst-support', 'Institutional support is confirmed', 'YES', [
              {
                reviewerId: R.marcus,
                agreesWithAi: true,
                note: 'Chair letter addresses workload release adequately.',
              },
            ]),
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
            'Reframing historic “softening” claims as a falsifiable materials protocol is fresh; hypotheses are explicit about mechanism vs. artifact. Could better articulate contrast to ultra-ductile mineral studies (Innovation, pp. 4–5).',
          checklist: [
            item('nov-con-hyp', 'Novel hypothesis is proposed', 'YES'),
            item('nov-con-model', 'Challenges existing models', 'PARTIAL', [
              {
                reviewerId: R.elena,
                agreesWithAi: true,
                note: 'Positioning vs. conventional lime chemistry is plausible.',
              },
            ]),
            item('nov-con-frame', 'Distinct framing vs prior work', 'YES'),
          ],
        },
        {
          id: 'methodological-novelty',
          title: 'Methodological Novelty',
          summary:
            'Blinded tribology + multi-instrument fingerprinting is a credible package; not wholly new individually, but combination is useful. Open protocol appendix strengthens reproducibility angle (Methods preview, pp. 6–7).',
          checklist: [
            item('nov-meth-new', 'New methods are introduced', 'PARTIAL'),
            item('nov-meth-combo', 'Methods are creatively combined', 'YES'),
            item('nov-meth-tools', 'New tools/datasets are used', 'NO', [
              {
                reviewerId: R.sam,
                agreesWithAi: false,
                note: 'Datasets are standard; novelty is in design not data source.',
              },
              {
                reviewerId: R.priya,
                agreesWithAi: true,
                note: 'Fair to flag as limited novelty here.',
              },
            ]),
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
            'Success would constrain historical manufacturing claims and improve how we test “extraordinary” material assertions. Generalizability is moderate—niche but clear scholarly audience (Intellectual Merit, pp. 3–4).',
          checklist: [
            item('imp-sci-understand', 'Advances fundamental understanding', 'YES'),
            item('imp-sci-general', 'Findings are generalizable', 'PARTIAL'),
            item('imp-sci-directions', 'Opens new research directions', 'YES'),
          ],
        },
        {
          id: 'clinical-translational',
          title: 'Clinical & Translational Impact',
          summary:
            'Translational pathway is framed as heritage conservation and materials certification—not clinical. Milestones are stated but could use sharper go/no-go criteria (Broader Impacts, pp. 5–6).',
          checklist: [
            item('imp-clin-path', 'Clear clinical pathway', 'NO', [
              {
                reviewerId: R.marcus,
                agreesWithAi: true,
                note: 'Not a clinical proposal; pathway should be reframed as restoration QA.',
              },
            ]),
            item('imp-clin-unmet', 'Addresses an unmet clinical need', 'NO'),
            item('imp-clin-milestones', 'Translational milestones are defined', 'PARTIAL'),
          ],
        },
        {
          id: 'societal-broader',
          title: 'Societal & Broader Impact',
          summary:
            'Outreach includes museum workshop series; IP position is mentioned lightly. Societal challenge tie-in (cultural heritage preservation) is convincing though metrics are thin (Outreach, p. 9).',
          checklist: [
            item('imp-soc-challenge', 'Addresses a societal challenge', 'YES'),
            item('imp-soc-comms', 'Public communication is planned', 'PARTIAL'),
            item('imp-soc-commercial', 'Commercial application potential is noted', 'PARTIAL', [
              {
                reviewerId: R.elena,
                agreesWithAi: false,
                note: 'Potential is speculative; one paragraph would help.',
              },
            ]),
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
            'Steps reference ASTM-adjacent fixtures where applicable; controls include kiln schedules and supplier blanks. Model system justification is present though abbreviated (Experimental Plan, pp. 8–11).',
          checklist: [
            item('rep-meth-detail', 'Methods are sufficiently detailed', 'PARTIAL'),
            item('rep-meth-params', 'Parameters are fully specified', 'PARTIAL', [
              {
                reviewerId: R.priya,
                agreesWithAi: false,
                note: 'Temperature ramps need explicit bounds in one figure.',
              },
            ]),
            item('rep-meth-controls', 'Controls are clearly defined', 'YES'),
            item('rep-meth-model', 'Model/system choice is justified', 'YES'),
          ],
        },
        {
          id: 'statistical-analysis',
          title: 'Statistical Analysis Plan',
          summary:
            'Pre-specified primary endpoint is blinded ranking error; power sketch included for n=24 panels. Multiple comparisons called out for secondary metrics; evaluation metrics table in appendix B (SAP, pp. 22–23).',
          checklist: [
            item('rep-stat-plan', 'Plan is present', 'YES'),
            item('rep-stat-power', 'Power analysis is included', 'PARTIAL'),
            item('rep-stat-multiple', 'Multiple comparisons are addressed', 'YES'),
            item('rep-stat-metrics', 'Evaluation metrics are defined', 'YES', [
              {
                reviewerId: R.sam,
                agreesWithAi: true,
                note: 'Metrics map well to the blinded design.',
              },
            ]),
          ],
        },
      ],
    },
  ],
};
