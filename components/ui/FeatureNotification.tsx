'use client';

import { X, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FeatureNotification as FeatureNotificationType } from '@/types/featureNotification';

interface FeatureNotificationProps {
  notification: FeatureNotificationType;
  onDismiss: (id: string) => void;
}

export function FeatureNotification({ notification, onDismiss }: FeatureNotificationProps) {
  const router = useRouter();

  const handleCTAClick = () => {
    if (notification.ctaUrl) {
      router.push(notification.ctaUrl);
    }
    onDismiss(notification.id);
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm">
      <div className="flex-shrink-0">{notification.icon}</div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{notification.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{notification.description}</p>

        {notification.ctaText && notification.ctaUrl && (
          <Button
            onClick={handleCTAClick}
            variant="ghost"
            size="sm"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            {notification.ctaText}
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
      </div>

      <Button
        onClick={() => onDismiss(notification.id)}
        variant="ghost"
        size="icon"
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
