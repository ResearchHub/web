'use client';

import { useState } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { TransformedEditorData } from '@/types/editor';
import { toast } from 'react-hot-toast';
import { isValidEmail } from '@/utils/validation';

interface DeleteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: TransformedEditorData | null;
  onConfirm: (params: { editorEmail: string; selectedHubIds: number[] }) => Promise<void>;
}

export function DeleteEditorModal({ isOpen, onClose, editor, onConfirm }: DeleteEditorModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError(''); // Clear error when user types
  };

  const handleConfirm = async () => {
    if (!editor) return;

    // Validate email format
    if (!email.trim()) {
      setError('Please enter an email address to confirm deletion');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const hubIds = editor.authorProfile.editorOfHubs?.map((hub) => hub.id) || [];

      if (hubIds.length === 0) {
        toast.error('No hubs found for this editor');
        return;
      }

      await onConfirm({
        editorEmail: email.trim(),
        selectedHubIds: hubIds,
      });

      toast.success('Editor deleted successfully!');
      onClose();
      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete editor';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setEmail('');
    setError('');
    setIsSubmitting(false);
  };

  if (!editor) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Editor"
      maxWidth="max-w-md"
      showCloseButton={true}
    >
      <div className="space-y-4">
        {/* Confirmation Message */}
        <div className="text-gray-700">
          <p className="mb-3">
            Are you sure you want to delete{' '}
            <strong>
              {editor.authorProfile.firstName} {editor.authorProfile.lastName}
            </strong>{' '}
            as an editor?
          </p>

          <p className="mb-3">This will remove them from the following hubs:</p>

          <ul className="list-disc list-inside space-y-1 mb-4">
            {editor.authorProfile.editorOfHubs?.map((hub) => (
              <li key={hub.id} className="text-gray-600">
                {hub.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Email Confirmation */}
        <div>
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="editor@example.com"
            error={error}
            disabled={isSubmitting}
            label="Enter editor email to confirm deletion"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outlined" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting ? 'Deleting...' : 'Delete Editor'}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
