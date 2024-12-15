'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { NotificationService } from '@/services/notification.service'
import type { NotificationListResponse } from '@/services/types/notification.dto'
import { transformNotificationResponse } from '@/services/types/notification.dto'
import type { Notification } from '@/types/notification'

interface NotificationContextType {
  unreadCount: number
  notifications: Notification[]
  loading: boolean
  error: string | null
  refreshUnreadCount: () => Promise<void>
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: number) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  notifications: [],
  loading: false,
  error: null,
  refreshUnreadCount: async () => {},
  fetchNotifications: async () => {},
  markAsRead: async () => {},
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await NotificationService.getUnreadCount()
      setUnreadCount(response.count)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await NotificationService.getNotifications()
      const transformedResponse = transformNotificationResponse(response)
      console.log('transformedResponse', transformedResponse)
      setNotifications(transformedResponse.results)
    } catch (err) {
      setError('Failed to load notifications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await NotificationService.markAsRead(notificationId)
      setNotifications(notifications => notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      ))
      await refreshUnreadCount()
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }, [refreshUnreadCount])

  useEffect(() => {
    refreshUnreadCount()
  }, [refreshUnreadCount])

  return (
    <NotificationContext.Provider 
      value={{ 
        unreadCount, 
        notifications,
        loading,
        error,
        refreshUnreadCount,
        fetchNotifications,
        markAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext) 