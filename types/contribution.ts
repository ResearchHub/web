import { ID } from './root';
import { FeedEntry, FeedActionType, FeedContentType, transformFeedEntry } from './feed';
import { transformAuthorProfile } from './authorProfile';
import { transformTopic } from './topic';
import { transformBounty } from './bounty';
import { transformComment } from './comment';
import { transformPost, Work } from './work';
import { ContributionType } from '@/services/contribution.service';

export interface Hub {
  id: ID;
  name: string;
  hub_image: string;
  slug: string;
}

export interface AuthorProfile {
  id: ID;
  profile_image: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
}

export interface User {
  id: ID;
  first_name: string;
  last_name: string;
  author_profile: AuthorProfile;
}

export interface ContentType {
  id: ID;
  name: string;
}

export interface ContributionItem {
  id: ID;
  // This can be one of several types as mentioned in the backend description
  // We'll use a generic type here since the actual structure depends on the content type
  [key: string]: any;
}

export interface Contribution {
  id: ID;
  content_type: ContentType;
  created_by: User;
  created_date: string;
  hubs: Hub[];
  item: ContributionItem;
}

export interface ContributionListResponse {
  count: number | null;
  next: string | null;
  previous: string | null;
  results: Contribution[];
}

// Helper function to determine FeedActionType based on content type
const getActionType = (contentType: string): FeedActionType => {
  switch (contentType.toLowerCase()) {
    case 'bounty':
      return 'open';
    case 'rhcommentmodel':
      return 'contribute';
    case 'researchhubpost':
      return 'post';
    case 'paper':
      return 'publish';
    default:
      return 'contribute';
  }
};

// Helper function to determine FeedContentType based on content type
const getContentType = (contentType: string): FeedContentType => {
  switch (contentType.toLowerCase()) {
    case 'bounty':
      return 'BOUNTY';
    case 'rhcommentmodel':
      return 'COMMENT';
    case 'researchhubpost':
      return 'POST';
    case 'paper':
      return 'PAPER';
    default:
      return 'POST';
  }
};

const transformUnifiedDocumentToWork = ({ raw, hubs }: { raw: any; hubs: Hub[] }): Work => {
  const contentType =
    raw.unified_document?.document_type === 'PAPER'
      ? 'paper'
      : raw.unified_document?.document_type === 'PREREGISTRATION'
        ? 'preregistration'
        : 'post';
  const relatedUnifiedDocument =
    contentType === 'paper' ? raw.unified_document?.documents : raw.unified_document?.documents[0];

  return {
    id: raw.id,
    contentType: contentType,
    title: relatedUnifiedDocument?.title,
    slug: relatedUnifiedDocument?.slug,
    createdDate: raw.created_date,
    authors: [],
    abstract: relatedUnifiedDocument?.renderable_text,
    topics: hubs.map((hub) => transformTopic(hub)),
    formats: [], // TODO we need formats here
    figures: [], // TODO we need figures here
  };
};

// Transform a contribution to a FeedEntry
export const transformContributionToFeedEntry = ({
  contribution,
  contributionType,
}: {
  contribution: Contribution;
  contributionType?: ContributionType;
}): FeedEntry => {
  const { content_type, created_by, created_date, hubs, item } = contribution;

  // Base feed entry properties
  const baseFeedEntry: Partial<FeedEntry> = {
    id: contribution.item.id?.toString() || '',
    timestamp: created_date,
    action: getActionType(content_type.name),
    contentType: getContentType(content_type.name),
  };

  // Transform content based on content type
  let content: any;
  let relatedWork: any;

  switch (content_type.name.toLowerCase()) {
    case 'bounty':
      // Handle bounty content
      content = {
        id: item.id,
        contentType: 'BOUNTY',
        createdDate: created_date,
        bounty: {
          ...transformBounty({
            ...item,
            created_by: created_by,
            amount: item.amount,
            content: item.item?.comment_content_json,
          }),
          expirationDate: item.expiration_date,
        },
        createdBy: transformAuthorProfile(created_by.author_profile),
        relatedDocumentId: item.item?.thread?.content_object?.id,
        relatedDocumentContentType:
          item.item?.thread?.content_object?.unified_document?.document_type,
        comment: {
          id: item.item?.id,
          content: item.item?.comment_content_json,
          contentFormat: 'TIPTAP',
          commentType: 'BOUNTY',
        },
      };

      // Set related work if available
      if (item.item?.thread?.content_object) {
        relatedWork = transformUnifiedDocumentToWork({
          raw: item.item?.thread?.content_object,
          hubs,
        });
      }

      break;

    case 'rhcommentmodel':
      // Handle comment content
      content = {
        id: item.id,
        contentType: 'COMMENT',
        createdDate: created_date,
        createdBy: transformAuthorProfile(created_by.author_profile),
        comment: {
          id: item.id,
          content: item.comment_content_json,
          contentFormat: 'TIPTAP',
          commentType:
            contributionType === 'REVIEW'
              ? 'REVIEW'
              : item.thread?.thread_type || 'GENERIC_COMMENT',
          thread: item.thread
            ? {
                id: item.thread.content_object.id,
                threadType: item.thread.thread_type,
                objectId: item.thread.content_object.id,
              }
            : undefined,
        },
        relatedDocumentId: item.thread?.content_object?.id,
        relatedDocumentContentType: item.thread?.content_object?.unified_document?.document_type,
      };

      // Set related work if available
      if (item.thread?.content_object) {
        relatedWork = transformUnifiedDocumentToWork({
          raw: item.thread.content_object,
          hubs,
        });
      }
      break;

    case 'researchhubpost':
      // Handle post content
      content = {
        id: item.id,
        contentType: 'POST',
        createdDate: created_date,
        textPreview: item.renderable_text || '',
        slug: item.slug,
        title: item.title,
        authors: [transformAuthorProfile(created_by.author_profile)],
        topics: hubs.map((hub) => transformTopic(hub)),
        createdBy: transformAuthorProfile(created_by.author_profile),
      };
      break;

    case 'paper':
      // Handle paper content
      content = {
        id: item.id,
        contentType: 'PAPER',
        createdDate: created_date,
        textPreview: item.abstract || '',
        slug: item.slug,
        title: item.title,
        authors: [transformAuthorProfile(created_by.author_profile)],
        topics: hubs.map((hub) => transformTopic(hub)),
        createdBy: transformAuthorProfile(created_by.author_profile),
        journal: item.journal || {
          id: 0,
          name: '',
          slug: '',
          image: null,
          description: '',
        },
      };
      break;

    default:
      console.warn(`Unsupported content type: ${content_type.name}`);
      break;
  }

  // Complete the feed entry
  return {
    ...baseFeedEntry,
    content,
    relatedWork,
    metrics: undefined,
  } as FeedEntry;
};

// Transform a list of contributions to FeedEntries
export const transformContributionsToFeedEntries = (contributions: Contribution[]): FeedEntry[] => {
  return contributions
    .map((contribution) =>
      transformContributionToFeedEntry({
        contribution,
      })
    )
    .filter((entry): entry is FeedEntry => entry !== null);
};

// Transform a ContributionListResponse to FeedEntries
export const transformContributionListResponseToFeedEntries = (
  response: ContributionListResponse
): { entries: FeedEntry[]; next: string | null; previous: string | null; count: number | null } => {
  return {
    entries: transformContributionsToFeedEntries(response.results),
    next: response.next,
    previous: response.previous,
    count: response.count,
  };
};
