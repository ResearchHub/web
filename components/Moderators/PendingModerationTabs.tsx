'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/utils/styles';
import { usePendingCounts } from '@/components/Moderators/PendingCountsContext';
import {
  PENDING_MODULES,
  PENDING_MODULE_CONFIG,
  moduleToSlug,
  type PendingModule,
} from '@/services/content-moderation.service';

interface PendingModerationTabsProps {
  activeModule: PendingModule;
}

function TabLabel({
  label,
  count,
  isActive,
}: Readonly<{ label: string; count?: number; isActive: boolean }>) {
  return (
    <span className="flex items-center">
      <span>{label}</span>
      {count != null && (
        <span
          className={cn(
            'ml-2 py-0.5 px-2 rounded-full text-xs',
            isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
          )}
        >
          {count}
        </span>
      )}
    </span>
  );
}

export const PendingModerationTabs: FC<PendingModerationTabsProps> = ({ activeModule }) => {
  const { counts } = usePendingCounts();

  const tabs = PENDING_MODULES.map((module) => ({
    id: module,
    href: `/moderators/pending-works/${moduleToSlug(module)}`,
    label: (
      <TabLabel
        label={PENDING_MODULE_CONFIG[module].tabLabel}
        count={counts?.[module]}
        isActive={module === activeModule}
      />
    ),
  }));

  return <Tabs tabs={tabs} activeTab={activeModule} onTabChange={() => {}} variant="primary" />;
};
