'use client';

import { useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationList } from '@/components/Notification/NotificationList';
import { NotificationSkeleton } from '@/components/skeletons/NotificationSkeleton';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { Icon } from '@/components/ui/icons';
import { Button } from '@/components/ui/Button';
import { getDemoProposalNotifications } from '@/components/Notification/lib/demoNotifications';

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
    markAllAsRead();
  }, []);

  const handleLoadMore = () => {
    if (!isLoadingMore && notificationData.next) {
      fetchNextPage();
    }
  };

  // Demo: showcase scripted "new proposal submitted" notifications on top of
  // whatever real notifications are loaded for the presentation.
  const demoNotifications = getDemoProposalNotifications();
  const mergedNotifications = [...demoNotifications, ...notificationData.results];

  return (
    <PageLayout rightSidebar={false}>
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-4">
          <MainPageHeader
            icon={<Icon name="notification" size={24} className="text-gray-900" />}
            title="Notifications"
            subtitle="Stay updated with your latest activity"
            showTitle={false}
          />
        </div>

        <div className="py-6">
          <div className="bg-white">
            <NotificationList
              notifications={mergedNotifications}
              loading={loading}
              error={error}
            />

            {isLoadingMore && (
              <div>
                {[...Array(10)].map((_, index) => (
                  <NotificationSkeleton
                    key={`skeleton-${index}`}
                    showBadge={index % 3 === 0}
                    showTitle={index % 4 === 1}
                  />
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
