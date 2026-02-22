'use client';

// Client component because it depends on OrganizationContext for the org slug.
// Cannot be a server component like DashboardGrants.

import { useEffect, useState } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { NoteService } from '@/services/note.service';
import { GrantDraftCarousel } from '@/components/Funding/GrantDraftCarousel';
import { GrantCarouselSkeleton } from '@/components/skeletons/GrantCarouselSkeleton';
import type { Note } from '@/types/note';

export function DashboardDraftGrants() {
  const { selectedOrg } = useOrganizationContext();
  const [drafts, setDrafts] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleDelete = async (noteId: number) => {
    try {
      await NoteService.deleteNote(noteId);
      setDrafts((prev) => prev.filter((n) => n.id !== noteId));
    } catch {
      // Silently fail -- the note stays in the list
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
          orgSlug={selectedOrg!.slug}
          onDeleteGrant={() => handleDelete(note.id)}
        />
      ))}
    </div>
  );
}
