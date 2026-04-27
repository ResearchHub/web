'use client';

import { useState } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/styles';
import { AvatarStack } from '@/components/ui/AvatarStack';
import type { ProposalReview } from '@/types/aiPeerReview';
import { CATEGORY_KEYS } from '@/types/aiPeerReview';
import type { PeerReview } from '@/types/work';
import { AiPeerReviewVerdictBadge } from './AiPeerReviewVerdictBadge';
import { AiPeerReviewInlineHighlights } from './AiPeerReviewInlineHighlights';
import { AiPeerReviewCategorySection } from './AiPeerReviewCategorySection';
import { CATEGORY_LABELS } from './labels';

interface AiPeerReviewCardProps {
  aiPeerReview: ProposalReview | null | undefined;
  peerReviews?: PeerReview[];
  averageReviewScore?: number;
}

const HIDDEN_CATEGORIES = new Set<string>([
  'clinical_or_translational_impact',
  'societal_and_broader_impact',
]);

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-700">
    {children}
  </h4>
);

function PeerReviewersSection({
  peerReviews,
  averageScore,
}: {
  peerReviews?: PeerReview[];
  averageScore?: number;
}) {
  const hasReviews = !!peerReviews && peerReviews.length > 0;

  if (!hasReviews) {
    return (
      <div>
        <SectionHeader>From Peer Reviewers</SectionHeader>
        <p className="text-sm italic text-gray-400">No peer reviews yet.</p>
      </div>
    );
  }

  const items = peerReviews!.map((r) => ({
    src: r.createdBy.authorProfile.profileImage || '',
    alt: r.createdBy.authorProfile.fullName,
    tooltip:
      r.score > 0
        ? `${r.createdBy.authorProfile.fullName} · ${r.score.toFixed(1)}/5`
        : r.createdBy.authorProfile.fullName,
    authorId: r.createdBy.authorProfile.id || undefined,
  }));

  const computedAvg =
    averageScore ??
    peerReviews!.reduce((s, r) => s + (r.score || 0), 0) / Math.max(1, peerReviews!.length);

  const count = peerReviews!.length;

  return (
    <div>
      <SectionHeader>From Peer Reviewers</SectionHeader>
      <div className="flex items-center gap-2">
        <AvatarStack items={items} size="xs" maxItems={6} spacing={-6} showLabel={false} />
        <span className="text-sm font-medium text-gray-900">
          {count} {count === 1 ? 'reviewer' : 'reviewers'}
        </span>
        {computedAvg > 0 && (
          <>
            <span className="text-gray-400" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {computedAvg.toFixed(1)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function AutomatedReviewSection({
  strengths,
  weaknesses,
}: {
  strengths: string[];
  weaknesses: string[];
}) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-700">
        Automated Review
      </h4>
      <p className="mb-1.5 text-xs italic text-gray-600">AI generated based on proposal text.</p>
      <AiPeerReviewInlineHighlights strengths={strengths} weaknesses={weaknesses} />
    </div>
  );
}

export function AiPeerReviewCard({
  aiPeerReview,
  peerReviews,
  averageReviewScore,
}: AiPeerReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!aiPeerReview || aiPeerReview.status !== 'completed' || !aiPeerReview.resultData) return null;

  const { overallRating, majorStrengths, majorWeaknesses, categories } = aiPeerReview.resultData;

  const presentCategories = CATEGORY_KEYS.filter(
    (k) => !HIDDEN_CATEGORIES.has(k) && categories[k]?.rationale
  );
  const canExpand = presentCategories.length > 0;

  return (
    <Card className="border-indigo-100 border-l-4 border-l-primary-500 rounded-l-none">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900">Review Insights</h3>
          <AiPeerReviewVerdictBadge rating={overallRating} />
        </div>

        <div className="space-y-5">
          <PeerReviewersSection peerReviews={peerReviews} averageScore={averageReviewScore} />
          <AutomatedReviewSection strengths={majorStrengths} weaknesses={majorWeaknesses} />
        </div>

        {expanded && presentCategories.length > 0 && (
          <div className="space-y-3 pt-1">
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
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {expanded ? 'Show less' : 'See full analysis'}
              <ChevronDown
                size={14}
                className={cn('transition-transform', expanded && 'rotate-180')}
              />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
