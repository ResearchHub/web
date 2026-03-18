import { GrantService } from '@/services/grant.service';
import { GrantCarousel } from '@/components/Funding/GrantCarousel';

interface DashboardGrantsProps {
  userId: string | number;
}

export async function DashboardGrants({ userId }: DashboardGrantsProps) {
  const [{ grants: published }, { grants: past }] = await Promise.all([
    GrantService.getGrants({
      createdBy: userId,
      status: 'OPEN',
      ordering: 'most_applicants',
      excludeLikelySpam: false,
    }),
    GrantService.getGrants({
      createdBy: userId,
      status: 'CLOSED',
      ordering: 'newest',
      excludeLikelySpam: false,
    }),
  ]);

  return (
    <>
      {published.map((grant) => (
        <GrantCarousel key={grant.id} grant={grant} isDashboard />
      ))}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-500 pt-6 pb-1">Past Opportunities</h2>
          {past.map((grant) => (
            <GrantCarousel key={grant.id} grant={grant} isClosed />
          ))}
        </section>
      )}
    </>
  );
}
