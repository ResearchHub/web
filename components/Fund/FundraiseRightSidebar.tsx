'use client'

import { 
  ArrowUp, MessageSquare, Users, Link2, Tag, 
  Coins, Repeat2, Bookmark, Eye, Star,
  BarChart2
} from 'lucide-react'
import type { Funding } from '@/types/funding'

interface FundraiseRightSidebarProps {
  fundraise: Funding
}

export function FundraiseRightSidebar({ fundraise }: FundraiseRightSidebarProps) {
  return (
    <div className="w-80 h-full bg-white/50 backdrop-blur-sm border-l overflow-y-auto">
      <div className="p-6 space-y-8">
        {/* Metrics */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-gray-500" />
            Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-gray-500">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Eye className="h-4 w-4" />
                </div>
                <span className="text-sm">Views</span>
              </div>
              <span className="text-md font-medium">{fundraise.metrics.views}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-gray-500">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Star className="h-4 w-4" />
                </div>
                <span className="text-sm">Rating</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-md font-medium">{fundraise.metrics.reviewScore}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-gray-500">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Repeat2 className="h-4 w-4" />
                </div>
                <span className="text-sm">Reposts</span>
              </div>
              <span className="text-md font-medium">{fundraise.metrics.reposts}</span>
            </div>
          </div>
        </div>

        {/* DOI */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-gray-500" />
            DOI
          </h3>
          <a href={`https://doi.org/${fundraise.doi}`} 
             className="text-sm text-blue-600 hover:underline"
             target="_blank" 
             rel="noopener noreferrer">
            {fundraise.doi}
          </a>
        </div>

        {/* Top Contributors */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            Top Contributors
          </h3>
          <div className="space-y-3 mb-3">
            {fundraise.contributors.map(({ user, amount }) => (
              <div key={user.id} className="flex items-center space-x-3">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white border border-gray-200" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium ring-2 ring-white border border-gray-200">
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium">{user.fullName}</div>
                  <div className="flex items-center space-x-1 text-orange-500">
                    <Coins className="h-3 w-3" />
                    <span className="text-xs">{amount.toLocaleString()} RSC</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            See all contributors →
          </button>
        </div>

        {/* Keywords */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {fundraise.keywords.map((keyword) => (
              <span 
                key={keyword}
                className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 