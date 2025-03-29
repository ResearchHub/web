'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import {
  X,
  Check,
  AlertTriangle,
  BadgeCheck,
  Users,
  GraduationCap,
  TrendingUp,
  CircleDollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { VerificationWithPersonaStep } from './Verification/VerificationWithPersonaStep';
import { AddPublicationsForm, STEP } from './Verification/AddPublicationsForm';
import { ProgressStepper } from '@/components/ui/ProgressStepper';

interface VerifyIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type VerificationStep =
  | 'INTRO'
  | 'IDENTITY'
  | 'IDENTITY_VERIFIED_SUCCESSFULLY'
  | 'IDENTITY_CANNOT_BE_VERIFIED'
  | 'PUBLICATIONS'
  | 'SUCCESS';

const stepperSteps = [
  { id: 'IDENTITY', label: 'Verify Identity' },
  { id: 'PUBLICATIONS', label: 'Publication History' },
  { id: 'SUCCESS', label: 'View Rewards' },
];

export function VerifyIdentityModal({ isOpen, onClose }: VerifyIdentityModalProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('INTRO');
  const [publicationsSubstep, setPublicationsSubstep] = useState<STEP | 'SUCCESS'>('DOI');

  const { user } = useUser();
  const router = useRouter();

  // useEffect(() => {
  //   return () => {
  //     if (!isOpen) {
  //       setCurrentStep('INTRO');
  //     }
  //   };
  // }, [isOpen]);

  const handleNext = () => {
    if (currentStep === 'INTRO') {
      setCurrentStep('IDENTITY');
    } else if (currentStep === 'IDENTITY') {
      setCurrentStep('PUBLICATIONS');
    } else if (currentStep === 'PUBLICATIONS') {
      // Send verification request via WebSocket
      if (user?.id) {
        // Placeholder for WebSocket sendMessage
      }
    } else if (currentStep === 'SUCCESS') {
      onClose();
      router.push('/profile');
    }
  };

  const handleVerificationStatusChange = (status: 'success' | 'failed') => {
    if (status === 'success') {
      setCurrentStep('IDENTITY_VERIFIED_SUCCESSFULLY');
    } else {
      setCurrentStep('IDENTITY_CANNOT_BE_VERIFIED');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'INTRO':
        return (
          <div
            className="p-6 text-white rounded-t-2xl"
            style={{
              backgroundImage: "url('/small-banner-background.png')",
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
            }}
          >
            {/* Close button in the top-right corner */}
            <div className="absolute top-4 right-4">
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-indigo-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Badge icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-500 p-4 rounded-full">
                <BadgeCheck className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Title and subtitle */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">
                Verify identity to unlock new features
              </h3>
              <p className="mt-2 text-indigo-100">(Takes 1-3 minutes)</p>
            </div>

            {/* Two columns of features */}
            <div className="grid grid-cols-2 gap-8 mt-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500 p-1 rounded-full">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-xl font-semibold">All users</div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-white" />
                    <p className="text-white">Verified badge</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-white" />
                    <p className="text-white">Faster withdrawal limits</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500 p-1 rounded-full">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-xl font-semibold">Published authors</div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-white" />
                    <p className="text-white">Claim RSC rewards on papers</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-white" />
                    <p className="text-white">Get notified on bounty and grant opportunities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Start button */}
            <div className="mt-10">
              <Button
                onClick={handleNext}
                className="w-full justify-center py-3 bg-white text-indigo-700 hover:bg-indigo-50"
              >
                Start
              </Button>
            </div>
          </div>
        );

      case 'IDENTITY':
        return (
          <VerificationWithPersonaStep
            onVerificationStatusChange={handleVerificationStatusChange}
          />
        );

      case 'IDENTITY_VERIFIED_SUCCESSFULLY':
        return (
          <div className="space-y-6 text-center p-6 flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-5 rounded-full">
                  <BadgeCheck className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mt-6">
                Identity has been verified successfully
              </h3>
              <p className="mt-4 text-gray-600">
                A Verified badge will now appear next to your name throughout the platform.
              </p>
            </div>
            <div className="flex flex-col space-y-4 mt-6">
              <Button onClick={() => setCurrentStep('PUBLICATIONS')} className="w-full">
                Next: View rewards on my publications
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  onClose();
                  router.push('/profile');
                }}
                className="w-full"
              >
                View my profile
              </Button>
            </div>
          </div>
        );

      case 'IDENTITY_CANNOT_BE_VERIFIED':
        return (
          <div className="space-y-6 text-center p-6">
            <div className="flex justify-center">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Your identity cannot be verified at this time.
            </h3>
            <p className="text-gray-600">
              Please reach out to support at{' '}
              <a
                href="mailto:verification@researchhub.com"
                className="text-blue-600 hover:underline"
              >
                verification@researchhub.com
              </a>
            </p>
            <div className="flex justify-center">
              <Button onClick={onClose} className="w-[200px] mx-auto mt-5">
                Close
              </Button>
            </div>
          </div>
        );

      case 'PUBLICATIONS':
        return (
          <div className="p-6">
            {publicationsSubstep === 'DOI' && (
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-center text-gray-900">
                  Let's find rewards on your publications
                </h3>
                <p className="mt-4 text-gray-600 text-center text-lg">
                  Enter a DOI for any paper you've published and we will fetch the rest of your
                  works.
                </p>

                <div className="mt-8 mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  What happens next
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <span>We will build your researcher profile</span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <TrendingUp className="h-5 w-5 text-gray-500" />
                    </div>
                    <span>We will calculate your hub specific reputation</span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-700">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <CircleDollarSign className="h-5 w-5 text-gray-500" />
                    </div>
                    <span>
                      We will identify your prior publications that are eligible for rewards
                    </span>
                  </div>
                </div>
              </div>
            )}

            {publicationsSubstep === 'RESULTS' && (
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-center text-gray-900">
                  Review your publication history
                </h3>
                <p className="mt-4 text-gray-600 text-center text-lg">
                  We fetched some of your publications. We may have mislabeled a paper or two so
                  please select only the ones that you have authored or co-authored.
                </p>
              </div>
            )}

            <AddPublicationsForm
              onStepChange={({ step }) => {
                if (step === 'FINISHED') setCurrentStep('SUCCESS');
                else {
                  setPublicationsSubstep(step);
                }
              }}
              onDoThisLater={onClose}
              allowDoThisLater={true}
            />
          </div>
        );

      case 'SUCCESS':
        return (
          <div className="space-y-6 text-center p-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <BadgeCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Verification Successful!</h3>
            <p className="text-gray-600">
              Your identity has been verified. You can now claim your publications and earn
              ResearchCoin for your contributions.
            </p>
            <div className="flex justify-center">
              <Button onClick={handleNext}>View My Profile</Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="relative">
                  {/* Header with close button - only show for non-INTRO steps */}
                  {currentStep !== 'INTRO' && (
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                          Verify Identity
                        </Dialog.Title>
                      </div>
                      <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-gray-500"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  )}

                  {/* Progress stepper */}
                  {['PUBLICATIONS', 'SUCCESS'].includes(currentStep) && (
                    <div className="px-6 py-4 border-b border-gray-200">
                      <ProgressStepper steps={stepperSteps} currentStep={currentStep} />
                    </div>
                  )}

                  {/* Content */}
                  <div className="">{renderStepContent()}</div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
