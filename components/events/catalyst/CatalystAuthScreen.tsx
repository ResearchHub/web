'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthContent from '@/components/Auth/AuthContent';
import type { AuthScreen } from '@/components/Auth/types';
import { CatalystAuthEntryNote, CatalystAuthEntryTitle } from './CatalystAuthEntryChrome';
import { CATALYST_NYC_EVENT } from './constants';
import { CatalystLockup } from './CatalystLockup';
import { CatalystScreenShell } from './CatalystScreenShell';

const { footer, auth } = CATALYST_NYC_EVENT;

export function CatalystAuthScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<AuthScreen>('SELECT_PROVIDER');

  const goHome = () => router.push('/');

  return (
    <CatalystScreenShell>
      <CatalystLockup />

      <div className="main">
        <div className={screen !== 'SELECT_PROVIDER' ? 'catalyst-card' : 'catalyst-entry'}>
          <AuthContent
            showHeader={false}
            modalView
            callbackUrl="/"
            appearance="catalyst"
            catalystSurface="dark"
            onScreenChange={setScreen}
            onSuccess={goHome}
            onClose={goHome}
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
