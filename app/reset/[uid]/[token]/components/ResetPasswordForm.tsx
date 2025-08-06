'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { usePasswordResetConfirm } from '@/hooks/useAuth';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { Eye, EyeOff } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/pro-light-svg-icons';

type ResetStatus = 'FORM' | 'SUCCESS';

interface Props {
  uid: string;
  token: string;
}

export default function ResetPasswordForm({ uid, token }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<ResetStatus>('FORM');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(5);
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    password1?: string;
    password2?: string;
  }>({});

  const { confirmPasswordReset, isLoading, error, success } = usePasswordResetConfirm();
  const password1InputRef = useAutoFocus<HTMLInputElement>(true);

  const validateForm = () => {
    const errors: { password1?: string; password2?: string } = {};

    if (!newPassword1) {
      errors.password1 = 'Please enter a new password';
    }

    if (!newPassword2) {
      errors.password2 = 'Please confirm your new password';
    } else if (newPassword1 !== newPassword2) {
      errors.password2 = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await confirmPasswordReset({
      uid,
      token,
      newPassword1,
      newPassword2,
    });
  };

  useEffect(() => {
    if (success) {
      setStatus('SUCCESS');
    } else if (error) {
      setErrorMessage(error);
    }
  }, [success, error]);

  useEffect(() => {
    if (status === 'SUCCESS' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (status === 'SUCCESS' && countdown === 0) {
      router.replace('/');
    }
  }, [status, countdown, router]);

  if (status === 'SUCCESS') {
    return (
      <PageLayout rightSidebar={null}>
        <div className="w-full flex justify-center items-center min-h-[60vh]">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl border border-gray-100">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-4xl mb-4" />
            <h1 className="text-xl font-semibold mb-2">Password Reset Successful!</h1>
            <p className="text-gray-500 mb-6">
              Your password has been successfully reset. Redirecting to home page in{' '}
              <span className="font-semibold text-blue-600">{countdown}</span> seconds...
            </p>
            <Button className="w-full h-12" onClick={() => router.replace('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout rightSidebar={null}>
      <div className="w-full flex justify-center items-center min-h-[60vh]">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
          <h1 className="text-xl font-semibold mb-6 text-center">Reset Your Password</h1>

          {errorMessage && (
            <Alert variant="error" className="mb-6">
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password1" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password1"
                  type={showPassword1 ? 'text' : 'password'}
                  value={newPassword1}
                  onChange={(e) => setNewPassword1(e.target.value)}
                  placeholder="Enter your new password"
                  className={`w-full p-3 border rounded pr-12 ${
                    validationErrors.password1 ? 'border-red-500' : ''
                  }`}
                  ref={password1InputRef}
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword1(!showPassword1)}
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-[50%] -translate-y-[50%] text-gray-500 hover:text-gray-700"
                >
                  {showPassword1 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              {validationErrors.password1 && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password1}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="password2"
                  type={showPassword2 ? 'text' : 'password'}
                  value={newPassword2}
                  onChange={(e) => setNewPassword2(e.target.value)}
                  placeholder="Confirm your new password"
                  className={`w-full p-3 border rounded pr-12 ${
                    validationErrors.password2 ? 'border-red-500' : ''
                  }`}
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-[50%] -translate-y-[50%] text-gray-500 hover:text-gray-700"
                >
                  {showPassword2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              {validationErrors.password2 && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password2}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 mb-4">
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => router.replace('/auth/signin')}
              className="text-sm"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
