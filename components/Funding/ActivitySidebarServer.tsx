import { ActivityService } from '@/services/activity.service';
import { ActivitySidebar } from './ActivitySidebar';

export async function ActivitySidebarServer() {
  const { entries } = await ActivityService.getActivity({ pageSize: 15, scope: 'grants' });
  return <ActivitySidebar entries={entries} />;
}
