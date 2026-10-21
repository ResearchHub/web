import { useRef, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { BaseScreenProps } from '../types';
import { Eye, EyeOff } from 'lucide-react';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { parseFullName } from '@/utils/nameUtils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { useReferral } from '@/contexts/ReferralContext';
import AnalyticsService from '@/services/analytics.service';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { TURNSTILE_SITEKEY } from '@/config/constants';
import { AuthScreenHeader } from './AuthScreenHeader';

interface Props extends BaseScreenProps {
  onBack: () => void;
  onVerify: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  modalView?: boolean;
}

export default function Signup({
  onClose,
  email,
  isLoading,
  setIsLoading,
  error,
  setError,
  onBack,
  onVerify,
}: Props) {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const fullNameInputRef = useAutoFocus<HTMLInputElement>(true);
  const { referralCode, clearReferralCode } = useReferral();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!fullName) {
      setError('Please fill in all fields');
      return;
    }

    if (TURNSTILE_SITEKEY && !turnstileToken) {
      setTurnstileError('Please complete the verification.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { firstName, lastName } = parseFullName(fullName);
      const registrationData = {
        email,
        password1: password,
        password2: password,
        first_name: firstName,
        last_name: lastName,
        referral_code: referralCode || undefined,
        turnstile_token: turnstileToken || undefined,
      };

      await AuthService.register(registrationData);

      AnalyticsService.logSignedUp('credentials');

      onVerify();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <AuthScreenHeader
        title="Create your account"
        subtitle={
          <>
            Signing up as <span className="font-medium text-gray-900">{email}</span>
          </>
        }
        onBack={onBack}
      />

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <form onSubmit={handleSignup}>
        <Input
          type="text"
          id="auth-signup-name"
          label="Full name"
          name="name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Jane Smith"
          className="h-12"
          wrapperClassName="mb-4"
          ref={fullNameInputRef}
          data-testid="auth-signup-name-input"
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          id="auth-signup-password"
          label="Password"
          name="new-password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12"
          wrapperClassName="mb-5"
          data-testid="auth-signup-password-input"
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

        {TURNSTILE_SITEKEY && (
          <div className="mb-5">
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITEKEY}
              onSuccess={(token) => {
                setTurnstileToken(token);
                setTurnstileError(null);
              }}
              onExpire={() => setTurnstileToken(null)}
              onError={() => {
                setTurnstileToken(null);
                setTurnstileError('Verification failed. Please try again.');
              }}
            />
            {turnstileError && (
              <p role="alert" className="mt-2 text-sm text-red-700">
                {turnstileError}
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isLoading || (!!TURNSTILE_SITEKEY && !turnstileToken)}
          className="w-full"
          data-testid="auth-signup-submit"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </div>
  );
}
