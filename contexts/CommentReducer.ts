import { Comment, CommentFilter, CommentSort } from '@/types/comment';
import { BountyFilterType } from './CommentContext';

// Define the state shape
export interface CommentState {
  comments: Comment[];
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
  FETCH_MORE_COMMENTS_START = 'FETCH_MORE_COMMENTS_START',
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
  payload: Comment[];
}

interface AddCommentAction {
  type: CommentActionType.ADD_COMMENT;
  payload: Comment;
}

interface UpdateCommentAction {
  type: CommentActionType.UPDATE_COMMENT;
  payload: Comment;
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
    reply: Comment;
  };
}

interface UpdateCommentVoteAction {
  type: CommentActionType.UPDATE_COMMENT_VOTE;
  payload: {
    commentId: number;
    updatedComment: Partial<Comment>;
  };
}

interface RevertOptimisticUpdateAction {
  type: CommentActionType.REVERT_OPTIMISTIC_UPDATE;
  payload: number; // comment ID
}

// Additional action interfaces for async operations
interface FetchCommentsStartAction {
  type: CommentActionType.FETCH_COMMENTS_START;
}

interface FetchCommentsSuccessAction {
  type: CommentActionType.FETCH_COMMENTS_SUCCESS;
  payload: {
    comments: Comment[];
    count: number;
  };
}

interface FetchCommentsFailureAction {
  type: CommentActionType.FETCH_COMMENTS_FAILURE;
  payload: {
    error: string;
  };
}

interface FetchMoreCommentsStartAction {
  type: CommentActionType.FETCH_MORE_COMMENTS_START;
}

interface FetchMoreCommentsSuccessAction {
  type: CommentActionType.FETCH_MORE_COMMENTS_SUCCESS;
  payload: {
    comments: Comment[];
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
    comments: Comment[];
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
    replies: Comment[];
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
    comment: Comment;
  };
}

interface CreateReplyStartAction {
  type: CommentActionType.CREATE_REPLY_START;
}

interface CreateReplySuccessAction {
  type: CommentActionType.CREATE_REPLY_SUCCESS;
  payload: {
    reply: Comment;
  };
}

interface UpdateCommentStartAction {
  type: CommentActionType.UPDATE_COMMENT_START;
}

interface UpdateCommentSuccessAction {
  type: CommentActionType.UPDATE_COMMENT_SUCCESS;
  payload: {
    comment: Comment;
  };
}

interface DeleteCommentStartAction {
  type: CommentActionType.DELETE_COMMENT_START;
}

interface DeleteCommentSuccessAction {
  type: CommentActionType.DELETE_COMMENT_SUCCESS;
  payload: {
    comment: Comment;
  };
}

// Union type for all actions
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
  | FetchMoreCommentsStartAction
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
  comments: [],
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

// Reducer function
export const commentReducer = (state: CommentState, action: CommentAction): CommentState => {
  switch (action.type) {
    case CommentActionType.SET_COMMENTS:
      return {
        ...state,
        comments: action.payload,
      };
    case CommentActionType.ADD_COMMENT:
      return {
        ...state,
        comments: [action.payload, ...state.comments],
        count: state.count + 1,
      };
    case CommentActionType.UPDATE_COMMENT:
      return {
        ...state,
        comments: state.comments.map((comment) =>
          comment.id === action.payload.id ? action.payload : comment
        ),
      };
    case CommentActionType.REMOVE_COMMENT:
      return {
        ...state,
        comments: state.comments.filter((comment) => comment.id !== action.payload),
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
        comments: addReplyToComments(state.comments, parentId, reply),
        count: state.count + 1,
      };
    }
    case CommentActionType.UPDATE_COMMENT_VOTE: {
      const { commentId, updatedComment } = action.payload;
      return {
        ...state,
        comments: updateCommentVoteInComments(state.comments, commentId, updatedComment),
      };
    }
    case CommentActionType.REVERT_OPTIMISTIC_UPDATE: {
      return {
        ...state,
        comments: revertOptimisticUpdateInComments(state.comments, action.payload),
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
        comments: action.payload.comments,
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
    case CommentActionType.FETCH_MORE_COMMENTS_START:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case CommentActionType.FETCH_MORE_COMMENTS_SUCCESS:
      return {
        ...state,
        comments: [...state.comments, ...action.payload.comments],
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
        loading: false,
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
        comments: action.payload.comments,
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
        loading: false,
        error: null,
      };
    case CommentActionType.LOAD_MORE_REPLIES_SUCCESS:
      return {
        ...state,
        comments: updateCommentsWithMoreReplies(
          state.comments,
          action.payload.commentId,
          action.payload.replies
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
        loading: false,
        error: null,
      };
    case CommentActionType.CREATE_COMMENT_SUCCESS:
      return {
        ...state,
        comments: [action.payload.comment, ...state.comments],
        count: state.count + 1,
        loading: false,
        error: null,
      };
    case CommentActionType.CREATE_REPLY_START:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case CommentActionType.CREATE_REPLY_SUCCESS:
      // This is handled by the ADD_REPLY case
      return {
        ...state,
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
        comments: updateReplyDeep(state.comments, action.payload.comment),
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
        comments: state.comments.filter((comment) => comment.id !== action.payload.comment.id),
        count: state.count - 1,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Helper functions for complex state updates
import {
  addReplyDeep,
  updateCommentVoteInList,
  revertOptimisticUpdate,
  updateReplyDeep,
  traverseCommentTree,
} from '@/components/Comment/lib/commentUtils/index';

const addReplyToComments = (comments: Comment[], parentId: number, reply: Comment): Comment[] => {
  return addReplyDeep(comments, parentId, reply);
};

const updateCommentVoteInComments = (
  comments: Comment[],
  commentId: number,
  updatedComment: Partial<Comment>
): Comment[] => {
  return updateCommentVoteInList(comments, commentId, updatedComment);
};

const revertOptimisticUpdateInComments = (comments: Comment[], commentId: number): Comment[] => {
  return revertOptimisticUpdate(comments, commentId);
};

// Helper function to update a comment with more replies
const updateCommentsWithMoreReplies = (
  comments: Comment[],
  commentId: number,
  newReplies: Comment[]
): Comment[] => {
  return traverseCommentTree(comments, (currentComment) => {
    if (currentComment.id === commentId) {
      // Filter out any replies that are already in the comment's replies array
      const existingReplyIds = new Set(currentComment.replies.map((reply) => reply.id));
      const filteredNewReplies = newReplies.filter((reply) => !existingReplyIds.has(reply.id));

      if (filteredNewReplies.length === 0) {
        return currentComment;
      }

      // Create a new comment object with the updated replies
      return {
        ...currentComment,
        replies: [...currentComment.replies, ...filteredNewReplies],
      };
    }

    // Return the comment unchanged if it's not the one we're looking for
    return currentComment;
  });
};
