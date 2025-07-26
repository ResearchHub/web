'use client';

import { useEffect, useState, useId, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { UserService } from '@/services/user.service';
import { BaseModal } from '@/components/ui/BaseModal';
import { ProfileInformationForm } from './ProfileInformationForm';
import { useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import toast from 'react-hot-toast';
import { FormField, ProfileInformationFormValues } from './ProfileInformationForm/schema';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronLeft } from '@fortawesome/pro-solid-svg-icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { InterestSelector } from '../InterestSelector/InterestSelector';
import { OnboardingAccordionSkeleton } from './OnboardingAccordionSkeleton';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { useSession } from 'next-auth/react';
import { Experiment, ExperimentVariant, isExperimentEnabled } from '@/utils/experiment';

type OnboardingStep = 'PERSONAL_INFORMATION' | 'ADDITIONAL_INFORMATION' | 'TOPICS';

// Define available fields for each step
const STEP_FIELDS: Record<OnboardingStep, FormField[]> = {
  PERSONAL_INFORMATION: ['headline'],
  ADDITIONAL_INFORMATION: ['description', 'education', 'social_links'],
  TOPICS: [],
};

// Add this helper function at the top of the file, after the imports
const filterFormDataByFields = (
  data: ProfileInformationFormValues,
  fields: FormField[]
): Partial<ProfileInformationFormValues> => {
  const filteredData: Partial<ProfileInformationFormValues> = {};

  // Only include fields that are in the fields array
  if (fields.includes('first_name')) {
    filteredData.first_name = data.first_name;
  }
  if (fields.includes('last_name')) {
    filteredData.last_name = data.last_name;
  }
  if (fields.includes('headline')) {
    filteredData.headline = data.headline;
  }
  if (fields.includes('description')) {
    filteredData.description = data.description;
  }
  if (fields.includes('education')) {
    filteredData.education = data.education;
  }
  if (fields.includes('social_links')) {
    filteredData.linkedin = data.linkedin;
    filteredData.orcid_id = data.orcid_id;
    filteredData.twitter = data.twitter;
    filteredData.google_scholar = data.google_scholar;
  }

  return filteredData;
};

export function OnboardingModal() {
  const { user, isLoading: isUserLoading, refreshUser, error: userError } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('PERSONAL_INFORMATION');
  const formId = useId();
  const searchParams = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const onboardingEventFired = useRef(false);

  const [
    { isLoading: updateAuthorProfileDataLoading, error: updateAuthorProfileDataError },
    updateAuthorProfileData,
  ] = useUpdateAuthorProfileData();

  useEffect(() => {
    if (typeof window === 'undefined' || !showModal) return;

    const url = new URL(window.location.href);
    if (!url.searchParams.has('onboarding')) {
      url.searchParams.append('onboarding', 'true');
      window.history.replaceState({}, '', url.toString());
    }
  }, [showModal]);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    const shouldShowOnboarding =
      UserService.shouldRedirectToOnboarding(user) || searchParams.get('onboarding') === 'true';

    if (
      shouldShowOnboarding &&
      user &&
      user.hasCompletedOnboarding === false &&
      !onboardingEventFired.current
    ) {
      AnalyticsService.logEvent(LogEvent.ONBOARDING_VIEWED);
      onboardingEventFired.current = true;
    }

    setShowModal(shouldShowOnboarding);
  }, [user, isUserLoading, searchParams]);

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

  const handleFinishOnboarding = async () => {
    setIsSaving(true);
    try {
      // Mark onboarding as complete in the database
      await UserService.setCompletedOnboarding();
      // Refresh user data to update the hasCompletedOnboarding flag
      await refreshUser();
      setShowModal(false);
      router.replace('/');
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      toast.error('An error occurred while completing setup.');
      setIsSaving(false);
    }
  };

  const handleProfileFormSubmit = async (data: ProfileInformationFormValues) => {
    if (!user?.authorProfile?.id) {
      toast.error('User information not available. Cannot save profile.');
      return false;
    }

    const authorId = user.authorProfile.id;
    const nextStep = currentStep === 'PERSONAL_INFORMATION' ? 'ADDITIONAL_INFORMATION' : 'TOPICS';

    try {
      // Get the fields for the current step
      const currentStepFields = STEP_FIELDS[currentStep];

      // Filter the form data to only include fields for the current step
      const filteredData = filterFormDataByFields(data, currentStepFields);

      await updateAuthorProfileData(authorId, filteredData);
      await refreshUser();
      setCurrentStep(nextStep);
    } catch (e) {
      toast.error('Failed to save profile.');
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'ADDITIONAL_INFORMATION':
        setCurrentStep('PERSONAL_INFORMATION');
        break;
      case 'TOPICS':
        setCurrentStep('ADDITIONAL_INFORMATION');
        break;
      default:
        setCurrentStep('PERSONAL_INFORMATION');
        break;
    }
  };

  const modalTitle = () => {
    switch (currentStep) {
      case 'PERSONAL_INFORMATION':
      case 'ADDITIONAL_INFORMATION':
        return user?.authorProfile?.firstName
          ? `Welcome, ${user.authorProfile.firstName.split(' ')[0]}.`
          : 'Welcome to ResearchHub!';
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
    if (currentStep === 'PERSONAL_INFORMATION' || currentStep === 'ADDITIONAL_INFORMATION') {
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
        <Button
          className="w-full"
          type="button"
          onClick={handleFinishOnboarding}
          disabled={isSaving}
        >
          {isSaving ? 'Finishing...' : 'Finish'}{' '}
          <FontAwesomeIcon icon={faCheck} className="ml-2 h-4 w-4" />
        </Button>
      );
    } else {
      return null;
    }
  }

  const renderStepContent = () => {
    if (isUserLoading && currentStep === 'PERSONAL_INFORMATION') {
      return <OnboardingAccordionSkeleton />;
    }
    if (userError) {
      return <div>Error loading user data. Please try refreshing.</div>;
    }

    switch (currentStep) {
      case 'PERSONAL_INFORMATION':
        return (
          <>
            <h2 className="text-xl font-semibold mb-8 mt-4">
              Tell us a little bit about yourself.
            </h2>
            <ProfileInformationForm
              onSubmit={handleProfileFormSubmit}
              formId={formId}
              fields={STEP_FIELDS.PERSONAL_INFORMATION}
              autoFocusField="headline"
            />
          </>
        );
      case 'ADDITIONAL_INFORMATION':
        return (
          <>
            <h2 className="text-xl font-semibold mb-8 mt-4">Help others get to know you.</h2>
            <ProfileInformationForm
              onSubmit={handleProfileFormSubmit}
              formId={formId}
              fields={STEP_FIELDS.ADDITIONAL_INFORMATION}
              showAvatar={false}
              useAccordion={true}
              autoFocusField="description"
            />
          </>
        );
      case 'TOPICS':
        return (
          <>
            <h2 className="text-xl font-semibold mb-8 mt-4">Which topics are you interested in?</h2>
            <InterestSelector mode="onboarding" showToastOnSuccess={false} />
          </>
        );
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <BaseModal
      isOpen={showModal}
      showCloseButton={false}
      onClose={() => {}} // We don't want to close the modal when the user clicks outside
      title={modalTitle()}
      footer={renderFooter({
        currentStep,
        formId,
        updateAuthorProfileDataLoading,
      })}
      headerAction={
        currentStep !== 'PERSONAL_INFORMATION' ? (
          <Button
            type="button"
            variant="outlined"
            onClick={prevStep}
            className="flex items-center gap-2"
            size="icon"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </Button>
        ) : null
      }
    >
      <div>
        <div className="min-w-0 sm:!min-w-[600px] max-w-md sm:!max-w-lg w-full mx-auto">
          {renderStepContent()}
        </div>
      </div>
    </BaseModal>
  );
}
