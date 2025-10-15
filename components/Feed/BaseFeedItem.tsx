'use client';

import { FC, ReactNode } from 'react';
import { FeedContentType, FeedEntry, mapFeedContentTypeToContentType } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { CardWrapper } from './CardWrapper';
import { cn } from '@/utils/styles';
import Image from 'next/image';
import { truncateText } from '@/utils/stringUtils';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';

// Base interfaces for the modular components
export interface BaseFeedItemProps {
  entry: FeedEntry;
  href?: string;
  className?: string;
  showActions?: boolean;
  showTooltips?: boolean;
  maxLength?: number;
  showHeader?: boolean;
  customActionText?: string;
  children?: ReactNode;
  onFeedItemClick?: () => void;
  showPeerReviews?: boolean;
}

// Badge component interface
export interface BadgeSectionProps {
  contentType: string;
  topics?: Array<{ name: string; slug?: string; imageUrl?: string }>;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

// Title component interface
export interface TitleSectionProps {
  title: string;
  className?: string;
}

// Content component interface
export interface ContentSectionProps {
  content: string;
  maxLength?: number;
  className?: string;
}

// Image component interface
export interface ImageSectionProps {
  imageUrl?: string;
  alt?: string;
  className?: string;
  aspectRatio?: '4/3' | '16/9' | '1/1';
}

// Metadata component interface
export interface MetadataSectionProps {
  children: ReactNode;
  className?: string;
}

// CTA component interface
export interface CTASectionProps {
  children: ReactNode;
  className?: string;
}

// Status component interface
export interface StatusSectionProps {
  status?: 'open' | 'closed' | 'expired' | 'active' | 'inactive';
  statusText?: string;
  className?: string;
}

// Subcomponents
export const BadgeSection: FC<BadgeSectionProps> = ({
  contentType,
  topics = [],
  className,
  onClick,
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2 mb-3', className)}>
      {/* Content type badge would be rendered here */}
      {topics.map((topic) => (
        <div
          key={topic.slug ?? topic.name}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(e);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onClick?.(e as any);
            }
          }}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
        >
          <TopicAndJournalBadge
            type="topic"
            name={topic.name}
            slug={topic.slug ?? topic.name}
            imageUrl={topic.imageUrl}
            disableLink={!topic.slug}
          />
        </div>
      ))}
    </div>
  );
};

export const TitleSection: FC<TitleSectionProps> = ({ title, className }) => {
  return (
    <h2
      className={cn(
        'text-md md:!text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors',
        className
      )}
    >
      {title}
    </h2>
  );
};

export const ContentSection: FC<ContentSectionProps> = ({
  content,
  maxLength = 200,
  className,
}) => {
  return (
    <div className={cn('text-sm text-gray-700', className)}>
      <p>{truncateText(content, maxLength)}</p>
    </div>
  );
};

export const ImageSection: FC<ImageSectionProps> = ({
  imageUrl,
  alt = 'Image',
  className,
  aspectRatio = '4/3',
}) => {
  if (!imageUrl) return null;

  const aspectClasses = {
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    '1/1': 'aspect-square',
  };

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden shadow-sm',
        aspectClasses[aspectRatio],
        className
      )}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 280px"
      />
    </div>
  );
};

export const MetadataSection: FC<MetadataSectionProps> = ({ children, className }) => {
  return <div className={cn('mb-3', className)}>{children}</div>;
};

export const CTASection: FC<CTASectionProps> = ({ children, className }) => {
  return <div className={cn('flex items-center gap-3', className)}>{children}</div>;
};

export const StatusSection: FC<StatusSectionProps> = ({ status, statusText, className }) => {
  if (!status) return null;

  const statusConfig = {
    open: { color: 'bg-emerald-500', textColor: 'text-emerald-700', text: 'Open' },
    closed: { color: 'bg-gray-400', textColor: 'text-gray-500', text: 'Closed' },
    expired: { color: 'bg-red-500', textColor: 'text-red-700', text: 'Expired' },
    active: { color: 'bg-blue-500', textColor: 'text-blue-700', text: 'Active' },
    inactive: { color: 'bg-gray-400', textColor: 'text-gray-500', text: 'Inactive' },
  };

  const config = statusConfig[status] ?? statusConfig.inactive;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className={cn('h-2 w-2 rounded-full', config.color)} />
      <span className={cn('text-sm font-medium', config.textColor)}>
        {statusText ?? config.text}
      </span>
    </div>
  );
};

// Main BaseFeedItem component
export const BaseFeedItem: FC<BaseFeedItemProps> = ({
  entry,
  href,
  className,
  showActions = true,
  showTooltips = true,
  maxLength,
  showHeader = true,
  customActionText,
  children,
  onFeedItemClick,
  showPeerReviews = true,
}) => {
  const content = entry.content;
  const author = content.createdBy;
  const isClickable = !!href;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      {showHeader && entry.timestamp && (
        <FeedItemHeader
          timestamp={entry.timestamp}
          author={author}
          actionText={customActionText ?? 'created'}
        />
      )}

      {/* Main Content Card */}
      <CardWrapper href={href} isClickable={isClickable} onClick={onFeedItemClick}>
        <div className="p-4">
          {children}

          {/* Action Buttons */}
          {showActions && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Action buttons container"
              >
                <FeedItemActions
                  metrics={entry.metrics}
                  feedContentType={
                    content.contentType ? (content.contentType as FeedContentType) : 'COMMENT'
                  }
                  votableEntityId={content.id}
                  relatedDocumentId={
                    'relatedDocumentId' in content
                      ? content.relatedDocumentId?.toString()
                      : content.id.toString()
                  }
                  relatedDocumentContentType={
                    'relatedDocumentContentType' in content
                      ? content.relatedDocumentContentType
                      : mapFeedContentTypeToContentType(content.contentType)
                  }
                  userVote={entry.userVote}
                  showTooltips={showTooltips}
                  href={href}
                  reviews={content.reviews}
                  bounties={content.bounties}
                  relatedDocumentTopics={'topics' in content ? content.topics : undefined}
                  relatedDocumentUnifiedDocumentId={
                    'unifiedDocumentId' in content ? content.unifiedDocumentId : undefined
                  }
                  showPeerReviews={showPeerReviews}
                />
              </div>
            </div>
          )}
        </div>
      </CardWrapper>
    </div>
  );
};

// Layout components for common patterns
export const FeedItemLayout: FC<{
  leftContent: ReactNode;
  rightContent?: ReactNode;
  className?: string;
}> = ({ leftContent, rightContent, className }) => {
  return (
    <div className={cn('flex justify-between items-start gap-4', className)}>
      <div className="flex-1 min-w-0">{leftContent}</div>
      {rightContent && (
        <div className="flex-shrink-0 w-[280px] max-w-[33%] hidden md:!block">{rightContent}</div>
      )}
    </div>
  );
};

export const FeedItemTopSection: FC<{
  leftContent: ReactNode;
  rightContent?: ReactNode;
  className?: string;
  imageSection?: ReactNode;
}> = ({ leftContent, rightContent, className, imageSection }) => {
  return (
    <>
      {imageSection && <div className="md:!hidden w-full mb-4">{imageSection}</div>}
      <div className={cn('flex items-start justify-between mb-3', className)}>
        <div className="flex flex-wrap gap-2">{leftContent}</div>
        {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
      </div>
    </>
  );
};
