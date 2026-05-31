'use client';

import { useSearchParams } from 'next/navigation';
import { useUserDetailsForModerator } from '@/hooks/useAuthor';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { DetailValue } from '@/components/ui/CopyableText';
import { cn } from '@/utils/styles';
import { formatRiskScore } from '@/components/profile/riskScoreEvents.utils';

interface ModerationPreviewProps {
  userId: string;
}

function Row({
  label,
  value,
  copyable,
}: Readonly<{ label: string; value: string; copyable?: boolean }>) {
  return (
    <li className="text-sm text-gray-700 flex items-center gap-1 min-w-0">
      <span className="font-medium shrink-0">{label}:</span>
      <DetailValue value={value} copyable={copyable} size={11} />
    </li>
  );
}

export function ModerationPreview({ userId }: ModerationPreviewProps) {
  const searchParams = useSearchParams();
  const showRiskScore = searchParams.get('riskscore') === 'true';
  const [{ userDetails, isLoading }] = useUserDetailsForModerator(userId);

  if (isLoading) {
    return (
      <section>
        <SidebarHeader title="Moderation" />
        <ul className="flex flex-col gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="text-sm">
              <span className="inline-block bg-gray-200 rounded h-4 w-48 animate-pulse" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (!userDetails) return null;

  const verification = userDetails.verification;
  const personaId = verification?.externalId || 'N/A';
  const userIdDisplay = String(userDetails.id ?? 'N/A');
  const verifiedName = verification ? `${verification.firstName} ${verification.lastName}` : 'N/A';

  const score = formatRiskScore(userDetails.riskScore, userDetails.isSuspended);

  return (
    <section>
      <SidebarHeader title="Moderation" />
      <ul className="flex flex-col gap-1.5">
        {showRiskScore && (
          <li className="text-sm text-gray-700 flex items-center gap-1">
            <span className="font-medium shrink-0">Score:</span>
            <span className={cn('font-semibold tabular-nums', score.scoreClass)}>
              {score.hasScore ? `${score.display} (${score.label})` : score.display}
            </span>
          </li>
        )}
        <Row label="Persona ID" value={personaId} copyable={!!verification?.externalId} />
        <Row label="User ID" value={userIdDisplay} copyable={userDetails.id != null} />
        <Row label="Verified name" value={verifiedName} />
        <Row label="Email" value={userDetails.email || 'N/A'} />
      </ul>
    </section>
  );
}
