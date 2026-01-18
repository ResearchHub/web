'use client';

import { FC } from 'react';
import { FlaggedContent } from '@/services/audit.service';
import { ModerationMetadata } from './ModerationMetadata';
import { ModerationActions } from './ModerationActions';
import { User } from 'lucide-react';
import Link from 'next/link';

interface AuditItemAuthorProps {
  readonly entry: FlaggedContent;
  readonly onAction: (action: 'dismiss' | 'remove') => void;
  readonly view?: 'pending' | 'dismissed' | 'removed';
}

const getAuthorInfo = (entry: FlaggedContent) => {
  const item = entry.item;
  if (!item) {
    return { name: 'Unknown Author', avatar: null, authorId: null };
  }

  const firstName = item.first_name ?? item.firstName ?? '';
  const lastName = item.last_name ?? item.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Author';
  const avatar = item.profile_image ?? item.author_profile?.profile_image ?? null;
  const authorId = item.id ?? item.author_profile?.id ?? null;

  return { name: fullName, avatar, authorId };
};

export const AuditItemAuthor: FC<AuditItemAuthorProps> = ({
  entry,
  onAction,
  view = 'pending',
}) => {
  const verdict = entry.verdict;
  const authorInfo = getAuthorInfo(entry);
  const item = entry.item;

  const profileUrl = authorInfo.authorId ? `/author/${authorInfo.authorId}` : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      {/* Moderation metadata at the top */}
      <div className="px-4 pt-4">
        <ModerationMetadata entry={entry} />
      </div>

      {/* Author card content */}
      <div className="px-4 py-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {authorInfo.avatar ? (
              <img
                src={authorInfo.avatar}
                alt={authorInfo.name}
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Author info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {profileUrl ? (
                <Link
                  href={profileUrl}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate"
                >
                  {authorInfo.name}
                </Link>
              ) : (
                <span className="text-lg font-semibold text-gray-900 truncate">
                  {authorInfo.name}
                </span>
              )}
            </div>

            {/* Email if available */}
            {item?.email && <p className="text-sm text-gray-500 mt-1 truncate">{item.email}</p>}

            {/* Headline if available */}
            {(item?.headline || item?.author_profile?.headline) && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {item.headline ?? item.author_profile?.headline}
              </p>
            )}

            {/* Status badges */}
            <div className="flex items-center gap-2 mt-3">
              {item?.is_suspended && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                  Suspended
                </span>
              )}
              {item?.probable_spammer && (
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                  Probable Spammer
                </span>
              )}
              {item?.is_verified && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Moderation actions at the bottom */}
      <div className="px-4 pb-4">
        <ModerationActions
          onDismiss={() => onAction('dismiss')}
          onRemove={() => onAction('remove')}
          view={view}
          hasVerdict={!!verdict}
        />
      </div>
    </div>
  );
};
