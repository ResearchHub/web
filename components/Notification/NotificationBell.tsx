'use client'

import Link from 'next/link'
import { useNotifications } from '@/contexts/NotificationContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell as faBellRegular } from '@fortawesome/free-regular-svg-icons'
import { faBell as faBellSolid } from '@fortawesome/free-solid-svg-icons'

interface NotificationBellProps {
  filled?: boolean
}

export function NotificationBell({ filled }: NotificationBellProps) {
  const { unreadCount } = useNotifications()
  const bellIcon = filled ? faBellSolid : faBellRegular

  return (
    <Link href="/notifications" className="relative">
      <FontAwesomeIcon 
        icon={bellIcon} 
        className="h-5 w-5 text-gray-600 hover:text-gray-900 transition-colors translate-y-[1px]"
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
} 