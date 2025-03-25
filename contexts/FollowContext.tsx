'use client';

import { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';
import { HubService } from '@/services/hub.service';

interface FollowContextType {
  followedTopicIds: number[];
  isFollowing: (topicId: number) => boolean;
  toggleFollow: (topicId: number) => Promise<void>;
  refreshFollowed: () => Promise<void>;
  loading: boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: ReactNode }) {
  const [followedTopicIds, setFollowedTopicIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch followed topics when component mounts
  useEffect(() => {
    refreshFollowed();
  }, []);

  // Function to refresh the list of followed topics
  const refreshFollowed = async () => {
    setLoading(true);
    try {
      const followedHubs = await HubService.getFollowedHubs();
      setFollowedTopicIds(followedHubs);
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

  // Create memoized context value
  const contextValue = useMemo(
    () => ({
      followedTopicIds,
      isFollowing,
      toggleFollow,
      refreshFollowed,
      loading,
    }),
    [followedTopicIds, loading]
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
