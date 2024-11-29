'use client'

import { Coins, Users2, Clock, MessageSquare, ArrowUp, ChevronRight } from 'lucide-react'
import { ProfileTooltip } from '../tooltips/ProfileTooltip'
import { TopBar } from './TopBar'
import { LeftSidebar } from './LeftSidebar'
import Link from 'next/link'

const getInitials = (name: string) => {
  return name.split(' ').map(word => word[0]).join('')
}

const AVATAR_COLORS = [
  'bg-pink-100 text-pink-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-green-100 text-green-600',
  'bg-orange-100 text-orange-600'
]

export const FundraiseLayout = ({ children, fundraise }) => {
  return (
    <div className={`flex min-h-screen bg-white antialiased`}>
      <LeftSidebar />
      
      <div className="flex-1 ml-64 mr-80">
        <TopBar />
        <div className="max-w-4xl mx-auto py-6">
          {children}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 fixed right-0 top-0 bottom-0 border-l bg-white/50 backdrop-blur-sm p-6 overflow-y-auto">

        {/* Contributors Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Top Contributors</h3>
          <div className="space-y-3 mb-3">
            {fundraise.topContributors.slice(0, 5).map((contributor, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`h-8 w-8 rounded-full ${AVATAR_COLORS[i]} flex items-center justify-center text-sm font-medium`}>
                  {getInitials(contributor.name)}
                </div>
                <div>
                  <ProfileTooltip
                    type={contributor.organization ? 'organization' : 'user'}
                    name={contributor.name}
                    verified={contributor.verified}
                  >
                    <div className="text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer">
                      {contributor.name}
                    </div>
                  </ProfileTooltip>
                  <div className="text-xs font-medium text-orange-500">
                    {contributor.amount} RSC
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            See all contributors →
          </button>
        </div>
      </div>
    </div>
  )
} 