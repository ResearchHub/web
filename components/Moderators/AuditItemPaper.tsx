'use client';

import { FC } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { FlaggedContent } from '@/services/audit.service';
import { Work, ContentType } from '@/types/work';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';
import { getAuditUserInfo, getAuditContentUrl } from './utils/auditUtils';
import { formatTimestamp } from '@/utils/date';
import { Tooltip } from '@/components/ui/Tooltip';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { ModerationMetadata } from './ModerationMetadata';
import { ModerationActions } from './ModerationActions';
import { truncateText } from '@/utils/stringUtils';

interface AuditItemPaperProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  view?: 'pending' | 'dismissed' | 'removed';
}

export const AuditItemPaper: FC<AuditItemPaperProps> = ({ entry, onAction, view = 'pending' }) => {
  const userInfo = getAuditUserInfo(entry);
  const verdict = entry.verdict;
  const contentUrl = getAuditContentUrl(entry);
  const item = entry.item!;

  // Extract paper information
  const paperTitle = item.title || 'Untitled Paper';
  const paperAbstract = item.abstract || 'No abstract available';
  const createdDate = item.created_date || entry.createdDate;

  // Map document types to content types
  const getContentType = (docType: string): ContentType => {
    switch (docType) {
      case 'PAPER':
        return 'paper';
      case 'PREREGISTRATION':
        return 'preregistration';
      case 'DISCUSSION':
      case 'POST':
      default:
        return 'post';
    }
  };

  // Check if this paper has related work (if it references another document)
  const relatedDocument = item.thread?.content_object?.unified_document?.documents?.[0];
  const documentType = item.thread?.content_object?.unified_document?.document_type;

  const relatedWork = relatedDocument
    ? {
        id: relatedDocument.id,
        contentType: documentType ? getContentType(documentType) : 'post',
        title: relatedDocument.title || 'Untitled',
        slug: relatedDocument.slug || `item-${relatedDocument.id}`,
        createdDate: item.created_date || entry.createdDate,
        authors: [],
        abstract: relatedDocument.renderable_text || 'No preview available',
        topics: [],
        formats: [],
        figures: [],
      }
    : undefined;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Content type badge */}
      <div className="mb-3">
        <ContentTypeBadge type="article" />
      </div>

      {/* User and unified action */}
      <div className="flex items-center space-x-3 mb-3">
        <Avatar src={userInfo.avatar} alt={userInfo.name} size="sm" authorId={userInfo.authorId} />
        <div>
          {userInfo.authorId ? (
            <AuthorTooltip authorId={userInfo.authorId}>
              <a
                href="#"
                className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToAuthorProfile(userInfo.authorId!);
                }}
              >
                {userInfo.name}
              </a>
            </AuthorTooltip>
          ) : (
            <span
              className={`font-medium ${userInfo.isRemoved ? 'text-gray-500 italic' : 'text-gray-900'}`}
            >
              {userInfo.name}
            </span>
          )}
          <div className="text-sm text-gray-500">
            <span>
              Published a paper •{' '}
              <Tooltip content={new Date(createdDate).toLocaleString()}>
                <span className="cursor-default">{formatTimestamp(createdDate)}</span>
              </Tooltip>
            </span>
          </div>
        </div>
      </div>

      {/* Paper title with link */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {contentUrl ? (
            <a
              href={contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-blue-600 underline"
            >
              {paperTitle}
            </a>
          ) : (
            paperTitle
          )}
        </h3>
      </div>

      {/* Moderation metadata */}
      <ModerationMetadata entry={entry} />

      {/* Paper abstract */}
      <div className="mb-4 p-3 bg-gray-50 rounded border-l-2 border-blue-300">
        <div className="text-sm text-gray-700">
          <p>{truncateText(paperAbstract, 400)}</p>
        </div>
      </div>

      {/* Related Work - show if available */}
      {relatedWork && (
        <div className="mb-4">
          <RelatedWorkCard size="sm" work={relatedWork} />
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
