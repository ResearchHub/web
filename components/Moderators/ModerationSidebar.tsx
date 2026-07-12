'use client';

import { FC } from 'react';
import { Flag, UserRoundPen, Users, DollarSign, FileCheck } from 'lucide-react';
import { SidebarNav, SidebarNavMenu, type SidebarNavItem } from '@/components/SidebarNav';
import { usePendingCounts } from '@/components/Moderators/PendingCountsContext';

const PENDING_MODERATION_HREF = '/moderators/pending-works';

const navigationItems: SidebarNavItem[] = [
  {
    name: 'Audit',
    href: '/moderators/audit',
    icon: Flag,
    description: 'Review flagged content',
  },
  {
    name: 'Referral',
    href: '/moderators/referral',
    icon: Users,
    description: 'Manage referral program',
  },
  {
    name: 'Pending',
    href: PENDING_MODERATION_HREF,
    icon: FileCheck,
    description: 'Review pending submissions',
  },
  {
    name: 'Editors',
    href: '/moderators/editors',
    icon: UserRoundPen,
    description: 'Review editors activity',
  },
  {
    name: 'Auto-Payments',
    href: '/moderators/auto-payments',
    icon: DollarSign,
    description: 'Audit automated payments',
  },
];

const getNavigationItems = (pendingCount: number) =>
  navigationItems.map((item) =>
    item.href === PENDING_MODERATION_HREF ? { ...item, badgeCount: pendingCount } : item
  );

export const ModerationSidebar: FC = () => {
  const { totalCount } = usePendingCounts();

  return <SidebarNav items={getNavigationItems(totalCount)} />;
};

export const ModerationMenu: FC = () => {
  const { totalCount } = usePendingCounts();

  return (
    <SidebarNavMenu
      items={getNavigationItems(totalCount)}
      menuTitle="Choose moderation area"
      triggerFallbackLabel="Moderation"
    />
  );
};
