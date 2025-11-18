import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';
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

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <DialogTitle className="text-lg font-semibold text-gray-900">{title}</DialogTitle>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {mode === 'delete' ? (
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete "{name}"? This cannot be undone.
                  </p>
                ) : (
                  <Input
                    label="List Name"
                    placeholder="Enter list name"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSubmit()}
                    autoFocus
                    className="mb-6"
                  />
                )}

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
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
