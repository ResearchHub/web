'use client'

import { Coins, Users2, Clock, MessageSquare, ArrowUp, ChevronRight } from 'lucide-react'
import { TopBar } from './TopBar'
import { LeftSidebar } from './LeftSidebar'
import Link from 'next/link'

export const GrantLayout = ({ children, grant }) => {
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
        {/* Metrics */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Metrics</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-gray-500">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Users2 className="h-4 w-4" />
                </div>
                <span className="text-sm">Applicants</span>
              </div>
              <span className="text-md font-medium">{grant.metrics.applicants}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-gray-500">
                <div className="w-5 h-5 flex items-center justify-center">
                  <ArrowUp className="h-4 w-4" />
                </div>
                <span className="text-sm">Votes</span>
              </div>
              <span className="text-md font-medium">{grant.metrics.votes}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-gray-500">
                <div className="w-5 h-5 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <span className="text-sm">Comments</span>
              </div>
              <span className="text-md font-medium">{grant.metrics.comments}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-gray-500">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-sm">Deadline</span>
              </div>
              <span className="text-md font-medium">{grant.deadline}</span>
            </div>
          </div>
        </div>

        {/* Authors Section */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Authors</h3>
          <div className="space-y-3">
            {grant.authors.map((author, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium`}>
                  {author.name.split(' ').map(word => word[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer">
                    {author.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {author.affiliation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {grant.keywords.map((keyword, i) => (
              <Link
                key={i}
                href={`/search?q=${encodeURIComponent(keyword)}`}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 