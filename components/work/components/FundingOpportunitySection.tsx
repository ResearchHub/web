'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { GRANT_IMAGE_FALLBACK_GRADIENT } from '@/types/grant';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatCompactAmount } from '@/utils/currency';
import { Button } from '@/components/ui/Button';
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
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <h4 className="text-sm font-medium text-gray-900 leading-snug break-words">
          {displayTitle}
        </h4>
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

  const className = 'flex items-center gap-3 rounded-lg hover:bg-gray-100 transition-colors px-1';

  const header = (
    <SidebarHeader
      title="Related Funding"
      action={
        <Tooltip
          content="This proposal applied to this funding opportunity"
          position="top"
          width="w-56"
        >
          <Button className="text-gray-400 hover:text-gray-600" variant="ghost" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>
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
