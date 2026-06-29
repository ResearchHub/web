'use client';

import { CatalystArrivalBody } from './CatalystArrivalBody';
import { CatalystLockup } from './CatalystLockup';
import { CatalystScreenShell } from './CatalystScreenShell';

interface CatalystArrivalScreenProps {
  onClaim: () => void;
}

export function CatalystArrivalScreen({ onClaim }: CatalystArrivalScreenProps) {
  return (
    <CatalystScreenShell contentLayout="spread">
      <CatalystLockup />
      <CatalystArrivalBody onClaim={onClaim} />
    </CatalystScreenShell>
  );
}
