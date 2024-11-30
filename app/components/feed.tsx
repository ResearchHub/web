'use client'

import { useState } from 'react';
import { PageLayout } from './layout/PageLayout';
import { FeedItem } from './FeedItem';
import { FeedTabs } from './FeedTabs';
import { InterestSelector } from './InterestSelector/InterestSelector';
import { InterestTrigger } from './InterestSelector/InterestTrigger';
import { Settings } from 'lucide-react';

const ResearchFeed: React.FC = () => {
  const [publishOpen, setPublishOpen] = useState(false);
  const [showInterests, setShowInterests] = useState(false);
  const [activeInterestTab, setActiveInterestTab] = useState<'journal' | 'person' | 'topic'>('journal');

  const handleInterestSelection = async (interests: any[]) => {
    console.log('Selected interests:', interests);
    setShowInterests(false);
  };

  const feedItems = [
    {
      type: 'journal_publish',
      user: 'bioRxiv (Cold Spring Harbor Laboratory)',
      organization: true,
      verified: true,
      timestamp: 'Oct 18, 2024',
      hub: { name: 'Molecular Biology', slug: 'molecular-biology' },
      title: "Deoxysphingolipids Activate CGAS-STING In Colon Cancer Cells And Enhance Tumor Immunity",
      description: "Deoxysphingolipids (doxSLs) are atypical sphingolipids that accumulate in HSAN1 and diabetic neuropathy. Here, we demonstrate that doxSLs activate the cGAS-STING pathway in colon cancer cells, leading to enhanced tumor immunity. Through comprehensive metabolomic and transcriptomic analyses, we identified key molecular mechanisms underlying this activation. Our findings suggest potential therapeutic applications in cancer immunotherapy.",
      authors: [
        { name: "Suchandrima Saha", verified: true },
        { name: "Fabiola Velázquez", verified: false },
        { name: "David Montrose", verified: true }
      ],
      votes: 8,
      comments: 12,
      doi: "10.1101/2024.10.16.618749",
      journal: "bioRxiv (Cold Spring Harbor Laboratory)",
    },
    {
      type: 'funding_request',
      user: 'Dominikus Brian',
      verified: true,
      timestamp: 'Oct 9, 2024',
      hub: { name: 'Research Methods', slug: 'research-methods' },
      title: 'Incentivized vs Non-Incentivized Open Peer Reviews: Dynamics, Economics, and Quality',
      description: 'Research project exploring the impact of incentive structures on peer review quality and participation.',
      amount: '30,131',
      goal: '36,389',
      progress: 85,
      votes: 45,
      comments: 21,
      contributors: 6
    },
    {
      type: 'reward',
      user: 'ResearchHub Foundation',
      organization: true,
      verified: true,
      timestamp: '1h ago',
      hub: { name: 'Neuroscience', slug: 'neuroscience' },
      title: 'Peer Review: Neural Mechanisms of Memory Formation',
      description: 'Review this manuscript investigating novel pathways in hippocampal memory consolidation using optogenetics and calcium imaging.',
      amount: '500',
      deadline: '3 days',
      difficulty: 'Advanced',
      votes: 15,
      comments: 4,
      action: 'Start'
    },
    {
      type: 'grant',
      user: 'Adam Draper',
      verified: true,
      timestamp: '1h ago',
      hub: { name: 'Environmental Science', slug: 'environmental-science' },
      title: 'Urban Water Quality Assessment: A Multi-City Analysis of Municipal Water Systems Across America',
      description: 'Seeking researchers to conduct comprehensive water quality analysis in developing regions.',
      amount: '500,000',
      votes: 32,
      comments: 12,
      contributors: 15,
      applicants: 8
    },
    {
      type: 'review',
      user: 'Dr. Elena Rodriguez',
      verified: true,
      timestamp: '2h ago',
      hub: { name: 'Medical Devices', slug: 'medical-devices' },
      title: 'Review of "Revolutionizing Patient Care: Advances in Flexible Printed Heaters"',
      description: 'Excellent methodology and comprehensive literature review. The discussion of thermal management challenges could be expanded.',
      votes: 12,
      comments: 3,
      rsc: 150,
      rating: 4,
      tags: ['Medical Science', 'Thermal Management', 'Patient Care']
    },
    {
      type: 'publish',
      user: 'Hundessa Nemomssa',
      verified: true,
      timestamp: '4h ago',
      hub: { name: 'Medical Devices', slug: 'medical-devices' },
      title: 'Revolutionizing Patient Care: A Comprehensive Review',
      description: 'New preprint exploring recent developments in flexible printed heaters for medical devices.',
      votes: 24,
      comments: 7,
      rsc: 300,
      tags: ['Medical Devices', 'Flexible Printed Heaters', 'Patient Care']
    },
    {
      type: 'rsc_contribution',
      user: 'Alex Thompson',
      verified: true,
      timestamp: '15m ago',
      hub: { name: 'Neuroscience', slug: 'neuroscience' },
      amount: 500,
      votes: 12,
      comments: 3,
      relatedItem: {
        type: 'funding_request',
        title: 'Machine Learning Approaches to Early Detection of Neurodegenerative Diseases',
        user: 'Sarah Chen',
        amount: '45,000',
        goal: '75,000',
        progress: 60,
        contributors: 4,
      }
    },    
    {
      type: 'funding_request',
      user: 'Sarah Chen',
      verified: true,
      timestamp: '3h ago',
      hub: { name: 'Neuroscience', slug: 'neuroscience' },
      title: 'Machine Learning Approaches to Early Detection of Neurodegenerative Diseases',
      description: 'Developing AI models to identify early biomarkers of neurodegeneration using multi-modal medical imaging data.',
      amount: '45,000',
      goal: '75,000',
      progress: 60,
      votes: 28,
      comments: 15,
      contributors: 4
    },
    {
      type: 'rsc_contribution',
      user: 'Maria Garcia',
      verified: true,
      timestamp: '45m ago',
      hub: { name: 'Data Science', slug: 'data-science' },
      amount: 750,
      votes: 8,
      comments: 5,
      relatedItem: {
        type: 'reward',
        title: 'Statistical Analysis of COVID-19 Vaccination Efficacy Data',
        user: 'ResearchHub Foundation',
        amount: '2,000',
        deadline: '5 days',
        difficulty: 'Intermediate',
        progress: 40,
        contributors: 3
      }
    },    
  ];

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today in Science</h1>
        <p className="text-gray-600 mt-1">Discover the latest research, grants, earning, and funding opportunities</p>
      </div>

      <FeedTabs 
        showingInterests={showInterests} 
        onInterestsClick={() => setShowInterests(!showInterests)}
        activeInterestTab={activeInterestTab}
        onInterestTabChange={setActiveInterestTab}
      />

      {showInterests ? (
        <InterestSelector
          mode="preferences"
          activeTab={activeInterestTab}
          onComplete={handleInterestSelection}
        />
      ) : (
        <div className="space-y-4">
          {feedItems.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <FeedItem item={item} />
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

export default ResearchFeed;