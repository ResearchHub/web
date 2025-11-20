'use client';

import { useState, useCallback } from 'react';

const MAX_IMPRESSION_ITEMS = 10;

interface UseFeedImpressionTrackingReturn {
  registerVisibleItem: (index: number, unifiedDocumentId: string) => void;
  unregisterVisibleItem: (index: number, unifiedDocumentId: string) => void;
  getVisibleItems: (clickedUnifiedDocumentId: string) => string[];
  clearVisibleItems: () => void;
}
const KEY_SEPARATOR = '|';
const getKey = (index: number, unifiedDocumentId: string) =>
  `${index}${KEY_SEPARATOR}${unifiedDocumentId}`;

/**
 * Hook to track visible feed items for impression tracking.
 */
export function useFeedImpressionTracking(): UseFeedImpressionTrackingReturn {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  const registerVisibleItem = useCallback((index: number, unifiedDocumentId: string) => {
    if (!unifiedDocumentId) return;
    setVisibleItems((prev) => {
      const next = new Set(prev);
      next.add(getKey(index, unifiedDocumentId));
      return next;
    });
  }, []);

  const unregisterVisibleItem = useCallback((index: number, unifiedDocumentId: string) => {
    if (!unifiedDocumentId) return;
    setVisibleItems((prev) => {
      const next = new Set(prev);
      next.delete(getKey(index, unifiedDocumentId));
      return next;
    });
  }, []);

  const getVisibleItems = useCallback(
    (clickedUnifiedDocumentId: string): string[] => {
      const itemsArray = Array.from(visibleItems);
      const itemsArrayUnifiedDocumentIds = itemsArray.map((item) => item.split(KEY_SEPARATOR)[1]);

      // Ensure clicked item is included
      const filteredItems = itemsArrayUnifiedDocumentIds.filter(
        (id) => id !== clickedUnifiedDocumentId
      );

      const result = clickedUnifiedDocumentId
        ? [clickedUnifiedDocumentId, ...filteredItems].slice(0, MAX_IMPRESSION_ITEMS)
        : filteredItems.slice(0, MAX_IMPRESSION_ITEMS);

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
