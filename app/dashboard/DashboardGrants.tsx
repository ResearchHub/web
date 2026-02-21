import { GrantService } from '@/services/grant.service';
import { GrantList } from '@/components/Funding/GrantList';

interface DashboardGrantsProps {
  userId: string | number;
}

export async function DashboardGrants({ userId }: DashboardGrantsProps) {
  const { grants } = await GrantService.getGrants({
    createdBy: userId,
    status: 'OPEN',
    ordering: 'newest',
  });

  return <GrantList grants={grants} showCreateCTA isDashboard />;
}
