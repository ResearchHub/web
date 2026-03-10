'use client';

import Link from 'next/link';
import { ArrowUpFromLine, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

interface FundingHeroBannerProps {
  className?: string;
  totalFundingUsd: number;
}

export function FundingHeroBanner({ className, totalFundingUsd }: FundingHeroBannerProps) {
  return (
    <div className={cn('w-full bg-gray-50/80 border-b border-gray-200', className)}>
      <div className="max-w-[1180px] mx-auto pl-4 tablet:!pl-8 pr-4 tablet:!pr-0 py-5">
        <div className="flex items-center gap-6">
          <div className="flex-1 min-w-0">
            {totalFundingUsd > 0 && (
              <div className="mb-1.5">
                <span className="font-mono font-bold text-base px-2.5 py-0.5 rounded-md tabular-nums text-green-700 bg-green-100">
                  {formatCompactAmount(totalFundingUsd)} available
                </span>
              </div>
            )}

            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Open Science Funding
            </h1>
            <p className="text-base text-gray-700 mt-[10px]">
              Browse proposals seeking funding or submit your own
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-2">
            <Link href="/fund/proposal/create">
              <Button variant="default" size="lg" className="gap-2 w-full">
                Submit Proposal
                <ArrowUpFromLine className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/notebook?newGrant=true">
              <Button variant="outlined" size="lg" className="gap-2 w-full">
                Create Grant
                <Plus className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
