import { ReactNode } from 'react';
import { ActivityService, ActivityScope } from '@/services/activity.service';
import { FundingSidebar } from './FundingSidebar';
import type { FeedEntry } from '@/types/feed';

interface FundingSidebarServerProps {
  topSection?: ReactNode;
  grantId?: number | string;
  grantTitle?: string;
  scope?: ActivityScope;
}

export async function FundingSidebarServer({
  topSection,
  grantId,
  grantTitle,
  scope = 'grants',
}: FundingSidebarServerProps) {
  let entries: FeedEntry[] = [];

  try {
    const result = await ActivityService.getActivity({
      pageSize: 15,
      scope,
      ...(grantId ? { grantId } : {}),
    });
    entries = result.entries;
  } catch (error) {
    console.error('Error loading funding sidebar activity:', error);
  }

  return <FundingSidebar topSection={topSection} entries={entries} grantTitle={grantTitle} />;
}
