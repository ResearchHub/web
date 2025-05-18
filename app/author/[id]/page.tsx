'use client';

import { use, useId, useTransition } from 'react';
import { ProfileInformationForm } from '@/components/Onboarding/ProfileInformationForm';
import { ProfileInformationFormValues } from '@/components/Onboarding/ProfileInformationForm/schema';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  useAuthorAchievements,
  useAuthorInfo,
  useAuthorSummaryStats,
  useUpdateAuthorProfileData,
} from '@/hooks/useAuthor';
import { useUser } from '@/contexts/UserContext';
import { Avatar } from '@/components/ui/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faGoogle } from '@fortawesome/free-brands-svg-icons';
import {
  faGraduationCap,
  faBuildingColumns,
  faBirthdayCake,
  faPen,
} from '@fortawesome/pro-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Card } from '@/components/ui/Card';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { formatTimeAgo } from '@/utils/date';
import { BaseModal } from '@/components/ui/BaseModal';
import { AuthorProfile } from '@/types/authorProfile';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { useContributions } from '@/hooks/useContributions';
import { ContributionType } from '@/services/contribution.service';
import { transformContributionToFeedEntry } from '@/types/contribution';
import { FeedContent } from '@/components/Feed/FeedContent';
import AuthorHeaderAchievements from './components/AuthorHeaderAchievements';
import AuthorHeaderKeyStats from './components/AuthorHeaderKeyStats';

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

