'use client';

import { useState } from 'react';
import { ArrowUpFromLine } from 'lucide-react';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { GrantDetailsModal } from '@/components/modals/GrantDetailsModal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { Work } from '@/types/work';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

interface GrantInfoBannerProps {
  className?: string;
  amountUsd?: number;
  grantId?: string;
  isActive?: boolean;
  work?: Work;
  organization?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
}

export const GrantInfoBanner = ({
  className,
  amountUsd,
  grantId,
  isActive = true,
  work,
  organization,
  description,
  content,
  imageUrl,
}: GrantInfoBannerProps) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  return (
    <>
      <div className={cn('w-full bg-gray-50/80 border-b border-gray-200', className)}>
        <div className="max-w-[1180px] mx-auto pl-4 tablet:!pl-8 pr-4 tablet:!pr-0 py-5">
          {/* Two-column: left title + badges, right CTA */}
          <div className="flex items-center gap-6">
            <div className="flex-1 min-w-0">
              {amountUsd != null && amountUsd > 0 && (
                <div className="mb-1.5">
                  <span
                    className={cn(
                      'font-mono font-bold text-base px-2.5 py-0.5 rounded-md tabular-nums',
                      isActive ? 'text-primary-800 bg-primary-200/70' : 'text-gray-500 bg-gray-100'
                    )}
                  >
                    {formatCompactAmount(amountUsd)}
                  </span>
                </div>
              )}

              {work?.title && (
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                  {work.title}
                </h1>
              )}

              {organization && (
                <p className="text-base text-gray-700 mt-[10px]">Offered by {organization}</p>
              )}
            </div>

            <div className="flex-shrink-0 flex flex-col gap-2">
              {grantId && isActive && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="gap-2"
                >
                  Submit Proposal
                  <ArrowUpFromLine className="w-5 h-5" />
                </Button>
              )}
              <Button variant="outlined" size="lg" onClick={() => setIsDetailsModalOpen(true)}>
                View details
              </Button>
            </div>
          </div>
        </div>
      </div>

      <GrantDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onSubmitProposal={() => setIsApplyModalOpen(true)}
        content={content}
        imageUrl={imageUrl}
        isActive={isActive}
      />

      {grantId && (
        <ApplyToGrantModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onUseSelected={() => setIsApplyModalOpen(false)}
          grantId={grantId}
          grantTitle={work?.title}
          grantAmountUsd={amountUsd}
        />
      )}
    </>
  );
};
