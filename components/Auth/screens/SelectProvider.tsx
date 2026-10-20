import type { ReactNode } from 'react';
import { signIn } from 'next-auth/react';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/services/types/api';
import { isValidEmail } from '@/utils/validation';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { useReferral } from '@/contexts/ReferralContext';
import { Button } from '@/components/ui/Button';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import type { AuthAppearance, CatalystSurface } from '../types';
import { CATALYST_NYC_EVENT } from '@/components/events/catalyst/constants';

interface SelectProviderProps {
  onContinue: () => void;
  onSignup: () => void;
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  showHeader?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
  /** URL to redirect to after Google OAuth login */
  callbackUrl?: string;
  appearance?: AuthAppearance;
  catalystSurface?: CatalystSurface;
  entryTitle?: ReactNode;
  entryNote?: ReactNode;
  emailLabel?: string;
}

export default function SelectProvider({
  onContinue,
  onSignup,
  email,
  setEmail,
  isLoading,
  error,
  setError,
  showHeader = true,
  setIsLoading,
  callbackUrl,
  appearance = 'default',
  catalystSurface = 'dark',
  entryTitle,
  entryNote,
  emailLabel,
}: SelectProviderProps) {
  const emailInputRef = useAutoFocus<HTMLInputElement>(true);
  const { referralCode } = useReferral();
  const { auth } = CATALYST_NYC_EVENT;
  const isCatalystDark = appearance === 'catalyst' && catalystSurface === 'dark';
  const isCatalystLight = appearance === 'catalyst' && catalystSurface === 'light';
  const resolvedEmailLabel = emailLabel ?? auth.emailLabel;

  const handleCheckAccount = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValidEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setError(null);
    setIsLoading?.(true);

    try {
      const response = await AuthService.checkAccount(email);

      if (response.exists) {
        if (response.auth === 'google') {
          handleGoogleSignIn();
        } else if (response.is_verified) {
          onContinue();
        } else {
          setError('Please verify your email before logging in');
        }
      } else {
        onSignup();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'An error occurred');
    } finally {
      setIsLoading?.(false);
    }
  };

  const handleGoogleSignIn = async () => {
    AnalyticsService.logEvent(LogEvent.AUTH_VIA_GOOGLE_INITIATED).catch((analyticsError) => {
      console.error('Analytics failed:', analyticsError);
    });

    const searchParams = new URLSearchParams(window.location.search);
    const originalCallbackUrl = callbackUrl || searchParams.get('callbackUrl') || '/';

    let finalCallbackUrl = originalCallbackUrl;

    if (referralCode) {
      const referralUrl = new URL('/referral/join/apply-referral-code', window.location.origin);
      referralUrl.searchParams.set('refr', referralCode);
      referralUrl.searchParams.set('redirect', originalCallbackUrl);
      finalCallbackUrl = referralUrl.toString();
    }

    signIn('google', { callbackUrl: finalCallbackUrl });
  };

  if (isCatalystDark) {
    return (
      <div className="catalyst-entry">
        {entryTitle}

        {error && <p className="err">{error}</p>}

        <form onSubmit={handleCheckAccount}>
          <label className="label" htmlFor="catalyst-email">
            {resolvedEmailLabel}
          </label>
          <input
            ref={emailInputRef}
            className="field"
            id="catalyst-email"
            type="email"
            placeholder={auth.emailPlaceholder}
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? auth.loadingLabel : auth.continueLabel}
          </button>

          <div className="divider">
            <span />
            <em>OR</em>
            <span />
          </div>

          <button className="btn-google" type="button" onClick={handleGoogleSignIn}>
            <GoogleIcon />
            {auth.googleLabel}
          </button>
        </form>

        {entryNote}

        <style jsx>{`
          .label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.72);
            margin-bottom: 8px;
          }
          .field {
            width: 100%;
            height: 52px;
            background: rgba(255, 255, 255, 0.08);
            border: 1.5px solid rgba(255, 255, 255, 0.18);
            border-radius: 14px;
            padding: 0 16px;
            font-family: inherit;
            font-size: 15px;
            color: #fff;
            outline: none;
            transition:
              border-color 0.15s,
              background 0.15s;
          }
          .field::placeholder {
            color: rgba(255, 255, 255, 0.45);
          }
          .field:focus {
            border-color: rgba(255, 255, 255, 0.55);
            background: rgba(255, 255, 255, 0.12);
          }
          .field:focus-visible {
            outline: 2px solid rgba(255, 255, 255, 0.75);
            outline-offset: 2px;
          }
          .err {
            margin-bottom: 8px;
            font-size: 12.5px;
            color: #fca5a5;
          }
          .btn-primary {
            width: 100%;
            height: 56px;
            margin-top: 14px;
            border: none;
            border-radius: 14px;
            background: #3971ff;
            color: #fff;
            font-family: inherit;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 10px 26px -8px rgba(57, 113, 255, 0.7);
            transition: background 0.15s;
          }
          .btn-primary:hover {
            background: #2563eb;
          }
          .btn-primary:disabled {
            opacity: 0.75;
            cursor: default;
          }
          .btn-primary:focus-visible {
            outline: 2px solid #fff;
            outline-offset: 2px;
          }
          .divider {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 18px 0;
          }
          .divider span {
            flex: 1;
            height: 1px;
            background: rgba(255, 255, 255, 0.18);
          }
          .divider em {
            font-style: normal;
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.08em;
            color: rgba(255, 255, 255, 0.5);
          }
          .btn-google {
            width: 100%;
            height: 54px;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-family: inherit;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            -webkit-backdrop-filter: blur(6px);
            backdrop-filter: blur(6px);
            transition: background 0.15s;
          }
          .btn-google:hover {
            background: rgba(255, 255, 255, 0.16);
          }
          .btn-google:focus-visible {
            outline: 2px solid #fff;
            outline-offset: 2px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      {showHeader && appearance === 'default' && (
        <>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 !leading-10 mr-6">
            Welcome to ResearchHub{' '}
            <span role="img" aria-label="wave">
              👋
            </span>
          </h2>
          <p className="mt-2 mb-6 text-base text-gray-700">
            We are an open-science platform that enables discussions, peer-reviews, publications and
            more.
          </p>
        </>
      )}

      {isCatalystLight && entryTitle}

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <form onSubmit={handleCheckAccount}>
        {isCatalystLight && (
          <label
            className="block text-xs font-semibold text-gray-600 mb-2"
            htmlFor="catalyst-email-light"
          >
            {resolvedEmailLabel}
          </label>
        )}
        <input
          type="email"
          id={isCatalystLight ? 'catalyst-email-light' : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isCatalystLight ? auth.emailPlaceholder : 'Email'}
          autoCapitalize="none"
          autoComplete="email"
          className="w-full p-3 border rounded mb-4"
          ref={emailInputRef}
          data-testid="auth-email-input"
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          size="lg"
          data-testid="auth-email-continue"
        >
          {isLoading ? auth.loadingLabel : auth.continueLabel}
        </Button>

        <div className="relative my-8">
          <div className="absolute top-[2px] inset-x-0 bottom-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded hover:bg-gray-50"
        >
          <GoogleIcon />
          {auth.googleLabel}
        </button>
      </form>

      {isCatalystLight && entryNote}
    </div>
  );
}
