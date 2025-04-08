import { Notification } from '@/types/notification';
import { NotificationItem } from './NotificationItem';
import { NotificationSkeleton } from '@/components/skeletons/NotificationSkeleton';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

export function NotificationList({ notifications, loading, error }: NotificationListProps) {
  if (loading) {
    return (
      <div>
        {[...Array(10)].map((_, index) => (
          <NotificationSkeleton key={`initial-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200">
        {error}
      </div>
    );
  }

  if (!notifications?.length) {
    return (
      <div className="p-4 text-sm rounded-lg bg-gray-50 text-gray-600 border border-gray-200">
        No notifications
      </div>
    );
  }

  return (
    <div className="bg-white">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
