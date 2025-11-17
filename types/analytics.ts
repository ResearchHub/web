import { UserVoteType } from './reaction';
import { DeviceType } from '@/hooks/useDeviceType';
import { DocumentType } from '@/services/reaction.service';
import { FeedEntry } from './feed';
import {
  mapAppContentTypeToApiType,
  mapAppFeedContentTypeToApiType,
} from '@/utils/contentTypeMapping';

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
  content_type: DocumentType;
  unified_document_id?: string;
}

export type FeedSource = 'home' | 'earn' | 'fund' | 'journal' | 'topic' | 'author' | 'unknown';

/**
 * Extracts the unified document ID from a feed entry.
 * Checks entry.content.unifiedDocumentId first, then falls back to entry.relatedWork?.unifiedDocumentId.
 *
 * @param entry - The feed entry to extract the unified document ID from
 * @returns The unified document ID as a string, or empty string if not found
 */
export function getUnifiedDocumentId(entry: FeedEntry): string {
  return entry.content.unifiedDocumentId || entry.relatedWork?.unifiedDocumentId?.toString() || '';
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
  experiment_name?: string;
  experiment_variant?: string;
  feed_ordering?: string;
  impression?: string[];
}

// 3. Work Document Viewed
export interface WorkDocumentViewedEvent extends UserContext {
  related_work?: RelatedWork;
  tab?: string;
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
    experimentVariant?: string;
    feedOrdering?: string;
    impression?: string[];
  }
): FeedItemClickedEvent {
  const {
    feedPosition = 1,
    feedSource,
    feedTab,
    deviceType,
    experimentVariant,
    feedOrdering,
    impression,
  } = options;

  const payload: FeedItemClickedEvent = {
    device_type: deviceType,
    feed_position: feedPosition,
    feed_source: feedSource,
    feed_tab: feedTab,
    related_work: {
      id:
        'relatedDocumentId' in entry.content && entry.content.relatedDocumentId
          ? entry.content.relatedDocumentId.toString()
          : entry.content.id?.toString() || '',
      content_type:
        'relatedDocumentContentType' in entry.content && entry.content.relatedDocumentContentType
          ? mapAppContentTypeToApiType(entry.content.relatedDocumentContentType)
          : mapAppFeedContentTypeToApiType(entry.content.contentType),
      unified_document_id: getUnifiedDocumentId(entry),
    },
    recommendation_id: entry.recommendationId,
    // Track experiment data for following feed
    ...(experimentVariant &&
      feedTab === 'following' && {
        experiment_name: 'following_feed_ordering',
        experiment_variant: experimentVariant,
        feed_ordering: feedOrdering,
      }),
    // Include impressions if provided
    ...(impression && impression.length > 0 && { impression }),
  };

  return payload;
}
