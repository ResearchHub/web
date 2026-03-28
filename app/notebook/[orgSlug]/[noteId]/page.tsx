'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';

export default function NotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewFunding = searchParams?.get('newFunding') === 'true';
  const [showFundingModal, setShowFundingModal] = useState(isNewFunding);

  const stripNewFundingParam = () => {
    // Strip the one-time query param so the modal doesn't re-appear on refresh or back navigation
    const url = new URL(globalThis.window.location.href);
    url.searchParams.delete('newFunding');
    router.replace(url.pathname + url.search, { scroll: false });
  };

  useEffect(() => {
    if (isNewFunding) {
      stripNewFundingParam();
    }
  }, [isNewFunding]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FundingTimelineModal isOpen={showFundingModal} onClose={() => setShowFundingModal(false)} />
  );
}
