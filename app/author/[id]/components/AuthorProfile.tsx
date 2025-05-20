'use client';

import React, { useId, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faGoogle, faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faBuildingColumns, faBirthdayCake, faPen } from '@fortawesome/pro-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { formatTimeAgo } from '@/utils/date';
import { BaseModal } from '@/components/ui/BaseModal';
import { AuthorProfile as AuthorProfileType } from '@/types/authorProfile';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import { useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import { useUser } from '@/contexts/UserContext';
import { ProfileInformationForm } from '@/components/Onboarding/ProfileInformationForm';
import { ProfileInformationFormValues } from '@/components/Onboarding/ProfileInformationForm/schema';
import { Icon } from '@/components/ui/icons/Icon';

type AuthorProfileProps = {
  author: AuthorProfileType;
  refetchAuthorInfo: () => Promise<void>;
};

const AuthorProfile: React.FC<AuthorProfileProps> = ({ author, refetchAuthorInfo }) => {
  const formId = useId();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user: currentUser, refreshUser } = useUser();
  const isOwnProfile = currentUser?.authorProfile?.id === author.id;
  const fullName = author.fullName;

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showAllEducations, setShowAllEducations] = useState(false);

  const description = author.description || '';
  const shouldTruncate = description.length > 300;
  const displayedDescription =
    shouldTruncate && !isDescriptionExpanded ? `${description.slice(0, 300)}...` : description;

  const educations = author.education ?? [];
  const primaryEducation = educations.find((e) => e.is_public);
  const otherEducations = educations.filter((e) => e.id !== primaryEducation?.id);
  const displayedEducations = showAllEducations
    ? [primaryEducation, ...otherEducations].filter(Boolean)
    : [primaryEducation, ...otherEducations].filter(Boolean).slice(0, 2);
  const remainingCount = educations.length - displayedEducations.length;

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
      <div className="flex flex-col sm:!flex-row gap-6">
        {/* Left column - Avatar */}
        <div className="flex-shrink-0 flex justify-between items-start">
          <Avatar
            src={author.profileImage}
            alt={fullName}
            size={128}
            showProfileCompletion={isOwnProfile}
            profileCompletionPercent={percent}
            showProfileCompletionNumber
            missing={missing}
            showTooltip
          />
          {isOwnProfile && (
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outlined"
              className="flex sm:!hidden items-center gap-2"
            >
              <Icon name="edit" className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Right column - Content */}
        <div className="flex flex-col flex-1 min-w-0 gap-4">
          {/* Header with name and edit button */}
          <div className="flex flex-col sm:!flex-row justify-between items-start gap-4">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                {currentUser?.isVerified && <VerifiedBadge />}
              </div>
              {author.headline && (
                <div className="text-gray-600 font-sm text-left">
                  <span>{author.headline}</span>
                </div>
              )}
            </div>
            {isOwnProfile && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outlined"
                className="hidden sm:!flex items-center gap-2"
              >
                <Icon name="edit" className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>

          <div>
            <div className="flex flex-col items-center sm:!items-start">
              {/* Render educations, separated by commas */}
              {educations.length > 0 && (
                <div className="flex items-baseline gap-2 text-gray-600">
                  <Icon name="education" className="h-5 w-5 self-start" />
                  <span className="inline">
                    {displayedEducations
                      .filter((edu) => edu !== undefined)
                      .map((edu, idx) => (
                        <span key={edu.id}>
                          {edu.summary
                            ? edu.summary
                            : `${edu.degree?.label || ''}${edu.major ? ` in ${edu.major}` : ''}${edu.year?.value ? ` '${edu.year.value.slice(2)}` : ''}${edu.name ? `, ${edu.name}` : ''}`}
                          {idx < displayedEducations.length - 1 && ', '}
                        </span>
                      ))}

                    {(remainingCount > 0 || showAllEducations) && (
                      <Button
                        variant="link"
                        size="sm"
                        className="ml-1 p-0 h-auto align-baseline text-base"
                        onClick={() => setShowAllEducations(!showAllEducations)}
                      >
                        {showAllEducations ? 'Show less' : `+${remainingCount} more`}
                      </Button>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Member since */}
            {currentUser?.createdDate && (
              <div className="flex items-baseline gap-2 text-gray-600">
                <Icon name="memberFor" className="h-5 w-5 self-start" />
                <span>Member for {formatTimeAgo(currentUser.createdDate, true)}</span>
              </div>
            )}
          </div>

          {/* Description with Show more/less */}
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

          {/* Social Links */}
          <div className="flex gap-2 justify-start">
            <SocialIcon
              icon={<FontAwesomeIcon icon={faLinkedin} className="h-6 w-6" />}
              href={author.linkedin}
              label="LinkedIn"
              className={
                author.linkedin ? '[&>svg]:text-[#0077B5] [&>svg]:hover:text-[#005582] pl-0' : ''
              }
            />
            <SocialIcon
              icon={<FontAwesomeIcon icon={faGoogle} className="h-6 w-6" />}
              href={author.googleScholar}
              label="Google Scholar"
              className={
                author.googleScholar ? '[&>svg]:text-[#4285F4] [&>svg]:hover:text-[#21429F]' : ''
              }
            />
            <SocialIcon
              icon={<FontAwesomeIcon icon={faOrcid} className="h-6 w-6" />}
              href={author.orcidId}
              label="ORCID"
              className={
                author.orcidId ? '[&>svg]:text-[#A6CE39] [&>svg]:hover:text-[#82A629]' : ''
              }
            />
            <SocialIcon
              icon={<FontAwesomeIcon icon={faXTwitter} className="h-6 w-6" />}
              href={author.twitter}
              label="Twitter"
              className={author.twitter ? '[&>svg]:text-[#000] [&>svg]:hover:text-[#000]' : ''}
            />
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        footer={
          <Button type="submit" form={formId} disabled={updateLoading} className="w-full">
            {updateLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      >
        <div className="min-w-0  max-w-md w-full mx-auto">
          <ProfileInformationForm onSubmit={handleProfileFormSubmit} formId={formId} />
        </div>
      </BaseModal>
    </>
  );
};

export default AuthorProfile;
