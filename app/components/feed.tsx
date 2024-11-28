'use client'

import { useState } from 'react';
import { PageLayout } from './layout/PageLayout';
import { FeedItem } from './FeedItem';
import { FeedTabs } from './FeedTabs';

const ResearchFeed: React.FC = () => {
  const [publishOpen, setPublishOpen] = useState(false);

  const feedItems = [
    {
      type: 'funding_request',
      user: 'Dominikus Brian',
      verified: true,
      timestamp: 'Oct 9, 2024',
      title: 'Incentivized vs Non-Incentivized Open Peer Reviews: Dynamics, Economics, and Quality',
      description: 'Research project exploring the impact of incentive structures on peer review quality and participation.',
      amount: '122,131',
      goal: '36,389',
      progress: 100,
      votes: 45,
      comments: 21,
      contributors: 6
    },
    {
      type: 'grant',
      user: 'Adam Draper',
      verified: true,
      timestamp: '1h ago',
      title: 'Water Quality Research Grant',
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
      organization: 'MIT',
      verified: true,
      timestamp: '2h ago',
      title: 'Review of "Revolutionizing Patient Care: Advances in Flexible Printed Heaters"',
      description: 'Excellent methodology and comprehensive literature review. The discussion of thermal management challenges could be expanded.',
      votes: 12,
      comments: 3,
      rsc: 150,
      tags: ['Medical Science', 'Thermal Management', 'Patient Care']
    },
    {
      type: 'publish',
      user: 'Hundessa Nemomssa',
      organization: 'Stanford University',
      verified: true,
      timestamp: '4h ago',
      title: 'Revolutionizing Patient Care: A Comprehensive Review',
      description: 'New preprint exploring recent developments in flexible printed heaters for medical devices.',
      votes: 24,
      comments: 7,
      rsc: 300,
      tags: ['Medical Devices', 'Flexible Printed Heaters', 'Patient Care']
    },
    {
      type: 'funding_request',
      user: 'Sarah Chen',
      verified: true,
      timestamp: '3h ago',
      title: 'Machine Learning Approaches to Early Detection of Neurodegenerative Diseases',
      description: 'Developing AI models to identify early biomarkers of neurodegeneration using multi-modal medical imaging data.',
      amount: '45,000',
      goal: '75,000',
      progress: 60,
      votes: 28,
      comments: 15,
      contributors: 4
    }
  ];

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today in Science</h1>
        <p className="text-gray-600 mt-1">Discover the latest research, grants, earning, and funding opportunities</p>
      </div>

      <FeedTabs />
      <div className="space-y-4">
        {feedItems.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <FeedItem item={item} />
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

export default ResearchFeed;