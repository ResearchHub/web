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
          'w-full rounded-xl bg-primary-50 p-3 transition-colors',
          content && 'hover:bg-primary-100',
          className
        )}
      >
        <div className={imageUrl ? 'sm:!flex sm:gap-3' : ''}>
          {imageUrl && (
            <div className="relative flex-shrink-0 w-[240px] min-h-[120px] rounded-lg overflow-hidden hidden sm:!block">
              <Image src={imageUrl} alt="Grant" fill className="object-cover" sizes="240px" />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col px-1">
            <button
              type="button"
              onClick={() => content && setIsExpanded(!isExpanded)}
              className={`w-full text-left ${content ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-md font-semibold text-primary-900">Award Details</span>
                {amountUsd != null && amountUsd > 0 && (
                  <span
                    className={`font-mono font-bold text-sm px-2 py-0.5 rounded-md tabular-nums ${isActive ? 'text-primary-800 bg-primary-200/70' : 'text-gray-500 bg-gray-200'}`}
                  >
                    {formatCompactAmount(amountUsd)}
                  </span>
                )}
              </div>

              <p className="text-sm text-primary-800 leading-relaxed line-clamp-3">
                {preview}
                {isTruncated && (
                  <span className="text-sm font-bold text-primary-900 ml-0.5">...</span>
                )}
              </p>

              {content && (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-primary-900 mt-1.5">
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
              <div className="border-t border-primary-200 mt-3 pt-2.5 flex items-center justify-end">
                <Button
                  variant="default"
                  size="md"
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
        <div className="post-content rounded-b-xl bg-primary-50/25 px-6 py-4">
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
