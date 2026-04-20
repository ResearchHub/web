'use client';

import { PillTabs } from '@/components/ui/PillTabs';

export const ACTIVITY_PILLS = [
  { id: 'publications', label: 'Publications' },
  { id: 'peer-reviews', label: 'Peer Reviews' },
  { id: 'comments', label: 'Comments' },
  { id: 'bounties', label: 'Bounties' },
];

export type ActivityPillId = (typeof ACTIVITY_PILLS)[number]['id'];

export function isActivityPill(id: string): id is ActivityPillId {
  return ACTIVITY_PILLS.some((pill) => pill.id === id);
}

interface ProfileActivityTabProps {
  activePill: ActivityPillId;
  onPillChange: (pillId: ActivityPillId) => void;
  children: React.ReactNode;
}

/**
 * Activity tab — thin wrapper rendering the pill bar + whatever feed the
 * parent decided to render for the active pill.
 */
export function ProfileActivityTab({
  activePill,
  onPillChange,
  children,
}: ProfileActivityTabProps) {
  return (
    <div>
      <div className="mb-4">
        <PillTabs
          tabs={ACTIVITY_PILLS}
          activeTab={activePill}
          onTabChange={(id) => onPillChange(id as ActivityPillId)}
          size="sm"
        />
      </div>
      {children}
    </div>
  );
}
