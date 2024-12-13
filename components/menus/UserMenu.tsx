'use client'

import { User, LogOut, BadgeCheck, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import type { Session } from 'next-auth'
import VerificationBanner from '@/components/banners/VerificationBanner'

interface UserMenuProps {
  session: Session
  onViewProfile: () => void
  onVerifyAccount: () => void
}

export default function UserMenu({ session, onViewProfile, onVerifyAccount }: UserMenuProps) {
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

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {session.user?.image ? (
          <img 
            src={session.user.image} 
            alt={session.user.name || 'User avatar'} 
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <User className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 mt-1 w-80 rounded-2xl bg-gray-50 shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
        >
          {/* User info section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center">
                {session.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'User avatar'} 
                    className="h-14 w-14 rounded-full"
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-sm text-gray-500">{session.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false)
                onViewProfile()
              }}
              className="w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <User className="h-5 w-5 mr-4 text-gray-500" />
              View Profile
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                onVerifyAccount()
              }}
              className="w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center">
                <BadgeCheck className="h-5 w-5 mr-4 text-gray-500" />
                Verify Account
              </div>
            </button>

            <button
              onClick={() => signOut()}
              className="w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <LogOut className="h-5 w-5 mr-4 text-gray-500" />
              Sign Out
            </button>
          </div>

          {/* Verification Banner at bottom */}
          {showVerificationBanner && (
            <div className="pb-4 px-4">
              <VerificationBanner onClose={() => setShowVerificationBanner(false)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
} 