'use client';

import { useEffect, useState, useId } from 'react';
import { useUser } from '@/contexts/UserContext';
import { UserService } from '@/services/user.service';
import { BaseModal } from '@/components/ui/BaseModal';
import { ProfileInformationForm } from './ProfileInformationForm';
import { useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import toast from 'react-hot-toast';
import { ProfileInformationFormValues } from './ProfileInformationForm/schema';
import { RecommendationsStep } from './Recommendations';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/pro-solid-svg-icons';

type OnboardingStep = 'PROFILE_INFORMATION' | 'TOPICS';

export function OnboardingModal() {
  const { user, isLoading, refreshUser } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('PROFILE_INFORMATION');
  const formId = useId();

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

  useEffect(() => {
    const markOnboardingCompleted = async () => {
      try {
        await UserService.setCompletedOnboarding();
      } catch (error) {
        console.error('Error automatically marking onboarding as completed:', error);
      }
    };

    if (showModal) {
      markOnboardingCompleted();
    }
  }, [showModal]);

  const handleClose = () => {
    setShowModal(false);
    refreshUser();
  };

  const handleProfileFormSubmit = async (data: ProfileInformationFormValues) => {
    if (!user?.authorProfile?.id) {
      toast.error('User information not available. Cannot save profile.');
      return false;
    }

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
    } catch (e) {
      toast.error('Failed to save profile.');
    }
  };

  const modalTitle = () => {
    switch (currentStep) {
      case 'PROFILE_INFORMATION':
        return 'Welcome to ResearchHub!';
      case 'TOPICS':
        return 'Almost there!';
      default:
        return 'ResearchHub Onboarding';
    }
  };

  function renderFooter({
    currentStep,
    formId,
    updateAuthorProfileDataLoading,
  }: {
    currentStep: OnboardingStep;
    formId: string;
    updateAuthorProfileDataLoading: boolean;
  }) {
    if (currentStep === 'PROFILE_INFORMATION') {
      return (
        <Button
          className="w-full"
          type="submit"
          form={formId}
          disabled={updateAuthorProfileDataLoading}
        >
          {updateAuthorProfileDataLoading ? 'Saving...' : 'Continue'}
        </Button>
      );
    } else if (currentStep === 'TOPICS') {
      return (
        <Button className="w-full" type="button" onClick={handleClose}>
          Done
        </Button>
      );
    } else {
      return null;
    }
  }

  return (
    <BaseModal
      isOpen={showModal}
      onClose={handleClose}
      title={modalTitle()}
      footer={renderFooter({
        currentStep,
        formId,
        updateAuthorProfileDataLoading,
      })}
      headerAction={
        currentStep === 'TOPICS' ? (
          <Button
            type="button"
            variant="outlined"
            onClick={() => setCurrentStep('PROFILE_INFORMATION')}
            className="flex items-center gap-2"
            size="icon"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </Button>
        ) : null
      }
    >
      <div>
        <div className="min-w-0 sm:min-w-[600px] max-w-md sm:max-w-lg w-full mx-auto">
          {currentStep === 'PROFILE_INFORMATION' && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                First, tell us a little about yourself.
              </h2>
              <ProfileInformationForm
                onSubmit={handleProfileFormSubmit}
                formId={formId}
                fields={['first_name', 'last_name', 'headline']}
              />
            </>
          )}

          {currentStep === 'TOPICS' && (
            <>
              <h2 className="text-xl font-semibold mb-4">Which topics are you interested in?</h2>
              <RecommendationsStep onBack={() => setCurrentStep('PROFILE_INFORMATION')} />
            </>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
