'use client';

import { FC, ReactNode } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { ModerationMetadata } from './ModerationMetadata';
import { ModerationActions } from './ModerationActions';
import { getAuditUserInfo } from './utils/auditUtils';

interface AuditItemMissingContentProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  onRefresh?: () => void;
  view?: 'pending' | 'dismissed' | 'removed';
  checkbox?: ReactNode;
}

/** Flag rows whose underlying content was deleted (`item: null` from API). */
export const AuditItemMissingContent: FC<AuditItemMissingContentProps> = ({
  entry,
  onAction,
  onRefresh,
  view,
  checkbox,
}) => {
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
};
