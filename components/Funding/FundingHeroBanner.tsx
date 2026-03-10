'use client';

import Link from 'next/link';
import { ArrowUpFromLine, Plus, FileEdit, Users, ChevronRight, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SubmitProposalTooltip } from '@/components/tooltips/SubmitProposalTooltip';
import { cn } from '@/utils/styles';

interface FundingHeroBannerProps {
  className?: string;
}

export function FundingHeroBanner({ className }: FundingHeroBannerProps) {
  return (
    <div className={cn('w-full bg-gray-50/80 border-b border-gray-200', className)}>
      <div className="max-w-[1180px] mx-auto pl-4 tablet:!pl-8 pr-4 tablet:!pr-0 py-5">
        <div className="flex items-center gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Open Science Funding
            </h1>
            <div className="flex items-center gap-2 mt-2.5 text-md text-gray-500">
              <FileEdit className="w-4 h-4 text-gray-700 flex-shrink-0" />
              <span>Researchers propose</span>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Users className="w-4 h-4 text-gray-700 flex-shrink-0" />
              <span>Experts review</span>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <HandCoins className="w-4 h-4 text-gray-700 flex-shrink-0" />
              <span>Funders allocate</span>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-2">
            <SubmitProposalTooltip>
              <Link href="/notebook?newFunding=true">
                <Button variant="default" size="lg" className="gap-2 w-full">
                  Submit Proposal
                  <ArrowUpFromLine className="w-5 h-5" />
                </Button>
              </Link>
            </SubmitProposalTooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
