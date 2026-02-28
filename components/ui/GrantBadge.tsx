'use client';

import { FC } from 'react';
import Link from 'next/link';
import { AssociatedGrant } from '@/types/feed';
import { generateSlug } from '@/utils/url';
import { GrantPreviewTooltip } from '@/components/tooltips/GrantPreviewTooltip';

export const GrantBadge: FC<{ grant: AssociatedGrant }> = ({ grant }) => {
  const href = `/grant/${grant.id}/${generateSlug(grant.shortTitle || grant.organization)}`;
  const title = grant.shortTitle || grant.organization;

  return (
    <GrantPreviewTooltip
      href={href}
      title={title}
      description={grant.description}
      image={grant.image}
      amount={grant.amount}
      currency={grant.currency}
      numApplicants={grant.numApplicants}
    >
      <Link
        href={href}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 max-w-full text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-full px-2 py-0.5 transition-colors truncate"
      >
        <span className="flex-shrink-0 text-[10px] leading-none">💰</span>
        <span className="truncate">{title}</span>
      </Link>
    </GrantPreviewTooltip>
  );
};
