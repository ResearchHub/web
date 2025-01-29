'use client';

import { useState } from 'react';
import { BarChart2, Coins } from 'lucide-react';
import { Work } from '@/types/work';
import { WorkRightSidebar } from './WorkRightSidebar';
import { WorkReviews } from './WorkReviews';
import { WorkBounties } from './WorkBounties';
import { WorkComments } from './WorkComments';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkLineItems } from './WorkLineItems';
import { WorkMetadata } from '@/services/metadata.service';
import { DocumentViewer } from './DocumentViewer';

interface WorkDocumentProps {
  work: Work;
  metadata: WorkMetadata;
}

export const WorkDocument = ({ work, metadata }: WorkDocumentProps) => {
  const [activeTab, setActiveTab] = useState('paper');
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [showMobileMetrics, setShowMobileMetrics] = useState(false);

  // Mock data - would come from API
  const openBounties = [
    {
      id: 1,
      title: 'Comprehensive Methodology Review',
      description:
        'Looking for an expert review focusing on the methodology and statistical analysis.',
      amount: 500,
      deadline: '7 days',
    },
    {
      id: 2,
      title: 'Replication Study',
      description: 'Seeking researchers to replicate key findings from Figure 3.',
      amount: 1500,
      deadline: '30 days',
    },
  ];

  return (
    <div>
      {/* Rewards Banner */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg border border-orange-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Coins className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-orange-900">RSC Bounties Available</h2>
                  <p className="mt-1 text-sm text-orange-700">
                    Earn ResearchCoin by completing bounties on this paper
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRewardModalOpen(true)}
                className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
              >
                View Bounties
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Title & Actions */}
      {work.type === 'preprint' && (
        <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
          Preprint
        </div>
      )}
      <PageHeader title={work.title} className="text-3xl mt-2" />
      <button
        className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
        onClick={() => setShowMobileMetrics(true)}
      >
        <BarChart2 className="h-4 w-4" />
        <span>Insights</span>
      </button>
      <WorkLineItems work={work} />
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
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'reviews'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {work.metrics.reviews}
            </span>
          </button>
          <button
            className={`px-1 py-4 text-sm font-medium ${
              activeTab === 'bounties'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('bounties')}
          >
            Bounties
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'bounties'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
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
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'comments'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {work.metrics.comments}
            </span>
          </button>
        </nav>
      </div>
      {/* Content */}
      <div>
        {activeTab === 'paper' && (
          <>
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Abstract</h2>
              <p className="text-gray-700">{work.abstract}</p>
            </div>

            {/* PDF Viewer */}
            {work.formats.find((format) => format.type === 'PDF')?.url && (
              <div className="bg-white rounded-lg shadow-sm border mb-6">
                <DocumentViewer
                  url={work.formats.find((format) => format.type === 'PDF')?.url || ''}
                  className="min-h-[800px]"
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'reviews' && <WorkReviews workId={work.id} />}
        {activeTab === 'bounties' && <WorkBounties workId={work.id.toString()} />}
        {activeTab === 'comments' && <WorkComments workId={work.id} />}
      </div>
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
          onClick={(e) => e.stopPropagation()}
        >
          <WorkRightSidebar metadata={metadata} work={work} />
        </div>
      </div>
    </div>
  );
};
