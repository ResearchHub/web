'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FundingTimelineModal } from '@/components/modals/FundingTimelineModal';

/**
 * Note page – rendering is handled by NoteEditorLayout in the parent layout.
 * This page component only exists for:
 *   1. Next.js routing (so /notebook/[orgSlug]/[noteId] resolves).
 *   2. Route-specific side-effects (e.g. the FundingTimelineModal on ?newFunding=true).
 */
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
