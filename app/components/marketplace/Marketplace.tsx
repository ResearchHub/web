'use client'

import { useState } from 'react';
import { Store } from 'lucide-react';
import { PageLayout } from '../layout/PageLayout';
import { FeedItem } from '../FeedItem';
import { MarketplaceTabs } from './MarketplaceTabs';
import { MarketplaceSort } from './MarketplaceSort';
import { MarketplaceFundingBanner } from './MarketplaceFundingBanner';
import { MarketplaceRewardsBanner } from './MarketplaceRewardsBanner';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('fund');
  const [selectedSort, setSelectedSort] = useState({ id: 'newest', name: 'Newest' });
  const [showFundingBanner, setShowFundingBanner] = useState(true);
  const [showRewardsBanner, setShowRewardsBanner] = useState(true);

  const marketplaceItems = {
    fund: [
      {
        type: 'funding_request',
        user: 'Sarah Chen',
        verified: true,
        timestamp: '3h ago',
        title: 'ML for Early Detection of Neurodegenerative Diseases',
        description: 'Developing AI models to identify early biomarkers of neurodegeneration.',
        amount: '45,000',
        goal: '75,000',
        progress: 60,
        votes: 28,
        comments: 15,
        contributors: 4
      },
      {
        type: 'funding_request',
        user: 'David Kumar',
        verified: true,
        timestamp: '1d ago',
        title: 'Sustainable Battery Materials Research',
        description: 'Investigating novel eco-friendly materials for next-generation battery technology with improved efficiency.',
        amount: '12,000',
        goal: '50,000',
        progress: 24,
        votes: 45,
        comments: 23,
        contributors: 8
      },
      {
        type: 'funding_request',
        user: 'Elena Rodriguez',
        verified: true,
        timestamp: '2d ago',
        title: 'CRISPR Gene Therapy for Rare Diseases',
        description: 'Developing targeted gene therapy approaches for treating rare genetic disorders using CRISPR-Cas9.',
        amount: '95,000',
        goal: '100,000',
        progress: 95,
        votes: 156,
        comments: 42,
        contributors: 23
      },
      {
        type: 'funding_request',
        user: 'James Wilson',
        verified: false,
        timestamp: '4d ago',
        title: 'Urban Air Quality Monitoring Network',
        description: 'Creating a network of low-cost air quality sensors for real-time urban pollution monitoring and analysis.',
        amount: '3,500',
        goal: '15,000',
        progress: 23,
        votes: 12,
        comments: 8,
        contributors: 5
      },
      {
        type: 'funding_request',
        user: 'Maria Patel',
        verified: true,
        timestamp: '5d ago',
        title: 'Quantum Computing Algorithm Development',
        description: 'Research into novel quantum algorithms for optimization problems in computational chemistry.',
        amount: '68,000',
        goal: '70,000',
        progress: 97,
        votes: 89,
        comments: 31,
        contributors: 15
      }
    ],
    rewards: [
      {
        type: 'reward',
        user: 'ResearchHub Foundation',
        verified: true,
        timestamp: '1d ago',
        title: 'Peer Review: Quantum Computing Applications in Drug Discovery',
        description: 'Review this manuscript discussing novel quantum computing approaches for drug discovery and molecular modeling.',
        amount: '500',
        deadline: '7 days',
        difficulty: 'Advanced',
        votes: 12,
        comments: 3,
        action: 'Review Paper'
      },
      {
        type: 'reward',
        user: 'ResearchHub Foundation',
        verified: true,
        timestamp: '2d ago',
        title: 'Peer Review: CRISPR-Based Gene Therapy Methods',
        description: 'Evaluate methodology and results of a new CRISPR-based therapeutic approach for genetic disorders.',
        amount: '500',
        deadline: '5 days',
        difficulty: 'Advanced',
        votes: 8,
        comments: 2,
        action: 'Review Paper'
      },
      {
        type: 'reward',
        user: 'ResearchHub Foundation',
        verified: true,
        timestamp: '3d ago',
        title: 'Peer Review: Machine Learning in Climate Modeling',
        description: 'Review a paper on implementing deep learning algorithms for improved climate prediction models.',
        amount: '500',
        deadline: '10 days',
        difficulty: 'Advanced',
        votes: 15,
        comments: 4,
        action: 'Review Paper'
      },
      {
        type: 'reward',
        user: 'Stanford AI Lab',
        verified: true,
        timestamp: '1d ago',
        title: 'Dataset Annotation: Medical Imaging',
        description: 'Help annotate MRI scans for machine learning model training. Medical background required.',
        amount: '300',
        deadline: '14 days',
        difficulty: 'Intermediate',
        votes: 24,
        comments: 7,
        action: 'Start Annotating'
      },
      {
        type: 'reward',
        user: 'Climate Research Institute',
        verified: true,
        timestamp: '4d ago',
        title: 'Data Analysis: Weather Station Readings',
        description: 'Analyze and clean historical weather station data from remote locations.',
        amount: '250',
        deadline: '30 days',
        difficulty: 'Intermediate',
        votes: 18,
        comments: 5,
        action: 'Analyze Data'
      },
      {
        type: 'reward',
        user: 'Open Biology Initiative',
        verified: true,
        timestamp: '2d ago',
        title: 'Protocol Translation',
        description: 'Translate detailed laboratory protocols from English to Spanish. Biology expertise required.',
        amount: '200',
        deadline: '20 days',
        difficulty: 'Beginner',
        votes: 9,
        comments: 2,
        action: 'Start Translation'
      },
      {
        type: 'reward',
        user: 'Quantum Computing Group',
        verified: true,
        timestamp: '5d ago',
        title: 'Code Review: Quantum Algorithm Implementation',
        description: 'Review Python implementation of a new quantum computing algorithm for optimization problems.',
        amount: '400',
        deadline: '10 days',
        difficulty: 'Advanced',
        votes: 31,
        comments: 8,
        action: 'Review Code'
      }
    ],
    grants: [
      {
        type: 'grant',
        user: 'National Science Foundation',
        verified: true,
        timestamp: '2d ago',
        title: 'Climate Change Impact Assessment Grant',
        description: 'Research grant for studying climate change effects on coastal ecosystems.',
        amount: '750,000',
        applicants: 12,
        votes: 45,
        comments: 8
      }
    ]
  };

  const getSortedItems = (items: any[]) => {
    switch (selectedSort.id) {
      case 'amount':
        return [...items].sort((a, b) => parseInt(b.amount.replace(',', '')) - parseInt(a.amount.replace(',', '')));
      case 'progress':
        return [...items].sort((a, b) => b.progress - a.progress);
      case 'reward':
        return [...items].sort((a, b) => parseInt(b.reward) - parseInt(a.reward));
      case 'deadline':
        return [...items].sort((a, b) => parseInt(a.deadline) - parseInt(b.deadline));
      case 'popular':
        return [...items].sort((a, b) => b.votes - a.votes);
      case 'applicants':
        return [...items].sort((a, b) => b.applicants - a.applicants);
      case 'difficulty':
        const difficultyOrder = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
        return [...items].sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
      case 'newest':
      default:
        return items; // Assuming items are already sorted by newest
    }
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Store className="h-7 w-7 text-gray-900" />
          <h1 className="text-2xl font-bold text-gray-900">ResearchCoin Marketplace</h1>
        </div>
        <p className="text-gray-600 mt-1">Fund science, apply for grants, or earn RSC through contributions</p>
      </div>

      <MarketplaceTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {showFundingBanner && activeTab === 'fund' && (
        <div className="mt-6">
          <MarketplaceFundingBanner onDismiss={() => setShowFundingBanner(false)} />
        </div>
      )}

      {showRewardsBanner && activeTab === 'rewards' && (
        <div className="mt-6">
          <MarketplaceRewardsBanner onDismiss={() => setShowRewardsBanner(false)} />
        </div>
      )}

      <div className="flex justify-end mt-4 mb-6">
        <MarketplaceSort
          activeTab={activeTab}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
        />
      </div>

      <div className="space-y-4">
        {getSortedItems(marketplaceItems[activeTab]).map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <FeedItem item={item} />
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

export default Marketplace; 