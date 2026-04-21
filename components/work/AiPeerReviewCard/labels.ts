import type { CategoryKey } from '@/types/aiPeerReview';

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  funding_opportunity_fit: 'Funding Opportunity Fit',
  methods_rigor: 'Methods Rigor',
  statistical_analysis_plan: 'Statistical Analysis Plan',
  feasibility_and_execution: 'Feasibility and Execution',
  scientific_impact: 'Scientific Impact',
  clinical_or_translational_impact: 'Clinical or Translational Impact',
  societal_and_broader_impact: 'Societal and Broader Impact',
};

export const ITEM_LABELS: Record<string, string> = {
  // funding_opportunity_fit
  fit_modality: 'Modality Fit',
  fit_aims: 'Aims Alignment',
  fit_deliverables: 'Deliverables Fit',
  fit_scope: 'Scope Fit',
  // methods_rigor
  methods_detail: 'Methods Detail',
  parameters_specified: 'Parameters Specified',
  controls_defined: 'Controls Defined',
  model_choice_justified: 'Model Choice Justified',
  outcomes_linked_to_aims: 'Outcomes Linked to Aims',
  // statistical_analysis_plan
  analysis_present: 'Analysis Present',
  power_analysis: 'Power Analysis',
  multiple_comparisons: 'Multiple Comparisons',
  metrics_defined: 'Metrics Defined',
  analysis_matches_design: 'Analysis Matches Design',
  // feasibility_and_execution
  recruitment_feasible: 'Recruitment Feasible',
  procedures_feasible: 'Procedures Feasible',
  timeline_milestones: 'Timeline & Milestones',
  team_environment: 'Team & Environment',
  ethics_data_quality: 'Ethics & Data Quality',
  // scientific_impact
  advances_understanding: 'Advances Understanding',
  generalizability: 'Generalizability',
  opens_new_directions: 'Opens New Directions',
  // clinical_or_translational_impact
  clinical_pathway: 'Clinical Pathway',
  unmet_need: 'Unmet Need',
  milestones_defined: 'Milestones Defined',
  // societal_and_broader_impact
  societal_challenge: 'Societal Challenge',
  public_communication: 'Public Communication',
  commercial_potential: 'Commercial Potential',
};

export function humanizeItemKey(key: string): string {
  return (
    ITEM_LABELS[key] ||
    key
      .split('_')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')
  );
}
