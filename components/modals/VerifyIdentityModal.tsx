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

interface VerifyIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type VerificationStep = 'intro' | 'identity' | 'publications' | 'verification' | 'success';

export function VerifyIdentityModal({ isOpen, onClose }: VerifyIdentityModalProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('identity');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>(
    'pending'
  );
  const { user } = useUser();
  const router = useRouter();

  // Connect to WebSocket for verification status updates
  const { messages, status, sendMessage } = useWebSocket({
    url: user?.id ? WS_ROUTES.PAPER_SUBMISSION(user.id) : '',
    authRequired: true,
    autoConnect: !!user?.id,
    global: true,
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];

      if (latestMessage.type === 'verification_status') {
        if (latestMessage.status === 'success') {
          setVerificationStatus('success');
          setCurrentStep('success');
        } else if (latestMessage.status === 'failed') {
          setVerificationStatus('failed');
        }
      }
    }
  }, [messages]);

  const handleBack = () => {
    if (currentStep === 'identity') {
      setCurrentStep('intro');
    } else if (currentStep === 'publications') {
      setCurrentStep('identity');
    } else if (currentStep === 'verification') {
      setCurrentStep('publications');
    }
  };

  const handleNext = () => {
    if (currentStep === 'intro') {
      setCurrentStep('identity');
    } else if (currentStep === 'identity') {
      setCurrentStep('publications');
    } else if (currentStep === 'publications') {
      setCurrentStep('verification');
      // Send verification request via WebSocket
      if (user?.id) {
        sendMessage({
          type: 'verification_request',
          userId: user.id,
        });
      }
    } else if (currentStep === 'success') {
      onClose();
      router.push('/profile');
    }
  };

  const handlePersonaComplete = () => {
    // Move to the next step when Persona verification is complete
    setCurrentStep('publications');
  };

  const handlePersonaError = (error: any) => {
    console.error('Persona verification error:', error);
    // You might want to show an error message or allow retry
  };

  const handlePublicationsSubmit = (publications: any[]) => {
    // Handle publications submission
    setCurrentStep('verification');
    // Send verification request via WebSocket
    if (user?.id) {
      sendMessage({
        type: 'verification_request',
        userId: user.id,
        publications,
      });
    }
  };

  const steps: ProgressStepperStep[] = [
    { id: 'intro', label: 'Introduction', icon: <User className="h-5 w-5" /> },
    { id: 'identity', label: 'Identity', icon: <User className="h-5 w-5" /> },
    { id: 'publications', label: 'Publications', icon: <ChartLine className="h-5 w-5" /> },
    { id: 'verification', label: 'Verification', icon: <Check className="h-5 w-5" /> },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Verify Your Identity</h3>
            <p className="text-gray-600">
              Verifying your identity on ResearchHub helps establish trust and gives you access to
              additional features.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Establish Trust</h4>
                  <p className="text-sm text-gray-500">
                    Show the community you're a verified researcher
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <ChartLine className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Claim Your Publications</h4>
                  <p className="text-sm text-gray-500">
                    Link your published research to your profile
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <ResearchCoinIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Earn ResearchCoin</h4>
                  <p className="text-sm text-gray-500">
                    Get rewarded for your contributions to science
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext}>Get Started</Button>
            </div>
          </div>
        );

      case 'identity':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Verify Your Identity</h3>
            <p className="text-gray-600">
              We use Persona to securely verify your identity. This process takes just a few
              minutes.
            </p>

            <VerificationWithPersonaStep
              onComplete={handlePersonaComplete}
              onError={handlePersonaError}
            />

            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
            </div>
          </div>
        );

      case 'publications':
        return (
          <div className="space-y-6">
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

      case 'verification':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Verification in Progress</h3>
            <p className="text-gray-600">
              We're verifying your identity. This process may take a few moments.
            </p>

            <div className="flex justify-center py-8">
              {verificationStatus === 'pending' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                  <p className="text-gray-500">Verifying your publications...</p>
                </div>
              )}

              {verificationStatus === 'failed' && (
                <Alert variant="error">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Verification failed. Please try again or contact support.</span>
                  </div>
                </Alert>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={verificationStatus === 'pending'}
              >
                Back
              </Button>
              {verificationStatus === 'failed' && (
                <Button onClick={() => setCurrentStep('publications')}>Try Again</Button>
              )}
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 text-center">
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
                      {currentStep !== 'intro' && currentStep !== 'success' && (
                        <button
                          onClick={handleBack}
                          className="mr-2 text-gray-400 hover:text-gray-600"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                      )}
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                        Verify Identity
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Progress stepper */}
                  {currentStep !== 'success' && (
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
                  )}

                  {/* Content */}
                  <div className="p-6">{renderStepContent()}</div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
