'use client';

import {
  User as UserIcon,
  LogOut,
  BadgeCheck,
  Bell,
  Shield,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import VerificationBanner from '@/components/banners/VerificationBanner';
import { Avatar } from '@/components/ui/Avatar';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import Link from 'next/link';
import { AuthSharingService } from '@/services/auth-sharing.service';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { Button } from '@/components/ui/Button';
import { useVerification } from '@/contexts/VerificationContext';

interface UserMenuProps {
  user: User;
  onViewProfile: () => void;
  isMenuOpen?: boolean;
  onMenuOpenChange?: (isOpen: boolean) => void;
  avatarSize?: number | 'sm' | 'md' | 'xs' | 'xxs';
  showAvatarOnly?: boolean;
  percent: number;
}

export default function UserMenu({
  user,
  onViewProfile,
  isMenuOpen,
  onMenuOpenChange,
  percent,
  avatarSize = 30,
  showAvatarOnly = false,
}: UserMenuProps) {
  const [showVerificationBanner, setShowVerificationBanner] = useState(true);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        showProfileCompletion
        profileCompletionPercent={percent}
      />
    </button>
  );

  // Mobile drawer menu content
  const mobileMenuContent = (
    <>
      {/* User info section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Avatar
            src={user.authorProfile?.profileImage}
            alt={user.authorProfile?.fullName ?? user.fullName}
            size="md"
            showProfileCompletion
            profileCompletionPercent={percent}
          />
          <div className="ml-3 flex-1">
            <p className="text-base font-medium text-gray-900 flex items-center gap-1 leading-tight">
              {user.authorProfile?.fullName ?? user.fullName}
              {user.isVerified && <VerifiedBadge size="sm" />}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            navigateToAuthorProfile(user.authorProfile?.id, false);
            setMenuOpenState(false);
          }}
          variant="outlined"
          size="sm"
          className="w-full mt-3"
        >
          <FontAwesomeIcon icon={faPen} className="h-3 w-3 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Menu items */}
      <div className="py-4">
        <div
          className="px-6 py-2 hover:bg-gray-50 cursor-pointer"
          onClick={() => {
            navigateToAuthorProfile(user.authorProfile?.id, false);
            setMenuOpenState(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigateToAuthorProfile(user.authorProfile?.id, false);
              setMenuOpenState(false);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="View Profile"
        >
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 mr-3 text-gray-500" />
            <span className="text-base text-gray-700">View Profile</span>
          </div>
        </div>

        <Link
          href="/notifications"
          className="block sidebar-compact:!hidden"
          onClick={() => setMenuOpenState(false)}
        >
          <div className="px-6 py-2 hover:bg-gray-50">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-3 text-gray-500" />
              <span className="text-base text-gray-700">Notifications</span>
            </div>
          </div>
        </Link>

        <Link
          href="/researchcoin"
          className="block sidebar-compact:!hidden"
          onClick={() => setMenuOpenState(false)}
        >
          <div className="px-6 py-2 hover:bg-gray-50">
            <div className="flex items-center">
              <ResearchCoinIcon outlined className="h-5 w-5 mr-3 text-gray-500" color="#676767" />
              <span className="text-base text-gray-700">My ResearchCoin</span>
            </div>
          </div>
        </Link>

        <Link href="/referral" className="block" onClick={() => setMenuOpenState(false)}>
          <div className="px-6 py-2 hover:bg-gray-50">
            <div className="flex items-center">
              <UserPlus className="h-5 w-5 mr-3 text-gray-500" />
              <span className="text-base text-gray-700">Refer and earn 10%</span>
              <span className="ml-auto text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                New
              </span>
            </div>
          </div>
        </Link>

        {user?.isModerator && (
          <Link href="/moderators" className="block" onClick={() => setMenuOpenState(false)}>
            <div className="px-6 py-2 hover:bg-gray-50">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-base text-gray-700">Moderator Dashboard</span>
              </div>
            </div>
          </Link>
        )}

        <Link href="/lists" className="block" onClick={() => setMenuOpenState(false)}>
          <div className="px-6 py-2 hover:bg-gray-50">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faBookmark} className="h-5 w-5 mr-3 text-gray-500" />
              <span className="text-base text-gray-700">Your Lists</span>
            </div>
          </div>
        </Link>

        {!user.isVerified && (
          <div
            className="px-6 py-2 hover:bg-gray-50"
            onClick={() => {
              //TODO call the method from the context
              setMenuOpenState(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                //TODO call the method from the context
                setMenuOpenState(false);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Verify Account"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <BadgeCheck className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-base text-gray-700">Verify Account</span>
              </div>
            </div>
          </div>
        )}

        <div
          className="px-6 py-2 hover:bg-gray-50"
          onClick={() => AuthSharingService.signOutFromBothApps()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              AuthSharingService.signOutFromBothApps();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Sign Out"
        >
          <div className="flex items-center">
            <LogOut className="h-5 w-5 mr-3 text-gray-500" />
            <span className="text-base text-gray-700">Sign Out</span>
          </div>
        </div>
      </div>

      {/* Verification Banner at bottom */}
      {showVerificationBanner && !user.isVerified && (
        <div className="px-6 py-4 mt-auto border-t border-gray-200">
          <VerificationBanner
            onClose={() => setShowVerificationBanner(false)}
            onMenuClose={handleCloseMenu}
          />
        </div>
      )}
    </>
  );

  return (
    <>
      {isMobile ? (
        <>
          {/* Mobile view with SwipeableDrawer */}
          <div className="flex center" onClick={() => setMenuOpenState(true)}>
            {avatarButton}
          </div>
          <SwipeableDrawer isOpen={menuOpenState} onClose={handleCloseMenu} showCloseButton={false}>
            {mobileMenuContent}
          </SwipeableDrawer>
        </>
      ) : (
        /* Desktop view - original BaseMenu implementation */
        <BaseMenu
          trigger={avatarButton}
          align="start"
          sideOffset={0}
          className="w-64 p-0"
          withOverlay={true}
          animate
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
                showProfileCompletion
                profileCompletionPercent={percent}
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1 leading-tight">
                  {user.authorProfile?.fullName ?? user.fullName}
                  {user.isVerified && <VerifiedBadge size="sm" />}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{user.email}</p>
              </div>
            </div>
            <Button
              onClick={() => {
                navigateToAuthorProfile(user.authorProfile?.id, false);
                setMenuOpenState(false);
              }}
              variant="outlined"
              size="sm"
              className="w-full mt-3"
            >
              <FontAwesomeIcon icon={faPen} className="h-3 w-3 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <BaseMenuItem
              onClick={() => navigateToAuthorProfile(user.authorProfile?.id, false)}
              className="w-full px-4 py-2"
            >
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-3 text-gray-500" />
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
                  <Bell className="h-4 w-4 mr-3 text-gray-500" />
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
                  <ResearchCoinIcon
                    outlined
                    className="h-4 w-4 mr-3 text-gray-500"
                    color="#676767"
                  />
                  <span className="text-sm text-gray-700">My ResearchCoin</span>
                </div>
              </div>
            </Link>

            <Link href="/referral" className="block" onClick={() => setMenuOpenState(false)}>
              <div className="w-full px-4 py-2 hover:bg-gray-50">
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-3 text-gray-500" />
                  <span className="text-sm text-gray-700">Refer and earn 10%</span>
                  <span className="ml-auto text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                    New
                  </span>
                </div>
              </div>
            </Link>

            {user?.isModerator && (
              <Link href="/moderators" className="block" onClick={() => setMenuOpenState(false)}>
                <div className="w-full px-4 py-2 hover:bg-gray-50">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Moderator Dashboard</span>
                  </div>
                </div>
              </Link>
            )}

            <Link href="/lists" className="block" onClick={() => setMenuOpenState(false)}>
              <div className="w-full px-4 py-2 hover:bg-gray-50">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faBookmark} className="h-4 w-4 mr-3 text-gray-500" />
                  <span className="text-sm text-gray-700">Your Lists</span>
                </div>
              </div>
            </Link>

            {!user.isVerified && (
              <BaseMenuItem onClick={openVerificationModal} className="w-full px-4 py-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <BadgeCheck className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Verify Account</span>
                  </div>
                </div>
              </BaseMenuItem>
            )}

            <BaseMenuItem
              onClick={() => AuthSharingService.signOutFromBothApps()}
              className="w-full px-4 py-2"
            >
              <div className="flex items-center">
                <LogOut className="h-4 w-4 mr-3 text-gray-500" />
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
      )}
    </>
  );
}
