'use client';

import { useState } from 'react';
import AuthContent from '@/components/Auth/AuthContent';
import type { AuthScreen } from '@/components/Auth/types';
import { CatalystAuthEntryNote, CatalystAuthEntryTitle } from './CatalystAuthEntryChrome';
import { CATALYST_NYC_EVENT } from './constants';
import { CatalystLockup } from './CatalystLockup';
import { CatalystScreenShell } from './CatalystScreenShell';

const { footer, auth, route } = CATALYST_NYC_EVENT;

interface CatalystAuthScreenProps {
  initialScreen?: AuthScreen;
  onClose?: () => void;
}

export function CatalystAuthScreen({
  initialScreen = 'SELECT_PROVIDER',
  onClose,
}: Readonly<CatalystAuthScreenProps>) {
  const [screen, setScreen] = useState<AuthScreen>(initialScreen);

  return (
    <CatalystScreenShell>
      <CatalystLockup />

      <div className="main">
        <div className={screen === 'SELECT_PROVIDER' ? 'catalyst-entry' : 'catalyst-card'}>
          <AuthContent
            showHeader={false}
            modalView
            initialScreen={initialScreen}
            callbackUrl={route}
            appearance="catalyst"
            catalystSurface="dark"
            onScreenChange={setScreen}
            onClose={onClose}
            emailLabel={auth.emailLabel}
            entryTitle={<CatalystAuthEntryTitle surface="dark" />}
            entryNote={<CatalystAuthEntryNote surface="dark" />}
          />
        </div>
      </div>

      <div className="foot">{footer}</div>

      <style jsx>{`
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .catalyst-entry {
          width: 100%;
        }
        .catalyst-card {
          width: 100%;
          background: #fff;
          color: #0c0720;
          border-radius: 16px;
          padding: 22px 20px;
          box-shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.6);
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
