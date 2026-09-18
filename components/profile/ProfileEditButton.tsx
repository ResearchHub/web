import { Button } from '@/components/ui/Button';
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
        <Button
          variant="outlined"
          onClick={onSyncClick}
          disabled={isSyncing}
          className="order-last col-span-full"
        >
          <FontAwesomeIcon icon={faOrcid} className="h-4 w-4 mr-2 text-orcid-500" />
          {isSyncing ? 'Syncing...' : 'Sync ORCID'}
        </Button>
      )}
    </div>
  );
}
