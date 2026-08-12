import { ReactNode } from 'react';
import { ActivityService, ActivityScope } from '@/services/activity.service';
import { ActivitySidebar } from './ActivitySidebar';
import type { FeedEntry } from '@/types/feed';

interface ActivitySidebarServerProps {
  topSection?: ReactNode;
  grantId?: number | string;
  grantTitle?: string;
  scope?: ActivityScope;
}

export async function ActivitySidebarServer({
  topSection,
  grantId,
  grantTitle,
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

  return <ActivitySidebar topSection={topSection} entries={entries} grantTitle={grantTitle} />;
}
