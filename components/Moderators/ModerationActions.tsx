'use client';

import { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle } from 'lucide-react';

interface ModerationActionsProps {
  onDismiss: () => void;
  onRemove: () => void;
  view?: 'pending' | 'dismissed' | 'removed';
  hasVerdict?: boolean;
  className?: string;
}

export const ModerationActions: FC<ModerationActionsProps> = ({
  onDismiss,
  onRemove,
  view = 'pending',
  hasVerdict = false,
  className = '',
}) => {
  // Only show action buttons for pending items without verdicts
  const showActionButtons = view === 'pending' && !hasVerdict;

  if (!showActionButtons) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Dismiss
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <XCircle className="h-4 w-4 mr-1" />
        Remove
      </Button>
    </div>
  );
};
