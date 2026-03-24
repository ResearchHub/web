'use client';

import { FC, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Trash2, Ban } from 'lucide-react';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { UserModerationService } from '@/services/user-moderation.service';
import { cn } from '@/utils/styles';
import { toast } from 'react-hot-toast';

interface ModerationActionsProps {
  onDismiss: () => void;
  onRemove: () => void;
  onRefresh?: () => void;
  view?: 'pending' | 'dismissed' | 'removed';
  hasVerdict?: boolean;
  className?: string;
  authorId?: number | null;
  authorName?: string;
}

export const ModerationActions: FC<ModerationActionsProps> = ({
  onDismiss,
  onRemove,
  onRefresh,
  view = 'pending',
  hasVerdict = false,
  className,
  authorId,
  authorName,
}) => {
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);

  if (view !== 'pending' || hasVerdict) {
    return null;
  }

  const handleSuspendUser = async () => {
    if (!authorId) return;
    try {
      await UserModerationService.suspendUser(String(authorId));
      toast.success('User has been suspended');
      onRefresh?.();
    } catch (error) {
      console.error('Failed to suspend user:', error);
      toast.error('Failed to suspend user');
    }
  };

  return (
    <>
      <div className={cn('flex flex-wrap items-center gap-x-1 gap-y-1', className)}>
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
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>

        {authorId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSuspendConfirm(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Ban className="h-4 w-4 mr-1" />
            Remove + Suspend
          </Button>
        )}
      </div>

      {authorId && (
        <ConfirmModal
          isOpen={showSuspendConfirm}
          onClose={() => setShowSuspendConfirm(false)}
          onConfirm={handleSuspendUser}
          title="Remove + Suspend"
          message={`Are you sure you want to suspend ${authorName || 'this user'}? This will remove their content and prevent them from using the platform.`}
          confirmText="Remove + Suspend"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
    </>
  );
};
