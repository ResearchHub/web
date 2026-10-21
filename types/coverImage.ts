import { createTransformer } from './transformer';

export type CoverImageGenerationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/** A generated banner: `key` is what a post's `image` takes, `url` is where to show it. */
export interface GeneratedCoverImage {
  key: string;
  url: string;
}

/** A request for AI-generated cover options (`/api/research_ai/cover-images/`). */
export interface CoverImageGeneration {
  id: number;
  status: CoverImageGenerationStatus;
  images: GeneratedCoverImage[];
  /** User-facing reason a `FAILED` request produced nothing. */
  error: string | null;
}

export const transformCoverImageGeneration = createTransformer<any, CoverImageGeneration>(
  (raw) => ({
    id: raw.id,
    status: raw.status,
    images: (raw.images ?? []).map((image: any) => ({ key: image.key, url: image.url })),
    error: raw.error ?? null,
  })
);
