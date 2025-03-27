'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { X, Check, AlertTriangle, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { VerificationWithPersonaStep } from './Verification/VerificationWithPersonaStep';

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

export function VerifyIdentityModal({ isOpen, onClose }: VerifyIdentityModalProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('INTRO');

  const { user } = useUser();
  const router = useRouter();

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
          <div className="space-y-6 p-6">
            <div className="flex justify-center mb-4">
              <div className="bg-primary-100 p-4 rounded-full">
                <BadgeCheck className="h-8 w-8 text-primary-600" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">
                Verify identity to unlock new features
              </h3>
              <p className="mt-2 text-gray-600">(Takes 1-3 minutes)</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="space-y-6">
                <div className="text-xl font-semibold">All users</div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 flex-shrink-0 text-primary-600" />
                    <p className="text-gray-800">Verified badge</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 flex-shrink-0 text-primary-600" />
                    <p className="text-gray-800">Faster withdrawal limits</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-xl font-semibold">Published authors</div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 flex-shrink-0 text-primary-600" />
                    <p className="text-gray-800">Claim RSC rewards on papers</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 flex-shrink-0 text-primary-600" />
                    <p className="text-gray-800">Get notified on bounty and grant opportunities</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <Button onClick={handleNext} className="w-full justify-center py-3">
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
          <div className="space-y-6 p-6">
            <h3 className="text-xl font-semibold text-gray-900">Add Your Publications</h3>
            <p className="text-gray-600">
              Link your published research to verify your identity as a researcher.
            </p>
            <h2>AddPublicationsForm</h2>
            <div className="flex justify-end">
              <Button onClick={handleNext}>Continue</Button>
            </div>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="relative">
                  {/* Header with close button */}
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

                  {/* Progress stepper */}
                  {/* {currentStep !== 'success' && (
                    <div className="px-6 py-4 border-b border-gray-200">
                      <ProgressStepper
                        steps={steps}
                        currentStep={currentStep}
                        onStepClick={(step) => {
                          if (
                            step === 'intro' ||
                            (step === 'identity' && currentStep === 'publications') ||
                            (step === 'publications' && currentStep === 'verification')
                          ) {
                            setCurrentStep(step as VerificationStep);
                          }
                        }}
                      />
                    </div>
                  )} */}

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
