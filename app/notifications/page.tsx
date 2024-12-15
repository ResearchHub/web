'use client'

import { useEffect } from 'react'
import { PageLayout } from '@/app/layouts/PageLayout'
import { useNotifications } from '@/contexts/NotificationContext'

export default function NotificationsPage() {
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    markAsRead 
  } = useNotifications()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const getNotificationTypeDisplay = (type: any) => {
    if (typeof type === 'object' && type.value) {
      return type.value
    }
    return String(type)
  }

  const content = (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.isRead ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {notification.actionUser?.firstName} {getNotificationTypeDisplay(notification.type)}
                    </p>
                    <p className="text-gray-600 mt-1">TBD</p>
                    {notification.document && (
                      <p className="text-sm text-gray-500 mt-1">
                        Document: {notification.document.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.createdDate.toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )

  return (
    <PageLayout>
      {content}
    </PageLayout>
  )
} 