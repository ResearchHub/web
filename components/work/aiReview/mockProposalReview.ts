import type { AIProposalReviewMock, ChecklistItemDefinition, ChecklistHumanReview } from './types';

const R = {
  elena: 'elena-v',
  marcus: 'marcus-k',
  sam: 'sam-r',
  priya: 'priya-m',
} as const;

/** Helper: build a checklist item where every reviewer has weighed in. */
const item = (
  id: string,
  label: string,
  aiValue: ChecklistItemDefinition['aiValue'],
  reviews: [
    elena: ChecklistHumanReview,
    marcus: ChecklistHumanReview,
    sam: ChecklistHumanReview,
    priya: ChecklistHumanReview,
  ]
): ChecklistItemDefinition => ({ id, label, aiValue, humanReviews: reviews });

/** Shorthand for a single reviewer's verdict */
const rev = (reviewerId: string, agreesWithAi: boolean, note: string): ChecklistHumanReview => ({
  reviewerId,
  agreesWithAi,
  note,
});

export const MOCK_PROPOSAL_AI_REVIEW: AIProposalReviewMock = {
  consensusReview: {
    summary:
      'This proposal presents a well-structured investigation into the parametrization of historical stone softening techniques. The methodology is sound, combining blinded tribology with multi-instrument fingerprinting. Budget allocation is generally proportional to the scope, though contingency margins are thin. The team brings strong domain expertise and institutional support. Key weaknesses include limited methodological novelty at the individual technique level, thin outreach metrics, and some gaps in parameter specification. The statistical analysis plan is adequate but power calculations for secondary endpoints may be insufficient. Overall, the proposal is fundable with minor revisions recommended around budget contingency and translational milestone clarity.',
    fundingQuality: 'MEDIUM',
    reviewerIds: ['elena-v', 'marcus-k', 'sam-r', 'priya-m'],
  },
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
    /* ───────────────────────── FUNDABILITY ───────────────────────── */
    {
      id: 'fundability',
      title: 'Fundability',
      subcategories: [
        {
          id: 'scope-alignment',
          title: 'Scope Alignment',
          summary:
            'The proposal explicitly aims to replicate and parametrize Foti\'s "stone softening" protocol, characterize products, run a blind comparison to natural stones, and test pre-industrial feasibility (Abstract; Objectives, pp. 1\u20132; Tasks 1\u20133, pp. 2\u20138).',
          checklist: [
            item('fund-scope-rfp', 'Aligns with RFP goals', 'YES', [
              rev(
                R.elena,
                true,
                'Objectives map cleanly to the program\u2019s materials-engineering thrust.'
              ),
              rev(R.marcus, true, 'Well-aligned with the call.'),
              rev(R.sam, true, 'Clear alignment; no stretch.'),
              rev(R.priya, true, 'Directly addresses stated priorities.'),
            ]),
            item('fund-scope-aims', 'Aims stay within scope', 'YES', [
              rev(R.elena, true, 'Aims are tightly scoped.'),
              rev(R.marcus, true, 'No mission creep detected in the work plan.'),
              rev(R.sam, true, 'Stays focused on core deliverables.'),
              rev(R.priya, true, 'Reasonable and bounded.'),
            ]),
            item('fund-scope-pop', 'Target population is defined', 'NO', [
              rev(R.elena, true, 'Acceptable for phase-I scope.'),
              rev(R.marcus, true, 'Bench-scale target is defined adequately.'),
              rev(
                R.sam,
                false,
                'Bench-scale is clear; field pilot cohort is only loosely specified.'
              ),
              rev(R.priya, true, 'Could tighten in revision but acceptable.'),
            ]),
          ],
        },
        {
          id: 'budget-adequacy',
          title: 'Budget Adequacy',
          summary:
            'Personnel and materials align with three work packages; compute is modest. Contingency is 8%\u2014on the low side if pilot travel is required. Line items generally match narrative effort (Budget Justification, pp. 12\u201314).',
          checklist: [
            item('fund-budget-scope', 'Total budget matches scope', 'YES', [
              rev(R.elena, true, 'Budget and scope are proportional.'),
              rev(R.marcus, true, 'Reasonable total for three WPs.'),
              rev(R.sam, true, 'No obvious mismatch.'),
              rev(R.priya, true, 'Consistent with comparable grants.'),
            ]),
            item('fund-budget-lines', 'Line items are justified', 'NO', [
              rev(
                R.elena,
                false,
                'Equipment depreciation could use one more sentence of rationale.'
              ),
              rev(R.marcus, true, 'Most lines are well-documented.'),
              rev(R.sam, true, 'Acceptable level of detail.'),
              rev(R.priya, false, 'Travel line needs clearer justification.'),
            ]),
            item('fund-budget-personnel', 'Personnel effort is proportional', 'YES', [
              rev(R.elena, true, 'FTE allocations make sense.'),
              rev(R.marcus, true, 'PI effort consistent with coordination role.'),
              rev(R.sam, true, 'Good balance across team.'),
              rev(R.priya, true, 'Matches proposed deliverables.'),
            ]),
            item('fund-budget-compute', 'Compute costs are realistic', 'YES', [
              rev(R.elena, true, 'Modest and appropriate.'),
              rev(R.marcus, true, 'Cloud estimates are reasonable.'),
              rev(R.sam, true, 'No concerns.'),
              rev(R.priya, true, 'Consistent with the analytical scope.'),
            ]),
            item('fund-budget-contingency', 'Contingency is adequate', 'NO', [
              rev(R.elena, true, '8% is tight but workable.'),
              rev(R.marcus, false, 'Would prefer 10\u201312% given travel uncertainties.'),
              rev(R.sam, true, 'Marginal but acceptable.'),
              rev(R.priya, false, 'Insufficient if pilot site access is delayed.'),
            ]),
            item('fund-budget-allocation', 'No over/under allocation', 'YES', [
              rev(R.elena, true, 'Well-balanced.'),
              rev(R.marcus, true, 'No red flags.'),
              rev(R.sam, true, 'Proportional across WPs.'),
              rev(R.priya, true, 'Clean allocation.'),
            ]),
          ],
        },
      ],
    },

    /* ───────────────────────── FEASIBILITY ───────────────────────── */
    {
      id: 'feasibility',
      title: 'Feasibility',
      subcategories: [
        {
          id: 'investigator-expertise',
          title: 'Investigator Expertise',
          summary:
            'PI and co-I combine rheology, archaeological materials, and pilot-scale testing. Recent publications include comparable characterization pipelines; team balance supports both lab and translation tasks (Biosketches, pp. 15\u201318).',
          checklist: [
            item('feas-exp-pub', 'Publication record is strong', 'YES', [
              rev(R.elena, true, 'Solid h-index and relevant venues.'),
              rev(R.marcus, true, 'Impressive recent output.'),
              rev(R.sam, true, 'Top-tier journals represented.'),
              rev(R.priya, true, 'Strong recent output in relevant venues.'),
            ]),
            item('feas-exp-methods', 'Methods expertise is demonstrated', 'YES', [
              rev(R.elena, true, 'Clear from prior publications.'),
              rev(R.marcus, true, 'Demonstrated in cited pilot studies.'),
              rev(R.sam, true, 'Co-I adds complementary methods skills.'),
              rev(R.priya, true, 'Well-evidenced.'),
            ]),
            item('feas-exp-projects', 'Comparable projects completed', 'YES', [
              rev(R.elena, true, 'NSF grant on similar materials completed.'),
              rev(R.marcus, true, 'Prior DOE project is a close analog.'),
              rev(R.sam, true, 'Prior work at comparable scale is well-documented.'),
              rev(R.priya, true, 'Track record is convincing.'),
            ]),
            item('feas-exp-recent', 'Recent research activity', 'YES', [
              rev(R.elena, true, '4 papers in last 18 months.'),
              rev(R.marcus, true, 'Active conference presence.'),
              rev(R.sam, true, 'No gap in output.'),
              rev(R.priya, true, 'Currently funded and publishing.'),
            ]),
            item('feas-exp-team', 'Team composition appropriate', 'YES', [
              rev(R.elena, true, 'Good mix of senior and junior researchers.'),
              rev(R.marcus, true, 'Covers lab, field, and analysis.'),
              rev(R.sam, true, 'Roles are well-defined.'),
              rev(R.priya, true, 'Complementary expertise.'),
            ]),
          ],
        },
        {
          id: 'institutional-capacity',
          title: 'Institutional Capacity',
          summary:
            'Letters confirm access to shared SEM/XRD core and kilns; industrial partner letter supports blinded sample prep. No major red flags on space or EH&S (Facilities & Resources, pp. 19\u201320).',
          checklist: [
            item('feas-inst-core', 'Core facilities are available', 'YES', [
              rev(R.elena, true, 'SEM/XRD core confirmed.'),
              rev(R.marcus, true, 'Shared facility letter is clear.'),
              rev(R.sam, true, 'Access confirmed in writing.'),
              rev(R.priya, true, 'No concerns.'),
            ]),
            item('feas-inst-spec', 'Specialized resources are accessible', 'YES', [
              rev(R.elena, true, 'Kiln access is documented.'),
              rev(R.marcus, true, 'Industrial partner commitment is solid.'),
              rev(R.sam, true, 'All specialized needs covered.'),
              rev(R.priya, true, 'Letters of support are convincing.'),
            ]),
            item('feas-inst-support', 'Institutional support is confirmed', 'YES', [
              rev(R.elena, true, 'Dean\u2019s letter is strong.'),
              rev(R.marcus, true, 'Chair letter addresses workload release adequately.'),
              rev(R.sam, true, 'Cost-share commitment noted.'),
              rev(R.priya, true, 'Institutional backing is clear.'),
            ]),
          ],
        },
      ],
    },

    /* ───────────────────────── NOVELTY ───────────────────────── */
    {
      id: 'novelty',
      title: 'Novelty',
      subcategories: [
        {
          id: 'conceptual-novelty',
          title: 'Conceptual Novelty',
          summary:
            'Reframing historic "softening" claims as a falsifiable materials protocol is fresh; hypotheses are explicit about mechanism vs. artifact. Could better articulate contrast to ultra-ductile mineral studies (Innovation, pp. 4\u20135).',
          checklist: [
            item('nov-con-hyp', 'Novel hypothesis is proposed', 'YES', [
              rev(R.elena, true, 'Genuinely new angle on a classic question.'),
              rev(R.marcus, true, 'Hypothesis is clearly falsifiable.'),
              rev(R.sam, true, 'Fresh take on existing claims.'),
              rev(R.priya, true, 'Original and well-motivated.'),
            ]),
            item('nov-con-model', 'Challenges existing models', 'YES', [
              rev(R.elena, true, 'Positioning vs. conventional lime chemistry is plausible.'),
              rev(R.marcus, true, 'Challenges are stated but could be sharper.'),
              rev(R.sam, false, 'Doesn\u2019t fully engage with the mineral ductility literature.'),
              rev(R.priya, true, 'Adequate challenge to status quo.'),
            ]),
            item('nov-con-frame', 'Distinct framing vs prior work', 'YES', [
              rev(R.elena, true, 'Clear differentiation from prior art.'),
              rev(R.marcus, true, 'Framing is compelling.'),
              rev(R.sam, true, 'Well-distinguished from competitors.'),
              rev(R.priya, true, 'Literature review supports the claim.'),
            ]),
          ],
        },
        {
          id: 'methodological-novelty',
          title: 'Methodological Novelty',
          summary:
            'Blinded tribology + multi-instrument fingerprinting is a credible package; not wholly new individually, but combination is useful. Open protocol appendix strengthens reproducibility angle (Methods preview, pp. 6\u20137).',
          checklist: [
            item('nov-meth-new', 'New methods are introduced', 'NO', [
              rev(R.elena, true, 'Blinded tribology approach is relatively new here.'),
              rev(R.marcus, true, 'Methods are adapted, not entirely new.'),
              rev(R.sam, false, 'Individual methods are standard; novelty is in assembly.'),
              rev(R.priya, true, 'Fair assessment\u2014incremental but useful.'),
            ]),
            item('nov-meth-combo', 'Methods are creatively combined', 'YES', [
              rev(R.elena, true, 'Multi-instrument fingerprinting is well-designed.'),
              rev(R.marcus, true, 'Creative integration of techniques.'),
              rev(R.sam, true, 'The combination adds real value.'),
              rev(R.priya, true, 'Synergy between methods is clear.'),
            ]),
            item('nov-meth-tools', 'New tools/datasets are used', 'NO', [
              rev(R.elena, true, 'Fair to flag\u2014no new datasets.'),
              rev(R.marcus, true, 'Existing tools are sufficient but not novel.'),
              rev(R.sam, false, 'Datasets are standard; novelty is in design not data source.'),
              rev(R.priya, true, 'Fair to flag as limited novelty here.'),
            ]),
          ],
        },
      ],
    },

    /* ───────────────────────── IMPACT ───────────────────────── */
    {
      id: 'impact',
      title: 'Impact',
      subcategories: [
        {
          id: 'scientific-impact',
          title: 'Scientific Impact',
          summary:
            'Success would constrain historical manufacturing claims and improve how we test "extraordinary" material assertions. Generalizability is moderate\u2014niche but clear scholarly audience (Intellectual Merit, pp. 3\u20134).',
          checklist: [
            item('imp-sci-understand', 'Advances fundamental understanding', 'YES', [
              rev(R.elena, true, 'Would meaningfully advance the field.'),
              rev(R.marcus, true, 'Clear contribution to materials science.'),
              rev(R.sam, true, 'Addresses an open question.'),
              rev(R.priya, true, 'Strong intellectual merit.'),
            ]),
            item('imp-sci-general', 'Findings are generalizable', 'YES', [
              rev(R.elena, true, 'Methods could transfer to other material claims.'),
              rev(R.marcus, false, 'Niche audience limits generalizability.'),
              rev(R.sam, true, 'Framework is transferable even if topic is niche.'),
              rev(R.priya, true, 'Moderate but defensible.'),
            ]),
            item('imp-sci-directions', 'Opens new research directions', 'YES', [
              rev(R.elena, true, 'Could seed a new sub-field.'),
              rev(R.marcus, true, 'Multiple follow-on studies are imaginable.'),
              rev(R.sam, true, 'Opens doors to related historical claims.'),
              rev(R.priya, true, 'Promising trajectory.'),
            ]),
          ],
        },
        {
          id: 'clinical-translational',
          title: 'Clinical & Translational Impact',
          summary:
            'Translational pathway is framed as heritage conservation and materials certification\u2014not clinical. Milestones are stated but could use sharper go/no-go criteria (Broader Impacts, pp. 5\u20136).',
          checklist: [
            item('imp-clin-path', 'Clear clinical pathway', 'NO', [
              rev(R.elena, true, 'Not applicable\u2014non-clinical proposal.'),
              rev(
                R.marcus,
                true,
                'Not a clinical proposal; pathway should be reframed as restoration QA.'
              ),
              rev(R.sam, true, 'N/A is the correct assessment.'),
              rev(R.priya, true, 'Agree\u2014clinical framing doesn\u2019t apply.'),
            ]),
            item('imp-clin-unmet', 'Addresses an unmet clinical need', 'NO', [
              rev(R.elena, true, 'Not applicable.'),
              rev(R.marcus, true, 'Correct\u2014no clinical angle.'),
              rev(R.sam, true, 'N/A.'),
              rev(R.priya, true, 'Agreed.'),
            ]),
            item('imp-clin-milestones', 'Translational milestones are defined', 'NO', [
              rev(R.elena, true, 'Heritage conservation milestones are present.'),
              rev(R.marcus, false, 'Go/no-go criteria need tightening.'),
              rev(R.sam, true, 'Milestones exist but could be sharper.'),
              rev(R.priya, false, 'Decision points are vague.'),
            ]),
          ],
        },
        {
          id: 'societal-broader',
          title: 'Societal & Broader Impact',
          summary:
            'Outreach includes museum workshop series; IP position is mentioned lightly. Societal challenge tie-in (cultural heritage preservation) is convincing though metrics are thin (Outreach, p. 9).',
          checklist: [
            item('imp-soc-challenge', 'Addresses a societal challenge', 'YES', [
              rev(R.elena, true, 'Cultural heritage preservation is compelling.'),
              rev(R.marcus, true, 'Clear societal relevance.'),
              rev(R.sam, true, 'Well-motivated broader impact.'),
              rev(R.priya, true, 'Strong connection to public interest.'),
            ]),
            item('imp-soc-comms', 'Public communication is planned', 'YES', [
              rev(R.elena, true, 'Museum workshops are a nice touch.'),
              rev(R.marcus, true, 'Outreach plan exists.'),
              rev(R.sam, false, 'Metrics for outreach success are missing.'),
              rev(R.priya, true, 'Plan is present but thin on measurement.'),
            ]),
            item('imp-soc-commercial', 'Commercial application potential is noted', 'NO', [
              rev(R.elena, false, 'Potential is speculative; one paragraph would help.'),
              rev(R.marcus, true, 'IP mention is sufficient for this stage.'),
              rev(R.sam, true, 'Restoration market is plausible.'),
              rev(R.priya, false, 'Needs more concrete commercialization pathway.'),
            ]),
          ],
        },
      ],
    },

    /* ───────────────────────── REPRODUCIBILITY ───────────────────────── */
    {
      id: 'reproducibility',
      title: 'Reproducibility',
      subcategories: [
        {
          id: 'methods-rigor',
          title: 'Methods Rigor',
          summary:
            'Steps reference ASTM-adjacent fixtures where applicable; controls include kiln schedules and supplier blanks. Model system justification is present though abbreviated (Experimental Plan, pp. 8\u201311).',
          checklist: [
            item('rep-meth-detail', 'Methods are sufficiently detailed', 'NO', [
              rev(R.elena, true, 'Adequate for a proposal; full protocol in appendix.'),
              rev(R.marcus, true, 'Sufficient detail for evaluation.'),
              rev(R.sam, false, 'Some steps need more granularity.'),
              rev(R.priya, true, 'Acceptable level of detail.'),
            ]),
            item('rep-meth-params', 'Parameters are fully specified', 'YES', [
              rev(R.elena, true, 'Key parameters are stated.'),
              rev(R.marcus, true, 'Most are specified; minor gaps.'),
              rev(R.sam, true, 'Broadly acceptable.'),
              rev(R.priya, false, 'Temperature ramps need explicit bounds in one figure.'),
            ]),
            item('rep-meth-controls', 'Controls are clearly defined', 'YES', [
              rev(R.elena, true, 'Kiln schedules and blanks are well-specified.'),
              rev(R.marcus, true, 'Controls are thorough.'),
              rev(R.sam, true, 'Good experimental design.'),
              rev(R.priya, true, 'No concerns with controls.'),
            ]),
            item('rep-meth-model', 'Model/system choice is justified', 'YES', [
              rev(R.elena, true, 'Choice is well-defended.'),
              rev(R.marcus, true, 'System is appropriate for the questions.'),
              rev(R.sam, true, 'Justified in the text.'),
              rev(R.priya, true, 'Sound rationale.'),
            ]),
          ],
        },
        {
          id: 'statistical-analysis',
          title: 'Statistical Analysis Plan',
          summary:
            'Pre-specified primary endpoint is blinded ranking error; power sketch included for n=24 panels. Multiple comparisons called out for secondary metrics; evaluation metrics table in appendix B (SAP, pp. 22\u201323).',
          checklist: [
            item('rep-stat-plan', 'Plan is present', 'YES', [
              rev(R.elena, true, 'SAP is included and clear.'),
              rev(R.marcus, true, 'Well-structured plan.'),
              rev(R.sam, true, 'Comprehensive for a proposal.'),
              rev(R.priya, true, 'Meets expectations.'),
            ]),
            item('rep-stat-power', 'Power analysis is included', 'NO', [
              rev(R.elena, true, 'Power sketch is present.'),
              rev(R.marcus, false, 'n=24 may be underpowered for secondary endpoints.'),
              rev(R.sam, true, 'Adequate for primary endpoint.'),
              rev(R.priya, true, 'Acceptable given the design.'),
            ]),
            item('rep-stat-multiple', 'Multiple comparisons are addressed', 'YES', [
              rev(R.elena, true, 'Bonferroni correction noted.'),
              rev(R.marcus, true, 'Properly handled.'),
              rev(R.sam, true, 'Addressed for secondary metrics.'),
              rev(R.priya, true, 'No concerns.'),
            ]),
            item('rep-stat-metrics', 'Evaluation metrics are defined', 'YES', [
              rev(R.elena, true, 'Metrics table in appendix is clear.'),
              rev(R.marcus, true, 'Well-defined outcomes.'),
              rev(R.sam, true, 'Metrics map well to the blinded design.'),
              rev(R.priya, true, 'Comprehensive and appropriate.'),
            ]),
          ],
        },
      ],
    },
  ],
};
