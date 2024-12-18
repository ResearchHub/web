'use client'

import { useState } from 'react'
import { Coins, Users2, Share2, ArrowUp, MessageSquare, Clock, BarChart2 } from 'lucide-react'
import { ProfileTooltip } from '@/components/tooltips/ProfileTooltip'
import { PageLayout } from '@/app/layouts/PageLayout'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { FundraiseRightSidebar } from '@/components/Fund/FundraiseRightSidebar'
import { mockFunding } from '@/store/fundingStore'
import { Funding } from '@/types/funding'
import { AvatarStack } from '@/components/ui/AvatarStack'

export default function FundingPage({ params }: { params: { id: string; slug: string } }) {
  const [activeTab, setActiveTab] = useState('content')
  const [showMobileMetrics, setShowMobileMetrics] = useState(false)
  const funding: Funding = mockFunding

  return (
    <>
      <PageLayout
        rightSidebar={
          <div className="hidden lg:block h-screen sticky top-0">
            <FundraiseRightSidebar fundraise={funding} />
          </div>
        }
      >
        <div className="relative">
          {/* Header */}
          <div className="mb-8">
            {/* Hub link */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <Link href={`/hub/${funding.hub.slug}`} className="text-indigo-600 hover:text-indigo-700">
                {funding.hub.name}
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{funding.title}</h1>

            {/* Action buttons */}
            <div className="flex items-center space-x-3 mb-6">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                <ArrowUp className="h-4 w-4" />
                <span>{funding.metrics.votes}</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button 
                className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                onClick={() => setShowMobileMetrics(true)}
              >
                <BarChart2 className="h-4 w-4" />
                <span>Insights</span>
              </button>
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-sm text-gray-600">
              {/* Authors */}
              <div className="flex items-start">
                <span className="font-medium text-gray-900 w-24">Authors</span>
                <div className="flex-1">
                  {funding.authors.map((author, i) => (
                    <span key={i} className="inline-flex items-center">
                      <span>{author.fullName}</span>
                      {author.verified && (
                        <BadgeCheck className="h-4 w-4 text-blue-500 ml-1" />
                      )}
                      {i < funding.authors.length - 1 && (
                        <span className="mx-2 text-gray-400">•</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Published */}
              <div className="flex items-center">
                <span className="font-medium text-gray-900 w-24">Published</span>
                <span>{funding.publishDate}</span>
              </div>
            </div>
          </div>

          {/* Funding Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-orange-500" />
                  <span className="text-lg font-medium text-orange-500">
                    {funding.amount.toLocaleString()} RSC raised
                  </span>
                  <span className="text-gray-500">
                    of {funding.goalAmount.toLocaleString()} RSC goal
                  </span>
                </div>
                {funding.progress === 100 && (
                  <span className="text-green-500 font-medium">Fundraise Completed</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${funding.progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                  style={{ width: `${funding.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center space-x-4 justify-between">
              <button className="inline-flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-200">
                <Coins className="h-4 w-4 mr-2" />
                Contribute
              </button>

              <div className="flex items-center space-x-2">
                <AvatarStack
                  items={funding.contributors.map(c => ({
                    src: c.user.authorProfile?.profileImage,
                    alt: c.user.fullName,
                    tooltip: c.user.fullName
                  }))}
                  size="md"
                  maxItems={3}
                />
                <span className="text-sm text-gray-600">contributors</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="border-b mb-6">
            <nav className="flex space-x-8">
              <button 
                className={`px-1 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'content' 
                    ? 'text-indigo-600 border-indigo-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('content')}
              >
                Content
              </button>
              <button 
                className={`px-1 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'reviews' 
                    ? 'text-indigo-600 border-indigo-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
              <button 
                className={`px-1 py-4 text-sm font-medium ${
                  activeTab === 'comments' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('comments')}
              >
                Comments
              </button>
            </nav>
          </div>

          {/* Content */}
          <div>
            {activeTab === 'content' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About this fundraise</h2>
                <div className="prose prose-sm max-w-none">
                  {funding.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-gray-500 text-center py-8">
                  No reviews yet
                </div>
              </div>
            )}
            
            {activeTab === 'comments' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-gray-500 text-center py-8">
                  No comments yet
                </div>
              </div>
            )}
          </div>
        </div>
      </PageLayout>

      {/* Mobile sidebar overlay - moved outside PageLayout */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 z-50 lg:hidden ${
          showMobileMetrics ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowMobileMetrics(false)}
      >
        <div 
          className={`absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl transition-transform duration-200 ${
            showMobileMetrics ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <FundraiseRightSidebar fundraise={funding} />
        </div>
      </div>
    </>
  )
} 