'use client';

// Client component because it depends on OrganizationContext for the org slug.
// Cannot be a server component like DashboardGrants.

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { NoteService } from '@/services/note.service';
import { GrantDraftCarousel } from '@/components/Funding/GrantDraftCarousel';
import { GrantCarouselSkeleton } from '@/components/skeletons/GrantCarouselSkeleton';
import { EditGrantModal } from '@/components/Grant/EditGrantModal';
import type { Note } from '@/types/note';

export function DashboardDraftGrants() {
  const { selectedOrg } = useOrganizationContext();
  const [drafts, setDrafts] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedOrg?.slug) {
      setDrafts([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    NoteService.getOrganizationNotes(selectedOrg.slug, {
      status: 'DRAFT',
      documentType: 'GRANT',
    })
      .then((data) => {
        if (!cancelled) setDrafts(data.results);
      })
      .catch(() => {
        if (!cancelled) setDrafts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedOrg?.slug]);

  const handleModalClose = async () => {
    if (editingNoteId) {
      try {
        const updated = await NoteService.getNote(editingNoteId.toString());
        setDrafts((prev) =>
          prev.map((n) => (n.id === editingNoteId ? { ...n, title: updated.title } : n))
        );
      } catch {
        // Ignore -- worst case the title stays stale until next load
      }
    }
    setEditingNoteId(null);
  };

  const handleDelete = async (noteId: number) => {
    if (
      !globalThis.confirm(
        'Are you sure you want to delete this draft? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await NoteService.deleteNote(noteId);
      setDrafts((prev) => prev.filter((n) => n.id !== noteId));
      toast.success('Draft deleted');
    } catch {
      toast.error('Failed to delete draft. Please try again.');
    }
  };

  if (isLoading) return <GrantCarouselSkeleton count={1} />;
  if (drafts.length === 0) return null;

  return (
    <div className="py-4">
      {drafts.map((note) => (
        <GrantDraftCarousel
          key={note.id}
          note={note}
          onContinueEditing={() => setEditingNoteId(note.id)}
          onDeleteGrant={() => handleDelete(note.id)}
        />
      ))}

      {editingNoteId && <EditGrantModal isOpen noteId={editingNoteId} onClose={handleModalClose} />}
    </div>
  );
}
