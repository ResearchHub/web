'use client';

import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { initialContent } from '@/components/Editor/lib/data/initialContent';
import { createFundingDraft } from '@/components/Funding/createFundingDraft';
import { useFundingDrafting } from '@/components/Funding/useFundingDrafting';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

/**
 * The moderators' door to a new ChangeLog entry: a DISCUSSION note in their
 * organization, started from the standard template and opened in the
 * workspace. It is published from there like any other document; the post's
 * id then goes into CHANGELOG_POST_IDS for the changelog page to list it.
 */
export function useChangelogDrafting() {
  const { selectedOrg } = useOrganizationContext();
  const { openDraft } = useFundingDrafting();
  const [isStarting, setIsStarting] = useState(false);

  const startChangelog = useCallback(async () => {
    const orgSlug = selectedOrg?.slug;
    if (!orgSlug) {
      toast.error('No organization to create the ChangeLog in');
      return;
    }
    setIsStarting(true);
    try {
      const note = await createFundingDraft({
        orgSlug,
        title: 'Untitled ChangeLog',
        documentType: 'DISCUSSION',
        grouping: 'PRIVATE',
        template: initialContent,
      });
      openDraft(note);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start the ChangeLog');
    } finally {
      setIsStarting(false);
    }
  }, [selectedOrg?.slug, openDraft]);

  return { startChangelog, isStarting };
}
