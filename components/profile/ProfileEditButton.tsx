import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { MoreHorizontal } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
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
  return (
    <div className={className}>
      <Button onClick={onEditClick} variant="outlined">
        <Icon name="edit" className="h-4 w-4 mr-2" />
        Edit Profile
      </Button>
      {isOrcidConnected && (
        <BaseMenu
          trigger={
            <Button variant="outlined" aria-label="More actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
          align="end"
        >
          <BaseMenuItem onClick={onSyncClick} disabled={isSyncing}>
            <FontAwesomeIcon icon={faOrcid} className="h-4 w-4 mr-2 text-orcid-500" />
            {isSyncing ? 'Syncing...' : 'Sync ORCID'}
          </BaseMenuItem>
        </BaseMenu>
      )}
    </div>
  );
}
