export type ScoreBand = 'LOW' | 'MEDIUM' | 'HIGH';
export type ChecklistValue = 'NO' | 'PARTIAL' | 'YES';

export interface MockReviewer {
  id: string;
  fullName: string;
  profileImage: string | null;
  authorProfileId?: number;
}

export interface ChecklistHumanReview {
  reviewerId: string;
  agreesWithAi: boolean;
  note: string;
}

export interface ChecklistItemDefinition {
  id: string;
  label: string;
  aiValue: ChecklistValue;
  humanReviews: ChecklistHumanReview[];
}

export interface SubcategoryDefinition {
  id: string;
  title: string;
  summary: string;
  checklist: ChecklistItemDefinition[];
}

export interface CategoryDefinition {
  id: string;
  title: string;
  subcategories: SubcategoryDefinition[];
}

export interface AIProposalReviewMock {
  categories: CategoryDefinition[];
  reviewers: Record<string, MockReviewer>;
}

export interface UserChecklistValidation {
  value: ChecklistValue;
  note?: string;
}
