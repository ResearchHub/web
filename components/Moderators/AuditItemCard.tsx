'use client';

import { FC } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { AuditItemComment } from './AuditItemComment';
import { AuditItemPost } from './AuditItemPost';
import { AuditItemPaper } from './AuditItemPaper';
import { AuditItemAuthor } from './AuditItemAuthor';

interface AuditItemCardProps {
  readonly entry: FlaggedContent;
  readonly onAction: (action: 'dismiss' | 'remove') => void;
  readonly view?: 'pending' | 'dismissed' | 'removed';
}

type ContentType = 'comment' | 'post' | 'paper' | 'author' | 'unknown';

const detectContentType = (entry: FlaggedContent): ContentType => {
  const contentType = entry.contentType?.name?.toLowerCase();

  switch (contentType) {
    case 'rhcommentmodel':
      return 'comment';
    case 'paper':
      return 'paper';
    case 'researchhubpost':
      return 'post';
    case 'author':
    case 'authorprofile':
    case 'user':
      return 'author';
    default:
      // Fallback based on available data
      if (entry.item?.comment_content_json) return 'comment';
      if (entry.item?.abstract) return 'paper';
      if (entry.item?.thread?.content_object) return 'post';
      // Check for author-like data structure
      if (entry.item?.first_name || entry.item?.author_profile) return 'author';
      return 'unknown';
  }
};

export const AuditItemCard: FC<AuditItemCardProps> = ({ entry, onAction, view }) => {
  const contentType = detectContentType(entry);

  switch (contentType) {
    case 'comment':
      return <AuditItemComment entry={entry} onAction={onAction} view={view} />;
    case 'post':
      return <AuditItemPost entry={entry} onAction={onAction} view={view} />;
    case 'paper':
      return <AuditItemPaper entry={entry} onAction={onAction} view={view} />;
    case 'author':
      return <AuditItemAuthor entry={entry} onAction={onAction} view={view} />;
    default:
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-gray-500">
            Unknown content type: {entry.contentType?.name ?? 'N/A'}
          </div>
        </div>
      );
  }
};
