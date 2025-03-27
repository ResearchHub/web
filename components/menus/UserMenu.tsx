'use client';

import { User as UserIcon, LogOut, BadgeCheck, Wallet } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import type { User } from '@/types/user';
import VerificationBanner from '@/components/banners/VerificationBanner';
import { Avatar } from '@/components/ui/Avatar';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useConnect, useDisconnect, useAccount } from 'wagmi';
import { WalletModal } from 'components/modals/WalletModal';
import { VerifyIdentityModal } from '@/components/modals/VerifyIdentityModal';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

interface UserMenuProps {
  user: User;
  onViewProfile: () => void;
  onVerifyAccount: () => void;
}

function truncateWalletAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function UserMenu({ user, onViewProfile, onVerifyAccount }: UserMenuProps) {
  const [showVerificationBanner, setShowVerificationBanner] = useState(true);
  const [walletOptionsOpen, setWalletOptionsOpen] = useState(false);
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

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

  const trigger = (
    <button className="hover:ring-2 hover:ring-gray-200 rounded-full p-1 relative">
      <Avatar src={user.authorProfile?.profileImage} alt={user.fullName} size={34} />
      {user.isVerified && (
        <div className="absolute -top-1 -right-1">
          <VerifiedBadge size="md" />
        </div>
      )}
    </button>
  );

  return (
    <>
      <BaseMenu
        trigger={trigger}
        align="end"
        sideOffset={8}
        className="w-64 p-0"
        withOverlay={true}
        animate
      >
        {/* User info section */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <Avatar src={user.authorProfile?.profileImage} alt={user.fullName} size="md" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
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
                        <span className="ml-8 text-xs text-gray-500">Disconnect Wallet</span>
                      </div>
                    </BaseMenuItem>
                  </>
                )}
              </>
            ) : (
              <BaseMenuItem onClick={handleOpenWalletModal} className="w-full px-4 py-2">
                <div className="flex items-center">
                  <Wallet className="h-4 w-4 mr-3 text-gray-500" />
                  <span className="text-sm text-gray-700">Connect Wallet</span>
                </div>
              </BaseMenuItem>
            ))}

          <BaseMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="w-full px-4 py-2">
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
            />
          </div>
        )}
      </BaseMenu>

      {/* Modals */}
      <WalletModal isOpen={isWalletModalOpen} onClose={handleCloseWalletModal} />
      <VerifyIdentityModal isOpen={isVerifyModalOpen} onClose={handleCloseVerifyModal} />
    </>
  );
}
