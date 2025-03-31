'use client';

import { FC, useMemo } from 'react';
import { journalPapers } from '@/store/journalPaperStore';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry, FeedPaperContent } from '@/types/feed';
import { Carousel } from '@/components/ui/Carousel';
import { FeedItemPaper } from '@/components/Feed/items/FeedItemPaper';
import Icon from '@/components/ui/icons/Icon';
import { Sparkles, FileText, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { authors, peerReviews } from '@/store/authorStore';
import { Reviewer } from '@/components/ui/ReviewerBadge';

// Adapter to transform journal papers to RawApiFeedEntry format (reused from JournalFeed)
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

export const JournalShowcase: FC = () => {
  // Transform journal papers to feed entries
  const allFeedEntries = useMemo(() => adaptJournalPapersToFeedEntries(), []);

  // Create mapping of paper IDs to reviewer data
  const paperReviewersMap = useMemo(() => {
    const map = new Map<number, Reviewer[]>();

    allFeedEntries.forEach((entry) => {
      if (entry.contentType === 'PAPER') {
        const paperId = entry.content.id;
        map.set(paperId, getReviewersForPaper(paperId));
      }
    });

    return map;
  }, [allFeedEntries]);

  // Filter for different carousels
  const recentlySubmitted = allFeedEntries;

  const trending = useMemo(
    () =>
      [...allFeedEntries]
        .sort((a, b) => (b.metrics?.votes || 0) - (a.metrics?.votes || 0))
        .slice(0, 8),
    [allFeedEntries]
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section with subtle background */}
      <div className="mb-12 text-center relative overflow-hidden py-10 px-6 bg-gradient-to-b from-indigo-50/60 to-white rounded-xl border border-indigo-100/50">
        <div className="absolute inset-0 bg-grid-indigo/[0.03] bg-[size:20px_20px]"></div>
        <div className="relative">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-md inline-flex">
              <Icon name="rhJournal2" size={40} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">ResearchHub Journal Showcase</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover the latest research published in our open access journal. From preprints to
            peer-reviewed articles, explore cutting-edge findings from researchers around the world.
          </p>

          {/* CTA buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/paper/create/pdf">
              <button className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition-all duration-200 inline-flex items-center">
                Submit Research
                <FileText className="ml-2 h-4 w-4" />
              </button>
            </Link>
            <Link href="/journal">
              <button className="px-5 py-2.5 bg-white text-indigo-600 border border-indigo-200 font-medium rounded-md shadow-sm hover:bg-indigo-50 transition-all duration-200">
                View All Papers
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recently submitted carousel */}
      <div className="mb-12">
        <Carousel
          title="All Journal Papers"
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

      {/* Thin Promotional Banner */}
      <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg overflow-hidden border border-indigo-100 transform transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Visual element and title */}
          <div className="flex items-center gap-3 p-4 md:p-6 md:pl-8">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Icon name="rhJournal1" size={38} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">
                Accelerate Scientific Progress
              </h3>
              <p className="text-sm text-indigo-700">
                Join leading researchers publishing in ResearchHub Journal
              </p>
            </div>
          </div>

          {/* Benefits section - hide on mobile */}
          <div className="hidden md:flex justify-center p-6 space-x-12">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-full">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-800">Fast Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-full">
                <Icon name="rscGold" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-800">Earn RSC</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-full">
                <Icon name="doi" size={20} />
              </div>
              <span className="text-sm font-medium text-gray-800">Get a DOI</span>
            </div>
          </div>

          {/* Contributors and CTA */}
          <div className="flex items-center gap-6 p-4 md:p-6 md:pr-8 bg-indigo-100/50">
            <div className="hidden sm:block">
              <p className="text-xs text-indigo-700 font-medium mb-1">Our contributors:</p>
              <AvatarStack
                items={[
                  {
                    src: 'https://www.researchhub.com/static/editorial-board/MaulikDhandha.jpeg',
                    alt: 'Maulik Dhandha',
                    tooltip: 'Maulik Dhandha, Editor',
                  },
                  {
                    src: 'https://www.researchhub.com/static/editorial-board/EmilioMerheb.jpeg',
                    alt: 'Emilio Merheb',
                    tooltip: 'Emilio Merheb, Editor',
                  },
                  {
                    src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/05/07/blob_48esqmw',
                    alt: 'Journal Editor',
                    tooltip: 'Editorial Board Member',
                  },
                  {
                    src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
                    alt: 'Journal Editor',
                    tooltip: 'Editorial Board Member',
                  },
                  {
                    src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2023/06/25/blob',
                    alt: 'Journal Editor',
                    tooltip: 'Editorial Board Member',
                  },
                ]}
                size="xs"
                maxItems={5}
                spacing={-8}
                showExtraCount={true}
                ringColorClass="ring-white"
              />
            </div>
            <Link href="/paper/create/pdf">
              <button className="flex items-center gap-1 px-5 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition-all">
                Submit Paper
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Trending papers carousel */}
      <div className="mb-12">
        <Carousel
          title="Trending Papers"
          icon={
            <div className="relative">
              <TrendingUp className="h-6 w-6 text-rose-500" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            </div>
          }
          onSeeAllClick={() => (window.location.href = '/journal')}
          seeAllText="View All Papers"
          itemsPerSlide={4}
        >
          {trending.map((entry) => (
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

      {/* Submit CTA Banner */}
      <div className="mt-20 mb-10 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-xl shadow-xl overflow-hidden">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-lg"></div>

          <div className="px-8 py-12 text-center relative">
            <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="rhJournal2" size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Share Your Research with the World?
            </h2>
            <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join researchers who are accelerating scientific progress. Submit your work to
              ResearchHub Journal today and reach a global audience of peers.
            </p>
            <Link href="/paper/create/pdf">
              <button className="px-8 py-3 bg-white text-indigo-700 font-bold rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center mx-auto">
                <FileText className="mr-2 h-5 w-5" />
                Submit Your Paper
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
