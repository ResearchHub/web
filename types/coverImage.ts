import { createTransformer } from './transformer';

export type CoverImageGenerationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/** A generated banner: `key` is what a post's `image` takes, `url` is where to show it. */
export interface GeneratedCoverImage {
  key: string;
  url: string;
}

/** A request for an AI-generated cover (`/api/research_ai/cover-images/`). */
export interface CoverImageGeneration {
  id: number;
  status: CoverImageGenerationStatus;
  /** Set once the request is `COMPLETED`. */
  image: GeneratedCoverImage | null;
  /** User-facing reason a `FAILED` request produced nothing. */
  error: string | null;
}

export const transformCoverImageGeneration = createTransformer<any, CoverImageGeneration>(
  (raw) => ({
    id: raw.id,
    status: raw.status,
    image: raw.image ? { key: raw.image.key, url: raw.image.url } : null,
    error: raw.error ?? null,
  })
);
