'use client';

import { FC } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { Shield, Flag, BookCheck, UserRoundPen } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  disabled?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Audit',
    href: '/moderators/audit',
    icon: Flag,
    description: 'Review flagged content',
  },
  {
    name: 'Author claims',
    href: '#',
    icon: BookCheck,
    description: 'Coming soon',
    disabled: true,
  },
  {
    name: 'Editors',
    href: '#',
    icon: UserRoundPen,
    description: 'Coming soon',
    disabled: true,
  },
];

export const ModerationSidebar: FC = () => {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Moderation</h1>
            <p className="text-sm text-gray-600">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-500">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.description}</div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
                    )}
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-600">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
