'use client';

import { FC } from 'react';
import { Loader } from '@/components/ui/Loader';
import { JournalSubmissionCard } from './JournalSubmissionCard';

// Import the JournalSubmission type
interface JournalSubmission {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  submissionDate: string;
  status: 'in-review' | 'published';
  reviewDueDate?: string;
  publishDate?: string;
  tags: string[];
}

// Mock data for journal submissions
const mockSubmissions: JournalSubmission[] = [
  {
    id: '1',
    title: 'Deep learning approaches in neurodegenerative disease diagnosis',
    authors: ['John Smith', 'Jane Doe'],
    abstract:
      "A comprehensive review of machine learning algorithms applied to early detection of Alzheimer's disease using neuroimaging data.",
    submissionDate: '2023-10-15',
    status: 'in-review',
    reviewDueDate: '2023-10-29',
    tags: ['AI', 'Neurology', 'Medical Imaging'],
  },
  {
    id: '2',
    title: 'Novel approaches to CRISPR-Cas9 delivery for therapeutic gene editing',
    authors: ['Alice Johnson', 'Robert Chen', 'Sarah Williams'],
    abstract:
      'An investigation of nanoparticle-based delivery systems for CRISPR-Cas9 gene editing technology.',
    submissionDate: '2023-09-30',
    status: 'published',
    publishDate: '2023-10-15',
    tags: ['CRISPR', 'Gene Therapy', 'Nanomedicine'],
  },
  {
    id: '3',
    title: 'The role of gut microbiome in neuropsychiatric disorders',
    authors: ['Michael Brown', 'Emily Davis'],
    abstract:
      'A systematic review examining the connection between gut microbiota and the development of depression, anxiety, and other neuropsychiatric conditions.',
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
