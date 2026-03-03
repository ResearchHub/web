import { Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icons';
import { Button } from '@/components/ui/Button';
import UserMenu from '@/components/menus/UserMenu';
import type { User } from '@/types/user';
import { TopBarSearchButton } from './TopBarSearchButton';

interface TopBarUserControlsProps {
  user: User | null;
  isLoading: boolean;
  unreadCount: number;
  avatarSize: number;
  profilePercent: number;
  onViewProfile: () => void;
  onAuth: () => void;
  onSearchOpen: () => void;
  currentSearchQuery: string | null;
  shortcutText: string;
  variant: 'mobile' | 'desktop';
}

const AvatarSkeleton = () => (
  <div className="flex items-center">
    <div className="bg-gray-300 rounded-full animate-pulse w-10 h-10" />
  </div>
);

export const TopBarUserControls = ({
  user,
  isLoading,
  unreadCount,
  avatarSize,
  profilePercent,
  onViewProfile,
  onAuth,
  onSearchOpen,
  currentSearchQuery,
  shortcutText,
  variant,
}: TopBarUserControlsProps) => {
  const isMobile = variant === 'mobile';

  if (isMobile) {
    return (
      <div className="flex tablet:!hidden items-center space-x-1 h-full">
        <button onClick={onSearchOpen} className="rounded-lg hover:bg-gray-100 p-2">
          <SearchIcon className="text-gray-600 h-6 w-6" />
        </button>

        {isLoading ? (
          <AvatarSkeleton />
        ) : user ? (
          <UserMenu
            user={user}
            onViewProfile={onViewProfile}
            avatarSize={avatarSize}
            percent={profilePercent}
          />
        ) : (
          <Button
            variant="default"
            size="md"
            onClick={onAuth}
            className="bg-rhBlue-500 hover:bg-rhBlue-600 text-white whitespace-nowrap"
          >
            Sign up
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="hidden tablet:!flex items-center space-x-2 h-full">
      <TopBarSearchButton
        onClick={onSearchOpen}
        currentSearchQuery={currentSearchQuery}
        shortcutText={shortcutText}
      />

      {user && (
        <>
          <Link href="/researchcoin" className="flex items-center">
            <div className="flex items-center justify-center hover:bg-gray-100 rounded-md p-2">
              <Icon name="rscThin" size={28} className="text-gray-500" />
            </div>
          </Link>

          <Link href="/notifications" className="flex items-center">
            <div className="flex items-center justify-center hover:bg-gray-100 rounded-md p-2 relative">
              <Icon name="notification" size={28} className="text-gray-500" />
              {unreadCount > 0 && (
                <div className="absolute rounded-full bg-primary-600 text-white flex items-center justify-center top-1 -right-0 h-4 w-4">
                  <span className="font-medium text-[9px]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </>
      )}

      {isLoading ? (
        <AvatarSkeleton />
      ) : user ? (
        <UserMenu
          user={user}
          onViewProfile={onViewProfile}
          avatarSize={avatarSize}
          percent={profilePercent}
        />
      ) : (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="md"
            onClick={onAuth}
            className="text-gray-700 hover:text-gray-900 whitespace-nowrap"
          >
            Log in
          </Button>
          <Button
            variant="default"
            size="md"
            onClick={onAuth}
            className="bg-rhBlue-500 hover:bg-rhBlue-600 text-white whitespace-nowrap"
          >
            Sign up
          </Button>
        </div>
      )}
    </div>
  );
};
