'use client';

import { FC } from 'react';
import { BookOpen, Mail, Settings } from 'lucide-react';
import { SidebarNav, SidebarNavMenu, type SidebarNavItem } from '@/components/SidebarNav';

const navigationItems: SidebarNavItem[] = [
  {
    name: 'Library',
    href: '/expert-finder/library',
    icon: BookOpen,
    description: '',
  },
  {
    name: 'Emails',
    href: '/expert-finder/emails',
    icon: Mail,
    description: '',
  },
  {
    name: 'Settings',
    href: '/expert-finder/settings',
    icon: Settings,
    description: '',
  },
];

export const ExpertFinderSidebar: FC = () => <SidebarNav items={navigationItems} />;

export const ExpertFinderMenu: FC = () => (
  <SidebarNavMenu
    items={navigationItems}
    menuTitle="Expert Finder"
    triggerFallbackLabel="Library"
  />
);
