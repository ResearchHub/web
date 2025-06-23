'use client';

import { FC, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';
import { FlaggedContent } from '@/services/audit.service';
import { truncateText } from '@/utils/stringUtils';
import TipTapRenderer from '../Comment/lib/TipTapRenderer';
import { Star } from 'lucide-react';
import { cn } from '@/utils/styles';
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
  const [showFullContent, setShowFullContent] = useState(false);
  const offendingUser = getFlaggedContentOffendingUser(entry);
  const structuredContent = getStructuredAuditContent(entry);
  const verdict = entry.verdict;
  const contentUrl = generateAuditContentUrl(entry);

  // Simple read-only stars component for displaying review score
  const ReadOnlyStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={cn(
              'mr-0.5',
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  // Review section header component for peer reviews
  const ReviewSectionHeader = ({
    title,
    description,
    rating,
  }: {
    title: string;
    description?: string;
    rating: number;
  }) => {
    return (
      <div className="mb-4 border-b pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{title}</h3>
          {rating > 0 && <ReadOnlyStars rating={rating} />}
        </div>
        {/* {description && <p className="text-gray-600 mt-1">{description}</p>} */}
      </div>
    );
  };

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
        {/* Render TipTap content for peer reviews with proper formatting */}
        {entry.item?.comment_content_json ? (
          <div className="tiptap-content">
            {(() => {
              try {
                const parsedContent =
                  typeof entry.item.comment_content_json === 'string'
                    ? JSON.parse(entry.item.comment_content_json)
                    : entry.item.comment_content_json;

                return (
                  <TipTapRenderer
                    content={parsedContent}
                    renderSectionHeader={(props) => (
                      <ReviewSectionHeader key={`section-${props.title}`} {...props} />
                    )}
                    truncate={!showFullContent}
                    maxLength={400}
                  />
                );
              } catch (error) {
                return (
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {showFullContent
                      ? structuredContent.content
                      : truncateText(structuredContent.content, 400)}
                  </p>
                );
              }
            })()}
          </div>
        ) : (
          /* Fallback to plain text rendering */
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {showFullContent
              ? structuredContent.content
              : truncateText(structuredContent.content, 400)}
          </p>
        )}

        {/* Show more/less button */}
        {structuredContent.content.length > 400 && (
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
