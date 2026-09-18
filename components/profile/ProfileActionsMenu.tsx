'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useDeleteAuthor } from '@/hooks/useAuthor';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Icon } from '@/components/ui/icons/Icon';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import type { AuthorProfile } from '@/types/authorProfile';

interface ProfileActionsMenuProps {
  readonly author: AuthorProfile;
  readonly onEditClick: () => void;
  readonly onSyncClick: () => void;
  readonly isSyncing: boolean;
}

export function ProfileActionsMenu({
  author,
  onEditClick,
  onSyncClick,
  isSyncing,
}: ProfileActionsMenuProps) {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const isOwnProfile = currentUser?.authorProfile?.id === author.id;
  const isModerator = !!currentUser?.isModerator;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [{ isLoading }, deleteAuthor] = useDeleteAuthor();

  const handleDelete = async () => {
    try {
      await deleteAuthor(author.id);
      toast.success('Author has been deleted');
      router.replace('/');
    } catch {
      toast.error('Failed to delete author');
    }
  };

  if (!isOwnProfile && !isModerator) return null;

  return (
    <>
      <BaseMenu
        align="end"
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 text-gray-500 hover:text-gray-700"
            aria-label="Profile actions"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        }
      >
        {isOwnProfile && (
          <BaseMenuItem onSelect={onEditClick}>
            <Icon name="edit" className="h-4 w-4 mr-2" />
            Edit Profile
          </BaseMenuItem>
        )}
        {isOwnProfile && author.isOrcidConnected && (
          <BaseMenuItem onSelect={onSyncClick} disabled={isSyncing}>
            <FontAwesomeIcon icon={faOrcid} className="h-4 w-4 mr-2 text-orcid-500" />
            {isSyncing ? 'Syncing...' : 'Sync ORCID'}
          </BaseMenuItem>
        )}
        {isModerator && (
          <BaseMenuItem
            onSelect={() => setIsConfirmOpen(true)}
            disabled={isLoading}
            className="text-red-600 focus:bg-red-50 focus:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isLoading ? 'Deleting...' : 'Delete Author'}
          </BaseMenuItem>
        )}
      </BaseMenu>

      <ConfirmModal
        isOpen={isModerator && isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete author"
        message={`Are you sure you want to delete ${author.fullName}? Their profile will be hidden and any linked user account will be deactivated. Related records will be preserved.`}
        confirmText="Delete author"
      />
    </>
  );
}
