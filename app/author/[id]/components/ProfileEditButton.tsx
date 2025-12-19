import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { RefreshCw, MoreHorizontal } from 'lucide-react';
import { Icon } from '@/components/ui/icons/Icon';

interface ProfileEditButtonProps {
  readonly isOrcidConnected: boolean;
  readonly onEditClick: () => void;
  readonly onSyncClick: () => void;
  readonly isSyncing: boolean;
  readonly className?: string;
}

export function ProfileEditButton({
  isOrcidConnected,
  onEditClick,
  onSyncClick,
  isSyncing,
  className,
}: ProfileEditButtonProps) {
  if (!isOrcidConnected) {
    return (
      <Button onClick={onEditClick} variant="outlined" className={className}>
        <Icon name="edit" className="h-4 w-4 mr-2" />
        Edit Profile
      </Button>
    );
  }

  return (
    <BaseMenu
      trigger={
        <Button variant="outlined" size="sm" className={className}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      }
      align="end"
    >
      <BaseMenuItem onClick={onEditClick}>
        <Icon name="edit" className="h-4 w-4 mr-2" />
        Edit Profile
      </BaseMenuItem>
      <BaseMenuItem onClick={onSyncClick} disabled={isSyncing}>
        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync Authorship'}
      </BaseMenuItem>
    </BaseMenu>
  );
}
