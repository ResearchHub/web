'use client';

import { useState, useEffect, useRef } from 'react';
import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';

interface UsePostContentReturn {
  work: Work | null;
  htmlContent: string | undefined;
  isLoading: boolean;
  error: string | null;
}

export const usePostContent = (postId: number): UsePostContentReturn => {
  const [work, setWork] = useState<Work | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedWork = await PostService.get(postId.toString());
        setWork(fetchedWork);

        if (!fetchedWork.previewContent && fetchedWork.contentUrl) {
          const content = await PostService.getContent(fetchedWork.contentUrl);
          setHtmlContent(content);
        }
      } catch (err) {
        console.error('Failed to fetch post content:', err);
        setError('Failed to load proposal content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  return { work, htmlContent, isLoading, error };
};
