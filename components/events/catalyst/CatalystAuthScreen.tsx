'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Login from '@/components/Auth/screens/Login';
import Signup from '@/components/Auth/screens/Signup';
import VerifyEmail from '@/components/Auth/screens/VerifyEmail';
import ForgotPassword from '@/components/Auth/screens/ForgotPassword';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/services/types/api';
import { isValidEmail } from '@/utils/validation';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { CATALYST_NYC_EVENT } from './constants';
import { CatalystLockup } from './CatalystLockup';
import { CatalystScreenShell } from './CatalystScreenShell';

type Screen = 'entry' | 'login' | 'signup' | 'verify' | 'forgot';
type DeeperScreen = Exclude<Screen, 'entry'>;

const { footer, auth } = CATALYST_NYC_EVENT;

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function InfoGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C8B6F2"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function CatalystAuthScreen() {
  const router = useRouter();
  const emailInputRef = useAutoFocus<HTMLInputElement>(true);
  const [screen, setScreen] = useState<Screen>('entry');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToFeed = () => router.push('/');

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await AuthService.checkAccount(email);
      if (res.exists) {
        if (res.auth === 'google') {
          signIn('google', { callbackUrl: '/' });
        } else if (res.is_verified) {
          setScreen('login');
        } else {
          setError('Please verify your email before logging in');
        }
      } else {
        setScreen('signup');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const goEntry = () => {
    setError(null);
    setScreen('entry');
  };

  const sharedProps = { email, setEmail, isLoading, error, setError, onClose: goToFeed };

  const renderDeeperScreen = (deeperScreen: DeeperScreen) => {
    switch (deeperScreen) {
      case 'login':
        return (
          <Login
            {...sharedProps}
            setIsLoading={setIsLoading}
            onBack={goEntry}
            onForgotPassword={() => {
              setError(null);
              setScreen('forgot');
            }}
            onSuccess={goToFeed}
            modalView
          />
        );
      case 'signup':
        return (
          <Signup
            {...sharedProps}
            setIsLoading={setIsLoading}
            onBack={goEntry}
            onVerify={() => setScreen('verify')}
            modalView
          />
        );
      case 'verify':
        return <VerifyEmail {...sharedProps} />;
      case 'forgot':
        return (
          <ForgotPassword
            {...sharedProps}
            onBack={() => {
              setError(null);
              setScreen('login');
            }}
            modalView
          />
        );
      default: {
        const _exhaustive: never = deeperScreen;
        return _exhaustive;
      }
    }
  };

  return (
    <CatalystScreenShell>
      <CatalystLockup variant="auth" />

      <div className="main">
        {screen === 'entry' ? (
          <>
            <h1 className="title">
              {auth.titleLines[0]}
              <br />
              {auth.titleLines[1]}
            </h1>

            <form onSubmit={handleContinue}>
              <label className="label" htmlFor="catalyst-email">
                {auth.emailLabel}
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
              {error && <p className="err">{error}</p>}
              <button className="btn-primary" type="submit" disabled={isLoading}>
                {isLoading ? auth.loadingLabel : auth.continueLabel}
              </button>
            </form>

            <div className="divider">
              <span />
              <em>OR</em>
              <span />
            </div>

            <button className="btn-google" type="button" onClick={handleGoogle}>
              <GoogleGlyph />
              {auth.googleLabel}
            </button>

            <p className="note">
              <InfoGlyph />
              <span>
                Use the <strong>{auth.noteHighlight}</strong>.
              </span>
            </p>
          </>
        ) : (
          <div className="catalyst-card">{renderDeeperScreen(screen)}</div>
        )}
      </div>

      <div className="foot">{footer}</div>

      <style jsx>{`
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .title {
          font-size: 38px;
          font-weight: 600;
          letter-spacing: -0.03em;
          text-align: left;
          line-height: 1.05;
          margin-bottom: 30px;
        }
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
          margin-top: 8px;
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
        .note {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 20px;
          text-align: center;
          color: rgba(255, 255, 255, 0.82);
          font-size: 13px;
        }
        .note strong {
          font-weight: 600;
          color: #fff;
        }
        .foot {
          text-align: center;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }
        .catalyst-card {
          width: 100%;
          background: #fff;
          color: #0c0720;
          border-radius: 16px;
          padding: 22px 20px;
          box-shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.6);
        }
      `}</style>
    </CatalystScreenShell>
  );
}
