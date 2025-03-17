import { Comment, CommentFilter, CommentSort } from '@/types/comment';
import { BountyFilterType } from './CommentContext';
import { FeedEntry, FeedCommentContent, FeedBountyContent } from '@/types/feed';
import { getCommentFromFeedEntry, updateFeedEntryWithComment } from '@/utils/feedUtils';

// Define the state shape
export interface CommentState {
  feedEntries: FeedEntry[];
  count: number;
  loading: boolean;
  error: string | null;
  page: number;
  sortBy: CommentSort;
  filter?: CommentFilter;
  bountyFilter: BountyFilterType;
  editingCommentId: number | null;
  replyingToCommentId: number | null;
}

// Define action types
export enum CommentActionType {
  SET_COMMENTS = 'SET_COMMENTS',
  ADD_COMMENT = 'ADD_COMMENT',
  UPDATE_COMMENT = 'UPDATE_COMMENT',
  REMOVE_COMMENT = 'REMOVE_COMMENT',
  SET_COUNT = 'SET_COUNT',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_PAGE = 'SET_PAGE',
  SET_SORT_BY = 'SET_SORT_BY',
  SET_FILTER = 'SET_FILTER',
  SET_BOUNTY_FILTER = 'SET_BOUNTY_FILTER',
  SET_EDITING_COMMENT_ID = 'SET_EDITING_COMMENT_ID',
  SET_REPLYING_TO_COMMENT_ID = 'SET_REPLYING_TO_COMMENT_ID',
  RESET_STATE = 'RESET_STATE',
  ADD_REPLY = 'ADD_REPLY',
  UPDATE_COMMENT_VOTE = 'UPDATE_COMMENT_VOTE',
  REVERT_OPTIMISTIC_UPDATE = 'REVERT_OPTIMISTIC_UPDATE',

  // Additional action types for async operations
  FETCH_COMMENTS_START = 'FETCH_COMMENTS_START',
  FETCH_COMMENTS_SUCCESS = 'FETCH_COMMENTS_SUCCESS',
  FETCH_COMMENTS_FAILURE = 'FETCH_COMMENTS_FAILURE',
  FETCH_MORE_COMMENTS_SUCCESS = 'FETCH_MORE_COMMENTS_SUCCESS',
  REFRESH = 'REFRESH',
  LOAD_MORE = 'LOAD_MORE',
  FORCE_REFRESH = 'FORCE_REFRESH',
  FORCE_REFRESH_SUCCESS = 'FORCE_REFRESH_SUCCESS',
  FORCE_REFRESH_FAILURE = 'FORCE_REFRESH_FAILURE',
  LOAD_MORE_REPLIES_START = 'LOAD_MORE_REPLIES_START',
  LOAD_MORE_REPLIES_SUCCESS = 'LOAD_MORE_REPLIES_SUCCESS',
  LOAD_MORE_REPLIES_FAILURE = 'LOAD_MORE_REPLIES_FAILURE',
  CREATE_COMMENT_START = 'CREATE_COMMENT_START',
  CREATE_COMMENT_SUCCESS = 'CREATE_COMMENT_SUCCESS',
  CREATE_REPLY_START = 'CREATE_REPLY_START',
  CREATE_REPLY_SUCCESS = 'CREATE_REPLY_SUCCESS',
  UPDATE_COMMENT_START = 'UPDATE_COMMENT_START',
  UPDATE_COMMENT_SUCCESS = 'UPDATE_COMMENT_SUCCESS',
  DELETE_COMMENT_START = 'DELETE_COMMENT_START',
  DELETE_COMMENT_SUCCESS = 'DELETE_COMMENT_SUCCESS',
}

// Define action interfaces
interface SetCommentsAction {
  type: CommentActionType.SET_COMMENTS;
  payload: FeedEntry[];
}

interface AddCommentAction {
  type: CommentActionType.ADD_COMMENT;
  payload: FeedEntry;
}

interface UpdateCommentAction {
  type: CommentActionType.UPDATE_COMMENT;
  payload: FeedEntry;
}

interface RemoveCommentAction {
  type: CommentActionType.REMOVE_COMMENT;
  payload: number; // comment ID
}

interface SetCountAction {
  type: CommentActionType.SET_COUNT;
  payload: number;
}

interface SetLoadingAction {
  type: CommentActionType.SET_LOADING;
  payload: boolean;
}

