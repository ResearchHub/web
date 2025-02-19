import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useUpdateNote } from '@/hooks/useNote';
import { useNotebookPublish } from '@/contexts/NotebookPublishContext';

interface ConfirmPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isPublishing: boolean;
}

export function ConfirmPublishModal({
  isOpen,
  onClose,
  onConfirm,
  title: initialTitle,
  isPublishing,
}: ConfirmPublishModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const { editor, noteId } = useNotebookPublish();
  const [{ isLoading: isUpdating }, updateNote] = useUpdateNote(noteId, {
    onTitleUpdate: (newTitle) => {
      setTitle(newTitle);
    },
  });

  // Sync with initial title when modal opens
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, isOpen]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // Update the editor's title (first heading)
    if (editor) {
      editor
        .chain()
        .command(({ tr }) => {
          const pos = 0;
          const node = tr.doc.nodeAt(pos);
          if (node && node.type.name === 'heading') {
            tr.insertText(newTitle, pos + 1, pos + node.nodeSize - 1);
            return true;
          }
          return false;
        })
        .run();

      updateNote(editor);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 mb-4">
                    Confirm Publication
                  </DialogTitle>
                  <p className="text-sm text-gray-600 mb-4">
                    You are about to publish your research preregistration:
                  </p>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full p-3 text-sm font-medium text-gray-900 bg-gray-50 rounded-lg mb-6 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter title..."
                  />

                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={onConfirm}
                      disabled={isUpdating || isPublishing}
                    >
                      {isPublishing ? 'Publishing...' : 'Confirm & Publish'}
                    </Button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