function AuthorProfileCard({
  author,
  refetchAuthorInfo,
}: {
  author: AuthorProfile;
  refetchAuthorInfo: () => Promise<void>;
}) {
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

  // Get all educations, primary first
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
        <div className="flex-shrink-0 flex justify-center sm:!justify-start">
          <Avatar
            src={author.profileImage}
            alt={fullName}
            size={120}
            showProfileCompletion={isOwnProfile}
            profileCompletionPercent={percent}
            showProfileCompletionNumber
            missing={missing}
            showTooltip
          />
        </div>

        {/* Right column - Content */}
        <div className="flex flex-col flex-1 min-w-0 gap-4">
          {/* Header with name and edit button */}
          <div className="flex flex-col sm:!flex-row justify-between items-center sm:!items-start gap-4">
            <div className="flex flex-col items-center sm:!items-start">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                {currentUser?.isVerified && <VerifiedBadge />}
              </div>
              {author.headline && (
                <div className="flex items-center gap-2 text-gray-600 font-sm text-left">
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

          <div className="flex flex-col items-center sm:!items-start">
            {/* Render educations, separated by commas */}
            {educations.length > 0 && (
              <div className="flex items-baseline gap-2 text-gray-600">
                <FontAwesomeIcon
                  icon={faBuildingColumns}
                  className="h-4 w-4 relative bottom-[-2px]"
                />
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
                      className="ml-1 p-0 h-auto align-baseline"
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
              <FontAwesomeIcon icon={faBirthdayCake} className="h-4 w-4 relative bottom-[-2px]" />
              <span>Member for {formatTimeAgo(currentUser.createdDate, true)}</span>
            </div>
          )}

          {/* Description with Show more/less */}
          {description && (
            <div className="text-justify">
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
          <div className="flex gap-2 justify-center sm:!justify-start">
            <SocialIcon
              icon={<FontAwesomeIcon icon={faGraduationCap} />}
              href={author.orcidId}
              label="ORCID"
              className={
                author.orcidId ? '[&>svg]:text-[#A6CE39] [&>svg]:hover:text-[#82A629]' : ''
              }
            />
            <SocialIcon
              icon={<FontAwesomeIcon icon={faLinkedin} />}
              href={author.linkedin}
              label="LinkedIn"
              className={
                author.linkedin ? '[&>svg]:text-[#0077B5] [&>svg]:hover:text-[#005582]' : ''
              }
            />
            <SocialIcon
              icon={<FontAwesomeIcon icon={faXTwitter} />}
              href={author.twitter}
              label="Twitter"
              className={author.twitter ? '[&>svg]:text-[#000] [&>svg]:hover:text-[#000]' : ''}
            />
            <SocialIcon
              icon={<FontAwesomeIcon icon={faGoogle} />}
              href={author.googleScholar}
              label="Google Scholar"
              className={
                author.googleScholar ? '[&>svg]:text-[#4285F4] [&>svg]:hover:text-[#21429F]' : ''
              }
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
}

// Add this mapping at the component level
const TAB_TO_CONTRIBUTION_TYPE: Record<string, ContributionType> = {
  contributions: 'ALL',
  publications: 'ARTICLE',
  'peer-reviews': 'REVIEW',
  comments: 'CONVERSATION',
  bounties: 'BOUNTY',
};

function AuthorTabs({ authorId }: { authorId: number }) {
  const [isPending, startTransition] = useTransition();
  const tabs = [
    { id: 'contributions', label: 'Contributions' },
    { id: 'publications', label: 'Publications' },
    { id: 'peer-reviews', label: 'Peer Reviews' },
    { id: 'comments', label: 'Comments' },
    { id: 'bounties', label: 'Bounties' },
  ];

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'contributions';

  // Get the contribution type based on the current tab
  const contributionType = TAB_TO_CONTRIBUTION_TYPE[currentTab] || 'ALL';

  const { contributions, isLoading, error, hasMore, loadMore, isLoadingMore } = useContributions({
    contribution_type: contributionType,
    author_id: authorId,
  });

  const handleTabChange = (tabId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set('tab', tabId);
      router.replace(`/author/${authorId}?${params.toString()}`, { scroll: false });
    });
  };

  const renderTabContent = () => {
    if (error) {
      return <div>Error: {error.message}</div>;
    }

    let formattedContributions = contributions.map((contribution) =>
      transformContributionToFeedEntry(contribution)
    );

    return (
      <div>
        <FeedContent
          entries={isPending ? [] : formattedContributions}
          isLoading={isLoading || isPending}
          hasMore={hasMore}
          loadMore={loadMore}
          showBountyFooter={false}
          hideActions={true}
          isLoadingMore={isLoadingMore}
          showBountySupportAndCTAButtons={false}
          showBountyDeadline={false}
        />
      </div>
    );
  };

  return (
    <div className="mt-8">
      <Tabs tabs={tabs} activeTab={currentTab} onTabChange={handleTabChange} variant="underline" />
      <div className="mt-6">{renderTabContent()}</div>
    </div>
  );
}

export default function AuthorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isLoading: isUserLoading, error: userError } = useUser();
  const authorId = toNumberOrNull(resolvedParams.id);
  const [{ author: user, isLoading, error }, refetchAuthorInfo] = useAuthorInfo(authorId);
  const [{ achievements, isLoading: isAchievementsLoading, error: achievementsError }] =
    useAuthorAchievements(authorId);
  const [{ summaryStats, isLoading: isSummaryStatsLoading, error: summaryStatsError }] =
    useAuthorSummaryStats(authorId);

  if (isLoading || isUserLoading) {
    return (
      <Card className="mt-4 bg-gray-50">
        <AuthorProfileSkeleton />
      </Card>
    );
  }

  if (error || userError) {
    return <AuthorProfileError error={error || userError?.message || 'Unknown error'} />;
  }

  if (!user || !user.authorProfile) {
    return <AuthorProfileError error="Author not found" />;
  }

  return (
    <>
      <Card className="mt-4 bg-gray-50">
        <AuthorProfileCard author={user.authorProfile} refetchAuthorInfo={refetchAuthorInfo} />
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="mt-4 bg-gray-50">
          <h3 className="text-base font-base uppercase text-gray-500 mb-3">Achievements</h3>
          <AuthorHeaderAchievements achievements={achievements} />
        </Card>
        {summaryStats && (
          <Card className="mt-4 bg-gray-50">
            <h3 className="text-base font-base uppercase text-gray-500 mb-3">Key Stats</h3>
            <AuthorHeaderKeyStats summaryStats={summaryStats} profile={user} />
          </Card>
        )}
      </div>
      <AuthorTabs authorId={user.authorProfile.id} />
    </>
  );
}
