'use client';

import { useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationList } from '@/components/Notification/NotificationList';
import { NotificationSkeleton } from '@/components/Notification/NotificationSkeleton';
import { PageHeader } from '@/components/ui/PageHeader';
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
    unreadCount,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleLoadMore = () => {
    if (!isLoadingMore && notificationData.next) {
      fetchNextPage();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <PageLayout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <PageHeader title="Notifications" className="mb-0" />
          {unreadCount > 0 && !loading && (
            <Button onClick={handleMarkAllAsRead} variant="secondary" size="sm">
              Mark all as read
            </Button>
          )}
        </div>

        <div className="py-6">
          <div className="bg-white">
            <NotificationList
              notifications={notificationData.results}
              loading={loading}
              error={error}
            />

            {isLoadingMore && (
              <div>
                {[...Array(10)].map((_, index) => (
                  <NotificationSkeleton key={`skeleton-${index}`} />
                ))}
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
                  {isLoadingMore ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
