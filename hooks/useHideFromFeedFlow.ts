'use client';

import { useCallback, useState } from 'react';
import type { FeedEntry } from '@/types/feed';
import { useHideFromFeed } from '@/hooks/useHideFromFeed';

type HideFromFeedFlowStep = 'closed' | 'pick' | 'confirm';

interface UseHideFromFeedFlowReturn {
  requestHide: (entries: FeedEntry[]) => void;
  close: () => void;
  confirmHide: () => Promise<void>;
  selectEntry: (feedEntryId: string) => void;
  proceedToConfirm: () => void;
  isHiding: boolean;
  step: HideFromFeedFlowStep;
  entries: FeedEntry[];
  selectedEntryId: string | null;
}

export function useHideFromFeedFlow(): UseHideFromFeedFlowReturn {
  const { hideFromFeed, isHiding } = useHideFromFeed();
  const [step, setStep] = useState<HideFromFeedFlowStep>('closed');
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const close = useCallback(() => {
    setStep('closed');
    setEntries([]);
    setSelectedEntryId(null);
  }, []);

  const requestHide = useCallback((items: FeedEntry[]) => {
    const valid = items.filter((entry) => entry?.id);
    if (valid.length === 0) {
      return;
    }

    setEntries(valid);
    if (valid.length === 1) {
      setSelectedEntryId(valid[0].id);
      setStep('confirm');
      return;
    }

    setSelectedEntryId(null);
    setStep('pick');
  }, []);

  const selectEntry = useCallback((feedEntryId: string) => {
    setSelectedEntryId(feedEntryId);
  }, []);

  const proceedToConfirm = useCallback(() => {
    if (selectedEntryId) {
      setStep('confirm');
    }
  }, [selectedEntryId]);

  const confirmHide = useCallback(async () => {
    if (!selectedEntryId) {
      return;
    }
    const success = await hideFromFeed(selectedEntryId);
    if (success) {
      close();
    }
  }, [close, hideFromFeed, selectedEntryId]);

  return {
    requestHide,
    close,
    confirmHide,
    selectEntry,
    proceedToConfirm,
    isHiding,
    step,
    entries,
    selectedEntryId,
  };
}
