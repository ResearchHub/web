'use client';

import { FC } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { AuditItemComment } from './AuditItemComment';
import { AuditItemPost } from './AuditItemPost';
import { AuditItemPaper } from './AuditItemPaper';

interface AuditItemCardProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  onRefresh?: () => void;
  view?: 'pending' | 'dismissed' | 'removed';
  isSelected?: boolean;
  onSelect?: () => void;
}

/**
 * Detect the content type from the flagged content entry
 */
const detectContentType = (entry: FlaggedContent): 'comment' | 'post' | 'paper' | 'unknown' => {
  const contentType = entry.contentType?.name?.toLowerCase();

  switch (contentType) {
    case 'rhcommentmodel':
      return 'comment';
    case 'paper':
      return 'paper';
    case 'researchhubpost':
      return 'post';
    default:
      // Fallback based on available data
      if (entry.item?.comment_content_json) return 'comment';
      if (entry.item?.abstract) return 'paper';
      if (entry.item?.thread?.content_object) return 'post';
      return 'unknown';
  }
};

export const AuditItemCard: FC<AuditItemCardProps> = ({
  entry,
  onAction,
  onRefresh,
  view,
  isSelected,
  onSelect,
}) => {
  const contentType = detectContentType(entry);

  const sharedProps = { entry, onAction, onRefresh, view, isSelected, onSelect };

  switch (contentType) {
    case 'comment':
      return <AuditItemComment {...sharedProps} />;
    case 'post':
      return <AuditItemPost {...sharedProps} />;
    case 'paper':
      return <AuditItemPaper {...sharedProps} />;
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
