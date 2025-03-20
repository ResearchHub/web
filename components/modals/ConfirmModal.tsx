import { Modal } from '@/components/ui/form/Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  cancelButtonClass = 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-0">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${cancelButtonClass}`}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md ${confirmButtonClass}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
