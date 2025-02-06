'use client';

import { useNote } from '@/hooks/useNote';
import { useParams, useRouter } from 'next/navigation';
import { BlockEditor } from '@/components/Editor/components/BlockEditor/BlockEditor';
import { NotebookSkeleton } from '@/components/skeletons/NotebookSkeleton';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useOrganizationNotes } from '@/hooks/useOrganizationNotes';
import { useEffect, useCallback } from 'react';
import type { Organization } from '@/types/organization';

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params?.noteId as string;
  const orgSlug = params?.orgSlug as string;

  const { organizations, setSelectedOrg, selectedOrg } = useOrganizationContext();
  const org = organizations.find((o) => o.slug === orgSlug);

  // Fetch notes for the current organization
  const { notes, isLoading: isLoadingNotes } = useOrganizationNotes(selectedOrg, {
    currentOrgSlug: orgSlug,
  });

  // Fetch the current note
  const { note, isLoading: isLoadingNote, error } = useNote(noteId);

  // Handle organization switching
  const handleOrgSwitch = useCallback(
    async (org: Organization) => {
      // First, navigate to the new organization's page
      await router.push(`/notebook/${org.slug}`);
      // Only after navigation, update the selected org
      setSelectedOrg(org);
    },
    [router, setSelectedOrg]
  );

  // Update selected org when URL changes
  useEffect(() => {
    if (org && (!selectedOrg || org.slug !== selectedOrg.slug)) {
      setSelectedOrg(org);
    }
  }, [org?.slug, selectedOrg?.slug, setSelectedOrg]);

  // Redirect to first note if no note is selected
  useEffect(() => {
    if (!isLoadingNotes && notes.length > 0 && !noteId) {
      router.push(`/notebook/${orgSlug}/${notes[0].id}`);
    }
  }, [notes, isLoadingNotes, noteId, orgSlug, router]);

  // Show loading state during any data fetching
  if (isLoadingNotes || isLoadingNote || !note || orgSlug !== selectedOrg?.slug) {
    return <NotebookSkeleton />;
  }

  // Let error boundary handle any errors
  if (error) {
    throw error;
  }

  return (
    <div className="h-full">
      <BlockEditor content={note.content} />
    </div>
  );
}
