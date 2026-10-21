'use client';

import { GrantPoolCard } from '@/components/Funding/GrantPoolCard';
import { GrantActivityCard } from '@/components/Funding/GrantActivityCard';
import { DOICard } from '@/components/work/components/DOISection';
import { ID } from '@/types/root';

/**
 * The RFP page's right sidebar: the pool card, then the RFP's DOI where it
 * has one, over the RFP's activity, which can run long.
 */
export function GrantSidebar({
  currentDocumentId,
  doi,
}: {
  /** The RFP's own post, so the activity list doesn't repeat its title. */
  currentDocumentId?: ID;
  doi?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <GrantPoolCard />
      {doi && <DOICard doi={doi} />}
      <GrantActivityCard currentDocumentId={currentDocumentId} />
    </div>
  );
}
