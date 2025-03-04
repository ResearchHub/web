'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Comment, CommentFilter, CommentSort, CommentType, UserVoteType } from '@/types/comment';
import { ContentType } from '@/types/work';
import { CommentService } from '@/services/comment.service';
import { commentEvents } from '@/hooks/useComments';
import {
  findCommentById,
  updateReplyDeep,
  revertOptimisticUpdate,
  updateCommentWithApiResponse,
  updateCommentVoteInList,
  addReplyDeep,
  removeOptimisticReplyDeep,
  mapOptimisticToRealId,
  getRealId,
  recordParentChildRelationship,
  traverseCommentTree,
} from '@/components/Comment/lib/commentUtils';
import { useSession } from 'next-auth/react';

export type BountyFilterType = 'ALL' | 'OPEN' | 'CLOSED';

interface CommentContextType {
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

  // Actions
  fetchComments: (page?: number) => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  createComment: (content: any, rating?: number) => Promise<Comment | null>;
  createReply: (parentId: number, content: any) => Promise<Comment | null>;
  updateComment: (commentId: number, content: any, parentId?: number) => Promise<Comment | null>;
  deleteComment: (commentId: number) => Promise<boolean>;
  voteComment: (comment: Comment, voteType: UserVoteType) => Promise<void>;
  setEditingCommentId: (commentId: number | null) => void;
  setReplyingToCommentId: (commentId: number | null) => void;

  // State setters
  setSortBy: (sort: CommentSort) => void;
  setFilter: (filter?: CommentFilter) => void;
  setBountyFilter: (filter: BountyFilterType) => void;

  // New function
  forceRefresh: () => Promise<void>;
}

