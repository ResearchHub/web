'use client';

import { useUserDetailsForModerator } from '@/hooks/useAuthor';
import { SidebarHeader } from '@/components/ui/SidebarHeader';

interface ModerationPreviewProps {
  userId: string;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <li className="text-sm text-gray-700">
      <span className="font-medium">{label}:</span> <span className="break-words">{value}</span>
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
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="text-sm">
              <span className="inline-block bg-gray-200 rounded h-4 w-48 animate-pulse" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (!userDetails) return null;

  const emailWithId = (
    <>
      {userDetails.email || 'N/A'}{' '}
      <span className="text-gray-500">(id: {userDetails.id ?? 'N/A'})</span>
    </>
  );

  const verification = userDetails.verification;
  const verifiedValue = verification ? (
    <>
      {`${verification.firstName} ${verification.lastName}`}{' '}
      <span className="text-gray-500">({verification.status || 'N/A'})</span>
    </>
  ) : (
    'NO'
  );

  let statusLabel = 'Active';
  let statusClass = 'text-green-600';
  if (userDetails.isSuspended) {
    statusLabel = 'Suspended';
    statusClass = 'text-red-600';
  } else if (userDetails.isProbableSpammer) {
    statusLabel = 'Probable Spammer';
    statusClass = 'text-amber-600';
  }

  return (
    <section>
      <SidebarHeader title="Moderation" />
      <ul className="flex flex-col gap-1.5">
        <Row label="Email" value={emailWithId} />
        <Row
          label="Status"
          value={<span className={`font-medium ${statusClass}`}>{statusLabel}</span>}
        />
        <Row label="Verified" value={verifiedValue} />
        <Row label="ORCID connected?" value={userDetails.isOrcidConnected ? 'Yes' : 'No'} />
      </ul>
    </section>
  );
}
