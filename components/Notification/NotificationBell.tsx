'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNotifications } from '@/contexts/NotificationContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell as faBellRegular } from '@fortawesome/free-regular-svg-icons'
import { faBell as faBellSolid } from '@fortawesome/free-solid-svg-icons'

interface NotificationBellProps {
  filled?: boolean
}

export function NotificationBell({ filled }: NotificationBellProps) {
  const { unreadCount } = useNotifications()
  const pathname = usePathname()
  const bellIcon = filled ? faBellSolid : faBellRegular
  const href = pathname === '/notifications' ? '/' : '/notifications'

  return (
    <Link href={href} className="relative">
      <FontAwesomeIcon 
        icon={bellIcon} 
        className="h-6 w-6 text-gray-600 hover:text-gray-900 transition-colors translate-y-[1px]"
      />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-medium text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
} 