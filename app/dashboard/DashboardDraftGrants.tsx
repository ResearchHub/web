'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { NoteService } from '@/services/note.service';
import { GrantDraftCarousel } from '@/components/Funding/GrantDraftCarousel';
import type { Note } from '@/types/note';

export function DashboardDraftGrants() {
  const { selectedOrg } = useOrganizationContext();
  const router = useRouter();
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

  if (isLoading || drafts.length === 0) return null;

  return (
    <div className="py-4">
      {drafts.map((note) => (
        <GrantDraftCarousel
          key={note.id}
          note={note}
          orgSlug={selectedOrg!.slug}
          onEditGrant={() => router.push(`/notebook/${selectedOrg!.slug}/${note.id}`)}
        />
      ))}
    </div>
  );
}
