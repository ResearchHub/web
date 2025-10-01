import { CommentType } from './comment';
import { FeedContentType } from './feed';
import { UserVoteType } from './reaction';
import { ContentType } from './work';
import { DeviceType } from '@/hooks/useDeviceType';

interface UserContext {
  user_id?: string;
  author_id?: string;
  editor?: boolean;
  moderator?: boolean;
}

interface BaseContext {
  device_type: DeviceType;
}

interface TopicBasic {
  id?: string;
  name?: string;
  slug?: string;
}

interface RelatedWork {
  id: string;
  content_type: ContentType | FeedContentType;
  topics?: TopicBasic[];
  unified_document_id?: string;
  primary_topic?: TopicBasic;
  secondary_topic?: TopicBasic;
}

export type FeedSource = 'home' | 'earn' | 'fund' | 'journal' | 'topic' | 'author' | 'unknown';

// 1. Vote Action
export interface VoteActionEvent extends UserContext, BaseContext {
  vote_type: UserVoteType;
  related_work?: RelatedWork;
}

// 2. Feed Item Clicked
export interface FeedItemClickedEvent extends UserContext, BaseContext {
  feed_position: number;
  feed_source: FeedSource;
  feed_tab: string;
  related_work?: RelatedWork;
}

// 3. Proposal Funded
export interface ProposalFundedEvent extends UserContext, BaseContext {
  fundraise_id: string;
  amount?: number;
  currency?: string;
  related_work?: RelatedWork;
}

// 4. Comment Created
export interface CommentCreatedEvent extends UserContext, BaseContext {
  thread_id: string;
  parent_id?: string;
  bounty_amount?: number;
  bounty_type?: CommentType;
  comment_type: CommentType;
  related_work?: RelatedWork;
}

// 5. Peer Review Created
export interface PeerReviewCreatedEvent extends UserContext, BaseContext {
  comment_id: string;
  score: number;
  related_work?: RelatedWork;
}
