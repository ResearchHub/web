'use client';

import { use } from 'react';
import { ProfileInformationForm } from '@/components/Onboarding/ProfileInformationForm';
import { ProfileInformationFormValues } from '@/components/Onboarding/ProfileInformationForm/schema';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuthorInfo, useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import { User } from '@/types/user';
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

function toNumberOrNull(value: any): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function AuthorProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="h-9 bg-gray-200 rounded w-48 mb-3" /> {/* Title placeholder */}
          <div className="h-5 bg-gray-200 rounded w-64" /> {/* Headline placeholder */}
        </div>
        <div className="w-28 h-10 bg-gray-200 rounded" /> {/* Button placeholder */}
      </div>

      {/* Profile content */}
      <div className="flex items-start gap-8">
        {/* Avatar skeleton */}
        <div className="w-28 h-28 bg-gray-200 rounded-full flex-shrink-0" />

        {/* Profile info skeleton */}
        <div className="flex-1">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
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

function AuthorProfileView({ author }: { author: AuthorProfile }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user: currentUser } = useUser();
  const isOwnProfile = currentUser?.authorProfile?.id === author.id;
  const fullName = author.fullName;

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const description = author.description || '';
  const shouldTruncate = description.length > 300;
  const displayedDescription =
    shouldTruncate && !isDescriptionExpanded ? `${description.slice(0, 300)}...` : description;

  const primaryEducation = (author.education || []).find((e) => e.is_public);

  const [{ isLoading: updateLoading }, updateAuthorProfileData] = useUpdateAuthorProfileData();

  const handleProfileFormSubmit = async (data: ProfileInformationFormValues) => {
    if (author.id) {
      toast.error('User information not available. Cannot save profile.');
      return false;
    }

    try {
      await updateAuthorProfileData(author.id, {
        ...data,
        education: data.education.length > 0 ? data.education : undefined,
        description: data.description || undefined,
        headline: data.headline || undefined,
        linkedin: data.linkedin || undefined,
        orcid_id: data.orcid_id || undefined,
        twitter: data.twitter || undefined,
        google_scholar: data.google_scholar || undefined,
      });
      toast.success('Profile updated successfully');
      setIsEditModalOpen(false);
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
            className="ring-4 ring-white"
          />
        </div>

        {/* Right column - Content */}
        <div className="flex flex-col flex-1 min-w-0 gap-4">
          {/* Header with name and edit button */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                <VerifiedBadge />
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
  const [{ author: user, isLoading, error }] = useAuthorInfo(authorId);

  if (isLoading || isUserLoading) return <AuthorProfileSkeleton />;
  if (error || userError)
    return <AuthorProfileError error={error || userError?.message || 'Unknown error'} />;
  if (!user || !user.authorProfile) return <AuthorProfileError error="Author not found" />;

  return (
    <Card className="mt-4 bg-gray-50">
      <AuthorProfileView author={user.authorProfile} />
    </Card>
  );
}
