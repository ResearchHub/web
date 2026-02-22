'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';
import { formatTimeAgo } from '@/utils/date';
import { buildWorkUrl } from '@/utils/url';
import type { FeedEntry, FeedPostContent, FeedPaperContent, FeedGrantContent } from '@/types/feed';
import type { ContentType } from '@/types/work';

interface ActivitySidebarProps {
  entries?: FeedEntry[];
  className?: string;
}

const ACTION_LABELS: Record<string, string> = {
  GRANT: 'created a grant',
  PREREGISTRATION: 'submitted a proposal',
  POST: 'posted a discussion',
  PAPER: 'published a paper',
  COMMENT: 'left a comment',
  BOUNTY: 'posted a bounty',
};

const CONTENT_TYPE_MAP: Record<string, ContentType> = {
  GRANT: 'funding_request',
  PREREGISTRATION: 'preregistration',
  POST: 'post',
  PAPER: 'paper',
};

function getEntryMeta(entry: FeedEntry) {
  const content = entry.content;
  const author = content.createdBy;

  if (entry.contentType === 'COMMENT' || entry.contentType === 'BOUNTY') {
    const work = entry.relatedWork;
    return {
      title: work?.title,
      author,
      href: work
        ? buildWorkUrl({ id: work.id, slug: work.slug, contentType: work.contentType })
        : undefined,
    };
  }

  const titled = content as FeedPostContent | FeedPaperContent | FeedGrantContent;
  return {
    title: titled.title,
    author,
    href: CONTENT_TYPE_MAP[entry.contentType]
      ? buildWorkUrl({
          id: titled.id,
          slug: titled.slug,
          contentType: CONTENT_TYPE_MAP[entry.contentType],
        })
      : undefined,
  };
}

export const ActivitySidebar: FC<ActivitySidebarProps> = ({ entries, className }) => {
  const hasEntries = entries && entries.length > 0;

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-6 h-full', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
      </div>

      {!hasEntries ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Activity size={24} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No recent activity</p>
          <p className="text-xs text-gray-400 mt-1">See recent contributions and updates</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {entries.map((entry) => {
            const { title, author, href } = getEntryMeta(entry);
            if (!title) return null;

            return (
              <div key={entry.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar
                  src={author?.profileImage}
                  alt={author?.fullName || 'User'}
                  size={32}
                  authorId={author?.id}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 leading-snug">
                    <span className="font-medium text-gray-900">
                      {author?.fullName || 'Unknown'}
                    </span>{' '}
                    {ACTION_LABELS[entry.contentType] || 'contributed'}
                  </p>
                  {href ? (
                    <Link
                      href={href}
                      className="text-sm text-indigo-600 hover:text-indigo-800 line-clamp-1 leading-snug mt-0.5"
                    >
                      {title}
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-500 line-clamp-1 leading-snug mt-0.5">
                      {title}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(entry.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
