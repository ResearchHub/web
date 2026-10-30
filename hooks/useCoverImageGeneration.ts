import { useCallback, useEffect, useRef, useState } from 'react';
import { CoverImageService, type GenerateCoverImagesParams } from '@/services/coverImage.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import type { GeneratedCoverImage } from '@/types/coverImage';

/**
 * Starts a cover image request and polls it until its image is ready. A new
 * `generate`, `cancel` or unmounting abandons the one in flight, which then
 * resolves to null.
 */
export function useCoverImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runRef = useRef(0);

  useEffect(
    () => () => {
      runRef.current += 1;
    },
    []
  );

  const generate = useCallback(
    async (params: GenerateCoverImagesParams): Promise<GeneratedCoverImage | null> => {
      const pollIntervalMs = 3000;
      // The server fails a request after ten minutes; the client gives up sooner.
      const giveUpAfterMs = 5 * 60 * 1000;
      const failedMessage = 'Could not generate a cover image. Please try again.';

      runRef.current += 1;
      const run = runRef.current;
      const isCurrent = () => runRef.current === run;

      setError(null);
      setIsGenerating(true);
      try {
        let generation = await CoverImageService.generate(params);
        const deadline = Date.now() + giveUpAfterMs;
        while (generation.status === 'PENDING' || generation.status === 'PROCESSING') {
          if (Date.now() > deadline) throw new Error(failedMessage);
          await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
          if (!isCurrent()) return null;
          generation = await CoverImageService.get(generation.id);
        }
        if (!isCurrent()) return null;
        if (!generation.image) setError(generation.error ?? failedMessage);
        return generation.image;
      } catch (generateError) {
        if (isCurrent()) setError(extractApiErrorMessage(generateError, failedMessage));
        return null;
      } finally {
        if (isCurrent()) setIsGenerating(false);
      }
    },
    []
  );

  const cancel = useCallback(() => {
    runRef.current += 1;
    setIsGenerating(false);
    setError(null);
  }, []);

  return { isGenerating, error, generate, cancel };
}
