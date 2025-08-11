'use client';

import { FC } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/utils/styles';
import { Flag, BookCheck, UserRoundPen, Users } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';

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
    name: 'Referral',
    href: '/moderators/referral',
    icon: Users,
    description: 'Manage referral program',
  },
  {
    name: 'Editors',
    href: '/moderators/editors',
    icon: UserRoundPen,
    description: 'Manage editors',
  },
];

export const ModerationSidebar: FC = () => {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col">
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

export const ModerationMenu: FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Get the current active item
  const activeItem = navigationItems.find((item) => pathname === item.href);

  return (
    <div className="w-full p-4">
      <p className="text-xs text-gray-500 mb-2">Choose moderation area</p>

      <BaseMenu
        trigger={
          <Button
            variant="outlined"
            className="flex items-center space-x-2 w-full justify-between px-4 py-2"
          >
            <div className="flex items-center space-x-2">
              {activeItem && (
                <>
                  <activeItem.icon className="h-4 w-4" />
                  <span className="font-medium">{activeItem.name}</span>
                </>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        }
        align="center"
        className="w-full"
        withOverlay={true}
        sameWidth={true}
      >
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <BaseMenuItem
                key={item.name}
                disabled
                className="flex items-center space-x-2 opacity-50 cursor-not-allowed"
              >
                <Icon className="h-4 w-4 text-gray-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500">{item.name}</span>
                  <span className="text-xs text-gray-400">{item.description}</span>
                </div>
              </BaseMenuItem>
            );
          }

          return (
            <BaseMenuItem
              key={item.name}
              className={cn(
                'flex items-center space-x-2',
                isActive && 'bg-primary-50 text-primary-700'
              )}
              onSelect={() => {
                router.push(item.href);
              }}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-primary-600' : 'text-gray-500')} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-xs text-gray-500">{item.description}</span>
              </div>
            </BaseMenuItem>
          );
        })}
      </BaseMenu>
    </div>
  );
};
