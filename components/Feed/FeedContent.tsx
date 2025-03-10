'use client';

import { FC, ReactNode, useEffect, useState } from 'react';
import { FeedItemSkeleton } from './FeedItemSkeleton';
import { BountyCard, SolutionViewEvent } from '@/components/Bounty/BountyCard';
import { Bounty } from '@/types/bounty';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FeedService } from '@/services/feed.service';
import { FeedEntry } from '@/types/feed';
import { Work } from '@/types/work';

interface FeedContentProps {
  entries: FeedEntry[]; // Using FeedEntry type instead of RawApiFeedEntry
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  header?: ReactNode;
  tabs: ReactNode;
}

// Create a test bounty for debugging
const createTestBounty = (): Bounty => {
  return {
    id: 999,
    amount: '100',
    status: 'OPEN',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    bountyType: 'REVIEW',
    createdBy: {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      isVerified: true,
      balance: 0,
      authorProfile: {
        id: 1,
        fullName: 'Test User',
        profileImage: '', // Empty string instead of null
        headline: 'Test User',
        profileUrl: '/profile/1',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          fullName: 'Test User',
          isVerified: true,
          balance: 0,
        },
      },
    },
    solutions: [],
    contributions: [],
    totalAmount: '100',
    raw: {
      id: 999,
      amount: 100,
      bounty_type: 'REVIEW',
      document_type: 'PAPER',
      expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'OPEN',
      created_date: new Date().toISOString(),
      action_date: new Date().toISOString(),
      author: {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        profile_image: '', // Empty string instead of null
        headline: 'Test User',
        user: {
          id: 1,
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          is_verified: true,
        },
      },
      hub: {
        name: 'Test Hub',
        slug: 'test-hub',
      },
    },
  };
};

