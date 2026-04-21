import { Gem } from 'lucide-react';
import type { OverallRating } from '@/types/aiPeerReview';
import { Tooltip } from '@/components/ui/Tooltip';

interface AiPeerReviewVerdictBadgeProps {
  rating: OverallRating | null;
}

export function AiPeerReviewVerdictBadge({ rating }: AiPeerReviewVerdictBadgeProps) {
  if (!rating) return null;
  return (
    <Tooltip
      content="Automated quality check: high — proposal is sufficient to test the hypothesis."
      width="w-64"
      position="top"
    >
      <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
        <Gem size={11} />
        Excellent
      </span>
    </Tooltip>
  );
}
