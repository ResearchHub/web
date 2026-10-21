'use client';

import {
  User as UserIcon,
  LogOut,
  BadgeCheck,
  Bell,
  UserPlus,
  Search,
  Settings,
  Bookmark,
} from 'lucide-react';
import { useState } from 'react';
import type { User } from '@/types/user';
import VerificationBanner from '@/components/banners/VerificationBanner';
import { Avatar } from '@/components/ui/Avatar';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import Link from 'next/link';
import { AuthSharingService } from '@/services/auth-sharing.service';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { useVerification } from '@/contexts/VerificationContext';
import { YouPanel } from '@/components/You/YouPanel';

interface UserMenuProps {
  user: User;
  onViewProfile: () => void;
  isMenuOpen?: boolean;
  onMenuOpenChange?: (isOpen: boolean) => void;
  avatarSize?: number | 'sm' | 'md' | 'xs' | 'xxs';
  showAvatarOnly?: boolean;
  /** `menu`: the dropdown, from the tablet breakpoint up. `panel`: a phone's full-screen You sidebar. */
  variant?: 'menu' | 'panel';
}

export default function UserMenu({
  user,
  onViewProfile,
  isMenuOpen,
  onMenuOpenChange,
  avatarSize = 30,
  showAvatarOnly = false,
  variant = 'menu',
}: UserMenuProps) {
  const [showVerificationBanner, setShowVerificationBanner] = useState(true);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const { openVerificationModal } = useVerification();
  // Use controlled or uncontrolled menu state
  const menuOpenState = isMenuOpen !== undefined ? isMenuOpen : internalMenuOpen;
  const setMenuOpenState = (open: boolean) => {
    if (onMenuOpenChange) {
      onMenuOpenChange(open);
    } else {
      setInternalMenuOpen(open);
    }
  };

  const handleCloseMenu = () => {
    setMenuOpenState(false);
  };

  // Apply different avatar size for avatar-only mode
  const effectiveAvatarSize =
    showAvatarOnly && typeof avatarSize === 'number' ? avatarSize * 1.25 : avatarSize;

  // Common avatar button with adjusted sizing for avatar-only mode
  const avatarButton = (
    <button
      className="hover:ring-2 hover:ring-gray-200 rounded-full p-1 relative"
      data-testid="user-menu-button"
      onClick={() => setMenuOpenState(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setMenuOpenState(true);
        }
      }}
    >
      <Avatar
        src={user.authorProfile?.profileImage}
        className="font-semibold"
        alt={user.authorProfile?.fullName ?? user.fullName}
        size={effectiveAvatarSize}
      />
    </button>
  );

  if (variant === 'panel') {
    return (
      <>
        {avatarButton}
        <YouPanel user={user} isOpen={menuOpenState} onClose={handleCloseMenu} />
      </>
    );
  }

  return (
    <BaseMenu
      trigger={avatarButton}
      align="start"
      sideOffset={0}
      className="w-64 p-0"
      open={menuOpenState}
      onOpenChange={setMenuOpenState}
    >
      {/* User info section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          <Avatar
            src={user.authorProfile?.profileImage}
            alt={user.authorProfile?.fullName ?? user.fullName}
            size="md"
          />
          <div className="ml-3 flex-1">
            <p className="text-base font-medium text-gray-900 flex items-center gap-1 leading-tight">
              {user.authorProfile?.fullName ?? user.fullName}
              {user.isVerified && <VerifiedBadge size="sm" />}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <BaseMenuItem
          onClick={() => navigateToAuthorProfile(user.authorProfile?.id, false)}
          className="w-full px-4 py-2"
        >
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 mr-3 text-gray-500" />
            <span className="text-sm text-gray-700">View Profile</span>
          </div>
        </BaseMenuItem>

        <Link
          href="/notifications"
          className="block sidebar-compact:hidden"
          onClick={() => setMenuOpenState(false)}
        >
          <div className="w-full px-4 py-2 hover:bg-gray-50">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-3 text-gray-500" />
              <span className="text-sm text-gray-700">Notifications</span>
            </div>
          </div>
        </Link>

        <Link
          href="/researchcoin"
          className="block sidebar-compact:hidden"
          onClick={() => setMenuOpenState(false)}
        >
          <div className="w-full px-4 py-2 hover:bg-gray-50">
            <div className="flex items-center">
              <ResearchCoinIcon outlined className="h-5 w-5 mr-3 text-gray-500" color="#676767" />
              <span className="text-sm text-gray-700">My ResearchCoin</span>
            </div>
          </div>
        </Link>

        {(user?.isModerator || user?.authorProfile?.isHubEditor) && (
          <Link href="/expert-finder" className="block" onClick={() => setMenuOpenState(false)}>
            <div className="w-full px-4 py-2 hover:bg-gray-50">
              <div className="flex items-center">
                <Search className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-sm text-gray-700">Expert Finder</span>
              </div>
            </div>
          </Link>
        )}

        <Link href="/lists" className="block" onClick={() => setMenuOpenState(false)}>
          <div className="w-full px-4 py-2 hover:bg-gray-50">
            <div className="flex items-center">
              <Bookmark className="h-5 w-5 mr-3 text-gray-500" />
              <span className="text-sm text-gray-700">Your Lists</span>
            </div>
          </div>
        </Link>

        <Link href="/settings" className="block" onClick={() => setMenuOpenState(false)}>
          <div className="w-full px-4 py-2 hover:bg-gray-50">
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-3 text-gray-500" />
              <span className="text-sm text-gray-700">Settings</span>
            </div>
          </div>
        </Link>

        {!user.isVerified && (
          <BaseMenuItem onClick={() => openVerificationModal()} className="w-full px-4 py-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <BadgeCheck className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-sm text-gray-700">Verify Account</span>
              </div>
            </div>
          </BaseMenuItem>
        )}

        <Link href="/referral" className="block" onClick={() => setMenuOpenState(false)}>
          <div className="w-full px-4 py-2 hover:bg-gray-50">
            <div className="flex items-center">
              <UserPlus className="h-5 w-5 mr-3 text-gray-500" />
              <span className="text-sm text-gray-700">Refer and earn 10%</span>
              <span className="ml-auto text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                New
              </span>
            </div>
          </div>
        </Link>

        <BaseMenuItem
          onClick={() => AuthSharingService.signOutFromBothApps()}
          className="w-full px-4 py-2"
          data-testid="user-menu-signout"
        >
          <div className="flex items-center">
            <LogOut className="h-5 w-5 mr-3 text-gray-500" />
            <span className="text-sm text-gray-700">Sign Out</span>
          </div>
        </BaseMenuItem>
      </div>

      {/* Verification Banner at bottom */}
      {showVerificationBanner && !user.isVerified && (
        <div className="pb-3 px-3 mt-2">
          <VerificationBanner
            onClose={() => setShowVerificationBanner(false)}
            onMenuClose={handleCloseMenu}
          />
        </div>
      )}
    </BaseMenu>
  );
}
