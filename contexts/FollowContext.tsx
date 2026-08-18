'use client';

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
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
  /** Opts the caller into the lazy initial fetch. Called for you by `useFollowContext`. */
  activate: () => void;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [followedTopicIds, setFollowedTopicIds] = useState<number[]>([]);
  const [followedTopics, setFollowedTopics] = useState<Topic[]>([]);
  const [followedTopicObjects, setFollowedTopicObjects] = useState<FollowedObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActivated, setIsActivated] = useState(false);

  const activate = useCallback(() => setIsActivated(true), []);

  // Function to refresh the list of followed topics
  const refreshFollowed = useCallback(async () => {
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
  }, []);

  // This provider wraps the whole app, so fetching on mount cost every page an
  // `/api/hub/following/` request even when nothing on screen showed follows.
  // Instead the first `useFollowContext` consumer to mount activates it, and
  // signed-out visitors never follow anything so they skip the call entirely.
  useEffect(() => {
    if (!isActivated || status === 'loading') return;

    if (status !== 'authenticated') {
      setFollowedTopicIds([]);
      setFollowedTopics([]);
      setFollowedTopicObjects([]);
      setLoading(false);
      return;
    }

    refreshFollowed();
  }, [isActivated, status, refreshFollowed]);

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
      activate,
    }),
    [followedTopicIds, followedTopics, followedTopicObjects, loading, activate]
  );

  return <FollowContext.Provider value={contextValue}>{children}</FollowContext.Provider>;
}

// Hook to use the context
export function useFollowContext() {
  const context = useContext(FollowContext);
  const activate = context?.activate;

  // Reading the context is what makes the data worth fetching, so the first
  // consumer to mount triggers the provider's one-time fetch.
  useEffect(() => {
    activate?.();
  }, [activate]);

  if (context === undefined) {
    throw new Error('useFollowContext must be used within a FollowProvider');
  }
  return context;
}
