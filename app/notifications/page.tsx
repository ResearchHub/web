'use client';

import { useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationList } from '@/components/Notification/NotificationList';
import { NotificationSkeletonList } from '@/components/skeletons/NotificationSkeleton';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
  const {
    notificationData,
    loading,
    isLoadingMore,
    error,
    fetchNotifications,
    fetchNextPage,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    return () => {
      markAllAsRead();
    };
  }, [markAllAsRead]);

  const handleLoadMore = () => {
    if (!isLoadingMore && notificationData.next) {
      fetchNextPage();
    }
  };

  return (
    <PageLayout
      rightSidebar={false}
      topBanner={
        <HeroHeader title="Notifications" subtitle="Stay updated with your latest activity" />
      }
    >
      <div className="max-w-3xl mx-auto">
        <NotificationList
          notifications={notificationData.results}
          loading={loading}
          error={error}
        />

        {isLoadingMore && <NotificationSkeletonList />}

        {!loading && notificationData.next && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              variant="link"
              className="text-indigo-600 hover:text-indigo-500"
            >
              {isLoadingMore ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