interface SetErrorAction {
  type: CommentActionType.SET_ERROR;
  payload: string | null;
}

interface SetPageAction {
  type: CommentActionType.SET_PAGE;
  payload: number;
}

interface SetSortByAction {
  type: CommentActionType.SET_SORT_BY;
  payload: CommentSort;
}

interface SetFilterAction {
  type: CommentActionType.SET_FILTER;
  payload: CommentFilter | undefined;
}

interface SetBountyFilterAction {
  type: CommentActionType.SET_BOUNTY_FILTER;
  payload: BountyFilterType;
}

interface SetEditingCommentIdAction {
  type: CommentActionType.SET_EDITING_COMMENT_ID;
  payload: number | null;
}

interface SetReplyingToCommentIdAction {
  type: CommentActionType.SET_REPLYING_TO_COMMENT_ID;
  payload: number | null;
}

interface ResetStateAction {
  type: CommentActionType.RESET_STATE;
}

interface AddReplyAction {
  type: CommentActionType.ADD_REPLY;
  payload: {
    parentId: number;
    reply: FeedEntry;
  };
}

interface UpdateCommentVoteAction {
  type: CommentActionType.UPDATE_COMMENT_VOTE;
  payload: {
    commentId: number;
    updatedComment: Partial<FeedEntry>;
  };
}

interface RevertOptimisticUpdateAction {
  type: CommentActionType.REVERT_OPTIMISTIC_UPDATE;
  payload: number; // comment ID
}

interface FetchCommentsStartAction {
  type: CommentActionType.FETCH_COMMENTS_START;
}

interface FetchCommentsSuccessAction {
  type: CommentActionType.FETCH_COMMENTS_SUCCESS;
  payload: {
    feedEntries: FeedEntry[];
    count: number;
  };
}

interface FetchCommentsFailureAction {
  type: CommentActionType.FETCH_COMMENTS_FAILURE;
  payload: {
    error: string;
  };
}

interface FetchMoreCommentsSuccessAction {
  type: CommentActionType.FETCH_MORE_COMMENTS_SUCCESS;
  payload: {
    feedEntries: FeedEntry[];
    count: number;
  };
}

interface RefreshAction {
  type: CommentActionType.REFRESH;
}

interface LoadMoreAction {
  type: CommentActionType.LOAD_MORE;
  payload: {
    page: number;
  };
}

interface ForceRefreshAction {
  type: CommentActionType.FORCE_REFRESH;
}

interface ForceRefreshSuccessAction {
  type: CommentActionType.FORCE_REFRESH_SUCCESS;
  payload: {
    feedEntries: FeedEntry[];
    count: number;
  };
}

interface ForceRefreshFailureAction {
  type: CommentActionType.FORCE_REFRESH_FAILURE;
  payload: {
    error: string;
  };
}

interface LoadMoreRepliesStartAction {
  type: CommentActionType.LOAD_MORE_REPLIES_START;
}

interface LoadMoreRepliesSuccessAction {
  type: CommentActionType.LOAD_MORE_REPLIES_SUCCESS;
  payload: {
    commentId: number;
    feedEntries: FeedEntry[];
  };
}

interface LoadMoreRepliesFailureAction {
  type: CommentActionType.LOAD_MORE_REPLIES_FAILURE;
  payload: {
    error: string;
  };
}

interface CreateCommentStartAction {
  type: CommentActionType.CREATE_COMMENT_START;
}

interface CreateCommentSuccessAction {
  type: CommentActionType.CREATE_COMMENT_SUCCESS;
  payload: {
    comment: FeedEntry;
  };
}

interface CreateReplyStartAction {
  type: CommentActionType.CREATE_REPLY_START;
}

interface CreateReplySuccessAction {
  type: CommentActionType.CREATE_REPLY_SUCCESS;
  payload: {
    reply: FeedEntry;
  };
}

interface UpdateCommentStartAction {
  type: CommentActionType.UPDATE_COMMENT_START;
}

interface UpdateCommentSuccessAction {
  type: CommentActionType.UPDATE_COMMENT_SUCCESS;
  payload: {
    comment: FeedEntry;
  };
}

interface DeleteCommentStartAction {
  type: CommentActionType.DELETE_COMMENT_START;
}

