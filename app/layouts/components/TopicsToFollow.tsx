'use client';

import { useState, useEffect, memo } from 'react';
import { BookMarked, Hash } from 'lucide-react';
import { HubService } from '@/services/hub.service';
import { Topic } from '@/types/topic';
import { LoadingSkeleton } from './LoadingSkeleton';
import { FollowTopicButton } from '@/components/ui/FollowTopicButton';
import { useFollowContext } from '@/contexts/FollowContext';

// TopicCard Component
interface TopicCardProps {
  topic: Topic;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
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
      <FollowTopicButton topicId={topic.id} />
    </div>
  );
};

// TopicSection Component
interface TopicSectionProps {
  title: string;
  topics: Topic[];
}

const TopicSection: React.FC<TopicSectionProps> = ({ topics }) => {
  if (topics.length === 0) return null;

  return (
    <>
      <div className="space-y-3 mb-6">
        {topics.map((topic) => (
          <TopicCard key={`topic-${topic.id}`} topic={topic} />
        ))}
      </div>
    </>
  );
};

// Cache for topics data
interface TopicsCache {
  journals: Topic[];
  topics: Topic[];
  timestamp: number;
}

let topicsCache: TopicsCache | null = null;
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// TopicsToFollow Component
const TopicsToFollowComponent: React.FC = () => {
  const [journals, setJournals] = useState<Topic[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { loading: followLoading } = useFollowContext();

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
          setIsLoading(false);
          return;
        }

        // Fetch fresh data if no cache or cache expired
        const [journalData, topicData] = await Promise.all([
          HubService.getHubs({ namespace: 'journal' }),
          HubService.getHubs({ excludeJournals: true }),
        ]);

        // Limit to 4 items each for display
        const limitedJournals = journalData.slice(0, 4);
        const limitedTopics = topicData.slice(0, 4);

        // Update cache
        topicsCache = {
          journals: limitedJournals,
          topics: limitedTopics,
          timestamp: now,
        };

        setJournals(limitedJournals);
        setTopics(limitedTopics);
      } catch (error) {
        console.error('Error loading topics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (isLoading || followLoading) {
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
      <TopicSection title="Journals & Repositories" topics={journals} />

      {/* Divider - only show if we have both journals and topics */}
      {journals.length > 0 && topics.length > 0 && (
        <div className="border-t border-gray-200 my-4"></div>
      )}

      {/* Topics Section */}
      <TopicSection title="Topics" topics={topics} />
    </div>
  );
};

// Memoize the TopicsToFollow component to prevent unnecessary re-renders
export const TopicsToFollow = memo(TopicsToFollowComponent);
