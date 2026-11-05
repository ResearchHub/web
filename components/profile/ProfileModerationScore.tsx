'use client';

import { Shield } from 'lucide-react';
import { useUserDetailsForModerator } from '@/hooks/useAuthor';
import { cn } from '@/utils/styles';
import { formatRiskScore } from '@/components/profile/riskScoreEvents.utils';

interface ProfileModerationScoreProps {
  readonly userId: string;
}

export function ProfileModerationScore({ userId }: ProfileModerationScoreProps) {
  const [{ userDetails, isLoading }] = useUserDetailsForModerator(userId);

  if (isLoading) {
    return (
      <div className="flex items-baseline gap-2 text-gray-600">
        <Shield className="h-5 w-5 self-start text-[#6B7280]" />
        <span className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (!userDetails) return null;

  const score = formatRiskScore(userDetails.riskScore, userDetails.isSuspended);

  return (
    <div className="flex items-baseline gap-2 text-gray-600">
      <Shield className="h-5 w-5 self-start text-[#6B7280]" />
      <span
        className={cn('whitespace-nowrap text-sm font-semibold tabular-nums', score.scoreClass)}
      >
        {score.hasScore ? `${score.display} (${score.label})` : score.display}
      </span>
    </div>
  );
}
