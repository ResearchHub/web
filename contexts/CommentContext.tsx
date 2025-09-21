'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { Comment, CommentFilter, CommentSort, CommentType, QuillContent } from '@/types/comment';
import { UserVoteType } from '@/types/reaction';
import { ContentType, Work } from '@/types/work';
import { CommentService } from '@/services/comment.service';
import {
  extractUserMentions,
  findCommentById,
  getRealId,
} from '@/components/Comment/lib/commentUtils/index';
import { useSession } from 'next-auth/react';
import { CommentContent } from '@/components/Comment/lib/types';
import { CommentActionType, commentReducer, initialCommentState } from './CommentReducer';
import { JSONContent } from '@tiptap/core';
import { createOptimisticComment } from '@/components/Comment/lib/commentOptimisticUtils';

export type BountyFilterType = 'ALL' | 'OPEN' | 'CLOSED';

// Define event types that were previously in commentEvents
export type CommentEventType = 'comment_created' | 'comment_updated' | 'comment_deleted';

interface CommentContextType {
  // State
  comments: Comment[];
  count: number;
  loading: boolean;
  error: string | null;
  sortBy: CommentSort;
  filter?: CommentFilter;
  bountyFilter: BountyFilterType;
  filteredComments: Comment[];
  editingCommentId: number | null;
  replyingToCommentId: number | null;
  workContentType: ContentType;
  work?: Work;

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
  // Mock helpers
  addMockReply: (parentId: number, content: CommentContent) => void;
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

const CommentContext = createContext<CommentContextType | null>(null);

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
  work,
}: {
  children: React.ReactNode;
  documentId: number;
  contentType: ContentType;
  commentType?: CommentType;
  debug?: boolean;
  work?: Work;
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
  const filteredComments = useMemo(() => {
    if (commentType !== 'BOUNTY' || state.bountyFilter === 'ALL') {
      return state.comments;
    }

    return state.comments.filter((comment) => {
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
  }, [state.comments, commentType, state.bountyFilter]);

  // Fetch comments from API
  const fetchComments = useCallback(
    async (pageToFetch = 1) => {
      try {
        // We don't need to dispatch FETCH_COMMENTS_START here anymore
        // as it's already handled by the calling functions (refresh or loadMore)

        // Determine the filter to use based on commentType and user selection
        let filterToUse = state.filter;

        // Map commentType to valid CommentFilter values
        // Only use commentType as filter if it's a valid CommentFilter value
        if (
          commentType === 'REVIEW' ||
          commentType === 'BOUNTY' ||
          commentType === 'AUTHOR_UPDATE'
        ) {
          filterToUse = state.filter || commentType;
        }

        const { comments: fetchedComments, count: totalCount } = await CommentService.fetchComments(
          {
            documentId,
            contentType,
            sort: state.sortBy,
            filter: filterToUse,
            page: pageToFetch,
          }
        );

        if (pageToFetch === 1) {
          dispatch({
            type: CommentActionType.FETCH_COMMENTS_SUCCESS,
            payload: { comments: fetchedComments, count: totalCount },
          });
        } else {
          dispatch({
            type: CommentActionType.FETCH_MORE_COMMENTS_SUCCESS,
            payload: { comments: fetchedComments, count: totalCount },
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
    // Set loading to true for initial fetch
    dispatch({ type: CommentActionType.FETCH_COMMENTS_START });
    return fetchComments(1);
  }, [fetchComments]);

  // Load more comments (next page)
  const loadMore = useCallback(() => {
    const nextPage = state.page + 1;
    dispatch({ type: CommentActionType.LOAD_MORE, payload: { page: nextPage } });

    // Use the new action type that doesn't set loading to true
    try {
      dispatch({ type: CommentActionType.FETCH_MORE_COMMENTS_START });
      return fetchComments(nextPage);
    } catch (err) {
      dispatch({
        type: CommentActionType.FETCH_COMMENTS_FAILURE,
        payload: { error: 'Failed to load more comments' },
      });
      console.error('Error loading more comments:', err);
      return Promise.reject(err);
    }
  }, [state.page, fetchComments]);

  // Initial fetch effect - fetch comments when the component mounts
  useEffect(() => {
    console.log(
      `CommentContext - Initial fetch for documentId=${documentId}, commentType=${commentType}`
    );
    // Set loading to true for initial fetch
    dispatch({ type: CommentActionType.FETCH_COMMENTS_START });
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, contentType, commentType]);

  // Effect to refresh comments when sort or filter changes
  useEffect(() => {
    // Skip the initial render
    if (state.comments.length > 0) {
      // Set loading to true for filter/sort changes
      dispatch({ type: CommentActionType.FETCH_COMMENTS_START });
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
      // Set loading to true for force refresh
      dispatch({ type: CommentActionType.FETCH_COMMENTS_START });
      const { comments: fetchedComments, count: totalCount } = await CommentService.fetchComments({
        documentId,
        contentType,
        sort: state.sortBy,
        filter: state.filter,
        page: 1,
      });

      dispatch({
        type: CommentActionType.FORCE_REFRESH_SUCCESS,
        payload: { comments: fetchedComments, count: totalCount },
      });

      if (debug) {
        console.log(`[forceRefresh] Fetched ${fetchedComments.length} comments`);
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
        const comment = findCommentById(state.comments, commentId);

        if (!comment) {
          console.error(`[loadMoreReplies] Comment with ID ${commentId} not found`);
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
        const { replies, count } = await CommentService.fetchCommentReplies({
          commentId,
          documentId,
          contentType,
          page,
          pageSize: 10,
          sort: state.sortBy,
        });

        console.log(`[loadMoreReplies] Fetched ${replies.length} replies for comment ${commentId}`);

        // Update the comments state with the new replies
        dispatch({
          type: CommentActionType.LOAD_MORE_REPLIES_SUCCESS,
          payload: { commentId, replies },
        });

        // Log the updated state for debugging
        setTimeout(() => {
          const updatedComment = findCommentById(state.comments, commentId);
          if (updatedComment) {
            console.log(
              `[loadMoreReplies] After update, comment ${commentId} has ${updatedComment.replies.length} replies`
            );
          }
        }, 0);
      } catch (error) {
        console.error('[loadMoreReplies] Error loading more replies:', error);
        dispatch({
          type: CommentActionType.LOAD_MORE_REPLIES_FAILURE,
          payload: { error: 'Failed to load more replies' },
        });
      }
    },
    [state.comments, documentId, contentType, state.sortBy]
  );

  // Event handlers for comment events
  const handleCommentCreated = useCallback(
    (data: { comment: Comment; contentType: ContentType; documentId: number }) => {
      if (data.documentId === documentId && data.contentType === contentType) {
        // Add the new comment to the list
        dispatch({
          type: CommentActionType.CREATE_COMMENT_SUCCESS,
          payload: { comment: data.comment },
        });
        dispatch({ type: CommentActionType.SET_COUNT, payload: state.count + 1 });
      }
    },
    [documentId, contentType, state.count]
  );

  const handleCommentUpdated = useCallback(
    (data: { comment: Comment; contentType: ContentType; documentId: number }) => {
      if (data.documentId === documentId && data.contentType === contentType) {
        // Update the comment in the list
        dispatch({
          type: CommentActionType.UPDATE_COMMENT_SUCCESS,
          payload: { comment: data.comment },
        });
      }
    },
    [documentId, contentType]
  );

  const handleCommentDeleted = useCallback(
    (data: { comment: Comment; contentType: ContentType; documentId: number }) => {
      if (data.documentId === documentId && data.contentType === contentType) {
        // Remove the deleted comment from the list
        dispatch({
          type: CommentActionType.DELETE_COMMENT_SUCCESS,
          payload: { comment: data.comment },
        });
        dispatch({ type: CommentActionType.SET_COUNT, payload: state.count - 1 });
      }
    },
    [documentId, contentType, state.count]
  );

  // Function to emit comment events
  const emitCommentEvent = useCallback(
    (
      eventType: CommentEventType,
      data: { comment: Comment; contentType: ContentType; documentId: number }
    ) => {
      console.log(`[emitCommentEvent] Emitting ${eventType} event:`, data);

      // Handle the event based on its type
      switch (eventType) {
        case 'comment_created':
          handleCommentCreated(data);
          break;
        case 'comment_updated':
          handleCommentUpdated(data);
          break;
        case 'comment_deleted':
          handleCommentDeleted(data);
          break;
        default:
          console.warn(`[emitCommentEvent] Unknown event type: ${eventType}`);
      }
    },
    [handleCommentCreated, handleCommentUpdated, handleCommentDeleted]
  );

  // Create a new comment
  const createComment = useCallback(
    async (content: CommentContent, rating?: number): Promise<Comment | null> => {
      dispatch({ type: CommentActionType.CREATE_COMMENT_START });
      dispatch({ type: CommentActionType.SET_ERROR, payload: null });

      try {
        const apiContent = convertToApiFormat(content);

        // Extract mentions from the question content
        const mentions =
          content && typeof content === 'object' && 'content' in content
            ? extractUserMentions(content as JSONContent)
            : [];

        const newComment = await CommentService.createComment({
          workId: documentId,
          contentType,
          content: apiContent,
          contentFormat: 'TIPTAP',
          commentType: rating !== undefined ? 'REVIEW' : commentType,
          mentions: mentions || [],
        });

        // Only update the UI after successful API response
        if (newComment) {
          console.log(`Comment created successfully with ID: ${newComment.id}`);

          // Update the state with the new comment
          dispatch({
            type: CommentActionType.CREATE_COMMENT_SUCCESS,
            payload: { comment: newComment },
          });

          // Update the count
          dispatch({ type: CommentActionType.SET_COUNT, payload: state.count + 1 });
        }

        return newComment;
      } catch (err) {
        console.error('Error creating comment:', err);
        dispatch({ type: CommentActionType.SET_ERROR, payload: 'Failed to create comment' });
        return null;
      }
    },
    [documentId, contentType, commentType, state.count]
  );

  /**
   * Adds a mock reply authored by ResearchHub Agents under a given parent comment.
   * This is a pure client-side injection for demos/mocks.
   */
  const addMockReply = useCallback(
    (parentId: number, content: CommentContent) => {
      const mock = createOptimisticComment(
        content,
        999999,
        'ResearchHub Agents',
        '/static/agents-avatar.png',
        documentId,
        parentId
      );

      // Ensure it looks non-optimistic in UI for this demo
      mock.id = -Math.floor(Math.random() * 1000000) - 1;
      mock.metadata = {
        ...mock.metadata,
        isOptimistic: false,
        isMock: true,
        isAgentResponse: true,
      } as any;

      dispatch({
        type: CommentActionType.ADD_REPLY,
        payload: { parentId, reply: mock },
      });
    },
    [documentId]
  );

  // Create a new bounty
  const createBounty = useCallback(
    async (
      content: CommentContent,
      bountyAmount: number,
      bountyType: CommentType,
      expirationDate: string,
      customWorkId?: string
    ): Promise<Comment | null> => {
      dispatch({ type: CommentActionType.CREATE_COMMENT_START });
      dispatch({ type: CommentActionType.SET_ERROR, payload: null });

      try {
        const apiContent = convertToApiFormat(content);

        // Extract mentions from the question content
        const mentions =
          content && typeof content === 'object' && 'content' in content
            ? extractUserMentions(content as JSONContent)
            : [];

        // Always use GENERIC_COMMENT as the commentType
        const commentType = 'GENERIC_COMMENT';

        const newBounty = await CommentService.createComment({
          workId: customWorkId || documentId.toString(),
          contentType,
          content: apiContent,
          contentFormat: 'TIPTAP',
          commentType, // Always GENERIC_COMMENT
          bountyAmount,
          bountyType, // Keep the bountyType as provided
          expirationDate,
          privacyType: 'PUBLIC',
          mentions: mentions || [],
        });

        // Only update the UI after successful API response
        if (newBounty) {
          console.log(`Bounty created successfully with ID: ${newBounty.id}`);

          // Update the state with the new bounty
          dispatch({
            type: CommentActionType.CREATE_COMMENT_SUCCESS,
            payload: { comment: newBounty },
          });

          // Update the count
          dispatch({ type: CommentActionType.SET_COUNT, payload: state.count + 1 });
        }

        return newBounty;
      } catch (err) {
        console.error('Error creating bounty:', err);
        dispatch({ type: CommentActionType.SET_ERROR, payload: 'Failed to create bounty' });
        return null;
      }
    },
    [documentId, contentType, state.count]
  );

  /**
   * Creates a reply to an existing comment
   * @param parentId ID of the parent comment
   * @param content Content of the reply
   * @returns The created reply or null if there was an error
   */
  const createReply = useCallback(
    async (parentId: number, content: CommentContent): Promise<Comment | null> => {
      dispatch({ type: CommentActionType.CREATE_REPLY_START });
      dispatch({ type: CommentActionType.SET_ERROR, payload: null });

      try {
        console.log(`Creating reply to parent ${parentId} with content:`, content);

        // Get the real parent ID if it exists
        const realParentId = getRealId(parentId);
        console.log(`Real parent ID: ${realParentId}`);

        const apiContent = convertToApiFormat(content);

        // Extract mentions from the question content
        const mentions =
          content && typeof content === 'object' && 'content' in content
            ? extractUserMentions(content as JSONContent)
            : [];

        // Make the API call first
        console.log(`Making API call to create reply to parent ${realParentId}`);
        const newReply = await CommentService.createComment({
          workId: documentId,
          contentType,
          content: apiContent,
          contentFormat: 'TIPTAP',
          parentId: realParentId,
          commentType: 'GENERIC_COMMENT',
          mentions: mentions || [],
        });
        console.log(`API response for reply creation:`, newReply);

        // Check if this reply already exists in the comment tree
        const existingReply = findCommentById(state.comments, newReply.id);
        if (existingReply) {
          console.log(`Reply ${newReply.id} already exists in the tree, skipping addition`);
          return newReply;
        }

        // Update the state with the new reply
        dispatch({
          type: CommentActionType.ADD_REPLY,
          payload: { parentId: realParentId, reply: newReply },
        });

        // Clear the replying state
        dispatch({ type: CommentActionType.SET_REPLYING_TO_COMMENT_ID, payload: null });

        return newReply;
      } catch (error) {
        console.error('Error creating reply:', error);
        dispatch({ type: CommentActionType.SET_ERROR, payload: 'Failed to create reply' });

        // Refresh the comments to ensure we have the correct state
        await fetchComments();

        return null;
      }
    },
    [session, documentId, contentType, commentType, fetchComments]
  );

  /**
   * Updates an existing comment
   * @param commentId ID of the comment to update
   * @param content New content for the comment
   * @param parentId Optional parent ID if the comment is a reply
   * @returns The updated comment or null if there was an error
   */
  const updateComment = useCallback(
    async (
      commentId: number,
      content: CommentContent,
      parentId?: number
    ): Promise<Comment | null> => {
      dispatch({ type: CommentActionType.UPDATE_COMMENT_START });
      dispatch({ type: CommentActionType.SET_ERROR, payload: null });

      try {
        // Get the real comment ID if it exists
        const realId = getRealId(commentId);

        const apiContent = convertToApiFormat(content);

        // Extract mentions from the question content
        const mentions =
          content && typeof content === 'object' && 'content' in content
            ? extractUserMentions(content as JSONContent)
            : [];

        // Find the comment to update
        const commentToUpdate = findCommentById(state.comments, realId);

        if (!commentToUpdate) {
          console.error(`Comment with ID ${realId} not found`);
          return null;
        }

        // Store the original content for reverting if needed
        const originalContent = commentToUpdate.content;

        // Create an optimistic update
        const optimisticUpdate: Comment = {
          ...commentToUpdate,
          content: apiContent,
          updatedDate: new Date().toISOString(),
          metadata: {
            ...commentToUpdate.metadata,
            isOptimisticUpdate: true,
            originalContent,
          },
        };

        // Update the comment tree with the optimistic update
        dispatch({
          type: CommentActionType.UPDATE_COMMENT_SUCCESS,
          payload: { comment: optimisticUpdate },
        });

        // Make the API call
        const response = await CommentService.updateComment({
          commentId: realId,
          documentId,
          contentType,
          content: apiContent,
          contentFormat: 'TIPTAP',
          mentions: mentions || [],
        });

        if (response) {
          // Update the comment tree with the real data
          dispatch({
            type: CommentActionType.UPDATE_COMMENT_SUCCESS,
            payload: { comment: response },
          });

          return response;
        } else {
          // Revert the optimistic update if the API call failed
          dispatch({
            type: CommentActionType.REVERT_OPTIMISTIC_UPDATE,
            payload: realId,
          });

          return null;
        }
      } catch (error) {
        console.error('Error updating comment:', error);
        dispatch({ type: CommentActionType.SET_ERROR, payload: 'Failed to update comment' });

        // Revert the optimistic update
        dispatch({
          type: CommentActionType.REVERT_OPTIMISTIC_UPDATE,
          payload: commentId,
        });

        return null;
      }
    },
    [state.comments, documentId, contentType]
  );

  // Delete a comment
  const deleteComment = useCallback(
    async (commentId: number): Promise<boolean> => {
      dispatch({ type: CommentActionType.DELETE_COMMENT_START });
      dispatch({ type: CommentActionType.SET_ERROR, payload: null });

      try {
        // Find the comment to delete
        const commentToDelete = findCommentById(state.comments, commentId);

        // If we couldn't find the comment to delete, return false
        if (!commentToDelete) {
          return false;
        }

        // Check if this is a reply (has a parentId)
        const isReply = !!commentToDelete.parentId;

        // Set loading state
        dispatch({ type: CommentActionType.DELETE_COMMENT_START });

        try {
          // Make the API call first - no optimistic updates for deletion
          await CommentService.deleteComment({
            commentId,
            documentId,
            contentType,
          });

          // Only update the UI after successful API response
          if (isReply) {
            // For replies, we need to update the parent's replies array
            dispatch({
              type: CommentActionType.DELETE_COMMENT_SUCCESS,
              payload: { comment: commentToDelete },
            });
          } else {
            // For top-level comments, filter them out from the list
            dispatch({
              type: CommentActionType.DELETE_COMMENT_SUCCESS,
              payload: { comment: commentToDelete },
            });
          }

          // Update the total count
          dispatch({ type: CommentActionType.SET_COUNT, payload: state.count - 1 });

          // Emit the event for backward compatibility
          emitCommentEvent('comment_deleted', {
            comment: commentToDelete,
            contentType,
            documentId,
          });

          return true;
        } catch (error) {
          console.error('Error deleting comment:', error);
          dispatch({ type: CommentActionType.SET_ERROR, payload: 'Failed to delete comment' });
          return false;
        } finally {
          dispatch({
            type: CommentActionType.DELETE_COMMENT_SUCCESS,
            payload: { comment: commentToDelete },
          });
        }
      } catch (err) {
        console.error('Error in deleteComment:', err);
        dispatch({ type: CommentActionType.SET_ERROR, payload: 'Failed to delete comment' });
        return false;
      }
    },
    [documentId, contentType, state.comments, emitCommentEvent]
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
          updatedComment: { userVote, score },
        },
      });
    },
    []
  );

  const value = {
    comments: state.comments,
    count: state.count,
    loading: state.loading,
    error: state.error,
    sortBy: state.sortBy,
    filter: state.filter,
    bountyFilter: state.bountyFilter,
    filteredComments,
    editingCommentId: state.editingCommentId,
    replyingToCommentId: state.replyingToCommentId,
    workContentType: contentType,
    work,
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
      // Loading will be set by the effect that calls refresh
    },
    setFilter: (filter?: CommentFilter) => {
      dispatch({ type: CommentActionType.SET_FILTER, payload: filter });
    },
    setBountyFilter: (filter: BountyFilterType) => {
      dispatch({ type: CommentActionType.SET_BOUNTY_FILTER, payload: filter });
      // Loading will be set by the effect that calls refresh
    },
    forceRefresh,
    emitCommentEvent,
    addMockReply,
  };

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
};

export function useComments() {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentProvider');
  }
  return context;
}
