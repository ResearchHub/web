'use client'

import { BadgeCheck } from 'lucide-react'
import { Popover } from '@headlessui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileTooltipProps {
  type: 'user' | 'organization'
  name: string
  headline?: string
  verified?: boolean
  id?: string
  children: React.ReactNode
}

export const ProfileTooltip = ({ 
  type, 
  name, 
  headline, 
  verified = false, 
  id = '12345',
  children 
}: ProfileTooltipProps) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  let hoverTimeout: NodeJS.Timeout

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setIsOpen(false)
    }, 300)
  }

  const handleViewProfile = () => {
    router.push(`/author/${id}`)
    setIsOpen(false)
  }

  const badgeElement = verified && (
    <BadgeCheck 
      className={`h-5 w-5 inline-flex flex-shrink-0 ${type === 'organization' ? 'text-yellow-500' : 'text-blue-500'}`} 
    />
  )

  return (
    <Popover className="relative">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Popover.Button as="div" className="flex items-center gap-1.5">
          {children}
          {badgeElement}
        </Popover.Button>

        {isOpen && (
          <Popover.Panel 
            static 
            className="absolute z-50 mt-1 w-72"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="rounded-md bg-white shadow-lg border border-gray-200 p-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-900">{name}</span>
                    {badgeElement}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{headline}</p>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                    Follow
                  </button>
                  <button 
                    onClick={handleViewProfile}
                    className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </Popover.Panel>
        )}
      </div>
    </Popover>
  )
} 