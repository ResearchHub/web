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
import { useQuery } from '@apollo/client';
import {
  GET_UNIFIED_CATEGORIES,
  UnifiedCategoriesResponse,
  UnifiedCategory,
} from '@/lib/graphql/queries';
import { Loader } from '@/components/ui/Loader';
import { Alert } from '@/components/ui/Alert';
import {
  Brain,
  Cpu,
  Globe,
  DollarSign,
  BarChart3,
  Calculator,
  Atom,
  FlaskConical,
  Microscope,
  Cog,
  Users,
} from 'lucide-react';

type OnboardingStep =
  | 'PERSONAL_INFORMATION'
  | 'ADDITIONAL_INFORMATION'
  | 'CATEGORIES'
  | 'SUBCATEGORIES'
  | 'TOPICS';

// Define available fields for each step
const STEP_FIELDS: Record<OnboardingStep, FormField[]> = {
  PERSONAL_INFORMATION: ['headline'],
  ADDITIONAL_INFORMATION: ['description', 'education', 'social_links'],
  CATEGORIES: [],
  SUBCATEGORIES: [],
  TOPICS: [],
};

// Category icons mapping
const CATEGORY_ICONS: { [key: string]: React.ElementType } = {
  life_sciences: Microscope,
  engineering: Cog,
  social_sciences: Users,
  earth_environmental_sciences: Globe,
  economics_finance: DollarSign,
  statistics_data_science: BarChart3,
  mathematics: Calculator,
  computer_science: Cpu,
  chemistry: FlaskConical,
  physics: Atom,
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

  // Add state for category selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  // Query for categories
  const {
    loading: categoriesLoading,
    error: categoriesError,
    data: categoriesData,
  } = useQuery<UnifiedCategoriesResponse>(GET_UNIFIED_CATEGORIES);

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
    let nextStep: OnboardingStep;

    // Update step navigation logic
    switch (currentStep) {
      case 'PERSONAL_INFORMATION':
        nextStep = 'ADDITIONAL_INFORMATION';
        break;
      case 'ADDITIONAL_INFORMATION':
        nextStep = 'CATEGORIES';
        break;
      default:
        nextStep = 'TOPICS';
    }

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

  const handleCategorySelection = () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    setCurrentStep('SUBCATEGORIES');
  };

  const handleSubcategorySelection = () => {
    // Save selected categories and subcategories to user profile or preferences
    // For now, just move to the next step
    setCurrentStep('TOPICS');
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'ADDITIONAL_INFORMATION':
        setCurrentStep('PERSONAL_INFORMATION');
        break;
      case 'CATEGORIES':
        setCurrentStep('ADDITIONAL_INFORMATION');
        break;
      case 'SUBCATEGORIES':
        setCurrentStep('CATEGORIES');
        break;
      case 'TOPICS':
        setCurrentStep('SUBCATEGORIES');
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
      case 'CATEGORIES':
        return 'Select your research areas';
      case 'SUBCATEGORIES':
        return 'Choose specific topics';
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
    } else if (currentStep === 'CATEGORIES') {
      return (
        <Button
          className="w-full"
          type="button"
          onClick={handleCategorySelection}
          disabled={selectedCategories.length === 0}
        >
          Continue
        </Button>
      );
    } else if (currentStep === 'SUBCATEGORIES') {
      return (
        <Button className="w-full" type="button" onClick={handleSubcategorySelection}>
          Continue
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
      case 'CATEGORIES':
        if (categoriesLoading) {
          return (
            <div className="flex items-center justify-center py-12">
              <Loader size="md" />
            </div>
          );
        }

        if (categoriesError) {
          return (
            <Alert variant="error">
              <span className="font-semibold">Error loading categories</span>
              <p>{categoriesError.message}</p>
            </Alert>
          );
        }

        const categories = categoriesData?.unifiedCategories || [];

        return (
          <>
            <h2 className="text-xl font-semibold mb-4 mt-4">Select your research areas</h2>
            <p className="text-gray-600 mb-8">
              Choose the areas that match your research interests
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.slug);
                const CategoryIcon = CATEGORY_ICONS[category.slug] || Brain;

                return (
                  <button
                    key={category.slug}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategories(
                          selectedCategories.filter((c) => c !== category.slug)
                        );
                      } else {
                        setSelectedCategories([...selectedCategories, category.slug]);
                      }
                    }}
                    className={`
                      p-4 rounded-lg border-2 transition-all text-left
                      ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                        p-2 rounded-lg
                        ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                      `}
                      >
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}
                        >
                          {category.name}
                        </h3>
                        <p
                          className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}
                        >
                          {category.paperCount || 0} papers
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        );

      case 'SUBCATEGORIES':
        if (categoriesLoading) {
          return (
            <div className="flex items-center justify-center py-12">
              <Loader size="md" />
            </div>
          );
        }

        const selectedCategoryData =
          categoriesData?.unifiedCategories.filter((cat) =>
            selectedCategories.includes(cat.slug)
          ) || [];

        return (
          <>
            <h2 className="text-xl font-semibold mb-4 mt-4">Choose specific topics</h2>
            <p className="text-gray-600 mb-8">
              Select the topics within your chosen research areas
            </p>
            <div className="space-y-6">
              {selectedCategoryData.map((category) => {
                const CategoryIcon = CATEGORY_ICONS[category.slug] || Brain;

                return (
                  <div key={category.slug} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <CategoryIcon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((subcategory) => {
                        const isSelected = selectedSubcategories.includes(subcategory.slug);

                        return (
                          <button
                            key={subcategory.slug}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSubcategories(
                                  selectedSubcategories.filter((s) => s !== subcategory.slug)
                                );
                              } else {
                                setSelectedSubcategories([
                                  ...selectedSubcategories,
                                  subcategory.slug,
                                ]);
                              }
                            }}
                            className={`
                              px-4 py-2 rounded-full text-sm transition-all
                              ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                              }
                            `}
                          >
                            {subcategory.name}
                            <span
                              className={`ml-1 text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}
                            >
                              ({subcategory.paperCount || 0})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
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
