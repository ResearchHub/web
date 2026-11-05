'use client';

import { FC } from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { SidebarNav, SidebarNavMenu, type SidebarNavItem } from '@/components/SidebarNav';

const navigationItems: SidebarNavItem[] = [
  {
    name: 'Library',
    href: '/expert-finder/library',
    icon: BookOpen,
    description: '',
  },
  {
    name: 'Templates',
    href: '/expert-finder/templates',
    icon: FileText,
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
