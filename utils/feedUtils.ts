import { Comment } from '@/types/comment';
import { FeedEntry, FeedCommentContent, FeedBountyContent } from '@/types/feed';

/**
 * Extracts a Comment object from a FeedEntry
 * @param entry The FeedEntry to extract the comment from
 * @returns The Comment object or null if the entry doesn't contain a comment
 */
export const getCommentFromFeedEntry = (entry: FeedEntry): Comment | null => {
  if (entry.contentType === 'COMMENT') {
    return (entry.content as FeedCommentContent).comment;
  } else if (entry.contentType === 'BOUNTY') {
    const bountyContent = entry.content as FeedBountyContent;
    return {
      id: bountyContent.id,
      content: bountyContent.comment.content,
      contentFormat: bountyContent.comment.contentFormat,
      createdDate: bountyContent.createdDate,
      updatedDate: bountyContent.createdDate,
      author: bountyContent.createdBy,
      score: entry.metrics?.votes || 0,
      replies: [],
      childrenCount: 0,
      commentType: bountyContent.comment.commentType,
      bounties: [bountyContent.bounty],
      thread: {
        id: 0,
        threadType: bountyContent.relatedDocumentContentType || 'PAPER',
        privacyType: 'PUBLIC',
        objectId: bountyContent.relatedDocumentId || 0,
        raw: null,
      },
      userVote: entry.userVote,
      raw: null,
    } as Comment;
  }
  return null;
};

/**
 * Creates a FeedEntry from a Comment object
 * @param comment The Comment object to convert to a FeedEntry
 * @returns A FeedEntry object
 */
export const createFeedEntryFromComment = (comment: Comment): FeedEntry => {
  if (comment.commentType === 'BOUNTY' && comment.bounties && comment.bounties.length > 0) {
    // Create a bounty feed entry
    const bounty = comment.bounties[0];
    const feedEntry: FeedEntry = {
      id: `bounty-${comment.id}`,
      timestamp: comment.createdDate,
      action: 'open',
      contentType: 'BOUNTY',
      content: {
        id: comment.id,
        contentType: 'BOUNTY',
        createdDate: comment.createdDate,
        bounty: bounty,
        createdBy: comment.author,
        relatedDocumentId: comment.thread?.objectId,
        relatedDocumentContentType: comment.thread?.threadType as any,
        comment: {
          content: comment.content,
          contentFormat: comment.contentFormat || 'TIPTAP',
          commentType: comment.commentType,
          id: comment.id,
        },
      },
      metrics: {
        votes: comment.score || 0,
        comments: comment.childrenCount || 0,
        saves: 0,
      },
      userVote: comment.userVote,
    };
    return feedEntry;
  } else {
    // Create a regular comment feed entry
    const feedEntry: FeedEntry = {
      id: `comment-${comment.id}`,
      timestamp: comment.createdDate,
      action: 'contribute',
      contentType: 'COMMENT',
      content: {
        id: comment.id,
        contentType: 'COMMENT',
        createdDate: comment.createdDate,
        comment: comment,
        createdBy: comment.author,
      },
      metrics: {
        votes: comment.score || 0,
        comments: comment.childrenCount || 0,
        saves: 0,
      },
      userVote: comment.userVote,
    };
    return feedEntry;
  }
};

/**
 * Updates a FeedEntry with a new Comment object
 * @param entry The FeedEntry to update
 * @param comment The new Comment object
 * @returns The updated FeedEntry
 */
export const updateFeedEntryWithComment = (entry: FeedEntry, comment: Comment): FeedEntry => {
  if (entry.contentType === 'COMMENT') {
    return {
      ...entry,
      content: {
        ...(entry.content as FeedCommentContent),
        comment,
      } as FeedCommentContent,
      metrics: {
        votes: comment.score || 0,
        comments: comment.childrenCount || 0,
        saves: entry.metrics?.saves || 0,
      },
      userVote: comment.userVote,
    };
  } else if (entry.contentType === 'BOUNTY') {
    const bountyContent = entry.content as FeedBountyContent;
    return {
      ...entry,
      content: {
        ...bountyContent,
        bounty: comment.bounties?.[0] || bountyContent.bounty,
        comment: {
          content: comment.content,
          contentFormat: comment.contentFormat || bountyContent.comment.contentFormat,
          commentType: comment.commentType || bountyContent.comment.commentType,
          id: comment.id,
        },
      } as FeedBountyContent,
      metrics: {
        votes: comment.score || 0,
        comments: comment.childrenCount || 0,
        saves: entry.metrics?.saves || 0,
      },
      userVote: comment.userVote,
    };
  }
  return entry;
};
