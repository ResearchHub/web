'use client';

import { useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBirthdayCake } from '@fortawesome/pro-light-svg-icons';
import { specificTimeSince, MEMBERSHIP_JUST_JOINED } from '@/utils/date';
import { AuthorProfile } from '@/types/authorProfile';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import { useUser } from '@/contexts/UserContext';
import { useSyncOrcid } from '@/components/Orcid/lib/hooks/useSyncOrcid';
import { ProfileEditButton } from './ProfileEditButton';
import { ProfileSocialLinks } from './ProfileSocialLinks';
import { ProfileEducation } from './ProfileEducation';
import { ProfileEditModal } from './ProfileEditModal';
import { DeleteAuthorButton } from './DeleteAuthorButton';
import { cn } from '@/utils/styles';

const PROFILE_TAB_WIDTHS = ['w-20', 'w-16', 'w-16', 'w-24'] as const;

export function ProfileTabsSkeleton({ count = 3 }: Readonly<{ count?: number }>) {
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

interface ProfileSidebarProps {
  readonly author: AuthorProfile;
  readonly refetchAuthorInfo: () => Promise<void>;
}

export function ProfileSidebar({ author, refetchAuthorInfo }: ProfileSidebarProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user: currentUser } = useUser();
  const isOwnProfile = currentUser?.authorProfile?.id === author.id;
  const isModerator = !!currentUser?.isModerator;
  const isOrcidConnected = Boolean(author.isOrcidConnected);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const description = author.description || '';
  const shouldTruncate = description.length > 300;
  const displayedDescription =
    shouldTruncate && !isDescriptionExpanded ? `${description.slice(0, 300)}...` : description;

  const { percent, missing } = currentUser
    ? calculateProfileCompletion(currentUser)
    : { percent: 0, missing: [] };

  const { sync: syncAuthorship, isSyncing } = useSyncOrcid({ onSuccess: refetchAuthorInfo });

  useEffect(() => {
    if (!isOwnProfile) setIsEditModalOpen(false);
  }, [isOwnProfile]);

  const membershipDuration = author.createdDate ? specificTimeSince(author.createdDate) : null;

  return (
    <>
      <div className="flex min-w-0 flex-col gap-4 break-words">
        <div className="flex justify-center">
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

        <h1
          className="min-w-0 text-center text-2xl font-semibold tracking-tight leading-snug text-gray-900"
          title={author.fullName}
          aria-label={author.fullName}
        >
          {author.firstName || author.lastName ? (
            <>
              <span className="block truncate">{author.firstName}</span>
              <span className="block truncate">{author.lastName}</span>
            </>
          ) : (
            <span className="block truncate">{author.fullName}</span>
          )}
        </h1>

        {author.headline && <p className="text-center text-sm text-gray-500">{author.headline}</p>}

        {(isOwnProfile || isModerator) && (
          <div
            className={cn(
              'grid items-center justify-items-center gap-2',
              isOwnProfile && isModerator ? 'grid-cols-2' : 'grid-cols-1'
            )}
          >
            {isOwnProfile && (
              <ProfileEditButton
                isOrcidConnected={isOrcidConnected}
                onEditClick={() => setIsEditModalOpen(true)}
                onSyncClick={syncAuthorship}
                isSyncing={isSyncing}
                className={isModerator ? 'contents' : 'flex items-center gap-2'}
              />
            )}
            {isModerator && (
              <DeleteAuthorButton authorId={author.id} authorName={author.fullName} />
            )}
          </div>
        )}

        <div className="flex flex-col gap-1 text-sm">
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
        </div>

        {description && (
          <div className="text-sm">
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

        <ProfileSocialLinks author={author} />
      </div>

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

export function ProfileSidebarSkeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="w-32 h-32 bg-gray-200 rounded-full" />
      <div className="h-7 bg-gray-200 rounded w-40" />
      <div className="h-7 bg-gray-200 rounded w-48" />
      <div className="h-10 bg-gray-200 rounded w-32" />
      <div className="space-y-2 w-full">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}
