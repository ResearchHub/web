import { ReactNode } from 'react';
import { ActivityService, ActivityScope } from '@/services/activity.service';
import { FundingSidebar } from './FundingSidebar';

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
  const { entries } = await ActivityService.getActivity({
    pageSize: 15,
    scope,
    ...(grantId ? { grantId } : {}),
  });

  return <FundingSidebar topSection={topSection} entries={entries} grantTitle={grantTitle} />;
}
