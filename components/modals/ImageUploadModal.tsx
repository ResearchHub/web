'use client';

import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AvatarUpload } from '@/components/AvatarUpload';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageBlob: Blob) => Promise<any>;
  isLoading?: boolean;
  error?: string | null;
  title?: string;
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  error = null,
  title = 'Upload Image',
}: ImageUploadModalProps) {
  const saveCoverImage = async (imageDataUrl: string) => {
    try {
      // Convert base64 to blob
      let byteCharacters;
      if (imageDataUrl.split(',')[0].indexOf('base64') >= 0) {
        byteCharacters = atob(imageDataUrl.split(',')[1]);
      } else {
        byteCharacters = unescape(imageDataUrl.split(',')[1]);
      }

      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      await onSave(blob);

      toast.success('Image updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <Dialog.Title className="text-lg font-semibold text-gray-900">{title}</Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            <AvatarUpload
              isOpen={true}
              onClose={onClose}
              onSave={saveCoverImage}
              initialImage={null}
              isLoading={isLoading}
            />

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
