'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { GRANT_IMAGE_FALLBACK_GRADIENT } from '@/types/grant';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { FeedService } from '@/services/feed.service';
import { FeedGrantContent } from '@/types/feed';
import { buildWorkUrl, generateSlug } from '@/utils/url';
import { formatCompactAmount } from '@/utils/currency';

interface ConnectedGrant {
  id: number;
  shortTitle: string;
  organization: string;
  fundingAmount: number;
  imageUrl: string;
}

interface FundingOpportunitySectionProps {
  grantIds: number[];
}

export function FundingOpportunitySection({ grantIds }: Readonly<FundingOpportunitySectionProps>) {
  const [grant, setGrant] = useState<ConnectedGrant | null>(null);
  const [loading, setLoading] = useState(true);

  const grantIdKey = grantIds.join(',');

  useEffect(() => {
    let cancelled = false;
    const connectedIds = new Set(grantIds);

    async function fetchConnectedGrants() {
      try {
        const results = await Promise.all(
          grantIds.map((id) =>
            FeedService.getFeed({ endpoint: 'grant_feed', grantId: id, pageSize: 1 })
          )
        );
        if (cancelled) return;

        let bestMatch: ConnectedGrant | null = null;

        for (const { entries } of results) {
          const entry = entries[0];
          if (!entry) continue;

          const content = entry.content as FeedGrantContent;
          if (!content.grant || !connectedIds.has(content.grant.id)) continue;

          const fundingAmount = Number(content.grant.amount?.usd) || 0;
          if (!bestMatch || fundingAmount > bestMatch.fundingAmount) {
            bestMatch = {
              id: content.id,
              shortTitle: content.grant.shortTitle || content.title || '',
              organization: content.grant.organization || '',
              fundingAmount,
              imageUrl: content.previewImage || '',
            };
          }
        }

        if (bestMatch) setGrant(bestMatch);
      } catch {
        // Section will hide after loading
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchConnectedGrants();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grantIdKey]);

  if (loading) {
    return (
      <section>
        <SidebarHeader title="Funding Opportunity" />
        <div className="flex gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 animate-pulse">
          <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2 py-0.5">
            <div className="h-2.5 w-16 bg-gray-200 rounded" />
            <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
            <div className="h-2.5 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (!grant) return null;

  const href = buildWorkUrl({
    id: grant.id,
    slug: generateSlug(grant.shortTitle),
    contentType: 'funding_request',
  });

  return (
    <section>
      <SidebarHeader title="Funding Opportunity" />
      <Link
        href={href}
        className="flex gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
      >
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 relative">
          {grant.imageUrl ? (
            <Image
              src={grant.imageUrl}
              alt={grant.shortTitle}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: GRANT_IMAGE_FALLBACK_GRADIENT }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {grant.organization || 'Funding Opportunity'}
          </div>
          <div className="text-sm font-semibold text-gray-900 truncate">{grant.shortTitle}</div>
          {grant.fundingAmount > 0 && (
            <div className="text-xs font-medium text-emerald-600">
              {formatCompactAmount(grant.fundingAmount)} Funding
            </div>
          )}
        </div>
      </Link>
    </section>
  );
}
