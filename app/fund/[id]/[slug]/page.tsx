'use client'

import { useState } from 'react'
import { Coins, Users2, Share2, ArrowUp, MessageSquare, Clock } from 'lucide-react'
import { ProfileTooltip } from '@/app/components/tooltips/ProfileTooltip'
import { PageLayout } from '@/app/layouts/PageLayout'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { FundraiseLayout } from '@/app/components/layout/FundraiseLayout'

export default function FundingPage({ params }: { params: { id: string; slug: string } }) {
  const [activeTab, setActiveTab] = useState('content')

  const funding = {
    id: '1234',
    user: 'Dominikus Brian',
    verified: true,
    timestamp: 'Oct 9, 2024',
    hub: { name: 'Research Methods', slug: 'research-methods' },
    title: 'Incentivized vs Non-Incentivized Open Peer Reviews: Dynamics, Economics, and Quality',
    objective: 'Develop a comprehensive understanding toward the influence of incentives for Open Peer Review toward tackling the Peer Review Crisis across the scientific publication ecosystem.',
    abstract: 'Open peer review (OPR) is an emerging concept in the scientific publication scene that has gained attention alongside the rise of open science. OPR has led to a starkly different dynamic and possibilities of how peer reviewers behave...',
    amount: '30,131',
    goal: '36,389',
    progress: 85,
    votes: 45,
    comments: 21,
    contributors: 6,
    authors: [
      { name: 'Dominikus Brian', affiliation: 'Stanford University', verified: true },
      { name: 'Sarah Chen', affiliation: 'MIT', verified: true },
      { name: 'Michael Chang', affiliation: 'Harvard University', verified: false }
    ],
    publishDate: 'October 9, 2024',
    doi: '10.55277/ResearchHub.taescjxh',
    keywords: ['Open Peer Review', 'Incentives', 'Research Methods', 'Scientometrics', 'Open Science'],
    topContributors: [
      { name: 'ResearchHub Foundation', amount: '15,000', verified: true, organization: true },
      { name: 'Open Science Foundation', amount: '10,000', verified: true, organization: true },
      { name: 'Dr. Sarah Chen', amount: '2,500', verified: true },
      { name: 'John Smith', amount: '1,500', verified: false },
      { name: 'Blockchain Research Lab', amount: '1,000', verified: true, organization: true },
    ],
    contributorAvatars: [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=12',
      'https://i.pravatar.cc/150?img=38',
    ],
    content: `Motivation
There is a need to formulate an incentive mechanism for open peer review that could be proven to be objective and reproducible in improving overall quality of research publication across various research domains by means of accelerated peer reviews that are thorough, useful, and accurate.

Impact/Significance
Incentivized Open Peer Review is a nascent concept within the broader peer review system, which still lacks: (1) relevant and accessible experimental data and (2) clear analysis indicating its effectiveness. The goal of this study is to demonstrate and promote better peer review incentive designs and facilitate future exploration in Incentivized Open Peer Review. To this end, a comprehensive set of carefully obtained research data is essential to lay down the foundation for subsequent studies within this domain. This work addresses this gap by establishing a framework that contributes to data curation, collection, and analysis methods. Ultimately, this allows for clearer understanding on the impact of incentivized open peer review on peer reviewer dynamics, economic behavior of peer reviewer, and how it improves review thoroughness, usefulness, and accuracy that benefits the larger scientific community.

Project Timeline, October 2024 - August 2025
• Pre-Registration [10/2024]
• Fundraising through ResearchHub [10/2024 -11/2024]
• Phase 1 [10/2024 - 01/2025]: Literature Review, Project Infrastructure, Existing Data Curation, and Experiment Design Refinement
• Phase 2 [02/2025 - 04/2025]: Open Peer-Review Experiments, New Data Acquisition, and Analysis
• Phase 3 [05/2025 - 08/2025]: Result Consolidation, Integrated Platform, and Manuscript Writing

Research Deliverables
• Open Dataset and Literature bundle for Incentivized vs Non-Incentivized Open Peer-Reviews
• At least 1 Full-Fledge Scientific Paper that describes, analyzes, and summarizes the investigation
• Open-Source Peer Review Quality Scoring Model/Algorithms
• 18 Bi-Weekly Progress Reports that serve as Proof-of-Research
• Integrated Platform to present all research output and metadata
• Open lecture to present the findings at Metascience 2025 Conference in London`
  }

  return (
    <PageLayout
      rightSidebar={<FundraiseLayout fundraise={funding} />}
    >
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href={`/hub/${funding.hub.slug}`} className="text-indigo-600 hover:text-indigo-700">
              {funding.hub.name}
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{funding.title}</h1>

          <div className="flex items-center space-x-3 mb-6">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
              <ArrowUp className="h-4 w-4" />
              <span>{funding.votes}</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="font-medium text-gray-900 w-24">Authors</span>
              <div className="flex-1">
                {funding.authors.map((author, i) => (
                  <span key={i} className="inline-flex items-center">
                    <span>{author.name}</span>
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

            <div className="flex items-center">
              <span className="font-medium text-gray-900 w-24">Published</span>
              <span>{funding.publishDate}</span>
            </div>

            <div className="flex items-center">
              <span className="font-medium text-gray-900 w-24">DOI</span>
              <span>{funding.doi}</span>
            </div>

            <div className="flex items-center">
              <span className="font-medium text-gray-900 w-24">Keywords</span>
              <div className="flex flex-wrap gap-2">
                {funding.keywords.map((keyword, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Funding Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-orange-500" />
                <span className="text-lg font-medium text-orange-500">{funding.amount} RSC raised</span>
                <span className="text-gray-500">of {funding.goal} RSC goal</span>
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                {funding.contributorAvatars.map((avatar, i) => (
                  <img 
                    key={i}
                    src={avatar}
                    className="h-8 w-8 rounded-full ring-2 ring-white"
                  />
                ))}
                <div className="h-8 px-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium flex items-center ml-1">
                  +{funding.contributors} others
                </div>
              </div>
              <span className="text-sm text-gray-600">contributors</span>
            </div>

            <button className="inline-flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-200">
              <Coins className="h-4 w-4 mr-2" />
              Contribute
            </button>
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

        {/* Engagement */}
        <div className="flex items-center space-x-4 text-gray-500">
          <button className="flex items-center space-x-1 hover:text-gray-700">
            <ArrowUp className="h-5 w-5" />
            <span>{funding.votes}</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-gray-700">
            <MessageSquare className="h-5 w-5" />
            <span>{funding.comments}</span>
          </button>
        </div>
      </div>
    </PageLayout>
  )
} 