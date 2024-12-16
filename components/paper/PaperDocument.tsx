'use client'

import { useState } from 'react'
import { Menu } from '@headlessui/react'
import { 
  ArrowUp, Download, Flag, Edit, Share2, MoreHorizontal,
  Coins, MessageSquare, Star, Eye, Quote,
  BadgeCheck, UserPlus, X, Gift, BarChart2
} from 'lucide-react'
import { Paper } from '@/types/paper'
import { PaperReviews } from './PaperReviews'
import { PaperRewards } from './PaperRewards'
import { PaperComments } from './PaperComments'
import { ReviewRewardModal } from './ReviewRewardModal'
import { Dialog } from '@headlessui/react'
import Link from 'next/link'
import { PaperRightSidebar } from './PaperRightSidebar'

interface PaperDocumentProps {
  paper: Paper;
}

export const PaperDocument = ({ paper }: PaperDocumentProps) => {
  const [activeTab, setActiveTab] = useState('paper')
  const [rewardModalOpen, setRewardModalOpen] = useState(false)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [showMobileMetrics, setShowMobileMetrics] = useState(false)
  
  // Mock data - would come from API
  const openRewards = [
    {
      id: 1,
      title: 'Comprehensive Methodology Review',
      description: 'Looking for an expert review focusing on the methodology and statistical analysis.',
      amount: 500,
      deadline: '7 days'
    },
    {
      id: 2,
      title: 'Replication Study',
      description: 'Seeking researchers to replicate key findings from Figure 3.',
      amount: 1500,
      deadline: '30 days'
    }
  ]
  
  return (
    <div>
      {/* Rewards Banner */}
      <div className="mb-6">
        {/* Main Rewards Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg border border-orange-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Coins className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-orange-900">RSC Rewards Available</h2>
                  <p className="text-sm text-orange-700 mt-0.5">
                    Earn ResearchCoin by completing rewards on this paper
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setRewardModalOpen(true)}
                className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
              >
                View Rewards
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Link href={`/hub/${paper.hub.slug}`} className="text-indigo-600 hover:text-indigo-700">
          {paper.hub.name}
        </Link>
      </div>

      {/* Title & Actions */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {paper.title}
          </h1>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          {/* Primary Actions */}
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
              <ArrowUp className="h-4 w-4" />
              <span>{paper.metrics.votes}</span>
            </button>
            
            {/* Insights Button for Small Screens - Moved here */}
            <button 
              className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
              onClick={() => setShowMobileMetrics(true)}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Insights</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100">
              <Coins className="h-4 w-4" />
              <span>Tip RSC</span>
            </button>
            
            {/* More Actions Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <MoreHorizontal className="h-5 w-5" />
              </Menu.Button>

              <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left bg-white rounded-lg shadow-lg border border-gray-200 py-1 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button className={`${
                      active ? 'bg-gray-50' : ''
                    } flex items-center space-x-2 px-4 py-2 text-gray-700 w-full text-left`}>
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button className={`${
                      active ? 'bg-gray-50' : ''
                    } flex items-center space-x-2 px-4 py-2 text-gray-700 w-full text-left`}>
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button className={`${
                      active ? 'bg-gray-50' : ''
                    } flex items-center space-x-2 px-4 py-2 text-gray-700 w-full text-left`}>
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button className={`${
                      active ? 'bg-gray-50' : ''
                    } flex items-center space-x-2 px-4 py-2 text-gray-700 w-full text-left`}>
                      <Flag className="h-4 w-4" />
                      <span>Flag Content</span>
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </div>

        {/* Metadata with author claim button */}
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <div className="flex items-start">
              <span className="font-medium text-gray-900 w-24">Authors</span>
              <div className="flex-1">
                <div className="mb-1.5">
                  {paper.authors.map((author, i) => (
                    <span key={i} className="inline-flex items-center">
                      <span>{author.fullName}</span>
                      {i < paper.authors.length - 1 && (
                        <span className="mx-2 text-gray-400">•</span>
                      )}
                    </span>
                  ))}
                </div>
                {paper.isUnclaimed && (
                  <button 
                    onClick={() => setClaimModalOpen(true)}
                    className="flex items-center space-x-1 text-orange-500 hover:text-orange-600"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Claim profile and earn rewards</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Journal */}
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-24">Journal</span>
            <div className="flex-1">
              <span>{paper.journal}</span>
            </div>
          </div>

          {/* Published Date */}
          <div className="flex items-start">
            <span className="font-medium text-gray-900 w-24">Published</span>
            <div className="flex-1">
              <span>{new Date(paper.publishDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          <button 
            className={`px-1 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'paper' 
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('paper')}
          >
            Paper
          </button>
          <button 
            className={`px-1 py-4 text-sm font-medium ${
              activeTab === 'reviews' 
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              activeTab === 'reviews' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {paper.metrics.totalReviews}
            </span>
          </button>
          <button 
            className={`px-1 py-4 text-sm font-medium ${
              activeTab === 'rewards' 
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('rewards')}
          >
            Rewards
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              activeTab === 'rewards' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
            }`}>
              2
            </span>
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
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              activeTab === 'comments' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {paper.metrics.comments}
            </span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'paper' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Abstract</h2>
              <p className="text-gray-700">{paper.abstract}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <iframe
                src={`https://www.biorxiv.org/content/10.1101/2024.10.16.618749v1.full.pdf#toolbar=0`}
                className="w-full h-[800px]"
                title="Paper PDF"
              />
            </div>
          </>
        )}
        
        {activeTab === 'reviews' && <PaperReviews paperId={paper.id} />}
        {activeTab === 'rewards' && <PaperRewards paperId={paper.id} />}
        {activeTab === 'comments' && <PaperComments paperId={paper.id} />}
      </div>

      <ReviewRewardModal 
        open={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        rewards={openRewards as any}
      />

      {/* Claim Profile Modal */}
      <Dialog 
        open={claimModalOpen} 
        onClose={() => setClaimModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-semibold">
                Claim Author Profile
              </Dialog.Title>
              <button 
                onClick={() => setClaimModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                As a verified author, you can:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Coins className="h-4 w-4 text-orange-500" />
                  <span>Earn rewards from paper citations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Gift className="h-4 w-4 text-orange-500" />
                  <span>Receive community tips and contributions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <BadgeCheck className="h-4 w-4 text-orange-500" />
                  <span>Get verified author status</span>
                </li>
              </ul>

              <button 
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                onClick={() => {
                  // Handle claim profile action
                  setClaimModalOpen(false)
                }}
              >
                Start Verification
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

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
          <PaperRightSidebar paper={paper} />
        </div>
      </div>
    </div>
  )
} 