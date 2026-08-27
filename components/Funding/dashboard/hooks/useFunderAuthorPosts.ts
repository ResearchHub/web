'use client';

import { useMemo } from 'react';
import { feedEntryToPostCard, type PostCardData } from '@/components/Comment/lib/postCard';
import { useFunderActivity } from './useFunderActivity';

interface UseFunderAuthorPostsResult {
  cards: PostCardData[];
  totalCount: number;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

export function useFunderAuthorPosts(funderId: number | undefined): UseFunderAuthorPostsResult {
  const { entries, totalCount, isLoading, hasMore, loadMore } = useFunderActivity(funderId);

  const cards = useMemo<PostCardData[]>(
    () => entries.map(feedEntryToPostCard).filter((c): c is PostCardData => c !== null),
    [entries]
  );

  return { cards, totalCount, isLoading, hasMore, loadMore };
}
