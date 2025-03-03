'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Comment, CommentFilter, CommentSort, CommentType, UserVoteType } from '@/types/comment';
import { ContentType } from '@/types/work';
import { CommentService } from '@/services/comment.service';
import { commentEvents } from '@/hooks/useComments';
import {
  findCommentById,
  updateCommentInList,
  revertOptimisticUpdate,
  updateCommentWithApiResponse,
  updateCommentVoteInList,
} from '@/components/Comment/lib/commentUtils';

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

  // Actions
  fetchComments: (page?: number) => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  createComment: (content: any, rating?: number) => Promise<Comment | null>;
  updateComment: (commentId: number, content: any, parentId?: number) => Promise<Comment | null>;
  deleteComment: (commentId: number) => Promise<void>;
  voteComment: (comment: Comment, voteType: UserVoteType) => Promise<void>;

  // State setters
  setSortBy: (sort: CommentSort) => void;
  setFilter: (filter?: CommentFilter) => void;
  setBountyFilter: (filter: BountyFilterType) => void;
}

const CommentContext = createContext<CommentContextType | null>(null);

export function CommentProvider({
  children,
  documentId,
  contentType,
  commentType = 'GENERIC_COMMENT',
}: {
  children: React.ReactNode;
  documentId: number;
  contentType: ContentType;
  commentType?: CommentType;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<CommentSort>('BEST');
  const [filter, setFilter] = useState<CommentFilter | undefined>(undefined);
  const [bountyFilter, setBountyFilter] = useState<BountyFilterType>('ALL');

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

  // Create a new comment
  const createComment = useCallback(
    async (content: any, rating?: number): Promise<Comment | null> => {
      try {
        // Create an optimistic comment
        const optimisticId = Date.now(); // Temporary ID for the optimistic comment
        const currentUser = {
          id: 'optimistic-user',
          fullName: 'Current User',
          profileImage: '',
          // Add other user properties as needed
        };

        const optimisticComment: Comment = {
          id: optimisticId,
          content,
          contentFormat: 'TIPTAP',
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          author: currentUser,
          score: 0,
          replies: [],
          replyCount: 0,
          commentType,
          isPublic: true,
          isRemoved: false,
          parentId: null,
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
          },
        };

        // Add the optimistic comment to the list
        setComments((prev) => [optimisticComment, ...prev]);
        setCount((prev) => prev + 1);

        // Make the actual API call
        const newComment = await CommentService.createComment({
          workId: documentId,
          contentType,
          content,
          commentType,
        });

        // Replace the optimistic comment with the real one
        setComments((prev) =>
          prev.map((comment) =>
            comment.metadata?.isOptimistic && comment.id === optimisticId ? newComment : comment
          )
        );

        return newComment;
      } catch (err) {
        console.error('Error creating comment:', err);

        // Remove the optimistic comment on error
        setComments((prev) => prev.filter((comment) => !comment.metadata?.isOptimistic));
        setCount((prev) => prev - 1);

        return null;
      }
    },
    [documentId, contentType, commentType]
  );

  // Update an existing comment
  const updateComment = useCallback(
    async (commentId: number, content: any, parentId?: number): Promise<Comment | null> => {
      try {
        // Find the comment to update
        const { comment: commentToUpdate, originalContent } = findCommentById(
          comments,
          commentId,
          parentId
        );

        // If we couldn't find the comment to update, return null
        if (!commentToUpdate) {
          return null;
        }

        // Apply optimistic update
        setComments((prevComments) =>
          updateCommentInList(prevComments, commentId, content, parentId)
        );

        // Make the actual API call
        const updatedComment = await CommentService.updateComment({
          commentId,
          documentId,
          contentType,
          content,
        });

        // Update the comment in the list with the real data
        setComments((prevComments) =>
          updateCommentWithApiResponse(prevComments, updatedComment, parentId)
        );

        return updatedComment;
      } catch (err) {
        console.error('Error updating comment:', err);

        // Revert the optimistic update
        setComments((prevComments) => revertOptimisticUpdate(prevComments, commentId, parentId));

        // Return null to indicate failure
        return null;
      }
    },
    [documentId, contentType, comments]
  );

  // Delete a comment
  const deleteComment = useCallback(
    async (commentId: number): Promise<void> => {
      try {
        await CommentService.deleteComment({
          commentId,
          documentId,
          contentType,
        });

        // Remove the comment from the list
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
        setCount((prev) => prev - 1);
      } catch (err) {
        console.error('Error deleting comment:', err);
      }
    },
    [documentId, contentType]
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

  const value = {
    comments,
    count,
    loading,
    error,
    sortBy,
    filter,
    bountyFilter,
    filteredComments,
    fetchComments,
    refresh,
    loadMore,
    createComment,
    updateComment,
    deleteComment,
    voteComment,
    setSortBy,
    setFilter,
    setBountyFilter,
  };

  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>;
}

export function useComments() {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentProvider');
  }
  return context;
}
