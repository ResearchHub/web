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

export type FeedSource = 'home' | 'earn' | 'fund' | 'journal' | 'topic' | 'unknown';

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
  experiment_name?: string;
  experiment_variant?: string;
  feed_ordering?: string;
}
