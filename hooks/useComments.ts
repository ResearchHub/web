'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommentService, CreateCommentOptions } from '@/services/comment.service';
import { Comment, CommentFilter, CommentSort } from '@/types/comment';
import { ContentType } from '@/types/work';
import { ApiError } from '@/services/types';

// Create a simple event emitter for comment-related events
type CommentEventType = 'comment_created' | 'comment_updated' | 'comment_deleted';
type CommentEventListener = (data: {
  comment: Comment;
  contentType: ContentType;
  documentId: number;
}) => void;

class CommentEventEmitter {
  private listeners: Record<CommentEventType, CommentEventListener[]> = {
    comment_created: [],
    comment_updated: [],
    comment_deleted: [],
  };

  on(event: CommentEventType, callback: CommentEventListener) {
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    };
  }

  emit(
    event: CommentEventType,
    data: { comment: Comment; contentType: ContentType; documentId: number }
  ) {
    this.listeners[event].forEach((callback) => callback(data));
  }
}

// Create a singleton instance
export const commentEvents = new CommentEventEmitter();

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchComments = useCallback(
    async (pageNum: number = 1) => {
      try {
        setIsLoading(true);
        const response = await CommentService.fetchComments({
          documentId,
          contentType,
          filter,
          sort,
          page: pageNum,
        });

        if (pageNum === 1) {
          setComments(response.comments);
        } else {
          setComments((prev) => [...prev, ...response.comments]);
        }

        setCount(response.count);
        setHasMore(response.comments.length === 15); // pageSize is 15
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err : new Error('Failed to fetch comments'));
      } finally {
        setIsLoading(false);
      }
    },
    [documentId, contentType, filter, sort]
  );

  // Initial fetch
  useEffect(() => {
    fetchComments(1);
  }, [documentId, contentType, filter, sort, fetchComments]);

  // Listen for new comments/bounties
  useEffect(() => {
    const unsubscribe = commentEvents.on('comment_created', (data) => {
      // Only refresh if the new comment belongs to this document and content type
      if (data.documentId === documentId && data.contentType === contentType) {
        // Option 1: Optimistic update - add the new comment to the list without a full refresh
        setComments((prev) => [data.comment, ...prev]);
        setCount((prev) => prev + 1);

        // Option 2: Full refresh - uncomment if you need to ensure data consistency
        // fetchComments(1);
      }
    });

    return unsubscribe;
  }, [documentId, contentType, fetchComments]);

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  }

  function refresh() {
    setPage(1);
    fetchComments(1);
  }

  return {
    comments,
    setComments,
    count,
    setCount,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};

type CreateCommentFn = (input: CreateCommentOptions) => Promise<Comment | null>;
type UseCommentReturn = [CommentState, CreateCommentFn];

export const useCreateComment = (): UseCommentReturn => {
  const [data, setData] = useState<Comment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createComment = async (input: CreateCommentOptions): Promise<Comment | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await CommentService.createComment(input);
      setData(response);

      // Emit event to notify other components about the new comment
      commentEvents.emit('comment_created', {
        comment: response,
        contentType: input.contentType,
        documentId:
          typeof input.workId === 'string' ? parseInt(input.workId, 10) : Number(input.workId) || 0,
      });

      return response;
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.detail || 'Failed to create comment';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, createComment];
};
