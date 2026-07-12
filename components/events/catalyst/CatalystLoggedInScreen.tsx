'use client';

import { CATALYST_NYC_EVENT } from './constants';
import { CatalystLockup } from './CatalystLockup';
import { CatalystLoggedInBody } from './CatalystLoggedInBody';
import { CatalystScreenShell } from './CatalystScreenShell';

const { footer } = CATALYST_NYC_EVENT;

interface CatalystLoggedInScreenProps {
  email: string;
}

export function CatalystLoggedInScreen({ email }: Readonly<CatalystLoggedInScreenProps>) {
  return (
    <CatalystScreenShell>
      <CatalystLockup />

      <div className="main">
        <CatalystLoggedInBody email={email} variant="mobile" />
      </div>

      <div className="foot">{footer}</div>

      <style jsx>{`
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .foot {
          text-align: center;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </CatalystScreenShell>
  );
}
