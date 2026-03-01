import { ReactNode } from 'react';
import { ActivityService } from '@/services/activity.service';
import { FundingSidebar } from './FundingSidebar';

interface FundingSidebarServerProps {
  topSection?: ReactNode;
  grantId?: number | string;
  grantTitle?: string;
}

export async function FundingSidebarServer({
  topSection,
  grantId,
  grantTitle,
}: FundingSidebarServerProps) {
  const { entries } = await ActivityService.getActivity({
    pageSize: 15,
    scope: 'grants',
    ...(grantId ? { grantId } : {}),
  });

  return <FundingSidebar topSection={topSection} entries={entries} grantTitle={grantTitle} />;
}
