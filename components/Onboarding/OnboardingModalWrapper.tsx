'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { UserService } from '@/services/user.service';
import { BaseModal } from '@/components/ui/BaseModal';
import { ProfileInformationForm } from './ProfileInformationForm';
import { useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import toast from 'react-hot-toast';
import { ProfileInformationFormValues } from './ProfileInformationForm/schema';
import { RecommendationsStep } from './Recommendations';

type OnboardingStep = 'PROFILE_INFORMATION' | 'TOPICS';

export function OnboardingModalWrapper() {
  const { user, isLoading } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('PROFILE_INFORMATION');

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
      setCurrentStep('TOPICS');
      //   handleClose();
    } catch (e) {
      toast.error('Failed to save profile.');
    }
  };

  const modalTitle = () => {
    switch (currentStep) {
      case 'PROFILE_INFORMATION':
        return 'Welcome!';
      case 'TOPICS':
        return 'Almost there!';
      default:
        return 'ResearchHub Onboarding';
    }
  };

  return (
    <BaseModal isOpen={showModal} onClose={handleClose} title={modalTitle()}>
      <div>
        <div className="min-w-0 sm:min-w-[600px] max-w-md sm:max-w-lg w-full mx-auto">
          {currentStep === 'PROFILE_INFORMATION' && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                First, tell us a little about yourself.
              </h2>
              <ProfileInformationForm
                onSubmit={handleProfileFormSubmit}
                simplifiedView={true}
                submitLabel="Continue"
                loading={updateAuthorProfileDataLoading}
              />
            </>
          )}

          {currentStep === 'TOPICS' && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Just let us know what topics you're interested in to get personalized
                recommendations.
              </h2>
              <RecommendationsStep
                onBack={() => setCurrentStep('PROFILE_INFORMATION')}
                onDone={handleClose}
              />
            </>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
