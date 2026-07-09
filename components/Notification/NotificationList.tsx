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
    return <p className="py-12 text-center text-sm text-red-600">{error}</p>;
  }

  if (!notifications?.length) {
    return <p className="py-12 text-center text-sm text-gray-500">No notifications</p>;
  }

  return (
    <div>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
