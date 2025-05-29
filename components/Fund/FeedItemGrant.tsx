'use client';

import { FC } from 'react';
import { GrantWithMetadata, GrantApplicant } from '@/store/grantStore';
import { cn } from '@/utils/styles';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useRouter } from 'next/navigation';
import { Users, Building, Calendar, MapPin } from 'lucide-react';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { differenceInCalendarDays, format } from 'date-fns';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie } from '@fortawesome/free-solid-svg-icons';
import { FeedContentType } from '@/types/feed';

interface FeedItemGrantProps {
  grant: GrantWithMetadata;
  href?: string;
  className?: string;
  showActions?: boolean;
  showTooltips?: boolean;
  customActionText?: string;
}

export const FeedItemGrant: FC<FeedItemGrantProps> = ({
  grant,
  href,
  className,
  showActions = true,
  showTooltips = true,
  customActionText,
}) => {
  const router = useRouter();
  const { work, metadata } = grant;

  // Get funding organization from note
  const organization = work.note?.organization?.name;

  // Calculate days until deadline
  const deadline = metadata.fundraising?.endDate;
  const daysLeft = deadline ? differenceInCalendarDays(new Date(deadline), new Date()) : null;

  // Determine status
  const isOpen = metadata.fundraising?.status === 'OPEN';
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

  // Use provided href or create default grant page URL
  const grantPageUrl = href || `/grant/${work.id}/${work.slug}`;

  // Handle click on the card
  const handleCardClick = () => {
    router.push(grantPageUrl);
  };

  // Get applicants and convert to AvatarStack format
  const applicants = ((work as any).applicants as GrantApplicant[]) || [];
  const applicantAvatars = applicants.map((applicant) => ({
    src: applicant.profileImage || '/images/default-avatar.png',
    alt: applicant.fullName,
    tooltip: applicant.fullName,
    authorId: applicant.id,
  }));

  // Create metrics object for FeedItemActions
  const actionMetrics = {
    votes: metadata.metrics?.votes || 0,
    comments: metadata.metrics?.comments || 0,
    reviewScore: metadata.metrics?.reviewScore || 0,
  };

  // Get the author (use first author or created by)
  const author = work.authors?.[0]?.authorProfile;

  // Convert applicants to contributors format for header
  const contributors = applicants.map((applicant) => ({
    profileImage: applicant.profileImage,
    fullName: applicant.fullName,
    profileUrl: applicant.profileUrl,
    authorId: applicant.id,
  }));

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <FeedItemHeader
        timestamp={work.createdDate}
        author={author}
        actionText={customActionText || 'is seeking applicants for'}
        contributors={contributors}
        contributorsLabel="Grant Applicants"
        work={work}
        hideAuthorBadge={true}
      />

      {/* Main Content Card */}
      <div
        onClick={handleCardClick}
        className={cn(
          'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
          'group hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer'
        )}
      >
        <div className="p-6">
          {/* Header with badges and status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <ContentTypeBadge type="grant" />
              {work.topics?.map((topic, index) => (
                <TopicAndJournalBadge
                  key={index}
                  type="topic"
                  name={topic.name}
                  slug={topic.slug || topic.name.toLowerCase().replace(/\s+/g, '-')}
                />
              ))}
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2">
              {isOpen && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-emerald-700 font-medium">Open</span>
                </div>
              )}
              {!isOpen && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  <span className="text-sm text-gray-500">Closed</span>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
            {work.title}
          </h2>

          {/* Short Description */}
          {(work as any).shortDescription && (
            <p className="text-gray-700 mb-4 leading-relaxed">{(work as any).shortDescription}</p>
          )}

          {/* Grant Details */}
          <div className="space-y-3">
            {/* Funding Amount */}
            {metadata.fundraising?.goalAmount && (
              <div className="flex items-center gap-3">
                <CurrencyBadge
                  amount={metadata.fundraising.goalAmount.usd}
                  currency="USD"
                  variant="text"
                  showText={true}
                  showIcon={true}
                  textColor="text-gray-900"
                  className="font-semibold text-2xl"
                  shorten={false}
                />
              </div>
            )}

            {/* Organization */}
            {organization && (
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-500 font-normal">{organization}</span>
              </div>
            )}

            {/* Deadline */}
            {deadline && isOpen && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span
                  className={cn(
                    'text-sm font-normal',
                    isExpiringSoon ? 'text-amber-600' : 'text-gray-500'
                  )}
                >
                  {daysLeft !== null && daysLeft > 0 ? (
                    <>{daysLeft === 1 ? '1 day' : `${daysLeft} days`} left to apply</>
                  ) : (
                    `Deadline: ${format(new Date(deadline), 'MMM d, yyyy')}`
                  )}
                </span>
              </div>
            )}

            {/* Applicants section - moved below deadline */}
            {applicants.length > 0 && (
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <FontAwesomeIcon icon={faUserTie} className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-normal">
                    {applicants.length} {applicants.length === 1 ? 'Applicant' : 'Applicants'}
                  </span>
                  <AvatarStack
                    items={applicantAvatars}
                    size="xxs"
                    maxItems={5}
                    spacing={-4}
                    showExtraCount={true}
                    extraCountLabel="Applicants"
                    allItems={applicantAvatars}
                    totalItemsCount={applicants.length}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div onClick={(e) => e.stopPropagation()}>
                <FeedItemActions
                  metrics={actionMetrics}
                  feedContentType={'POST' as FeedContentType}
                  votableEntityId={work.id}
                  showTooltips={showTooltips}
                  href={grantPageUrl}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
