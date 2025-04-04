'use client';

import { useState } from 'react';
import { Menu, BadgeCheck, LogIn, MoveLeft } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import AuthModal from '@/components/modals/Auth/AuthModal';
import UserMenu from '@/components/menus/UserMenu';
import type { User } from '@/types/user';
import { useNotifications } from '@/contexts/NotificationContext';
import { useRouter, usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/Notification/NotificationBell';
import { Search } from '@/components/Search/Search';
import { SearchSuggestion } from '@/types/search';
import { Tooltip } from '@/components/ui/Tooltip';
import Link from 'next/link';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { useUser } from '@/contexts/UserContext';
import { Icon } from '@/components/ui/icons';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, isLoading, error } = useUser();
  const { showAuthModal } = useAuthModalContext();
  const router = useRouter();
  const pathname = usePathname();

  const isNotificationsPage = pathname === '/notifications';

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      showAuthModal();
    }
  };

  return (
    <>
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 h-[64px]">
        <div className="h-full relative flex items-center">
          {/* Centered Search */}
          <div className="flex-1 px-4 py-4 lg:px-8">
            <div className="mx-auto max-w-4xl">
              {/* Search Input 500px */}
              <div className="w-[600px] mx-auto">
                <Search
                  placeholder="Search any paper, journal, topic, ..."
                  className="[&_input]:rounded-full [&_input]:bg-[#F8F9FC] mt-2"
                />
              </div>
            </div>
          </div>

          <div className="lg:block w-80 bg-white">
            {/* Right-aligned buttons */}
            <div className="flex items-center justify-end h-full px-6 gap-6">
              {!isLoading ? (
                user ? (
                  <>
                    <Tooltip width={'140px'} content="View ResearchCoin balance and transactions">
                      <Link
                        href="/researchcoin"
                        className="relative flex items-center justify-center -mt-0.5"
                      >
                        <Icon name="rscGold" size={36} />
                        {/* <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-[10px] font-medium text-green-700">
                          +10
                        </span> */}
                      </Link>
                    </Tooltip>
                    {/* <NotificationBell filled={isNotificationsPage} /> */}
                    <NotificationBell filled={isNotificationsPage} />
                    <UserMenu user={user} onViewProfile={() => null} onVerifyAccount={() => null} />
                  </>
                ) : (
                  <button
                    onClick={handleAuthClick}
                    // This test ID is used in TransactionsSection.tsx to programmatically trigger
                    // the sign-in button click when users click "Sign In to Get Started"
                    data-testid="sign-in-button"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <LogIn className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Sign In</span>
                  </button>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
