import { useWatch } from 'react-hook-form';
import { MIN_PUBLISH_TITLE_LENGTH } from '@/components/modals/ConfirmPublishModal';
import {
  usePublishingCompletion,
  usePublishingController,
} from '@/components/Notebook/PublishingForm';
import type { PublishingFieldKey } from '@/components/Notebook/PublishingForm/completion';
import type { PublishingFormData } from '@/components/Notebook/PublishingForm/schema';
import { mastheadWidgetsFor } from './mastheadWidgets';

export interface PublishReadiness {
  /** The required details still missing, each once, in the schema's order. */
  readonly missing: readonly PublishingFieldKey[];
  /** The document has no title: no heading opens it. */
  readonly titleMissing: boolean;
  /** The title is shorter than a published work's may be (an absent one included). */
  readonly titleTooShort: boolean;
  /**
   * What still has to be given, named as the publish dialog lists it and in
   * its order: the title first ("A longer title" when it has one that is too
   * short), then each detail. Empty when nothing stands in the way.
   */
  readonly missingNames: readonly string[];
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
  const { articleType } = usePublishingController();
  const values = useWatch<PublishingFormData>() as PublishingFormData;
  const titleMissing = title.trim().length === 0;
  const titleTooShort = title.trim().length < MIN_PUBLISH_TITLE_LENGTH;

  const titleName = titleMissing ? ['Title'] : titleTooShort ? ['A longer title'] : [];
  const detailNames = mastheadWidgetsFor(articleType)
    .filter((config) => !config.hiddenWhen?.(values) && missing.includes(config.field))
    .map((config) => config.name);

  return {
    missing,
    titleMissing,
    titleTooShort,
    missingNames: [...titleName, ...detailNames],
    ready: missing.length === 0 && !titleTooShort,
  };
}
