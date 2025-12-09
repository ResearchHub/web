import { UserVoteType } from './reaction';
import { DeviceType } from '@/hooks/useDeviceType';
import { DocumentType } from '@/services/reaction.service';
import { FeedEntry } from './feed';
import { Work } from './work';
import { TabType } from '@/components/work/WorkTabs';
import {
  mapAppContentTypeToApiType,
  mapAppFeedContentTypeToApiType,
} from '@/utils/contentTypeMapping';
import { ID } from './root';

interface UserContext {
  user_id?: string;
  author_id?: string;
  editor?: boolean;
  moderator?: boolean;
}

interface BaseContext {
  device_type: DeviceType;
}

interface RelatedWork {
  id: ID;
  content_type: DocumentType;
  unified_document_id?: ID;
}

export type FeedSource =
  | 'home'
  | 'earn'
  | 'fund'
  | 'journal'
  | 'topic'
  | 'author'
  | 'search'
  | 'unknown';

export function getUnifiedDocumentId(entry: FeedEntry): ID {
  return entry.content.unifiedDocumentId || entry.relatedWork?.unifiedDocumentId;
}

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
  recommendation_id?: string | null;
  feed_ordering?: string;
  impression?: ID[];
}

// 3. Work Document Viewed
export interface WorkDocumentViewedEvent extends UserContext {
  related_work?: RelatedWork;
  tab?: string;
}

// 4. Document Tab Clicked
export interface DocumentTabClickedEvent extends UserContext, BaseContext {
  clicked_tab: TabType;
  related_work?: RelatedWork;
}

/**
 * Builds the payload for a feed item click event
 * @param entry - The feed entry that was clicked
 * @param options - Options for building the payload
 * @returns The FeedItemClickedEvent payload
 */
export function buildPayloadForFeedItemClick(
  entry: FeedEntry,
  options: {
    feedPosition?: number;
    feedSource: FeedSource;
    feedTab: string;
    deviceType: DeviceType;
    feedOrdering?: string;
    impression?: ID[];
  }
): FeedItemClickedEvent {
  const { feedPosition = 1, feedSource, feedTab, deviceType, feedOrdering, impression } = options;

  const payload: FeedItemClickedEvent = {
    device_type: deviceType,
    feed_position: feedPosition,
    feed_source: feedSource,
    feed_tab: feedTab,
    related_work: {
      id:
        'relatedDocumentId' in entry.content && entry.content.relatedDocumentId
          ? entry.content.relatedDocumentId
          : entry.content.id,
      content_type:
        'relatedDocumentContentType' in entry.content && entry.content.relatedDocumentContentType
          ? mapAppContentTypeToApiType(entry.content.relatedDocumentContentType)
          : mapAppFeedContentTypeToApiType(entry.content.contentType),
      unified_document_id: getUnifiedDocumentId(entry),
    },
    recommendation_id: entry.recommendationId,
    ...(feedOrdering && { feed_ordering: feedOrdering }),
    ...(impression && impression.length > 0 && { impression }),
  };

  return payload;
}

/**
 * Builds the payload for a document tab click event
 * @param work - The work document where the tab was clicked
 * @param options - Options for building the payload
 * @returns The DocumentTabClickedEvent payload
 */
export function buildPayloadForDocumentTabClick(
  work: Work,
  options: {
    clickedTab: TabType;
    deviceType: DeviceType;
  }
): DocumentTabClickedEvent {
  const { clickedTab, deviceType } = options;

  const payload: DocumentTabClickedEvent = {
    device_type: deviceType,
    clicked_tab: clickedTab,
    related_work: {
      id: work.id,
      content_type: mapAppContentTypeToApiType(work.contentType),
      unified_document_id: work.unifiedDocumentId,
    },
  };

  return payload;
}
