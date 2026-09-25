'use client';

import { useState, useEffect } from 'react';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBirthdayCake } from '@fortawesome/pro-light-svg-icons';
import { specificTimeSince, MEMBERSHIP_JUST_JOINED } from '@/utils/date';
import { AuthorProfile } from '@/types/authorProfile';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import { useUser } from '@/contexts/UserContext';
import { useConnectOrcid } from '@/components/Orcid/lib/hooks/useConnectOrcid';
import { useSyncOrcid } from '@/components/Orcid/lib/hooks/useSyncOrcid';
import { ProfileActions } from './ProfileActions';
import { ProfileSocialLinks } from './ProfileSocialLinks';
import { ProfileEducation } from './ProfileEducation';
import { ProfileEditModal } from './ProfileEditModal';
import { ProfileModerationScore } from './ProfileModerationScore';
import { cn } from '@/utils/styles';

const PROFILE_TAB_WIDTHS = ['w-20', 'w-16', 'w-16', 'w-24'] as const;

export function ProfileTabsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex items-center space-x-8 -mb-px animate-pulse">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn('py-3 border-b-2', i === 0 ? 'border-primary-200' : 'border-transparent')}
        >
          <div className={cn('h-4 bg-gray-200 rounded', PROFILE_TAB_WIDTHS[i] ?? 'w-16')} />
        </div>
      ))}
    </div>
  );
}

interface ProfileHeroBannerProps {
  author: AuthorProfile;
  refetchAuthorInfo: () => Promise<void>;
  tabBar?: React.ReactNode;
}

export function ProfileHeroBanner({ author, refetchAuthorInfo, tabBar }: ProfileHeroBannerProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user: currentUser } = useUser();
  const isOwnProfile = currentUser?.authorProfile?.id === author.id;
  const isModerator = !!currentUser?.isModerator;
  const isOrcidConnected = Boolean(author.isOrcidConnected);
  const canManageProfile = isOwnProfile || isModerator;

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const description = author.description || '';
  const shouldTruncate = description.length > 300;
  const displayedDescription =
    shouldTruncate && !isDescriptionExpanded ? `${description.slice(0, 300)}...` : description;

  const { percent, missing } = currentUser
    ? calculateProfileCompletion(currentUser)
    : { percent: 0, missing: [] };

  const { sync: syncAuthorship, isSyncing } = useSyncOrcid({ onSuccess: refetchAuthorInfo });
  const { connect: connectOrcid, isConnecting: isConnectingOrcid } = useConnectOrcid();

  useEffect(() => {
    if (!isOwnProfile) setIsEditModalOpen(false);
  }, [isOwnProfile]);

  const membershipDuration = author.createdDate ? specificTimeSince(author.createdDate) : null;

  return (
    <>
      <HeroHeader tabBar={tabBar} contentWidth="narrow">
        <div className="flex flex-col sm:!flex-row gap-6">
          {/* Left column - Avatar */}
          <div className="flex-shrink-0">
            <Avatar
              src={author.profileImage}
              alt={author.fullName}
              size={128}
              showProfileCompletion={isOwnProfile}
              profileCompletionPercent={percent}
              showProfileCompletionNumber
              missing={missing}
              showTooltip
            />
          </div>

          {/* Right column - Content */}
          <div className="flex flex-col flex-1 min-w-0 gap-4">
            {/* Header with name and profile actions */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex min-w-0 flex-col items-start">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight leading-snug text-gray-900">
                    {author.fullName}
                  </h1>
                  {author.isVerified && <VerifiedBadge showTooltip={true} />}
                </div>
                {author.headline && (
                  <p className="text-sm sm:text-base text-gray-500 mt-1">{author.headline}</p>
                )}
              </div>
              {canManageProfile && (
                <ProfileActions
                  authorId={author.id}
                  authorName={author.fullName}
                  canEdit={isOwnProfile}
                  canDelete={isModerator}
                  isOrcidConnected={isOrcidConnected}
                  onEditClick={() => setIsEditModalOpen(true)}
                  onSyncClick={syncAuthorship}
                  isSyncing={isSyncing}
                />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <ProfileEducation educations={author.education ?? []} />
              {membershipDuration && (
                <div className="flex items-baseline gap-2 text-gray-600">
                  <FontAwesomeIcon
                    icon={faBirthdayCake}
                    className="h-5 w-5 self-start text-[#6B7280]"
                  />
                  <span>
                    {membershipDuration === MEMBERSHIP_JUST_JOINED
                      ? 'Member just joined'
                      : `Member for ${membershipDuration}`}
                  </span>
                </div>
              )}
              {isModerator && author.userId && (
                <ProfileModerationScore userId={author.userId.toString()} />
              )}
            </div>

            {description && (
              <div className="text-justify">
                <p className="text-gray-600">{displayedDescription}</p>
                {shouldTruncate && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-1 p-0 h-auto align-baseline text-base"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  >
                    {isDescriptionExpanded ? 'Show less' : 'Show more'}
                  </Button>
                )}
              </div>
            )}

            <ProfileSocialLinks
              author={author}
              isOwnProfile={isOwnProfile}
              onConnectOrcid={connectOrcid}
              isConnectingOrcid={isConnectingOrcid}
            />
          </div>
        </div>
      </HeroHeader>

      {isOwnProfile && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          authorId={author.id}
          refetchAuthorInfo={refetchAuthorInfo}
        />
      )}
    </>
  );
}

export function ProfileHeroBannerSkeleton({
  tabBar,
  tabCount = 3,
}: {
  tabBar?: React.ReactNode;
  tabCount?: number;
}) {
  return (
    <HeroHeader tabBar={tabBar ?? <ProfileTabsSkeleton count={tabCount} />} contentWidth="narrow">
      <div className="animate-pulse flex flex-col sm:!flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 bg-gray-200 rounded-full ring-4 ring-white" />
        </div>
        <div className="flex flex-col flex-1 min-w-0 gap-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-5 bg-gray-200 rounded w-64" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-48" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div className="w-8 h-8 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </HeroHeader>
  );
}
