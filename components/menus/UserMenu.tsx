'use client';

import { BadgeCheck, Bell, List, LogOut, Shield, User as UserIcon, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
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

const MENU_TEXT = {
  PROFILE: 'View Profile',
  LISTS: 'View Lists',
  NOTIFICATIONS: 'Notifications',
  RSC: 'My ResearchCoin',
  REFERRAL: 'Refer and earn 10%',
  MODERATOR: 'Moderator Dashboard',
  SIGN_OUT: 'Sign Out',
  VERIFY: 'Verify Account',
};

const MENU_STYLE = {
  RSC_ICON_COLOR: '#676767',
  TEXT_COLOR: 'text-gray-500',
  HOVER_COLOR: 'bg-gray-100',
  HIDDEN_BLOCK: 'block sidebar-compact:hidden',
  NEW_BUBBLE: 'ml-auto text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full',
};

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

  const setMenuOpenState = useCallback(
    (open: boolean) => {
      if (onMenuOpenChange) {
        onMenuOpenChange(open);
      } else {
        setInternalMenuOpen(open);
      }
    },
    [onMenuOpenChange]
  );

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

  // Apply different avatar size for avatar-only mode
  const effectiveAvatarSize =
    showAvatarOnly && typeof avatarSize === 'number' ? avatarSize * 1.25 : avatarSize;

  const closeMenu = useCallback(() => {
    setMenuOpenState(false);
  }, [setMenuOpenState]);

  const openMenu = useCallback(() => {
    setMenuOpenState(true);
  }, [setMenuOpenState]);

  const hideVerificationBanner = useCallback(() => {
    setShowVerificationBanner(false);
  }, []);

  function signOutFromBothApps() {
    void AuthSharingService.signOutFromBothApps();
  }

  const navToAuthor = useCallback(() => {
    navigateToAuthorProfile(user.authorProfile?.id, false);
  }, [user.authorProfile?.id]);

  function getListsUrl() {
    return `/author/${user.authorProfile?.id}/lists/`;
  }

  // Common avatar button with adjusted sizing for avatar-only mode
  const avatarButton = (
    <button
      className="hover:ring-2 hover:ring-gray-200 rounded-full p-1 relative"
      onClick={openMenu}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();

          openMenu();
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

  const iconStyle = isMobile
    ? `h-5 w-5 mr-3 ${MENU_STYLE.TEXT_COLOR}`
    : `h-4 w-4 mr-3 ${MENU_STYLE.TEXT_COLOR}`;

  const labelStyle = isMobile ? 'text-base text-gray-700' : 'text-sm text-gray-700';

  if (isMobile)
    return (
      <>
        {/* Mobile view with SwipeableDrawer */}
        <div className="flex center" onClick={openMenu}>
          {avatarButton}
        </div>
        <SwipeableDrawer isOpen={menuOpenState} onClose={closeMenu} showCloseButton={false}>
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
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-900 flex items-center gap-1">
                    {user.authorProfile?.fullName ?? user.fullName}
                    {user.isVerified && <VerifiedBadge size="sm" />}
                    <Button
                      onClick={() => {
                        navToAuthor();
                        closeMenu();
                      }}
                      className={`ml-1 p-1 rounded hover:${MENU_STYLE.HOVER_COLOR} transition`}
                      title="Edit Profile"
                      variant="ghost"
                      size="icon"
                    >
                      <FontAwesomeIcon
                        icon={faPen}
                        className={`h-4 w-4 ${MENU_STYLE.TEXT_COLOR}`}
                      />
                    </Button>
                  </p>
                  <p className={`text-lg ${MENU_STYLE.TEXT_COLOR}`}>{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-4">
              <div
                className={`px-6 py-2 hover:${MENU_STYLE.HOVER_COLOR} cursor-pointer`}
                onClick={() => {
                  navToAuthor();
                  closeMenu();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();

                    navToAuthor();
                    closeMenu();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={MENU_TEXT.PROFILE}
              >
                <div className="flex items-center">
                  <UserIcon className={iconStyle} />
                  <span className={labelStyle}>{MENU_TEXT.PROFILE}</span>
                </div>
              </div>

              <Link href={getListsUrl()} className="block" onClick={closeMenu}>
                <div className={`px-6 py-2 hover:${MENU_STYLE.HOVER_COLOR}`}>
                  <div className="flex items-center">
                    <List className={iconStyle} />
                    <span className={labelStyle}>{MENU_TEXT.LISTS}</span>
                  </div>
                </div>
              </Link>

              <Link href="/notifications" className={MENU_STYLE.HIDDEN_BLOCK} onClick={closeMenu}>
                <div className={`px-6 py-2 hover:${MENU_STYLE.HOVER_COLOR}`}>
                  <div className="flex items-center">
                    <Bell className={iconStyle} />
                    <span className={labelStyle}>{MENU_TEXT.NOTIFICATIONS}</span>
                  </div>
                </div>
              </Link>

              <Link href="/researchcoin" className={MENU_STYLE.HIDDEN_BLOCK} onClick={closeMenu}>
                <div className={`px-6 py-2 hover:${MENU_STYLE.HOVER_COLOR}`}>
                  <div className="flex items-center">
                    <ResearchCoinIcon
                      outlined
                      className={iconStyle}
                      color={MENU_STYLE.RSC_ICON_COLOR}
                    />
                    <span className={labelStyle}>{MENU_TEXT.RSC}</span>
                  </div>
                </div>
              </Link>

              <Link href="/referral" className="block" onClick={closeMenu}>
                <div className={`px-6 py-2 hover:${MENU_STYLE.HOVER_COLOR}`}>
                  <div className="flex items-center">
                    <UserPlus className={iconStyle} />
                    <span className={labelStyle}>{MENU_TEXT.REFERRAL}</span>
                    <span className={MENU_STYLE.NEW_BUBBLE}>New</span>
                  </div>
                </div>
              </Link>

              {user?.isModerator && (
                <Link href="/moderators" className="block" onClick={closeMenu}>
                  <div className={`px-6 py-2 hover:${MENU_STYLE.HOVER_COLOR}`}>
                    <div className="flex items-center">
                      <Shield className={iconStyle} />
                      <span className={labelStyle}>{MENU_TEXT.MODERATOR}</span>
                    </div>
                  </div>
                </Link>
              )}

              {!user.isVerified && (
                <div
                  className={`px-6 py-2 hover:${MENU_STYLE.HOVER_COLOR}`}
                  onClick={() => {
                    //TODO call the method from the context
                    closeMenu();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      //TODO call the method from the context
                      closeMenu();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={MENU_TEXT.VERIFY}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <BadgeCheck className={iconStyle} />
                      <span className={labelStyle}>{MENU_TEXT.VERIFY}</span>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`px-6 py-2 hover:${MENU_STYLE.HOVER_COLOR}`}
                onClick={signOutFromBothApps}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();

                    signOutFromBothApps();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={MENU_TEXT.SIGN_OUT}
              >
                <div className="flex items-center">
                  <LogOut className={iconStyle} />
                  <span className={labelStyle}>{MENU_TEXT.SIGN_OUT}</span>
                </div>
              </div>
            </div>
            {/* Verification Banner at bottom */}
            {showVerificationBanner && !user.isVerified && (
              <div className="px-6 py-4 mt-auto border-t border-gray-200">
                <VerificationBanner onClose={hideVerificationBanner} onMenuClose={closeMenu} />
              </div>
            )}
          </>
        </SwipeableDrawer>
      </>
    );

  const base_menu_item_style = 'w-full px-4 py-2 cursor-pointer';
  const link_div1_style = `w-full px-4 py-2 hover:${MENU_STYLE.HOVER_COLOR}`;

  return (
    <>
      {/* Desktop view - original BaseMenu implementation */}
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
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                {user.authorProfile?.fullName ?? user.fullName}
                {user.isVerified && <VerifiedBadge size="sm" />}
                <Button
                  onClick={() => {
                    navToAuthor();
                    closeMenu();
                  }}
                  className={`ml-1 p-1 rounded hover:${MENU_STYLE.HOVER_COLOR} transition max-h-6`}
                  title="Edit Profile"
                  variant="ghost"
                  size="sm"
                >
                  <FontAwesomeIcon icon={faPen} className={`h-4 w-4 ${MENU_STYLE.TEXT_COLOR}`} />
                </Button>
              </p>
              <p className={`text-xs ${MENU_STYLE.TEXT_COLOR}`}>{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1">
          <BaseMenuItem onClick={navToAuthor} className={base_menu_item_style}>
            <div className="flex items-center">
              <UserIcon className={iconStyle} />
              <span className={labelStyle}>{MENU_TEXT.PROFILE}</span>
            </div>
          </BaseMenuItem>

          <Link href={getListsUrl()} className="block" onClick={closeMenu}>
            <div className={link_div1_style}>
              <div className="flex items-center">
                <List className={iconStyle} />
                <span className={labelStyle}>{MENU_TEXT.LISTS}</span>
              </div>
            </div>
          </Link>

          <Link href="/notifications" className={MENU_STYLE.HIDDEN_BLOCK} onClick={closeMenu}>
            <div className={link_div1_style}>
              <div className="flex items-center">
                <Bell className={iconStyle} />
                <span className={labelStyle}>{MENU_TEXT.NOTIFICATIONS}</span>
              </div>
            </div>
          </Link>

          <Link href="/researchcoin" className={MENU_STYLE.HIDDEN_BLOCK} onClick={closeMenu}>
            <div className={link_div1_style}>
              <div className="flex items-center">
                <ResearchCoinIcon
                  outlined
                  className={iconStyle}
                  color={MENU_STYLE.RSC_ICON_COLOR}
                />
                <span className={labelStyle}>{MENU_TEXT.RSC}</span>
              </div>
            </div>
          </Link>

          <Link href="/referral" className="block" onClick={closeMenu}>
            <div className={link_div1_style}>
              <div className="flex items-center">
                <UserPlus className={iconStyle} />
                <span className={labelStyle}>{MENU_TEXT.REFERRAL}</span>
                <span className={MENU_STYLE.NEW_BUBBLE}>New</span>
              </div>
            </div>
          </Link>

          {user?.isModerator && (
            <Link href="/moderators" className="block" onClick={closeMenu}>
              <div className={link_div1_style}>
                <div className="flex items-center">
                  <Shield className={iconStyle} />
                  <span className={labelStyle}>{MENU_TEXT.MODERATOR}</span>
                </div>
              </div>
            </Link>
          )}

          {!user.isVerified && (
            <BaseMenuItem onClick={openVerificationModal} className={base_menu_item_style}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <BadgeCheck className={iconStyle} />
                  <span className={labelStyle}>{MENU_TEXT.VERIFY}</span>
                </div>
              </div>
            </BaseMenuItem>
          )}

          <BaseMenuItem onClick={signOutFromBothApps} className={base_menu_item_style}>
            <div className="flex items-center">
              <LogOut className={iconStyle} />
              <span className={labelStyle}>{MENU_TEXT.SIGN_OUT}</span>
            </div>
          </BaseMenuItem>
        </div>

        {/* Verification Banner at bottom */}
        {showVerificationBanner && !user.isVerified && (
          <div className="pb-3 px-3 mt-2">
            <VerificationBanner onClose={hideVerificationBanner} onMenuClose={closeMenu} />
          </div>
        )}
      </BaseMenu>
    </>
  );
}
