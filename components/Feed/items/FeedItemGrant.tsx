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
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/icons/Icon';
import { formatDeadline, isDeadlineInFuture } from '@/utils/date';
import { isExpiringSoon } from '@/components/Bounty/lib/bountyUtil';
import { RFPInfo } from '@/components/Grant/GrantInfo';

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
  onFeedItemClick?: () => void;
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
  onFeedItemClick,
}) => {
  const grant = entry.content as FeedGrantContent;
  const router = useRouter();

  // Check if RFP is active
  const isActive =
    grant.grant?.status === 'OPEN' &&
    (grant.grant?.endDate ? isDeadlineInFuture(grant.grant?.endDate) : true);
  const deadline = grant.grant?.endDate;
  const expiringSoon = isExpiringSoon(deadline, 1); // Use 1-day threshold for grants

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
      customActionText={customActionText ?? 'opened an RFP'}
      maxLength={maxLength}
      showHeader={showHeader}
      onFeedItemClick={onFeedItemClick}
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
            {/* <ContentTypeBadge type="grant" /> */}
            {grant.topics?.map((topic) => (
              <TopicAndJournalBadge
                key={topic.id || topic.slug}
                type="topic"
                name={topic.name}
                slug={topic.slug}
                imageUrl={topic.imageUrl}
              />
            ))}
          </>
        }
      />

      {/* Main content layout + image(desktop) */}
      <FeedItemLayout
        leftContent={
          <>
            {/* Title */}
            <TitleSection title={grant.title} />

            {/* Organization */}
            {(grant.organization || grant.grant?.organization) && (
              <MetadataSection>
                <div className="flex items-center gap-1.5 text-sm mb-3 text-gray-500">
                  <Building className="w-4 h-4" />
                  <span>{grant.organization || grant.grant?.organization}</span>
                </div>
              </MetadataSection>
            )}

            {/* Description */}
            {grant.grant?.description && (
              <ContentSection
                content={grant.grant.description}
                maxLength={maxLength}
                className="mb-3"
              />
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
      {/* RFP Info */}
      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
        <RFPInfo grant={grant} className="p-0 border-0 bg-transparent" />
      </div>
    </BaseFeedItem>
  );
};
