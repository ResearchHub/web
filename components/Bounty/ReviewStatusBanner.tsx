'use client';

import { Alert } from '@/components/ui/Alert';
import { Bounty } from '@/types/bounty';
import { findLatestFoundationBounty } from './lib/bountyUtil';
import { AlertCircle } from 'lucide-react';

interface ReviewStatusBannerProps {
  bounties: Bounty[];
}

export const ReviewStatusBanner = ({ bounties }: ReviewStatusBannerProps) => {
  const activeFoundationBounty = findLatestFoundationBounty(bounties);

  if (!activeFoundationBounty) {
    return null;
  }

  if (activeFoundationBounty.status === 'OPEN') {
    return (
      <Alert
        variant="success"
        className="mb-6"
        icon={<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
      >
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

  if (activeFoundationBounty.status === 'ASSESSMENT') {
    return (
      <Alert
        variant="warning"
        className="mb-6"
        icon={<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
      >
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
