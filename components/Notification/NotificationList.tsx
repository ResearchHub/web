import { Notification } from '@/types/notification'
import { NotificationItem } from './NotificationItem'
import { NotificationSkeleton } from './NotificationSkeleton'

interface NotificationListProps {
  notifications: Notification[]
  loading: boolean
  error: string | null
}

export function NotificationList({ 
  notifications, 
  loading, 
  error, 
}: NotificationListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, index) => (
          <NotificationSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
        {error}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 rounded-md border border-gray-200 bg-gray-50 text-gray-600">
        No notifications
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={`${notification.id}-${index}`}
          notification={notification}
        />
      ))}
    </div>
  )
} 