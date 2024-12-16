'use client'

import { Bell } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { useRouter } from 'next/navigation'

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount, markAllAsRead } = useNotifications()
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent) => {
    if (unreadCount > 0) {
      await markAllAsRead()
    }

    router.push('/notifications')
  }

  return (
    <button 
      className={`relative ${className}`}
      onClick={handleClick}
      title={unreadCount > 0 ? "Shift+Click to mark all as read" : "Notifications"}
    >
      <Bell className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-2 h-4 min-w-[16px] px-1 bg-red-500 rounded-lg text-xs text-white flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
} 