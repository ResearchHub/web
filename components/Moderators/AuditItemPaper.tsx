'use client';

import { FC } from 'react';
import { FileText, ExternalLink, Users, Calendar } from 'lucide-react';
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
import { ModerationMetadata } from './ModerationMetadata';
import { ModerationActions } from './ModerationActions';

interface AuditItemPaperProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  view?: 'pending' | 'dismissed' | 'removed';
}

export const AuditItemPaper: FC<AuditItemPaperProps> = ({ entry, onAction, view = 'pending' }) => {
  const offendingUser = getFlaggedContentOffendingUser(entry);
  const structuredContent = getStructuredAuditContent(entry);
  const verdict = entry.verdict;
  const contentUrl = generateAuditContentUrl(entry);

  if (structuredContent.type !== 'paper') {
    return null;
  }

  // Convert authors to the format expected by AuthorList
  const authors = structuredContent.authors.map((author: any) => ({
    name: author.fullName || `${author.firstName || ''} ${author.lastName || ''}`.trim(),
    verified: author.user?.isVerified,
    profileUrl: author.profileUrl,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Header with content type */}
      <div className="flex items-center gap-2 mb-3">
        <ContentTypeBadge type="paper" />
        {structuredContent.journal && (
          <div className="text-sm text-blue-600 font-medium">{structuredContent.journal.name}</div>
        )}
      </div>

      {/* Paper title */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {structuredContent.title}
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

      {/* Publication date */}
      {(structuredContent.publishedDate || structuredContent.createdDate) && (
        <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>
            {structuredContent.publishedDate ? 'Published' : 'Created'}:{' '}
            <Tooltip
              content={new Date(
                structuredContent.publishedDate || structuredContent.createdDate
              ).toLocaleString()}
            >
              <span className="cursor-default">
                {formatTimestamp(structuredContent.publishedDate || structuredContent.createdDate)}
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

      {/* Abstract */}
      {structuredContent.abstract && (
        <div className="mb-3 p-3 bg-gray-50 rounded border-l-2 border-blue-300">
          <p className="text-gray-700 text-sm leading-relaxed">
            {truncateText(structuredContent.abstract, 300)}
          </p>
        </div>
      )}

      {/* DOI */}
      {structuredContent.doi && (
        <div className="mb-3 text-sm">
          <span className="text-gray-500">DOI:</span>{' '}
          <a
            href={`https://doi.org/${structuredContent.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-mono"
          >
            {structuredContent.doi}
          </a>
        </div>
      )}

      {/* PDF link */}
      {structuredContent.pdfUrl && (
        <div className="mb-3">
          <a
            href={structuredContent.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            <FileText className="w-4 h-4" />
            View PDF
          </a>
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
