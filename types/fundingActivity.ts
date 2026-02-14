import { ID } from './root';
import { AuthorProfile } from './authorProfile';

export type FundingActivityType = 
  | 'peer_review'
  | 'comment'
  | 'project_update'
  | 'funding_contribution';

export interface FundingActivity {
  id: ID;
  type: FundingActivityType;
  createdDate: string;
  actor: AuthorProfile;
  // Context about what the activity is related to
  targetTitle: string;
  targetId: ID;
  targetType: 'fundraise' | 'grant';
  // Type-specific data
  reviewScore?: number; // For peer reviews (1-10)
  commentPreview?: string; // For comments
  updateTitle?: string; // For project updates
  contributionAmount?: {
    usd: number;
    rsc: number;
  }; // For funding contributions
  // Grant context (which grant/opportunity this belongs to)
  grantId?: ID;
  grantTitle?: string;
}
