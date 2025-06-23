'use client';

import { FC } from 'react';
import { ExternalLink, Users, Calendar, Building } from 'lucide-react';
import { FlaggedContent } from '@/services/audit.service';
import {
  getFlaggedContentOffendingUser,
  getStructuredAuditContent,
  generateAuditContentUrl,
} from './utils/auditUtils';
import { formatTimestamp } from '@/utils/date';
import { Tooltip } from '@/components/ui/Tooltip';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { AuthorList } from '@/components/ui/AuthorList';
import { truncateText } from '@/utils/stringUtils';
import { TopicAndJournalBadge } from '@/components/ui/TopicAndJournalBadge';
import Image from 'next/image';
import { ModerationMetadata } from './ModerationMetadata';
import { ModerationActions } from './ModerationActions';

interface AuditItemPostProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  view?: 'pending' | 'dismissed' | 'removed';
}

export const AuditItemPost: FC<AuditItemPostProps> = ({ entry, onAction, view = 'pending' }) => {
  const offendingUser = getFlaggedContentOffendingUser(entry);
  const structuredContent = getStructuredAuditContent(entry);
  const verdict = entry.verdict;
  const contentUrl = generateAuditContentUrl(entry);

  if (structuredContent.type !== 'post') {
    return null;
  }

  // Convert authors to the format expected by AuthorList
  const authors = structuredContent.authors.map((author: any) => ({
    name: author.fullName || `${author.firstName || ''} ${author.lastName || ''}`.trim(),
    verified: author.user?.isVerified,
    profileUrl: author.profileUrl,
  }));

  // Determine content type badge
  const getContentTypeBadge = () => {
    if (structuredContent.fundraise) {
      return 'funding';
    }
    // Default to article for posts
    return 'article';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Header with content type */}
      <div className="flex items-center gap-2 mb-3">
        <ContentTypeBadge type={getContentTypeBadge() as any} />
        {structuredContent.postType && (
          <div className="text-sm text-gray-600 font-medium">{structuredContent.postType}</div>
        )}
      </div>

      {/* Post title */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {structuredContent.title || 'Untitled Post'}
          {contentUrl && (
            <a
              href={contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-800 inline-flex"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </h3>
      </div>

      {/* Authors */}
      {authors.length > 0 && (
        <div className="mb-3 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-gray-500" />
          <AuthorList
            authors={authors}
            size="sm"
            className="text-gray-600 font-normal"
            delimiter="•"
            showAbbreviatedInMobile={true}
          />
        </div>
      )}

      {/* Institution */}
      {structuredContent.institution && (
        <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
          <Building className="w-4 h-4" />
          <span>{structuredContent.institution}</span>
        </div>
      )}

      {/* Creation date */}
      {structuredContent.createdDate && (
        <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>
            Created:{' '}
            <Tooltip content={new Date(structuredContent.createdDate).toLocaleString()}>
              <span className="cursor-default">
                {formatTimestamp(structuredContent.createdDate)}
              </span>
            </Tooltip>
          </span>
        </div>
      )}

      {/* Topics */}
      {structuredContent.topics && structuredContent.topics.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {structuredContent.topics.slice(0, 3).map((topic: any, index: number) => (
            <TopicAndJournalBadge
              key={index}
              type="topic"
              name={topic.name}
              slug={topic.slug || ''}
              imageUrl={topic.imageUrl}
            />
          ))}
          {structuredContent.topics.length > 3 && (
            <span className="text-sm text-gray-500">
              +{structuredContent.topics.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Content area with optional preview image */}
      <div className="mb-3">
        {structuredContent.previewImage && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <Image
              src={structuredContent.previewImage}
              alt="Post preview"
              width={400}
              height={200}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Post content */}
        {structuredContent.content && (
          <div className="p-3 bg-gray-50 rounded border-l-2 border-blue-300">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {truncateText(structuredContent.content, 400)}
            </p>
          </div>
        )}
      </div>

      {/* Fundraise info */}
      {structuredContent.fundraise && (
        <div className="mb-3 p-3 bg-green-50 rounded border border-green-200">
          <div className="text-sm text-green-800 font-medium mb-1">Fundraising Campaign</div>
          <div className="text-sm text-green-700">This post is seeking funding for research</div>
        </div>
      )}

      {/* Moderation metadata */}
      <ModerationMetadata entry={entry} />

      {/* Actions */}
      <ModerationActions
        onDismiss={() => onAction('dismiss')}
        onRemove={() => onAction('remove')}
        view={view}
        hasVerdict={!!verdict}
      />
    </div>
  );
};
