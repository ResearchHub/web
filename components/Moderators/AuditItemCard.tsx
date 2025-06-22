'use client';

import { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { CheckCircle, XCircle } from 'lucide-react';
import { FlaggedContent } from '@/services/audit.service';
import {
  getFlaggedContentPreview,
  getFlaggedContentParentDocumentTitle,
  getFlaggedContentOffendingUser,
  getFlaggedContentStatusColor,
  getFlaggedContentDisplayStatus,
} from './utils/auditUtils';
import { navigateToAuthorProfile } from '@/utils/navigation';

interface AuditItemCardProps {
  entry: FlaggedContent;
  onAction: (action: 'dismiss' | 'remove') => void;
  view?: 'pending' | 'dismissed' | 'removed';
}

export const AuditItemCard: FC<AuditItemCardProps> = ({ entry, onAction, view = 'pending' }) => {
  const offendingUser = getFlaggedContentOffendingUser(entry);
  const commentContent = getFlaggedContentPreview(entry);
  const parentDocumentTitle = getFlaggedContentParentDocumentTitle(entry);
  const status = getFlaggedContentDisplayStatus(entry.verdict?.verdictChoice);
  const statusColor = getFlaggedContentStatusColor(entry.verdict?.verdictChoice);
  const flaggedByName = `${entry.flaggedBy.authorProfile.firstName} ${entry.flaggedBy.authorProfile.lastName}`;
  const verdict = entry.verdict;

  // Determine if we should show action buttons (only for pending items without verdicts)
  const showActionButtons = view === 'pending' && !verdict;

  // Determine if we should show status badge (only for pending items)
  const showStatusBadge = view === 'pending';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Offending user and status badge inline */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar
            src={offendingUser.avatar}
            alt={offendingUser.name}
            size="sm"
            authorId={offendingUser.authorId}
          />
          <div className="font-medium text-gray-900">
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
          </div>
        </div>
        {showStatusBadge && <Badge className={statusColor}>{status}</Badge>}
      </div>

      {/* Flagged by info */}
      <div className="mb-2 text-sm text-gray-600">
        <span className="text-gray-500">Flagged by:</span>{' '}
        {entry.flaggedBy.authorProfile.id ? (
          <AuthorTooltip authorId={Number(entry.flaggedBy.authorProfile.id)}>
            <a
              href="#"
              className="text-gray-700 hover:text-blue-600 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                navigateToAuthorProfile(Number(entry.flaggedBy.authorProfile.id));
              }}
            >
              {flaggedByName}
            </a>
          </AuthorTooltip>
        ) : (
          <span className="text-gray-700">{flaggedByName}</span>
        )}
        {(entry.reason || entry.reasonChoice) && (
          <>
            {' - '}
            <span className="text-gray-700">{entry.reason || entry.reasonChoice}</span>
          </>
        )}
      </div>

      {/* Show moderator action for removed content */}
      {verdict && verdict.createdBy && (
        <div className="mb-2 text-sm text-gray-600">
          <span className="text-gray-500">Removed by:</span>{' '}
          {verdict.createdBy.authorProfile.id ? (
            <AuthorTooltip authorId={Number(verdict.createdBy.authorProfile.id)}>
              <a
                href="#"
                className="text-gray-700 hover:text-blue-600 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToAuthorProfile(Number(verdict.createdBy.authorProfile.id));
                }}
              >
                {`${verdict.createdBy.authorProfile.firstName} ${verdict.createdBy.authorProfile.lastName}`}
              </a>
            </AuthorTooltip>
          ) : (
            <span className="text-gray-700">
              {`${verdict.createdBy.authorProfile.firstName} ${verdict.createdBy.authorProfile.lastName}`}
            </span>
          )}
          {' - '}
          <span className="text-gray-700">{verdict.verdictChoice}</span>
        </div>
      )}

      {/* Parent document */}
      <div className="mb-3 text-sm text-gray-600">
        <span className="text-gray-500">Parent document:</span>{' '}
        <span className="text-gray-700">{parentDocumentTitle}</span>
      </div>

      {/* Comment content */}
      <div className="mb-4 p-3 bg-gray-50 rounded border-l-2 border-blue-300">
        <p className="text-gray-900 whitespace-pre-wrap">{commentContent}</p>
      </div>

      {/* Actions */}
      {showActionButtons && (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction('dismiss')}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Dismiss
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAction('remove')}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};
