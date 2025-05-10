'use client';

import { AlertCircle, Megaphone, ChevronDown, User, UserPlus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { FooterLinks } from '../../components/FooterLinks';
import { Navigation } from './Navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PublishMenu } from './PublishMenu';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { Icon } from '@/components/ui/icons';
import UserMenu from '@/components/menus/UserMenu';
import { NotificationBell } from '@/components/Notification/NotificationBell';
import { useNotifications } from '@/contexts/NotificationContext';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

// Component for user profile section in sidebar
const UserSidebarSection = ({ forceMinimize = false }: { forceMinimize?: boolean }) => {
  const { user, isLoading: userLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const isNotificationsPage = pathname === '/notifications';
  const { unreadCount, loading: notificationsLoading } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Only show skeleton during initial load, before we know if user exists
  const isInitialLoading = userLoading && user === null;

  if (isInitialLoading) {
    return (
      <div className="px-3 py-3 tablet:max-sidebar-compact:!px-2 tablet:max-sidebar-compact:!flex tablet:max-sidebar-compact:!justify-center">
        {/* Skeleton to match current layout */}
        <div className="flex items-center justify-between tablet:max-sidebar-compact:!justify-center">
          {/* Left side skeleton for user profile */}
          <div className="flex items-center p-1 pr-2 pl-2 rounded-lg">
            <div className="h-8 w-8 flex-shrink-0 mr-2 rounded-full bg-gray-200 animate-pulse tablet:max-sidebar-compact:!mr-0 tablet:max-sidebar-compact:!h-10 tablet:max-sidebar-compact:!w-10"></div>
            <div
              className={`h-4 w-20 bg-gray-200 rounded animate-pulse ${forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}`}
            ></div>
            <div
              className={`ml-2 h-3 w-3 bg-gray-200 rounded animate-pulse ${forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}`}
            ></div>
          </div>

          {/* Separator skeleton */}
          <div
            className={`mx-2 h-6 w-px bg-gray-200 ${forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}`}
          ></div>

          {/* Right side skeleton for icons */}
          <div
            className={`flex items-center space-x-1 ${forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}`}
          >
            <div className="h-9 w-9 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-9 w-9 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Logged out state
    return (
      <div className="px-3 py-3 tablet:max-sidebar-compact:!px-2 tablet:max-sidebar-compact:!flex tablet:max-sidebar-compact:!justify-center">
        {/* Enhanced login section */}
        <div className="flex flex-col gap-2 w-full">
          {/* Login button with icon */}
          <Button
            variant="default"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center justify-center gap-2 py-2.5 tablet:max-sidebar-compact:!w-10 tablet:max-sidebar-compact:!h-10 tablet:max-sidebar-compact:!p-0"
            onClick={() => executeAuthenticatedAction(() => router.push('/'))}
          >
            <User size={18} className="text-white" />
            <span className={forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}>
              Login
            </span>
          </Button>

          {/* Join button */}
          <Button
            variant="outlined"
            className={`w-full border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-medium flex items-center justify-center gap-2 py-2.5 ${forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}`}
            onClick={() => executeAuthenticatedAction(() => router.push('/'))}
          >
            <UserPlus size={18} className="text-indigo-700" />
            <span>Join ResearchHub</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 tablet:max-sidebar-compact:!px-2 tablet:max-sidebar-compact:!flex tablet:max-sidebar-compact:!justify-center">
      {/* Single row layout with all elements */}
      <div
        className={`flex items-center ${forceMinimize ? 'justify-center' : 'justify-between'} tablet:max-sidebar-compact:!justify-center`}
      >
        {/* Left side: Avatar, Name and Caret */}
        <div
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`flex items-center cursor-pointer transition-colors ${forceMinimize ? 'p-0' : 'p-1 pr-2 pl-2'} rounded-lg group flex-shrink min-w-0`}
        >
          <div
            className="flex-shrink-0 mr-2 tablet:max-sidebar-compact:!mr-0 tablet:max-sidebar-compact:!scale-125"
            onClick={(e) => e.stopPropagation()}
          >
            <UserMenu
              user={user}
              onViewProfile={() => null}
              isMenuOpen={isMenuOpen}
              onMenuOpenChange={setIsMenuOpen}
              showAvatarOnly={forceMinimize}
            />
          </div>

          <div
            className={`flex items-center min-w-0 ${forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}`}
          >
            <div className="text-[14px] font-medium text-gray-800 group-hover:text-gray-900 truncate">
              {user.authorProfile?.firstName || user.firstName}
            </div>
            <ChevronDown
              size={16}
              className="ml-2 text-gray-600 group-hover:text-gray-600 flex-shrink-0"
            />
          </div>
        </div>

        {/* Separator */}
        <div
          className={`mx-2 h-6 w-px bg-gray-200 flex-shrink-0 ${forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}`}
        ></div>

        {/* Right side: Wallet and Notification icons */}
        <div
          className={`flex items-center space-x-1 flex-shrink-0 ${forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}`}
        >
          {/* Wallet icon */}
          <Tooltip content="Your ResearchCoin Wallet" position="bottom">
            <Link href="/researchcoin" className="flex items-center">
              <div className="flex items-center justify-center p-2.5 hover:bg-gray-100 rounded-md transition-colors">
                <ResearchCoinIcon outlined color="#676767" size={24} />
              </div>
            </Link>
          </Tooltip>

          {/* Notification icon */}
          <Tooltip content="Notifications" position="bottom">
            <Link href="/notifications" className="flex items-center">
              <div className="flex items-center justify-center p-2.5 hover:bg-gray-100 rounded-md transition-colors relative">
                <Icon name="notification" size={22} className="text-gray-500" />
                {unreadCount > 0 && (
                  <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <span className="font-medium text-[10px]">{unreadCount}</span>
                  </div>
                )}
              </div>
            </Link>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

interface LeftSidebarProps {
  forceMinimize?: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ forceMinimize = false }) => {
  const pathname = usePathname();

  const handleUnimplementedFeature = (featureName: string) => {
    toast(
      (t) => (
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Implementation coming soon</span>
        </div>
      ),
      {
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#FFF7ED',
          color: '#EA580C',
          border: '1px solid #FDBA74',
        },
      }
    );
  };

  // Create minimized classes based on either responsive design or forced minimization
  const minimizeClass = forceMinimize ? 'minimized-sidebar' : '';

  return (
    <div className={`h-full flex flex-col z-50 bg-white overflow-hidden ${minimizeClass}`}>
      <div
        className={`p-4 pl-4 ${forceMinimize ? '!flex !justify-center' : 'tablet:max-sidebar-compact:!flex tablet:max-sidebar-compact:!justify-center'}`}
      >
        <Link href="/">
          <div className={forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}>
            <Logo size={44} color="text-indigo-600" />
          </div>
          <div className={forceMinimize ? '!block' : 'hidden tablet:max-sidebar-compact:!block'}>
            <Icon name="flaskFrame" size={38} color="#4f46e5" />
          </div>
        </Link>
      </div>

      <div
        className={`bg-gray-50 mt-2 ${forceMinimize ? '!bg-transparent !border-none' : 'tablet:max-sidebar-compact:!bg-transparent tablet:max-sidebar-compact:!border-none'}`}
      >
        <UserSidebarSection forceMinimize={forceMinimize} />
      </div>
      <div className={`px-4 mt-6 ${forceMinimize ? '!px-2' : 'tablet:max-sidebar-compact:!px-2'}`}>
        <PublishMenu forceMinimize={forceMinimize} />
      </div>

      <div className="flex-1 mt-2 overflow-y-auto">
        <div
          className={`px-4 py-4 ${forceMinimize ? '!px-2' : 'tablet:max-sidebar-compact:!px-2'}`}
        >
          <Navigation
            currentPath={pathname || ''}
            onUnimplementedFeature={handleUnimplementedFeature}
            forceMinimize={forceMinimize}
          />
        </div>
      </div>

      <div className={forceMinimize ? '!hidden' : 'tablet:max-sidebar-compact:!hidden'}>
        <FooterLinks />
      </div>
    </div>
  );
};
