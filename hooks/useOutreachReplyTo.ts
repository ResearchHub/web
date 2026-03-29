'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import {
  readOutreachReplyToFromStorage,
  writeOutreachReplyToToStorage,
} from '@/app/expert-finder/lib/outreachReplyToStorage';

export interface UseOutreachReplyToReturn {
  replyTo: string;
  setReplyTo: Dispatch<SetStateAction<string>>;
}

/** Shared Reply-To field for expert-finder send/preview (list + detail). */
export function useOutreachReplyTo(): UseOutreachReplyToReturn {
  const [replyTo, setReplyTo] = useState('');
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    setReplyTo(readOutreachReplyToFromStorage());
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    writeOutreachReplyToToStorage(replyTo);
  }, [replyTo, storageReady]);

  return { replyTo, setReplyTo };
}
