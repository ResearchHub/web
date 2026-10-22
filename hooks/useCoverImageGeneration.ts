import { useCallback, useEffect, useRef, useState } from 'react';
import { CoverImageService, type GenerateCoverImagesParams } from '@/services/coverImage.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import type { GeneratedCoverImage } from '@/types/coverImage';

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
    const pollIntervalMs = 3000;
    // The server fails a request after ten minutes; the client gives up sooner.
    const giveUpAfterMs = 5 * 60 * 1000;
    const failedMessage = 'Could not generate cover images. Please try again.';

    runRef.current += 1;
    const run = runRef.current;
    const isCurrent = () => runRef.current === run;

    setImages([]);
    setError(null);
    setIsGenerating(true);
    try {
      let generation = await CoverImageService.generate(params);
      const deadline = Date.now() + giveUpAfterMs;
      while (generation.status === 'PENDING' || generation.status === 'PROCESSING') {
        if (Date.now() > deadline) throw new Error(failedMessage);
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
        if (!isCurrent()) return;
        generation = await CoverImageService.get(generation.id);
      }
      if (!isCurrent()) return;
      if (generation.images.length === 0) {
        setError(generation.error ?? failedMessage);
      } else {
        setImages(generation.images);
      }
    } catch (generateError) {
      if (isCurrent()) setError(extractApiErrorMessage(generateError, failedMessage));
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
