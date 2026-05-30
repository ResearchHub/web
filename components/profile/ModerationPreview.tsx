'use client';

import { useUserDetailsForModerator } from '@/hooks/useAuthor';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { CopyButton } from '@/components/ui/CopyButton';

interface ModerationPreviewProps {
  userId: string;
}

function getScoreLabel(score: number, isSuspended: boolean): string {
  if (isSuspended) return 'Suspended';
  if (score <= 50) return 'Trusted';
  if (score >= 150) return 'High Risk';
  return 'Moderate';
}

function Row({
  label,
  value,
  copyValue,
}: Readonly<{ label: string; value: string; copyValue?: string }>) {
  return (
    <li className="text-sm text-gray-700 flex items-center gap-1 min-w-0">
      <span className="font-medium shrink-0">{label}:</span>
      <span className="truncate min-w-0">{value}</span>
      {copyValue && <CopyButton value={copyValue} size={11} />}
    </li>
  );
}

export function ModerationPreview({ userId }: ModerationPreviewProps) {
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

  return (
    <section>
      <SidebarHeader title="Moderation" />
      <ul className="flex flex-col gap-1.5">
        <Row
          label="Persona ID"
          value={personaId}
          copyValue={personaId === 'N/A' ? undefined : personaId}
        />
        <Row
          label="User ID"
          value={userIdDisplay}
          copyValue={userIdDisplay === 'N/A' ? undefined : userIdDisplay}
        />
        <Row label="Verified name" value={verifiedName} />
        <Row label="Email" value={userDetails.email || 'N/A'} />
        <Row
          label="Score"
          value={
            userDetails.riskScore === -1
              ? 'N/A'
              : `${userDetails.riskScore} (${getScoreLabel(userDetails.riskScore, userDetails.isSuspended)})`
          }
        />
      </ul>
    </section>
  );
}
