'use client';

import { useState } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { toast } from 'react-hot-toast';
import { EditorType, TransformedEditorData } from '@/types/editor';
import { EditorForm } from './EditorForm';

interface UpdateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEditor?: TransformedEditorData;
  createEditor: (params: {
    editorEmail: string;
    editorType: EditorType;
    selectedHubIds: number[];
  }) => Promise<void>;
  deleteEditor: (params: { editorEmail: string; selectedHubIds: number[] }) => Promise<void>;
}

export function UpdateEditorModal({
  isOpen,
  onClose,
  selectedEditor,
  createEditor,
  deleteEditor,
}: UpdateEditorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (params: {
    editorEmail: string;
    editorType: EditorType;
    selectedHubIds: number[];
  }) => {
    setIsSubmitting(true);
    try {
      await createEditor(params);
      if (params.selectedHubIds.length === 1) {
        toast.success(`Editor created successfully for ${params.selectedHubIds.length} topic`);
      } else {
        toast.success(`Editors created successfully for ${params.selectedHubIds.length} topics`);
      }
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create editor';
      toast.error(errorMessage);
      // Don't close modal on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async (params: { editorEmail: string; selectedHubIds: number[] }) => {
    setIsSubmitting(true);
    try {
      await deleteEditor(params);

      if (params.selectedHubIds.length === 1) {
        toast.success('Editor deleted successfully!');
      } else {
        toast.success(`Editor deleted successfully from ${params.selectedHubIds.length} topics!`);
      }

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete editor';
      toast.error(errorMessage);
      // Don't close modal on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (params: {
    editorEmail: string;
    hubsToAdd: number[];
    hubsToRemove: number[];
    editorType?: EditorType;
  }) => {
    setIsSubmitting(true);
    try {
      // Handle hubs to remove
      if (params.hubsToRemove.length > 0) {
        await deleteEditor({
          editorEmail: params.editorEmail,
          selectedHubIds: params.hubsToRemove,
        });
      }

      // Handle hubs to add
      if (params.hubsToAdd.length > 0) {
        await createEditor({
          editorEmail: params.editorEmail,
          editorType: params.editorType || 'ASSISTANT_EDITOR',
          selectedHubIds: params.hubsToAdd,
        });
      }

      const totalChanges = params.hubsToAdd.length + params.hubsToRemove.length;
      if (totalChanges > 0) {
        toast.success(`Editor updated successfully!`);
      } else {
        toast.success('No changes were made.');
      }

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update editor';
      toast.error(errorMessage);
      // Don't close modal on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedEditor ? 'Update Editor' : 'Create Editor'}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 lg:!min-w-[400px]">
        <div className="pt-4">
          <EditorForm
            selectedEditor={selectedEditor}
            onSubmit={handleCreateSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            onUpdate={handleUpdateSubmit}
          />
        </div>
      </div>
    </BaseModal>
  );
}
