import { Notification } from '@/types/notification'

interface NotificationItemProps {
  notification: Notification
}

const getNotificationTypeDisplay = (type: any) => {
  if (typeof type === 'object' && type.value) {
    return type.value
  }
  return String(type)
}

export function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <div 
      className={`p-4 rounded-lg border ${
        notification.isRead ? 'bg-gray-50' : 'bg-white'
      }`}
    >
        {notification.id}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">
            {notification.actionUser?.firstName} {getNotificationTypeDisplay(notification.type)}
          </p>
          {/* <p className="text-gray-600 mt-1">{notification.body}</p> */}
          {notification.document && (
            <p className="text-sm text-gray-500 mt-1">
              Document: {notification.document.title}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {notification.createdDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
} 