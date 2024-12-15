'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { NotificationService } from '@/services/notification.service'

const NotificationContext = createContext<{
  unreadCount: number
  refreshUnreadCount: () => Promise<void>
}>({
  unreadCount: 0,
  refreshUnreadCount: async () => {},
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnreadCount = async () => {
    try {
      const response = await NotificationService.getUnreadCount()
      setUnreadCount(response.count)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  useEffect(() => {
    refreshUnreadCount()
  }, [])

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext) 