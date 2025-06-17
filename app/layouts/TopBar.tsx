'use client';

import { useState } from 'react';
import { Menu, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Search } from '@/components/Search/Search';
import UserMenu from '@/components/menus/UserMenu';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const handleViewProfile = () => {
    if (user?.authorProfile?.profileUrl) {
      router.push(user.authorProfile.profileUrl);
    } else {
      console.warn('No author profile URL found for user:', user);
    }
  };

  return (
    <>
      <div className="h-[64px] border-b border-gray-200">
        <div className="h-full flex items-center justify-between px-4 lg:!px-8">
          <div className="flex items-center">
            <div className="block tablet:!hidden">
              <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100">
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center px-4">
            <div className="w-full max-w-xl">
              <Search
                placeholder="Search papers, topics..."
                className="[&_input]:rounded-full [&_input]:bg-[#F8F9FC]"
              />
            </div>
          </div>

          <div className="tablet:!hidden">
            {user && !isLoading ? (
              <UserMenu user={user} onViewProfile={handleViewProfile} avatarSize={40} />
            ) : (
              <Button
                variant="ghost"
                className="w-8 h-8 rounded-full bg-gray-200 p-0"
                onClick={() => executeAuthenticatedAction(() => router.push('/'))}
              >
                <User size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
