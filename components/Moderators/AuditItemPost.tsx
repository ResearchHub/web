'use client';

import { FC, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { Button } from '@/components/ui/Button';
import { FlaggedContent } from '@/services/audit.service';
import {
  getFlaggedContentOffendingUser,
  getStructuredAuditContent,
  generateAuditContentUrl,
} from './utils/auditUtils';
import { formatTimestamp } from '@/utils/date';
import { Tooltip } from '@/components/ui/Tooltip';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { truncateText } from '@/utils/stringUtils';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { ModerationMetadata } from './ModerationMetadata';
import { ModerationActions } from './ModerationActions';

interface AuditItemPostProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  view?: 'pending' | 'dismissed' | 'removed';
}

export const AuditItemPost: FC<AuditItemPostProps> = ({ entry, onAction, view = 'pending' }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const offendingUser = getFlaggedContentOffendingUser(entry);
  const structuredContent = getStructuredAuditContent(entry);
  const verdict = entry.verdict;
  const contentUrl = generateAuditContentUrl(entry);

  if (structuredContent.type !== 'post') {
    return null;
  }

  // Determine content type badge based on document type or other indicators
  const getContentTypeBadge = () => {
    if (structuredContent.documentType) {
      // Map document types to badge types
      const typeMap: { [key: string]: string } = {
        PREREGISTRATION: 'preregistration',
        PAPER: 'article',
        RESEARCH: 'article',
        FUNDING: 'funding',
      };
      return typeMap[structuredContent.documentType] || 'post';
    }
    if (structuredContent.fundraise) {
      return 'funding';
    }
    return 'post';
  };

  // Create unified action text similar to comments
  const getUnifiedActionText = () => {
    const documentType = structuredContent.documentType || 'post';
    const actionVerb =
      documentType === 'PREREGISTRATION'
        ? 'Created a preregistration'
        : documentType === 'PAPER'
          ? 'Published a paper'
          : structuredContent.fundraise
            ? 'Created a funding request'
            : 'Created a post';

    return (
      <span>
        {actionVerb} •{' '}
        <Tooltip content={new Date(structuredContent.createdDate).toLocaleString()}>
          <span className="cursor-default">{formatTimestamp(structuredContent.createdDate)}</span>
        </Tooltip>
      </span>
    );
  };

  // Get content preview from renderable_text
  const getContentPreview = () => {
    return structuredContent.renderableText || structuredContent.content || 'No content available';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Content type badge */}
      <div className="mb-3">
        <ContentTypeBadge type={getContentTypeBadge() as any} />
      </div>

      {/* User and unified action */}
      <div className="flex items-center space-x-3 mb-3">
        <Avatar
          src={offendingUser.avatar}
          alt={offendingUser.name}
          size="sm"
          authorId={offendingUser.authorId}
        />
        <div>
          {offendingUser.authorId ? (
            <AuthorTooltip authorId={offendingUser.authorId}>
              <a
                href="#"
                className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToAuthorProfile(offendingUser.authorId!);
                }}
              >
                {offendingUser.name}
              </a>
            </AuthorTooltip>
          ) : (
            <span
              className={`font-medium ${offendingUser.isRemoved ? 'text-gray-500 italic' : 'text-gray-900'}`}
            >
              {offendingUser.name}
            </span>
          )}
          <div className="text-sm text-gray-500">{getUnifiedActionText()}</div>
        </div>
      </div>

      {/* Post title with link */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {contentUrl ? (
            <a
              href={contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-blue-600 underline"
            >
              {structuredContent.title || 'Untitled Post'}
            </a>
          ) : (
            structuredContent.title || 'Untitled Post'
          )}
        </h3>
      </div>

      {/* Moderation metadata */}
      <ModerationMetadata entry={entry} />

      {/* Content preview */}
      <div className="mb-4 p-3 bg-gray-50 rounded border-l-2 border-blue-300">
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {showFullContent ? getContentPreview() : truncateText(getContentPreview(), 400)}
        </p>
        {getContentPreview().length > 400 && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
            >
              {showFullContent ? 'Show less' : 'Show all'}
            </Button>
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
