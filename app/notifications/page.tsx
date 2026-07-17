'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { PageLayout } from '@/app/layouts/PageLayout';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationList } from '@/components/Notification/NotificationList';
import { NotificationSkeletonList } from '@/components/skeletons/NotificationSkeleton';

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

  const { ref: sentinelRef } = useInView({
    threshold: 0,
    rootMargin: '200px',
    onChange: (inView) => {
      if (inView && notificationData.next && !loading && !isLoadingMore) {
        fetchNextPage();
      }
    },
  });

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

        {isLoadingMore && <NotificationSkeletonList count={5} />}

        {!loading && !isLoadingMore && notificationData.next && (
          <div ref={sentinelRef} className="h-10" aria-hidden="true" />
        )}
      </div>
    </PageLayout>
  );
}
