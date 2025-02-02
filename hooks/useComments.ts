'use client';

import { useState, useEffect } from 'react';
import { Comment, CommentFilter, Bounty } from '@/services/comment.service';
import { comments as mockComments } from '@/store/commentStore';

export interface UseCommentsOptions {
  documentId: number;
  filter?: CommentFilter;
  pageSize?: number;
}

export const useComments = ({
  documentId,
  filter = 'DISCUSSION',
  pageSize = 15,
}: UseCommentsOptions) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const transformComment = (result: any): Comment => ({
    id: result.id,
    content: result.comment_content_json,
    contentFormat: result.comment_content_type === 'QUILL_EDITOR' ? 'QUILL' : 'HTML',
    createdDate: result.created_date,
    updatedDate: result.updated_date,
    author: {
      id: result.created_by.author_profile.id,
      fullName:
        `${result.created_by.author_profile.first_name} ${result.created_by.author_profile.last_name}`.trim(),
      profileImage: result.created_by.author_profile.profile_image || '',
      profileUrl: `/author/${result.created_by.author_profile.id}`,
    },
    score: result.score,
    replyCount: result.children_count,
    replies: (result.children || []).map(transformComment),
    bounties: (result.bounties as any[]).map((bounty) => ({
      id: bounty.id,
      amount: bounty.amount,
      status: bounty.status,
      expirationDate: bounty.expiration_date,
      bountyType: bounty.bounty_type,
      createdBy: {
        id: bounty.created_by.id,
        fullName: `${bounty.created_by.first_name} ${bounty.created_by.last_name}`.trim(),
        profileImage: bounty.created_by.profile_image || '',
        profileUrl: `/author/${bounty.created_by.id}`,
      },
      raw: bounty,
    })),
    thread: {
      id: result.thread.id,
      threadType: result.thread.thread_type,
      privacyType: result.thread.privacy_type,
      objectId: result.thread.object_id,
      raw: result.thread,
    },
    isPublic: result.is_public,
    isRemoved: result.is_removed,
    isAcceptedAnswer: result.is_accepted_answer,
    raw: result,
  });

  const loadComments = async () => {
    try {
      setIsLoading(true);
      // Use mock data instead of API call
      const response = mockComments;

      // Transform the mock data to match our Comment type
      const transformedComments = response.results.map(transformComment);

      setComments((prev) => (page === 1 ? transformedComments : [...prev, ...transformedComments]));
      setCount(response.count);
      setHasMore(response.next !== null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load comments'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadComments();
  }, [documentId, filter]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
    loadComments();
  };

  const refresh = () => {
    setPage(1);
    loadComments();
  };

  return {
    comments,
    count,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};
