'use client';

import { FC, ReactNode, useEffect, useState } from 'react';
import { FeedItemSkeleton } from './FeedItemSkeleton';
import { BountyCard, SolutionViewEvent } from '@/components/Bounty/BountyCard';
import { PaperCard, PaperViewEvent } from '@/components/Paper/PaperCard';
import { Bounty } from '@/types/bounty';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FeedService } from '@/services/feed.service';
import { FeedEntry } from '@/types/feed';
import { Work, WorkType, ContentType } from '@/types/work';
import { Comment } from '@/types/comment';
import { CommentCard } from '@/components/Comment/CommentCard';

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

// Create a test paper for debugging
const createTestPaper = (): Work => {
  return {
    id: 888,
    type: 'paper' as WorkType,
    contentType: 'paper',
    title: 'Test Paper: Advances in AI Research',
    slug: 'test-paper-advances-in-ai-research',
    createdDate: new Date().toISOString(),
    publishedDate: new Date().toISOString(),
    authors: [
      {
        authorProfile: {
          id: 1,
          fullName: 'Jane Smith',
          profileImage: '',
          headline: 'AI Researcher',
          profileUrl: '/profile/1',
          user: {
            id: 1,
            email: 'jane@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            fullName: 'Jane Smith',
            isVerified: true,
            balance: 0,
          },
        },
        isCorresponding: true,
        position: 'first',
      },
      {
        authorProfile: {
          id: 2,
          fullName: 'John Doe',
          profileImage: '',
          headline: 'Data Scientist',
          profileUrl: '/profile/2',
          user: {
            id: 2,
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            isVerified: false,
            balance: 0,
          },
        },
        isCorresponding: false,
        position: 'middle',
      },
      {
        authorProfile: {
          id: 3,
          fullName: 'Alice Johnson',
          profileImage: '',
          headline: 'Professor',
          profileUrl: '/profile/3',
          user: {
            id: 3,
            email: 'alice@example.com',
            firstName: 'Alice',
            lastName: 'Johnson',
            fullName: 'Alice Johnson',
            isVerified: true,
            balance: 0,
          },
        },
        isCorresponding: false,
        position: 'last',
      },
    ],
    abstract:
      'This is a test paper abstract that discusses recent advances in artificial intelligence research. The paper explores various machine learning techniques and their applications in real-world scenarios. It also addresses ethical considerations and future directions for AI development.',
    doi: '10.1234/test.2023.001',
    journal: {
      id: 1,
      name: 'Journal of AI Research',
      imageUrl: '',
      slug: 'journal-of-ai-research',
    },
    topics: [
      {
        id: 1,
        name: 'Artificial Intelligence',
        slug: 'ai',
      },
      {
        id: 2,
        name: 'Machine Learning',
        slug: 'machine-learning',
      },
    ],
    formats: [
      {
        type: 'pdf',
        url: '/test-paper.pdf',
      },
    ],
    figures: [],
    versions: [],
    metrics: {
      views: 100,
      votes: 25,
      comments: 10,
      saves: 15,
    },
    unifiedDocumentId: 123,
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
  const router = useRouter();
  const { data: session } = useSession();

  // Render a feed entry based on its content type
  const renderFeedEntry = (entry: FeedEntry, isFirst: boolean) => {
    if (!entry) {
      console.error('Feed entry is undefined');
      return null;
    }

    console.log('entry', entry);

    // Apply appropriate spacing based on position
    const spacingClass = !isFirst ? 'mt-6' : '';

    try {
      // Check if this is a bounty (has bountyType property), a comment, or a work
      const isBounty = 'bountyType' in entry.content;
      const isComment = 'commentType' in entry.content;

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
      } else if (isComment) {
        // This is a Comment
        const comment = entry.content as Comment;

        // Determine the content type based on the thread type or document type
        const contentType: ContentType =
          comment.thread?.threadType?.toLowerCase() === 'paper' ? 'paper' : 'post';

        // Generate a slug for the comment
        let slug = '';
        if (entry.relatedWork?.slug) {
          slug = `papers/${entry.relatedWork.slug}`;
        } else {
          slug = `comment/${comment.id}`;
        }

        return (
          <div key={entry.id} className={spacingClass}>
            <CommentCard
              comment={comment}
              contentType={contentType}
              onUpvote={(id) => console.log('Upvote comment:', id)}
              onReply={(id) => console.log('Reply to comment:', id)}
              onReport={(id) => console.log('Report comment:', id)}
              onShare={(id) => console.log('Share comment:', id)}
              onEdit={(id) => console.log('Edit comment:', id)}
              onDelete={(id) => console.log('Delete comment:', id)}
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
            // Handle viewing a paper
            const handleViewPaper = (event: PaperViewEvent) => {
              router.push(`/paper/${event.paperId}/${work.slug || 'details'}`);
            };

            // Check if the current user is the author
            const isAuthor = session?.user?.id === work.authors?.[0]?.authorProfile?.user?.id;

            return (
              <div key={entry.id} className={spacingClass}>
                <PaperCard
                  paper={work}
                  slug={work.slug}
                  isCreator={isAuthor}
                  onViewPaper={handleViewPaper}
                  onUpvote={(id) => console.log('Upvote paper:', id)}
                  onComment={(id) =>
                    router.push(`/paper/${id}/${work.slug || 'details'}?tab=conversation`)
                  }
                  onShare={(id) => console.log('Share paper:', id)}
                  onAddToLibrary={(id) => console.log('Add paper to library:', id)}
                  showFooter={true}
                  showActions={true}
                />
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
                  {isBounty && (
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

  // Handle test paper actions
  const handleTestViewPaper = (event: PaperViewEvent) => {
    console.log('View paper:', event);
  };

  return (
    <>
      {header && <div className="pt-4 pb-7">{header}</div>}

      <div className="max-w-4xl mx-auto">
        {tabs}

        <div className="mt-4">
          {isLoading ? (
            // Show skeletons when loading
            <>
              {[...Array(3)].map((_, index) => (
                <div key={`skeleton-${index}`} className={index > 0 ? 'mt-6' : ''}>
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
