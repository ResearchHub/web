import { AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';
import { Notification } from '@/types/notification';
import { NotificationItem } from './NotificationItem';
import {
  NotificationSkeleton,
  NotificationSkeletonList,
} from '@/components/skeletons/NotificationSkeleton';
import { Button } from '@/components/ui/Button';

const LOADING_SKELETON_COUNT = 5;

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreError: string | null;
  onRetryLoadMore: () => void;
}

export function NotificationList({
  notifications,
  loading,
  error,
  isLoadingMore,
  hasMore,
  loadMoreError,
  onRetryLoadMore,
}: Readonly<NotificationListProps>) {
  if (loading) {
    return <NotificationSkeletonList />;
  }

  if (error) {
    return <p className="py-12 text-center text-sm text-red-600">{error}</p>;
  }

  if (!notifications?.length) {
    return <p className="py-12 text-center text-sm text-gray-500">No notifications</p>;
  }

  return (
    <div className="space-y-6">
      <div className="divide-y divide-gray-100 overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
        {isLoadingMore &&
          Array.from({ length: LOADING_SKELETON_COUNT }).map((_, skeletonIndex) => (
            <NotificationSkeleton key={'notification-skeleton-' + skeletonIndex} />
          ))}
        {loadMoreError && !isLoadingMore && (
          <div className="flex items-center justify-between gap-4 bg-gray-50 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 text-gray-500">
              <AlertCircle className="h-4 w-4 text-rose-500" aria-hidden />
              Couldn&apos;t load more notifications
            </span>
            <Button variant="outlined" size="sm" onClick={onRetryLoadMore}>
              <RotateCw className="h-3.5 w-3.5" aria-hidden />
              Retry
            </Button>
          </div>
        )}
      </div>

      {!hasMore && (
        <p className="flex items-center justify-center gap-2 pb-6 text-sm text-gray-400">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          You&apos;re all caught up
        </p>
      )}
    </div>
  );
}
