'use client';

import { SelectFundingOpportunityModal } from '@/components/modals/SelectFundingOpportunityModal';
import { useSelectedGrant } from '@/components/Notebook/PublishingForm/useSelectedGrant';

/** A modal a detail block opens for the note it belongs to. */
export interface NoteModalProps {
  readonly noteId: number;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

/** Picks the Request for Proposal a draft proposal answers and saves it to the note. */
export function SelectGrantForNoteModal({ noteId, isOpen, onClose }: NoteModalProps) {
  const { save } = useSelectedGrant(noteId);

  return (
    <SelectFundingOpportunityModal
      isOpen={isOpen}
      onClose={onClose}
      onSelect={(grant) => void save(grant)}
    />
  );
}
