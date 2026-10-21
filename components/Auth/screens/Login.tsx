import { useState } from 'react';
import { BaseScreenProps } from '../types';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/services/types/api';
import { AuthScreenHeader } from './AuthScreenHeader';

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
      <AuthScreenHeader
        title={isMfaStep ? 'Verify your sign-in' : 'Welcome back'}
        subtitle={
          isMfaStep
            ? 'Enter the 6-digit code from your authenticator app or one of your recovery codes.'
            : undefined
        }
        onBack={handleBackClick}
      />

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <form onSubmit={handleLogin}>
        <Input
          type="email"
          id="auth-login-email"
          label="Email"
          value={email}
          autoCapitalize="none"
          autoComplete="email"
          className="h-12 bg-gray-50 text-gray-600"
          wrapperClassName="mb-4"
          disabled
        />

        {isMfaStep ? (
          <Input
            type="text"
            id="auth-mfa-code"
            label="Code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            placeholder="Authenticator or recovery code"
            className="h-12"
            wrapperClassName="mb-5"
            ref={mfaInputRef}
            autoCapitalize="none"
            autoComplete="one-time-code"
          />
        ) : (
          <Input
            type={showPassword ? 'text' : 'password'}
            id="auth-login-password"
            label="Password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
            wrapperClassName="mb-5"
            ref={passwordInputRef}
            data-testid="auth-password-input"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="flex items-center px-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full"
          data-testid={isMfaStep ? 'auth-mfa-submit' : 'auth-login-submit'}
        >
          {isLoading
            ? isMfaStep
              ? 'Verifying...'
              : 'Logging in...'
            : isMfaStep
              ? 'Verify code'
              : 'Log in'}
        </Button>
      </form>

      <div className="mt-5">
        {isMfaStep ? (
          <Button
            type="button"
            variant="link"
            onClick={resetMfaStep}
            disabled={isLoading}
            className="text-sm"
          >
            Back to password
          </Button>
        ) : (
          <Button
            type="button"
            variant="link"
            onClick={onForgotPassword}
            disabled={isLoading}
            className="text-sm"
            data-testid="auth-forgot-password"
          >
            Forgot your password?
          </Button>
        )}
      </div>
    </div>
  );
}
