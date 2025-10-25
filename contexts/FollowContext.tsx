'use client';

import { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';
import { HubService } from '@/services/hub.service';
import { FollowService } from '@/services/follow.service';
import { Topic } from '@/types/topic';
import { FollowedObject } from '@/types/follow';

interface FollowContextType {
  followedTopicIds: number[];
  followedTopics: Topic[];
  followedTopicObjects: FollowedObject[];
  isFollowing: (topicId: number) => boolean;
  toggleFollow: (topicId: number) => Promise<void>;
  followMultiple: (topicIds: number[]) => Promise<void>;
  refreshFollowed: () => Promise<void>;
  loading: boolean;
  getFollowedTopics: () => Promise<Topic[]>;
  getFollowedTopicObjects: () => Promise<FollowedObject[]>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: ReactNode }) {
  const [followedTopicIds, setFollowedTopicIds] = useState<number[]>([]);
  const [followedTopics, setFollowedTopics] = useState<Topic[]>([]);
  const [followedTopicObjects, setFollowedTopicObjects] = useState<FollowedObject[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch followed topics when component mounts
  useEffect(() => {
    refreshFollowed();
  }, []);

  // Function to refresh the list of followed topics
  const refreshFollowed = async () => {
    setLoading(true);
    try {
      // Fetch full topic data with metadata
      const followedObjects = await FollowService.getFollowedTopics();

      // Extract topics and IDs
      const topics = followedObjects.map((obj) => obj.data as Topic);
      const topicIds = topics.map((topic) => topic.id);

      setFollowedTopicObjects(followedObjects);
      setFollowedTopics(topics);
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

  // Follow multiple topics at once
  const followMultiple = async (topicIds: number[]) => {
    // Filter out already followed topics
    const toFollow = topicIds.filter((id) => !followedTopicIds.includes(id));
    if (toFollow.length === 0) return;

    // Optimistically update the UI
    setFollowedTopicIds((prev) => [...prev, ...toFollow]);

    try {
      const response = await FollowService.followMultipleHubs(toFollow);

      // Log any issues for debugging
      if (response.not_found.length > 0) {
        console.warn('Topics not found:', response.not_found);
      }
      if (response.already_following.length > 0) {
        console.info('Already following:', response.already_following);
      }

      // Refresh the full data after successful follow
      await refreshFollowed();
    } catch (error) {
      console.error('Error following multiple topics:', error);
      // Revert on error
      setFollowedTopicIds((prev) => prev.filter((id) => !toFollow.includes(id)));
      // Re-throw the error for components to handle
      throw error;
    }
  };

  // Function to get followed topics (returns cached data or fetches if needed)
  const getFollowedTopics = async (): Promise<Topic[]> => {
    if (followedTopics.length === 0 && followedTopicIds.length > 0) {
      // If we have IDs but no topic data, fetch the full data
      try {
        const followedObjects = await FollowService.getFollowedTopics();
        const topics = followedObjects.map((obj) => obj.data as Topic);
        setFollowedTopicObjects(followedObjects);
        setFollowedTopics(topics);
        return topics;
      } catch (error) {
        console.error('Error fetching followed topics data:', error);
        return [];
      }
    }
    return followedTopics;
  };

  // Function to get followed topic objects with metadata
  const getFollowedTopicObjects = async (): Promise<FollowedObject[]> => {
    if (followedTopicObjects.length === 0 && followedTopicIds.length > 0) {
      // If we have IDs but no topic objects, fetch the full data
      try {
        const followedObjects = await FollowService.getFollowedTopics();
        const topics = followedObjects.map((obj) => obj.data as Topic);
        setFollowedTopicObjects(followedObjects);
        setFollowedTopics(topics);
        return followedObjects;
      } catch (error) {
        console.error('Error fetching followed topic objects:', error);
        return [];
      }
    }
    return followedTopicObjects;
  };

  // Create memoized context value
  const contextValue = useMemo(
    () => ({
      followedTopicIds,
      followedTopics,
      followedTopicObjects,
      isFollowing,
      toggleFollow,
      followMultiple,
      refreshFollowed,
      loading,
      getFollowedTopics,
      getFollowedTopicObjects,
    }),
    [followedTopicIds, followedTopics, followedTopicObjects, loading]
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
