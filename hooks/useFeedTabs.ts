'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useSession } from 'next-auth/react';
import { FeedTab } from './useFeed';
import { Sparkles, Users, TrendingUp } from 'lucide-react';

export const useFeedTabs = (onBeforeNavigate?: () => void) => {
  const { user } = useUser();
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const isTopicPage = pathname.startsWith('/topic/');
  const isJournalPage = pathname.startsWith('/journal');
  const isHomeFeedPage = ['/', '/following', '/latest', '/popular', '/for-you', '/feed'].includes(
    pathname
  );

  const isFeedPage = useMemo(
    () => isHomeFeedPage || isTopicPage || isJournalPage,
    [isHomeFeedPage, isTopicPage, isJournalPage]
  );

  const topicSlug = isTopicPage ? pathname.split('/')[2] : null;

  // The feed-level active tab (used for data fetching in Feed/TopicFeed)
  const activeTab = useMemo((): FeedTab | any => {
    if (isTopicPage) {
      const segments = pathname.split('/');
      const lastSegment = segments[segments.length - 1];
      if (['popular', 'latest'].includes(lastSegment)) {
        return lastSegment as FeedTab;
      }
      return 'popular';
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
  }, [pathname, isTopicPage, isJournalPage, searchParams]);

  // The highlighted tab ID in the TopBar (accounts for topic pages)
  const highlightedTab = useMemo(() => {
    if (isTopicPage && topicSlug) {
      return `topic-${topicSlug}`;
    }
    return activeTab;
  }, [isTopicPage, topicSlug, activeTab]);

  const tabs = useMemo(() => {
    if (isJournalPage) {
      const getJournalHref = (id: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', id);
        return `${pathname}?${params.toString()}`;
      };
      return [
        { id: 'all', label: 'All', href: getJournalHref('all'), scroll: false },
        { id: 'in-review', label: 'In Review', href: getJournalHref('in-review'), scroll: false },
        {
          id: 'published',
          label: 'Published',
          href: getJournalHref('published'),
          scroll: false,
        },
        {
          id: 'about',
          label: 'About this journal',
          href: getJournalHref('about'),
          scroll: false,
        },
      ];
    }

    // Home feed pages and topic pages share the same unified tab set
    const isLoggedOut = status === 'unauthenticated';

    const coreTabs = isLoggedOut
      ? [
          { id: 'popular', label: 'Popular', icon: TrendingUp },
          { id: 'for-you', label: 'For You', icon: Sparkles },
          { id: 'following', label: 'Following', icon: Users },
        ]
      : [
          { id: 'for-you', label: 'For You', icon: Sparkles },
          { id: 'following', label: 'Following', icon: Users },
          { id: 'popular', label: 'Popular', icon: TrendingUp },
        ];

    return coreTabs.map((tab) => {
      const href = tab.id === 'popular' ? '/popular' : `/${tab.id}`;
      return { ...tab, href, scroll: false };
    });
  }, [status, isJournalPage, searchParams, pathname]);

  // Sub-tabs for topic pages (Popular / Latest within a topic)
  const topicSubTabs = useMemo(() => {
    if (!isTopicPage || !topicSlug) return null;
    return [
      {
        id: 'popular',
        label: 'Popular',
        href: `/topic/${topicSlug}/popular`,
        scroll: false,
      },
      {
        id: 'latest',
        label: 'Latest',
        href: `/topic/${topicSlug}/latest`,
        scroll: false,
      },
    ];
  }, [isTopicPage, topicSlug]);

  const handleTabChange = (tab: string, e?: React.MouseEvent) => {
    if (tab === highlightedTab) {
      e?.preventDefault();
      return;
    }

    const navigate = () => {
      onBeforeNavigate?.();

      if (isJournalPage) {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      } else {
        router.push(tab === 'popular' ? '/popular' : `/${tab}`, { scroll: false });
      }
    };

    const protectedTabs = ['following', 'for-you'];
    if (protectedTabs.includes(tab) && !user && !isJournalPage) {
      e?.preventDefault();
      executeAuthenticatedAction(navigate);
      return;
    }

    if (e && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      onBeforeNavigate?.();
    } else if (!e) {
      navigate();
    }
  };

  const handleTopicSubTabChange = (tab: string, e?: React.MouseEvent) => {
    if (tab === activeTab) {
      e?.preventDefault();
      return;
    }

    const navigate = () => {
      onBeforeNavigate?.();
      if (topicSlug) {
        router.push(`/topic/${topicSlug}/${tab}`, { scroll: false });
      }
    };

    if (e && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      onBeforeNavigate?.();
    } else if (!e) {
      navigate();
    }
  };

  return {
    tabs,
    activeTab,
    highlightedTab,
    handleTabChange,
    isFeedPage,
    isTopicPage,
    topicSubTabs,
    handleTopicSubTabChange,
  };
};
