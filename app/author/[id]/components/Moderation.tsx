'use client';

import React, { useState } from 'react';
import { useUserDetailsForModerator } from '@/hooks/useAuthor';
import { formatTimestamp } from '@/utils/date';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { useUserModeration } from '@/hooks/useUserModeration';
import { useUser } from '@/contexts/UserContext';

export function ModerationSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 text-sm w-full md:max-w-[300px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="font-medium whitespace-nowrap bg-gray-200 rounded h-4 w-24 animate-pulse" />
              <span className="bg-gray-200 rounded h-4 w-32 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="font-medium whitespace-nowrap bg-gray-200 rounded h-4 w-28 animate-pulse" />
              <span className="bg-gray-200 rounded h-4 w-36 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type ModerationProps = {
  readonly userId: string;
  readonly authorId: number;
  readonly refetchAuthorInfo: () => Promise<void>;
};

export default function Moderation({ userId, authorId, refetchAuthorInfo }: ModerationProps) {
  const [{ userDetails, isLoading }, refetchModerationDetails] = useUserDetailsForModerator(userId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Add moderation hook
  const [moderationState, { suspendUser, reinstateUser, markProbableSpammer }] =
    useUserModeration();
  const { user } = useUser();

  // Handler functions for moderation menu items
  const handleSIFTProfile = () => {
    setIsMenuOpen(false);
    if (userDetails?.id) {
      // Open SIFT profile in new tab
      const siftUrl = `https://console.sift.com/users/${userDetails.id}?abuse_type=content_abuse`;
      window.open(siftUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBanUser = async () => {
    setIsMenuOpen(false);

    try {
      await suspendUser(authorId.toString());
      toast.success('User has been suspended successfully');
      // Refresh both author info and moderation details to show updated status
      await Promise.all([refetchAuthorInfo(), refetchModerationDetails()]);
    } catch (error) {
      console.error('Failed to suspend user:', error);
      toast.error('Failed to suspend user. Please try again.');
      // Don't re-throw as we've handled the error with user feedback
    }
  };

  const handleReinstateUser = async () => {
    setIsMenuOpen(false);

    try {
      await reinstateUser(authorId.toString());
      toast.success('User has been reinstated successfully');
      // Refresh both author info and moderation details to show updated status
      await Promise.all([refetchAuthorInfo(), refetchModerationDetails()]);
    } catch (error) {
      console.error('Failed to reinstate user:', error);
      toast.error('Failed to reinstate user. Please try again.');
      // Don't re-throw as we've handled the error with user feedback
    }
  };

  const handleFlagUser = async () => {
    setIsMenuOpen(false);

    try {
      await markProbableSpammer(authorId.toString());
      toast.success('User flagged as probable spammer');
      // Refresh both author info and moderation details to show updated status
      await Promise.all([refetchAuthorInfo(), refetchModerationDetails()]);
    } catch (error) {
      console.error('Failed to flag user:', error);
      toast.error('Failed to flag user. Please try again.');
    }
  };

  if (isLoading) {
    return <ModerationSkeleton />;
  }

  if (!userDetails) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Status Badges and Actions Menu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-base uppercase text-gray-500">Moderation</h3>
          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {userDetails.isSuspended && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 border border-red-200">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Suspended
              </span>
            )}
            {userDetails.isProbableSpammer && (
              <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 border border-orange-200">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Probable Spammer
              </span>
            )}
          </div>
        </div>

        {/* Moderation Actions Menu */}
        <BaseMenu
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          }
          align="end"
          open={isMenuOpen}
          onOpenChange={setIsMenuOpen}
        >
          <BaseMenuItem onClick={handleSIFTProfile} className="flex items-center gap-2">
            <span>SIFT profile</span>
          </BaseMenuItem>
          {user?.isModerator && !userDetails.isProbableSpammer && (
            <BaseMenuItem
              onClick={handleFlagUser}
              className="flex items-center gap-2"
              disabled={moderationState.isLoading}
            >
              <span>
                {moderationState.isLoading && moderationState.lastAction === 'flag'
                  ? 'Flagging...'
                  : 'Flag user'}
              </span>
            </BaseMenuItem>
          )}
          <BaseMenuItem
            onClick={handleBanUser}
            className="flex items-center gap-2"
            disabled={moderationState.isLoading}
          >
            <span>
              {moderationState.isLoading && moderationState.lastAction === 'suspend'
                ? 'Suspending...'
                : 'Ban User'}
            </span>
          </BaseMenuItem>
          <BaseMenuItem
            onClick={handleReinstateUser}
            className="flex items-center gap-2"
            disabled={moderationState.isLoading}
          >
            <span>
              {moderationState.isLoading && moderationState.lastAction === 'reinstate'
                ? 'Reinstating...'
                : 'Reinstate User'}
            </span>
          </BaseMenuItem>
        </BaseMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 text-sm w-full md:max-w-[300px]">
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">Email:</span>
            <span className="truncate max-w-[200px]">{userDetails.email || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">User ID:</span>
            <span>{userDetails.id ?? 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">Likely spammer?</span>
            <span>{userDetails.isProbableSpammer ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">Suspended?</span>
            <span>{userDetails.isSuspended ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">Sift risk score:</span>
            <span>{userDetails.riskScore ?? 'N/A'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium whitespace-nowrap">Verified name:</span>
            <span className="break-words line-clamp-1">
              {userDetails.verification
                ? `${userDetails.verification.firstName} ${userDetails.verification.lastName}`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium whitespace-nowrap">Verification via:</span>
            <span>
              {userDetails.verification
                ? `${userDetails.verification.verifiedVia} on ${formatTimestamp(
                    userDetails.verification.createdDate
                  )}`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium whitespace-nowrap">Verification ID:</span>
            <span
              className="break-words line-clamp-1"
              title={`Verification ID: ${userDetails.verification?.externalId || 'N/A'}`}
            >
              {userDetails.verification?.externalId || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium whitespace-nowrap">Verified status:</span>
            <span>{userDetails.verification?.status || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