interface DeleteCommentSuccessAction {
  type: CommentActionType.DELETE_COMMENT_SUCCESS;
  payload: {
    comment: FeedEntry;
  };
}

export type CommentAction =
  | SetCommentsAction
  | AddCommentAction
  | UpdateCommentAction
  | RemoveCommentAction
  | SetCountAction
  | SetLoadingAction
  | SetErrorAction
  | SetPageAction
  | SetSortByAction
  | SetFilterAction
  | SetBountyFilterAction
  | SetEditingCommentIdAction
  | SetReplyingToCommentIdAction
  | ResetStateAction
  | AddReplyAction
  | UpdateCommentVoteAction
  | RevertOptimisticUpdateAction
  | FetchCommentsStartAction
  | FetchCommentsSuccessAction
  | FetchCommentsFailureAction
  | FetchMoreCommentsSuccessAction
  | RefreshAction
  | LoadMoreAction
  | ForceRefreshAction
  | ForceRefreshSuccessAction
  | ForceRefreshFailureAction
  | LoadMoreRepliesStartAction
  | LoadMoreRepliesSuccessAction
  | LoadMoreRepliesFailureAction
  | CreateCommentStartAction
  | CreateCommentSuccessAction
  | CreateReplyStartAction
  | CreateReplySuccessAction
  | UpdateCommentStartAction
  | UpdateCommentSuccessAction
  | DeleteCommentStartAction
  | DeleteCommentSuccessAction;

// Initial state
export const initialCommentState: CommentState = {
  feedEntries: [],
  count: 0,
  loading: true,
  error: null,
  page: 1,
  sortBy: 'BEST',
  filter: undefined,
  bountyFilter: 'ALL',
  editingCommentId: null,
  replyingToCommentId: null,
};

// Helper function to get comment ID from a FeedEntry
export const getCommentIdFromFeedEntry = (entry: FeedEntry): number => {
  if (entry.contentType === 'COMMENT') {
    return (entry.content as FeedCommentContent).comment.id;
  } else if (entry.contentType === 'BOUNTY') {
    return (entry.content as FeedBountyContent).id;
  }
  return 0;
};

// Helper function to find a FeedEntry by comment ID
export const findFeedEntryByCommentId = (
  feedEntries: FeedEntry[],
  commentId: number
): FeedEntry | undefined => {
  return feedEntries.find((entry) => {
    const entryCommentId = getCommentIdFromFeedEntry(entry);
    return entryCommentId === commentId;
  });
};

// Helper function to add a reply to a parent comment in the feed entries
const addReplyToFeedEntries = (
  feedEntries: FeedEntry[],
  parentId: number,
  reply: FeedEntry
): FeedEntry[] => {
  // Find the parent feed entry
  const parentEntry = findFeedEntryByCommentId(feedEntries, parentId);
  if (!parentEntry) return feedEntries;

  // Extract the parent comment
  const parentComment = getCommentFromFeedEntry(parentEntry);
  if (!parentComment) return feedEntries;

  // Extract the reply comment
  const replyComment = getCommentFromFeedEntry(reply);
  if (!replyComment) return feedEntries;

  // Add the reply to the parent comment's replies
  const updatedParentComment = {
    ...parentComment,
    replies: [...(parentComment.replies || []), replyComment],
    childrenCount: (parentComment.childrenCount || 0) + 1,
  };

  // Update the parent feed entry with the updated comment
  const updatedParentEntry = updateFeedEntryWithComment(parentEntry, updatedParentComment);

  // Return the updated feed entries
  return feedEntries.map((entry) =>
    getCommentIdFromFeedEntry(entry) === parentId ? updatedParentEntry : entry
  );
};

// Helper function to update a comment's vote in the feed entries
const updateCommentVoteInFeedEntries = (
  feedEntries: FeedEntry[],
  commentId: number,
  updatedComment: Partial<FeedEntry>
): FeedEntry[] => {
  // Find the feed entry to update
  const feedEntry = findFeedEntryByCommentId(feedEntries, commentId);
  if (!feedEntry) return feedEntries;

  // Extract the comment
  const comment = getCommentFromFeedEntry(feedEntry);
  if (!comment) return feedEntries;

  // Update the comment with the new vote
  const updatedCommentObj = {
    ...comment,
    userVote: updatedComment.userVote,
  };

  // Update the feed entry with the updated comment
  const updatedEntry = updateFeedEntryWithComment(feedEntry, updatedCommentObj);

  // Return the updated feed entries
  return feedEntries.map((entry) =>
    getCommentIdFromFeedEntry(entry) === commentId ? updatedEntry : entry
  );
};

