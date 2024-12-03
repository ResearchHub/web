'use client'

import { ArrowUp, MessageSquare, Users, Link, Tag, Coins, Repeat2, Bookmark } from 'lucide-react'
import type { Funding } from '@/types/funding'
import { Button } from '@/app/components/ui/Button'

interface FundraiseRightSidebarProps {
  fundraise: Funding
}

export function FundraiseRightSidebar({ fundraise }: FundraiseRightSidebarProps) {
  return (
    <div className="fixed top-0 right-0 h-screen w-80 border-l bg-white p-6 space-y-8 overflow-y-auto">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="metric" 
            className="w-full justify-start space-x-2"
          >
            <ArrowUp className="h-5 w-5" />
            <span>{fundraise.metrics.votes} votes</span>
          </Button>
          <Button 
            variant="ghost" 
            size="metric" 
            className="w-full justify-start space-x-2"
          >
            <MessageSquare className="h-5 w-5" />
            <span>{fundraise.metrics.comments} comments</span>
          </Button>
        </div>
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="metric" 
            className="w-full justify-start space-x-2"
          >
            <Repeat2 className="h-5 w-5" />
            <span>{fundraise.metrics.reposts} reposts</span>
          </Button>
          <Button 
            variant="ghost" 
            size="metric" 
            className="w-full justify-start space-x-2"
          >
            <Bookmark className="h-5 w-5" />
            <span>{fundraise.metrics.saves} saves</span>
          </Button>
        </div>
      </div>

      {/* DOI */}
      <div className="space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <Link className="h-4 w-4" />
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
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Top Contributors
        </h3>
        <div className="space-y-3">
          {fundraise.contributors.map(({ user, amount }) => (
            <div key={user.id} className="flex items-center space-x-3">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.fullName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200" 
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-gray-200">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.fullName}</span>
                <div className="flex items-center space-x-1 text-orange-500">
                  <Coins className="h-3 w-3" />
                  <span className="text-xs">{amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <Tag className="h-4 w-4" />
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
  )
} 