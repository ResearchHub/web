'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommentService, CreateCommentOptions } from '@/services/comment.service';
import { Comment, CommentFilter, CommentSort } from '@/types/comment';
import { ContentType } from '@/types/work';
import { ApiError } from '@/services/types';

// Comment event types removed as they're now handled by CommentContext

interface UseCommentsOptions {
  documentId: number;
  contentType: ContentType;
  filter?: CommentFilter;
  sort?: CommentSort;
}

interface CommentState {
  data: Comment | null;
  isLoading: boolean;
  error: string | null;
}

export const useComments = ({
  documentId,
  contentType,
  filter,
  sort = 'BEST',
}: UseCommentsOptions) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch comments
  const fetchComments = useCallback(
    async (pageToFetch = 1) => {
      try {
        setLoading(true);
        setError(null);
        alert(1);
        const response = await CommentService.fetchComments({
          documentId,
          contentType,
          page: pageToFetch,
          filter,
          sort,
        });

        if (pageToFetch === 1) {
          setComments(response.comments);
        } else {
          setComments((prev) => [...prev, ...response.comments]);
        }

        setCount(response.count);
        setHasMore(response.comments.length > 0); // If we got comments, there might be more
        setPage(pageToFetch);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    },
    [documentId, contentType, filter, sort]
  );

  // Initial fetch
  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  // Load more comments
  function loadMore() {
    if (hasMore && !loading) {
      fetchComments(page + 1);
    }
  }

  // Refresh comments
  function refresh() {
    fetchComments(1);
  }

  return {
    comments,
    count,
    loading,
    error,
    loadMore,
    hasMore,
    refresh,
  };
};

type CreateCommentFn = (input: CreateCommentOptions) => Promise<Comment | null>;
type UseCommentReturn = [CommentState, CreateCommentFn];

export const useCreateComment = (): UseCommentReturn => {
  const [state, setState] = useState<CommentState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const createComment = async (input: CreateCommentOptions): Promise<Comment | null> => {
    try {
      setState({ ...state, isLoading: true, error: null });
      const comment = await CommentService.createComment(input);
      setState({ data: comment, isLoading: false, error: null });

      // Comment event emission removed - now handled by CommentContext

      return comment;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to create comment';
      setState({ data: null, isLoading: false, error: errorMessage });
      return null;
    }
  };

  return [state, createComment];
};
