import { useState, useEffect, type ReactNode } from 'react';
import SelectProvider from './screens/SelectProvider';
import Login from './screens/Login';
import Signup from './screens/Signup';
import VerifyEmail from './screens/VerifyEmail';
import ForgotPassword from './screens/ForgotPassword';
import { AuthScreen, type AuthAppearance, type CatalystSurface } from './types';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';

export type { AuthAppearance, CatalystSurface } from './types';

interface AuthContentProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialError?: string | null;
  initialScreen?: AuthScreen;
  showHeader?: boolean;
  modalView?: boolean;
  /** URL to redirect to after Google OAuth login */
  callbackUrl?: string;
  appearance?: AuthAppearance;
  catalystSurface?: CatalystSurface;
  onScreenChange?: (screen: AuthScreen) => void;
  entryTitle?: ReactNode;
  entryNote?: ReactNode;
  emailLabel?: string;
}

export default function AuthContent({
  onClose,
  onSuccess,
  initialError,
  initialScreen = 'SELECT_PROVIDER',
  showHeader = true,
  modalView = false,
  callbackUrl,
  appearance = 'default',
  catalystSurface = 'dark',
  onScreenChange,
  entryTitle,
  entryNote,
  emailLabel,
}: AuthContentProps) {
  const [screen, setScreen] = useState<AuthScreen>(initialScreen);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  useEffect(() => {
    onScreenChange?.(screen);
  }, [screen, onScreenChange]);

  useEffect(() => {
    if (screen === 'LOGIN') {
      AnalyticsService.logEvent(LogEvent.LOGIN_VIA_EMAIL_INITIATED);
    } else if (screen === 'SIGNUP') {
      AnalyticsService.logEvent(LogEvent.SIGNUP_VIA_EMAIL_INITIATED);
    }
  }, [screen]);

  const sharedProps = {
    onClose: onClose || (() => {}),
    onSuccess,
    email,
    setEmail,
    isLoading,
    setIsLoading,
    error,
    setError,
    showHeader,
    modalView,
    callbackUrl,
  };

  return (
    <div className="w-full">
      {screen === 'SELECT_PROVIDER' && (
        <SelectProvider
          {...sharedProps}
          onContinue={() => setScreen('LOGIN')}
          onSignup={() => setScreen('SIGNUP')}
          isLoading={isLoading}
          appearance={appearance}
          catalystSurface={catalystSurface}
          entryTitle={entryTitle}
          entryNote={entryNote}
          emailLabel={emailLabel}
        />
      )}
      {screen === 'LOGIN' && (
        <Login
          {...sharedProps}
          onBack={() => setScreen('SELECT_PROVIDER')}
          onForgotPassword={() => setScreen('FORGOT_PASSWORD')}
        />
      )}
      {screen === 'SIGNUP' && (
        <Signup
          {...sharedProps}
          onBack={() => setScreen('SELECT_PROVIDER')}
          onVerify={() => setScreen('VERIFY_EMAIL')}
        />
      )}
      {screen === 'VERIFY_EMAIL' && <VerifyEmail {...sharedProps} />}
      {screen === 'FORGOT_PASSWORD' && (
        <ForgotPassword {...sharedProps} onBack={() => setScreen('LOGIN')} />
      )}
    </div>
  );
}
