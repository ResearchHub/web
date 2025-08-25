'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/form/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { AlertCircle, Plus, Check } from 'lucide-react';
import { useUserLists } from '@/hooks/useUserLists';
import { UserListService } from '@/services/userList.service';
import type { UserList, AddDocumentToListParams } from '@/types/userList';
import { ID } from '@/types/root';

interface SaveToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: ID;
  documentType: 'paper' | 'post' | 'note';
  documentTitle?: string;
}

export const SaveToListModal = ({
  isOpen,
  onClose,
  documentId,
  documentType,
  documentTitle,
}: SaveToListModalProps) => {
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { lists, isLoading, createList } = useUserLists();

  const handleSaveToList = async () => {
    if (!selectedListId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const params: AddDocumentToListParams = {
        listId: selectedListId,
        documentId,
        documentType,
      };

      await UserListService.addDocumentToList(params);
      setSuccess(true);

      // Close modal after a brief delay to show success
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedListId('');
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save document to list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewList = async () => {
    try {
      const newList = await createList({
        title: `List for ${documentTitle || documentType}`,
        description: `Auto-created list for ${documentTitle || documentType}`,
        visibility: 'PRIVATE',
      });
      setSelectedListId(newList.id?.toString() || '');
    } catch (error) {
      setError('Failed to create new list');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setSelectedListId('');
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Save to List">
      <div className="space-y-4">
        <div>
          <p className="text-gray-600 mt-1">
            Choose a list to save this {documentType}
            {documentTitle && `: "${documentTitle}"`}
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
            <div className="text-sm font-medium">Document saved to list successfully!</div>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="list-select" className="block text-sm font-semibold text-gray-700 mb-1">
              Select List
            </label>
            <select
              id="list-select"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              disabled={isLoading || isSubmitting}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
            >
              <option value="">Choose a list...</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id?.toString() || ''}>
                  {list.title} ({list.itemCount} items)
                </option>
              ))}
            </select>
          </div>

          {lists.length === 0 && !isLoading && (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">You don't have any lists yet.</p>
              <Button onClick={handleCreateNewList} variant="outlined" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First List
              </Button>
            </div>
          )}

          {lists.length > 0 && (
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outlined"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveToList} disabled={!selectedListId || isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save to List'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
