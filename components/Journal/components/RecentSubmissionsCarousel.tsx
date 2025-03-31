'use client';

import { FC, useMemo } from 'react';
import { journalPapers } from '@/store/journalPaperStore';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry, FeedPaperContent } from '@/types/feed';
import { Carousel } from '@/components/ui/Carousel';
import { FeedItemPaper } from '@/components/Feed/items/FeedItemPaper';
import Icon from '@/components/ui/icons/Icon';
import { peerReviews } from '@/store/authorStore';
import { authors } from '@/store/authorStore';
import { Reviewer } from '@/components/ui/ReviewerBadge';

// Adapter to transform journal papers to RawApiFeedEntry format
const adaptJournalPapersToFeedEntries = (): FeedEntry[] => {
  return journalPapers.map((paper) => {
    // Determine the work type based on paper status
    const workType = paper.status === 'preprint' ? 'preprint' : 'published';

    // Create a RawApiFeedEntry compatible object from a journal paper
    const rawFeedEntry: RawApiFeedEntry = {
      id: paper.id,
      content_type: 'PAPER',
      content_object: {
        id: paper.id,
        title: paper.title,
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

// Function to get reviewer data for a specific paper
const getReviewersForPaper = (paperId: number): Reviewer[] => {
  // Find all reviews for this paper
  const paperReviews = peerReviews.filter((review) => review.paperId === paperId);

  // Get author details for each review
  return paperReviews.map((review) => {
    // Find author details if reviewerId exists
    const author = review.reviewerId ? authors.find((a) => a.id === review.reviewerId) : null;

    return {
      id: author?.id || null,
      name: author?.fullName || 'Unassigned Reviewer',
      image: author?.profileImage || null,
      status: review.status,
      comment: review.comment,
      date: review.date,
    };
  });
};

export const RecentSubmissionsCarousel: FC = () => {
  // Transform journal papers to feed entries
  const recentlySubmitted = useMemo(() => adaptJournalPapersToFeedEntries(), []);

  // Create mapping of paper IDs to reviewer data
  const paperReviewersMap = useMemo(() => {
    const map = new Map<number, Reviewer[]>();

    recentlySubmitted.forEach((entry) => {
      if (entry.contentType === 'PAPER') {
        const paperId = entry.content.id;
        map.set(paperId, getReviewersForPaper(paperId));
      }
    });

    return map;
  }, [recentlySubmitted]);

  return (
    <div className="mb-12">
      <Carousel
        title="Recent submissions to the RH Journal"
        icon={<Icon name="rhJournal2" size={28} className="text-indigo-600" />}
        onSeeAllClick={() => (window.location.href = '/journal')}
        seeAllText="View All Papers"
        itemsPerSlide={4}
      >
        {recentlySubmitted.map((entry) => (
          <div key={entry.id} className="h-[420px]">
            <FeedItemPaper
              entry={entry}
              href={
                entry.contentType === 'PAPER'
                  ? `/paper/${entry.content.id}/${(entry.content as FeedPaperContent).slug}`
                  : undefined
              }
              showReviewStatus={true}
              reviewers={
                entry.contentType === 'PAPER' ? paperReviewersMap.get(entry.content.id) || [] : []
              }
              compact={true}
              className="h-full"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};
