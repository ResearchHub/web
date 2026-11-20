import type { FeedContentType } from '@/types/feed';
import type { ContentType } from '@/types/work';

/** What a flag is filed against: the document, and the comment when it is one. */
export interface FlagTarget {
  documentId: string;
  contentType: ContentType;
  commentId?: string;
}

interface FlagTargetInput {
  feedContentType: FeedContentType;
  /** The item's own id: the document's, or the comment's for comments and bounties. */
  votableEntityId: number;
  relatedDocumentId?: string;
  relatedDocumentContentType?: ContentType;
}

/**
 * Comments and bounties are flagged as a comment on the document they belong to;
 * papers as papers; everything else as a post.
 */
export function getFlagTarget({
  feedContentType,
  votableEntityId,
  relatedDocumentId,
  relatedDocumentContentType,
}: FlagTargetInput): FlagTarget {
  let contentType: ContentType;
  let commentId: string | undefined;

  if (feedContentType === 'PAPER') {
    contentType = 'paper';
  } else if (feedContentType === 'POST' || feedContentType === 'PREREGISTRATION') {
    contentType = 'post';
  } else if (feedContentType === 'BOUNTY' && relatedDocumentContentType) {
    contentType = relatedDocumentContentType;
    commentId = votableEntityId.toString();
  } else if (feedContentType === 'COMMENT') {
    contentType = relatedDocumentContentType || 'post';
    commentId = votableEntityId.toString();
  } else {
    contentType = 'post';
  }

  const isOnDocument = feedContentType === 'COMMENT' || feedContentType === 'BOUNTY';

  return {
    documentId:
      isOnDocument && relatedDocumentId ? relatedDocumentId.toString() : votableEntityId.toString(),
    contentType,
    commentId,
  };
}
