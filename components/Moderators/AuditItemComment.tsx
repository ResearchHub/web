'use client';

import { FC } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { CheckCircle } from 'lucide-react';
import { FlaggedContent } from '@/services/audit.service';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import {
  getFlaggedContentOffendingUser,
  getStructuredAuditContent,
  generateAuditContentUrl,
} from './utils/auditUtils';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { formatTimestamp } from '@/utils/date';
import { Tooltip } from '@/components/ui/Tooltip';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { ModerationMetadata } from './ModerationMetadata';
import { ModerationActions } from './ModerationActions';

interface AuditItemCommentProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  view?: 'pending' | 'dismissed' | 'removed';
}

export const AuditItemComment: FC<AuditItemCommentProps> = ({
  entry,
  onAction,
  view = 'pending',
}) => {
  const offendingUser = getFlaggedContentOffendingUser(entry);
  const structuredContent = getStructuredAuditContent(entry);
  const verdict = entry.verdict;
  const contentUrl = generateAuditContentUrl(entry);

  if (structuredContent.type !== 'comment') {
    return null;
  }

  // Create unified action text with parent document link
  const getUnifiedActionText = () => {
    const actionVerb = structuredContent.isReview ? 'Left a review' : 'Posted a comment';

    if (structuredContent.parentDocument && contentUrl) {
      return (
        <span>
          {actionVerb} on{' '}
          <a
            href={contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-800 underline"
          >
            {structuredContent.parentDocument.title}
          </a>
          {' • '}
          <Tooltip content={new Date(structuredContent.createdDate).toLocaleString()}>
            <span className="cursor-default">{formatTimestamp(structuredContent.createdDate)}</span>
          </Tooltip>
        </span>
      );
    }

    // Fallback if no parent document
    return (
      <span>
        {actionVerb} •{' '}
        <Tooltip content={new Date(structuredContent.createdDate).toLocaleString()}>
          <span className="cursor-default">{formatTimestamp(structuredContent.createdDate)}</span>
        </Tooltip>
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Review score badge (only for reviews) */}
      {structuredContent.isReview && structuredContent.reviewScore && (
        <div className="mb-3">
          <div className="inline-flex items-center gap-2">
            <ContentTypeBadge type="review" />
            <div className="text-sm text-yellow-600 font-medium">
              Score: {structuredContent.reviewScore}/5
            </div>
          </div>
        </div>
      )}

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

      {/* Moderation metadata */}
      <ModerationMetadata entry={entry} />

      {/* Comment content */}
      <div className="mb-4 p-3 bg-gray-50 rounded border-l-2 border-blue-300 relative">
        <CommentReadOnly
          content={structuredContent.content}
          contentFormat={structuredContent.contentFormat as any}
          initiallyExpanded={true}
          showReadMoreButton={false}
          maxLength={500}
        />
        {/* Subtle verdict indicator for dismissed items */}
        {view === 'dismissed' && (
          <div className="absolute top-3 right-3">
            <CheckCircle className="h-4 w-4 text-green-500 opacity-60" />
          </div>
        )}
      </div>

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