// Helper function to revert an optimistic update in the feed entries
const revertOptimisticUpdateInFeedEntries = (
  feedEntries: FeedEntry[],
  commentId: number
): FeedEntry[] => {
  // Find the feed entry to revert
  const feedEntry = findFeedEntryByCommentId(feedEntries, commentId);
  if (!feedEntry) return feedEntries;

  // Extract the comment
  const comment = getCommentFromFeedEntry(feedEntry);
  if (!comment || !comment.metadata?.originalContent) return feedEntries;

  // Revert the comment to its original content
  const revertedComment = {
    ...comment,
    content: comment.metadata.originalContent,
    metadata: {
      ...comment.metadata,
      isOptimisticUpdate: false,
      originalContent: undefined,
    },
  };

  // Update the feed entry with the reverted comment
  const revertedEntry = updateFeedEntryWithComment(feedEntry, revertedComment);

  // Return the updated feed entries
  return feedEntries.map((entry) =>
    getCommentIdFromFeedEntry(entry) === commentId ? revertedEntry : entry
  );
};

// Helper function to update a comment with more replies
const updateFeedEntriesWithMoreReplies = (
  feedEntries: FeedEntry[],
  commentId: number,
  newReplies: FeedEntry[]
): FeedEntry[] => {
  // Find the feed entry to update
  const feedEntry = findFeedEntryByCommentId(feedEntries, commentId);
  if (!feedEntry) return feedEntries;

  // Extract the comment
  const comment = getCommentFromFeedEntry(feedEntry);
  if (!comment) return feedEntries;

  // Extract the new reply comments
  const newReplyComments = newReplies
    .map((entry) => getCommentFromFeedEntry(entry))
    .filter(Boolean) as Comment[];

  // Filter out any replies that are already in the comment's replies array
  const existingReplyIds = new Set(comment.replies.map((reply) => reply.id));
  const filteredNewReplies = newReplyComments.filter((reply) => !existingReplyIds.has(reply.id));

  if (filteredNewReplies.length === 0) {
    return feedEntries;
  }

  // Update the comment with the new replies
  const updatedComment = {
    ...comment,
    replies: [...comment.replies, ...filteredNewReplies],
  };

  // Update the feed entry with the updated comment
  const updatedEntry = updateFeedEntryWithComment(feedEntry, updatedComment);

  // Return the updated feed entries
  return feedEntries.map((entry) =>
    getCommentIdFromFeedEntry(entry) === commentId ? updatedEntry : entry
  );
};

