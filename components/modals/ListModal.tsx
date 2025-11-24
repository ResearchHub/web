'use client';

import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';

interface ListModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'delete';
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const CONFIG = {
  create: { title: 'Create List', submit: 'Create', loading: 'Creating...' },
  edit: { title: 'Edit List', submit: 'Save', loading: 'Saving...' },
  delete: { title: 'Delete List', submit: 'Delete', loading: 'Deleting...' },
};

export const ListModal = ({
  isOpen,
  onClose,
  mode,
  name,
  onNameChange,
  onSubmit,
  isSubmitting,
}: ListModalProps) => {
  const { title, submit, loading } = CONFIG[mode];

  const footer = (
    <div className="flex justify-end gap-3">
      <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        disabled={(mode !== 'delete' && !name.trim()) || isSubmitting}
        variant={mode === 'delete' ? 'destructive' : 'default'}
      >
        {isSubmitting ? loading : submit}
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-2xl"
      padding="p-6"
      footer={footer}
    >
      <div className="md:!min-w-[500px] md:!max-w-[500px]">
        {mode === 'delete' ? (
          <p className="text-gray-600">
            Are you sure you want to delete "{name}"? This cannot be undone.
          </p>
        ) : (
          <Input
            label="List Name"
            placeholder="Enter list name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) {
                e.preventDefault();
                e.stopPropagation();
                onSubmit();
              }
            }}
            autoFocus
          />
        )}
      </div>
    </BaseModal>
  );
};
