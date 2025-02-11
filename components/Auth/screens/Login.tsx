import { useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/services/types/api';
import { BaseScreenProps } from '../types';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface Props extends BaseScreenProps {
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
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
}: Props) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Welcome back</h2>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
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
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[50%] -translate-y-[50%] text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-3 rounded mb-4 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <button onClick={onBack} className="w-full text-gray-600 hover:text-gray-800">
        ← Back
      </button>
    </div>
  );
}
