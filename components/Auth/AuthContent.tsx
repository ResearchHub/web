import { useState, useEffect } from 'react';
import SelectProvider from './screens/SelectProvider';
import Login from './screens/Login';
import Signup from './screens/Signup';
import VerifyEmail from './screens/VerifyEmail';
import { AuthScreen } from './types';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';

interface AuthContentProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialError?: string | null;
  initialScreen?: AuthScreen;
  showHeader?: boolean;
  modalView?: boolean;
}

export default function AuthContent({
  onClose,
  onSuccess,
  initialError,
  initialScreen = 'SELECT_PROVIDER',
  showHeader = true,
  modalView = false,
}: AuthContentProps) {
  const [screen, setScreen] = useState<AuthScreen>(initialScreen);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

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
  };

  return (
    <div className="w-full">
      {screen === 'SELECT_PROVIDER' && (
        <SelectProvider
          {...sharedProps}
          onContinue={() => setScreen('LOGIN')}
          onSignup={() => setScreen('SIGNUP')}
        />
      )}
      {screen === 'LOGIN' && <Login {...sharedProps} onBack={() => setScreen('SELECT_PROVIDER')} />}
      {screen === 'SIGNUP' && (
        <Signup
          {...sharedProps}
          onBack={() => setScreen('SELECT_PROVIDER')}
          onVerify={() => setScreen('VERIFY_EMAIL')}
        />
      )}
      {screen === 'VERIFY_EMAIL' && <VerifyEmail {...sharedProps} />}
    </div>
  );
}