// Reducer function
export const commentReducer = (state: CommentState, action: CommentAction): CommentState => {
  switch (action.type) {
    case CommentActionType.SET_COMMENTS:
      return {
        ...state,
        feedEntries: action.payload,
      };
    case CommentActionType.ADD_COMMENT:
      return {
        ...state,
        feedEntries: [action.payload, ...state.feedEntries],
        count: state.count + 1,
      };
    case CommentActionType.UPDATE_COMMENT:
      return {
        ...state,
        feedEntries: state.feedEntries.map((entry) => {
          const entryCommentId = getCommentIdFromFeedEntry(entry);
          const payloadCommentId = getCommentIdFromFeedEntry(action.payload);
          return entryCommentId === payloadCommentId ? action.payload : entry;
        }),
      };
    case CommentActionType.REMOVE_COMMENT:
      return {
        ...state,
        feedEntries: state.feedEntries.filter((entry) => {
          const entryCommentId = getCommentIdFromFeedEntry(entry);
          return entryCommentId !== action.payload;
        }),
        count: state.count - 1,
      };
    case CommentActionType.SET_COUNT:
      return {
        ...state,
        count: action.payload,
      };
    case CommentActionType.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case CommentActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case CommentActionType.SET_PAGE:
      return {
        ...state,
        page: action.payload,
      };
    case CommentActionType.SET_SORT_BY:
      return {
        ...state,
        sortBy: action.payload,
      };
    case CommentActionType.SET_FILTER:
      return {
        ...state,
        filter: action.payload,
      };
    case CommentActionType.SET_BOUNTY_FILTER:
      return {
        ...state,
        bountyFilter: action.payload,
      };
    case CommentActionType.SET_EDITING_COMMENT_ID:
      return {
        ...state,
        editingCommentId: action.payload,
      };
    case CommentActionType.SET_REPLYING_TO_COMMENT_ID:
      return {
        ...state,
        replyingToCommentId: action.payload,
      };
    case CommentActionType.RESET_STATE:
      return initialCommentState;
    case CommentActionType.ADD_REPLY: {
      const { parentId, reply } = action.payload;
      return {
        ...state,
        feedEntries: addReplyToFeedEntries(state.feedEntries, parentId, reply),
        count: state.count + 1,
      };
    }
    case CommentActionType.UPDATE_COMMENT_VOTE: {
      const { commentId, updatedComment } = action.payload;
      return {
        ...state,
        feedEntries: updateCommentVoteInFeedEntries(state.feedEntries, commentId, updatedComment),
      };
    }
    case CommentActionType.REVERT_OPTIMISTIC_UPDATE: {
      return {
        ...state,
        feedEntries: revertOptimisticUpdateInFeedEntries(state.feedEntries, action.payload),
      };
    }

    // Handle async action types
    case CommentActionType.FETCH_COMMENTS_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CommentActionType.FETCH_COMMENTS_SUCCESS:
      return {
        ...state,
        feedEntries: action.payload.feedEntries,
        count: action.payload.count,
        loading: false,
        error: null,
      };
    case CommentActionType.FETCH_COMMENTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case CommentActionType.FETCH_MORE_COMMENTS_SUCCESS:
      return {
        ...state,
        feedEntries: [...state.feedEntries, ...action.payload.feedEntries],
        count: action.payload.count,
        loading: false,
        error: null,
      };
    case CommentActionType.REFRESH:
      return {
        ...state,
        page: 1,
        loading: true,
        error: null,
      };
    case CommentActionType.LOAD_MORE:
      return {
        ...state,
        page: action.payload.page,
        loading: true,
        error: null,
      };
    case CommentActionType.FORCE_REFRESH:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CommentActionType.FORCE_REFRESH_SUCCESS:
      return {
        ...state,
        feedEntries: action.payload.feedEntries,
        count: action.payload.count,
        loading: false,
        error: null,
      };
    case CommentActionType.FORCE_REFRESH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case CommentActionType.LOAD_MORE_REPLIES_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CommentActionType.LOAD_MORE_REPLIES_SUCCESS:
      return {
        ...state,
        feedEntries: updateFeedEntriesWithMoreReplies(
          state.feedEntries,
          action.payload.commentId,
          action.payload.feedEntries
        ),
        loading: false,
        error: null,
      };
    case CommentActionType.LOAD_MORE_REPLIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case CommentActionType.CREATE_COMMENT_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CommentActionType.CREATE_COMMENT_SUCCESS:
      return {
        ...state,
        feedEntries: [action.payload.comment, ...state.feedEntries],
        count: state.count + 1,
        loading: false,
        error: null,
      };
    case CommentActionType.CREATE_REPLY_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CommentActionType.CREATE_REPLY_SUCCESS:
      return {
        ...state,
        feedEntries: addReplyToFeedEntries(
          state.feedEntries,
          getCommentIdFromFeedEntry(action.payload.reply),
          action.payload.reply
        ),
        loading: false,
        error: null,
      };
    case CommentActionType.UPDATE_COMMENT_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CommentActionType.UPDATE_COMMENT_SUCCESS:
      return {
        ...state,
        feedEntries: state.feedEntries.map((entry) => {
          const entryCommentId = getCommentIdFromFeedEntry(entry);
          const payloadCommentId = getCommentIdFromFeedEntry(action.payload.comment);
          return entryCommentId === payloadCommentId ? action.payload.comment : entry;
        }),
        loading: false,
        error: null,
      };
    case CommentActionType.DELETE_COMMENT_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CommentActionType.DELETE_COMMENT_SUCCESS:
      return {
        ...state,
        feedEntries: state.feedEntries.filter((entry) => {
          const entryCommentId = getCommentIdFromFeedEntry(entry);
          const payloadCommentId = getCommentIdFromFeedEntry(action.payload.comment);
          return entryCommentId !== payloadCommentId;
        }),
        count: state.count - 1,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};
