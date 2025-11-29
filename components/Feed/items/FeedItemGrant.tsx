'use client';

import { FC } from 'react';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ContentSection,
  ImageSection,
  MetadataSection,
  FeedItemLayout,
  FeedItemTopSection,
} from '@/components/Feed/BaseFeedItem';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import { Building, Users } from 'lucide-react';
import { GrantInfo } from '@/components/Grant/GrantInfo';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';

import { Highlight } from '@/components/Feed/FeedEntryItem';
import { formatTimestamp } from '@/utils/date';

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
  highlights?: Highlight[];
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
  highlights,
}) => {
  const grant = entry.content as FeedGrantContent;

  // Extract highlighted fields from highlights prop
  const highlightedTitle = highlights?.find((h) => h.field === 'title')?.value;
  const highlightedSnippet = highlights?.find((h) => h.field === 'snippet')?.value;

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
            {showHeader && <ContentTypeBadge type="grant" />}
            {grant.topics?.map((topic) => (
              <TopicAndJournalBadge
                key={topic.id || topic.slug}
                name={topic.name}
                slug={topic.slug}
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
            <TitleSection title={grant.title} highlightedTitle={highlightedTitle} />

            {/* Organization */}
            {(grant.organization || grant.grant?.organization) && (
              <MetadataSection>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Building className="w-4 h-4" />
                  <span>{grant.organization || grant.grant?.organization}</span>
                </div>
              </MetadataSection>
            )}

            {/* Authors list */}
            {grant.authors.length > 0 && (
              <MetadataSection>
                <div className="flex items-start gap-1.5">
                  <Users className="w-4 h-4 text-gray-500" />
                  <AuthorList
                    authors={grant.authors.map((author) => ({
                      name: author.fullName,
                      verified: author.user?.isVerified,
                      authorUrl: author.id === 0 ? undefined : author.profileUrl,
                    }))}
                    size="sm"
                    className="text-gray-500 font-normal text-sm"
                    delimiter="•"
                    timestamp={grant.createdDate ? formatTimestamp(grant.createdDate) : undefined}
                  />
                </div>
              </MetadataSection>
            )}

            {/* Description */}
            {(grant.grant?.description || grant.textPreview) && (
              <ContentSection
                content={grant.grant?.description || grant.textPreview}
                highlightedContent={highlightedSnippet}
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
      {/* Grant Info */}
      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
        <GrantInfo grant={grant} onFeedItemClick={onFeedItemClick} />
      </div>
    </BaseFeedItem>
  );
};
