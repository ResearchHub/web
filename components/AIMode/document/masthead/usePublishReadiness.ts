import { MIN_PUBLISH_TITLE_LENGTH } from '@/components/modals/ConfirmPublishModal';
import { usePublishingCompletion } from '@/components/Notebook/PublishingForm';
import type { PublishingFieldKey } from '@/components/Notebook/PublishingForm/completion';

export interface PublishReadiness {
  /** The required details still missing, each once, in the schema's order. */
  readonly missing: readonly PublishingFieldKey[];
  /** The document has no title: no heading opens it. */
  readonly titleMissing: boolean;
  /** The title is shorter than a published work's may be (an absent one included). */
  readonly titleTooShort: boolean;
  /** Nothing stands between the document and being published. */
  readonly ready: boolean;
}

/**
 * What the open document still needs before it can be published. Nothing on
 * the document says so; the publish dialog asks, lists it, and lets it be
 * filled in there. Renders inside the note's `PublishingFormProvider`.
 */
export function usePublishReadiness(title: string): PublishReadiness {
  const { missing } = usePublishingCompletion();
  const titleMissing = title.trim().length === 0;
  const titleTooShort = title.trim().length < MIN_PUBLISH_TITLE_LENGTH;
  return { missing, titleMissing, titleTooShort, ready: missing.length === 0 && !titleTooShort };
}
