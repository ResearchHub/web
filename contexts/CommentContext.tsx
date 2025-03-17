'use client';

import React, {
  createContext,
  useReducer,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  Comment,
  CommentFilter,
  CommentSort,
  CommentType,
  QuillContent,
  transformCommentToCommentFeedEntry,
  transformCommentToBountyFeedEntry,
} from '@/types/comment';
import { UserVoteType } from '@/types/reaction';
import { ContentType } from '@/types/work';
import { CommentService } from '@/services/comment.service';
import {
  findCommentById,
  updateReplyDeep,
  revertOptimisticUpdate,
  updateCommentWithApiResponse,
  updateCommentVoteInList,
  addReplyDeep,
  getRealId,
  traverseCommentTree,
} from '@/components/Comment/lib/commentUtils/index';
import { useSession } from 'next-auth/react';
import { CommentContent } from '@/components/Comment/lib/types';
import {
  CommentState,
  CommentActionType,
  commentReducer,
  initialCommentState,
} from './CommentReducer';
import { toast } from 'react-hot-toast';
import { FeedEntry, FeedCommentContent, FeedBountyContent } from '@/types/feed';
import { getCommentFromFeedEntry, createFeedEntryFromComment } from '@/utils/feedUtils';

export type BountyFilterType = 'ALL' | 'OPEN' | 'CLOSED';

// Define event types that were previously in commentEvents
export type CommentEventType = 'comment_created' | 'comment_updated' | 'comment_deleted';

interface CommentContextType {
  // State
  feedEntries: FeedEntry[];
  count: number;
  loading: boolean;
  error: string | null;
  sortBy: CommentSort;
  filter?: CommentFilter;
  bountyFilter: BountyFilterType;
  filteredFeedEntries: FeedEntry[];
  editingCommentId: number | null;
  replyingToCommentId: number | null;

  // Actions
  fetchComments: (page?: number) => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadMoreReplies: (commentId: number) => Promise<void>;
  createComment: (content: CommentContent, rating?: number) => Promise<Comment | null>;
  createBounty: (
    content: CommentContent,
    bountyAmount: number,
    bountyType: CommentType,
    expirationDate: string,
    customWorkId?: string
  ) => Promise<Comment | null>;
  createReply: (parentId: number, content: CommentContent) => Promise<Comment | null>;
  updateComment: (
    commentId: number,
    content: CommentContent,
    parentId?: number
  ) => Promise<Comment | null>;
  deleteComment: (commentId: number) => Promise<boolean>;
  updateCommentVote: (commentId: number, userVote: UserVoteType, score: number) => void;
  setEditingCommentId: (commentId: number | null) => void;
  setReplyingToCommentId: (commentId: number | null) => void;

  // State setters
  setSortBy: (sort: CommentSort) => void;
  setFilter: (filter?: CommentFilter) => void;
  setBountyFilter: (filter: BountyFilterType) => void;

  // Event handling
  emitCommentEvent: (
    eventType: CommentEventType,
    data: { comment: Comment; contentType: ContentType; documentId: number }
  ) => void;

