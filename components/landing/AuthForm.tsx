'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

interface AuthFormProps {
  className?: string;
}

export function AuthForm({ className = '' }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const handleEmailContinue = () => {
    executeAuthenticatedAction(() => {
      // Handle email authentication
      console.log('Email authentication clicked with:', email);
    });
  };

  const handleGoogleAuth = () => {
    executeAuthenticatedAction(() => {
      // Handle Google authentication
      console.log('Google authentication clicked');
    });
  };

  const handleLogin = () => {
    executeAuthenticatedAction(() => {
      // Handle login action
      console.log('Login clicked');
    });
  };

  return (
    <div
      className={`w-full max-w-lg mx-auto lg:mx-0 p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl shadow-lg ${className}`}
    >
      {/* Email Input with Inline Button */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-800 mb-2">Email address</label>
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-blue-500 outline-none transition-all duration-200 text-lg bg-white"
            placeholder="Enter your email"
          />
          <Button
            variant="default"
            size="lg"
            onClick={handleEmailContinue}
            className="w-full px-8 py-3.5 text-lg font-semibold rounded-xl"
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Login Link */}
      <p className="text-center text-gray-800 mb-6">
        Already have an account?{' '}
        <button onClick={handleLogin} className="text-blue-600 hover:text-blue-700 font-semibold">
          Log in
        </button>
      </p>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-400"></div>
        <span className="px-4 text-gray-600 font-semibold text-sm">OR</span>
        <div className="flex-1 border-t border-gray-400"></div>
      </div>

      {/* Google Button */}
      <Button
        variant="outlined"
        size="lg"
        onClick={handleGoogleAuth}
        className="w-full flex items-center justify-center space-x-3 text-lg py-4 font-medium border-2 hover:bg-gray-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Continue with Google</span>
      </Button>
    </div>
  );
}
