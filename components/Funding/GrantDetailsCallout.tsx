'use client';

import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { PostBlockEditor } from '@/components/work/PostBlockEditor';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { Button } from '@/components/ui/Button';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

interface GrantDetailsCalloutProps {
  description: string;
  /** Full HTML content shown in expanded view */
  content?: string;
  amountUsd?: number;
  grantId?: string;
  isActive?: boolean;
}

export const GrantDetailsCallout = ({
  description,
  content,
  amountUsd,
  grantId,
  isActive = true,
}: GrantDetailsCalloutProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const isTruncated = description.length > 300;
  const preview = isTruncated ? description.slice(0, 300).trimEnd() : description;

  return (
    <>
      <div className="mt-4 w-full rounded-xl bg-gray-50 px-4 py-3">
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

        <div className="border-t border-gray-200 mt-3 pt-2.5 flex items-center gap-2">
          {content && (
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1"
            >
              {isExpanded ? 'Show less' : 'Read more'}
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
          {grantId && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsApplyModalOpen(true)}
              className="gap-1.5"
            >
              Submit Proposal
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {isExpanded && content && (
        <div className="post-content rounded-b-xl bg-gray-50 px-6 py-4 -mt-2">
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
