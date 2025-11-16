'use client';

import { useState, useCallback } from 'react';

const MAX_IMPRESSION_ITEMS = 5;

interface UseFeedImpressionTrackingReturn {
  registerVisibleItem: (unifiedDocumentId: string) => void;
  unregisterVisibleItem: (unifiedDocumentId: string) => void;
  getVisibleItems: (clickedUnifiedDocumentId: string) => string[];
  clearVisibleItems: () => void;
}

/**
 * Hook to track visible feed items for impression tracking.
 */
export function useFeedImpressionTracking(): UseFeedImpressionTrackingReturn {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  const registerVisibleItem = useCallback((unifiedDocumentId: string) => {
    if (!unifiedDocumentId) return;
    setVisibleItems((prev) => {
      const next = new Set(prev);
      next.add(unifiedDocumentId);
      return next;
    });
  }, []);

  const unregisterVisibleItem = useCallback((unifiedDocumentId: string) => {
    if (!unifiedDocumentId) return;
    setVisibleItems((prev) => {
      const next = new Set(prev);
      next.delete(unifiedDocumentId);
      return next;
    });
  }, []);

  const getVisibleItems = useCallback(
    (clickedUnifiedDocumentId: string): string[] => {
      const itemsArray = Array.from(visibleItems);

      // Ensure clicked item is included
      const itemsSet = new Set(itemsArray);
      if (clickedUnifiedDocumentId) {
        itemsSet.add(clickedUnifiedDocumentId);
      }

      // Convert back to array and limit to MAX_IMPRESSION_ITEMS
      const result = Array.from(itemsSet).slice(0, MAX_IMPRESSION_ITEMS);
      return result;
    },
    [visibleItems]
  );

  const clearVisibleItems = useCallback(() => {
    setVisibleItems(new Set());
  }, []);

  return {
    registerVisibleItem,
    unregisterVisibleItem,
    getVisibleItems,
    clearVisibleItems,
  };
}