export const FeedContent: FC<FeedContentProps> = ({
  entries,
  isLoading,
  hasMore,
  loadMore,
  header,
  tabs,
}) => {
  console.log('entries', entries);

  const router = useRouter();
  const { data: session } = useSession();
  const [showDebug, setShowDebug] = useState(true);
  const [useRawData, setUseRawData] = useState(true);

  // Add debugging to check what entries we're receiving
  useEffect(() => {
    if (entries && entries.length > 0) {
      console.log('Feed entries count:', entries.length);
      console.log('First entry:', entries[0]);

      // Count bounty entries - check if content has a bountyType property
      const bountyEntries = entries.filter((entry) => 'bountyType' in entry.content);
      console.log('Bounty entries count:', bountyEntries.length);

      if (bountyEntries.length > 0) {
        console.log('First bounty entry:', bountyEntries[0]);
      }
    }
  }, [entries]);

  // Render a feed entry based on its content type
  const renderFeedEntry = (entry: FeedEntry, isFirst: boolean) => {
    if (!entry) {
      console.error('Feed entry is undefined');
      return null;
    }

    console.log('entry---------', entry);

    // Apply appropriate spacing based on position
    const spacingClass = !isFirst ? 'mt-6' : '';

    try {
      // Check if this is a bounty (has bountyType property) or a work
      const isBounty = 'bountyType' in entry.content;

      if (showDebug) {
        console.log(`Entry ${entry.id}: isBounty=${isBounty}`, entry);
      }

      // Render based on content type
      if (isBounty) {
        // For bounties, we need to use the raw data to create a Bounty object
        // that's compatible with the BountyCard component
        if (!entry.raw) {
          throw new Error('Raw bounty data is missing');
        }

        const bounty = FeedService.transformRawBounty(entry.raw);

        // Generate a slug for the bounty
        let slug = `bounty/${bounty.id}`;

        // If the bounty is associated with a paper, include the paper slug
        const bountyContent = entry.content as { paper?: Work };
        if (bountyContent.paper?.slug) {
          slug = `papers/${bountyContent.paper.slug}/bounty/${bounty.id}`;
        }

        // Handle viewing a solution
        const handleViewSolution = (event: SolutionViewEvent) => {
          router.push(`/${slug}/solutions/${event.solutionId}`);
        };

        // Handle navigation to different tabs
        const handleNavigationClick = (tab: 'reviews' | 'conversation') => {
          router.push(`/${slug}?tab=${tab}`);
        };

        // Check if the current user is the author
        const isAuthor = session?.user?.id === entry.raw.author?.user?.id;

        return (
          <div key={entry.id} className={spacingClass}>
            <BountyCard
              bounty={bounty}
              relatedWork={entry.relatedWork}
              slug={slug}
              isCreator={isAuthor}
              onViewSolution={handleViewSolution}
              onNavigationClick={handleNavigationClick}
              onUpvote={(id) => console.log('Upvote bounty:', id)}
              onReply={(id) => router.push(`/${slug}?reply=true`)}
              onShare={(id) => console.log('Share bounty:', id)}
              showFooter={true}
              showActions={true}
            />
          </div>
        );
      } else {
        // This is a Work
        const work = entry.content as Work;

        // Render based on the work's contentType
        switch (work.contentType) {
          case 'paper':
            return (
              <div key={entry.id} className={spacingClass}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-medium">{work.title}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-3">{work.abstract}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <span>
                      {work.authors?.length > 0
                        ? work.authors.map((a) => a.authorProfile.fullName).join(', ')
                        : 'Unknown authors'}
                    </span>
                    {work.doi && (
                      <>
                        <span className="mx-2">•</span>
                        <span>DOI: {work.doi}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );

          case 'post':
          case 'question':
          case 'discussion':
            return (
              <div key={entry.id} className={spacingClass}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                      {work.authors[0]?.authorProfile.profileImage && (
                        <img
                          src={work.authors[0].authorProfile.profileImage}
                          alt={work.authors[0].authorProfile.fullName}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">
                        {work.authors[0]?.authorProfile.fullName || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(work.publishedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mt-3">{work.title}</h3>
                  <p className="text-gray-600 mt-2">{work.previewContent || work.abstract}</p>
                </div>
              </div>
            );

          default:
            // For unsupported work types, we'll render a placeholder
            return (
              <div key={entry.id} className={spacingClass}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-medium">Unknown work type: {work.contentType}</h3>
                  <p className="text-gray-600 mt-2">
                    This content type is not yet supported in the feed.
                  </p>
                  {showDebug && (
                    <div className="mt-4">
                      <h4 className="font-medium">Data:</h4>
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(entry, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
        }
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
            {showDebug && (
              <div className="mt-4">
                <h4 className="font-medium">Data:</h4>
                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(entry, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // Create a test bounty for debugging
  const testBounty = createTestBounty();

  // Handle test bounty actions
  const handleTestViewSolution = (event: SolutionViewEvent) => {
    console.log('View solution:', event);
  };

  const handleTestNavigationClick = (tab: 'reviews' | 'conversation') => {
    console.log('Navigate to tab:', tab);
  };

  return (
    <>
      {header && <div className="pt-4 pb-7">{header}</div>}

      <div className="max-w-4xl mx-auto">
        {tabs}

        {/* Debug Controls */}
        <div className="mt-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Debug Controls</h2>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showDebug}
                  onChange={() => setShowDebug(!showDebug)}
                  className="mr-2"
                />
                Show Debug Logs
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useRawData}
                  onChange={() => setUseRawData(!useRawData)}
                  className="mr-2"
                />
                Use Raw Data
              </label>
            </div>
          </div>
        </div>

        {/* Test Bounty Card */}
        <div className="mt-4 mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-medium mb-4">Test Bounty Card</h2>
          <BountyCard
            bounty={testBounty}
            slug="test-bounty"
            isCreator={false}
            onViewSolution={handleTestViewSolution}
            onNavigationClick={handleTestNavigationClick}
            onUpvote={(id) => console.log('Upvote test bounty:', id)}
            onReply={(id) => console.log('Reply to test bounty:', id)}
            onShare={(id) => console.log('Share test bounty:', id)}
            showFooter={true}
            showActions={true}
          />
        </div>

        <div className="mt-8 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <FeedItemSkeleton key={i} />
              ))}
            </div>
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
