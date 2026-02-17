'use client';

import { FC } from 'react';
import { Flag, BookCheck, UserRoundPen, Users } from 'lucide-react';
import { SidebarNav, SidebarNavMenu, type SidebarNavItem } from '@/components/SidebarNav';

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
    name: 'Editors',
    href: '/moderators/editors',
    icon: UserRoundPen,
    description: 'Review editors activity',
  },
];

export const ModerationSidebar: FC = () => <SidebarNav items={navigationItems} />;

export const ModerationMenu: FC = () => (
  <SidebarNavMenu
    items={navigationItems}
    menuTitle="Choose moderation area"
    triggerFallbackLabel="Moderation"
  />
);
