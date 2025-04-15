'use client';

import { FC, useMemo, ReactNode } from 'react';
import { Book, BookOpen, Check, Zap, Eye, Globe, Award } from 'lucide-react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { journalPapers } from '@/store/journalPaperStore';
import {
  FeedEntry,
  RawApiFeedEntry,
  transformFeedEntry,
  FeedPaperContent,
  FeedActionType,
} from '@/types/feed';
import Link from 'next/link';
import { AvatarStack } from '@/components/ui/AvatarStack';

interface JournalFeedProps {
  activeTab: string;
  isLoading: boolean;
  tabs: React.ReactNode;
}

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

export const JournalFeed: FC<JournalFeedProps> = ({ activeTab, isLoading, tabs }) => {
  // Transform journal papers to feed entries
  const allFeedEntries = useMemo(() => adaptJournalPapersToFeedEntries(), []);

  // Filter entries based on the active tab
  const feedEntries = useMemo(() => {
    if (activeTab === 'all') {
      return allFeedEntries;
    } else if (activeTab === 'in-review') {
      return allFeedEntries.filter((entry) => {
        const rawData = entry.raw?.content_object;
        return rawData?.journal?.status === 'preprint';
      });
    } else if (activeTab === 'published') {
      return allFeedEntries.filter((entry) => {
        const rawData = entry.raw?.content_object;
        return rawData?.journal?.status === 'published';
      });
    }
    return allFeedEntries;
  }, [activeTab, allFeedEntries]);

  // Sample journal contributors for social proof
  const journalContributors = [
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
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
      alt: 'Journal Editor',
      tooltip: 'Editorial Board Member',
    },
    {
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/23/blob_oVmwyhP',
      alt: 'Journal Editor',
      tooltip: 'Editorial Board Member',
    },
    {
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2023/06/25/blob',
      alt: 'Journal Editor',
      tooltip: 'Editorial Board Member',
    },
  ];

  // Promotional Banner Component
  const PromoBanner = () => (
    <div className="bg-gradient-to-b from-indigo-50/80 to-white p-6 rounded-lg border border-indigo-100">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="h-7 w-7 text-indigo-700" />
        <h1 className="text-xl font-semibold text-indigo-900">
          Accelerate Your Research Impact with ResearchHub Journal
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-1.5 rounded-full">
              <Zap className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Fast Review Process</h3>
              <p className="text-sm text-gray-600">
                Get expert feedback and decisions in weeks, not months
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-1.5 rounded-full">
              <Eye className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Enhanced Visibility</h3>
              <p className="text-sm text-gray-600">
                Share with our active community of researchers
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-1.5 rounded-full">
              <Award className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Paid Peer Reviewers</h3>
              <p className="text-sm text-gray-600">Ensuring thorough and high-quality feedback</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-1.5 rounded-full">
              <Globe className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Open Science First</h3>
              <p className="text-sm text-gray-600">Maximizing accessibility and research impact</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-md border border-blue-100 flex items-center mb-5">
        <svg
          className="h-4 w-4 text-blue-800 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-blue-800 font-medium">
          Limited time offer: Journal submissions are currently free!
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-5">
        <div>
          <p className="text-sm text-gray-700 font-medium mb-2">
            Join these researchers who've already published:
          </p>
          <AvatarStack
            items={journalContributors}
            size="sm"
            maxItems={7}
            spacing={-4}
            showExtraCount={true}
            ringColorClass="ring-white"
            disableTooltip={true}
            className="flex-shrink-0"
          />
        </div>

        <Link href="/paper/create/pdf" className="flex-shrink-0">
          <button className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition-all duration-200 inline-flex items-center">
            Publish your research
            <svg
              className="ml-2 w-4 h-4"
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
  );

  // Custom rendering for feed entries that allows for inserting the promo banner
  const renderFeedEntries = () => {
    if (activeTab === 'all' && feedEntries.length >= 2) {
      // Create components array with entries and banner
      const components: ReactNode[] = [];

      // Add first two entries
      feedEntries.slice(0, 2).forEach((entry, index) => {
        components.push(
          <div key={entry.id} className={index > 0 ? 'mt-12' : ''}>
            {/* This would be your FeedItemPaper component normally */}
            <FeedContent
              entries={[entry]}
              isLoading={false}
              hasMore={false}
              loadMore={() => {}}
              header={null}
            />
          </div>
        );
      });

      // Add promo banner after first two entries
      components.push(
        <div key="promo-banner" className="mt-12">
          <PromoBanner />
        </div>
      );

      // Add remaining entries
      feedEntries.slice(2).forEach((entry) => {
        components.push(
          <div key={entry.id} className="mt-12">
            <FeedContent
              entries={[entry]}
              isLoading={false}
              hasMore={false}
              loadMore={() => {}}
              header={null}
            />
          </div>
        );
      });

      return (
        <div className="max-w-4xl mx-auto">
          <div className="mt-8">{components}</div>
        </div>
      );
    }

    // Default rendering for other tabs
    return (
      <FeedContent
        entries={feedEntries}
        isLoading={isLoading}
        hasMore={false}
        loadMore={() => {}} // No-op since we don't have pagination for now
        header={feedHeader}
      />
    );
  };

  // Journal-specific header
  const feedHeader = (
    <>
      {activeTab === 'in-review' ? (
        <div className="bg-[#fff9e6] border-l-4 border-[#dc9814] p-6 relative">
          <div className="absolute left-6 top-9">
            <span className="h-2 w-2 rounded-full bg-[#dc9814] block"></span>
          </div>
          <div className="ml-5">
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              The following preprints have been submitted and are currently under review.
            </h1>
            <p className="text-gray-600 text-sm">
              Help advance scientific knowledge by participating in our peer review process.
            </p>
          </div>
          <div className="mt-6 ml-5">
            <Link
              href="https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="px-4 py-2 bg-[#dc9814] text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 inline-flex items-center">
                Become a Peer Reviewer
                <svg
                  className="ml-2 w-4 h-4"
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
      ) : (
        <h1 className="text-xl text-gray-600 flex items-center gap-2">
          <Book className="w-5 h-5 text-indigo-500" />
          {activeTab === 'published'
            ? 'Published research in ResearchHub Journal'
            : 'All submissions in ResearchHub Journal'}
        </h1>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      {tabs}

      {renderFeedEntries()}
    </div>
  );
};
