'use client';

import { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';
import { HubService } from '@/services/hub.service';
import { FollowService } from '@/services/follow.service';
import { Topic } from '@/types/topic';

interface FollowContextType {
  followedTopicIds: number[];
  followedTopics: Topic[];
  isFollowing: (topicId: number) => boolean;
  toggleFollow: (topicId: number) => Promise<void>;
  refreshFollowed: () => Promise<void>;
  loading: boolean;
  getFollowedTopics: () => Promise<Topic[]>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: ReactNode }) {
  const [followedTopicIds, setFollowedTopicIds] = useState<number[]>([]);
  const [followedTopics, setFollowedTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch followed topics when component mounts
  useEffect(() => {
    refreshFollowed();
  }, []);

  // Function to refresh the list of followed topics
  const refreshFollowed = async () => {
    setLoading(true);
    try {
      // Fetch full topic data
      const followedTopicsData = await FollowService.getFollowedTopics();

      // Extract IDs from the topics
      const topicIds = followedTopicsData.map((topic) => topic.id);

      setFollowedTopics(followedTopicsData);
      setFollowedTopicIds(topicIds);
    } catch (error) {
      console.error('Error fetching followed topics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if a topic is being followed
  const isFollowing = (topicId: number): boolean => {
    return followedTopicIds.includes(topicId);
  };

  // Toggle follow status for a topic
  const toggleFollow = async (topicId: number) => {
    const currentlyFollowing = isFollowing(topicId);

    // Optimistically update the UI
    setFollowedTopicIds((prev) =>
      currentlyFollowing ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );

    try {
      if (currentlyFollowing) {
        await HubService.unfollowHub(topicId);
      } else {
        await HubService.followHub(topicId);
      }
      // Refresh the full data after successful toggle
      await refreshFollowed();
    } catch (error) {
      console.error('Error toggling follow status:', error);
      // Revert on error
      setFollowedTopicIds((prev) =>
        currentlyFollowing ? [...prev, topicId] : prev.filter((id) => id !== topicId)
      );
      // Re-throw the error for components to handle
      throw error;
    }
  };

  // Function to get followed topics (returns cached data or fetches if needed)
  const getFollowedTopics = async (): Promise<Topic[]> => {
    if (followedTopics.length === 0 && followedTopicIds.length > 0) {
      // If we have IDs but no topic data, fetch the full data
      try {
        const topicsData = await FollowService.getFollowedTopics();
        setFollowedTopics(topicsData);
        return topicsData;
      } catch (error) {
        console.error('Error fetching followed topics data:', error);
        return [];
      }
    }
    return followedTopics;
  };

  // Create memoized context value
  const contextValue = useMemo(
    () => ({
      followedTopicIds,
      followedTopics,
      isFollowing,
      toggleFollow,
      refreshFollowed,
      loading,
      getFollowedTopics,
    }),
    [followedTopicIds, followedTopics, loading]
  );

  return <FollowContext.Provider value={contextValue}>{children}</FollowContext.Provider>;
}

// Hook to use the context
export function useFollowContext() {
  const context = useContext(FollowContext);
  if (context === undefined) {
    throw new Error('useFollowContext must be used within a FollowProvider');
  }
  return context;
}
