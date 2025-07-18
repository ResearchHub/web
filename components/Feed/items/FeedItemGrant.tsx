'use client';

import { FC } from 'react';
import { AuthorProfile, FeedEntry } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ContentSection,
  ImageSection,
  MetadataSection,
  CTASection,
  StatusSection,
  FeedItemLayout,
  FeedItemTopSection,
} from '@/components/Feed/BaseFeedItem';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Building, Calendar } from 'lucide-react';
import { differenceInCalendarDays, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/icons/Icon';

// Grant-specific content type that extends the feed entry structure
export interface FeedGrantContent {
  id: number;
  contentType: 'GRANT';
  createdDate: string;
  textPreview: string;
  slug: string;
  title: string;
  previewImage?: string;
  authors: any[];
  topics: any[];
  createdBy: any;
  bounties?: any[];
  reviews?: any[];
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
  organization?: string;
  grantAmount?: {
    amount: number;
    currency: string;
    formatted: string;
  };
  isExpired?: boolean;
}

interface FeedItemGrantRefactoredProps {
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
 * Refactored Grant Feed Item using BaseFeedItem
 */
export const FeedItemGrant: FC<FeedItemGrantRefactoredProps> = ({
  entry,
  href,
  className,
  showActions = true,
  showTooltips = true,
  customActionText,
  maxLength,
  showHeader = true,
}) => {
  const grant = entry.content as FeedGrantContent;
  const router = useRouter();

  // Calculate status and deadline
  const isOpen = grant.grant?.status === 'OPEN' && !grant.grant?.isExpired;
  const deadline = grant.grant?.endDate;
  const daysLeft = deadline ? differenceInCalendarDays(new Date(deadline), new Date()) : null;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

  // Prepare applicants data
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
    router.push(`/grant/${grant.id}/${grant.slug}`);
  };

  // Use provided href or create default grant page URL
  const grantPageUrl = href || `/grant/${grant.id}/${grant.slug}`;

  return (
    <BaseFeedItem
      entry={entry}
      href={grantPageUrl}
      className={className}
      showActions={showActions}
      showTooltips={showTooltips}
      customActionText={customActionText ?? 'opened a grant'}
      maxLength={maxLength}
      showHeader={showHeader}
    >
      {/* Top section with badges and status + image(mobile) */}
      <FeedItemTopSection
        imageSection={
          grant.previewImage && (
            <ImageSection
              imageUrl={grant.previewImage}
              alt={grant.title || 'Grant image'}
              aspectRatio="16/9"
            />
          )
        }
        leftContent={
          <>
            <ContentTypeBadge type="grant" />
            {grant.topics?.map((topic, index) => (
              <TopicAndJournalBadge
                key={index}
                type="topic"
                name={topic.name}
                slug={topic.slug || topic.name.toLowerCase().replace(/\s+/g, '-')}
              />
            ))}
          </>
        }
        rightContent={
          <StatusSection
            status={isOpen ? 'open' : 'closed'}
            statusText={isOpen ? 'Open' : 'Closed'}
          />
        }
      />

      {/* Main content layout + image(desktop) */}
      <FeedItemLayout
        leftContent={
          <>
            {/* Title */}
            <TitleSection title={grant.title} />

            {/* Description */}
            {grant.grant?.description && (
              <ContentSection
                content={grant.grant.description}
                maxLength={maxLength}
                className="mb-3"
              />
            )}

            {/* Funding Amount */}
            {(grant.grantAmount || grant.grant?.amount) && (
              <MetadataSection>
                <div className="flex flex-wrap items-baseline gap-1 mb-3">
                  <div className="font-semibold text-2xl text-orange-500 flex items-center gap-1">
                    <span className="text-sm text-orange-500 self-center">$</span>
                    {(grant.grant?.amount?.usd || 0).toLocaleString()}
                  </div>
                </div>
              </MetadataSection>
            )}

            {/* Organization */}
            {(grant.organization || grant.grant?.organization) && (
              <MetadataSection>
                <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
                  <Building className="w-4 h-4" />
                  <span>{grant.organization || grant.grant?.organization}</span>
                </div>
              </MetadataSection>
            )}

            {/* Deadline */}
            {deadline && isOpen && (
              <MetadataSection>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className={isExpiringSoon ? 'text-amber-600' : 'text-gray-500'}>
                    Apply by: {format(new Date(deadline), 'MMM d, yyyy')}
                  </span>
                </div>
              </MetadataSection>
            )}

            {/* Applicants */}
            {applicants.length > 0 && (
              <MetadataSection>
                <div className="flex items-center gap-2 mb-4">
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
              </MetadataSection>
            )}

            {/* CTA */}
            {isOpen && (
              <CTASection>
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
              </CTASection>
            )}
          </>
        }
        rightContent={
          grant.previewImage && (
            <ImageSection
              imageUrl={grant.previewImage}
              alt={grant.title || 'Grant image'}
              aspectRatio="4/3"
            />
          )
        }
      />
    </BaseFeedItem>
  );
};
