'use client'

import { useState } from 'react'
import { 
  ArrowUp, Download, Flag, Edit, Bookmark, MessageSquare,
  Coins, FileText, Share2
} from 'lucide-react'
import { PDFViewer } from './PDFViewer'
import { PaperReviews } from './PaperReviews'
import { PaperRewards } from './PaperRewards'
import { PaperComments } from './PaperComments'
export const PaperDocument = ({ paper }) => {
  const [activeTab, setActiveTab] = useState('paper')
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <ArrowUp className="h-5 w-5" />
            <span>{paper.metrics.votes}</span>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{paper.title}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Bookmark className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200">
              <Coins className="h-4 w-4" />
              <span>Tip RSC</span>
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-y-2 text-sm text-gray-600">
          <div className="w-full md:w-auto md:mr-8">
            <span className="font-medium">Authors:</span>
            {paper.authors.map((author, i) => (
              <span key={i} className="ml-2">{author.name}</span>
            ))}
          </div>
          <div className="w-full md:w-auto md:mr-8">
            <span className="font-medium">Published:</span>
            <span className="ml-2">{paper.publishDate}</span>
          </div>
          <div className="w-full md:w-auto">
            <span className="font-medium">DOI:</span>
            <span className="ml-2">{paper.doi}</span>
          </div>
        </div>

        {/* Keywords */}
        <div className="mt-4 flex flex-wrap gap-2">
          {paper.keywords.map((keyword, i) => (
            <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b mb-6">
        <div className="flex space-x-8">
          <button 
            className={`px-1 py-4 text-sm font-medium ${
              activeTab === 'paper' 
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
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
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
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

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-medium text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Flag className="h-4 w-4" />
                <span>Flag Content</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-medium text-gray-900 mb-4">Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Views</span>
                <span className="font-medium">{paper.metrics.views}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Citations</span>
                <span className="font-medium">{paper.metrics.citations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Comments</span>
                <span className="font-medium">{paper.metrics.comments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 