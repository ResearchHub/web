'use client';

import { AwardPlacements } from '@/components/Funding/AwardPlacements';
import { GrantPoolCard } from '@/components/Funding/GrantPoolCard';
import { GrantActivityCard } from '@/components/Funding/GrantActivityCard';
import { ID } from '@/types/root';

/** The RFP page's right sidebar: the pool card, awardees when it is an award, then activity. */
export function GrantSidebar({
  currentDocumentId,
}: {
  /** The RFP's own post, so the activity list doesn't repeat its title. */
  currentDocumentId?: ID;
}) {
  return (
    <div className="flex flex-col gap-3">
      <GrantPoolCard />
      <AwardPlacements />
      <GrantActivityCard currentDocumentId={currentDocumentId} />
    </div>
  );
}
