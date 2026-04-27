'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { KeyInsightData, ProposalReview } from '@/types/aiPeerReview';
import type { PeerReview } from '@/types/work';
import { AiPeerReviewVerdictBadge } from './AiPeerReviewVerdictBadge';
import { AiPeerReviewInlineHighlights } from './AiPeerReviewInlineHighlights';

interface AiPeerReviewCardProps {
  aiPeerReview: ProposalReview | null | undefined;
  peerReviews?: PeerReview[];
  averageReviewScore?: number;
}

const TLDR_MAX_CHARS = 300;

function AutomatedReviewSection({ keyInsight }: { keyInsight: KeyInsightData | null }) {
  const [tldrExpanded, setTldrExpanded] = useState(false);
  const tldr = keyInsight?.tldr ?? '';
  const shouldTruncate = tldr.length > TLDR_MAX_CHARS;
  const displayedTldr =
    shouldTruncate && !tldrExpanded ? `${tldr.slice(0, TLDR_MAX_CHARS)}...` : tldr;

  return (
    <div>
      {tldr ? (
        <p className="mb-2 text-sm leading-relaxed text-gray-800">
          {displayedTldr}
          {shouldTruncate ? (
            <>
              {' '}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="inline p-0 h-auto align-baseline text-sm font-medium"
                onClick={() => setTldrExpanded((v) => !v)}
              >
                {tldrExpanded ? 'Show less' : 'Show more'}
              </Button>
            </>
          ) : null}
        </p>
      ) : null}
      <AiPeerReviewInlineHighlights keyInsight={keyInsight} />
    </div>
  );
}

export function AiPeerReviewCard({ aiPeerReview }: AiPeerReviewCardProps) {
  if (!aiPeerReview || aiPeerReview.status !== 'completed') return null;
  if (!aiPeerReview.keyInsight) return null;

  const { overallRating } = aiPeerReview;
  const { keyInsight } = aiPeerReview;

  return (
    <Card className="border-indigo-100 border-l-4 border-l-primary-500 rounded-l-none">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900">Key Insights</h3>
          <AiPeerReviewVerdictBadge rating={overallRating} />
        </div>

        <div className="space-y-5">
          <AutomatedReviewSection keyInsight={keyInsight} />
        </div>
      </div>
    </Card>
  );
}
