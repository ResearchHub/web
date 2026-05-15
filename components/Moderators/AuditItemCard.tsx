'use client';

import { FC, ReactNode } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { AuditItemComment } from './AuditItemComment';
import { AuditItemPost } from './AuditItemPost';
import { AuditItemPaper } from './AuditItemPaper';
import { SelectionCheckbox } from './SelectionCheckbox';
import { ModerationMetadata } from './ModerationMetadata';
import { ModerationActions } from './ModerationActions';
import { getAuditUserInfo } from './utils/auditUtils';

interface AuditItemCardProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  onRefresh?: () => void;
  view?: 'pending' | 'dismissed' | 'removed';
  isSelected?: boolean;
  onSelect?: () => void;
}

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

  const checkbox: ReactNode = onSelect ? (
    <div className="w-8 flex-shrink-0 flex justify-center">
      <SelectionCheckbox
        checked={!!isSelected}
        onChange={onSelect}
        ariaLabel={isSelected ? 'Deselect item' : 'Select item'}
      />
    </div>
  ) : null;

  const sharedProps = { entry, onAction, onRefresh, view, checkbox };

  // API can return flags whose underlying content was deleted.
  if (entry.item == null) {
    const userInfo = getAuditUserInfo(entry);
    const verdict = entry.verdict;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3 mb-3">
          {checkbox}
          <div className="flex-1 min-w-0">
            <ModerationMetadata entry={entry} />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          The flagged content is no longer available (it may have been removed).
        </p>
        <ModerationActions
          onDismiss={() => onAction('dismiss')}
          onRemove={() => onAction('remove')}
          view={view}
          hasVerdict={!!verdict}
          authorId={userInfo.authorId}
          authorName={userInfo.name}
          onRefresh={onRefresh}
        />
      </div>
    );
  }

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
