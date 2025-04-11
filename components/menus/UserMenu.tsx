'use client';

import { User as UserIcon, LogOut, BadgeCheck, Wallet, Bell } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import VerificationBanner from '@/components/banners/VerificationBanner';
import { Avatar } from '@/components/ui/Avatar';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useConnect, useDisconnect, useAccount } from 'wagmi';
import { WalletModal } from 'components/modals/WalletModal';
import { VerifyIdentityModal } from '@/components/modals/VerifyIdentityModal';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { Icon } from '@/components/ui/icons';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import Link from 'next/link';

interface UserMenuProps {
  user: User;
  onViewProfile: () => void;
  onVerifyAccount: () => void;
  isMenuOpen?: boolean;
  onMenuOpenChange?: (isOpen: boolean) => void;
  avatarSize?: number | 'sm' | 'md' | 'xs' | 'xxs';
}

function truncateWalletAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function UserMenu({
  user,
  onViewProfile,
  onVerifyAccount,
  isMenuOpen,
  onMenuOpenChange,
  avatarSize = 30,
}: UserMenuProps) {
  const [showVerificationBanner, setShowVerificationBanner] = useState(true);
  const [walletOptionsOpen, setWalletOptionsOpen] = useState(false);
  useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const handleLearnMore = () => {
    setIsVerifyModalOpen(true);
  };

  const handleOpenWalletModal = () => {
    setIsWalletModalOpen(true);
  };

  const handleCloseWalletModal = () => {
    setIsWalletModalOpen(false);
  };

  const handleVerifyAccount = () => {
    setIsVerifyModalOpen(true);
    onVerifyAccount(); // Call the original handler if needed
  };

  const handleCloseVerifyModal = () => {
    setIsVerifyModalOpen(false);
  };

  const handleCloseMenu = () => {
    setMenuOpenState(false);
  };

  // Common avatar button
  const avatarButton = (
    <button className="hover:ring-2 hover:ring-gray-200 rounded-full p-1 relative">
      <Avatar
        src={user.authorProfile?.profileImage}
        className="font-semibold"
        alt={user.fullName}
        size={avatarSize}
      />
    </button>
  );

  // Mobile drawer menu content
  const mobileMenuContent = (
    <>
      {/* User info section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Avatar src={user.authorProfile?.profileImage} alt={user.fullName} size="md" />
          <div className="ml-3">
            <p className="text-base font-medium text-gray-900 flex items-center">
              {user.fullName}
              {user.isVerified && <VerifiedBadge size="sm" className="ml-1" />}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-4">
        <div
          className="px-6 py-2 hover:bg-gray-50"
          onClick={() => {
            onViewProfile();
            setMenuOpenState(false);
          }}
        >
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 mr-3 text-gray-500" />
            <span className="text-base text-gray-700">View Profile</span>
          </div>
        </div>

        <Link href="/notifications" className="block" onClick={() => setMenuOpenState(false)}>
          <div className="px-6 py-2 hover:bg-gray-50">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-3 text-gray-500" />
              <span className="text-base text-gray-700">Notifications</span>
            </div>
          </div>
        </Link>

        <Link href="/researchcoin" className="block" onClick={() => setMenuOpenState(false)}>
          <div className="px-6 py-2 hover:bg-gray-50">
            <div className="flex items-center">
              <ResearchCoinIcon outlined className="h-5 w-5 mr-3 text-gray-500" color="#676767" />
              <span className="text-base text-gray-700">My Wallet</span>
            </div>
          </div>
        </Link>

        {!user.isVerified && (
          <div
            className="px-6 py-2 hover:bg-gray-50"
            onClick={() => {
              handleVerifyAccount();
              setMenuOpenState(false);
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <BadgeCheck className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-base text-gray-700">Verify Account</span>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Menu Items */}
        {process.env.NODE_ENV !== 'production' &&
          (isConnected ? (
            <>
              <div
                className="px-6 py-2 hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setWalletOptionsOpen((prev) => !prev);
                }}
              >
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 mr-3 text-gray-500" />
                  <span className="text-base text-gray-700">
                    {truncateWalletAddress(address as string)}
                  </span>
                </div>
              </div>
              {walletOptionsOpen && (
                <>
                  <div
                    className="px-6 py-2 hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (address) navigator.clipboard.writeText(address);
                    }}
                  >
                    <div className="flex items-center">
                      <span className="ml-8 text-sm text-gray-500">Copy Address</span>
                    </div>
                  </div>
                  <div
                    className="px-6 py-2 hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      disconnect();
                      setWalletOptionsOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <span className="ml-8 text-sm text-gray-500">Disconnect Wallet</span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div
              className="px-6 py-2 hover:bg-gray-50"
              onClick={() => {
                handleOpenWalletModal();
                setMenuOpenState(false);
              }}
            >
              <div className="flex items-center">
                <Wallet className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-base text-gray-700">Connect Wallet</span>
              </div>
            </div>
          ))}

        <div className="px-6 py-2 hover:bg-gray-50" onClick={() => signOut({ callbackUrl: '/' })}>
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
            onLearnMore={handleLearnMore}
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
          <div onClick={() => setMenuOpenState(true)}>{avatarButton}</div>
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
              <Avatar src={user.authorProfile?.profileImage} alt={user.fullName} size="md" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  {user.fullName}
                  {user.isVerified && <VerifiedBadge size="sm" className="ml-1" />}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <BaseMenuItem onClick={onViewProfile} className="w-full px-4 py-2">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-3 text-gray-500" />
                <span className="text-sm text-gray-700">View Profile</span>
              </div>
            </BaseMenuItem>

            <Link href="/notifications" className="block" onClick={() => setMenuOpenState(false)}>
              <div className="w-full px-4 py-2 hover:bg-gray-50">
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-3 text-gray-500" />
                  <span className="text-sm text-gray-700">Notifications</span>
                </div>
              </div>
            </Link>

            <Link href="/researchcoin" className="block" onClick={() => setMenuOpenState(false)}>
              <div className="w-full px-4 py-2 hover:bg-gray-50">
                <div className="flex items-center">
                  <ResearchCoinIcon
                    outlined
                    className="h-4 w-4 mr-3 text-gray-500"
                    color="#676767"
                  />
                  <span className="text-sm text-gray-700">My Wallet</span>
                </div>
              </div>
            </Link>

            {!user.isVerified && (
              <BaseMenuItem onClick={handleVerifyAccount} className="w-full px-4 py-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <BadgeCheck className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Verify Account</span>
                  </div>
                </div>
              </BaseMenuItem>
            )}

            {/* Wallet Menu Items */}
            {process.env.NODE_ENV !== 'production' &&
              (isConnected ? (
                <>
                  <BaseMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setWalletOptionsOpen((prev) => !prev);
                    }}
                    className="w-full px-4 py-2"
                  >
                    <div className="flex items-center">
                      <Wallet className="h-4 w-4 mr-3 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {truncateWalletAddress(address as string)}
                      </span>
                    </div>
                  </BaseMenuItem>
                  {walletOptionsOpen && (
                    <>
                      <BaseMenuItem
                        onSelect={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (address) navigator.clipboard.writeText(address);
                        }}
                        className="w-full px-4 py-2"
                      >
                        <div className="flex items-center">
                          <span className="ml-8 text-xs text-gray-500">Copy Address</span>
                        </div>
                      </BaseMenuItem>
                      <BaseMenuItem
                        onSelect={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          disconnect();
                          setWalletOptionsOpen(false);
                        }}
                        className="w-full px-4 py-2"
                      >
                        <div className="flex items-center">
                          <span className="ml-8 text-xs text-gray-500">
                            Disconnect External Wallet
                          </span>
                        </div>
                      </BaseMenuItem>
                    </>
                  )}
                </>
              ) : (
                <BaseMenuItem onClick={handleOpenWalletModal} className="w-full px-4 py-2">
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 mr-3 text-gray-500" />
                    <span className="text-sm text-gray-700">Connect External Wallet</span>
                  </div>
                </BaseMenuItem>
              ))}

            <BaseMenuItem
              onClick={() => signOut({ callbackUrl: '/' })}
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
                onLearnMore={handleLearnMore}
                onMenuClose={handleCloseMenu}
              />
            </div>
          )}
        </BaseMenu>
      )}

      {/* Modals */}
      <WalletModal isOpen={isWalletModalOpen} onClose={handleCloseWalletModal} />
      <VerifyIdentityModal isOpen={isVerifyModalOpen} onClose={handleCloseVerifyModal} />
    </>
  );
}
