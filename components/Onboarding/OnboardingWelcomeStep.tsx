'use client';

import { Icon } from '@/components/ui/icons/Icon';

export function OnboardingWelcomeStep() {
  return (
    <div className="text-center">
      <Icon name="flaskFrame" size={48} className="mb-4 text-indigo-600 mx-auto" />
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome to ResearchHub!</h2>
      <p className="text-gray-600 mb-6">Let's get your profile set up.</p>
      <p className="text-sm text-gray-500">Click "Next" to begin.</p>
    </div>
  );
}
