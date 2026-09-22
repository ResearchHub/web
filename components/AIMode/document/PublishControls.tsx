'use client';

import { PublishButton, PublishStatusPill } from '@/components/Notebook/PublishingForm';

interface PublishControlsProps {
  /** Opens the full details form, where the missing pieces are. */
  readonly onOpenDetails: () => void;
}

/**
 * The document's publishing state and its publish button, side by side.
 * Renders inside the document's `PublishingFormProvider`; where it sits on
 * screen is the host's choice.
 */
export function PublishControls({ onOpenDetails }: PublishControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <PublishStatusPill onOpenDetails={onOpenDetails} />
      <PublishButton requireComplete size="sm" className="h-8 px-4 text-[13px]" />
    </div>
  );
}
