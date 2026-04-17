'use client';

import React, { useMemo, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUserDetailsForModerator } from '@/hooks/useAuthor';
import { useUserModeration } from '@/hooks/useUserModeration';
import { useUser } from '@/contexts/UserContext';
import { formatTimestamp } from '@/utils/date';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';

type ModerationTabProps = {
  readonly userId: string;
  readonly authorId: number;
  readonly refetchAuthorInfo: () => Promise<void>;
};

function StatusBadges({
  isSuspended,
  isProbableSpammer,
}: {
  isSuspended: boolean;
  isProbableSpammer: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {isSuspended && (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 border border-red-200">
          Suspended
        </span>
      )}
      {isProbableSpammer && (
        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 border border-orange-200">
          Probable Spammer
        </span>
      )}
    </div>
  );
}

function ModerationSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-base uppercase text-gray-500">Moderation</h3>
      </div>
      <ul className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="bg-gray-200 rounded h-4 w-32 animate-pulse" />
            <span className="bg-gray-200 rounded h-4 w-48 animate-pulse" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ModerationTab({ userId, authorId, refetchAuthorInfo }: ModerationTabProps) {
  const { user: currentUser } = useUser();
  const [{ userDetails, isLoading }, refetchModerationDetails] = useUserDetailsForModerator(userId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHubEditor = !!currentUser?.authorProfile?.isHubEditor;
  const isModerator = !!currentUser?.isModerator;

  const [moderationState, { suspendUser, reinstateUser, markProbableSpammer }] =
    useUserModeration();

  const refreshAfterAction = () => Promise.all([refetchAuthorInfo(), refetchModerationDetails()]);

  const handleBanUser = () => {
    setIsMenuOpen(false);
    suspendUser(authorId.toString())
      .then(() => {
        toast.success('User has been suspended successfully');
        return refreshAfterAction();
      })
      .catch((error) => {
        console.error('Failed to suspend user:', error);
        toast.error('Failed to suspend user. Please try again.');
      });
  };

  const handleReinstateUser = () => {
    setIsMenuOpen(false);
    reinstateUser(authorId.toString())
      .then(() => {
        toast.success('User has been reinstated successfully');
        return refreshAfterAction();
      })
      .catch((error) => {
        console.error('Failed to reinstate user:', error);
        toast.error('Failed to reinstate user. Please try again.');
      });
  };

  const handleFlagUser = () => {
    setIsMenuOpen(false);
    markProbableSpammer(authorId.toString())
      .then(() => {
        toast.success('User flagged as probable spammer');
        return refreshAfterAction();
      })
      .catch((error) => {
        console.error('Failed to flag user:', error);
        toast.error('Failed to flag user. Please try again.');
      });
  };

  const menuItems = useMemo(() => {
    const items: { id: string; label: string; onClick: () => void; show: boolean }[] = [
      {
        id: 'flag_user',
        label: moderationState.isLoading ? 'Flagging...' : 'Flag user',
        onClick: handleFlagUser,
        show: (isModerator || isHubEditor) && !userDetails?.isProbableSpammer,
      },
      {
        id: 'ban_user',
        label: moderationState.isLoading ? 'Suspending...' : 'Ban User',
        onClick: handleBanUser,
        show: isModerator,
      },
      {
        id: 'reinstate_user',
        label: moderationState.isLoading ? 'Reinstating...' : 'Reinstate User',
        onClick: handleReinstateUser,
        show: isModerator,
      },
    ];
    return items.filter((i) => i.show);
  }, [isModerator, isHubEditor, userDetails, moderationState.isLoading]);

  if (isLoading) return <ModerationSkeleton />;
  if (!userDetails) return null;

  const verifiedName = userDetails.verification
    ? `${userDetails.verification.firstName} ${userDetails.verification.lastName}`
    : 'N/A';
  const verificationVia = userDetails.verification
    ? `${userDetails.verification.verifiedVia} on ${formatTimestamp(
        userDetails.verification.createdDate
      )}`
    : 'N/A';

  const items: { label: string; value: React.ReactNode }[] = [
    { label: 'Email', value: userDetails.email || 'N/A' },
    { label: 'User ID', value: userDetails.id ?? 'N/A' },
    { label: 'Likely spammer?', value: userDetails.isProbableSpammer ? 'Yes' : 'No' },
    { label: 'Suspended?', value: userDetails.isSuspended ? 'Yes' : 'No' },
    { label: 'ORCID Connected?', value: userDetails.isOrcidConnected ? 'Yes' : 'No' },
    { label: 'Verified name', value: verifiedName },
    { label: 'Verification via', value: verificationVia },
    { label: 'Verification ID', value: userDetails.verification?.externalId || 'N/A' },
    { label: 'Verified status', value: userDetails.verification?.status || 'N/A' },
    { label: 'ORCID Email', value: userDetails.orcidVerifiedEduEmail || 'N/A' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-base uppercase text-gray-500">Moderation</h3>
          <StatusBadges
            isSuspended={!!userDetails.isSuspended}
            isProbableSpammer={!!userDetails.isProbableSpammer}
          />
        </div>
        {menuItems.length > 0 && (
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
            {menuItems.map((item) => (
              <BaseMenuItem
                key={item.id}
                onClick={item.onClick}
                className="flex items-center gap-2"
                disabled={moderationState.isLoading}
              >
                <span>{item.label}</span>
              </BaseMenuItem>
            ))}
          </BaseMenu>
        )}
      </div>

      <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-gray-700">
        {items.map((item) => (
          <li key={item.label}>
            <span className="font-medium">{item.label}:</span>{' '}
            <span className="break-words">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
