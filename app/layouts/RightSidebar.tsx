'use client';

import { BookOpen, Check, Hash, BookMarked } from 'lucide-react';
import { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/Button';
import { HubService } from '@/services/hub.service';
import { Topic } from '@/types/topic';

// InfoBanner Component
const InfoBanner: React.FC = () => (
  <div className="bg-indigo-50 rounded-lg p-5 mb-6">
    <div className="flex flex-col items-center mb-4">
      <BookOpen className="h-8 w-8 text-indigo-900 mb-2" />
      <div className="text-lg font-semibold text-indigo-900 text-center">ResearchHub Journal</div>
    </div>

    <div className="space-y-2.5 mb-5">
      {['fourteen days to peer reviews', 'Paid peer reviewers', 'Open access by default'].map(
        (feature, index) => (
          <div key={index} className="flex items-center space-x-2.5">
            <Check className="h-4 w-4 text-indigo-900 flex-shrink-0" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        )
      )}
    </div>

    <Button
      variant="default"
      size="default"
      className="w-full justify-center bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
    >
      Learn more
    </Button>
  </div>
);

// TopicCard Component
interface TopicCardProps {
  topic: Topic;
  isFollowing: boolean;
  onFollowToggle: (topicId: number) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, isFollowing, onFollowToggle }) => {
  const isJournal = topic.namespace === 'journal';

  return (
    <div className="flex items-center justify-between mb-3 mx-0.5">
      <div className="flex items-center space-x-2.5">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isJournal ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
          }`}
        >
          {isJournal ? <BookMarked size={16} /> : <Hash size={16} />}
        </div>
        <div>
          <div className="font-medium text-gray-900 text-sm">{topic.name}</div>
        </div>
      </div>
      <Button
        onClick={() => onFollowToggle(topic.id)}
        variant={isFollowing ? 'outlined' : 'default'}
        size="sm"
        className={`rounded-full ${
          isFollowing
            ? 'text-gray-600 border-gray-300 hover:border-gray-400'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    </div>
  );
};

// TopicSection Component
interface TopicSectionProps {
  title: string;
  topics: Topic[];
  followStatus: { [key: number]: boolean };
  onFollowToggle: (topicId: number) => void;
}

const TopicSection: React.FC<TopicSectionProps> = ({
  title,
  topics,
  followStatus,
  onFollowToggle,
}) => {
  if (topics.length === 0) return null;

  return (
    <>
      <div className="space-y-3 mb-6">
        {topics.map((topic) => (
          <TopicCard
            key={`topic-${topic.id}`}
            topic={topic}
            isFollowing={followStatus[topic.id] || false}
            onFollowToggle={onFollowToggle}
          />
        ))}
      </div>
    </>
  );
};

// LoadingSkeleton Component
interface LoadingSkeletonProps {
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 4 }) => (
  <div className="animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={`skeleton-${i}`} className="flex items-center justify-between mb-3 mx-0.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
          </div>
        </div>
        <div className="h-7 bg-gray-200 rounded-full w-16"></div>
      </div>
    ))}
  </div>
);

// Cache for topics data
interface TopicsCache {
  journals: Topic[];
  topics: Topic[];
  followedItems: number[];
  timestamp: number;
}

let topicsCache: TopicsCache | null = null;
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// TopicsToFollow Component
const TopicsToFollow: React.FC = () => {
  const [followStatus, setFollowStatus] = useState<{ [key: number]: boolean }>({});
  const [journals, setJournals] = useState<Topic[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        // Check if we have valid cached data
        const now = Date.now();
        if (topicsCache && now - topicsCache.timestamp < CACHE_EXPIRY_MS) {
          // Use cached data
          setJournals(topicsCache.journals);
          setTopics(topicsCache.topics);

          // Initialize follow status from cache
          const initialFollowStatus: { [key: number]: boolean } = {};
          topicsCache.followedItems.forEach((id) => {
            initialFollowStatus[id] = true;
          });
          setFollowStatus(initialFollowStatus);
          setIsLoading(false);
          return;
        }

        // Fetch fresh data if no cache or cache expired
        const [journalData, topicData, followedItems] = await Promise.all([
          HubService.getHubs({ namespace: 'journal' }),
          HubService.getHubs({ excludeJournals: true }),
          HubService.getFollowedHubs(),
        ]);

        // Limit to 4 items each for display
        const limitedJournals = journalData.slice(0, 4);
        const limitedTopics = topicData.slice(0, 4);

        // Update cache
        topicsCache = {
          journals: limitedJournals,
          topics: limitedTopics,
          followedItems,
          timestamp: now,
        };

        setJournals(limitedJournals);
        setTopics(limitedTopics);

        // Initialize follow status
        const initialFollowStatus: { [key: number]: boolean } = {};
        followedItems.forEach((id) => {
          initialFollowStatus[id] = true;
        });
        setFollowStatus(initialFollowStatus);
      } catch (error) {
        console.error('Error loading topics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleFollowToggle = async (topicId: number) => {
    const isCurrentlyFollowing = followStatus[topicId] || false;

    // Optimistically update UI
    setFollowStatus((prev) => ({
      ...prev,
      [topicId]: !isCurrentlyFollowing,
    }));

    try {
      if (isCurrentlyFollowing) {
        await HubService.unfollowHub(topicId);
        // Update cache if it exists
        if (topicsCache) {
          topicsCache.followedItems = topicsCache.followedItems.filter((id) => id !== topicId);
        }
      } else {
        await HubService.followHub(topicId);
        // Update cache if it exists
        if (topicsCache) {
          topicsCache.followedItems.push(topicId);
        }
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      // Revert on error
      setFollowStatus((prev) => ({
        ...prev,
        [topicId]: isCurrentlyFollowing,
      }));
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Follow Recommendations</h2>

        <LoadingSkeleton />

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-semibold text-gray-900 mb-6">Follow Recommendations</h2>

      {/* Journals Section */}
      <TopicSection
        title="Journals & Repositories"
        topics={journals}
        followStatus={followStatus}
        onFollowToggle={handleFollowToggle}
      />

      {/* Divider - only show if we have both journals and topics */}
      {journals.length > 0 && topics.length > 0 && (
        <div className="border-t border-gray-200 my-4"></div>
      )}

      {/* Topics Section */}
      <TopicSection
        title="Topics"
        topics={topics}
        followStatus={followStatus}
        onFollowToggle={handleFollowToggle}
      />
    </div>
  );
};

// Memoize the TopicsToFollow component to prevent unnecessary re-renders
const MemoizedTopicsToFollow = memo(TopicsToFollow);

// Main RightSidebar Component - memoized to prevent re-renders when parent components change
export const RightSidebar = memo(() => (
  <div>
    <InfoBanner />
    <MemoizedTopicsToFollow />
  </div>
));
