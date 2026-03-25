'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';

export default function NotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewFunding = searchParams?.get('newFunding') === 'true';
  const [showFundingModal, setShowFundingModal] = useState(isNewFunding);

  useEffect(() => {
    if (isNewFunding) {
      const url = new URL(window.location.href);
      url.searchParams.delete('newFunding');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [isNewFunding, router]);

  return (
    <FundingTimelineModal isOpen={showFundingModal} onClose={() => setShowFundingModal(false)} />
  );
}
