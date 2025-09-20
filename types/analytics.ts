import { TipContentType } from '@/services/transaction.service';
import { FeedContentType } from './feed';
import { UserVoteType, VotableContentType } from './reaction';
import { EntityType } from './search';
import { ContentType, FlagReasonKey } from './work';
import { DocumentType } from '@/services/reaction.service';

interface UserContext {
  user_id?: string;
  author_id?: string;
  editor?: boolean;
  moderator?: boolean;
}

interface RelatedWork {
  id: string;
  content_type: ContentType;
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
  document_type: DocumentType;
  content_type: VotableContentType;
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

// 8. Fundraise Submitted
export interface FundraiseSubmittedEvent extends UserContext {
  fundraise_id: string;
  work_id: string;
  fundraise_amount: number;
}

// 9. Content Shared
export interface ContentSharedEvent extends UserContext {
  content_type: ContentType;
  work_id: string;
}
