'use client';

import { useId } from 'react';
import { toast } from 'react-hot-toast';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import { ProfileInformationForm } from '@/components/profile/About/ProfileInformationForm';
import { ProfileInformationFormValues } from '@/components/profile/About/ProfileInformationForm/schema';
import { useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import { useUser } from '@/contexts/UserContext';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorId: number;
  refetchAuthorInfo: () => Promise<void>;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  authorId,
  refetchAuthorInfo,
}: ProfileEditModalProps) {
  const formId = useId();
  const { refreshUser } = useUser();
  const [{ isLoading }, updateAuthorProfileData] = useUpdateAuthorProfileData();

  const handleSubmit = async (data: ProfileInformationFormValues) => {
    if (!authorId) {
      toast.error('User information not available. Cannot save profile.');
      return;
    }

    try {
      await updateAuthorProfileData(authorId, {
        ...data,
        education: data.education.length > 0 ? data.education : [],
        description: data.description,
        headline: data.headline,
        linkedin: data.linkedin,
        orcid_id: data.orcid_id,
        twitter: data.twitter,
        google_scholar: data.google_scholar,
      });

      await refetchAuthorInfo();
      toast.success('Profile updated successfully');
      onClose();
      await refreshUser();
    } catch (e) {
      toast.error('Failed to save profile.');
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      maxWidth="max-w-5xl"
      footer={
        <Button type="submit" form={formId} disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      <ProfileInformationForm onSubmit={handleSubmit} formId={formId} useAccordion={true} />
    </BaseModal>
  );
}
