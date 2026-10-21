import { useCallback, useEffect, useRef, useState } from 'react';
import { CoverImageService, type GenerateCoverImagesParams } from '@/services/coverImage.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import type { GeneratedCoverImage } from '@/types/coverImage';

const POLL_INTERVAL_MS = 3000;
// The server fails a request after ten minutes; the client gives up sooner.
const GIVE_UP_AFTER_MS = 5 * 60 * 1000;
const FAILED_MESSAGE = 'Could not generate cover images. Please try again.';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Starts a cover image request and polls it until its images are ready. A
 * new `generate` (or `cancel`, or unmounting) abandons the one in flight.
 */
export function useCoverImageGeneration() {
  const [images, setImages] = useState<GeneratedCoverImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runRef = useRef(0);

  useEffect(
    () => () => {
      runRef.current += 1;
    },
    []
  );

  const generate = useCallback(async (params: GenerateCoverImagesParams) => {
    runRef.current += 1;
    const run = runRef.current;
    const isCurrent = () => runRef.current === run;

    setImages([]);
    setError(null);
    setIsGenerating(true);
    try {
      let generation = await CoverImageService.generate(params);
      const deadline = Date.now() + GIVE_UP_AFTER_MS;
      while (generation.status === 'PENDING' || generation.status === 'PROCESSING') {
        if (Date.now() > deadline) throw new Error(FAILED_MESSAGE);
        await wait(POLL_INTERVAL_MS);
        if (!isCurrent()) return;
        generation = await CoverImageService.get(generation.id);
      }
      if (!isCurrent()) return;
      if (generation.images.length === 0) {
        setError(generation.error ?? FAILED_MESSAGE);
      } else {
        setImages(generation.images);
      }
    } catch (generateError) {
      if (isCurrent()) setError(extractApiErrorMessage(generateError, FAILED_MESSAGE));
    } finally {
      if (isCurrent()) setIsGenerating(false);
    }
  }, []);

  const cancel = useCallback(() => {
    runRef.current += 1;
    setIsGenerating(false);
  }, []);

  return { images, isGenerating, error, generate, cancel };
}
