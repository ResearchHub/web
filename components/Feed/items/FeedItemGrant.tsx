'use client';

import { FC } from 'react';
import { AuthorProfile, FeedEntry } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { cn } from '@/utils/styles';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useRouter } from 'next/navigation';
import { Users, Building, Calendar } from 'lucide-react';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { differenceInCalendarDays, format } from 'date-fns';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { truncateText } from '@/utils/stringUtils';
import Icon from '@/components/ui/icons/Icon';
import Image from 'next/image';
import Link from 'next/link';
import { CardWrapper } from './CardWrapper';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

// Grant-specific content type that extends the feed entry structure
export interface FeedGrantContent {
  id: number;
  contentType: 'GRANT';
  createdDate: string;
  textPreview: string;
  slug: string;
  title: string;
  previewImage?: string;
  authors: any[]; // AuthorProfile[]
  topics: any[]; // Topic[]
  createdBy: any; // AuthorProfile
  bounties?: any[]; // Bounty[]
  reviews?: any[]; // Review[]
  grant: {
    id: number;
    amount: {
      usd: number;
      rsc: number;
      formatted: string;
    };
    organization: string;
    description: string;
    status: 'OPEN' | 'CLOSED';
    startDate: string;
    endDate: string;
    isExpired: boolean;
    isActive: boolean;
    currency: string;
    createdBy: any; // User
    applicants: AuthorProfile[];
  };
  organization?: string; // Organization name from the root level
  grantAmount?: {
    amount: number;
    currency: string;
    formatted: string;
  };
  isExpired?: boolean;
}

interface FeedItemGrantProps {
  entry: FeedEntry;
  href?: string;
  className?: string;
  showActions?: boolean;
  showTooltips?: boolean;
  customActionText?: string;
  maxLength?: number;
  showHeader?: boolean;
}

/**
 * Component for rendering the body content of a grant feed item
 */
const FeedItemGrantBody: FC<{
  entry: FeedEntry;
  imageUrl?: string;
  maxLength?: number;
}> = ({ entry, imageUrl, maxLength = 150 }) => {
  // Extract the grant from the entry's content
  const grant = entry.content as FeedGrantContent;
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();

  // Get topics/tags for display
  const topics = grant.topics || [];

  const isOpen = grant.grant?.status === 'OPEN' && !grant.grant?.isExpired;

  // Calculate days until deadline
  const deadline = grant.grant?.endDate;
  const daysLeft = deadline ? differenceInCalendarDays(new Date(deadline), new Date()) : null;

  // Determine status
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

  // Get applicants and prepare avatar data
  const applicants = grant.grant?.applicants || [];
  const applicantAvatars = applicants.map((applicant) => ({
    src: applicant.profileImage,
    alt:
      applicant.firstName && applicant.lastName
        ? `${applicant.firstName} ${applicant.lastName}`
        : applicant.firstName || 'Applicant',
    fallback: applicant.firstName ? applicant.firstName.charAt(0) : 'A',
  }));

  // Handle apply button click
  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to grant application page
    router.push(`/grant/${grant.id}/${grant.slug}`);
  };

  return (
    <div>
      {/* Header with badges and status */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex flex-wrap gap-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <ContentTypeBadge type="grant" />
          {topics.map((topic, index) => (
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

      {/* Content area with image */}
      <div className="flex justify-between items-start gap-4">
        {/* Left side content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
            {grant.title}
          </h2>

          {/* Grant Description */}
          {grant.grant?.description && (
            <div className="text-sm text-gray-700 mb-3">
              <p>{truncateText(grant.grant.description, maxLength)}</p>
            </div>
          )}

          {/* Funding Amount */}
          {(grant.grantAmount || grant.grant?.amount) && (
            <div className="flex flex-wrap items-baseline gap-1 mb-3">
              <CurrencyBadge
                amount={grant.grantAmount?.amount || grant.grant?.amount?.usd || 0}
                currency={showUSD ? 'USD' : 'RSC'}
                variant="text"
                showText={showUSD}
                showIcon={true}
                className="font-semibold text-2xl text-gray-900"
                shorten={false}
                iconSize={18}
              />
            </div>
          )}

          {/* Organization */}
          {(grant.organization || grant.grant?.organization) && (
            <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
              <Building className="w-4 h-4" />
              <span>{grant.organization || grant.grant?.organization}</span>
            </div>
          )}

          {/* Deadline */}
          {deadline && isOpen && (
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span
                className={cn(
                  'text-sm font-normal',
                  isExpiringSoon ? 'text-amber-600' : 'text-gray-500'
                )}
              >
                Apply by: {format(new Date(deadline), 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {/* Applicants section */}
          {applicants.length > 0 && (
            <div
              className="flex items-center gap-2 mb-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Icon name="createBounty" size={16} color="#6b7280" className="flex-shrink-0" />
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

          {/* Apply CTA Button */}
          {isOpen && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleApplyClick}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center gap-2"
              >
                Apply
              </button>
              {isExpiringSoon && daysLeft !== null && (
                <span className="text-sm text-amber-600 font-medium">
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                </span>
              )}
            </div>
          )}
        </div>

        {/* Image - Positioned to the right, aligned with title */}
        {imageUrl && (
          <div className="flex-shrink-0 w-[280px] max-w-[33%] hidden md:!block">
            <div className="aspect-[4/3] relative rounded-lg overflow-hidden shadow-sm">
              <Image
                src={imageUrl}
                alt={grant.title || 'Grant image'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 280px"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main component for rendering a grant feed item
 */
export const FeedItemGrant: FC<FeedItemGrantProps> = ({
  entry,
  href,
  className,
  showActions = true,
  showTooltips = true,
  customActionText,
  maxLength,
  showHeader = true,
}) => {
  // Extract the grant from the entry's content
  const grant = entry.content as FeedGrantContent;

  // Get the author from the grant
  const author = grant.createdBy;

  // Use provided href or create default grant page URL
  const grantPageUrl = href || `/grant/${grant.id}/${grant.slug}`;

  // Determine if card should have clickable styles
  const isClickable = !!href;

  // Image URL
  const imageUrl = grant.previewImage || undefined;

  // Mobile image display (for small screens only)
  const MobileImage = () => {
    if (!imageUrl) return null;

    return (
      <div className="md:!hidden w-full mb-4">
        <div className="aspect-[16/9] relative rounded-lg overflow-hidden shadow-sm">
          <Image
            src={imageUrl}
            alt={grant.title || 'Grant image'}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      {showHeader && (
        <FeedItemHeader
          timestamp={grant.createdDate}
          author={author}
          actionText={customActionText || 'opened a grant'}
        />
      )}

      {/* Main Content Card */}
      <CardWrapper href={grantPageUrl} isClickable={isClickable}>
        <div className="p-4">
          {/* Mobile image (shown only on small screens) */}
          <MobileImage />

          {/* Body Content with desktop image integrated */}
          <FeedItemGrantBody entry={entry} imageUrl={imageUrl} maxLength={maxLength} />

          {/* Action Buttons */}
          {showActions && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <FeedItemActions
                  metrics={entry.metrics}
                  feedContentType="GRANT"
                  votableEntityId={grant.id}
                  userVote={entry.userVote}
                  showTooltips={showTooltips}
                  href={grantPageUrl}
                  reviews={grant.reviews}
                  bounties={grant.bounties}
                />
              </div>
            </div>
          )}
        </div>
      </CardWrapper>
    </div>
  );
};
