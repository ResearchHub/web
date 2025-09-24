import { TipContentType } from '@/services/transaction.service';
import { FeedContentType } from './feed';
import { UserVoteType, VotableContentType } from './reaction';
import { EntityType } from './search';
import { ContentType, FlagReasonKey } from './work';
import { DocumentType } from '@/services/reaction.service';
import { Currency } from './root';

interface UserContext {
  user_id?: string;
  author_id?: string;
  editor?: boolean;
  moderator?: boolean;
}

interface RelatedWork {
  id: string;
  content_type: ContentType;
  topic_ids: string[];
}

type FeedImpressionType = 'INITIAL' | 'DISPLAYED';

// 1. Feed Impression Tracking
export interface FeedImpressionEvent extends UserContext {
  impression_type: FeedImpressionType;
  items: Array<{
    content_type: FeedContentType;
    id: string;
    related_work?: RelatedWork;
  }>;
}

// 2. Vote Action
export interface VoteActionEvent extends UserContext {
  vote_type: UserVoteType;
  related_work?: RelatedWork;
}

// 3. Tip Submitted
export interface TipSubmittedEvent extends UserContext {
  target_type: TipContentType;
  related_work?: RelatedWork;
}

type FlagTargetType = 'document' | 'comment';

// 4. Content Flagged
export interface ContentFlaggedEvent extends UserContext {
  target_type: FlagTargetType;
  related_work?: RelatedWork;
  flag_reason: FlagReasonKey;
}

// 5. Search Suggestion Clicked
export interface SearchSuggestionClickedEvent extends UserContext {
  suggestion_type: EntityType;
  suggestion_id: string;
}

// 6. Topic Badge Clicked
export interface TopicBadgeClickedEvent extends UserContext {
  slug: string;
}

type WorkInteractionType = 'doi_clicked' | 'pdf_downloaded';
// 7. Work Interaction
export interface WorkInteractionEvent extends UserContext {
  interaction_type: WorkInteractionType;
  work_id: string;
  content_type: ContentType;
  link_url?: string;
}

// 8. Proposal Funded
export interface ProposalFundedEvent extends UserContext {
  fundraise_id: string;
  work_id: string;
  fundraise_amount: number;
}

// 9. Content Shared
export interface ContentSharedEvent extends UserContext {
  content_type: ContentType;
  work_id: string;
}

// 10. Work Document Viewed
export interface WorkDocumentViewedEvent extends UserContext {
  content_type: ContentType;
  work_id: string;
  work_slug?: string;
}

// 11. Request for Proposal Created
export interface RequestForProposalCreatedEvent extends UserContext {
  available_amount: number;
  currency: Currency;
  deadline_days: number;
  application_deadline: string;
  related_work?: RelatedWork;
}

// 12. Proposal Created
export interface ProposalCreatedEvent extends UserContext {
  requested_amount: number;
  currency: Currency;
  related_work?: RelatedWork;
}

// 13. Request for Proposal Applied
export interface RequestForProposalAppliedEvent extends UserContext {
  proposal: {
    related_work?: RelatedWork;
  };
  days_since_rfp_posted: number;
  related_work?: RelatedWork;
}
