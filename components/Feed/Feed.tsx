'use client';

import { FC, useRef, useState, useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Sparkles } from 'lucide-react';
import { useFeed, FeedTab, FeedSource } from '@/hooks/useFeed';
import { FeedContent } from './FeedContent';
import { InterestSelector } from '@/components/InterestSelector/InterestSelector';
import { FeedTabs } from './FeedTabs';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FeedEntry } from '@/types/feed';
import { CommentEditor } from '@/components/Comment/CommentEditor';
import { CommentContent } from '@/components/Comment/lib/types';
import Icon from '@/components/ui/icons/Icon';

interface FeedProps {
  defaultTab: FeedTab;
  initialFeedData?: {
    entries: FeedEntry[];
    hasMore: boolean;
  };
  showSourceFilter?: boolean;
}

export const Feed: FC<FeedProps> = ({ defaultTab, initialFeedData, showSourceFilter = false }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>(defaultTab);
  const [isNavigating, setIsNavigating] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<FeedSource>('all');
  const [commentContent, setCommentContent] = useState<CommentContent>('');
  const { entries, isLoading, hasMore, loadMore, refresh } = useFeed(defaultTab, {
    source: sourceFilter,
    initialData: initialFeedData,
  });

  // Sync the activeTab with the defaultTab when the component mounts or defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
    setIsNavigating(false);
  }, [defaultTab]);

  const handleCustomizeChange = () => {
    setIsCustomizing(!isCustomizing);
  };

  const handleSaveComplete = () => {
    setIsCustomizing(false);
    refresh();
  };

  const handleTabChange = (tab: FeedTab) => {
    // Immediately update the active tab for visual feedback
    setActiveTab(tab);
    // Set navigating state to true to show loading state
    setIsNavigating(true);

    // Navigate to the appropriate URL
    if (tab === 'popular') {
      router.push('/');
    } else {
      router.push(`/${tab}`);
    }
  };

  const handleCommentSubmit = async ({ content }: { content: CommentContent }) => {
    // Check if the comment references a paper
    if (typeof content === 'string') {
      if (!content.includes('@paper')) {
        alert('Please reference a paper using @paper');
        return false;
      }
    } else {
      // For TipTap document structure, we need to check content differently
      const contentJSON = JSON.stringify(content);
      if (!contentJSON.includes('@paper')) {
        alert('Please reference a paper using @paper');
        return false;
      }
    }

    console.log('Submitting comment:', content);
    // Implement submission logic here
    setCommentContent('');
    return true;
  };

  // Combine the loading states
  const combinedIsLoading = isLoading || isNavigating;

  const tabs = [
    {
      id: 'popular',
      label: 'Trending',
    },
    ...(isAuthenticated
      ? [
          {
            id: 'following',
            label: 'Following',
          },
        ]
      : []),
  ];

  const header = (
    <h1 className="text-xl text-gray-600 flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-indigo-500" />
      Discover trending research, earning, and funding opportunities
    </h1>
  );

  const feedTabs = (
    <FeedTabs
      activeTab={activeTab}
      tabs={tabs}
      isCustomizing={isCustomizing}
      onTabChange={handleTabChange}
      onCustomizeChange={handleCustomizeChange}
      isLoading={combinedIsLoading}
    />
  );

  return (
    <PageLayout>
      {!isCustomizing ? (
        <>
          <div className="pt-4 pb-4">{header}</div>
          <div className="max-w-4xl mx-auto">
            {feedTabs}

            {/* Twitter-style comment editor */}
            {isAuthenticated && (
              <div className="mt-6 mb-8 bg-white rounded-xl shadow-sm transition-all duration-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-base font-medium text-gray-800">Share your thoughts</h2>
                </div>
                <div className="p-4">
                  <CommentEditor
                    onSubmit={handleCommentSubmit}
                    placeholder="What's on your mind? Remember to reference a paper using @paper..."
                    storageKey="feed-comment-draft"
                    compactToolbar={true}
                    initialContent={commentContent}
                    autoFocus={false}
                  />
                </div>
              </div>
            )}

            <FeedContent
              entries={entries}
              isLoading={combinedIsLoading}
              hasMore={hasMore}
              loadMore={loadMore}
              filters={null}
              header={null}
              tabs={null}
            />
          </div>
        </>
      ) : (
        <>
          <div className="pt-4 pb-7">{header}</div>
          <div className="max-w-4xl mx-auto">
            {feedTabs}
            <div className="mt-6">
              <InterestSelector mode="preferences" onSaveComplete={handleSaveComplete} />
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default Feed;
