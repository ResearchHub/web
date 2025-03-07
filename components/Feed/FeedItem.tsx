'use client';

import { FC } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedItemHeader } from './FeedItemHeader';
import { FeedItemBody } from './FeedItemBody';
import { FeedItemActions } from './FeedItemActions';
import { cn } from '@/utils/styles';

interface FeedItemProps {
  entry: FeedEntry;
  isFirst?: boolean;
}

export const FeedItem: FC<FeedItemProps> = ({ entry, isFirst }) => {
  const { content, target, context, metrics } = entry;

  // Helper function to get author data for FeedItemHeader
  const getAuthorData = () => {
    if (content.type === 'paper' && content.authors && content.authors.length > 0) {
      // For papers, pass all authors
      console.log('Paper authors:', content.authors);
      return {
        authors: content.authors.map((author) => ({
          id: author.id,
          fullName: author.fullName || 'Unknown',
          profileImage: author.profileImage,
          profileUrl: author.profileUrl || '#',
          isVerified: author.user?.isVerified,
        })),
      };
    } else if (content.actor && content.actor.fullName) {
      // For other content types with a single actor
      console.log('Content actor:', content.actor);
      return {
        author: {
          id: content.actor.id,
          fullName: content.actor.fullName || 'Unknown',
          profileImage: content.actor.profileImage,
          profileUrl: content.actor.profileUrl || '#',
          isVerified: content.actor.user?.isVerified,
        },
      };
    }

    // Fallback if no author data is available
    console.warn('No author data found for content:', content);
    return {
      author: {
        fullName: 'Unknown User',
        profileImage: '',
        profileUrl: '#',
      },
    };
  };

  // Get bounty-specific props if content is a bounty
  const getBountyProps = () => {
    if (content.type === 'bounty') {
      return {
        bountyAmount: content.amount,
        bountyStatus: 'open' as const, // Explicitly type as 'open' | 'closed' | 'expiring'
      };
    }
    return {};
  };

  return (
    <div className={cn('relative', !isFirst && 'mt-6')}>
      <div>
        <FeedItemHeader
          contentType={content.type}
          timestamp={entry.timestamp}
          action={entry.action}
          {...getAuthorData()}
          {...getBountyProps()}
        />

        <div className="mt-2">
          <FeedItemBody content={content} target={target} context={context} metrics={metrics} />

          <div className="pt-3">
            <FeedItemActions metrics={metrics} content={content} target={target} />
          </div>
        </div>
      </div>
    </div>
  );
};
