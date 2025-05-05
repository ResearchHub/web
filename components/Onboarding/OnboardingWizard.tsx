'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faGraduationCap,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { Check, ChevronDown, Verified } from 'lucide-react';
import { AvatarUpload } from '@/components/AvatarUpload';
import { InterestSelector } from '@/components/InterestSelector/InterestSelector';
import { AuthorService } from '@/services/author.service';
import type { AuthorUpdateParams, AuthorUpdatePayload } from '@/services/author.service';
import { toast } from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Icon } from '@/components/ui/icons/Icon';
import { VerifyIdentityModal } from '@/components/modals/VerifyIdentityModal';
import { UserService } from '@/services/user.service';
import { BaseModal } from '@/components/ui/BaseModal';
import { EducationAutocomplete, University } from './EducationAutocomplete';
import { YearDropdown, YearOption } from './YearDropdown';
import { OnboardingWelcomeStep } from './OnboardingWelcomeStep';
import { OnboardingProfileStep } from './OnboardingProfileStep';
import { OnboardingVerifyProfileStep } from './OnboardingVerifyProfileStep';
import { OnboardingEducationModal } from './OnboardingEducationModal';

const TOTAL_STEPS = 4; // Welcome, Profile, Verify, Interests (Removed Features)

// Helper function (can be kept or removed if not needed elsewhere)
// Restore this function
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return blob;
}

export interface UserProfileData {
  firstName: string;
  lastName: string;
  headline: string;
  description: string;
  avatar: string | null;
  education: EducationEntry[];
  socialLinks: {
    linkedIn: string;
    orcid: string;
    twitter: string;
    googleScholar: string;
  };
}

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

// Extend the AuthorUpdateParams interface to include education
declare module '@/services/author.service' {
  interface AuthorUpdateParams {
    education?: Array<EducationEntry>;
  }
}

