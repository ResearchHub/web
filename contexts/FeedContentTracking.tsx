'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  SetStateAction,
  Dispatch,
  useEffect,
  useCallback,
  useMemo, // Add this import
} from 'react';
import { FeedEntry } from '@/types/feed';
import { useUser } from './UserContext';
import AnalyticsService from '@/services/analytics.service';
import { FeedImpressionEvent } from '@/types/analytics';

const BATCH_SIZE = 10;

interface FeedContentTrackingContextType {
  displayedItems: FeedEntry[];
  setDisplayedItems: Dispatch<SetStateAction<FeedEntry[]>>;
  processBatch: () => void;
  processAndReset: () => void;
}

const FeedContentTrackingContext = createContext<FeedContentTrackingContextType | null>(null);

export function FeedContentTrackingProvider({ children }: { children: ReactNode }) {
  const [displayedItems, setDisplayedItems] = useState<FeedEntry[]>([]);
  const [trackedItemIds, setTrackedItemIds] = useState<Set<string>>(new Set());

  const { user } = useUser();

  // Process batch - send any untracked items
  const processBatch = useCallback(() => {
    if (displayedItems.length > 0) {
      // Get items that haven't been tracked yet
      const newItems = displayedItems.filter((item) => !trackedItemIds.has(item.id));

      if (newItems.length > 0) {
        // Prepare analytics event
        const feedImpressionPayload: FeedImpressionEvent = {
          impression_type: 'DISPLAYED',
          items: newItems.map((item) => ({
            content_type: item.contentType,
            id: item.id,
            related_work: item.relatedWork
              ? {
                  id: item.relatedWork.id.toString(),
                  content_type: item.relatedWork.contentType,
                }
              : undefined,
          })),
        };

        // Log the event
        AnalyticsService.logEventWithUserProperties('feed_impression', feedImpressionPayload, user);

        setTrackedItemIds((prev) => new Set([...prev, ...newItems.map((item) => item.id)]));
      }

      // Reset displayedItems after processing
      setDisplayedItems([]);
    }
  }, [displayedItems, trackedItemIds, user]);

  // Send immediately when we hit batch size
  useEffect(() => {
    if (displayedItems.length >= BATCH_SIZE) {
      processBatch();
    }
  }, [displayedItems.length, processBatch]);

  // Reset tracking when entries change (new feed loaded)
  useEffect(() => {
    setTrackedItemIds(new Set());
    setDisplayedItems([]);
  }, []);

  // Process batch and reset all state
  const processAndReset = useCallback(() => {
    processBatch();

    setTrackedItemIds(new Set());
    setDisplayedItems([]);
  }, [processBatch]);

  const contextValue = useMemo(
    () => ({
      displayedItems,
      setDisplayedItems,
      processBatch,
      processAndReset,
    }),
    [displayedItems, setDisplayedItems, processBatch, processAndReset]
  );

  return (
    <FeedContentTrackingContext.Provider value={contextValue}>
      {children}
    </FeedContentTrackingContext.Provider>
  );
}

export function useFeedContentTracking() {
  const context = useContext(FeedContentTrackingContext);
  if (!context) {
    throw new Error('useFeedContentTracking must be used within a FeedContentTrackingProvider');
  }
  return context;
}