const CommentContext = createContext<CommentContextType | null>(null);

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<CommentSort>('BEST');
  const [filter, setFilter] = useState<CommentFilter | undefined>(undefined);
  const [bountyFilter, setBountyFilter] = useState<BountyFilterType>('ALL');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
  const { data: session } = useSession();

  // Debug logging for state changes
  useEffect(() => {
    console.log('CommentContext - editingCommentId changed:', editingCommentId);
  }, [editingCommentId]);

  useEffect(() => {
    console.log('CommentContext - replyingToCommentId changed:', replyingToCommentId);
  }, [replyingToCommentId]);

  // Filter comments based on bounty filter
  const filteredComments = useMemo(() => {
    if (commentType !== 'BOUNTY' || bountyFilter === 'ALL') {
      return comments;
    }

    return comments.filter((comment) => {
      const hasExpired = comment.expirationDate
        ? new Date(comment.expirationDate) < new Date()
        : false;
      const hasBeenAwarded = comment.awardedBountyAmount && comment.awardedBountyAmount > 0;

      if (bountyFilter === 'OPEN') {
        return !hasExpired && !hasBeenAwarded;
      } else if (bountyFilter === 'CLOSED') {
        return hasExpired || hasBeenAwarded;
      }

      return true;
    });
  }, [comments, commentType, bountyFilter]);

  // Fetch comments from API
  const fetchComments = useCallback(
    async (pageToFetch = 1) => {
      try {
        setLoading(true);
        const { comments: fetchedComments, count: totalCount } = await CommentService.fetchComments(
          {
            documentId,
            contentType,
            sort: sortBy,
            filter,
            page: pageToFetch,
          }
        );

        if (pageToFetch === 1) {
          setComments(fetchedComments);
        } else {
          setComments((prev) => [...prev, ...fetchedComments]);
        }

        setCount(totalCount);
        setError(null);
      } catch (err) {
        setError('Failed to load comments');
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    },
    [documentId, contentType, sortBy, filter]
  );

  // Refresh comments (fetch page 1)
  const refresh = useCallback(() => {
    setPage(1);
    return fetchComments(1);
  }, [fetchComments]);

  // Load more comments (next page)
  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    return fetchComments(nextPage);
  }, [page, fetchComments]);

  // Force a refresh of the comments from the server
  const forceRefresh = useCallback(async () => {
    if (debug) {
      console.log('Forcing refresh of comments from server');
    }

    try {
      setLoading(true);
      const { comments: fetchedComments, count: totalCount } = await CommentService.fetchComments({
        documentId,
        contentType,
        sort: sortBy,
        filter,
        page: 1,
      });

      setComments(fetchedComments);
      setCount(totalCount);
      setError(null);

      if (debug) {
        console.log('Comments refreshed from server');
        // Log the comment tree structure for debugging
        fetchedComments.forEach((comment, index) => {
          console.log(
            `Top-level comment ${index + 1}: ID ${comment.id}, Replies: ${comment.replies?.length || 0}`
          );
        });
      }
    } catch (err) {
      setError('Failed to refresh comments');
      console.error('Error refreshing comments:', err);
    } finally {
      setLoading(false);
    }
  }, [documentId, contentType, sortBy, filter, debug]);

  // Helper function to create an optimistic comment
  const createOptimisticComment = useCallback(
    (content: any, parentId: number | null = null): Comment => {
      const optimisticId = Date.now(); // Temporary ID for the optimistic comment
      const currentUser = session?.user
        ? {
            id: session.user.id,
            fullName: session.user.fullName || 'Current User',
            profileImage: session.user.authorProfile?.profileImage || '',
          }
        : {
            id: 'optimistic-user',
            fullName: 'Current User',
            profileImage: '',
          };

      return {
        id: optimisticId,
        content,
        contentFormat: 'TIPTAP',
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        author: currentUser,
        score: 0,
        replies: [],
        replyCount: 0,
        commentType: parentId ? 'GENERIC_COMMENT' : commentType,
        isPublic: true,
        isRemoved: false,
        parentId,
        raw: {},
        bounties: [],
        thread: {
          id: 0,
          threadType: 'GENERIC_COMMENT',
          privacyType: 'PUBLIC',
          objectId: documentId,
          raw: {},
        },
        metadata: {
          isOptimistic: true,
          optimisticId,
          parentId,
        },
      };
    },
    [session, documentId, commentType]
  );

  // Helper function to handle API calls with optimistic updates
  const handleCommentApiCall = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      optimisticComment: Comment,
      addOptimisticUpdate: (comment: Comment) => void,
      updateWithRealData: (realData: T) => void,
      removeOptimisticUpdate: () => void
    ): Promise<T | null> => {
      try {
        // Apply optimistic update
        addOptimisticUpdate(optimisticComment);

        // Make the API call
        const realData = await apiCall();

        // Update with real data
        updateWithRealData(realData);

        // Emit the event for backward compatibility if it's a Comment
        if (realData && typeof realData === 'object' && 'id' in realData) {
          commentEvents.emit('comment_created', {
            comment: realData as unknown as Comment,
            contentType,
            documentId,
          });
        }

        return realData;
      } catch (err) {
        console.error('Error in comment API call:', err);

        // Remove the optimistic update on error
        removeOptimisticUpdate();

        return null;
      }
    },
    [contentType, documentId]
  );

  // Create a new comment
  const createComment = useCallback(
    async (content: any, rating?: number): Promise<Comment | null> => {
      // Create an optimistic comment
      const optimisticComment = createOptimisticComment(content);

      // Define the API call
      const apiCall = () =>
        CommentService.createComment({
          workId: documentId,
          contentType,
          content,
          commentType,
        });

      // Define how to add the optimistic update
      const addOptimisticUpdate = () => {
        setComments((prev) => [optimisticComment, ...prev]);
        setCount((prev) => prev + 1);
      };

      // Define how to update with real data
      const updateWithRealData = (realComment: Comment) => {
        setComments((prev) =>
          prev.map((comment) =>
            comment.metadata?.isOptimistic && comment.id === optimisticComment.id
              ? realComment
              : comment
          )
        );
      };

      // Define how to remove the optimistic update on error
      const removeOptimisticUpdate = () => {
        setComments((prev) => prev.filter((comment) => !comment.metadata?.isOptimistic));
        setCount((prev) => prev - 1);
      };

      // Handle the API call with optimistic updates
      return handleCommentApiCall(
        apiCall,
        optimisticComment,
        addOptimisticUpdate,
        updateWithRealData,
        removeOptimisticUpdate
      );
    },
    [documentId, contentType, commentType, createOptimisticComment, handleCommentApiCall]
  );

  /**
   * Creates a reply to an existing comment
   * @param parentId ID of the parent comment
   * @param content Content of the reply
   * @returns The created reply or null if there was an error
   */
  const createReply = useCallback(
    async (parentId: number, content: any): Promise<Comment | null> => {
      try {
        setError(null);
        console.log(`Creating reply to parent ${parentId} with content:`, content);

        // Get the real parent ID if it exists
        const realParentId = getRealId(parentId);
        console.log(`Real parent ID: ${realParentId}`);

        // Make the API call first
        console.log(`Making API call to create reply to parent ${realParentId}`);
        const response = await CommentService.createComment({
          workId: documentId,
          content,
          parentId: realParentId,
          contentType,
          commentType,
        });
        console.log(`API response for reply creation:`, response);

        if (response) {
          // Only add the reply to the UI after the API call succeeds
          setComments((prevComments) => {
            console.log(`Adding reply ${response.id} to parent ${realParentId}`);
            console.log(`Current comment tree has ${prevComments.length} top-level comments`);

            // Check if this reply already exists to prevent duplicates
            const found = findCommentById(prevComments, response.id);
            if (found) {
              console.log(`Reply ${response.id} already exists, skipping addition`);
              return prevComments;
            }

            // Record the parent-child relationship for future reference
            recordParentChildRelationship(response.id, realParentId);

            const updatedComments = addReplyDeep(prevComments, realParentId, response);
            console.log(
              `After adding reply, comment tree has ${updatedComments.length} top-level comments`
            );
            return updatedComments;
          });

          return response;
        } else {
          console.error('API call failed to create reply');
          setError('Failed to create reply');
          return null;
        }
      } catch (error) {
        console.error('Error creating reply:', error);
        setError('Failed to create reply');

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
    async (commentId: number, content: any, parentId?: number): Promise<Comment | null> => {
      try {
        // Get the real comment ID if it exists
        const realCommentId = getRealId(commentId);

        // Find the comment to update
        const commentToUpdate = findCommentById(comments, realCommentId);

        if (!commentToUpdate) {
          console.error(`Comment with ID ${realCommentId} not found`);
          return null;
        }

        // Store the original content for reverting if needed
        const originalContent = commentToUpdate.content;

        // Create an optimistic update
        const optimisticUpdate: Comment = {
          ...commentToUpdate,
          content,
          updatedDate: new Date().toISOString(),
          metadata: {
            ...commentToUpdate.metadata,
            isOptimisticUpdate: true,
            originalContent,
          },
        };

        // Update the comment tree with the optimistic update
        setComments((prevComments) => {
          console.log(`Updating comment ${realCommentId} with optimistic update`);
          return updateReplyDeep(prevComments, optimisticUpdate);
        });

        // Make the API call
        const response = await CommentService.updateComment({
          commentId: realCommentId,
          documentId,
          contentType,
          content,
        });

        if (response) {
          // Update the comment tree with the real data
          setComments((prevComments) => {
            console.log(`Updating comment ${realCommentId} with real data`);
            return updateCommentWithApiResponse(prevComments, response);
          });

          return response;
        } else {
          // Revert the optimistic update if the API call failed
          setComments((prevComments) => {
            console.log(`Reverting optimistic update for comment ${realCommentId}`);
            return revertOptimisticUpdate(prevComments, realCommentId);
          });

          return null;
        }
      } catch (error) {
        console.error('Error updating comment:', error);
        setError('Failed to update comment');

        // Revert the optimistic update
        setComments((prevComments) => {
          console.log(`Reverting optimistic update for comment ${commentId} due to error`);
          return revertOptimisticUpdate(prevComments, commentId);
        });

        return null;
      }
    },
    [comments, documentId, contentType]
  );

  // Delete a comment
  const deleteComment = useCallback(
    async (commentId: number): Promise<boolean> => {
      try {
        // Find the comment to delete
        const commentToDelete = findCommentById(comments, commentId);

        // If we couldn't find the comment to delete, return false
        if (!commentToDelete) {
          return false;
        }

        // Create an optimistic update for the deleted comment
        const optimisticComment = {
          ...commentToDelete,
          isRemoved: true,
          metadata: {
            ...commentToDelete.metadata,
            isOptimistic: true,
            isDeleted: true,
          },
        };

        // Define the API call
        const apiCall = () =>
          CommentService.deleteComment({
            commentId,
            documentId,
            contentType,
          });

        // Define how to add the optimistic update
        const addOptimisticUpdate = () => {
          // Remove the comment from the list
          setComments((prev) => prev.filter((comment) => comment.id !== commentId));
          setCount((prev) => prev - 1);
        };

        // Define how to update with real data (nothing to do after deletion)
        const updateWithRealData = () => {
          // Emit the event for backward compatibility
          commentEvents.emit('comment_deleted', {
            comment: commentToDelete,
            contentType,
            documentId,
          });
        };

        // Define how to remove the optimistic update on error
        const removeOptimisticUpdate = () => {
          // Add the comment back to the list
          setComments((prev) => [commentToDelete, ...prev.filter((c) => c.id !== commentId)]);
          setCount((prev) => prev + 1);
        };

        // Handle the API call with optimistic updates
        const result = await handleCommentApiCall(
          apiCall,
          optimisticComment,
          addOptimisticUpdate,
          updateWithRealData,
          removeOptimisticUpdate
        );

        return result !== null;
      } catch (err) {
        console.error('Error deleting comment:', err);
        return false;
      }
    },
    [documentId, contentType, comments, handleCommentApiCall]
  );

  // Vote on a comment
  const voteComment = useCallback(
    async (comment: Comment, voteType: UserVoteType): Promise<void> => {
      try {
        // Calculate score change based on previous and new vote states
        let scoreChange = 0;

        if (voteType === 'UPVOTE' && comment.userVote !== 'UPVOTE') {
          // Adding an upvote
          scoreChange = 1;
        } else if (voteType === 'NEUTRAL' && comment.userVote === 'UPVOTE') {
          // Removing an upvote
          scoreChange = -1;
        }

        // Optimistically update the UI
        const updatedCommentData = {
          userVote: voteType,
          score: comment.score + scoreChange,
        };

        // Update the comment in the list
        setComments((prevComments) =>
          updateCommentVoteInList(prevComments, comment.id, updatedCommentData)
        );

        // Make the API call
        await CommentService.voteComment({
          commentId: comment.id,
          documentId,
          voteType,
        });

        // Emit the event for backward compatibility
        commentEvents.emit('comment_voted', {
          comment: { ...comment, ...updatedCommentData },
          contentType,
          documentId,
        });
      } catch (err) {
        console.error('Error voting on comment:', err);
        // Revert the optimistic update on error
        refresh();
      }
    },
    [documentId, contentType, refresh]
  );

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen for comment events from other components
  useEffect(() => {
    const handleCommentCreated = (data: {
      comment: Comment;
      contentType: ContentType;
      documentId: number;
    }) => {
      if (data.documentId === documentId && data.contentType === contentType) {
        setComments((prev) => [data.comment, ...prev]);
        setCount((prev) => prev + 1);
      }
    };

    const handleCommentUpdated = (data: {
      comment: Comment;
      contentType: ContentType;
      documentId: number;
    }) => {
      if (data.documentId === documentId && data.contentType === contentType) {
        setComments((prevComments) => {
          return prevComments.map((comment) => {
            // Update top-level comment
            if (comment.id === data.comment.id) {
              return data.comment;
            }

            // Check if the updated comment is a reply
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id === data.comment.id ? data.comment : reply
                ),
              };
            }

            return comment;
          });
        });
      }
    };

    const handleCommentDeleted = (data: {
      comment: Comment;
      contentType: ContentType;
      documentId: number;
    }) => {
      if (data.documentId === documentId && data.contentType === contentType) {
        setComments((prev) => prev.filter((comment) => comment.id !== data.comment.id));
        setCount((prev) => prev - 1);
      }
    };

    // Subscribe to events
    const unsubscribeCreated = commentEvents.on('comment_created', handleCommentCreated);
    const unsubscribeUpdated = commentEvents.on('comment_updated', handleCommentUpdated);
    const unsubscribeDeleted = commentEvents.on('comment_deleted', handleCommentDeleted);

    // No need to subscribe to comment_voted as we handle it internally

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [documentId, contentType]);

  // Helper function to set editing comment ID
  const handleSetEditingCommentId = useCallback((commentId: number | null) => {
    console.log('Setting editingCommentId to:', commentId);
    setEditingCommentId(commentId);
    // Clear replying state if setting an editing comment
    if (commentId !== null) {
      console.log('Clearing replyingToCommentId because editingCommentId is being set');
      setReplyingToCommentId(null);
    }
  }, []);

  // Helper function to set replying to comment ID
  const handleSetReplyingToCommentId = useCallback((commentId: number | null) => {
    console.log('Setting replyingToCommentId to:', commentId);
    setReplyingToCommentId(commentId);
    // Clear editing state if setting a replying comment
    if (commentId !== null) {
      console.log('Clearing editingCommentId because replyingToCommentId is being set');
      setEditingCommentId(null);
    }
  }, []);

  const value = {
    comments,
    count,
    loading,
    error,
    sortBy,
    filter,
    bountyFilter,
    filteredComments,
    editingCommentId,
    replyingToCommentId,
    fetchComments,
    refresh,
    forceRefresh,
    loadMore,
    createComment,
    createReply,
    updateComment,
    deleteComment,
    voteComment,
    setEditingCommentId: handleSetEditingCommentId,
    setReplyingToCommentId: handleSetReplyingToCommentId,
    setSortBy,
    setFilter,
    setBountyFilter,
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