export function OnboardingWizard() {
  const { user, isLoading: isUserLoading, error: userError, refreshUser } = useUser();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    headline: '',
    description: '',
    avatar: null,
    education: [],
    socialLinks: {
      linkedIn: '',
      orcid: '',
      twitter: '',
      googleScholar: '',
    },
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [activeEducationIndex, setActiveEducationIndex] = useState(-1);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Mark onboarding as completed as soon as the component mounts
  useEffect(() => {
    const markOnboardingCompleted = async () => {
      try {
        await UserService.setCompletedOnboarding();
        await refreshUser();
      } catch (error) {
        console.error('Error automatically marking onboarding as completed:', error);
      }
    };

    markOnboardingCompleted();
  }, []);

  useEffect(() => {
    if (user && !isUserLoading) {
      setUserData((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        headline: user.authorProfile?.headline || '',
        description: user.authorProfile?.description || '',
        avatar: user.authorProfile?.profileImage || null,
        education: user.authorProfile?.education || [],
        socialLinks: {
          linkedIn: user.authorProfile?.linkedin || '',
          orcid: user.authorProfile?.orcidId || '',
          twitter: user.authorProfile?.twitter || '',
          googleScholar: user.authorProfile?.googleScholar || '',
        },
      }));
    } else if (!isUserLoading) {
      setUserData((prev) => ({
        ...prev,
        firstName: prev.firstName || '',
        lastName: prev.lastName || '',
        headline: prev.headline || '',
        description: prev.description || '',
        avatar: prev.avatar || null,
        education: prev.education || [],
        socialLinks: {
          linkedIn: prev.socialLinks.linkedIn || '',
          orcid: prev.socialLinks.orcid || '',
          twitter: prev.socialLinks.twitter || '',
          googleScholar: prev.socialLinks.googleScholar || '',
        },
      }));
    }
  }, [user, isUserLoading]);

  const handleAvatarSave = async (imageDataUrl: string) => {
    setIsUploadingAvatar(true);
    try {
      // Immediately save the avatar using the new dedicated method
      if (user?.authorProfile?.id) {
        // Convert data URL to Blob and append
        const imageBlob = await dataUrlToBlob(imageDataUrl);

        await AuthorService.updateAuthorProfileImage(user.authorProfile.id, imageBlob);
      } else {
        console.error('User profile ID not available. Cannot save avatar.');
      }
      // Update local state only after successful API call
      setUserData((prev) => ({ ...prev, avatar: imageDataUrl }));
      setIsAvatarModalOpen(false);
      await refreshUser(); // Refresh user data to get updated avatar URL
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const saveProfileStep = async (): Promise<boolean> => {
    if (!user?.authorProfile?.id) {
      console.error('User information not available. Cannot save profile.');
      return false;
    }

    setIsSaving(true);
    const authorId = user.authorProfile.id;

    // Helper function to ensure URL has a protocol
    const ensureProtocol = (url: string | null | undefined): string | null => {
      if (!url || url.trim() === '') {
        return null; // Return null for empty or whitespace-only strings
      }
      // Check if the URL already starts with http:// or https:// (case-insensitive)
      if (!/^https?:\/\//i.test(url)) {
        // If not, prepend https://
        return 'https://' + url;
      }
      // If it already has a protocol, return it as is
      return url;
    };

    const params: AuthorUpdateParams = {
      first_name: userData.firstName || undefined,
      last_name: userData.lastName || undefined,
      headline: userData.headline || undefined,
      description: userData.description || undefined,
      education: userData.education.filter((ed) => ed.summary),
      // Apply the helper function to each social link
      linkedin: ensureProtocol(userData.socialLinks.linkedIn),
      twitter: ensureProtocol(userData.socialLinks.twitter),
      orcid_id: ensureProtocol(userData.socialLinks.orcid),
      google_scholar: ensureProtocol(userData.socialLinks.googleScholar),
    };

    try {
      await AuthorService.updateAuthorProfileData(authorId, params);
      await refreshUser();
      return true;
    } catch (error) {
      console.error('Error saving profile step:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 2) {
      const success = await saveProfileStep();
      if (!success) {
        toast.error('Failed to save profile information. Please try again.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinishOnboarding = async () => {
    setIsSaving(true);
    try {
      // Mark onboarding as complete in the database
      await UserService.setCompletedOnboarding();
      // Refresh user data to update the hasCompletedOnboarding flag
      await refreshUser();

      router.push('/');
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      toast.error('An error occurred while completing setup.');
      setIsSaving(false);
    }
  };

  // Education handling methods
  const handleAddEducation = () => {
    setActiveEducationIndex(userData.education.length);
    setUserData((prev) => ({
      ...prev,
      education: [...prev.education, {}],
    }));
    setIsEducationModalOpen(true);
  };

  const handleRemoveEducation = (index: number) => {
    setUserData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleEditEducation = (index: number) => {
    setActiveEducationIndex(index);
    setIsEducationModalOpen(true);
  };

  const handleSaveEducation = (educationEntry: EducationEntry) => {
    setUserData((prev) => {
      const newEducation = [...prev.education];
      newEducation[activeEducationIndex] = educationEntry;
      return { ...prev, education: newEducation };
    });
    setIsEducationModalOpen(false);
  };

  const setEducationAsMain = (index: number) => {
    setUserData((prev) => {
      const newEducation = prev.education.map((edu, i) => ({
        ...edu,
        is_public: i === index,
      }));
      return { ...prev, education: newEducation };
    });
  };

  const renderStepContent = () => {
    if (isUserLoading && currentStep === 2) {
      return <div>Loading user data...</div>;
    }
    if (userError) {
      return <div>Error loading user data. Please try refreshing.</div>;
    }

    switch (currentStep) {
      case 1: // Welcome
        return <OnboardingWelcomeStep />;
      case 2: // Profile Setup
        return (
          <OnboardingProfileStep
            userData={userData}
            setUserData={setUserData}
            openAvatarModal={() => setIsAvatarModalOpen(true)}
            handleAddEducation={handleAddEducation}
            handleEditEducation={handleEditEducation}
            handleRemoveEducation={handleRemoveEducation}
            setEducationAsMain={setEducationAsMain}
          />
        );
      case 3: // Verify Profile Info
        return <OnboardingVerifyProfileStep openVerifyModal={() => setIsVerifyModalOpen(true)} />;
      case 4: // Interest Selection (Moved from step 5)
        return <InterestSelector mode="preferences" />;
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100 flex flex-col items-center justify-center p-8 relative">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-indigo-500 to-indigo-700 flex items-center px-3">
          <span className="text-white text-sm font-semibold">ResearchHub Onboarding</span>
        </div>

        <div className="pt-12 mb-6">
          <div className="bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Step {currentStep} of {TOTAL_STEPS}
          </p>
        </div>

        <div className="mb-8 min-h-[400px]">{renderStepContent()}</div>

        <div className="flex justify-between items-center border-t pt-4 mt-6">
          <Button variant="ghost" onClick={prevStep} disabled={currentStep === 1 || isSaving}>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" /> Back
          </Button>
          {currentStep < TOTAL_STEPS ? (
            <Button
              onClick={nextStep}
              disabled={
                isSaving || (currentStep === 2 && isUserLoading) || (currentStep === 4 && isSaving)
              }
            >
              {isSaving && currentStep === 2 ? 'Saving...' : 'Next'}{' '}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinishOnboarding} disabled={isSaving}>
              {isSaving ? 'Finishing...' : 'Finish'}{' '}
              <FontAwesomeIcon icon={faCheck} className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <AvatarUpload
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          onSave={handleAvatarSave}
          initialImage={userData.avatar}
          isLoading={isUploadingAvatar}
        />

        <OnboardingEducationModal
          isOpen={isEducationModalOpen}
          onClose={() => setIsEducationModalOpen(false)}
          education={userData.education[activeEducationIndex] || {}}
          onSave={handleSaveEducation}
          setAsMain={() => setEducationAsMain(activeEducationIndex)}
        />

        <VerifyIdentityModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          initialStep="IDENTITY"
        />
      </div>
      <Link href="/" className="mt-4 text-md text-blue-800  hover:text-gray-800">
        Skip onboarding and go to homepage
      </Link>
    </div>
  );
}
