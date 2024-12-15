import { Notification } from '@/types/notification'
import { NotificationItem } from './NotificationItem'

interface NotificationListProps {
  notifications: Notification[]
  loading: boolean
  error: string | null
  onMarkAsRead: (id: number) => Promise<void>
}

export function NotificationList({ 
  notifications, 
  loading, 
  error, 
  onMarkAsRead 
}: NotificationListProps) {
  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (notifications.length === 0) {
    return <p>No notifications</p>
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  )
} 