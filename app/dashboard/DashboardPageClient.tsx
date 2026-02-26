'use client';

import { ReactNode, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FunderOverview } from '@/components/Funding/FunderOverview';
import { CreateGrantButton } from '@/components/Grant/CreateGrantButton';
import { GrantDraftCarousel } from '@/components/Funding/GrantDraftCarousel';
import { MockPublishedGrantCarousel } from '@/components/Funding/MockPublishedGrantCarousel';
import { GrantCarouselSkeleton } from '@/components/skeletons/GrantCarouselSkeleton';
import { EditGrantModal } from '@/components/Grant/EditGrantModal';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { NoteService } from '@/services/note.service';
import type { Note } from '@/types/note';

interface DashboardPageClientProps {
  children: ReactNode;
  userId?: number;
}

export function DashboardPageClient({ children, userId }: DashboardPageClientProps) {
  const { selectedOrg } = useOrganizationContext();
  const [drafts, setDrafts] = useState<Note[]>([]);
  const [isDraftsLoading, setIsDraftsLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedOrg?.slug) {
      setDrafts([]);
      setIsDraftsLoading(false);
      return;
    }

    let cancelled = false;
    setIsDraftsLoading(true);

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
        if (!cancelled) setIsDraftsLoading(false);
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
        /* title stays stale until next load */
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

  return (
    <PageLayout rightSidebar={false}>
      <FunderOverview className="mt-4" userId={userId} />

      <div className="flex items-center justify-between pt-6 pb-2 mt-6">
        <h2 className="text-sm font-medium text-gray-500">My Opportunities</h2>
        <CreateGrantButton />
      </div>

      {isDraftsLoading ? (
        <GrantCarouselSkeleton count={1} />
      ) : (
        <GrantDraftCarousel
          drafts={drafts}
          onContinueEditing={(noteId) => setEditingNoteId(noteId)}
          onDelete={handleDelete}
        />
      )}

      <section>
        <h2 className="text-sm font-medium text-gray-500 pt-6 pb-1">Published Opportunities</h2>
        <MockPublishedGrantCarousel />
      </section>

      {children}

      {editingNoteId && <EditGrantModal isOpen noteId={editingNoteId} onClose={handleModalClose} />}
    </PageLayout>
  );
}
