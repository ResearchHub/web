import { Notification } from '@/types/notification';
import { NotificationItem } from './NotificationItem';
import { NotificationSkeleton } from './NotificationSkeleton';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

export function NotificationList({ notifications, loading, error }: NotificationListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <NotificationSkeleton key={index} />
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
    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white overflow-hidden">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
