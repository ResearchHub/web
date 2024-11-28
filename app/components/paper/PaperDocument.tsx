'use client'

import { useState } from 'react'
import { Menu } from '@headlessui/react'
import { 
  ArrowUp, Download, Flag, Edit, Share2, MoreHorizontal,
  Coins, MessageSquare, Star, Eye, Quote,
  BadgeCheck
} from 'lucide-react'
import { PDFViewer } from './PDFViewer'
import { PaperReviews } from './PaperReviews'
import { PaperRewards } from './PaperRewards'
import { PaperComments } from './PaperComments'
export const PaperDocument = ({ paper }) => {
  const [activeTab, setActiveTab] = useState('paper')
  
  return (
    <div>
      {/* Rewards Banner */}
      <div className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-orange-800 mb-2">
              Available Reward Opportunities
            </h2>
            <p className="text-orange-700">
              Earn up to 2,000 RSC by contributing to this paper through peer reviews and replications
            </p>
          </div>
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            View Rewards
          </button>
        </div>
      </div>

      {/* Title & Actions */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
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

        {/* Metadata with tighter spacing */}
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <div className="flex items-start">
              <span className="font-medium text-gray-900 w-24">Authors</span>
              <div className="flex-1">
                {paper.authors.map((author, i) => (
                  <span key={i} className="inline-flex items-center">
                    <span>{author.name}</span>
                    {author.verified && (
                      <BadgeCheck className="h-4 w-4 text-blue-500 ml-1" />
                    )}
                    <span className="text-gray-500 ml-1">{author.affiliation}</span>
                    {i < paper.authors.length - 1 && (
                      <span className="mx-2 text-gray-400">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium text-gray-900 w-24">Journal</span>
            <span>{paper.journal}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium text-gray-900 w-24">Published</span>
            <span>{paper.publishDate}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium text-gray-900 w-24">DOI</span>
            <span>{paper.doi}</span>
          </div>

          <div className="flex items-center">
            <span className="font-medium text-gray-900 w-24">Keywords</span>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.map((keyword, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  {keyword}
                </span>
              ))}
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
        {activeTab === 'paper' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Abstract</h2>
              <p className="text-gray-700">{paper.abstract}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border">
              <PDFViewer url={paper.pdfUrl} />
            </div>
          </>
        )}
        
        {activeTab === 'reviews' && <PaperReviews paperId={paper.id} />}
        {activeTab === 'rewards' && <PaperRewards paperId={paper.id} />}
        {activeTab === 'comments' && <PaperComments paperId={paper.id} />}
      </div>
    </div>
  )
} 