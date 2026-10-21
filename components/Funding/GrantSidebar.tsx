'use client';

import type { ComponentProps } from 'react';
import { GrantPoolCard } from '@/components/Funding/GrantPoolCard';
import { GrantActivityCard } from '@/components/Funding/GrantActivity';
import { ID } from '@/types/root';

interface GrantSidebarProps extends ComponentProps<typeof GrantPoolCard> {
  /** The RFP's own post, so the activity list doesn't repeat its title. */
  currentDocumentId?: ID;
}

/** The RFP page's right sidebar: the pool card over the RFP's activity. */
export function GrantSidebar({ currentDocumentId, ...poolCard }: GrantSidebarProps) {
  return (
    <div className="flex flex-col gap-3">
      <GrantPoolCard {...poolCard} />
      <GrantActivityCard currentDocumentId={currentDocumentId} />
    </div>
  );
}
