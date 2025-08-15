'use client';

import { useState } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { CreateEditorForm } from './CreateEditorForm';
import { DeleteEditorForm } from './DeleteEditorForm';
import { toast } from 'react-hot-toast';
import { EditorType } from '@/types/editor';
import { Button } from '@/components/ui/Button';

interface UpdateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  createEditor: (params: {
    editorEmail: string;
    editorType: EditorType;
    selectedHubId: number;
  }) => Promise<void>;
  deleteEditor: (params: { editorEmail: string; selectedHubId: number }) => Promise<void>;
}

export function UpdateEditorModal({
  isOpen,
  onClose,
  createEditor,
  deleteEditor,
}: UpdateEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'delete'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (params: {
    editorEmail: string;
    editorType: EditorType;
    selectedHubId: number;
  }) => {
    setIsSubmitting(true);
    try {
      await createEditor(params);
      toast.success('Editor created successfully!');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create editor';
      toast.error(errorMessage);
      // Don't close modal on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async (params: { editorEmail: string; selectedHubId: number }) => {
    setIsSubmitting(true);
    try {
      await deleteEditor(params);
      toast.success('Editor deleted successfully!');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete editor';
      toast.error(errorMessage);
      // Don't close modal on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Manage Editors" maxWidth="max-w-md">
      <div className="space-y-4 lg:!min-w-[400px]">
        {/* Button Group for switching between Create and Delete */}
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'create' ? 'default' : 'outlined'}
            onClick={() => setActiveTab('create')}
            disabled={isSubmitting}
            className="flex-1"
          >
            Create
          </Button>
          <Button
            variant={activeTab === 'delete' ? 'default' : 'outlined'}
            onClick={() => setActiveTab('delete')}
            disabled={isSubmitting}
            className="flex-1"
          >
            Delete
          </Button>
        </div>

        <div className="pt-4">
          {activeTab === 'create' ? (
            <CreateEditorForm
              onSubmit={handleCreateSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          ) : (
            <DeleteEditorForm
              onSubmit={handleDeleteSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          )}
        </div>
      </div>
    </BaseModal>
  );
}
