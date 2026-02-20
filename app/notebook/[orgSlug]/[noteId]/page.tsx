'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';

export default function NotePage() {
  const searchParams = useSearchParams();
  const isNewFunding = searchParams?.get('newFunding') === 'true';
  const [showFundingModal, setShowFundingModal] = useState(false);

  useEffect(() => {
    if (isNewFunding) {
      setShowFundingModal(true);
    }
  }, [isNewFunding]);

  return (
    <FundingTimelineModal isOpen={showFundingModal} onClose={() => setShowFundingModal(false)} />
  );
}
