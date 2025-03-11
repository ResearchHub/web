import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface DraftData {
  content: any;
  rating?: number;
  sectionRatings?: Record<string, number>;
  timestamp: string;
}

interface UseCommentDraftOptions {
  storageKey: string;
  isReadOnly?: boolean;
  initialContent?: any;
  isReview?: boolean;
  initialRating?: number;
  initialSectionRatings?: Record<string, number>;
  onContentLoaded?: (content: any) => void;
  onRatingLoaded?: (rating: number) => void;
  onSectionRatingsLoaded?: (sectionRatings: Record<string, number>) => void;
}

interface UseCommentDraftResult {
  lastSaved: Date | null;
  saveStatus: 'idle' | 'saving' | 'saved';
  formatLastSaved: () => string;
  saveDraft: (content: any, rating?: number, sectionRatings?: Record<string, number>) => void;
  clearDraft: () => void;
  loadedContent: any | null;
}

export const useCommentDraft = ({
  storageKey,
  isReadOnly = false,
  initialContent,
  isReview = false,
  initialRating = 0,
  initialSectionRatings = {},
  onContentLoaded,
  onRatingLoaded,
  onSectionRatingsLoaded,
}: UseCommentDraftOptions): UseCommentDraftResult => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [loadedContent, setLoadedContent] = useState<any | null>(null);

  // Use refs to track the latest values without triggering re-renders
  const contentRef = useRef<any>(null);
  const ratingRef = useRef<number | undefined>(isReview ? initialRating : undefined);
  const sectionRatingsRef = useRef<Record<string, number> | undefined>(
    isReview ? initialSectionRatings : undefined
  );

  // Save content to localStorage with debouncing
  const saveDraft = useCallback(
    (content: any, rating?: number, sectionRatings?: Record<string, number>) => {
      if (isReadOnly) return;

      // Update refs with latest values
      contentRef.current = content;
      if (isReview) {
        ratingRef.current = rating;
        sectionRatingsRef.current = sectionRatings;
      }

      // Only update status if it's not already 'saving'
      if (saveStatus !== 'saving') {
        setSaveStatus('saving');
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        try {
          const dataToSave: DraftData = {
            content: contentRef.current,
            rating: isReview ? ratingRef.current : undefined,
            sectionRatings: isReview ? sectionRatingsRef.current : undefined,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem(storageKey, JSON.stringify(dataToSave));
          setLastSaved(new Date());
          setSaveStatus('saved');
        } catch (error) {
          console.error('Failed to save to localStorage:', error);
          setSaveStatus('idle');
        }
      }, 1500); // 1.5 second debounce
    },
    [isReadOnly, isReview, saveStatus, storageKey]
  );

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setLastSaved(null);
      setSaveStatus('idle');
      setLoadedContent(null);
      contentRef.current = null;
      ratingRef.current = isReview ? initialRating : undefined;
      sectionRatingsRef.current = isReview ? initialSectionRatings : undefined;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, [storageKey, isReview, initialRating, initialSectionRatings]);

  // Load draft from localStorage on initial render
  useEffect(() => {
    if (isReadOnly) return;

    try {
      const savedData = localStorage.getItem(storageKey);

      if (savedData && (!initialContent || initialContent === '')) {
        const parsedData: DraftData = JSON.parse(savedData);

        // Store loaded content
        if (parsedData.content) {
          setLoadedContent(parsedData.content);
          contentRef.current = parsedData.content;

          // Notify parent components about loaded content
          if (onContentLoaded) {
            onContentLoaded(parsedData.content);
          }
        }

        // Load rating if it's a review
        if (isReview && parsedData.rating && onRatingLoaded) {
          ratingRef.current = parsedData.rating;
          onRatingLoaded(parsedData.rating);
        }

        // Load section ratings if available
        if (isReview && parsedData.sectionRatings && onSectionRatingsLoaded) {
          sectionRatingsRef.current = parsedData.sectionRatings;
          onSectionRatingsLoaded(parsedData.sectionRatings);
        }

        // Set last saved timestamp
        if (parsedData.timestamp) {
          setLastSaved(new Date(parsedData.timestamp));
          setSaveStatus('saved');
        }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    // Only run this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format the last saved time for display
  const formatLastSaved = useCallback(() => {
    if (!lastSaved) return '';

    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      return lastSaved.toLocaleString();
    }
  }, [lastSaved]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    lastSaved,
    saveStatus,
    formatLastSaved,
    saveDraft,
    clearDraft,
    loadedContent,
  };
};
