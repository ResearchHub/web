'use client';

import type { ComponentProps } from 'react';
import { FeedEntryItem } from '@/components/Feed/FeedEntryItem';
import { NoteStatusLine } from '@/components/Notebook/NoteStatus';
import { formatTimeAgo } from '@/utils/date';
import { cn } from '@/utils/styles';

type PublishedFeedEntryProps = Omit<ComponentProps<typeof FeedEntryItem>, 'spaced'>;

/**
 * A published RFP or proposal in a My Funding section: the feed's own card
 * under a "Published" line, so it reads against the drafts listed above it.
 */
export function PublishedFeedEntry({ index, entry, ...props }: PublishedFeedEntryProps) {
  return (
    <div className={cn(index !== 0 && 'mt-8')}>
      <NoteStatusLine
        published
        detail={entry.timestamp ? formatTimeAgo(entry.timestamp) : undefined}
        className="mb-2"
      />
      <FeedEntryItem {...props} entry={entry} index={index} spaced={false} />
    </div>
  );
}
