'use client';

import { useState, useEffect, useId } from 'react';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { UserService } from '@/services/user.service';
import { useUpdateAuthorProfileData } from '@/hooks/useAuthor';
import { useQuery } from '@apollo/client';
import { GET_UNIFIED_CATEGORIES, UnifiedCategoriesResponse } from '@/lib/graphql/queries';
import { Loader } from '@/components/ui/Loader';
import { Alert } from '@/components/ui/Alert';
import { Logo } from '@/components/ui/Logo';
import { motion, AnimatePresence } from 'framer-motion';
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
  Check,
} from 'lucide-react';
import { usePreferences } from '@/contexts/PreferencesContext';

type OnboardingStep = 'NAME' | 'CATEGORIES' | 'SUBCATEGORIES' | 'COMPLETE';

// Export this interface as it's used by other components
export interface EducationEntry {
  id?: string | number;
  name?: string;
  degree?: { value: string; label: string };
  major?: string;
  year?: { value: string; label: string };
  summary?: string;
  is_public?: boolean;
  university?: any;
}

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

export function OnboardingWizard() {
  const { user, isLoading: isUserLoading, refreshUser } = useUser();
  const router = useRouter();
  const { preferences, updatePreferences } = usePreferences();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('NAME');
  const [firstName, setFirstName] = useState(preferences?.firstName || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    preferences?.selectedCategories || []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    preferences?.selectedSubcategories || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const {
    loading: categoriesLoading,
    error: categoriesError,
    data: categoriesData,
  } = useQuery<UnifiedCategoriesResponse>(GET_UNIFIED_CATEGORIES);

  const [{ isLoading: updateAuthorProfileDataLoading }, updateAuthorProfileData] =
    useUpdateAuthorProfileData();

  // Mark onboarding as completed on mount
  useEffect(() => {
    const markOnboardingCompleted = async () => {
      try {
        await UserService.setCompletedOnboarding();
      } catch (error) {
        console.error('Error marking onboarding as completed:', error);
      }
    };
    markOnboardingCompleted();
  }, []);

  // Update preferences when selections actually change
  useEffect(() => {
    // Only update if values have actually changed
    if (
      firstName !== preferences?.firstName ||
      JSON.stringify(selectedCategories) !== JSON.stringify(preferences?.selectedCategories) ||
      JSON.stringify(selectedSubcategories) !== JSON.stringify(preferences?.selectedSubcategories)
    ) {
      updatePreferences({
        firstName,
        selectedCategories,
        selectedSubcategories,
      });
    }
  }, [firstName, selectedCategories, selectedSubcategories, preferences, updatePreferences]);

  const handleNameSubmit = async () => {
    if (!firstName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (user?.authorProfile?.id) {
      try {
        await updateAuthorProfileData(user.authorProfile.id, {
          first_name: firstName.trim(),
        });
        await refreshUser();
      } catch (error) {
        console.error('Error updating name:', error);
      }
    }

    setCurrentStep('CATEGORIES');
  };

  const handleCategorySelection = () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one research area');
      return;
    }
    setCurrentStep('SUBCATEGORIES');
  };

  const handleSubcategorySelection = () => {
    setCurrentStep('COMPLETE');
  };

  const handleFinishOnboarding = async () => {
    setIsSaving(true);
    try {
      // Save completion timestamp
      updatePreferences({
        completedAt: new Date().toISOString(),
      });

      await refreshUser();
      router.replace('/feed');
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      toast.error('An error occurred. Please try again.');
      setIsSaving(false);
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'CATEGORIES':
        setCurrentStep('NAME');
        break;
      case 'SUBCATEGORIES':
        setCurrentStep('CATEGORIES');
        break;
      case 'COMPLETE':
        setCurrentStep('SUBCATEGORIES');
        break;
      default:
        break;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'NAME':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center py-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Logo noText size={160} className="mx-auto" />
            </motion.div>

            <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to ResearchHub</h1>
            <p className="text-lg text-gray-600 mb-12 max-w-md">First, what should we call you?</p>

            <input
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              className="w-full max-w-sm text-xl py-4 px-6 text-center rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              autoFocus
            />
          </motion.div>
        );

      case 'CATEGORIES':
        if (categoriesLoading) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader size="lg" />
            </div>
          );
        }

        if (categoriesError) {
          return (
            <Alert variant="error" className="my-8">
              <span className="font-semibold">Error loading categories</span>
              <p>{categoriesError.message}</p>
            </Alert>
          );
        }

        const categories = categoriesData?.unifiedCategories || [];

        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Hi {firstName}, let's personalize your experience
              </h2>
              <p className="text-lg text-gray-600">What research areas interest you most?</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {categories.map((category, index) => {
                const isSelected = selectedCategories.includes(category.slug);
                const CategoryIcon = CATEGORY_ICONS[category.slug] || Brain;

                return (
                  <motion.button
                    key={category.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
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
                      relative p-4 rounded-lg border-2 transition-all duration-200
                      ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`
                        w-12 h-12 rounded-lg flex items-center justify-center transition-colors mb-2
                        ${isSelected ? 'bg-blue-600' : 'bg-gray-100'}
                      `}
                      >
                        <CategoryIcon
                          className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`}
                        />
                      </div>

                      <h3
                        className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}
                      >
                        {category.name}
                      </h3>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 'SUBCATEGORIES':
        if (categoriesLoading) {
          return (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader size="lg" />
            </div>
          );
        }

        const selectedCategoryData =
          categoriesData?.unifiedCategories.filter((cat) =>
            selectedCategories.includes(cat.slug)
          ) || [];

        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Let's get specific</h2>
              <p className="text-lg text-gray-600">
                Choose topics within your selected research areas
              </p>
            </div>

            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
              {selectedCategoryData.map((category, categoryIndex) => {
                const CategoryIcon = CATEGORY_ICONS[category.slug] || Brain;

                return (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CategoryIcon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(category.subcategories || []).map((subcategory, index) => {
                        const isSelected = selectedSubcategories.includes(subcategory.slug);

                        return (
                          <motion.button
                            key={subcategory.slug}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: categoryIndex * 0.1 + index * 0.02 }}
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
                              px-4 py-2 rounded-full text-sm font-medium transition-all border
                              ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                              }
                            `}
                          >
                            {subcategory.name}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );

      case 'COMPLETE':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 text-center mb-4"
            >
              All set, {firstName}!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 text-center mb-8 max-w-md"
            >
              Your personalized research feed is ready. Start exploring the latest papers in your
              areas of interest.
            </motion.p>
          </motion.div>
        );
      default:
        return <div>Invalid Step</div>;
    }
  };

  const title = () => {
    switch (currentStep) {
      case 'NAME':
        return 'Welcome to ResearchHub';
      case 'CATEGORIES':
        return 'What are you passionate about?';
      case 'SUBCATEGORIES':
        return 'Choose specific topics';
      case 'COMPLETE':
        return 'Welcome to ResearchHub';
      default:
        return 'ResearchHub Onboarding';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Main container with border */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header with back button */}
        {currentStep !== 'NAME' && (
          <div className="px-8 pt-6 pb-2">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={isSaving}
              className="text-gray-600 hover:text-gray-900 -ml-2"
              size="sm"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className={`px-8 md:px-12 ${currentStep === 'NAME' ? 'pt-12' : 'pt-4'} pb-8`}>
          {/* Main content area */}
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
        </div>

        {/* Full-width footer button */}
        {currentStep === 'NAME' && (
          <Button
            onClick={handleNameSubmit}
            disabled={!firstName.trim()}
            className="w-full rounded-none rounded-b-2xl h-14 text-lg font-medium"
          >
            Continue
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Button>
        )}

        {currentStep === 'CATEGORIES' && (
          <Button
            onClick={handleCategorySelection}
            disabled={selectedCategories.length === 0}
            className="w-full rounded-none rounded-b-2xl h-14 text-lg font-medium"
          >
            Continue
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Button>
        )}

        {currentStep === 'SUBCATEGORIES' && (
          <Button
            onClick={handleSubcategorySelection}
            className="w-full rounded-none rounded-b-2xl h-14 text-lg font-medium"
          >
            Continue
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Button>
        )}

        {currentStep === 'COMPLETE' && (
          <Button
            onClick={handleFinishOnboarding}
            disabled={isSaving}
            className="w-full rounded-none rounded-b-2xl h-14 text-lg font-medium"
          >
            {isSaving ? (
              <>
                <Loader size="sm" className="mr-2" />
                Starting...
              </>
            ) : (
              <>
                Start Exploring
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
