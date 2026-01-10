'use client';

import { Alert } from '@/components/ui/Alert';
import { Bounty } from '@/types/bounty';
import { findLatestActiveReviewBounty } from './lib/bountyUtil';

interface ReviewStatusBannerProps {
  bounties: Bounty[];
}

export const ReviewStatusBanner = ({ bounties }: ReviewStatusBannerProps) => {
  const activeReviewBounty = findLatestActiveReviewBounty(bounties);

  if (!activeReviewBounty) {
    return null;
  }

  if (activeReviewBounty.status === 'OPEN') {
    return (
      <Alert variant="success" className="mb-6">
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Review Submission Period</div>
          <div className="text-sm font-normal">
            Editors will assess and award top reviews following bounty closure. Reviews are
            currently unassessed.
          </div>
        </div>
      </Alert>
    );
  }

  if (activeReviewBounty.status === 'ASSESSMENT') {
    return (
      <Alert variant="warning" className="mb-6">
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Editor Assessment Period</div>
          <div className="text-sm font-normal">
            Editors are reviewing any submissions and will award top reviews.
          </div>
        </div>
      </Alert>
    );
  }

  return null;
};
