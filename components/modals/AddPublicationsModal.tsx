'use client';

import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { BaseModal } from '@/components/ui/BaseModal';
import { AddPublicationsForm, STEP } from './Verification/AddPublicationsForm';

interface AddPublicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublicationsAdded?: () => void;
}

export function AddPublicationsModal({
  isOpen,
  onClose,
  onPublicationsAdded,
}: AddPublicationsModalProps) {
  const [currentStep, setCurrentStep] = useState<STEP>('DOI');

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('DOI');
    }
  }, [isOpen]);

  const handleStepChange = ({ step }: { step: STEP }) => {
    console.log('handleStepChange', step);
    setCurrentStep(step);

    if (step === 'FINISHED') {
      onPublicationsAdded?.();
      onClose();
    }
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case 'DOI':
        return 'Add Publications to Your Profile';
      case 'NEEDS_AUTHOR_CONFIRMATION':
        return 'Confirm Author Identity';
      case 'RESULTS':
        return 'Select Publications';
      case 'LOADING':
        return 'Adding Publications';
      case 'ERROR':
        return 'Error';
      default:
        return 'Add Publications';
    }
  };

  const getModalDescription = () => {
    switch (currentStep) {
      case 'DOI':
        return "Enter a DOI for any paper you've published and we will fetch your other works.";
      case 'NEEDS_AUTHOR_CONFIRMATION':
        return 'We found multiple authors for this publication. Please select which one is you.';
      case 'RESULTS':
        return 'Review and select the publications you want to add to your profile.';
      case 'LOADING':
        return 'We are processing your publications. This may take a few minutes.';
      case 'ERROR':
        return 'Something went wrong while adding your publications.';
      default:
        return '';
    }
  };

  const headerAction = (
    <div className="bg-indigo-100 p-2 rounded-lg">
      <BookOpen className="h-5 w-5 text-indigo-600" />
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      maxWidth="max-w-2xl"
      headerAction={headerAction}
      padding="p-6"
    >
      {getModalDescription() && (
        <p className="text-sm text-gray-600 mb-6">{getModalDescription()}</p>
      )}

      <AddPublicationsForm
        onStepChange={handleStepChange}
        onDoThisLater={onClose}
        allowDoThisLater={false}
      />
    </BaseModal>
  );
}
