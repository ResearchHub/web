import { FeatureNotificationConfig } from './types';
import { UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const featureNotificationsConfig: FeatureNotificationConfig = {
  enabled: false, // Kobe: Turning off for now so not all users see this after signup
  defaultPosition: 'top-right',
  defaultDuration: undefined, // no auto-dismiss
  notifications: [
    {
      id: 'referral-program',
      title: (
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">Refer users and earn 10%</span>
          <Badge variant="primary" size="xs" className="text-xs">
            New
          </Badge>
        </div>
      ),
      description: 'Refer people to ResearchHub and earn credits when they fund proposals',
      icon: <UserPlus className="w-6 h-6 text-gray-500" />,
      showForAllUsers: false, // show for logged in users only
      priority: 'high',
      ctaText: 'Learn more',
      ctaUrl: '/referral',
      duration: 3600000, // 1 hour
      position: 'bottom-right',
    },
  ],
};
