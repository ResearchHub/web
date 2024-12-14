'use client'

import { useState } from 'react'
import { use } from 'react'
import { Coins, Share2, ArrowUp, MessageSquare, BarChart2 } from 'lucide-react'
import { ProfileTooltip } from '@/components/tooltips/ProfileTooltip'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { FeedItem } from '@/components/FeedItem'
import { PageLayout } from '@/app/layouts/PageLayout'
import { grants, grantApplications } from '@/store/grantStore'
import { GrantRightSidebar } from '@/components/Grant/GrantRightSidebar'

export default function GrantPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const [activeTab, setActiveTab] = useState('details')
  const [showMobileMetrics, setShowMobileMetrics] = useState(false)

  const { id } = use(params)
  const grant = grants[id]
  const applications = grantApplications[id] || []

  if (!grant) {
    return <div>Grant not found</div>
  }

  return (
    <>
      <PageLayout
        rightSidebar={
          <div className="hidden lg:block h-screen sticky top-0">
            <GrantRightSidebar grant={grant} />
          </div>
        }
      >
        <div className="max-w-4xl">
          {/* Hub and Title */}
          <div className="mb-6">
            <Link 
              href={`/hub/${grant.hub.slug}`}
              className="text-sm text-indigo-600 hover:text-indigo-700 mb-3 inline-block"
            >
              {grant.hub.name}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
              {grant.title}
            </h1>

            {/* Metadata */}
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <span className="font-medium text-gray-900 w-24">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {grant.status}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-900 w-24">Funder(s)</span>
                <div className="flex items-center">
                  <ProfileTooltip
                    type="user"
                    name={grant.createdBy.fullName}
                    verified={grant.createdBy.verified}
                  >
                    <span className="text-gray-900 font-medium hover:text-indigo-600 cursor-pointer">
                      {grant.createdBy.fullName}
                    </span>
                  </ProfileTooltip>
                </div>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-900 w-24">Amount</span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-orange-500 font-medium">
                    <Coins className="h-4 w-4 mr-2" />
                    <span>{grant.amount} RSC</span>
                  </div>
                  <span className="text-gray-400 text-sm">≈ ${grant.amountUSD} USD</span>
                </div>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-900 w-24">Published</span>
                <span>{grant.publishDate}</span>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-900 w-24">Deadline</span>
                <span className="text-red-600 font-medium">{grant.deadline}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mb-6">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Apply Now
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
                <ArrowUp className="h-4 w-4" />
                <span>{grant.metrics.votes}</span>
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

            <div className="mt-12 border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'details'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeTab === 'comments'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  Comments
                  {grant.metrics.comments > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === 'comments' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {grant.metrics.comments}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeTab === 'applications'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  Applications
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === 'applications' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {grant.metrics.applicants}
                  </span>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'details' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About this Grant</h3>
                    {grant.details.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4">{paragraph}</p>
                    ))}
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
              
              {activeTab === 'applications' && (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div 
                      key={application.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      {/* Application Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {application.user.profileImage ? (
                            <img 
                              src={application.user.profileImage} 
                              alt={application.user.fullName}
                              className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">
                              {application.user.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application.user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Applied {application.timestamp}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-500">Status:</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Under Review
                          </span>
                        </div>
                      </div>

                      {/* Application Content */}
                      <div className="prose prose-sm max-w-none mb-4">
                        <p className="text-gray-600">{application.description}</p>
                      </div>

                      {/* Application Metrics */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-gray-700">
                          <ArrowUp className="h-4 w-4" />
                          <span>{application.metrics.votes}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-gray-700">
                          <MessageSquare className="h-4 w-4" />
                          <span>{application.metrics.comments}</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {applications.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="text-gray-500 text-center py-8">
                        No applications yet
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageLayout>

      {/* Mobile sidebar overlay */}
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
          <GrantRightSidebar grant={grant} />
        </div>
      </div>
    </>
  )
} 