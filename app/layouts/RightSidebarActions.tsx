'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search as SearchIcon, Bell } from 'lucide-react'; // Removed User, DollarSign as they are not directly used here
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/contexts/NotificationContext';
import UserMenu from '@/components/menus/UserMenu';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Tooltip } from '@/components/ui/Tooltip';

interface RightSidebarActionsProps {
  onOpenSearchModal: () => void; // New prop
}

// Helper component for a vertical separator
// const Separator = () => <div className="h-6 w-px bg-gray-300 self-center"></div>;

export const RightSidebarActions: React.FC<RightSidebarActionsProps> = ({ onOpenSearchModal }) => {
  const { user } = useUser();
  const { unreadCount } = useNotifications();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Placeholder for authenticated action, adapt from LeftSidebar or use directly if simple
  const handleAuthenticatedAction = (callback: () => void) => {
    if (user) {
      callback();
    } else {
      // Trigger login/signup modal or redirect
      console.log('User not authenticated, redirect to login');
      // Example: router.push('/login');
    }
  };

  const triggerSearchModalOpen = () => {
    handleAuthenticatedAction(() => {
      onOpenSearchModal(); // Call the prop
    });
  };

  if (!user) {
    // Optionally, render a login prompt or simplified view if user is not logged in
    // For now, we'll assume these actions are primarily for logged-in users
    // or that the individual components (like UserMenu) handle their logged-out states.
  }

  return (
    <div className="flex items-center justify-end space-x-2.5 p-2 bg-white sticky top-0 z-10">
      {/* Search Icon - Leftmost */}
      <Tooltip content="Search" position="bottom">
        <button
          onClick={triggerSearchModalOpen}
          className="flex items-center justify-center h-10 w-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <SearchIcon size={20} className="text-gray-600" />
        </button>
      </Tooltip>

      {/* Separator removed */}

      {/* RSC Icon - now a direct child if user exists */}
      {user && (
        <Tooltip content="Your ResearchCoin Wallet" position="bottom">
          <Link href="/researchcoin" className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <ResearchCoinIcon outlined color="#676767" size={22} />
            </div>
          </Link>
        </Tooltip>
      )}

      {/* Notifications Icon - now a direct child if user exists */}
      {user && (
        <Tooltip content="Notifications" position="bottom">
          <Link href="/notifications" className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors relative">
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <div className="absolute top-0 right-0 flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-red-600 text-white border-2 border-white transform translate-x-1/4 -translate-y-1/4">
                  <span className="font-semibold text-[10px]">{unreadCount}</span>
                </div>
              )}
            </div>
          </Link>
        </Tooltip>
      )}

      {/* Grouping div removed */}
      {/* Separator removed */}

      {/* User Avatar / Menu - Rightmost */}
      {user && (
        <div className="flex items-center h-10 w-10">
          {' '}
          {/* Ensure container matches size if UserMenu doesn't fill */}
          <UserMenu
            user={user}
            onViewProfile={() => console.log('View profile clicked')} // Replace with actual navigation
            isMenuOpen={isUserMenuOpen}
            onMenuOpenChange={setIsUserMenuOpen}
            showAvatarOnly={true} // UserMenu should render a ~40px circular avatar
            // avatarSize={40} // If UserMenu accepts an avatarSize prop
          />
        </div>
      )}
    </div>
  );
};
