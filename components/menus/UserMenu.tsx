'use client'

import { User as UserIcon, LogOut, BadgeCheck } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import type { User } from '@/types/user'
import VerificationBanner from '@/components/banners/VerificationBanner'
import { Avatar } from '@/components/ui/Avatar'
import { BaseMenu, BaseMenuItem } from './BaseMenu'

interface UserMenuProps {
  user: User
  onViewProfile: () => void
  onVerifyAccount: () => void
}

export default function UserMenu({ user, onViewProfile, onVerifyAccount }: UserMenuProps) {
  const [showVerificationBanner, setShowVerificationBanner] = useState(true)

  const handleLearnMore = () => {
    onVerifyAccount()
  }

  const trigger = (
    <button className="hover:ring-2 hover:ring-gray-200 rounded-full">
      <Avatar 
        src={user.authorProfile?.profileImage} 
        alt={user.fullName}
        size="sm"
      />
    </button>
  );

  return (
    <BaseMenu 
      trigger={trigger}
      align="end"
      sideOffset={8}
      className="w-64 p-0"
      withOverlay={true}
      animate
    >
      {/* User info section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <Avatar 
            src={user.authorProfile?.profileImage} 
            alt={user.fullName}
            size="md"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <BaseMenuItem
          onClick={onViewProfile}
          className="w-full px-4 py-2"
        >
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 mr-3 text-gray-500" />
            <span className="text-sm text-gray-700">View Profile</span>
          </div>
        </BaseMenuItem>

        <BaseMenuItem
          onClick={onVerifyAccount}
          className="w-full px-4 py-2"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <BadgeCheck className="h-4 w-4 mr-3 text-gray-500" />
              <span className="text-sm text-gray-700">Verify Account</span>
            </div>
          </div>
        </BaseMenuItem>

        <BaseMenuItem
          onClick={() => signOut()}
          className="w-full px-4 py-2"
        >
          <div className="flex items-center">
            <LogOut className="h-4 w-4 mr-3 text-gray-500" />
            <span className="text-sm text-gray-700">Sign Out</span>
          </div>
        </BaseMenuItem>
      </div>

      {/* Verification Banner at bottom */}
      {showVerificationBanner && (
        <div className="pb-3 px-3 mt-2">
          <VerificationBanner 
            onClose={() => setShowVerificationBanner(false)} 
            onLearnMore={handleLearnMore}
          />
        </div>
      )}
    </BaseMenu>
  )
} 