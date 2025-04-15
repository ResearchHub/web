'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { Check, Verified } from 'lucide-react';
import { AvatarUpload } from '@/components/AvatarUpload';
import { InterestSelector } from '@/components/InterestSelector/InterestSelector';
import { AuthorService } from '@/services/author.service';
import type { AuthorUpdateParams } from '@/services/author.service';
import { toast } from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Confetti from 'react-confetti';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Icon } from '@/components/ui/icons/Icon';
import { VerifyIdentityModal } from '@/components/modals/VerifyIdentityModal';
import { UserService } from '@/services/user.service';

const TOTAL_STEPS = 4; // Welcome, Profile, Verify, Interests (Removed Features)

interface UserOnboardingData {
  firstName: string;
  lastName: string;
  headline: string;
  description: string;
  avatar: string | null;
  socialLinks: {
    linkedIn: string;
    orcid: string;
    twitter: string;
    googleScholar: string;
  };
}

export function OnboardingWizard() {
  const { user, isLoading: isUserLoading, error: userError, refreshUser } = useUser();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserOnboardingData>({
    firstName: '',
    lastName: '',
    headline: '',
    description: '',
    avatar: null,
    socialLinks: {
      linkedIn: '',
      orcid: '',
      twitter: '',
      googleScholar: '',
    },
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
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
    setUserData((prev) => ({ ...prev, avatar: imageDataUrl }));
    setIsAvatarModalOpen(false);
    await new Promise((resolve) => setTimeout(resolve, 100));
    setIsUploadingAvatar(false);
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
      // Apply the helper function to each social link
      linkedin: ensureProtocol(userData.socialLinks.linkedIn),
      twitter: ensureProtocol(userData.socialLinks.twitter),
      orcid_id: ensureProtocol(userData.socialLinks.orcid),
      google_scholar: ensureProtocol(userData.socialLinks.googleScholar),
      profileImageDataUrl: userData.avatar?.startsWith('data:image') ? userData.avatar : undefined,
    };

    try {
      await AuthorService.updateInfo(authorId, params);
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

      toast.success('Setup complete! Welcome to ResearchHub.');
      setShowConfetti(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      toast.error('An error occurred while completing setup.');
      setIsSaving(false);
    }
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
        return <WelcomeStep />;
      case 2: // Profile Setup
        return (
          <ProfileStep
            userData={userData}
            setUserData={setUserData}
            openAvatarModal={() => setIsAvatarModalOpen(true)}
          />
        );
      case 3: // Verify Profile Info
        return <VerifyProfileStep openVerifyModal={() => setIsVerifyModalOpen(true)} />;
      case 4: // Interest Selection (Moved from step 5)
        return <InterestSelector mode="onboarding" />;
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100 flex flex-col items-center justify-center p-8 relative">
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
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
      </div>
      <VerifyIdentityModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        initialStep="IDENTITY"
      />
      <Link href="/" className="mt-4 text-md text-blue-800  hover:text-gray-800">
        Skip onboarding and go to homepage
      </Link>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="text-center">
      <Icon name="flaskFrame" size={48} className="mb-4 text-indigo-600 mx-auto" />
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome to ResearchHub!</h2>
      <p className="text-gray-600 mb-6">Let's get your profile set up.</p>
      <p className="text-sm text-gray-500">Click "Next" to begin.</p>
    </div>
  );
}

interface ProfileStepProps {
  userData: UserOnboardingData;
  setUserData: React.Dispatch<React.SetStateAction<UserOnboardingData>>;
  openAvatarModal: () => void;
}

function ProfileStep({ userData, setUserData, openAvatarModal }: ProfileStepProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
  };

  const socialLinkMeta = {
    linkedIn: {
      icon: <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />,
      label: 'LinkedIn Profile URL',
    },
    orcid: {
      icon: <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5" />,
      label: 'ORCID URL',
    },
    twitter: {
      icon: <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />,
      label: 'X (Twitter) Profile URL',
    },
    googleScholar: {
      icon: <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5" />,
      label: 'Google Scholar Profile URL',
    },
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-gray-700">
        First, tell us a little about yourself
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="flex flex-col items-center space-y-3">
          <div
            className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 overflow-hidden"
            onClick={openAvatarModal}
            title="Click to upload avatar"
          >
            {userData.avatar ? (
              <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm">Upload Photo</span>
            )}
          </div>
          <Button variant="link" onClick={openAvatarModal} className="text-sm">
            {userData.avatar ? 'Change Photo' : 'Upload Photo'}
          </Button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
              Headline
            </label>
            <input
              type="text"
              id="headline"
              name="headline"
              value={userData.headline}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., PhD Student at Uni X, Software Engineer"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              About
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={userData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Tell us a bit about your research interests or background..."
            />
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-600 mb-3">Social Links (Optional)</h3>
            <div className="space-y-3">
              {(Object.keys(socialLinkMeta) as Array<keyof typeof socialLinkMeta>).map((key) => {
                const meta = socialLinkMeta[key];
                const value = userData.socialLinks[key];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <SocialIcon
                      icon={meta.icon}
                      label={meta.label}
                      href={null}
                      size="sm"
                      className="text-gray-500"
                    />
                    <input
                      type="url"
                      id={key}
                      name={key}
                      value={value}
                      onChange={handleSocialLinkChange}
                      className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={meta.label}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VerifyProfileStepProps {
  openVerifyModal: () => void;
}

function VerifyProfileStep({ openVerifyModal }: VerifyProfileStepProps) {
  return (
    <div className="flex flex-col items-center">
      <Verified className="h-10 w-10 text-blue-500 mb-3" />
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Verify Your Profile</h2>
      <p className="text-gray-600 mb-6 text-center">
        Verifying your profile unlocks additional benefits on ResearchHub.
      </p>
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3 mb-6 w-full max-w-md">
        <h3 className="font-medium text-indigo-800">Benefits of Verification:</h3>
        <div className="space-y-2 text-sm text-indigo-700">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-indigo-600 flex-shrink-0" />
            <span>Verified badge displayed on your profile</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-indigo-600 flex-shrink-0" />
            <span>Faster withdrawal limits for earned rewards</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-indigo-600 flex-shrink-0" />
            <span>Access to personalized earning opportunities</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-indigo-600 flex-shrink-0" />
            <span>Early access to new features</span>
          </div>
        </div>
      </div>
      <div className="text-center">
        <Button variant="secondary" onClick={openVerifyModal}>
          Verify Now (2-5 min)
        </Button>
      </div>
    </div>
  );
}
