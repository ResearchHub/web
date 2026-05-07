import { useState } from 'react';
import { BaseScreenProps } from '../types';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { faChevronLeft } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/services/types/api';

interface Props extends BaseScreenProps {
  onBack: () => void;
  onForgotPassword: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
  modalView?: boolean;
}

export default function Login({
  onClose,
  onSuccess,
  email,
  isLoading,
  setIsLoading,
  error,
  setError,
  onBack,
  onForgotPassword,
  modalView = false,
}: Props) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [ephemeralToken, setEphemeralToken] = useState<string | null>(null);

  const passwordInputRef = useAutoFocus<HTMLInputElement>(!ephemeralToken);
  const mfaInputRef = useAutoFocus<HTMLInputElement>(!!ephemeralToken);
  const isMfaStep = !!ephemeralToken;

  const resetMfaStep = () => {
    setEphemeralToken(null);
    setMfaCode('');
    setError(null);
  };

  const completeSignIn = async (authToken: string) => {
    const result = await signIn('credentials', {
      authToken,
      redirect: false,
    });

    if (result?.error) {
      setError('Login failed');
      return false;
    }

    onSuccess?.();
    onClose();
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isMfaStep && !password) {
      setError('Please enter your password');
      return;
    }

    const trimmedCode = mfaCode.trim();
    if (isMfaStep && !trimmedCode) {
      setError('Please enter your authenticator or recovery code');
      return;
    }

    setIsLoading(true);
    setError(null);
    let shouldResetLoading = true;

    try {
      if (isMfaStep) {
        const verifyResponse = await AuthService.verifyMfa({
          ephemeral_token: ephemeralToken,
          code: trimmedCode,
        });

        if (!verifyResponse.key) {
          setError('Invalid authenticator or recovery code');
          return;
        }

        shouldResetLoading = !(await completeSignIn(verifyResponse.key));
        return;
      }

      const loginResponse = await AuthService.login({
        email,
        password,
      });

      if (loginResponse.mfa_required && loginResponse.ephemeral_token) {
        setEphemeralToken(loginResponse.ephemeral_token);
        setPassword('');
        setMfaCode('');
        return;
      }

      if (!loginResponse.key) {
        setError('Invalid email or password');
        return;
      }

      shouldResetLoading = !(await completeSignIn(loginResponse.key));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          isMfaStep
            ? err.message || 'Invalid authenticator or recovery code'
            : 'Invalid email or password'
        );
      } else {
        setError(isMfaStep ? 'Verification failed' : 'Login failed');
      }
    } finally {
      if (shouldResetLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleBackClick = () => {
    if (isMfaStep) {
      resetMfaStep();
      return;
    }

    onBack();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {modalView && (
          <Button type="button" onClick={handleBackClick} variant="ghost" size="icon">
            <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
          </Button>
        )}

        <h2 className="text-xl font-semibold mr-6 !leading-10">
          {isMfaStep ? 'Verify your sign-in' : 'Welcome back'}
        </h2>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          autoCapitalize="none"
          autoComplete="email"
          className="w-full p-3 border rounded mb-4 bg-gray-50"
          disabled
        />

        {isMfaStep ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit code from your authenticator app or one of your recovery codes.
            </p>
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="Authenticator or recovery code"
              className="w-full p-3 border rounded mb-4"
              ref={mfaInputRef}
              autoCapitalize="none"
              autoComplete="one-time-code"
            />
          </>
        ) : (
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border rounded pr-12"
              ref={passwordInputRef}
            />
            <Button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              variant="ghost"
              size="icon"
              className="absolute right-3 top-[50%] -translate-y-[50%] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full mb-4">
          {isLoading
            ? isMfaStep
              ? 'Verifying...'
              : 'Logging in...'
            : isMfaStep
              ? 'Verify code'
              : 'Log in'}
        </Button>
      </form>

      {isMfaStep ? (
        <div className="text-left mb-4">
          <Button
            type="button"
            variant="link"
            onClick={resetMfaStep}
            disabled={isLoading}
            className="text-rhBlue-500 hover:text-rhBlue-600 text-sm"
          >
            Back to password
          </Button>
        </div>
      ) : (
        <div className="text-left mb-4">
          <Button
            type="button"
            variant="link"
            onClick={onForgotPassword}
            disabled={isLoading}
            className="text-rhBlue-500 hover:text-rhBlue-600 text-sm"
          >
            Forgot your password?
          </Button>
        </div>
      )}

      {!modalView && (
        <Button
          onClick={handleBackClick}
          disabled={isLoading}
          variant="ghost"
          className="w-full text-gray-600 hover:text-gray-800"
        >
          ← Back
        </Button>
      )}
    </div>
  );
}
