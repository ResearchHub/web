'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { UserService } from '@/services/user.service';
import { BaseModal } from '@/components/ui/BaseModal';
import { ProfileInformationForm } from './ProfileInformationForm';
import { useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import toast from 'react-hot-toast';
import { ProfileInformationFormValues } from './ProfileInformationForm/schema';

const onboardingSteps = [
  { id: 'PROFILE_INFORMATION', label: 'Profile Information' },
  { id: 'TOPICS', label: "Choose topics you're interested in" },
];

export function OnboardingModalWrapper() {
  const { user, isLoading } = useUser();
  const [showModal, setShowModal] = useState(false);

  const [
    { isLoading: updateAuthorProfileDataLoading, error: updateAuthorProfileDataError },
    updateAuthorProfileData,
  ] = useUpdateAuthorProfileData();

  useEffect(() => {
    if (UserService.shouldRedirectToOnboarding(user)) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [user, isLoading]);

  const handleClose = () => {
    setShowModal(false);
  };

  const handleProfileFormSubmit = async (data: ProfileInformationFormValues) => {
    if (!user?.authorProfile?.id) {
      toast.error('User information not available. Cannot save profile.');
      return false;
    }
    console.log(data);

    const authorId = user.authorProfile.id;
    try {
      await updateAuthorProfileData(authorId, {
        ...data,
        education: data.education.length > 0 ? data.education : undefined,
        description: data.description || undefined,
        headline: data.headline || undefined,
        linkedin: data.linkedin || undefined,
        orcid_id: data.orcid_id || undefined,
        twitter: data.twitter || undefined,
        google_scholar: data.google_scholar || undefined,
      });
      handleClose();
    } catch (e) {
      toast.error('Failed to save profile.');
    }
  };

  return (
    <BaseModal isOpen={showModal} onClose={handleClose} title="ResearchHub Onboarding">
      <div>
        <h2 className="text-xl font-semibold mb-4">First, tell us a little about yourself.</h2>
        <div className="min-w-0 sm:min-w-[600px]">
          <ProfileInformationForm
            onSubmit={handleProfileFormSubmit}
            simplifiedView={true}
            submitLabel="Continue"
            loading={updateAuthorProfileDataLoading}
          />
        </div>
      </div>
    </BaseModal>
  );
}