  // New function
  forceRefresh: () => Promise<void>;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

// Helper function to convert CommentContent to the format expected by the API
const convertToApiFormat = (content: CommentContent): string | QuillContent => {
  if (typeof content === 'string') {
    return content;
  }

  // For TipTap content, we stringify it for the API
  // This ensures we're sending a format the API can understand
  return JSON.stringify(content) as unknown as QuillContent;
};

export const CommentProvider = ({
  children,
  documentId,
  contentType,
  commentType = 'GENERIC_COMMENT',
  debug = true,
}: {
  children: React.ReactNode;
  documentId: number;
  contentType: ContentType;
  commentType?: CommentType;
  debug?: boolean;
}) => {
  const [state, dispatch] = useReducer(commentReducer, {
    ...initialCommentState,
    loading: true,
  });

  const { data: session } = useSession();

  // Debug logging for state changes
  useEffect(() => {
    if (debug) {
      console.log('CommentContext - editingCommentId changed:', state.editingCommentId);
    }
  }, [state.editingCommentId, debug]);

  useEffect(() => {
    if (debug) {
      console.log('CommentContext - replyingToCommentId changed:', state.replyingToCommentId);
    }
  }, [state.replyingToCommentId, debug]);

  // Filter comments based on bounty filter
  const filteredFeedEntries = useMemo(() => {
    if (commentType !== 'BOUNTY' || state.bountyFilter === 'ALL') {
      return state.feedEntries;
    }

    return state.feedEntries.filter((entry) => {
      // Extract the comment from the feed entry
      const comment = getCommentFromFeedEntry(entry);
      if (!comment) return false;

      const hasExpired = comment.expirationDate
        ? new Date(comment.expirationDate) < new Date()
        : false;
      const hasBeenAwarded = comment.awardedBountyAmount && comment.awardedBountyAmount > 0;

      if (state.bountyFilter === 'OPEN') {
        return !hasExpired && !hasBeenAwarded;
      } else if (state.bountyFilter === 'CLOSED') {
        return hasExpired || hasBeenAwarded;
      }

      return true;
    });
  }, [state.feedEntries, commentType, state.bountyFilter]);

  // Fetch comments from API
  const fetchComments = useCallback(
    async (pageToFetch = 1) => {
      try {
        dispatch({ type: CommentActionType.FETCH_COMMENTS_START });

        // Determine the filter to use based on commentType and user selection
        let filterToUse = state.filter;

        // Map commentType to valid CommentFilter values
        // Only use commentType as filter if it's a valid CommentFilter value
        if (commentType === 'REVIEW' || commentType === 'BOUNTY') {
          filterToUse = state.filter || commentType;
        }

        const { count: totalCount, feedEntries } = await CommentService.fetchComments({
          documentId,
          contentType,
          sort: state.sortBy,
          filter: filterToUse,
          page: pageToFetch,
        });

        if (pageToFetch === 1) {
          dispatch({
            type: CommentActionType.FETCH_COMMENTS_SUCCESS,
            payload: { feedEntries, count: totalCount },
          });
        } else {
          dispatch({
            type: CommentActionType.FETCH_MORE_COMMENTS_SUCCESS,
            payload: { feedEntries, count: totalCount },
          });
        }
      } catch (err) {
        dispatch({
          type: CommentActionType.FETCH_COMMENTS_FAILURE,
          payload: { error: 'Failed to load comments' },
        });
        console.error('Error fetching comments:', err);
      }
    },
    [documentId, contentType, state.sortBy, state.filter, commentType]
  );

  // Refresh comments (fetch page 1)
  const refresh = useCallback(() => {
    dispatch({ type: CommentActionType.REFRESH });
    return fetchComments(1);
  }, [fetchComments]);

  // Load more comments (next page)
  const loadMore = useCallback(() => {
    const nextPage = state.page + 1;
    dispatch({ type: CommentActionType.LOAD_MORE, payload: { page: nextPage } });
    return fetchComments(nextPage);
  }, [state.page, fetchComments]);

  // Initial fetch effect - fetch comments when the component mounts
  useEffect(() => {
    console.log(
      `CommentContext - Initial fetch for documentId=${documentId}, commentType=${commentType}`
    );
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, contentType, commentType]);

  // Effect to refresh comments when sort or filter changes
  useEffect(() => {
    // Skip the initial render
    if (state.feedEntries.length > 0) {
      refresh();
    }
  }, [state.sortBy, state.filter, refresh]);

  // Function to force refresh comments from the server
  const forceRefresh = useCallback(async () => {
    if (debug) {
      console.log('[forceRefresh] Forcing refresh of comments');
    }

    try {
      dispatch({ type: CommentActionType.FORCE_REFRESH });
      const { count: totalCount, feedEntries } = await CommentService.fetchComments({
        documentId,
        contentType,
        sort: state.sortBy,
        filter: state.filter,
        page: 1,
      });

      dispatch({
        type: CommentActionType.FORCE_REFRESH_SUCCESS,
        payload: { feedEntries, count: totalCount },
      });

      if (debug) {
        console.log(`[forceRefresh] Fetched ${feedEntries.length} comments`);
      }
    } catch (err) {
      dispatch({
        type: CommentActionType.FORCE_REFRESH_FAILURE,
        payload: { error: 'Failed to refresh comments' },
      });
      console.error('Error refreshing comments:', err);
    }
  }, [documentId, contentType, state.sortBy, state.filter, debug]);

  // Function to load more replies for a specific comment
  const loadMoreReplies = useCallback(
    async (commentId: number) => {
      console.log(`[loadMoreReplies] Loading more replies for comment ${commentId}`);

      try {
        dispatch({ type: CommentActionType.LOAD_MORE_REPLIES_START });

        // Find the comment in the tree
        const feedEntry = state.feedEntries.find((entry) => {
          const comment = getCommentFromFeedEntry(entry);
          return comment?.id === commentId;
        });

        if (!feedEntry) {
          console.error(`[loadMoreReplies] Comment with ID ${commentId} not found`);
          dispatch({
            type: CommentActionType.LOAD_MORE_REPLIES_FAILURE,
            payload: { error: 'Failed to load more replies' },
          });
          return;
        }

        const comment = getCommentFromFeedEntry(feedEntry);
        if (!comment) {
          console.error(`[loadMoreReplies] Could not extract comment from feed entry`);
          dispatch({
            type: CommentActionType.LOAD_MORE_REPLIES_FAILURE,
            payload: { error: 'Failed to load more replies' },
          });
          return;
        }

        // Calculate the page to fetch
        const repliesCount = comment.replies?.length || 0;
        const page = Math.floor(repliesCount / 10) + 1;

        console.log(
          `[loadMoreReplies] Comment ${commentId} has ${repliesCount} replies, fetching page ${page}`
        );

        // Fetch more replies from the API
        const { count, feedEntries } = await CommentService.fetchCommentReplies({
          commentId,
          documentId,
          contentType,
          page,
          pageSize: 10,
          sort: state.sortBy,
        });

        console.log(
          `[loadMoreReplies] Fetched ${feedEntries.length} replies for comment ${commentId}`
        );

        // Update the comments state with the new replies
        dispatch({
          type: CommentActionType.LOAD_MORE_REPLIES_SUCCESS,
          payload: { commentId, feedEntries },
        });
      } catch (err) {
        dispatch({
          type: CommentActionType.LOAD_MORE_REPLIES_FAILURE,
          payload: { error: 'Failed to load more replies' },
        });
        console.error('Error loading more replies:', err);
      }
    },
    [state.feedEntries, documentId, contentType, state.sortBy]
  );

  // Function to create a new comment
  const createComment = useCallback(
    async (content: CommentContent, rating?: number): Promise<Comment | null> => {
      try {
        dispatch({ type: CommentActionType.CREATE_COMMENT_START });

        // Convert content to API format
        const apiContent = convertToApiFormat(content);

        // Create the comment
        const newComment = await CommentService.createComment({
          workId: documentId,
          contentType,
          content: apiContent,
          commentType,
        });

        // Convert the comment to a feed entry
        const feedEntry = createFeedEntryFromComment(newComment);

        // Update the state
        dispatch({
          type: CommentActionType.CREATE_COMMENT_SUCCESS,
          payload: { comment: feedEntry },
        });

        // Emit the comment created event
        emitCommentEvent('comment_created', {
          comment: newComment,
          contentType,
          documentId,
        });

        return newComment;
      } catch (err) {
        console.error('Error creating comment:', err);
        return null;
      }
    },
    [documentId, contentType, commentType]
  );

  // Function to create a bounty
  const createBounty = useCallback(
    async (
      content: CommentContent,
      bountyAmount: number,
      bountyType: CommentType,
      expirationDate: string,
      customWorkId?: string
    ): Promise<Comment | null> => {
      try {
        // Convert content to API format
        const apiContent = convertToApiFormat(content);

        // Create the bounty
        const newBounty = await CommentService.createComment({
          workId: customWorkId ? parseInt(customWorkId) : documentId,
          contentType,
          content: apiContent,
          bountyAmount,
          bountyType,
          expirationDate,
          commentType: 'BOUNTY',
        });

        // Refresh the comments to include the new bounty
        await forceRefresh();

        return newBounty;
      } catch (err) {
        console.error('Error creating bounty:', err);
        return null;
      }
    },
    [documentId, contentType, forceRefresh]
  );

  // Function to create a reply to a comment
  const createReply = useCallback(
    async (parentId: number, content: CommentContent): Promise<Comment | null> => {
      try {
        dispatch({ type: CommentActionType.CREATE_REPLY_START });

        // Convert content to API format
        const apiContent = convertToApiFormat(content);

        // Create the reply
        const newReply = await CommentService.createComment({
          workId: documentId,
          contentType,
          content: apiContent,
          parentId,
          commentType,
        });

        // Convert the reply to a feed entry
        const feedEntry = createFeedEntryFromComment(newReply);

        // Update the state
        dispatch({
          type: CommentActionType.CREATE_REPLY_SUCCESS,
          payload: { reply: feedEntry },
        });

        // Emit the comment created event
        emitCommentEvent('comment_created', {
          comment: newReply,
          contentType,
          documentId,
        });

        return newReply;
      } catch (err) {
        console.error('Error creating reply:', err);
        return null;
      }
    },
    [documentId, contentType, commentType]
  );

  // Function to update a comment
  const updateComment = useCallback(
    async (
      commentId: number,
      content: CommentContent,
      parentId?: number
    ): Promise<Comment | null> => {
      try {
        dispatch({ type: CommentActionType.UPDATE_COMMENT_START });

        // Convert content to API format
        const apiContent = convertToApiFormat(content);

        // Update the comment
        const updatedComment = await CommentService.updateComment({
          commentId,
          documentId,
          contentType,
          content: apiContent,
          contentFormat: 'TIPTAP',
        });

        // Convert the updated comment to a feed entry
        const feedEntry = createFeedEntryFromComment(updatedComment);

        // Update the state
        dispatch({
          type: CommentActionType.UPDATE_COMMENT_SUCCESS,
          payload: { comment: feedEntry },
        });

        // Emit the comment updated event
        emitCommentEvent('comment_updated', {
          comment: updatedComment,
          contentType,
          documentId,
        });

        return updatedComment;
      } catch (err) {
        console.error('Error updating comment:', err);
        return null;
      }
    },
    [documentId, contentType]
  );

  // Function to delete a comment
  const deleteComment = useCallback(
    async (commentId: number): Promise<boolean> => {
      try {
        dispatch({ type: CommentActionType.DELETE_COMMENT_START });

        // Find the comment to delete
        const feedEntry = state.feedEntries.find((entry) => {
          const comment = getCommentFromFeedEntry(entry);
          return comment?.id === commentId;
        });

        if (!feedEntry) {
          console.error(`Comment with ID ${commentId} not found`);
          return false;
        }

        const comment = getCommentFromFeedEntry(feedEntry);
        if (!comment) {
          console.error(`Could not extract comment from feed entry`);
          return false;
        }

        // Delete the comment
        await CommentService.deleteComment({
          commentId,
          documentId,
          contentType,
        });

        // Update the state
        dispatch({
          type: CommentActionType.DELETE_COMMENT_SUCCESS,
          payload: { comment: feedEntry },
        });

        // Emit the comment deleted event
        emitCommentEvent('comment_deleted', {
          comment,
          contentType,
          documentId,
        });

        return true;
      } catch (err) {
        console.error('Error deleting comment:', err);
        return false;
      }
    },
    [documentId, contentType, state.feedEntries]
  );

  // Function to emit a comment event
  const emitCommentEvent = useCallback(
    (
      eventType: CommentEventType,
      data: { comment: Comment; contentType: ContentType; documentId: number }
    ) => {
      // Dispatch a custom event
      const event = new CustomEvent('comment_event', {
        detail: {
          type: eventType,
          data,
        },
      });
      window.dispatchEvent(event);
    },
    []
  );

  // Helper function to set editing comment ID
  const handleSetEditingCommentId = useCallback((commentId: number | null) => {
    console.log('Setting editingCommentId to:', commentId);
    dispatch({
      type: CommentActionType.SET_EDITING_COMMENT_ID,
      payload: commentId,
    });
    // Clear replying state if setting an editing comment
    if (commentId !== null) {
      console.log('Clearing replyingToCommentId because editingCommentId is being set');
      dispatch({ type: CommentActionType.SET_REPLYING_TO_COMMENT_ID, payload: null });
    }
  }, []);

  // Helper function to set replying to comment ID
  const handleSetReplyingToCommentId = useCallback((commentId: number | null) => {
    console.log('Setting replyingToCommentId to:', commentId);
    dispatch({ type: CommentActionType.SET_REPLYING_TO_COMMENT_ID, payload: commentId });
    // Clear editing state if setting a replying comment
    if (commentId !== null) {
      console.log('Clearing editingCommentId because replyingToCommentId is being set');
      dispatch({ type: CommentActionType.SET_EDITING_COMMENT_ID, payload: null });
    }
  }, []);

  // Function to update a comment's vote state without making API calls
  const updateCommentVote = useCallback(
    (commentId: number, userVote: UserVoteType, score: number) => {
      dispatch({
        type: CommentActionType.UPDATE_COMMENT_VOTE,
        payload: {
          commentId,
          updatedComment: { userVote },
        },
      });
    },
    []
  );

  const value = {
    feedEntries: state.feedEntries,
    count: state.count,
    loading: state.loading,
    error: state.error,
    sortBy: state.sortBy,
    filter: state.filter,
    bountyFilter: state.bountyFilter,
    filteredFeedEntries,
    editingCommentId: state.editingCommentId,
    replyingToCommentId: state.replyingToCommentId,
    fetchComments,
    refresh,
    loadMore,
    loadMoreReplies,
    createComment,
    createBounty,
    createReply,
    updateComment,
    deleteComment,
    updateCommentVote,
    setEditingCommentId: handleSetEditingCommentId,
    setReplyingToCommentId: handleSetReplyingToCommentId,
    setSortBy: (sort: CommentSort) => {
      dispatch({ type: CommentActionType.SET_SORT_BY, payload: sort });
      // Set loading to true to show loading skeleton
      dispatch({ type: CommentActionType.SET_LOADING, payload: true });
    },
    setFilter: (filter?: CommentFilter) => {
      dispatch({ type: CommentActionType.SET_FILTER, payload: filter });
    },
    setBountyFilter: (filter: BountyFilterType) => {
      dispatch({ type: CommentActionType.SET_BOUNTY_FILTER, payload: filter });
      // Set loading to true to show loading skeleton
      dispatch({ type: CommentActionType.SET_LOADING, payload: true });
    },
    forceRefresh,
    emitCommentEvent,
  };

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
};

export function useComments() {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentProvider');
  }
  return context;
}
