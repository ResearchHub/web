'use client';

import { FC, ReactNode } from 'react';
import React from 'react';
import { FeedItemSkeleton } from './FeedItemSkeleton';
import { FeedEntry, FeedPostContent, FeedPaperContent, FeedBountyContent } from '@/types/feed';
import { Comment } from '@/types/comment';
import { FeedItemFundraise } from './items/FeedItemFundraise';
import { FeedItemPaper } from './items/FeedItemPaper';
import { FeedItemBounty } from './items/FeedItemBounty';
import { FeedItemComment } from './items/FeedItemComment';
import { FeedItemPost } from './items/FeedItemPost';
import { FundingCarousel } from '@/components/Fund/FundingCarousel';
import { BountiesCarousel } from '@/components/Earn/BountiesCarousel';
import { FeedTab } from '@/hooks/useFeed'; // Import FeedTab type

interface FeedContentProps {
  entries: FeedEntry[]; // Using FeedEntry type instead of RawApiFeedEntry
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  header?: ReactNode;
  tabs?: ReactNode;
  filters?: ReactNode; // New prop for source filters
  disableCardLinks?: boolean; // Optional prop to disable all card links
  activeTab: FeedTab; // Add the activeTab prop
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
  activeTab, // Destructure activeTab
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
          if (entry.relatedWork?.contentType === 'paper') {
            return `/paper/${entry.relatedWork.id}/${entry.relatedWork.slug}/bounties`;
          } else {
            return `/post/${entry?.relatedWork?.id}/${entry?.relatedWork?.slug}/bounties`;
          }
        case 'COMMENT':
          const comment = entry.content as Comment;
          // For comments, we might want to link to the parent content with the comment ID as a hash
          if (entry.relatedWork?.contentType === 'paper') {
            return `/paper/${entry.relatedWork.id}/${entry.relatedWork.slug}/conversation#comment-${comment.id}`;
          } else {
            return `/post/${entry?.relatedWork?.id}/${entry?.relatedWork?.slug}/conversation#comment-${comment.id}`;
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
  const renderFeedEntry = (entry: FeedEntry, index: number) => {
    if (!entry) {
      console.error('Feed entry is undefined');
      return null;
    }
    // Apply appropriate spacing based on position
    const spacingClass = index !== 0 ? 'mt-12' : '';

    // Generate the appropriate href for this entry
    const href = generateHref(entry);

    let content = null;

    try {
      // Use the contentType field on the FeedEntry object to determine the type of content
      switch (entry.contentType) {
        case 'POST':
          content = <FeedItemPost entry={entry} href={href} />;
          break;

        case 'PREREGISTRATION':
          content = <FeedItemFundraise entry={entry} href={href} />;
          break;

        case 'PAPER':
          content = <FeedItemPaper entry={entry} href={href} />;
          break;

        case 'BOUNTY':
          // Use the new FeedItemBounty component
          content = (
            <FeedItemBounty
              entry={entry}
              relatedDocumentId={entry.relatedWork?.id}
              href={href}
              showContributeButton={false}
            />
          );
          break;

        case 'COMMENT':
          // Use FeedItemComment for comment entries
          content = (
            <FeedItemComment
              showReadMoreCTA={false}
              entry={entry}
              href={href}
              showCreatorActions={true}
              workContentType={entry.relatedWork?.contentType}
            />
          );
          break;

        default:
          throw new Error(`Unsupported content type: ${entry.contentType}`);
      }
    } catch (error) {
      console.error('Error rendering feed entry:', error);
      content = (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-medium">Error Rendering Entry - {entry.id}</h3>
          <p className="text-gray-600 mt-2">There was an error rendering this entry.</p>
          <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div key={entry.id} className={spacingClass}>
        {content}
      </div>
    );
  };

  return (
    <>
      {header && <div className="pt-4 pb-7">{header}</div>}

      <div className="max-w-4xl mx-auto">
        {tabs && <div className="border-b">{tabs}</div>}

        {filters && <div className="py-3">{filters}</div>}

        <div className="mt-8">
          {/* Render existing entries */}
          {entries.length > 0 &&
            entries.map((entry, index) => (
              <React.Fragment key={entry.id}>
                {renderFeedEntry(entry, index)}
                {activeTab === 'popular' && index === 2 && <FundingCarousel />}
                {activeTab === 'popular' && index === 8 && <BountiesCarousel />}
              </React.Fragment>
            ))}

          {/* Show skeletons when loading (initial or load more) */}
          {isLoading && (
            <>
              {[...Array(3)].map((_, index) => (
                // Add margin-top if it's not the very first skeleton overall (i.e., if there are entries or previous skeletons)
                <div
                  key={`skeleton-${index}`}
                  className={index > 0 || entries.length > 0 ? 'mt-12' : ''}
                >
                  <FeedItemSkeleton />
                </div>
              ))}
            </>
          )}

          {/* Show 'No entries' message only if not loading and entries are empty */}
          {!isLoading && entries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No feed entries found</p>
            </div>
          )}
        </div>

        {/* Load More button */}
        {!isLoading && hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              // No need for disabled={isLoading} here as the whole block is conditional on !isLoading
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
