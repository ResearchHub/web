'use client';

import { toast } from 'react-hot-toast';
import { AvatarUpload } from '@/components/AvatarUpload';
import { BaseModal } from '@/components/ui/BaseModal';

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
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md" padding="p-4">
      <AvatarUpload
        onClose={onClose}
        onSave={saveCoverImage}
        initialImage={null}
        isLoading={isLoading}
      />
      {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
    </BaseModal>
  );
}
