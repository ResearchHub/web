'use client';

import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useCoverImageGeneration } from '@/hooks/useCoverImageGeneration';
import { canGenerateCoverImage, coverImageGenerationParams } from './coverImageGeneration';
import { usePublishingController } from './PublishingFormProvider';
import type { PublishingFormData } from './schema';
import { useCoverImageUpload } from './useCoverImageUpload';

/**
 * Generates a cover from the form as it is and makes it the form's cover,
 * unless the cover changed while it was generating (the user uploaded one).
 */
export function useCoverImageGenerator() {
  const { articleType, getTitle, note } = usePublishingController();
  const { getValues } = useFormContext<PublishingFormData>();
  const { selectGenerated } = useCoverImageUpload();
  const { isGenerating, error, generate: request } = useCoverImageGeneration();

  /** With `quiet`, a work without a title is skipped instead of asking for one. */
  const generate = async ({ quiet = false }: { quiet?: boolean } = {}) => {
    const params = coverImageGenerationParams(getValues(), getTitle(), note?.id);
    if (!params) {
      if (!quiet) toast.error('Add a title before generating a cover image.');
      return;
    }
    const before = getValues('coverImage');
    const image = await request(params);
    const current = getValues('coverImage');
    if (!image || current?.file !== before?.file || current?.url !== before?.url) return;
    selectGenerated(image);
  };

  return { available: canGenerateCoverImage(articleType), isGenerating, error, generate };
}
