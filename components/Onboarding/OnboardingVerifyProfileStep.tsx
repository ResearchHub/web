'use client';

import React from 'react';
import { Verified, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface OnboardingVerifyProfileStepProps {
  openVerifyModal: () => void;
}

export function OnboardingVerifyProfileStep({ openVerifyModal }: OnboardingVerifyProfileStepProps) {
  return (
    <div className="flex flex-col items-center">
      <Verified className="h-10 w-10 text-blue-500 mb-3" />
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Verify Your Profile</h2>
      <p className="text-gray-600 mb-6 text-center">
        Verifying your profile unlocks additional benefits on ResearchHub.
      </p>
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-3 mb-6 w-full max-w-md">
        <h3 className="font-medium text-primary-800">Benefits of Verification:</h3>
        <div className="space-y-2 text-sm text-primary-700">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-primary-600 flex-shrink-0" />
            <span>Verified badge displayed on your profile</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-primary-600 flex-shrink-0" />
            <span>Faster withdrawal limits for earned rewards</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-primary-600 flex-shrink-0" />
            <span>Access to personalized earning opportunities</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 text-primary-600 flex-shrink-0" />
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
