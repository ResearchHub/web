'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { ProposalReview } from '@/types/aiPeerReview';
import { CATEGORY_KEYS } from '@/types/aiPeerReview';
import { cn } from '@/utils/styles';
import { AiPeerReviewVerdictBadge } from './AiPeerReviewVerdictBadge';
import { AiPeerReviewProsConsList } from './AiPeerReviewProsConsList';
import { AiPeerReviewCategorySection } from './AiPeerReviewCategorySection';
import { CATEGORY_LABELS } from './labels';

interface AiPeerReviewCardProps {
  aiPeerReview: ProposalReview | null | undefined;
}

export function AiPeerReviewCard({ aiPeerReview }: AiPeerReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  if (!aiPeerReview || aiPeerReview.status !== 'completed' || !aiPeerReview.resultData) return null;

  const { overallSummary, overallRating, majorStrengths, majorWeaknesses, categories } =
    aiPeerReview.resultData;

  const presentCategories = CATEGORY_KEYS.filter((k) => categories[k]);
  const hasMoreProsCons = majorStrengths.length > 3 || majorWeaknesses.length > 3;
  const canExpand = hasMoreProsCons || presentCategories.length > 0;

  return (
    <Card className="border-indigo-100">
      <div className="space-y-5">
        <h3 className="text-base font-semibold text-gray-900">AI Peer Review</h3>

        <AiPeerReviewVerdictBadge rating={overallRating} />

        {overallSummary && (
          <div>
            <p
              className={cn(
                'text-sm leading-relaxed text-gray-700',
                !summaryExpanded && 'line-clamp-4'
              )}
            >
              {overallSummary}
            </p>
            <button
              type="button"
              onClick={() => setSummaryExpanded((v) => !v)}
              className="mt-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {summaryExpanded ? 'Show less' : 'Read more'}
            </button>
          </div>
        )}

        <AiPeerReviewProsConsList
          strengths={majorStrengths}
          weaknesses={majorWeaknesses}
          expanded={expanded}
        />

        {expanded && presentCategories.length > 0 && (
          <div>
            <h4 className="mb-2.5 text-sm font-semibold text-gray-900">Categories</h4>
            <div className="space-y-2">
              {presentCategories.map((key) => (
                <AiPeerReviewCategorySection
                  key={key}
                  label={CATEGORY_LABELS[key]}
                  block={categories[key]!}
                />
              ))}
            </div>
          </div>
        )}

        {canExpand && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {expanded ? 'Show less' : 'Read full review'}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
