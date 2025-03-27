'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { X, ArrowLeft, User, ChartLine, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { WebSocketStatus } from '@/services/websocket.service';
import { WS_ROUTES } from '@/services/websocket';
import { ProgressStepper, ProgressStepperStep } from '@/components/ui/ProgressStepper';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Alert } from '@/components/ui/Alert';
import { useUser } from '@/contexts/UserContext';
import { VerificationWithPersonaStep } from './Verification/VerificationWithPersonaStep';

// import dynamic from 'next/dynamic';

// const VerificationWithPersonaStep = dynamic(
//   () =>
//     import('./Verification/VerificationWithPersonaStep').then(
//       (mod) => mod.VerificationWithPersonaStep
//     ),
//   {
//     ssr: false,
//   }
// );

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
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>(
    'pending'
  );
  const { user } = useUser();
  const router = useRouter();

  // Connect to WebSocket for verification status updates
  const { messages, status, sendMessage } = useWebSocket({
    url: user?.id ? WS_ROUTES.NOTIFICATIONS(user.id) : '',
    authRequired: true,
    autoConnect: !!user?.id,
    global: true,
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];

      if (latestMessage.type === 'IDENTITY_VERIFICATION_UPDATED') {
        if (latestMessage.raw?.extra?.status === 'APPROVED') {
          setVerificationStatus('success');
          setCurrentStep('IDENTITY_VERIFIED_SUCCESSFULLY');
        } else {
          setVerificationStatus('failed');
          setCurrentStep('IDENTITY_CANNOT_BE_VERIFIED');
        }
      }
    }
  }, [messages]);

  const handleBack = () => {
    if (currentStep === 'IDENTITY') {
      setCurrentStep('INTRO');
    } else if (currentStep === 'PUBLICATIONS') {
      setCurrentStep('IDENTITY');
    }
  };

  const handleNext = () => {
    if (currentStep === 'INTRO') {
      setCurrentStep('IDENTITY');
    } else if (currentStep === 'IDENTITY') {
      setCurrentStep('PUBLICATIONS');
    } else if (currentStep === 'PUBLICATIONS') {
      // Send verification request via WebSocket
      if (user?.id) {
        sendMessage({
          type: 'verification_request',
          userId: user.id,
        });
      }
    } else if (currentStep === 'SUCCESS') {
      onClose();
      router.push('/profile');
    }
  };

  const handlePersonaComplete = () => {
    // Show success message first
    setCurrentStep('IDENTITY_VERIFIED_SUCCESSFULLY');
  };

  const handlePersonaError = (error: any) => {
    console.error('Persona verification error:', error);
    // You might want to show an error message or allow retry
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'INTRO':
        return (
          <div className="space-y-6 p-6">
            <div className="flex justify-center mb-4">
              <div className="bg-primary-100 p-4 rounded-full">
                <Check className="h-8 w-8 text-primary-600" />
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
                    <Check className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Verified badge</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Faster withdrawal limits</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-xl font-semibold">Published authors</div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-gray-800">Claim RSC rewards on papers</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-gray-800">
                        Get notified on bounty and grant opportunities
                      </p>
                    </div>
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
            onComplete={handlePersonaComplete}
            onError={handlePersonaError}
          />
        );

      case 'IDENTITY_VERIFIED_SUCCESSFULLY':
        return (
          <div className="space-y-6 text-center p-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Identity Verified Successfully</h3>
            <p className="text-gray-600">
              A Verified badge will now appear next to your name throughout the platform.
            </p>
            <div className="flex flex-col space-y-4 mt-6">
              <Button onClick={() => setCurrentStep('PUBLICATIONS')}>
                Next: View rewards on my publications
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  onClose();
                  router.push('/profile');
                }}
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
            <h3 className="text-xl font-semibold text-gray-900">Identity Verification Failed</h3>
            <p className="text-gray-600">
              We were unable to verify your identity. Please try again later.
            </p>
            <div className="flex justify-center">
              <Button onClick={() => setCurrentStep('INTRO')}>Try Again</Button>
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
            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>Continue</Button>
            </div>
          </div>
        );

      case 'SUCCESS':
        return (
          <div className="space-y-6 text-center p-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <Check className="h-8 w-8 text-green-600" />
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
                      {currentStep !== 'INTRO' &&
                        currentStep !== 'SUCCESS' &&
                        currentStep !== 'IDENTITY' && (
                          <Button
                            onClick={handleBack}
                            variant="ghost"
                            size="icon"
                            className="mr-2 text-gray-400 hover:text-gray-600"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                        )}
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
