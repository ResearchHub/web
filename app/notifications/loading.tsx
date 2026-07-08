import { PageLayout } from '@/app/layouts/PageLayout';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { Icon } from '@/components/ui/icons';
import { NotificationSkeletonList } from '@/components/skeletons/NotificationSkeleton';

export default function NotificationsLoading() {
  return (
    <PageLayout>
      <div className="w-full">
        <div className="mb-4">
          <MainPageHeader
            icon={<Icon name="notification" size={24} className="text-gray-900" />}
            title="Notifications"
            subtitle="Stay updated with your latest activity"
            showTitle={false}
          />
        </div>

        <div className="py-6">
          <NotificationSkeletonList />
        </div>
      </div>
    </PageLayout>
  );
}
