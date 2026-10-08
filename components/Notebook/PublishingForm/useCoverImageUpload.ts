import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAssetUpload } from '@/hooks/useAssetUpload';
import type { PublishingFormData } from './schema';

export const COVER_IMAGE_ACCEPT = ['image/jpeg', 'image/png'];
export const COVER_IMAGE_MAX_MB = 10;

/** Why this file cannot be a cover image, or null when it can. */
export function coverImageFileError(file: File): string | null {
  if (!COVER_IMAGE_ACCEPT.includes(file.type)) return 'Only JPG or PNG files are accepted';
  if (file.size > COVER_IMAGE_MAX_MB * 1024 * 1024) {
    return `Image must be under ${COVER_IMAGE_MAX_MB}MB`;
  }
  return null;
}

/**
 * Sets the surrounding publishing form's cover image from a picked file: the
 * pick shows at once, and is swapped for what the server stored when the
 * upload returns. Whatever control picks the file, the form ends up the same.
 */
export function useCoverImageUpload() {
  const { getValues, setValue } = useFormContext<PublishingFormData>();
  const [, uploadAsset] = useAssetUpload();

  const write = useCallback(
    (value: PublishingFormData['coverImage']) =>
      setValue('coverImage', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true }),
    [setValue]
  );

  const select = async (selected: File) => {
    const previousCover = getValues('coverImage') ?? null;
    // Show the pick right away, then swap in what the server stored.
    write({ file: selected, key: null, url: null });

    const uploaded = await uploadAsset(selected, 'post').catch((uploadError) => {
      console.error('Error uploading cover image:', uploadError);
      return null;
    });

    // Ignore this upload if its selection was removed or replaced while it ran.
    if (getValues('coverImage')?.file !== selected) return;

    if (!uploaded) {
      write(previousCover);
      toast.error('Failed to upload image. Please try again.');
      return;
    }
    write({ file: null, key: uploaded.objectKey, url: uploaded.absoluteUrl });
  };

  const remove = useCallback(() => write(null), [write]);

  return { select, remove };
}
