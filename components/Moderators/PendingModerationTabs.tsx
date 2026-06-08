'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import {
  PENDING_MODULES,
  PENDING_MODULE_CONFIG,
  moduleToSlug,
  type PendingModule,
} from '@/services/pending-moderation.service';

const TABS = PENDING_MODULES.map((module) => ({
  id: module,
  label: PENDING_MODULE_CONFIG[module].tabLabel,
  href: `/moderators/pending-works/${moduleToSlug(module)}`,
}));

interface PendingModerationTabsProps {
  activeModule: PendingModule;
}

export const PendingModerationTabs: FC<PendingModerationTabsProps> = ({ activeModule }) => (
  <Tabs tabs={TABS} activeTab={activeModule} onTabChange={() => {}} variant="primary" />
);
