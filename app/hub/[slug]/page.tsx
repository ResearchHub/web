'use client';

import { useParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { hubs as hubsStore } from '@/store/hubStore';
import { HubBanner } from '@/components/Hub/HubBanner';
import { HubSidebarInfo } from '@/components/Hub/HubSidebarInfo';
import { FeedContent } from '@/components/Feed/FeedContent';
import { pinnedLongevityFeed, remainingLongevityFeed } from '@/store/mockLongevityFeed';
import { FeedEntry, FeedPostContent, FeedPaperContent } from '@/types/feed';
import React from 'react';
import { Pin } from 'lucide-react';

export default function HubDetailPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;

  // Find the hub from the mock store based on slug
  const hub = slug ? Object.values(hubsStore).find((h) => h.slug === slug) : undefined;

  if (!hub) {
    // TODO: Add a proper not found page or component
    return <PageLayout>Hub not found</PageLayout>;
  }

  // Combine pinned and remaining feed items
  const allEntries = [...pinnedLongevityFeed, ...remainingLongevityFeed];

  // Render a feed entry based on its content type (reuse from FeedContent or similar)
  const renderFeedEntry = (entry: FeedEntry, index: number) => {
    // This is simplified - copy/adapt the logic from FeedContent.tsx
    // to render different item types (FeedItemPost, FeedItemPaper, etc.)
    // You'll need to import those components.
    // For this demo, we'll just show the title.
    let content = null;
    try {
      switch (entry.contentType) {
        case 'POST':
          // Safely access title for POST
          const postTitle = (entry.content as FeedPostContent)?.title || 'Untitled Post';
          content = (
            <div className="p-4 border rounded mb-4 bg-white shadow-sm">Post: {postTitle}</div>
          );
          break;
        case 'PAPER':
          // Safely access title for PAPER
          const paperTitle = (entry.content as FeedPaperContent)?.title || 'Untitled Paper';
          content = (
            <div className="p-4 border rounded mb-4 bg-white shadow-sm">Paper: {paperTitle}</div>
          );
          break;
        // Add cases for other types if needed for the demo, or keep default
        default:
          content = (
            <div className="p-4 border rounded mb-4 bg-white shadow-sm">
              Feed Entry (Type: {entry.contentType})
            </div>
          );
      }
    } catch (e) {
      content = (
        <div className="p-4 border rounded mb-4 bg-red-100 shadow-sm">Error loading entry</div>
      );
    }

    return (
      <div key={entry.id} className={index !== 0 ? 'mt-6' : ''}>
        {content}
      </div>
    );
  };

  return (
    <PageLayout rightSidebar={<HubSidebarInfo hub={hub} />}>
      <HubBanner hub={hub} />
      <div className="py-6">
        {/* Pinned Section */}
        {pinnedLongevityFeed.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 inline-flex items-center">
              <Pin size={14} className="mr-1.5 text-gray-400" /> Pinned
            </h2>
            {pinnedLongevityFeed.map((entry, index) => renderFeedEntry(entry, index))}
          </div>
        )}

        {/* Regular Feed Section */}
        {remainingLongevityFeed.map((entry, index) =>
          renderFeedEntry(
            entry,
            index === 0 && pinnedLongevityFeed.length === 0 ? 0 : index + pinnedLongevityFeed.length
          )
        )}

        {/* Add Load More / End of Feed Indicator if needed */}
      </div>
    </PageLayout>
  );
}
