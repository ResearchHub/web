import { FeatureNotificationConfig } from '@/types/featureNotification';
import { UserPlus } from 'lucide-react';

export const featureNotificationsConfig: FeatureNotificationConfig = {
  enabled: true,
  defaultPosition: 'top-right',
  defaultDuration: undefined, // no auto-dismiss
  notifications: [
    {
      id: 'referral-program',
      title: 'Earn Credits with Referrals',
      description: 'Invite friends to ResearchHub and earn funding credits when they contribute!',
      icon: <UserPlus className="w-6 h-6 text-gray-500" />,
      cookieName: 'feature_notification_referral_program',
      showForAllUsers: true, // show for all users
      priority: 'high',
      ctaText: 'Refer and earn 10%',
      ctaUrl: '/referral',
      duration: 3600000, // 1 hour
      position: 'bottom-right',
    },
  ],
};
