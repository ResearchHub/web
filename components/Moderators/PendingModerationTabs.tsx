'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import {
  PENDING_MODULES,
  PENDING_MODULE_CONFIG,
  type PendingModule,
} from '@/services/pending-moderation.service';

const TABS = PENDING_MODULES.map((module) => ({
  id: module,
  label: PENDING_MODULE_CONFIG[module].tabLabel,
}));

interface PendingModerationTabsProps {
  activeModule: PendingModule;
  onModuleChange: (module: PendingModule) => void;
}

export const PendingModerationTabs: FC<PendingModerationTabsProps> = ({
  activeModule,
  onModuleChange,
}) => (
  <Tabs
    tabs={TABS}
    activeTab={activeModule}
    onTabChange={(tabId) => onModuleChange(tabId as PendingModule)}
    variant="primary"
  />
);
