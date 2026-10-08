import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { NoteService } from '@/services/note.service';
import type { SelectedGrantDetails } from '@/types/grant';
import type { PublishingFormData } from './schema';

/**
 * The Request for Proposal a draft proposal answers. Unlike the other
 * details it is stored on the note directly, so choosing one writes it
 * before the form learns of it.
 */
export function useSelectedGrant(noteId: number) {
  const { watch, setValue } = useFormContext<PublishingFormData>();
  const selectedGrant = (watch('selectedGrant') ?? null) as SelectedGrantDetails | null;
  const [isSaving, setIsSaving] = useState(false);

  const save = useCallback(
    async (grant: SelectedGrantDetails | null) => {
      setIsSaving(true);
      try {
        await NoteService.updateNote({ noteId, selectedGrantId: grant?.id ?? null });
        setValue('selectedGrant', grant);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update RFP');
      } finally {
        setIsSaving(false);
      }
    },
    [noteId, setValue]
  );

  return { selectedGrant, isSaving, save };
}
