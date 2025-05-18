import { signIn } from 'next-auth/react';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/services/types/api';
import { isValidEmail } from '@/utils/validation';
import { useAutoFocus } from '@/hooks/useAutoFocus';
interface SelectProviderProps {
  onContinue: () => void;
  onSignup: () => void;
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  showHeader?: boolean;
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
}: SelectProviderProps) {
  const emailInputRef = useAutoFocus<HTMLInputElement>(true);

  const handleCheckAccount = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValidEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setError(null);

    try {
      const response = await AuthService.checkAccount(email);

      if (response.exists) {
        if (response.auth === 'google') {
          // Prompt user to use Google sign-in
          signIn('google');
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
      // setIsLoading is not defined in props, need to remove it
    }
  };

  const handleGoogleSignIn = () => {
    // Get the current URL's search params to extract callbackUrl
    const searchParams = new URLSearchParams(window.location.search);
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    signIn('google', { callbackUrl });
  };

  return (
    <div>
      {showHeader && (
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

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <form onSubmit={handleCheckAccount}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border rounded mb-4"
          ref={emailInputRef}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Continue'}
        </button>

        <div className="relative my-6">
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
          <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </form>
    </div>
  );
}
