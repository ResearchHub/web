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
  loadMoreReplies: (commentId: number) => Promise<void>;
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

  // Function to load more replies for a specific comment
  const loadMoreReplies = useCallback(
    async (commentId: number) => {
      console.log(`[loadMoreReplies] Starting to load more replies for comment ${commentId}`);

      try {
        setLoading(true);

        // Find the comment in the tree
        const comment = findCommentById(comments, commentId);

        if (!comment) {
          console.error(`[loadMoreReplies] Comment with ID ${commentId} not found`);
          setLoading(false);
          return;
        }

        console.log(
          `[loadMoreReplies] Found comment ${commentId}, loaded replies: ${comment.replies.length}, total children: ${comment.childrenCount}`
        );

        // Calculate the page number based on already loaded replies
        const page = Math.floor(comment.replies.length / 10) + 1;
        const childOffset = comment.replies.length;
        console.log(
          `[loadMoreReplies] Fetching more replies for comment ${commentId}, page: ${page}, childOffset: ${childOffset}`
        );

        // Fetch more replies
        const { replies, count } = await CommentService.fetchCommentReplies({
          commentId,
          documentId,
          contentType,
          page,
          pageSize: 10,
          sort: sortBy,
        });

        console.log(
          `[loadMoreReplies] Fetched ${replies.length} more replies for comment ${commentId}, total children count: ${count}`
        );

        if (replies.length > 0) {
          // Update the comments state with the new replies
          setComments((prevComments) => {
            // Use traverseCommentTree to find and update the comment at any level in the tree
            return traverseCommentTree(prevComments, (currentComment) => {
              if (currentComment.id === commentId) {
                console.log(
                  `[loadMoreReplies] Adding ${replies.length} new replies to comment ${commentId}`
                );

                // Filter out any replies that are already in the comment's replies array
                const existingReplyIds = new Set(currentComment.replies.map((reply) => reply.id));
                const newReplies = replies.filter((reply) => !existingReplyIds.has(reply.id));

                console.log(
                  `[loadMoreReplies] After filtering duplicates, adding ${newReplies.length} new replies`
                );

                if (newReplies.length === 0) {
                  console.log(`[loadMoreReplies] No new replies to add after filtering duplicates`);
                  return currentComment;
                }

                // Create a new comment object with the updated replies
                return {
                  ...currentComment,
                  replies: [...currentComment.replies, ...newReplies],
                };
              }

              // Return the comment unchanged if it's not the one we're looking for
              return currentComment;
            });
          });

          // Log the updated state for debugging
          setTimeout(() => {
            const updatedComment = findCommentById(comments, commentId);
            if (updatedComment) {
              console.log(
                `[loadMoreReplies] After update, comment ${commentId} now has ${updatedComment.replies.length} replies`
              );
            }
          }, 100);
        } else {
          console.log(`[loadMoreReplies] No more replies to load for comment ${commentId}`);
        }

        setLoading(false);
      } catch (error) {
        console.error('[loadMoreReplies] Error loading more replies:', error);
        setError('Failed to load more replies');
        setLoading(false);
      }
    },
    [comments, documentId, contentType, sortBy]
  );

  // Helper function to create an optimistic comment
  const createOptimisticComment = useCallback(
    (content: any): Comment => {
      const optimisticId = -Date.now();
      return {
        id: optimisticId,
        content,
        contentFormat: 'TIPTAP',
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        author: {
          id: session?.user?.id || 0,
          fullName: session?.user?.firstName + ' ' + session?.user?.lastName || 'Current User',
          profileImage: session?.user?.authorProfile?.profileImage || '',
        },
        score: 0,
        replies: [],
        replyCount: 0,
        childrenCount: 0,
        commentType: 'GENERIC_COMMENT',
        isPublic: true,
        isRemoved: false,
        bounties: [],
        thread: {
          id: 0,
          threadType: 'GENERIC_COMMENT',
          privacyType: 'PUBLIC',
          objectId: documentId,
          raw: {},
        },
        raw: {},
        metadata: {
          isOptimistic: true,
        },
      };
    },
    [session, documentId]
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

        // We're removing this event emission to prevent duplicate comments
        // The comment is already added to the state through the optimistic update
        // and then updated with the real data
        /* 
        if (realData && typeof realData === 'object' && 'id' in realData) {
          commentEvents.emit('comment_created', {
            comment: realData as unknown as Comment,
            contentType,
            documentId,
          });
        }
        */

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
      setLoading(true);
      setError(null);

      try {
        // Make the API call directly without optimistic update
        const response = await CommentService.createComment({
          workId: documentId,
          contentType,
          content,
          commentType,
        });

        // Only update the UI after successful API response
        if (response) {
          console.log(`Comment created successfully with ID: ${response.id}`);

          // Check if this comment already exists in the state to prevent duplicates
          setComments((prev) => {
            const commentExists = prev.some((comment) => comment.id === response.id);
            if (commentExists) {
              console.log(`Comment ${response.id} already exists in state, skipping addition`);
              return prev;
            }
            return [response, ...prev];
          });

          setCount((prev) => prev + 1);
        }

        setLoading(false);
        return response;
      } catch (err) {
        console.error('Error creating comment:', err);
        setError('Failed to create comment');
        setLoading(false);
        return null;
      }
    },
    [documentId, contentType, commentType]
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

        // Check if this reply already exists in the comment tree
        const existingReply = findCommentById(comments, response.id);
        if (existingReply) {
          console.log(`Reply ${response.id} already exists in the tree, skipping addition`);
          return response;
        }

        // Update the state with the new reply
        setComments((prevComments) => {
          return addReplyDeep(prevComments, realParentId, response);
        });

        // Clear the replying state
        setReplyingToCommentId(null);

        return response;
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
        setComments((prev) => {
          // Check if the comment already exists in the state to prevent duplicates
          const commentExists = prev.some((comment) => comment.id === data.comment.id);
          if (commentExists) {
            console.log(`Comment ${data.comment.id} already exists in state, skipping addition`);
            return prev;
          }
          return [data.comment, ...prev];
        });
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
    loadMoreReplies,
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
