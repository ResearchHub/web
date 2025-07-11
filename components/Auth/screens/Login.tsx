import { useState } from 'react';
import { BaseScreenProps } from '../types';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { faChevronLeft } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props extends BaseScreenProps {
  onBack: () => void;
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
  modalView = false,
}: Props) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const passwordInputRef = useAutoFocus<HTMLInputElement>(true);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // This endpoint will return a CredentialsSignin error with no description.
      // Currently we try to login with email and password + fetch the user's data separately,
      // because the current endpoint only returns a token
      // So, we show "Invalid email or password" error
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        setIsRedirecting(true); // Set redirecting state before navigation
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      if (!isRedirecting) {
        // Only reset loading if we're not redirecting
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {modalView && (
          <Button type="button" onClick={onBack} variant="ghost" size="icon">
            <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
          </Button>
        )}

        <h2 className="text-xl font-semibold mr-6 !leading-10">Welcome back</h2>
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

        <Button type="submit" disabled={isLoading || isRedirecting} className="w-full mb-4">
          {isLoading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      {!modalView && (
        <Button
          onClick={onBack}
          disabled={isLoading || isRedirecting}
          variant="ghost"
          className="w-full text-gray-600 hover:text-gray-800"
        >
          ← Back
        </Button>
      )}
    </div>
  );
}
