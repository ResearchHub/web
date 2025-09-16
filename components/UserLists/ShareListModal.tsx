'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/form/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Alert } from '@/components/ui/Alert';
import { AlertCircle, Copy, Check, UserPlus, X } from 'lucide-react';
import { useUserLists } from '@/hooks/useUserLists';
import { UserListService } from '@/services/userList.service';
import type {
  UserListWithDocuments,
  AddPermissionParams,
  RemovePermissionParams,
  ListPermission,
} from '@/types/userList';
import { ID } from '@/types/root';

interface ShareListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: UserListWithDocuments;
}

export const ShareListModal = ({ isOpen, onClose, list }: ShareListModalProps) => {
  const [email, setEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<'VIEW' | 'EDIT' | 'ADMIN'>('VIEW');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { addPermission, removePermission } = useUserLists();

  const handleAddPermission = async () => {
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Note: This would need a user lookup service to get userId from email
      // For now, we'll show a placeholder implementation
      setError('User lookup by email not implemented yet. Please use user ID.');
      setEmail('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add permission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePermission = async (userId: ID) => {
    try {
      await removePermission({ listId: list.id, userId });
      setSuccess('Permission removed successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove permission');
    }
  };

  const handleCopyLink = async () => {
    try {
      // Generate share link - this would use the backend share token
      const shareUrl = `${window.location.origin}/shared/list/${list.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setError('Failed to copy link');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setEmail('');
      setError(null);
      setSuccess(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Share List">
      <div className="space-y-4">
        <div>
          <p className="text-gray-600">
            Share "{list.title}" with other users or generate a public link
          </p>
        </div>

        {error && (
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <div className="text-sm font-medium">{error}</div>
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            <Check className="h-4 w-4" />
            <div className="text-sm font-medium">{success}</div>
          </Alert>
        )}

        {/* Public Share Link */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Public Share Link</h3>
          <div className="flex gap-2">
            <Input
              value={`${window.location.origin}/shared/list/${list.id}`}
              readOnly
              className="flex-1"
            />
            <Button
              onClick={handleCopyLink}
              variant="outlined"
              size="sm"
              className="whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">Anyone with this link can view your list</p>
        </div>

        {/* Add User Permission */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Add User Permission</h3>
          <div className="space-y-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
              type="email"
            />
            <select
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(e.target.value as 'VIEW' | 'EDIT' | 'ADMIN')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
            >
              <option value="VIEW">View - Can only view the list</option>
              <option value="EDIT">Edit - Can add/remove items</option>
              <option value="ADMIN">Admin - Can edit list settings and manage permissions</option>
            </select>
            <Button
              onClick={handleAddPermission}
              disabled={!email.trim() || isSubmitting}
              variant="outlined"
              size="sm"
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Current Permissions */}
        {list.permissions && list.permissions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Current Permissions</h3>
            <div className="space-y-2">
              {list.permissions.map((permission: ListPermission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{permission.userName}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {permission.permissionLevel.toLowerCase()} access
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRemovePermission(permission.userId)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outlined" onClick={handleClose} disabled={isSubmitting}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
