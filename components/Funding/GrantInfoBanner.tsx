'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

interface GrantInfoBannerProps {
  className?: string;
  description: string;
  content?: string;
  amountUsd?: number;
  grantId?: string;
  isActive?: boolean;
  imageUrl?: string;
}

export const GrantInfoBanner = ({
  className,
  description,
  content,
  amountUsd,
  grantId,
  isActive = true,
  imageUrl,
}: GrantInfoBannerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const isTruncated = description.length > 200;
  const preview = isTruncated ? description.slice(0, 200).trimEnd() : description;

  return (
    <>
      <div
        className={cn(
          'w-full rounded-xl bg-gray-50 border border-gray-200 overflow-hidden transition-colors',
          content && 'hover:bg-gray-100/70',
          className
        )}
      >
        <div className={imageUrl ? 'sm:!flex' : ''}>
          {imageUrl && (
            <div className="relative flex-shrink-0 w-[160px] min-h-[120px] hidden sm:!block">
              <Image src={imageUrl} alt="Grant" fill className="object-cover" sizes="160px" />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col px-4 py-3">
            <button
              type="button"
              onClick={() => content && setIsExpanded(!isExpanded)}
              className={`w-full text-left ${content ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base leading-none">🏆</span>
                <span className="text-sm font-semibold text-gray-900">Award Details</span>
                {amountUsd != null && amountUsd > 0 && (
                  <span
                    className={`font-mono font-bold text-[13px] px-2 py-0.5 rounded-md tabular-nums ${isActive ? 'text-primary-700 bg-primary-100' : 'text-gray-500 bg-gray-200'}`}
                  >
                    {formatCompactAmount(amountUsd)}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {preview}
                {isTruncated && <span className="text-sm font-bold text-gray-900 ml-0.5">...</span>}
              </p>

              {content && (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-900 mt-1.5">
                  {isExpanded ? 'Show less' : 'Learn more'}
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              )}
            </button>

            {grantId && (
              <div className="border-t border-gray-200 mt-3 pt-2.5 flex items-center justify-end">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="gap-1.5"
                >
                  Submit Proposal
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && content && (
        <div className="post-content rounded-b-xl bg-gray-50 px-6 py-4">
          <PostBlockEditor content={content} />
        </div>
      )}

      {grantId && (
        <ApplyToGrantModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onUseSelected={() => setIsApplyModalOpen(false)}
          grantId={grantId}
        />
      )}
    </>
  );
};
