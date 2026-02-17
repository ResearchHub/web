'use client';

import { FC } from 'react';
import { BookOpen, Search, FileText, Send } from 'lucide-react';
import { SidebarNav, SidebarNavMenu, type SidebarNavItem } from '@/components/SidebarNav';

const navigationItems: SidebarNavItem[] = [
  {
    name: 'Library',
    href: '/expert-finder/library',
    icon: BookOpen,
    description: 'Search history',
  },
  {
    name: 'Find Expert',
    href: '/expert-finder/find',
    icon: Search,
    description: 'Find domain experts',
  },
  {
    name: 'Templates',
    href: '/expert-finder/templates',
    icon: FileText,
    description: 'Coming soon',
    disabled: true,
  },
  {
    name: 'Outreach',
    href: '/expert-finder/outreach',
    icon: Send,
    description: 'Coming soon',
    disabled: true,
  },
];

export const ExpertFinderSidebar: FC = () => <SidebarNav items={navigationItems} />;

export const ExpertFinderMenu: FC = () => (
  <SidebarNavMenu
    items={navigationItems}
    menuTitle="Expert Finder"
    triggerFallbackLabel="Expert Finder"
  />
);
