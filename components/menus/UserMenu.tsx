'use client'

import { User as UserIcon, LogOut, BadgeCheck, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import type { User } from '@/types/user'
import VerificationBanner from '@/components/banners/VerificationBanner'
import { Avatar } from '@/components/ui/Avatar'

interface UserMenuProps {
  user: User
  onViewProfile: () => void
  onVerifyAccount: () => void
}

export default function UserMenu({ user, onViewProfile, onVerifyAccount }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showVerificationBanner, setShowVerificationBanner] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLearnMore = () => {
    setIsOpen(false)
    onVerifyAccount()
  }

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        className="hover:ring-2 hover:ring-gray-200 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar 
          src={user.authorProfile?.profileImage} 
          alt={user.fullName}
          size="sm"
        />
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 mt-2 w-64 rounded-xl bg-gray-50 shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
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
                <p className="text-sm font-medium text-gray-900">{`${user.fullName}`}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                onViewProfile()
              }}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <UserIcon className="h-4 w-4 mr-3 text-gray-500" />
              View Profile
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                onVerifyAccount()
              }}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center">
                <BadgeCheck className="h-4 w-4 mr-3 text-gray-500" />
                Verify Account
              </div>
            </button>

            <button
              onClick={() => signOut()}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <LogOut className="h-4 w-4 mr-3 text-gray-500" />
              Sign Out
            </button>
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
        </div>
      )}
    </div>
  )
} 