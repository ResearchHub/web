import type { GenerateCoverImagesParams } from '@/services/coverImage.service';
import type { ArticleType, PublishingFormData } from './schema';

/** The work types whose cover can be generated. */
export const canGenerateCoverImage = (articleType: ArticleType | undefined): boolean =>
  articleType === 'preregistration' || articleType === 'grant';

/**
 * What a generated cover shows, from the form; null when there is nothing to
 * show yet. With the note, the covers use the logo its chat recorded, if any.
 */
export function coverImageGenerationParams(
  values: PublishingFormData,
  title: string,
  noteId?: number | null
): GenerateCoverImagesParams | null {
  if (!canGenerateCoverImage(values.articleType) || !title.trim()) return null;
  const isGrant = values.articleType === 'grant';
  const amount = Number.parseFloat(values.budget?.replaceAll(/[^0-9.]/g, '') || '0');
  return {
    documentType: isGrant ? 'GRANT' : 'PREREGISTRATION',
    title: title.trim(),
    subtitle: isGrant ? values.shortDescription?.trim() : undefined,
    organization: isGrant ? values.organization?.trim() : undefined,
    fundingAmountUsd: amount > 0 ? amount : null,
    noteId: noteId ?? null,
  };
}

/** The work has no cover yet, uploaded or generated. */
export const isMissingCoverImage = (values: PublishingFormData): boolean =>
  !values.coverImage?.file && !values.coverImage?.url;
