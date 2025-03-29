'use client';

import { useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationList } from '@/components/Notification/NotificationList';
import { NotificationSkeleton } from '@/components/Notification/NotificationSkeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
  const { notificationData, loading, isLoadingMore, error, fetchNotifications, fetchNextPage } =
    useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleLoadMore = () => {
    if (!isLoadingMore && notificationData.next) {
      fetchNextPage();
    }
  };

  return (
    <PageLayout>
      <div className="w-full">
        <PageHeader title="Notifications" />

        <div className="py-6">
          <NotificationList
            notifications={notificationData.results}
            loading={loading}
            error={error}
          />

          {isLoadingMore && (
            <div className="space-y-4 mt-4">
              <NotificationSkeleton key="skeleton-1" />
              <NotificationSkeleton key="skeleton-2" />
              <NotificationSkeleton key="skeleton-3" />
            </div>
          )}

          {!loading && notificationData.next && (
            <div className="mt-8 text-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="link"
                className="text-indigo-600 hover:text-indigo-500"
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
