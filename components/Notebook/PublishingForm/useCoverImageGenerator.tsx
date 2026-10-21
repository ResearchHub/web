'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { GenerateCoverImageModal } from '@/components/modals/GenerateCoverImageModal';
import type { GenerateCoverImagesParams } from '@/services/coverImage.service';
import { canGenerateCoverImage, coverImageGenerationParams } from './coverImageGeneration';
import { usePublishingController } from './PublishingFormProvider';
import type { PublishingFormData } from './schema';
import { useCoverImageUpload } from './useCoverImageUpload';

const NEEDS_TITLE_MESSAGE = 'Add a title before generating a cover image.';

/**
 * Offers AI-generated covers next to a cover control: `open` generates
 * options from the form as it is, and `modal`, rendered where the control
 * is, has the user pick one, which becomes the form's cover.
 */
export function useCoverImageGenerator() {
  const { articleType, getTitle } = usePublishingController();
  const { getValues } = useFormContext<PublishingFormData>();
  const { selectGenerated } = useCoverImageUpload();
  const [params, setParams] = useState<GenerateCoverImagesParams | null>(null);

  const open = () => {
    const next = coverImageGenerationParams(getValues(), getTitle());
    if (!next) {
      toast.error(NEEDS_TITLE_MESSAGE);
      return;
    }
    setParams(next);
  };

  const modal = params && (
    <GenerateCoverImageModal
      isOpen
      onClose={() => setParams(null)}
      params={params}
      onSelect={(image) => {
        selectGenerated(image);
        setParams(null);
      }}
    />
  );

  return { available: canGenerateCoverImage(articleType), open, modal };
}
