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

function SectionLabel({ children }: Readonly<{ children: string }>) {
  return (
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </h2>
  );
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

  // Leaving the page marks every notification read, so unread ones are always the newest
  // and sit together at the top of the newest-first list.
  const unread = notifications.filter((notification) => !notification.read);
  const read = notifications.filter((notification) => notification.read);

  return (
    <div className="space-y-7">
      {unread.length > 0 && (
        <section>
          <SectionLabel>Unread</SectionLabel>
          <div className="space-y-2.5">
            {unread.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </section>
      )}

      {(read.length > 0 || isLoadingMore || loadMoreError) && (
        <section>
          {unread.length > 0 && read.length > 0 && <SectionLabel>Earlier</SectionLabel>}
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
            {read.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
            {isLoadingMore &&
              [...Array(LOADING_SKELETON_COUNT)].map((_, index) => (
                <NotificationSkeleton key={index} />
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
        </section>
      )}

      {!hasMore && (
        <p className="-mt-1 flex items-center justify-center gap-2 pb-6 text-sm text-gray-400">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          You&apos;re all caught up
        </p>
      )}
    </div>
  );
}
