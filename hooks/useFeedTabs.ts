'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { FeedTab } from './useFeed';

export const useFeedTabs = (onBeforeNavigate?: () => void) => {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const isFeedPage = useMemo(
    () =>
      ['/', '/following', '/latest', '/popular', '/for-you', '/feed'].includes(pathname) ||
      pathname.startsWith('/topic/') ||
      pathname.startsWith('/fund') ||
      pathname.startsWith('/journal'),
    [pathname]
  );

  const isTopicPage = useMemo(() => pathname.startsWith('/topic/'), [pathname]);
  const isFundPage = useMemo(() => pathname.startsWith('/fund'), [pathname]);
  const isJournalPage = useMemo(() => pathname.startsWith('/journal'), [pathname]);

  const topicSlug = useMemo(() => {
    if (isTopicPage) {
      return pathname.split('/')[2];
    }
    return null;
  }, [isTopicPage, pathname]);

  const activeTab = useMemo((): FeedTab | any => {
    if (isTopicPage) {
      const segments = pathname.split('/');
      const lastSegment = segments[segments.length - 1];
      if (['popular', 'latest'].includes(lastSegment)) {
        return lastSegment as FeedTab;
      }
      return 'popular';
    }

    if (isFundPage) {
      if (pathname.includes('/grants')) return 'grants';
      if (pathname.includes('/needs-funding')) return 'needs-funding';
      return 'grants';
    }

    if (isJournalPage) {
      return searchParams.get('tab') || 'all';
    }

    if (pathname === '/') return 'popular';
    if (pathname === '/feed') return 'popular';
    if (pathname === '/following') return 'following';
    if (pathname === '/latest') return 'latest';
    if (pathname === '/popular') return 'popular';
    if (pathname === '/for-you') return 'for-you';
    return 'popular';
  }, [pathname, isTopicPage, isFundPage, isJournalPage, searchParams]);

  const tabs = useMemo(() => {
    if (isTopicPage) {
      return [
        { id: 'popular', label: 'Popular' },
        { id: 'latest', label: 'Latest' },
      ];
    }

    if (isFundPage) {
      return [
        { id: 'grants', label: 'RFPs' },
        { id: 'needs-funding', label: 'Proposals' },
      ];
    }

    if (isJournalPage) {
      return [
        { id: 'all', label: 'All' },
        { id: 'in-review', label: 'In Review' },
        { id: 'published', label: 'Published' },
        { id: 'about', label: 'About this journal' },
      ];
    }

    return user
      ? [
          { id: 'for-you', label: 'For You' },
          { id: 'following', label: 'Following' },
          { id: 'popular', label: 'Popular' },
        ]
      : [
          { id: 'popular', label: 'Popular' },
          { id: 'for-you', label: 'For You' },
          { id: 'following', label: 'Following' },
        ];
  }, [user, isTopicPage, isFundPage, isJournalPage]);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;

    const navigate = () => {
      onBeforeNavigate?.();
      if (isTopicPage && topicSlug) {
        router.push(`/topic/${topicSlug}/${tab}`, { scroll: false });
      } else if (isFundPage) {
        router.push(`/fund/${tab}`, { scroll: false });
      } else if (isJournalPage) {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      } else {
        router.push(tab === 'popular' ? '/popular' : `/${tab}`);
      }
    };

    const protectedTabs = ['following', 'for-you'];
    if (protectedTabs.includes(tab) && !user && !isTopicPage && !isFundPage && !isJournalPage) {
      executeAuthenticatedAction(navigate);
      return;
    }

    navigate();
  };

  return {
    tabs,
    activeTab,
    handleTabChange,
    isFeedPage,
  };
};
