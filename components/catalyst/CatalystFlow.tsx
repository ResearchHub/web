'use client';

import { useState } from 'react';
import { CatalystArrivalScreen } from './CatalystArrivalScreen';
import { CatalystAuthScreen } from './CatalystAuthScreen';

type Step = 'arrival' | 'auth';

/**
 * Catalyst NYC QR sign-up flow: the violet arrival screen (the offer) advances
 * to the white email-first auth screen when the attendee taps "Claim my $500".
 */
export function CatalystFlow() {
  const [step, setStep] = useState<Step>('arrival');

  if (step === 'auth') {
    return <CatalystAuthScreen />;
  }

  return <CatalystArrivalScreen onClaim={() => setStep('auth')} />;
}
