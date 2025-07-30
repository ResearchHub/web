export interface FeatureNotification {
  id: string;
  title: string | React.ReactElement;
  description: string;
  icon: React.ReactElement;
  showForAllUsers: boolean; // true = for all users, false = only for logged in users
  position?:
    | 'top-right'
    | 'top-center'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'bottom-left';
  duration?: number; // in milliseconds, undefined = no auto-dismiss
  priority?: 'low' | 'medium' | 'high'; // for controlling display order
  ctaText?: string; // Call-to-action button text
  ctaUrl?: string; // Call-to-action button URL
}

export interface FeatureNotificationConfig {
  notifications: FeatureNotification[];
  enabled: boolean; // can disable the entire system
  defaultPosition?:
    | 'top-right'
    | 'top-center'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'bottom-left';
  defaultDuration?: number;
}
