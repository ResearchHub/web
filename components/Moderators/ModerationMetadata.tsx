'use client';

import { FC } from 'react';
import { Flag, Shield } from 'lucide-react';
import { FlaggedContent } from '@/services/audit.service';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { formatTimestamp } from '@/utils/date';
import { Tooltip } from '@/components/ui/Tooltip';

interface ModerationMetadataProps {
  entry: FlaggedContent;
  className?: string;
}

export const ModerationMetadata: FC<ModerationMetadataProps> = ({ entry, className = '' }) => {
  const flaggedByName = `${entry.flaggedBy.authorProfile.firstName} ${entry.flaggedBy.authorProfile.lastName}`;
  const verdict = entry.verdict;

  return (
    <div className={className}>
      {/* Flagged by info */}
      <div className="mb-2 text-sm text-gray-600">
        <div className="flex items-start gap-1">
          <Flag size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-gray-500">Flagged by:</span>
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
            <Tooltip content={new Date(entry.createdDate).toLocaleString()}>
              <span className="text-gray-500 cursor-default">
                ({formatTimestamp(entry.createdDate)})
              </span>
            </Tooltip>
            {(entry.reason ?? entry.reasonChoice) && (
              <>
                <span>-</span>
                <span className="text-gray-700">{entry.reason ?? entry.reasonChoice}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Show moderator action for removed content */}
      {verdict?.createdBy && (
        <div className="mb-2 text-sm text-gray-600">
          <div className="flex items-start gap-1">
            <Shield size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-gray-500">Verdict by:</span>
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
              <Tooltip content={new Date(verdict.createdDate).toLocaleString()}>
                <span className="text-gray-500 cursor-default">
                  ({formatTimestamp(verdict.createdDate)})
                </span>
              </Tooltip>
              <span>-</span>
              <span className="text-gray-700">{verdict.verdictChoice}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
