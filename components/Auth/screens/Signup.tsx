import { useRef, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { BaseScreenProps } from '../types';
import { Eye, EyeOff } from 'lucide-react';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { parseFullName } from '@/utils/nameUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/pro-light-svg-icons';
import { Button } from '@/components/ui/Button';
import { useReferral } from '@/contexts/ReferralContext';
import AnalyticsService from '@/services/analytics.service';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { TURNSTILE_SITEKEY } from '@/config/constants';

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
  modalView = false,
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
      <div className="flex items-center gap-2 mb-6">
        {modalView && (
          <Button type="button" onClick={onBack} variant="ghost" size="icon">
            <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
          </Button>
        )}

        <h2 className="text-xl font-semibold mr-6">Create your account</h2>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <form onSubmit={handleSignup}>
        <input
          type="text"
          name="name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name (e.g. John Smith)"
          className="w-full p-3 border rounded mb-4"
          ref={fullNameInputRef}
          data-testid="auth-signup-name-input"
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            name="new-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border rounded pr-12"
            data-testid="auth-signup-password-input"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[50%] -translate-y-[50%] text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {TURNSTILE_SITEKEY && (
          <div className="mb-4">
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

        <button
          type="submit"
          disabled={isLoading || (!!TURNSTILE_SITEKEY && !turnstileToken)}
          className="w-full bg-indigo-600 text-white p-3 rounded mb-4 hover:bg-indigo-700 disabled:opacity-50"
          data-testid="auth-signup-submit"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {!modalView && (
        <button onClick={onBack} className="w-full text-gray-600 hover:text-gray-800">
          ← Back
        </button>
      )}
    </div>
  );
}
