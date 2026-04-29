'use client';

import { Alert } from '@/components/ui/Alert';
import { Bounty } from '@/types/bounty';
import { findLatestFoundationBounty } from './lib/bountyUtil';
import { AlertCircle, Clock } from 'lucide-react';

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
        variant="info"
        className="mb-6"
        icon={<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
      >
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Submit your peer review.</div>
          <div className="text-sm font-normal">
            Please submit your review before the bounty expires. Editors will assess and award top
            reviews following bounty closure.
          </div>
        </div>
      </Alert>
    );
  }

  if (activeFoundationBounty.status === 'ASSESSMENT') {
    return (
      <Alert
        variant="warning"
        className="mb-6 bg-amber-50 text-amber-800 border border-amber-300"
        icon={<Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-800" />}
      >
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Editor Assessment Period</div>
          <div className="text-sm font-normal">
            Editors are reviewing submissions and will award top reviews.
          </div>
        </div>
      </Alert>
    );
  }

  return null;
};
