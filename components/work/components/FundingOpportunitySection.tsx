'use client';

import React from 'react';
import Link from 'next/link';
import { GrantApplication } from '@/types/grantApplication';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { isGrantActive } from '@/components/Grant/lib/grantUtils';
import { ArrowUpRight } from 'lucide-react';

interface FundingOpportunitySectionProps {
  grantApplication: GrantApplication;
}

export function FundingOpportunitySection({ grantApplication }: FundingOpportunitySectionProps) {
  const { grant } = grantApplication;
  const isActive = isGrantActive(grant.status, grant.endDate);
  
  // Format slug for URL
  const slug = grant.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const href = `/opportunity/${grant.id}/${slug}`;

  return (
    <section>
      <SectionHeader title="Funding Opportunity" />
      
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Organization
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {grant.organization}
          </p>
        </div>

        <div>
          <Link 
            href={href}
            className="group block"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                {grant.title}
              </h4>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 flex-shrink-0 mt-1" />
            </div>
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Amount
            </p>
            <CurrencyBadge
              amount={grant.amount.usd > 0 ? grant.amount.usd : grant.amount.rsc}
              currency={grant.amount.usd > 0 ? 'USD' : 'RSC'}
              variant="text"
              size="md"
              fontWeight="font-bold"
              textColor="text-emerald-600"
              showIcon={grant.amount.usd > 0}
              skipConversion={true}
            />
          </div>

          <div className="flex flex-col items-end">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Status
            </p>
            {isActive ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                Open for proposals
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                Closed
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 italic mt-4 leading-relaxed">
          This proposal was submitted in response to the funding opportunity highlighted above.
        </p>
      </div>
    </section>
  );
}
