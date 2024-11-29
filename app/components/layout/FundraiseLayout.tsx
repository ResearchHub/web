'use client'

import { Coins, Users2, Clock, MessageSquare, ArrowUp } from 'lucide-react'
import { ProfileTooltip } from '../tooltips/ProfileTooltip'
import { TopBar } from './TopBar'
import { LeftSidebar } from './LeftSidebar'

export const FundraiseLayout = ({ children, fundraise }) => {
  return (
    <div className={`flex min-h-screen bg-white antialiased`}>
      {/* Left Sidebar */}
      <LeftSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 mr-80">
        {/* Top Bar */}
        <TopBar />
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto py-6">
          {children}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="fixed right-0 top-0 w-80 h-screen border-l border-gray-200 bg-white overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Metrics Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">Raised</span>
                </div>
                <span className="text-sm font-medium">{fundraise.amount} RSC</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Contributors</span>
                </div>
                <span className="text-sm font-medium">{fundraise.contributors}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ArrowUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Votes</span>
                </div>
                <span className="text-sm font-medium">{fundraise.votes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Comments</span>
                </div>
                <span className="text-sm font-medium">{fundraise.comments}</span>
              </div>
            </div>
          </div>

          {/* Contributors Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {fundraise.topContributors.map((contributor, i) => (
                <div key={i} className="flex items-center justify-between">
                  <ProfileTooltip
                    type={contributor.organization ? 'organization' : 'user'}
                    name={contributor.name}
                    verified={contributor.verified}
                  >
                    <span className="text-sm text-gray-900 hover:text-indigo-600 cursor-pointer">
                      {contributor.name}
                    </span>
                  </ProfileTooltip>
                  <span className="text-sm text-orange-500 font-medium">{contributor.amount} RSC</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 