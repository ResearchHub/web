'use client';

import { FC, useMemo } from 'react';
import { peerReviewPapers } from '@/store/journalPaperStore';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry, FeedPaperContent } from '@/types/feed';
import { FeedItemPaper } from '@/components/Feed/items/FeedItemPaper';
import { ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

// Function to adapt peer review papers to feed entries
const adaptPeerReviewPapersToFeedEntries = (): FeedEntry[] => {
  return peerReviewPapers.map((paper) => {
    // Determine the work type based on paper status
    const workType = paper.status === 'preprint' ? 'preprint' : 'published';

    // Create a RawApiFeedEntry compatible object from a peer review paper
    const rawFeedEntry: RawApiFeedEntry = {
      id: paper.id,
      content_type: 'PAPER',
      content_object: {
        id: paper.id,
        title: `[Peer Review Needed] ${paper.title}`, // Add prefix to title
        abstract: paper.abstract,
        slug: paper.slug,
        created_date: paper.created_date,
        authors: paper.authors,
        hub: paper.unified_document?.hubs?.[0] || null,
        workType: workType,
        featured_image: paper.featured_image || null,
        journal: {
          id: 1,
          name: 'ResearchHub Journal',
          slug: 'researchhub-journal',
          image: null,
          description: 'Accelerating science through open access publishing',
          status: paper.status,
        },
        bounty_amount: paper.bounty_amount,
        peer_review_status: paper.peer_review_status,
      },
      created_date: paper.created_date,
      action: 'PUBLISH',
      action_date: paper.created_date,
      metrics: {
        votes: paper.score || 0,
        comments: paper.discussion_count || 0,
        review_metrics: paper.unified_document?.reviews || { avg: 0, count: 0 },
      },
      author: paper.uploaded_by
        ? {
            id: paper.uploaded_by.author_profile.id,
            first_name: paper.uploaded_by.first_name,
            last_name: paper.uploaded_by.last_name,
            description: '',
            profile_image: paper.uploaded_by.author_profile.profile_image || '',
            user: {
              id: paper.uploaded_by.id,
              first_name: paper.uploaded_by.first_name,
              last_name: paper.uploaded_by.last_name,
              email: '',
              is_verified: paper.uploaded_by.is_verified || false,
            },
          }
        : {
            // Default author when no uploader is available
            id: 0,
            first_name: 'Unknown',
            last_name: 'Author',
            description: '',
            profile_image: '',
            user: {
              id: 0,
              first_name: 'Unknown',
              last_name: 'Author',
              email: '',
              is_verified: false,
            },
          },
      user_vote: paper.user_vote
        ? {
            id: 0,
            content_type: 0,
            created_by: 0,
            created_date: '',
            vote_type: paper.user_vote === 'UPVOTE' ? 1 : 0,
            item: 0,
          }
        : undefined,
    };

    // Transform the raw feed entry to a proper FeedEntry
    return transformFeedEntry(rawFeedEntry);
  });
};

export const PeerReviewSection: FC = () => {
  // Transform peer review papers to feed entries
  const peerReview = useMemo(() => adaptPeerReviewPapersToFeedEntries(), []);

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center gap-2.5 mb-3 sm:mb-0">
          <div className="bg-amber-50 p-2 rounded-full">
            <ClipboardCheck className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Peer Review Earning Opportunity</h2>
            <p className="text-sm text-gray-600">
              Get paid $150 USD to review papers. Must be verified user.
              <Link href="/peer-review/learn-more" className="text-blue-600 hover:underline ml-1">
                Learn more
              </Link>
            </p>
          </div>
        </div>
        <Link
          href="/peer-review/opportunities"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 hover:underline"
        >
          View All Opportunities
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Peer Review Papers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {peerReview.slice(0, 4).map((entry) => {
          const paper = entry.content as any;
          const paperUrl = `/paper/${paper.id}/${paper.slug}`;

          return (
            <div key={entry.id} className="h-full">
              <FeedItemPaper
                entry={entry}
                href={paperUrl}
                showReviewStatus={false}
                showPeerReviewBounty={true}
                compact={true}
                className="h-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
