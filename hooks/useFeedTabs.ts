import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { FeedTab } from './useFeed';

export const useFeedTabs = (onBeforeNavigate?: () => void) => {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const isFeedPage = useMemo(
    () => ['/', '/following', '/latest', '/popular', '/for-you'].includes(pathname),
    [pathname]
  );

  const activeTab = useMemo((): FeedTab => {
    if (pathname === '/') return 'popular';
    if (pathname === '/following') return 'following';
    if (pathname === '/latest') return 'latest';
    if (pathname === '/popular') return 'popular';
    if (pathname === '/for-you') return 'for-you';
    return 'popular';
  }, [pathname]);

  const tabs = useMemo(() => {
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
  }, [user]);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;

    const navigate = () => {
      onBeforeNavigate?.();
      router.push(tab === 'popular' ? '/popular' : `/${tab}`);
    };

    const protectedTabs = ['following', 'for-you'];
    if (protectedTabs.includes(tab) && !user) {
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
