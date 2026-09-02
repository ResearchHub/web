import { PageLayout } from '@/app/layouts/PageLayout';
import { NotificationSkeletonList } from '@/components/skeletons/NotificationSkeleton';

export default function NotificationsLoading() {
  return (
    <PageLayout contentWidth="narrow">
      <h1 className="sr-only">Notifications</h1>
      <NotificationSkeletonList />
    </PageLayout>
  );
}
