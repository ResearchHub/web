'use client'

import { useState } from 'react'
import { Coins, Share2, ArrowUp, MessageSquare } from 'lucide-react'
import { ProfileTooltip } from '@/app/components/tooltips/ProfileTooltip'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { GrantLayout } from '@/app/components/layout/GrantLayout'
import { FeedItem } from '@/app/components/FeedItem'

export default function GrantPage({ params }: { params: { id: string; slug: string } }) {
  const [activeTab, setActiveTab] = useState('details')

  const applications = [
    {
      type: 'application',
      user: 'Dr. Sarah Chen',
      organization: 'Stanford University',
      verified: true,
      timestamp: '2d ago',
      title: 'Application: Urban Water Quality Assessment Project',
      description: `Our research team proposes a comprehensive approach to analyzing water quality across major urban centers. 
        We will employ advanced spectroscopic techniques and machine learning algorithms to identify contaminants 
        and predict water quality trends. Our lab has extensive experience in environmental monitoring and data analysis.`,
      votes: 15,
      comments: 4,
      status: 'Under Review'
    },
    {
      type: 'application',
      user: 'Prof. James Martinez',
      organization: 'UC Berkeley',
      verified: true,
      timestamp: '3d ago',
      title: 'Application: Urban Water Quality Assessment Project',
      description: `We propose to study water quality variations in urban areas using a novel combination of real-time 
        monitoring systems and citizen science initiatives. Our approach emphasizes community engagement while 
        maintaining rigorous scientific standards. Previous success in similar projects positions us well for this study.`,
      votes: 12,
      comments: 3,
      status: 'Under Review'
    },
    {
      type: 'application',
      user: 'Dr. Emily Thompson',
      organization: 'MIT',
      verified: true,
      timestamp: '4d ago',
      title: 'Application: Urban Water Quality Assessment Project',
      description: `Our proposal focuses on developing new methodologies for rapid water quality assessment in urban 
        environments. We will integrate IoT sensors with traditional analytical methods to create a comprehensive 
        monitoring system. Our team brings expertise in both environmental science and data analytics.`,
      votes: 8,
      comments: 2,
      status: 'Under Review'
    }
  ]

  const grant = {
    id: params.id,
    title: "Urban Water Quality Assessment: A Multi-City Analysis of Municipal Water Systems Across America",
    hub: { 
      name: "Environmental Science",
      slug: "environmental-science"
    },
    author: {
      name: "Adam Draper",
      verified: true,
    },
    authors: [],
    publishDate: "October 18, 2024",
    deadline: "December 15, 2024",
    amount: "500,000",
    amountUSD: "250,000",
    abstract: "This grant aims to support researchers in conducting comprehensive water quality analysis in developing regions...",
    metrics: {
      votes: 32,
      comments: 12,
      applicants: 8,
      views: 245
    },
    status: "Open",
    keywords: ['Water Quality', 'Environmental Science', 'Sustainable Development', 'Public Health'],
    details: `
Our goal is to improve water quality assessment and treatment methods in developing regions through:

1. Development of cost-effective water quality testing methods
2. Analysis of contamination patterns and sources
3. Design of locally sustainable water treatment solutions
4. Community engagement and education programs

Expected Outcomes:
• Comprehensive water quality database for target regions
• Novel, affordable testing methodologies
• Sustainable treatment solution prototypes
• Published research findings in peer-reviewed journals
• Community education materials and programs

Research Areas:
• Water contamination analysis
• Environmental impact assessment
• Sustainable treatment technologies
• Public health implications
• Community engagement strategies`
  }

  return (
    <GrantLayout grant={grant}>
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
                  name={grant.author.name}
                  verified={false}
                >
                  <span className="text-gray-900 font-medium hover:text-indigo-600 cursor-pointer">
                    {grant.author.name}
                  </span>
                </ProfileTooltip>
                {grant.author.verified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0 ml-1" />
                )}
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
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
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
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'comments' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {grant.metrics.comments}
                </span>
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
                {applications.map((application, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                  >
                    <FeedItem item={application} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </GrantLayout>
  )
} 