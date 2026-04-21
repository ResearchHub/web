'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { ProposalReview } from '@/types/aiPeerReview';
import { CATEGORY_KEYS } from '@/types/aiPeerReview';
import { AiPeerReviewVerdictBadge } from './AiPeerReviewVerdictBadge';
import { AiPeerReviewProsConsList } from './AiPeerReviewProsConsList';
import { AiPeerReviewCategorySection } from './AiPeerReviewCategorySection';
import { CATEGORY_LABELS } from './labels';

interface AiPeerReviewCardProps {
  aiPeerReview: ProposalReview | null | undefined;
}

export function AiPeerReviewCard({ aiPeerReview }: AiPeerReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!aiPeerReview || aiPeerReview.status !== 'completed' || !aiPeerReview.resultData) return null;

  const { overallRating, majorStrengths, majorWeaknesses, categories } = aiPeerReview.resultData;

  const HIDDEN_CATEGORIES = new Set<string>([
    'clinical_or_translational_impact',
    'societal_and_broader_impact',
  ]);
  const presentCategories = CATEGORY_KEYS.filter(
    (k) => !HIDDEN_CATEGORIES.has(k) && categories[k]?.rationale
  );
  const canExpand = presentCategories.length > 0;

  return (
    <Card className="border-indigo-100">
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">Automated Review</h3>
          <AiPeerReviewVerdictBadge rating={overallRating} />
        </div>

        <AiPeerReviewProsConsList strengths={majorStrengths} weaknesses={majorWeaknesses} />

        {expanded && presentCategories.length > 0 && (
          <div className="space-y-4">
            {presentCategories.map((key) => (
              <AiPeerReviewCategorySection
                key={key}
                label={CATEGORY_LABELS[key]}
                block={categories[key]!}
              />
            ))}
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
