'use client';

import { FC } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { detectAuditContentType } from './utils/auditUtils';
import { AuditItemComment } from './AuditItemComment';
import { AuditItemPaper } from './AuditItemPaper';
import { AuditItemPost } from './AuditItemPost';

interface AuditItemCardProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  view?: 'pending' | 'dismissed' | 'removed';
}

export const AuditItemCard: FC<AuditItemCardProps> = ({ entry, onAction, view = 'pending' }) => {
  const contentType = detectAuditContentType(entry);

  // Route to the appropriate specialized component based on content type
  switch (contentType) {
    case 'comment':
      return <AuditItemComment entry={entry} onAction={onAction} view={view} />;

    case 'paper':
      return <AuditItemPaper entry={entry} onAction={onAction} view={view} />;

    case 'post':
      return <AuditItemPost entry={entry} onAction={onAction} view={view} />;

    default:
      // Fallback for unknown content types - show basic info
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
          <div className="mb-3">
            <div className="text-sm text-red-600 font-medium mb-2">
              Unknown Content Type: {entry.contentType.name}
            </div>
            <div className="text-sm text-gray-600">
              This content type is not yet supported in the audit interface.
            </div>
          </div>

          {/* Show basic flagging info */}
          <div className="text-sm text-gray-600">
            <span className="text-gray-500">Flagged by:</span>{' '}
            <span className="text-gray-700">
              {entry.flaggedBy.authorProfile.firstName} {entry.flaggedBy.authorProfile.lastName}
            </span>
            {(entry.reason || entry.reasonChoice) && (
              <>
                {' - '}
                <span className="text-gray-700">{entry.reason || entry.reasonChoice}</span>
              </>
            )}
          </div>

          {/* Basic actions for unknown types */}
          {view === 'pending' && !entry.verdict && (
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={() => onAction('dismiss')}
                className="px-3 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
              >
                Dismiss
              </button>
              <button
                onClick={() => onAction('remove')}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      );
  }
};
