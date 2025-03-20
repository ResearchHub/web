'use client';

import { FC } from 'react';
import { JournalSubmissionCard } from './JournalSubmissionCard';
import { Loader } from '@/components/ui/Loader';

// Mock data for journal submissions
const mockSubmissions = [
  {
    id: '1',
    title: 'The role of gut microbiota in neurodegenerative diseases',
    authors: ['John Smith', 'Sarah Johnson', 'Michael Brown'],
    abstract:
      "This study investigates the connection between gut microbiota composition and the progression of neurodegenerative diseases such as Alzheimer's and Parkinson's.",
    submissionDate: '2023-08-12',
    status: 'in-review',
    reviewDueDate: '2023-08-26',
    tags: ['Neuroscience', 'Microbiology'],
  },
  {
    id: '2',
    title: 'Climate change impacts on global food security: A systematic review',
    authors: ['Emily Chen', 'David Wilson', 'Anna Lopez'],
    abstract:
      'A comprehensive analysis of how climate change affects agricultural productivity and food security across different regions of the world.',
    submissionDate: '2023-07-30',
    status: 'published',
    publishDate: '2023-09-15',
    tags: ['Climate Science', 'Food Security', 'Agriculture'],
  },
  {
    id: '3',
    title: 'Novel CRISPR-based gene therapy for hereditary retinal disorders',
    authors: ['James Taylor', 'Olivia Garcia', 'Robert Kim'],
    abstract:
      'This research presents a new approach to treating inherited retinal diseases using CRISPR-Cas9 gene editing technology.',
    submissionDate: '2023-09-05',
    status: 'in-review',
    reviewDueDate: '2023-09-19',
    tags: ['Genetics', 'Ophthalmology', 'Gene Therapy'],
  },
  {
    id: '4',
    title: 'Quantum machine learning algorithms for materials discovery',
    authors: ['Lisa Zhang', 'Thomas Wright', 'Maria Rodriguez'],
    abstract:
      'An exploration of how quantum computing algorithms can accelerate the discovery of new materials with specific properties for industrial applications.',
    submissionDate: '2023-08-20',
    status: 'published',
    publishDate: '2023-10-01',
    tags: ['Quantum Computing', 'Materials Science', 'Machine Learning'],
  },
  {
    id: '5',
    title: 'The effectiveness of mindfulness-based interventions for anxiety disorders',
    authors: ['Daniel Lee', 'Patricia Adams', 'Kevin Martin'],
    abstract:
      'A meta-analysis evaluating the efficacy of mindfulness-based therapeutic approaches for treating various forms of anxiety disorders.',
    submissionDate: '2023-09-10',
    status: 'in-review',
    reviewDueDate: '2023-09-24',
    tags: ['Psychology', 'Mental Health', 'Mindfulness'],
  },
];

interface JournalFeedProps {
  activeTab: string;
  isLoading: boolean;
  tabs: React.ReactNode;
}

export const JournalFeed: FC<JournalFeedProps> = ({ activeTab, isLoading, tabs }) => {
  // Filter submissions based on active tab
  const filteredSubmissions = mockSubmissions.filter((submission) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in-review') return submission.status === 'in-review';
    if (activeTab === 'published') return submission.status === 'published';
    return true;
  });

  return (
    <div className="space-y-4">
      {tabs}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((submission) => (
              <JournalSubmissionCard key={submission.id} submission={submission} />
            ))
          ) : (
            <div className="flex justify-center items-center py-16 text-gray-500">
              No submissions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
