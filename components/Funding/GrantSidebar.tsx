'use client';

import { GrantPoolCard } from '@/components/Funding/GrantPoolCard';
import { GrantActivityCard } from '@/components/Funding/GrantActivityCard';
import { ID } from '@/types/root';

/** The RFP page's right sidebar: the pool card over the RFP's activity. */
export function GrantSidebar({
  currentDocumentId,
}: {
  /** The RFP's own post, so the activity list doesn't repeat its title. */
  currentDocumentId?: ID;
}) {
  return (
    <div className="flex flex-col gap-3">
      <GrantPoolCard />
      <GrantActivityCard currentDocumentId={currentDocumentId} />
    </div>
  );
}
