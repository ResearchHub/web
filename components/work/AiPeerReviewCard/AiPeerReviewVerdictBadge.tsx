import { Gem } from 'lucide-react';
import type { OverallRating } from '@/types/aiPeerReview';
import { Tooltip } from '@/components/ui/Tooltip';

interface AiPeerReviewVerdictBadgeProps {
  rating: OverallRating | null;
}

export function AiPeerReviewVerdictBadge({ rating }: AiPeerReviewVerdictBadgeProps) {
  if (rating !== 'excellent') return null;
  return (
    <Tooltip
      content="Automated quality check rated this proposal in the top tier."
      width="w-64"
      position="top"
    >
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 text-xs font-medium leading-5 text-emerald-700">
        <Gem size={11} />
        Top rated
      </span>
    </Tooltip>
  );
}
