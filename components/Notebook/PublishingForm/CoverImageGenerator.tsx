'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useCoverImageGeneration } from '@/hooks/useCoverImageGeneration';
import { canGenerateCoverImage, coverImageGenerationParams } from './coverImageGeneration';
import { usePublishingController } from './PublishingFormProvider';
import type { PublishingFormData } from './schema';
import { useCoverImageUpload } from './useCoverImageUpload';

interface CoverImageGenerator {
  readonly available: boolean;
  readonly isGenerating: boolean;
  readonly error: string | null;
  /** Generates a new cover from the form as it is, asking for a title when there is none. */
  readonly generate: () => Promise<void>;
  /**
   * Generates a cover for a draft that has none, once per draft: reopening
   * the publish dialog, or a cover the user took away, does not start another.
   */
  readonly generateIfMissing: () => void;
}

const CoverImageGeneratorContext = createContext<CoverImageGenerator | null>(null);

/**
 * Holds cover generation for the whole publishing form rather than for the
 * control that starts it, so a cover still generating when the publish dialog
 * closes lands in the form all the same, and the dialog shows it still
 * generating when it opens again.
 */
export function CoverImageGeneratorProvider({ children }: { readonly children: ReactNode }) {
  const { articleType, getTitle, note } = usePublishingController();
  const { getValues, watch } = useFormContext<PublishingFormData>();
  const { selectGenerated } = useCoverImageUpload();
  const { isGenerating, error, generate: request, cancel } = useCoverImageGeneration();
  const noteId = note?.id ?? null;
  // The drafts a cover was generated for without being asked.
  const generatedForRef = useRef(new Set<number>());

  // A cover generating for another draft is not this one's.
  useEffect(() => cancel, [noteId, cancel]);

  /** With `quiet`, a work without a title is skipped instead of asking for one. */
  const run = useCallback(
    async ({ quiet }: { quiet: boolean }) => {
      const params = coverImageGenerationParams(getValues(), getTitle(), noteId);
      if (!params) {
        if (!quiet) toast.error('Add a title before generating a cover image.');
        return;
      }
      // Any change to the cover while it generates was the user's own (a pick,
      // even one taken away again) and is kept over the generated one.
      let coverChanged = false;
      const subscription = watch((_values, { name }) => {
        if (name === 'coverImage') coverChanged = true;
      });
      try {
        const image = await request(params);
        if (image && !coverChanged) selectGenerated(image);
      } finally {
        subscription.unsubscribe();
      }
    },
    [getValues, getTitle, noteId, request, selectGenerated, watch]
  );

  const available = canGenerateCoverImage(articleType);
  const generator = useMemo<CoverImageGenerator>(
    () => ({
      available,
      isGenerating,
      error,
      generate: () => run({ quiet: false }),
      generateIfMissing: () => {
        const cover = getValues('coverImage');
        if (!available || isGenerating || cover?.file || cover?.url) return;
        if (noteId == null || generatedForRef.current.has(noteId)) return;
        // Not counted until there is a title to generate from.
        if (!coverImageGenerationParams(getValues(), getTitle(), noteId)) return;
        generatedForRef.current.add(noteId);
        void run({ quiet: true });
      },
    }),
    [available, isGenerating, error, run, getValues, getTitle, noteId]
  );

  return (
    <CoverImageGeneratorContext.Provider value={generator}>
      {children}
    </CoverImageGeneratorContext.Provider>
  );
}

export function useCoverImageGenerator(): CoverImageGenerator {
  const generator = useContext(CoverImageGeneratorContext);
  if (!generator) {
    throw new Error('useCoverImageGenerator must be used within a CoverImageGeneratorProvider');
  }
  return generator;
}
