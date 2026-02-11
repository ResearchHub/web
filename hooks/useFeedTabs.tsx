'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useSession } from 'next-auth/react';
import { FeedTab } from './useFeed';

export const useFeedTabs = (onBeforeNavigate?: () => void) => {
  const { user } = useUser();
  const { status } = useSession();
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

  const isTopicPage = pathname.startsWith('/topic/');
  const isFundPage = pathname.startsWith('/fund');
  const isJournalPage = pathname.startsWith('/journal');

  const topicSlug = isTopicPage ? pathname.split('/')[2] : null;

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
      if (pathname.includes('/opportunities')) return 'opportunities';
      if (pathname.includes('/needs-funding')) return 'needs-funding';
      return 'needs-funding';
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
    const getHref = (id: string) => {
      if (isTopicPage && topicSlug) {
        return `/topic/${topicSlug}/${id}`;
      } else if (isFundPage) {
        return `/fund/${id}`;
      } else if (isJournalPage) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', id);
        return `${pathname}?${params.toString()}`;
      } else {
        return id === 'popular' ? '/popular' : `/${id}`;
      }
    };

    if (isTopicPage) {
      return [
        { id: 'popular', label: 'Popular', href: getHref('popular'), scroll: false },
        { id: 'latest', label: 'Latest', href: getHref('latest'), scroll: false },
      ];
    }

    if (isFundPage) {
      return [
        {
          id: 'needs-funding',
          label: 'Needs Funding',
          href: getHref('needs-funding'),
          scroll: false,
        },
        {
          id: 'opportunities',
          label: 'Funding Opportunities',
          href: getHref('opportunities'),
          scroll: false,
        },
      ];
    }

    if (isJournalPage) {
      return [
        { id: 'all', label: 'All', href: getHref('all'), scroll: false },
        { id: 'in-review', label: 'In Review', href: getHref('in-review'), scroll: false },
        { id: 'published', label: 'Published', href: getHref('published'), scroll: false },
        { id: 'about', label: 'About this journal', href: getHref('about'), scroll: false },
      ];
    }

    const isLoggedOut = status === 'unauthenticated';

    const feedTabs = isLoggedOut
      ? [
          { id: 'popular', label: 'Popular' },
          { id: 'for-you', label: 'For You' },
          { id: 'following', label: 'Following' },
        ]
      : [
          { id: 'for-you', label: 'For You' },
          { id: 'following', label: 'Following' },
          { id: 'popular', label: 'Popular' },
        ];

    return feedTabs.map((tab) => ({
      ...tab,
      href: getHref(tab.id),
      scroll: false,
    }));
  }, [status, isTopicPage, isFundPage, isJournalPage, topicSlug, pathname, searchParams]);

  const handleTabChange = (tab: string, e?: React.MouseEvent) => {
    if (tab === activeTab) {
      e?.preventDefault();
      return;
    }

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
        router.push(tab === 'popular' ? '/popular' : `/${tab}`, { scroll: false });
      }
    };

    const protectedTabs = ['following', 'for-you'];
    if (protectedTabs.includes(tab) && !user && !isTopicPage && !isFundPage && !isJournalPage) {
      e?.preventDefault();
      executeAuthenticatedAction(navigate);
      return;
    }

    // If we have an event and it's a normal link navigation, let the browser handle it
    // but still call onBeforeNavigate
    if (e && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      onBeforeNavigate?.();
    } else if (!e) {
      // If no event (programmatic change), navigate manually
      navigate();
    }
  };

  return {
    tabs,
    activeTab,
    handleTabChange,
    isFeedPage,
  };
};
