'use client';

import { useSelectedGrant } from '@/components/Notebook/PublishingForm/useSelectedGrant';
import { AddDetail, DetailValue } from './MastheadLine';
import type { MastheadWidgetConfig } from './mastheadWidgets';
import { SelectGrantForNoteModal } from './SelectGrantForNoteModal';

interface ApplyingToWidgetProps {
  readonly config: MastheadWidgetConfig;
  readonly noteId: number;
  readonly editable: boolean;
  readonly editing: boolean;
  readonly onEditingChange: (editing: boolean) => void;
}

/**
 * The Request for Proposal a proposal answers, picked in the RFP modal and
 * saved to the note there. A proposal can publish without one, so it can
 * also be taken away.
 */
export function ApplyingToWidget({
  config,
  noteId,
  editable,
  editing,
  onEditingChange,
}: ApplyingToWidgetProps) {
  const { selectedGrant, isSaving, save } = useSelectedGrant(noteId);
  const open = editable ? () => onEditingChange(true) : undefined;

  if (!selectedGrant && !open) return null;
  return (
    <>
      {selectedGrant ? (
        <DetailValue
          label={config.label}
          onEdit={open}
          onClear={open && !isSaving ? () => void save(null) : undefined}
          clearLabel="Stop applying to this RFP"
          truncate
        >
          {selectedGrant.shortTitle}
        </DetailValue>
      ) : (
        open && <AddDetail icon={config.icon} label={config.addLabel} onClick={open} />
      )}
      {editable && (
        <SelectGrantForNoteModal
          noteId={noteId}
          isOpen={editing}
          onClose={() => onEditingChange(false)}
        />
      )}
    </>
  );
}
