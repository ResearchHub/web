'use client';

import { useId } from 'react';
import { toast } from 'react-hot-toast';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/Button';
import {
  ProfileInformationForm,
  type SocialLinkKey,
} from '@/components/profile/About/ProfileInformationForm';
import {
  ALL_PROFILE_FIELDS,
  type FormField,
  type ProfileInformationFormValues,
} from '@/components/profile/About/ProfileInformationForm/schema';
import { useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import { useUser } from '@/contexts/UserContext';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorId: number;
  /** Reload whatever the host shows of the profile; the signed-in user is refreshed regardless. */
  refetchAuthorInfo?: () => Promise<void>;
  /** A subset of the profile to edit; the whole profile by default. */
  fields?: FormField[];
  socialLinks?: readonly SocialLinkKey[];
  title?: string;
  description?: string;
  maxWidth?: string;
}

/** Edits the signed-in user's author profile, or the part of it the host names. */
export function ProfileEditModal({
  isOpen,
  onClose,
  authorId,
  refetchAuthorInfo,
  fields = ALL_PROFILE_FIELDS,
  socialLinks,
  title = 'Edit Profile',
  description,
  maxWidth = 'max-w-5xl',
}: ProfileEditModalProps) {
  const formId = useId();
  const { refreshUser } = useUser();
  const [{ isLoading }, updateAuthorProfileData] = useUpdateAuthorProfileData();
  const wholeProfile = fields === ALL_PROFILE_FIELDS;

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

      await refetchAuthorInfo?.();
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
      title={title}
      maxWidth={maxWidth}
      footer={
        <Button type="submit" form={formId} disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      {description && <p className="mb-4 text-sm text-gray-600">{description}</p>}
      <ProfileInformationForm
        onSubmit={handleSubmit}
        formId={formId}
        fields={fields}
        socialLinks={socialLinks}
        showAvatar={wholeProfile}
        useAccordion={wholeProfile}
      />
    </BaseModal>
  );
}
