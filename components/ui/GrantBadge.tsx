'use client';

import { FC } from 'react';
import Link from 'next/link';
import { AssociatedGrant } from '@/types/feed';
import { generateSlug, buildWorkUrl } from '@/utils/url';
import { GrantPreviewTooltip } from '@/components/tooltips/GrantPreviewTooltip';

export const GrantBadge: FC<{
  grant: AssociatedGrant;
  size?: 'sm' | 'md';
  hideIcon?: boolean;
  className?: string;
}> = ({ grant, size = 'sm', hideIcon = false, className }) => {
  const title = grant.shortTitle || grant.organization;
  const href = buildWorkUrl({
    id: grant.postId ?? grant.id,
    slug: generateSlug(title),
    contentType: 'funding_request',
  });

  const defaultStyles =
    size === 'md'
      ? 'text-xs px-2.5 py-1 gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-full'
      : 'text-[11px] px-2 py-0.5 gap-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-full';

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
        className={`inline-flex items-center max-w-full font-medium transition-colors truncate ${className ?? defaultStyles}`}
      >
        {!hideIcon && <span className="flex-shrink-0 text-[10px] leading-none">🏆</span>}
        <span className="truncate">{title}</span>
      </Link>
    </GrantPreviewTooltip>
  );
};
