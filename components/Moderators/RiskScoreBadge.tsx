import { cn } from '@/utils/styles';
import { formatRiskScore } from '@/components/profile/riskScoreEvents.utils';

export function RiskScoreBadge({ score }: Readonly<{ score?: number | null }>) {
  if (score == null) return null;
  // The feed payload carries no suspension flag, so tiers are derived from the score alone.
  const { display, label, scoreClass, hasScore } = formatRiskScore(score, false);
  return (
    <span className="flex items-center">
      <span className="mx-2 text-gray-500">•</span>
      <span className={cn('text-sm font-semibold tabular-nums', scoreClass)}>
        {hasScore ? `${display} (${label})` : display}
      </span>
    </span>
  );
}
