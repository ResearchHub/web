'use client';

import { useState, useEffect, useId } from 'react';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { InterestSelector } from '@/components/InterestSelector/InterestSelector';
import { toast } from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserService } from '@/services/user.service';
import { ProfileInformationForm } from './ProfileInformationForm';
import { useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import { FormField, ProfileInformationFormValues } from './ProfileInformationForm/schema';
import { University } from './EducationAutocomplete';
import { OnboardingAccordionSkeleton } from './OnboardingAccordionSkeleton';

type DotStepperProps = {
  total: number;
  current: number;
};

export function DotStepper({ total, current }: DotStepperProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      {Array.from({ length: total }).map((_, idx) => (
        <span
          key={idx}
          className={`h-3 w-3 rounded-full transition-colors ${
            idx <= current ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

type OnboardingStep = 'PERSONAL_INFORMATION' | 'ADDITIONAL_INFORMATION' | 'TOPICS';

export interface EducationEntry {
  id?: string | number;
  name?: string;
  degree?: { value: string; label: string };
  major?: string;
  year?: { value: string; label: string };
  summary?: string;
  is_public?: boolean;
  university?: University | null;
}

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

export function OnboardingWizard() {
  const { user, isLoading: isUserLoading, error: userError, refreshUser } = useUser();
  const router = useRouter();
  const formId = useId();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('PERSONAL_INFORMATION');
  const [
    { isLoading: updateAuthorProfileDataLoading, error: updateAuthorProfileDataError },
    updateAuthorProfileData,
  ] = useUpdateAuthorProfileData();

  const [isSaving, setIsSaving] = useState(false);

  // Mark onboarding as completed as soon as the component mounts
  useEffect(() => {
    const markOnboardingCompleted = async () => {
      try {
        await UserService.setCompletedOnboarding();
      } catch (error) {
        console.error('Error automatically marking onboarding as completed:', error);
      }
    };

    markOnboardingCompleted();
  }, []);

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

  const handleFinishOnboarding = async () => {
    setIsSaving(true);
    try {
      // Mark onboarding as complete in the database
      await UserService.setCompletedOnboarding();
      // Refresh user data to update the hasCompletedOnboarding flag
      await refreshUser();

      router.replace('/');
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      toast.error('An error occurred while completing setup.');
      setIsSaving(false);
    }
  };

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
            <InterestSelector mode="onboarding" />
          </>
        );
      default:
        return <div>Invalid Step</div>;
    }
  };

  const title = () => {
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

  let current = 0;
  switch (currentStep) {
    case 'PERSONAL_INFORMATION':
      current = 0;
      break;
    case 'ADDITIONAL_INFORMATION':
      current = 1;
      break;
    case 'TOPICS':
      current = 2;
      break;
    default:
      current = 0;
      break;
  }

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-primary-50 to-violet-100 flex flex-col items-center justify-center p-8 relative">
      <div className="flex flex-col bg-white rounded-lg shadow-2xl max-w-xl w-full relative overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 flex items-center px-8 py-4">
          <span className="text-white text-lg font-semibold">{title()}</span>
        </div>

        <div className="min-h-[calc(100vh-16rem)] sm:!min-h-[400px] p-8 overflow-y-auto">
          {renderStepContent()}
        </div>

        <div
          className="flex justify-between items-center border-t py-4 px-8 bg-gradient-to-b from-primary-50/80 to-white"
          style={{
            boxShadow: '0 -4px 12px -4px rgba(0,0,0,0.10)', // Only top shadow
          }}
        >
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 'PERSONAL_INFORMATION' || isSaving}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" /> Back
          </Button>
          {currentStep !== 'TOPICS' ? (
            <Button type="submit" form={formId} disabled={updateAuthorProfileDataLoading}>
              {updateAuthorProfileDataLoading ? 'Saving...' : 'Continue'}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinishOnboarding} disabled={isSaving}>
              {isSaving ? 'Finishing...' : 'Finish'}{' '}
              <FontAwesomeIcon icon={faCheck} className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <DotStepper total={3} current={current} />
    </div>
  );
}
