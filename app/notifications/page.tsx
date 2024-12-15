'use client'

import { useEffect } from 'react'
import { PageLayout } from '@/app/layouts/PageLayout'
import { useNotifications } from '@/contexts/NotificationContext'
import { NotificationList } from '@/components/Notification/NotificationList'

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

  const content = (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <NotificationList
        notifications={notifications}
        loading={loading}
        error={error}
        onMarkAsRead={markAsRead}
      />
    </div>
  )

  return (
    <PageLayout>
      {content}
    </PageLayout>
  )
} 