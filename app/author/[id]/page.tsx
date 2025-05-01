'use client';

import { use } from 'react';
import { ProfileInformationForm } from '@/components/Onboarding/ProfileInformationForm';
import { ProfileInformationFormValues } from '@/components/Onboarding/ProfileInformationForm/schema';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuthorInfo, useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import { useUser } from '@/contexts/UserContext';
import { Avatar } from '@/components/ui/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faGoogle } from '@fortawesome/free-brands-svg-icons';
import {
  faGraduationCap,
  faBuilding,
  faBirthdayCake,
  faPen,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Card } from '@/components/ui/Card';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { formatTimeAgo } from '@/utils/date';
import { BaseModal } from '@/components/ui/BaseModal';
import { AuthorProfile } from '@/types/authorProfile';
import { calculateProfileCompletion } from '@/utils/profileCompletion';

function toNumberOrNull(value: any): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function AuthorProfileSkeleton() {
  return (
    <div className="flex gap-6 animate-pulse">
      {/* Left column - Avatar */}
      <div className="flex-shrink-0">
        <div className="w-28 h-28 bg-gray-200 rounded-full ring-4 ring-white" />
      </div>

      {/* Right column - Content */}
      <div className="flex-1 min-w-0">
        {/* Header with name */}
        <div className="flex flex-col items-start gap-2 mb-4">
          <div className="h-9 bg-gray-200 rounded w-48" />
          <div className="h-5 bg-gray-200 rounded w-64" />
        </div>
        {/* Education */}
        <div className="flex items-center gap-2 mb-1">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-5 bg-gray-200 rounded w-64" />
        </div>
        {/* Member since */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-48" />
        </div>
        {/* Description */}
        <div className="mb-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        {/* Social Icons */}
        <div className="flex gap-2 mt-2">
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-8 h-8 bg-gray-200 rounded" />
          <div className="w-8 h-8 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function AuthorProfileError({ error }: { error: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-red-500 text-lg mb-4">Error loading profile</div>
      <div className="text-gray-600">{error}</div>
    </div>
  );
}

function AuthorProfileView({
  author,
  refetchAuthorInfo,
}: {
  author: AuthorProfile;
  refetchAuthorInfo: () => Promise<void>;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user: currentUser, refreshUser } = useUser();
  const isOwnProfile = currentUser?.authorProfile?.id === author.id;
  const fullName = author.fullName;

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const description = author.description || '';
  const shouldTruncate = description.length > 300;
  const displayedDescription =
    shouldTruncate && !isDescriptionExpanded ? `${description.slice(0, 300)}...` : description;

  const primaryEducation = (author.education || []).find((e) => e.is_public);

  const { percent, missing } = currentUser
    ? calculateProfileCompletion(currentUser)
    : { percent: 0, missing: [] };

  const [{ isLoading: updateLoading }, updateAuthorProfileData] = useUpdateAuthorProfileData();

  const handleProfileFormSubmit = async (data: ProfileInformationFormValues) => {
    if (!author.id) {
      toast.error('User information not available. Cannot save profile.');
      return false;
    }

    try {
      await updateAuthorProfileData(author.id, {
        ...data,
        education: data.education.length > 0 ? data.education : [],
        description: data.description,
        headline: data.headline,
        linkedin: data.linkedin,
        orcid_id: data.orcid_id,
        twitter: data.twitter,
        google_scholar: data.google_scholar,
      });
      await refetchAuthorInfo();
      toast.success('Profile updated successfully');
      setIsEditModalOpen(false);
      await refreshUser();
    } catch (e) {
      toast.error('Failed to save profile.');
    }
  };

  useEffect(() => {
    if (!isOwnProfile) {
      setIsEditModalOpen(false);
    }
  }, [isOwnProfile]);

  return (
    <>
      <div className="flex gap-6">
        {/* Left column - Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={author.profileImage}
            alt={fullName}
            size={120}
            showProfileCompletion
            profileCompletionPercent={percent}
            showProfileCompletionNumber
            missing={missing}
          />
        </div>

        {/* Right column - Content */}
        <div className="flex flex-col flex-1 min-w-0 gap-4">
          {/* Header with name and edit button */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                {currentUser?.isVerified && <VerifiedBadge />}
              </div>
              {author.headline && (
                <div className="flex items-center gap-2 text-gray-600 font-sm">
                  <span>{author.headline}</span>
                </div>
              )}
            </div>
            {isOwnProfile && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outlined"
                className="flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPen} className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>

          <div>
            {/* Primary Education */}
            {primaryEducation && (
              <div className="flex items-center gap-2 text-gray-600">
                <FontAwesomeIcon icon={faBuilding} className="h-4 w-4" />
                {primaryEducation.summary ? (
                  <span>{primaryEducation.summary}</span>
                ) : (
                  <span>
                    {primaryEducation.degree?.label}{' '}
                    {primaryEducation.major && `in ${primaryEducation.major}`}
                    {primaryEducation.year?.value && ` '${primaryEducation.year.value.slice(2)}'`}
                    {primaryEducation.name && `, ${primaryEducation.name}`}
                  </span>
                )}
              </div>
            )}
            {/* Member since */}
            {currentUser?.createdDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <FontAwesomeIcon icon={faBirthdayCake} className="h-4 w-4" />
                <span>Member for {formatTimeAgo(currentUser.createdDate, true)}</span>
              </div>
            )}
          </div>

          {/* Description with Show more/less */}
          {description && (
            <div>
              <p className="text-gray-600">{displayedDescription}</p>
              {shouldTruncate && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                >
                  {isDescriptionExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {/* Social Links */}
          <div className="flex gap-2">
            {author.orcidId && (
              <SocialIcon
                icon={<FontAwesomeIcon icon={faGraduationCap} />}
                href={author.orcidId}
                label="ORCID"
                className="text-[#A6CE39]"
              />
            )}
            {author.linkedin && (
              <SocialIcon
                icon={<FontAwesomeIcon icon={faLinkedin} />}
                href={author.linkedin}
                label="LinkedIn"
                className="text-[#0077B5]"
              />
            )}
            {author.twitter && (
              <SocialIcon
                icon={<FontAwesomeIcon icon={faXTwitter} />}
                href={author.twitter}
                label="Twitter"
                className="text-[#000]"
              />
            )}
            {author.googleScholar && (
              <SocialIcon
                icon={<FontAwesomeIcon icon={faGoogle} />}
                href={author.googleScholar}
                label="Google Scholar"
                className="text-[#4285F4]"
              />
            )}
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <div className="min-w-0 sm:min-w-[600px] max-w-md sm:max-w-lg w-full mx-auto">
          <ProfileInformationForm
            onSubmit={handleProfileFormSubmit}
            submitLabel="Save Changes"
            loading={updateLoading}
          />
        </div>
      </BaseModal>
    </>
  );
}

export default function AuthorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isLoading: isUserLoading, error: userError } = useUser();
  const authorId = toNumberOrNull(resolvedParams.id);
  const [{ author: user, isLoading, error }, refetchAuthorInfo] = useAuthorInfo(authorId);

  return (
    <Card className="mt-4 bg-gray-50">
      {isLoading || isUserLoading ? (
        <AuthorProfileSkeleton />
      ) : error || userError ? (
        <AuthorProfileError error={error || userError?.message || 'Unknown error'} />
      ) : !user || !user.authorProfile ? (
        <AuthorProfileError error="Author not found" />
      ) : (
        <AuthorProfileView author={user.authorProfile} refetchAuthorInfo={refetchAuthorInfo} />
      )}
    </Card>
  );
}
