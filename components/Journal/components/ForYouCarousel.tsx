'use client';

import { FC, useMemo } from 'react';
import { forYouPapers } from '@/store/journalPaperStore';
import { Carousel } from '@/components/ui/Carousel';
import { FeedItemPaper } from '@/components/Feed/items/FeedItemPaper';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry, FeedPaperContent } from '@/types/feed';
import { BookOpen, Sparkles } from 'lucide-react';

// Function to adapt "For You" papers to feed entries
const adaptForYouPapersToFeedEntries = (): FeedEntry[] => {
  return forYouPapers.map((paper) => {
    // Determine the work type based on paper status
    const workType = paper.status === 'preprint' ? 'preprint' : 'published';

    // Create a RawApiFeedEntry compatible object from a "For You" paper
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
          id: paper.journal?.id || 4,
          name: paper.journal?.name || 'Journal',
          slug: paper.journal?.slug || 'journal',
          image: paper.journal?.imageUrl || null,
          description: paper.journal?.description || 'Scientific journal',
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

export const ForYouCarousel: FC = () => {
  // Transform "For You" papers to feed entries
  const forYou = useMemo(() => adaptForYouPapersToFeedEntries(), []);

  return (
    <div className="mb-8">
      <Carousel
        title="New papers for you"
        icon={<Sparkles className="h-6 w-6" color="blue" />}
        onSeeAllClick={() => (window.location.href = '/for-you')}
        seeAllText="View All Recommendations"
        itemsPerSlide={4}
      >
        {forYou.map((entry) => (
          <div key={entry.id} className="h-[340px]">
            <FeedItemPaper
              key={entry.id}
              entry={entry}
              href={
                entry.contentType === 'PAPER'
                  ? `/paper/${entry.content.id}/${(entry.content as FeedPaperContent).slug}`
                  : undefined
              }
              showReviewStatus={false}
              compact={true}
              className="h-full"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};
