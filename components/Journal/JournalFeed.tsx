'use client';

import { FC, useMemo, ReactNode, useState, useEffect } from 'react';
import { Book, BookOpen, Check, Zap, Eye, Globe, Award } from 'lucide-react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';
import Link from 'next/link';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { RHJournalService } from '@/services/rh-journal.service';

interface JournalFeedProps {
  activeTab: string;
  isLoading: boolean;
}

export const JournalFeed: FC<JournalFeedProps> = ({ activeTab, isLoading: initialLoading }) => {
  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Map active tab to API filter value
  const getPublicationStatus = () => {
    switch (activeTab) {
      case 'in-review':
        return 'PREPRINT';
      case 'published':
        return 'PUBLISHED';
      default:
        return 'ALL';
    }
  };

  // Load journal papers on mount and when tab changes
  useEffect(() => {
    const fetchJournalPapers = async () => {
      setLoading(true);
      try {
        const publicationStatus = getPublicationStatus();
        const response = await RHJournalService.getJournalPapers({
          page: 1,
          pageSize: 10,
          publicationStatus,
          journalStatus: 'IN_JOURNAL',
        });

        // Transform API response to FeedEntry objects
        const entries = response.results
          .map((entry: RawApiFeedEntry) => {
            try {
              return transformFeedEntry(entry);
            } catch (error) {
              console.error('Error transforming feed entry:', error);
              return null;
            }
          })
          .filter((entry): entry is FeedEntry => !!entry);

        setFeedEntries(entries);
        setHasMore(!!response.next);
        setPage(1);
      } catch (error) {
        console.error('Failed to fetch journal papers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJournalPapers();
  }, [activeTab]);

  // Function to load more entries
  const loadMore = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const publicationStatus = getPublicationStatus();
      const nextPage = page + 1;
      const response = await RHJournalService.getJournalPapers({
        page: nextPage,
        pageSize: 10,
        publicationStatus,
        journalStatus: 'IN_JOURNAL',
      });

      // Transform and append new entries
      const newEntries = response.results
        .map((entry: RawApiFeedEntry) => {
          try {
            return transformFeedEntry(entry);
          } catch (error) {
            console.error('Error transforming feed entry:', error);
            return null;
          }
        })
        .filter((entry): entry is FeedEntry => !!entry);

      setFeedEntries([...feedEntries, ...newEntries]);
      setHasMore(!!response.next);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more journal papers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample journal contributors for social proof
  const journalContributors = [
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
    <div className="bg-gradient-to-b from-primary-50/80 to-white p-6 rounded-lg border border-primary-100">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-7 w-7 text-primary-700" />
        <h1 className="text-xl font-semibold text-primary-900 text-center">
          Accelerate Your Research Impact with ResearchHub Journal
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-primary-100 p-1.5 rounded-full">
              <Zap className="h-5 w-5 text-primary-700" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Fast Review Process</h3>
              <p className="text-sm text-gray-600">
                Get expert feedback and decisions in weeks, not months
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary-100 p-1.5 rounded-full">
              <Eye className="h-5 w-5 text-primary-700" />
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
            <div className="bg-primary-100 p-1.5 rounded-full">
              <Award className="h-5 w-5 text-primary-700" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Paid Peer Reviewers</h3>
              <p className="text-sm text-gray-600">Ensuring thorough and high-quality feedback</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary-100 p-1.5 rounded-full">
              <Globe className="h-5 w-5 text-primary-700" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Open Science First</h3>
              <p className="text-sm text-gray-600">Maximizing accessibility and research impact</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 my-6"></div>

      <div className="flex flex-col md:!flex-row justify-between items-center gap-5">
        <div>
          <p className="text-sm text-gray-700 font-medium mb-2">
            Join other researchers that chose open science:
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
          <button className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-md shadow-sm hover:bg-primary-700 transition-all duration-200 inline-flex items-center">
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
    // Don't show empty state if we're loading
    if (loading) {
      return (
        <FeedContent
          entries={[]}
          isLoading={true}
          hasMore={false}
          loadMore={() => {}}
          header={feedHeader}
          activeTab={'popular' as any}
        />
      );
    }

    if (activeTab === 'all' && feedEntries.length >= 2) {
      // Create components array with entries and banner
      const components: ReactNode[] = [];

      // Add first two entries
      feedEntries.slice(0, 2).forEach((entry: FeedEntry, index) => {
        components.push(
          <div key={entry.id} className={index > 0 ? 'mt-12' : ''}>
            <FeedContent
              entries={[entry]}
              isLoading={false}
              hasMore={false}
              loadMore={() => {}}
              header={null}
              activeTab={'popular' as any}
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
      feedEntries.slice(2).forEach((entry: FeedEntry) => {
        components.push(
          <div key={entry.id} className="mt-12">
            <FeedContent
              entries={[entry]}
              isLoading={false}
              hasMore={false}
              loadMore={() => {}}
              header={null}
              activeTab={'popular' as any}
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
        isLoading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        header={feedHeader}
        activeTab={'popular' as any}
      />
    );
  };

  // Journal-specific header
  const feedHeader =
    activeTab === 'in-review' ? (
      <>
        <div className="bg-[#fff9e6] border-l-4 border-[#dc9814] p-6 relative mt-6">
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
      </>
    ) : activeTab === 'published' ? (
      <>
        <div className="bg-green-50 border-l-4 border-green-500 p-6 relative mt-6">
          <div className="absolute left-6 top-9">
            <span className="h-2 w-2 rounded-full bg-green-500 block"></span>
          </div>
          <div className="ml-5">
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              The following papers have been peer reviewed and approved by our editorial team.
            </h1>
            <p className="text-gray-600 text-sm">
              These works have successfully completed our rigorous peer review process.
            </p>
          </div>
        </div>
      </>
    ) : null;

  return <div className="space-y-4">{renderFeedEntries()}</div>;
};
