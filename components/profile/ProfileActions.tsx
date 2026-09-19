'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useDeleteAuthor } from '@/hooks/useAuthor';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { Icon } from '@/components/ui/icons/Icon';

interface ProfileActionsProps {
  readonly authorId: number;
  readonly authorName: string;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly isOrcidConnected: boolean;
  readonly onEditClick: () => void;
  readonly onSyncClick: () => void;
  readonly isSyncing: boolean;
}

export function ProfileActions({
  authorId,
  authorName,
  canEdit,
  canDelete,
  isOrcidConnected,
  onEditClick,
  onSyncClick,
  isSyncing,
}: ProfileActionsProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [{ isLoading: isDeleting }, deleteAuthor] = useDeleteAuthor();
  const canSyncOrcid = canEdit && isOrcidConnected;
  const hasMenuActions = canSyncOrcid || canDelete;

  const handleDelete = async () => {
    try {
      await deleteAuthor(authorId);
      toast.success('Author has been deleted');
      router.replace('/');
    } catch {
      toast.error('Failed to delete author');
    }
  };

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        {canEdit && (
          <Button onClick={onEditClick} variant="outlined">
            <Icon name="edit" className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}

        {hasMenuActions && (
          <BaseMenu
            trigger={
              <Button variant="outlined" size="icon" aria-label="More actions">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            }
            align="end"
          >
            {canSyncOrcid && (
              <BaseMenuItem onSelect={onSyncClick} disabled={isSyncing} className="cursor-pointer">
                <FontAwesomeIcon icon={faOrcid} className="mr-2 h-4 w-4 text-orcid-500" />
                {isSyncing ? 'Syncing...' : 'Sync ORCID'}
              </BaseMenuItem>
            )}
            {canDelete && (
              <BaseMenuItem
                onSelect={() => setIsConfirmOpen(true)}
                disabled={isDeleting}
                className="cursor-pointer text-red-600 focus:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete author'}
              </BaseMenuItem>
            )}
          </BaseMenu>
        )}
      </div>

      {canDelete && (
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Delete author"
          message={`Are you sure you want to delete ${authorName}? Their profile will be hidden and any linked user account will be deactivated. Related records will be preserved.`}
          confirmText="Delete author"
        />
      )}
    </>
  );
}
