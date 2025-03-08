'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { AvatarUpload } from '@/components/AvatarUpload';
import { OrganizationService } from '@/services/organization.service';

// Add this at the top of the file to fix the TypeScript error
declare module 'react-avatar-editor';

interface OrgCoverImgModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  onSuccess?: (updatedOrg: any) => void;
}

export function OrgCoverImgModal({ isOpen, onClose, orgId, onSuccess }: OrgCoverImgModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCoverImage = async (imageDataUrl: string) => {
    setIsUploading(true);
    setError(null);

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

      // Use the service to update the organization cover image
      const updatedOrg = await OrganizationService.updateOrgCoverImage(orgId, blob);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(updatedOrg);
      }

      toast.success('Cover image updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating cover image:', error);
      setError(error instanceof Error ? error.message : 'Failed to update cover image');
      toast.error('Failed to update cover image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Update Organization Cover Image
            </Dialog.Title>
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
