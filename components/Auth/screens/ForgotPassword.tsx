import { useState } from 'react';
import { BaseScreenProps } from '../types';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAutoFocus } from '@/hooks/useAutoFocus';
import { usePasswordReset } from '@/hooks/useAuth';
import { faChevronLeft } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props extends BaseScreenProps {
  onBack: () => void;
  modalView?: boolean;
}

export default function ForgotPassword({
  onClose,
  email,
  setEmail,
  error: authError,
  setError: setAuthError,
  onBack,
  modalView = false,
}: Props) {
  const [localEmail, setLocalEmail] = useState(email);
  const { resetPassword, isLoading, error, success, reset } = usePasswordReset();
  const emailInputRef = useAutoFocus<HTMLInputElement>(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localEmail) {
      setAuthError('Please enter your email address');
      return;
    }

    setAuthError(null);
    await resetPassword(localEmail);
  };

  const handleBack = () => {
    reset();
    setAuthError(null);
    onBack();
  };

  if (success) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          {modalView && (
            <Button type="button" onClick={handleBack} variant="ghost" size="icon">
              <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-xl font-semibold mr-6 !leading-10">Request submitted</h2>
        </div>

        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          <p className="mb-2">
            We've sent a password reset link to <strong>{localEmail}</strong>
          </p>
          <p className="text-sm">
            Click the link in the email to reset your password. If you don't see it, check your spam
            folder.
          </p>
        </div>

        <Button onClick={handleBack} className="w-full mb-4">
          Back to login
        </Button>

        <p className="text-center text-sm text-gray-600">
          Didn't receive the email?{' '}
          <Button
            type="button"
            variant="link"
            onClick={() => {
              reset();
              setAuthError(null);
            }}
          >
            Try again
          </Button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {modalView && (
          <Button type="button" onClick={handleBack} variant="ghost" size="icon">
            <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-xl font-semibold mr-6 !leading-10">Reset your password</h2>
      </div>

      {(error || authError) && (
        <Alert variant="error" className="mb-4">
          {error || authError}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            placeholder="Enter your email address"
            autoCapitalize="none"
            autoComplete="email"
            className="w-full p-3 border rounded"
            ref={emailInputRef}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full mb-4">
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      {!modalView && (
        <Button
          onClick={handleBack}
          disabled={isLoading}
          variant="ghost"
          className="w-full text-gray-600 hover:text-gray-800"
        >
          ← Back to login
        </Button>
      )}
    </div>
  );
}
