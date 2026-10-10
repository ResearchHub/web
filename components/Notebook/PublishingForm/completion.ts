import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { FORM_DEFAULTS } from './formMapping';
import { publishingFormSchema, type ArticleType, type PublishingFormData } from './schema';

export type PublishingFieldKey = keyof PublishingFormData;

export interface PublishingCompletion {
  /** The fields the schema still rejects, each once, in schema order. */
  readonly missing: readonly PublishingFieldKey[];
  readonly remaining: number;
  readonly isComplete: boolean;
}

const COMPLETE: PublishingCompletion = { missing: [], remaining: 0, isComplete: true };

/**
 * What still stands between these values and publishing, straight from the
 * schema: the same rules `trigger()` applies, read without touching the
 * form's error state. Every schema issue names a single top-level field.
 * Takes the form's values in any state of completeness, as `useWatch` hands
 * them out.
 */
export function getPublishingCompletion(values: unknown): PublishingCompletion {
  const result = publishingFormSchema.safeParse(values);
  if (result.success) return COMPLETE;

  const missing = Array.from(
    new Set(result.error.issues.map((issue) => String(issue.path[0]) as PublishingFieldKey))
  );
  return { missing, remaining: missing.length, isComplete: false };
}

/** Every field the schema requires of this work type, read off an empty form. */
export function getRequiredFields(articleType: ArticleType): readonly PublishingFieldKey[] {
  return getPublishingCompletion({ ...FORM_DEFAULTS, articleType }).missing;
}

/** Live completion of the surrounding publishing form. */
export function usePublishingCompletion(): PublishingCompletion {
  const values = useWatch<PublishingFormData>();
  return useMemo(() => getPublishingCompletion(values), [values]);
}
