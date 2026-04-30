'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { GRANT_IMAGE_FALLBACK_GRADIENT } from '@/types/grant';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatCompactAmount } from '@/utils/currency';
import { buildWorkUrl, generateSlug } from '@/utils/url';
import { LinkedGrant } from '@/types/work';

interface FundingOpportunitySectionProps {
  grant: LinkedGrant;
}

export function FundingOpportunitySection({ grant }: Readonly<FundingOpportunitySectionProps>) {
  const displayTitle =
    grant.title || grant.shortTitle || grant.organization || 'Funding Opportunity';

  const content = (
    <>
      <div className="min-w-0 flex-1 h-16 flex flex-col justify-center">
        <h4 className="text-sm font-medium text-gray-900 leading-snug line-clamp-1">
          {displayTitle}
        </h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="truncate">{grant.organization}</span>
          {grant.applicantCount > 0 && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Users size={12} />
              {grant.applicantCount}
            </span>
          )}
        </div>
        {grant.fundingAmount > 0 && (
          <div className="mt-1 text-sm font-semibold font-mono text-gray-900">
            {formatCompactAmount(grant.fundingAmount)}
            <span className="text-xs font-sans font-normal text-gray-500 ml-1">available</span>
          </div>
        )}
      </div>
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {grant.imageUrl ? (
          <Image
            src={grant.imageUrl}
            alt={displayTitle}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: GRANT_IMAGE_FALLBACK_GRADIENT }} />
        )}
      </div>
    </>
  );

  const className =
    'flex items-center gap-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors px-1';

  const header = (
    <SidebarHeader
      title="Related Funding"
      action={
        <Tooltip
          content="This proposal applied to this funding opportunity"
          position="top"
          width="w-56"
        >
          <span className="text-gray-400 hover:text-gray-600 cursor-help text-xs">ⓘ</span>
        </Tooltip>
      }
    />
  );

  if (grant.postId) {
    const href = buildWorkUrl({
      id: grant.postId,
      slug: generateSlug(displayTitle),
      contentType: 'funding_request',
    });

    return (
      <section>
        {header}
        <Link href={href} className={className}>
          {content}
        </Link>
      </section>
    );
  }

  return (
    <section>
      {header}
      <div className={className}>{content}</div>
    </section>
  );
}
