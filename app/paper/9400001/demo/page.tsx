import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkRightSidebar } from '@/components/work/WorkRightSidebar';
import { WorkDocument } from '@/components/work/WorkDocument';
import { Suspense } from 'react';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { journalPapers } from '@/store/journalPaperStore';
import { transformWork } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';

export default function DemoCRISPRPaperPage() {
  // Get the CRISPR paper (first in the array)
  const mockPaperData = journalPapers[0];

  // Transform the raw data to Work type
  const mockWork = transformWork(mockPaperData);

  // Create mock metadata that matches WorkMetadata interface
  const mockMetadata: WorkMetadata = {
    id: mockWork.unifiedDocumentId || 7450001,
    score: mockWork.metrics?.votes || 15,
    topics: mockWork.topics,
    metrics: {
      votes: mockWork.metrics?.votes || 15,
      comments: mockWork.metrics?.comments || 12,
      saves: mockWork.metrics?.saves || 8,
      reviewScore: mockWork.metrics?.reviewScore || 4.2,
      reviews: mockWork.metrics?.reviews || 5,
    },
    bounties: [],
    openBounties: 0,
    closedBounties: 0,
  };

  return (
    <PageLayout rightSidebar={<WorkRightSidebar work={mockWork} metadata={mockMetadata} />}>
      <Suspense>
        <WorkDocument work={mockWork} metadata={mockMetadata} defaultTab="paper" />
        <SearchHistoryTracker work={mockWork} />
      </Suspense>
    </PageLayout>
  );
}
