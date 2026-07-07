import { WorkMetadata } from '@/services/metadata.service';
import { Work } from '@/types/work';

export function createRegisteredReportFallbackMetadata(work: Work): WorkMetadata {
  return {
    id: work.unifiedDocumentId ?? work.id,
    score: work.metrics?.votes ?? 0,
    topics: work.topics ?? [],
    metrics: {
      votes: work.metrics?.votes ?? 0,
      comments: work.metrics?.comments ?? 0,
      saves: work.metrics?.saves ?? 0,
      reviewScore: work.metrics?.reviewScore ?? 0,
      conversationComments: 0,
      reviewComments: 0,
      bountyComments: 0,
    },
    bounties: [],
    activeBounties: 0,
    closedBounties: 0,
  };
}
