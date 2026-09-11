import { ReactNode } from 'react';
import { ActivityService, ActivityScope } from '@/services/activity.service';
import { ActivitySidebar } from './ActivitySidebar';
import type { FeedEntry } from '@/types/feed';
import { ID } from '@/types/root';

interface ActivitySidebarServerProps {
  topSection?: ReactNode;
  grantId?: number | string;
  grantTitle?: string;
  /** Post id of the page being viewed — hides same-document title links. */
  currentDocumentId?: ID;
  scope?: ActivityScope;
}

export async function ActivitySidebarServer({
  topSection,
  grantId,
  grantTitle,
  currentDocumentId,
  scope = 'grants',
}: ActivitySidebarServerProps) {
  let entries: FeedEntry[] = [];

  try {
    const result = await ActivityService.getActivity({
      pageSize: 15,
      scope,
      ...(grantId ? { grantId } : {}),
    });
    entries = result.entries;
  } catch (error) {
    console.error('Error loading activity sidebar entries:', error);
  }

  return (
    <ActivitySidebar
      topSection={topSection}
      entries={entries}
      grantTitle={grantTitle}
      currentDocumentId={currentDocumentId}
    />
  );
}
