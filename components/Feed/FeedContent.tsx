'use client';

import { FC, ReactNode } from 'react';
import { FeedItemSkeleton } from './FeedItemSkeleton';
import { FeedEntry, FeedPostContent, FeedPaperContent, FeedBountyContent } from '@/types/feed';
import { Comment } from '@/types/comment';
import { FeedItemFundraise } from './items/FeedItemFundraise';
import { FeedItemPaper } from './items/FeedItemPaper';
import { FeedItemBounty } from './items/FeedItemBounty';
import { FeedItemComment } from './items/FeedItemComment';

interface FeedContentProps {
  entries: FeedEntry[]; // Using FeedEntry type instead of RawApiFeedEntry
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  header?: ReactNode;
  tabs?: ReactNode;
  filters?: ReactNode; // New prop for source filters
  disableCardLinks?: boolean; // Optional prop to disable all card links
}

export const FeedContent: FC<FeedContentProps> = ({
  entries,
  isLoading,
  hasMore,
  loadMore,
  header,
  tabs,
  filters,
  disableCardLinks = false,
}) => {
  // Generate appropriate href for each feed item type
  const generateHref = (entry: FeedEntry): string | undefined => {
    // If links are disabled globally, return undefined
    if (disableCardLinks) {
      return undefined;
    }

    try {
      switch (entry.contentType) {
        case 'POST':
          const postContent = entry.content as FeedPostContent;
          return `/post/${postContent.id}/${postContent.slug}`;
        case 'PREREGISTRATION':
          const fundContent = entry.content as FeedPostContent;
          return `/fund/${fundContent.id}/${fundContent.slug}`;
        case 'PAPER':
          const paperContent = entry.content as FeedPaperContent;
          return `/paper/${paperContent.id}/${paperContent.slug}`;

        case 'BOUNTY':
          const bountyContent = entry.content as FeedBountyContent;
          return `/bounty/${bountyContent.bounty.id}`;

        case 'COMMENT':
          const comment = entry.content as Comment;
          // For comments, we might want to link to the parent content with the comment ID as a hash
          if (entry.relatedWork?.contentType === 'paper') {
            return `/paper/${entry.relatedWork.id}/${entry.relatedWork.slug}#comment-${comment.id}`;
          } else {
            return `/post/${entry?.relatedWork?.id}/${entry?.relatedWork?.slug}#comment-${comment.id}`;
          }

        default:
          return undefined;
      }
    } catch (error) {
      console.error('Error generating href for entry:', error, entry);
      return undefined;
    }
  };

  // Render a feed entry based on its content type
  const renderFeedEntry = (entry: FeedEntry, isFirst: boolean) => {
    if (!entry) {
      console.error('Feed entry is undefined');
      return null;
    }
    // Apply appropriate spacing based on position
    const spacingClass = !isFirst ? 'mt-12' : '';

    // Generate the appropriate href for this entry
    const href = generateHref(entry);
    console.log('&entry!!', entry);
    try {
      // Use the contentType field on the FeedEntry object to determine the type of content
      switch (entry.contentType) {
        case 'POST':
        case 'PREREGISTRATION':
          return (
            <div key={entry.id} className={spacingClass}>
              <FeedItemFundraise entry={entry} href={href} />
            </div>
          );

        case 'PAPER':
          return (
            <div key={entry.id} className={spacingClass}>
              <FeedItemPaper entry={entry} href={href} />
            </div>
          );

        case 'BOUNTY':
          // Use the new FeedItemBounty component
          return (
            <div key={entry.id} className={spacingClass}>
              <FeedItemBounty
                entry={entry}
                relatedDocumentId={entry.relatedWork?.id}
                href={href}
                showContributeButton={false}
              />
            </div>
          );

        case 'COMMENT':
          // Use FeedItemComment for comment entries
          return (
            <div key={entry.id} className={spacingClass}>
              <FeedItemComment
                showReadMoreCTA={false}
                entry={entry}
                href={href}
                showCreatorActions={true}
              />
            </div>
          );

        default:
          throw new Error(`Unsupported content type: ${entry.contentType}`);
      }
    } catch (error) {
      console.error('Error rendering feed entry:', error);
      return (
        <div key={entry.id} className={spacingClass}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-medium">Error Rendering Entry - {entry.id}</h3>
            <p className="text-gray-600 mt-2">There was an error rendering this entry.</p>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {header && <div className="pt-4 pb-7">{header}</div>}

      <div className="max-w-4xl mx-auto">
        {tabs && <div className="border-b">{tabs}</div>}

        {filters && <div className="py-3">{filters}</div>}

        <div className="mt-8">
          {isLoading ? (
            // Show skeletons when loading
            <>
              {[...Array(3)].map((_, index) => (
                <div key={`skeleton-${index}`} className={index > 0 ? 'mt-12' : ''}>
                  <FeedItemSkeleton />
                </div>
              ))}
            </>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No feed entries found</p>
            </div>
          ) : (
            entries.map((entry, index) => renderFeedEntry(entry, index === 0))
          )}
        </div>

        {!isLoading && hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </>
  );
};
