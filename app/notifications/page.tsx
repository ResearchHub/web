'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationList } from '@/components/Notification/NotificationList';

export default function NotificationsPage() {
  const {
    notificationData,
    loading,
    isLoadingMore,
    error,
    loadMoreError,
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
    <PageLayout rightSidebar={true} contentWidth="narrow" className="lg:mt-4">
      <h1 className="sr-only">Notifications</h1>
      <NotificationList
        notifications={notificationData.results}
        loading={loading}
        error={error}
        isLoadingMore={isLoadingMore}
        hasMore={!!notificationData.next}
        loadMoreError={loadMoreError}
        onRetryLoadMore={fetchNextPage}
      />

      {!loading && !isLoadingMore && !loadMoreError && notificationData.next && (
        <div ref={sentinelRef} className="h-10" aria-hidden="true" />
      )}
    </PageLayout>
  );
}
